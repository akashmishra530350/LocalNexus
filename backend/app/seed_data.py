from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import User, Complaint, Upvote, ActivityLog
from .auth import get_password_hash
from .ml_service import ml_service, CATEGORY_DEPARTMENT_MAP

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("Seeding initial CivicPulse accounts and realistic complaints...")

    # 1. Create Default Users
    # Citizen
    citizen_user = User(
        email="citizen@civicpulse.org",
        full_name="Sarah Jenkins",
        hashed_password=get_password_hash("Password123!"),
        role="citizen",
        ward="Central Zone",
        phone="+1 (555) 234-5678"
    )
    # Secondary Citizen (for duplicate testing)
    citizen_user2 = User(
        email="alex.morris@gmail.com",
        full_name="Alex Morris",
        hashed_password=get_password_hash("Password123!"),
        role="citizen",
        ward="North Metro District",
        phone="+1 (555) 876-5432"
    )
    # Official / Municipal Administrator
    official_user = User(
        email="official@civicpulse.org",
        full_name="David Ramirez",
        hashed_password=get_password_hash("Password123!"),
        role="official",
        department="Public Works & Infrastructure",
        ward="City Central HQ",
        phone="+1 (555) 999-0011"
    )
    db.add_all([citizen_user, citizen_user2, official_user])
    db.commit()
    db.refresh(citizen_user)
    db.refresh(citizen_user2)
    db.refresh(official_user)

    # 2. Seed Complaints
    now = datetime.utcnow()

    sample_complaints = [
        {
            "tracking_number": "CP-2026-10492",
            "title": "Uncovered open manhole on busy pedestrian sidewalk near Metro Gate 3",
            "description": "Deep open manhole without cover or warning sign right next to bus shelter. High fatal accident risk during night hours. Water is bubbling inside.",
            "category": "Drainage & Sewage",
            "lat": 28.6289,
            "lng": 77.2065,
            "address": "Opposite Metro Gate 3, Connaught Outer Circle",
            "ward": "Central Zone",
            "status": "ASSIGNED",
            "assigned_officer": "Eng. Rajesh Verma (Drainage Div)",
            "official_remarks": "Barricade placed immediately. Replacement heavy ductile iron cover ordered for dispatch.",
            "estimated_resolution_time": "Within 24 hours",
            "created_days_ago": 1.2,
            "upvotes": 14,
            "citizen_id": citizen_user.id,
            "citizen_name": citizen_user.full_name
        },
        {
            "tracking_number": "CP-2026-10499",
            "title": "Open drain chamber near metro exit - very dangerous at night",
            "description": "Saw an open gutter hole without any lid or barrier right near Metro gate 3 exit. Someone can easily fall inside in the dark.",
            "category": "Drainage & Sewage",
            "lat": 28.6291,
            "lng": 77.2069,
            "address": "Metro Gate 3 walkway, Central Circle",
            "ward": "Central Zone",
            "status": "UNDER_REVIEW",
            "assigned_officer": None,
            "official_remarks": None,
            "estimated_resolution_time": None,
            "created_days_ago": 0.4,
            "upvotes": 5,
            "citizen_id": citizen_user2.id,
            "citizen_name": citizen_user2.full_name
        },
        {
            "tracking_number": "CP-2026-20811",
            "title": "Live overhead electric wire snapped and sparking on tree branch",
            "description": "11kV distribution wire snapped during storm, hanging 4 feet above pedestrian sidewalk and sparking with loud buzzing. Immediate fire hazard.",
            "category": "Streetlights & Electricity",
            "lat": 28.6190,
            "lng": 77.2140,
            "address": "Near St. Anthony High School, Barakhamba Road",
            "ward": "North Metro District",
            "status": "IN_PROGRESS",
            "assigned_officer": "Line Supervisor Amit Sharma",
            "official_remarks": "Power feeder isolated remotely. Rapid response electrical squad on site repairing line.",
            "estimated_resolution_time": "4 hours",
            "created_days_ago": 0.8,
            "upvotes": 22,
            "citizen_id": citizen_user.id,
            "citizen_name": citizen_user.full_name
        },
        {
            "tracking_number": "CP-2026-30441",
            "title": "Massive municipal water main burst, clean drinking water flooding market",
            "description": "Underground 18-inch water main ruptured under pavement. High pressure water fountain gushing into adjacent grocery shops and basements.",
            "category": "Water Supply & Leakage",
            "lat": 28.6350,
            "lng": 77.2250,
            "address": "Sector 4 Main Commercial Market, Janpath",
            "ward": "East Commercial Zone",
            "status": "ASSIGNED",
            "assigned_officer": "Water Supply Unit 4",
            "official_remarks": "Sluice valve closed to prevent further wastage. Excavator en route for pipe welding.",
            "estimated_resolution_time": "12 hours",
            "created_days_ago": 2.1,
            "upvotes": 19,
            "citizen_id": citizen_user2.id,
            "citizen_name": citizen_user2.full_name
        },
        {
            "tracking_number": "CP-2026-41092",
            "title": "Severe road crater and cave-in after pipeline work on arterial road",
            "description": "Trench left uncompacted after water pipe repair has collapsed into a 4-foot deep trench across the entire left lane. Two motorcyclists have already skidded.",
            "category": "Roads & Potholes",
            "lat": 28.6010,
            "lng": 77.2100,
            "address": "Lodhi Road Junction near Flyover",
            "ward": "South Heritage Zone",
            "status": "SUBMITTED",
            "assigned_officer": None,
            "official_remarks": None,
            "estimated_resolution_time": None,
            "created_days_ago": 3.5,
            "upvotes": 8,
            "citizen_id": citizen_user.id,
            "citizen_name": citizen_user.full_name
        },
        {
            "tracking_number": "CP-2026-52319",
            "title": "Commercial garbage dump uncollected for 6 days, rotting bio-waste",
            "description": "Large neighborhood dumpster overflowing onto asphalt. Rotten food waste, plastics, and dead poultry waste scattered by stray dogs causing severe stench.",
            "category": "Waste Management & Garbage",
            "lat": 28.6420,
            "lng": 77.2180,
            "address": "Block C Community Center, Karol Bagh",
            "ward": "West Residential Zone",
            "status": "IN_PROGRESS",
            "assigned_officer": "Sanitation Inspector S. Khan",
            "official_remarks": "Mechanical compactor truck dispatched for immediate clearance and bleaching powder spray.",
            "estimated_resolution_time": "By 6 PM today",
            "created_days_ago": 5.0,
            "upvotes": 12,
            "citizen_id": citizen_user2.id,
            "citizen_name": citizen_user2.full_name
        },
        {
            "tracking_number": "CP-2026-61884",
            "title": "Stagnant rainwater pool in vacant municipal plot breeding mosquitoes",
            "description": "Large swamp formed in government land after rain. Dense breeding ground for dengue and malaria mosquitoes next to elementary school.",
            "category": "Public Health & Sanitation",
            "lat": 28.6110,
            "lng": 77.2340,
            "address": "Vacant Plot 14, Pragati Vihar",
            "ward": "South Heritage Zone",
            "status": "SUBMITTED",
            "assigned_officer": None,
            "official_remarks": None,
            "estimated_resolution_time": None,
            "created_days_ago": 4.2,
            "upvotes": 6,
            "citizen_id": citizen_user.id,
            "citizen_name": citizen_user.full_name
        },
        {
            "tracking_number": "CP-2026-70112",
            "title": "Series of 8 streetlights completely dead along residential avenue",
            "description": "Continuous dark stretch for 400 meters on 5th Avenue. Female residents feel unsafe walking back from metro station at night.",
            "category": "Streetlights & Electricity",
            "lat": 28.6250,
            "lng": 77.2010,
            "address": "5th Avenue, Gole Market",
            "ward": "Central Zone",
            "status": "RESOLVED",
            "assigned_officer": "Electrical Maintenance Crew A",
            "official_remarks": "Blown fuse replaced in distribution feeder box. All 8 LED luminaires verified functional.",
            "estimated_resolution_time": "Resolved",
            "created_days_ago": 7.0,
            "upvotes": 15,
            "citizen_id": citizen_user.id,
            "citizen_name": citizen_user.full_name
        }
    ]

    for item in sample_complaints:
        created_time = now - timedelta(days=item["created_days_ago"])
        resolved_time = (created_time + timedelta(hours=28)) if item["status"] == "RESOLVED" else None

        # ML Priority Calculation
        priority_res = ml_service.calculate_priority(
            title=item["title"],
            description=item["description"],
            category=item["category"],
            duplicate_count=2 if "open manhole" in item["title"].lower() or "open drain" in item["title"].lower() else 1,
            days_pending=item["created_days_ago"] if item["status"] != "RESOLVED" else 0,
            upvotes=item["upvotes"]
        )

        dept = CATEGORY_DEPARTMENT_MAP.get(item["category"], "General Municipal Works")

        complaint = Complaint(
            tracking_number=item["tracking_number"],
            title=item["title"],
            description=item["description"],
            predicted_category=item["category"],
            category_confidence=0.92,
            department=dept,
            status=item["status"],
            priority_score=priority_res["priority_score"],
            priority_level=priority_res["priority_level"],
            priority_breakdown=priority_res["breakdown"],
            latitude=item["lat"],
            longitude=item["lng"],
            address=item["address"],
            ward=item["ward"],
            citizen_id=item["citizen_id"],
            citizen_name=item["citizen_name"],
            upvote_count=item["upvotes"],
            assigned_officer=item["assigned_officer"],
            official_remarks=item["official_remarks"],
            estimated_resolution_time=item["estimated_resolution_time"],
            resolved_at=resolved_time,
            created_at=created_time,
            updated_at=created_time
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        # Seed activity log
        log1 = ActivityLog(
            complaint_id=complaint.id,
            action="CREATED",
            performed_by_name=item["citizen_name"],
            performed_by_role="citizen",
            note=f"Complaint registered via CivicPulse portal. AI classification: {item['category']}.",
            created_at=created_time
        )
        db.add(log1)

        if item["status"] in ["ASSIGNED", "IN_PROGRESS", "RESOLVED"]:
            log2 = ActivityLog(
                complaint_id=complaint.id,
                action="OFFICER_ASSIGNED",
                performed_by_name=official_user.full_name,
                performed_by_role="official",
                note=f"Assigned to {item['assigned_officer'] or 'Department Field Unit'}.",
                created_at=created_time + timedelta(hours=3)
            )
            db.add(log2)

        if item["status"] == "RESOLVED":
            log3 = ActivityLog(
                complaint_id=complaint.id,
                action="STATUS_UPDATED",
                performed_by_name=official_user.full_name,
                performed_by_role="official",
                note="Field verification completed. Issue resolved and signed off.",
                created_at=resolved_time
            )
            db.add(log3)

        db.commit()

    print("Seed data successfully initialized!")
