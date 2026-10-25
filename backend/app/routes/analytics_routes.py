from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint
from ..schemas import AnalyticsOverview

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    total = len(complaints)

    pending = sum(1 for c in complaints if c.status in ["SUBMITTED", "UNDER_REVIEW"])
    in_progress = sum(1 for c in complaints if c.status in ["ASSIGNED", "IN_PROGRESS"])
    resolved = sum(1 for c in complaints if c.status == "RESOLVED")
    critical = sum(1 for c in complaints if c.priority_level == "CRITICAL")
    duplicates = sum(1 for c in complaints if c.is_duplicate)

    # Resolution hours calculation
    resolved_items = [c for c in complaints if c.status == "RESOLVED" and c.resolved_at and c.created_at]
    if resolved_items:
        total_hours = sum((c.resolved_at - c.created_at).total_seconds() / 3600.0 for c in resolved_items)
        avg_res_hours = round(total_hours / len(resolved_items), 1)
    else:
        avg_res_hours = 24.5  # default benchmark

    # Category counts
    category_counts: Dict[str, int] = {}
    for c in complaints:
        cat = c.manual_category or c.predicted_category
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Priority counts
    priority_counts: Dict[str, int] = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for c in complaints:
        priority_counts[c.priority_level] = priority_counts.get(c.priority_level, 0) + 1

    # Status counts
    status_counts: Dict[str, int] = {
        "SUBMITTED": 0,
        "UNDER_REVIEW": 0,
        "ASSIGNED": 0,
        "IN_PROGRESS": 0,
        "RESOLVED": 0,
        "REJECTED": 0
    }
    for c in complaints:
        status_counts[c.status] = status_counts.get(c.status, 0) + 1

    # Ward counts
    ward_counts: Dict[str, int] = {}
    for c in complaints:
        w = c.ward or "Central Zone"
        ward_counts[w] = ward_counts.get(w, 0) + 1

    # Weekly / Recent 7-day Trend
    days_map = {}
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).strftime("%a, %b %d")
        days_map[day_date] = {"date": day_date, "reported": 0, "resolved": 0, "critical": 0}

    for c in complaints:
        if c.created_at:
            day_str = c.created_at.strftime("%a, %b %d")
            if day_str in days_map:
                days_map[day_str]["reported"] += 1
                if c.priority_level == "CRITICAL":
                    days_map[day_str]["critical"] += 1
        if c.resolved_at:
            res_str = c.resolved_at.strftime("%a, %b %d")
            if res_str in days_map:
                days_map[res_str]["resolved"] += 1

    recent_trend = list(days_map.values())

    return {
        "total_complaints": total,
        "pending_complaints": pending,
        "in_progress_complaints": in_progress,
        "resolved_complaints": resolved,
        "critical_complaints": critical,
        "duplicates_flagged": duplicates,
        "average_resolution_hours": avg_res_hours,
        "category_counts": category_counts,
        "priority_counts": priority_counts,
        "status_counts": status_counts,
        "ward_counts": ward_counts,
        "recent_trend": recent_trend
    }

@router.get("/hotspots")
def get_hotspots(db: Session = Depends(get_db)):
    """Returns geographical complaint nodes with priority weights for heatmap visualization."""
    complaints = db.query(Complaint).filter(Complaint.status != "RESOLVED").all()
    
    hotspots = []
    for c in complaints:
        hotspots.append({
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title": c.title,
            "category": c.manual_category or c.predicted_category,
            "priority_score": c.priority_score,
            "priority_level": c.priority_level,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "address": c.address,
            "ward": c.ward,
            "upvote_count": c.upvote_count,
            "is_duplicate": c.is_duplicate,
            "created_at": c.created_at.strftime("%b %d, %Y") if c.created_at else ""
        })

    return {
        "total_active_nodes": len(hotspots),
        "center": {"lat": 28.6139, "lng": 77.2090}, # default city center
        "hotspots": hotspots
    }
