import os
import uuid
import shutil
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.services.seed_data import seed_database
from app.routers import (
    auth_router,
    properties_router,
    favorites_router,
    enquiries_router,
    visits_router,
    owner_router,
    admin_router,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created and seed initial realistic data
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run seed script
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error("Error during initial database seeding: %s", str(e))
    finally:
        db.close()
        
    yield
    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real Estate Rental and Property Sales Platform API built with FastAPI, SQLAlchemy, and PostgreSQL.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(properties_router, prefix=settings.API_V1_STR)
app.include_router(favorites_router, prefix=settings.API_V1_STR)
app.include_router(enquiries_router, prefix=settings.API_V1_STR)
app.include_router(visits_router, prefix=settings.API_V1_STR)
app.include_router(owner_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "real-estate-backend"
    }

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.")
    
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "url": f"http://127.0.0.1:8000/uploads/{unique_filename}",
        "filename": unique_filename
    }

@app.post("/api/seed")
def force_seed_database(db: Session = Depends(get_db)):
    seed_database(db)
    return {"message": "Database successfully seeded with realistic sample data"}
