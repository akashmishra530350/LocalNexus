import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "CivicPulse API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./civicpulse.db")
    @property
    def DATABASE_URL(self) -> str:
        url = self.raw_db_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicpulse-super-secret-key-render-deploy-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Server
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
