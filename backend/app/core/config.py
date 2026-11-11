import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Meeting Intelligence Assistant (MIA)"
    API_V1_STR: str = "/api/v1"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = "qwen/qwen3.8-27b"
    DEFAULT_OPENAI_MODEL: str = "gpt-4o-mini"
    
    class Config:
        case_sensitive = True

settings = Settings()

