import random
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from ..database import get_db
from ..models import Complaint, User, Upvote, ActivityLog
from ..schemas import (
    ComplaintCreate,
    ComplaintOut,
    ComplaintUpdateStatus,
    ComplaintMerge,
    PredictCategoryRequest,
    PredictCategoryResponse,
    CheckDuplicateRequest,
    CheckDuplicateResponse
)
from ..auth import get_current_user, get_current_user_optional, require_official
from ..ml_service import ml_service, CATEGORY_DEPARTMENT_MAP

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def generate_tracking_number() -> str:
    rnd = random.randint(10000, 99999)
    return f"CP-2026-{rnd}"

@router.post("/predict", response_model=PredictCategoryResponse)
def predict_category_endpoint(req: PredictCategoryRequest):
    """Real-time ML category prediction and explainable priority suggestion."""
    result = ml_service.predict_category(req.title, req.description)
    return result

@router.post("/check-duplicates", response_model=CheckDuplicateResponse)
def check_duplicates_endpoint(req: CheckDuplicateRequest, db: Session = Depends(get_db)):
    """Finds potential duplicate complaints using TF-IDF + Cosine similarity."""
    active_complaints = db.query(Complaint).filter(
        Complaint.status.notin_(["RESOLVED", "REJECTED"]),
        Complaint.is_duplicate == False
    ).all()

    existing_dicts = [
        {
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title": c.title,
            "description": c.description,
            "predicted_category": c.predicted_category,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "address": c.address,
            "created_at": c.created_at.strftime("%b %d, %Y") if c.created_at else ""
        }
        for c in active_complaints
    ]

    matches = ml_service.find_duplicates(
        new_title=req.title,
        new_description=req.description,
        existing_complaints=existing_dicts,
        new_lat=req.latitude,
        new_lon=req.longitude,
        threshold=0.35
    )

    highest_sim = matches[0]["similarity_score"] if matches else 0.0

    return {
        "has_duplicates": len(matches) > 0,
        "highest_similarity": highest_sim,
        "candidates": matches[:5]
    }

@router.get("", response_model=List[ComplaintOut])
def list_complaints(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    citizen_only: Optional[bool] = False,
    sort_by: Optional[str] = "priority",  # "priority", "newest", "upvotes"
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Complaint)

    if citizen_only:
        if not current_user:
            raise HTTPException(status_code=401, detail="Must be logged in to view your reports")
        query = query.filter(Complaint.citizen_id == current_user.id)

    if category and category != "All":
        query = query.filter(
            or_(
                Complaint.predicted_category == category,
                Complaint.manual_category == category
            )
        )

    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)

    if priority and priority != "All":
        query = query.filter(Complaint.priority_level == priority)

    if ward and ward != "All":
        query = query.filter(Complaint.ward == ward)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.title.ilike(search_fmt),
                Complaint.description.ilike(search_fmt),
                Complaint.address.ilike(search_fmt),
                Complaint.tracking_number.ilike(search_fmt)
            )
        )

    # Sorting
    if sort_by == "priority":
        query = query.order_by(desc(Complaint.priority_score), desc(Complaint.created_at))
    elif sort_by == "newest":
        query = query.order_by(desc(Complaint.created_at))
    elif sort_by == "upvotes":
        query = query.order_by(desc(Complaint.upvote_count), desc(Complaint.created_at))
    else:
        query = query.order_by(desc(Complaint.created_at))

    complaints = query.offset(offset).limit(limit).all()
    return complaints

@router.post("", response_model=ComplaintOut)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Run ML Prediction for Category & Confidence
    pred_res = ml_service.predict_category(complaint_in.title, complaint_in.description)
    predicted_cat = pred_res["predicted_category"]
    confidence = pred_res["confidence"]
    effective_category = complaint_in.manual_category or predicted_cat
    department = CATEGORY_DEPARTMENT_MAP.get(effective_category, "General Municipal Administration")

    # 2. Check for Duplicate Reports
    active_complaints = db.query(Complaint).filter(
        Complaint.status.notin_(["RESOLVED", "REJECTED"]),
        Complaint.is_duplicate == False
    ).all()
    existing_dicts = [
        {
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title": c.title,
            "description": c.description,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "address": c.address,
            "status": c.status,
            "created_at": c.created_at.strftime("%b %d, %Y") if c.created_at else ""
        }
        for c in active_complaints
    ]
    duplicates = ml_service.find_duplicates(
        new_title=complaint_in.title,
        new_description=complaint_in.description,
        existing_complaints=existing_dicts,
        new_lat=complaint_in.latitude,
        new_lon=complaint_in.longitude,
        threshold=0.38
    )

    duplicate_candidates = duplicates[:4]
    is_suspected_duplicate = len(duplicates) > 0 and duplicates[0]["similarity_score"] >= 0.70

    # 3. Compute Transparent Priority Score
    priority_res = ml_service.calculate_priority(
        title=complaint_in.title,
        description=complaint_in.description,
        category=effective_category,
        duplicate_count=len(duplicates) + 1,
        days_pending=0,
        upvotes=1
    )

    tracking_num = generate_tracking_number()

    new_complaint = Complaint(
        tracking_number=tracking_num,
        title=complaint_in.title.strip(),
        description=complaint_in.description.strip(),
        predicted_category=predicted_cat,
        category_confidence=confidence,
        manual_category=complaint_in.manual_category,
        department=department,
        status="SUBMITTED",
        priority_score=priority_res["priority_score"],
        priority_level=priority_res["priority_level"],
        priority_breakdown=priority_res["breakdown"],
        latitude=complaint_in.latitude,
        longitude=complaint_in.longitude,
        address=complaint_in.address.strip(),
        ward=complaint_in.ward or "Central Zone",
        citizen_id=current_user.id,
        citizen_name=current_user.full_name,
        is_duplicate=is_suspected_duplicate,
        duplicate_candidates=duplicate_candidates,
        upvote_count=1,
        image_url=complaint_in.image_url
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    # Initial user upvote
    initial_upvote = Upvote(user_id=current_user.id, complaint_id=new_complaint.id)
    db.add(initial_upvote)

    # Create Activity Log
    act = ActivityLog(
        complaint_id=new_complaint.id,
        action="CREATED",
        performed_by_name=current_user.full_name,
        performed_by_role=current_user.role,
        note=f"Report submitted via CivicPulse portal. AI classified under '{effective_category}' with priority {priority_res['priority_level']} ({priority_res['priority_score']} pts)."
    )
    db.add(act)
    db.commit()
    db.refresh(new_complaint)

    return new_complaint

@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint_detail(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp

@router.post("/{complaint_id}/upvote")
def upvote_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    existing_upvote = db.query(Upvote).filter(
        Upvote.user_id == current_user.id,
        Upvote.complaint_id == complaint_id
    ).first()

    if existing_upvote:
        # Remove upvote (toggle)
        db.delete(existing_upvote)
        comp.upvote_count = max(1, comp.upvote_count - 1)
        action_msg = "Removed endorsement"
    else:
        new_upvote = Upvote(user_id=current_user.id, complaint_id=complaint_id)
        db.add(new_upvote)
        comp.upvote_count += 1
        action_msg = "Added citizen endorsement"

    # Recalculate dynamic priority with new upvotes & age
    age_days = (datetime.utcnow() - comp.created_at).total_seconds() / 86400.0
    p_info = ml_service.calculate_priority(
        title=comp.title,
        description=comp.description,
        category=comp.manual_category or comp.predicted_category,
        duplicate_count=len(comp.duplicate_candidates or []) + 1,
        days_pending=age_days,
        upvotes=comp.upvote_count
    )
    comp.priority_score = p_info["priority_score"]
    comp.priority_level = p_info["priority_level"]
    comp.priority_breakdown = p_info["breakdown"]

    db.commit()
    db.refresh(comp)

    return {
        "success": True,
        "message": action_msg,
        "upvote_count": comp.upvote_count,
        "new_priority_score": comp.priority_score,
        "new_priority_level": comp.priority_level
    }

@router.post("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: int,
    update_data: ComplaintUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_official)
):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = comp.status
    comp.status = update_data.status
    if update_data.official_remarks:
        comp.official_remarks = update_data.official_remarks
    if update_data.assigned_officer:
        comp.assigned_officer = update_data.assigned_officer
    if update_data.estimated_resolution_time:
        comp.estimated_resolution_time = update_data.estimated_resolution_time

    if update_data.status == "RESOLVED" and not comp.resolved_at:
        comp.resolved_at = datetime.utcnow()

    # Log action
    log = ActivityLog(
        complaint_id=comp.id,
        action="STATUS_UPDATED",
        performed_by_name=current_user.full_name,
        performed_by_role=current_user.role,
        note=f"Status transitioned from {old_status} to {update_data.status}. Remarks: {update_data.official_remarks or 'None'}."
    )
    db.add(log)
    db.commit()
    db.refresh(comp)
    return comp

@router.post("/{complaint_id}/merge")
def merge_duplicate_complaint(
    complaint_id: int,
    merge_data: ComplaintMerge,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_official)
):
    secondary = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    primary = db.query(Complaint).filter(Complaint.id == merge_data.primary_complaint_id).first()

    if not secondary or not primary:
        raise HTTPException(status_code=404, detail="One or both complaints not found")

    secondary.is_duplicate = True
    secondary.parent_complaint_id = primary.id
    secondary.status = "RESOLVED"
    secondary.official_remarks = f"Merged into primary report #{primary.tracking_number} as duplicate."

    # Boost primary upvote count and recalculate priority
    primary.upvote_count += max(1, secondary.upvote_count)
    age_days = (datetime.utcnow() - primary.created_at).total_seconds() / 86400.0
    p_info = ml_service.calculate_priority(
        title=primary.title,
        description=primary.description,
        category=primary.manual_category or primary.predicted_category,
        duplicate_count=len(primary.duplicate_candidates or []) + 2,
        days_pending=age_days,
        upvotes=primary.upvote_count
    )
    primary.priority_score = p_info["priority_score"]
    primary.priority_level = p_info["priority_level"]
    primary.priority_breakdown = p_info["breakdown"]

    log = ActivityLog(
        complaint_id=primary.id,
        action="MERGED_DUPLICATE",
        performed_by_name=current_user.full_name,
        performed_by_role=current_user.role,
        note=f"Merged duplicate report #{secondary.tracking_number}. Civic priority elevated to {primary.priority_score}."
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Successfully merged into {primary.tracking_number}"}
