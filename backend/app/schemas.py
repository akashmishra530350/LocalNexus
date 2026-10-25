from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- User Schemas ---
class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "citizen"  # "citizen" or "official"
    department: Optional[str] = None
    ward: Optional[str] = "Central Zone"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    role_hint: Optional[str] = None  # "citizen" or "official"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    ward: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Activity Log Schema ---
class ActivityLogOut(BaseModel):
    id: int
    complaint_id: int
    action: str
    performed_by_name: str
    performed_by_role: str
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    address: str
    ward: Optional[str] = "Central Zone"
    manual_category: Optional[str] = None
    image_url: Optional[str] = None

class ComplaintUpdateStatus(BaseModel):
    status: str
    official_remarks: Optional[str] = None
    assigned_officer: Optional[str] = None
    estimated_resolution_time: Optional[str] = None

class ComplaintMerge(BaseModel):
    primary_complaint_id: int
    notes: Optional[str] = None

class ComplaintOut(BaseModel):
    id: int
    tracking_number: Optional[str] = None
    title: str
    description: str
    predicted_category: str
    category_confidence: float
    manual_category: Optional[str] = None
    department: str
    status: str
    priority_score: float
    priority_level: str
    priority_breakdown: Optional[Dict[str, Any]] = None
    latitude: float
    longitude: float
    address: str
    ward: str
    citizen_id: int
    citizen_name: str
    is_duplicate: bool
    parent_complaint_id: Optional[int] = None
    duplicate_candidates: Optional[List[Dict[str, Any]]] = None
    upvote_count: int
    assigned_officer: Optional[str] = None
    official_remarks: Optional[str] = None
    estimated_resolution_time: Optional[str] = None
    image_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    activity_logs: Optional[List[ActivityLogOut]] = []

    class Config:
        from_attributes = True

# --- ML & Analytics Schemas ---
class PredictCategoryRequest(BaseModel):
    title: str
    description: str

class PredictCategoryResponse(BaseModel):
    predicted_category: str
    department: str
    confidence: float
    top_probabilities: Dict[str, float]
    suggested_priority: str
    priority_score: float
    priority_breakdown: Dict[str, Any]

class CheckDuplicateRequest(BaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None

class DuplicateMatch(BaseModel):
    complaint_id: int
    title: str
    similarity_score: float
    status: str
    created_at: str
    address: str
    distance_km: Optional[float] = None

class CheckDuplicateResponse(BaseModel):
    has_duplicates: bool
    highest_similarity: float
    candidates: List[DuplicateMatch]

class AnalyticsOverview(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    critical_complaints: int
    duplicates_flagged: int
    average_resolution_hours: float
    category_counts: Dict[str, int]
    priority_counts: Dict[str, int]
    status_counts: Dict[str, int]
    ward_counts: Dict[str, int]
    recent_trend: List[Dict[str, Any]]
