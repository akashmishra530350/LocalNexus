from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, TokenResponse, UserOut
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Validate official department
    dept = user_in.department
    if user_in.role == "official" and not dept:
        dept = "Roads & Infrastructure"

    new_user = User(
        email=user_in.email.lower().strip(),
        full_name=user_in.full_name.strip(),
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        department=dept,
        ward=user_in.ward or "Central Zone",
        phone=user_in.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if login_data.role_hint and login_data.role_hint == "official" and user.role not in ["official", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is registered as a Citizen. Please sign in via the Citizen Portal, or contact municipal administration for official credentials."
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-credentials")
def get_demo_credentials():
    """Provides convenient demo accounts for quick testing & evaluation."""
    return {
        "citizen": {
            "email": "citizen@civicpulse.org",
            "password": "Password123!",
            "role": "citizen",
            "name": "Sarah Jenkins (Citizen)"
        },
        "official": {
            "email": "official@civicpulse.org",
            "password": "Password123!",
            "role": "official",
            "department": "Public Works & Infrastructure",
            "name": "David Ramirez (Municipal Officer)"
        }
    }
