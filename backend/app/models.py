from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen")  # "citizen", "official", "admin"
    department = Column(String(100), nullable=True)  # "Roads & Transport", "Sanitation & Waste", "Water & Sewage", "Electricity & Streetlights", "General"
    ward = Column(String(100), default="Central Zone")
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="citizen", foreign_keys="Complaint.citizen_id")
    upvotes = relationship("Upvote", back_populates="user")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True)  # e.g., "CP-2026-89421"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # ML Classification
    predicted_category = Column(String(100), nullable=False)
    category_confidence = Column(Float, default=0.0)
    manual_category = Column(String(100), nullable=True)
    department = Column(String(100), nullable=False)
    
    # Status & Workflow
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED
    
    # Priority Engine
    priority_score = Column(Float, default=50.0)
    priority_level = Column(String(30), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    priority_breakdown = Column(JSON, default=dict)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    ward = Column(String(100), default="Central Zone")
    
    # Citizen Metadata
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    citizen_name = Column(String(255), nullable=False)
    
    # Duplicate Detection
    is_duplicate = Column(Boolean, default=False)
    parent_complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    duplicate_candidates = Column(JSON, default=list)  # list of {id, title, similarity, distance_km}
    
    # Community & Official Actions
    upvote_count = Column(Integer, default=1)
    assigned_officer = Column(String(255), nullable=True)
    official_remarks = Column(Text, nullable=True)
    estimated_resolution_time = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])
    upvotes = relationship("Upvote", back_populates="complaint", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="complaint", cascade="all, delete-orphan")


class Upvote(Base):
    __tablename__ = "upvotes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="upvotes")
    complaint = relationship("Complaint", back_populates="upvotes")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    action = Column(String(100), nullable=False)  # "CREATED", "STATUS_UPDATED", "OFFICER_ASSIGNED", "MERGED_DUPLICATE", "REMARKS_ADDED"
    performed_by_name = Column(String(255), nullable=False)
    performed_by_role = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="activity_logs")
