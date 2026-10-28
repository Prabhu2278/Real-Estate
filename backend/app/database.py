import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        # Try configured database (PostgreSQL by default)
        test_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3} if "postgresql" in db_url else {}
        )
        # Test connection
        with test_engine.connect() as conn:
            safe_display = db_url.split("@")[-1] if "@" in db_url else db_url
            logger.info("Successfully connected to primary database: %s", safe_display)
        return test_engine
    except Exception as e:
        safe_display = db_url.split("@")[-1] if "@" in db_url else db_url
        logger.warning(
            "Could not connect to primary database (%s). Falling back to SQLite local database (real_estate.db): %s",
            safe_display, str(e)
        )
        sqlite_url = "sqlite:///./real_estate.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
