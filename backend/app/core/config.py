import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load .env file explicitly
ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

class Settings(BaseSettings):
    PROJECT_NAME: str = "RealEstate Rental & Property Sales Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-realestate-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/real_estate"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
        "*"
    ]
    
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="allow"
    )

settings = Settings()

