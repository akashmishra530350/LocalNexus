import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, get_db
from .seed_data import seed_database
from .routes import auth_routes, complaint_routes, analytics_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Run seeder with a clean session
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CivicPulse - AI-Powered Municipal Issue Management API",
    description="Centralized platform that uses ML to classify complaints, detect duplicate reports, calculate transparent priority scores, and visualize civic hotspots.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless Render + Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_routes.router)
app.include_router(complaint_routes.router)
app.include_router(analytics_routes.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "CivicPulse API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Check if frontend build exists to serve full-stack from Render
frontend_dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")
frontend_dist_path = os.path.abspath(frontend_dist_path)

if os.path.exists(frontend_dist_path) and os.path.isdir(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
