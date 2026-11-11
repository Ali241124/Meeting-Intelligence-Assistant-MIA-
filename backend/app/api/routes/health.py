from fastapi import APIRouter
from ...core.config import settings

router = APIRouter()

@router.get("/health", tags=["Health"])
def get_health():
    return {
        "status": "healthy",
        "service": "Meeting Intelligence Assistant (MIA)",
        "version": "2.0.0",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }

