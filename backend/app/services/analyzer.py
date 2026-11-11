import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

from ..core.config import settings
from ..schemas.meeting import MeetingAnalysisResult, AnalyzeMeetingRequest
from .llm_provider import call_groq_api, call_openai_api, mock_deterministic_simulation
from .validator import clean_and_parse_json, validate_meeting_result

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "meeting_analysis_prompt.md"

def load_system_prompt() -> str:
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return "You are an AI meeting assistant. Extract decisions, tasks, risks, questions, ambiguities as JSON."

def format_transcript_prompt(transcript: str, title: Optional[str] = None, date: Optional[str] = None) -> str:
    header = ""
    if title:
        header += f"Meeting Title: {title}\n"
    if date:
        header += f"Meeting Date: {date}\n"
    return f"""{header}
<meeting_transcript>
{transcript.strip()}
</meeting_transcript>

Analyze the meeting transcript above using the system instructions. Output ONLY valid JSON matching the required schema."""

def analyze_transcript(req: AnalyzeMeetingRequest) -> Tuple[MeetingAnalysisResult, Dict[str, Any]]:
    system_prompt = load_system_prompt()
    user_prompt = format_transcript_prompt(req.transcript, req.meeting_title, req.meeting_date)
    
    # Priority: explicitly provided in request -> backend .env
    effective_groq_key = req.api_key or settings.GROQ_API_KEY
    effective_openai_key = req.api_key or settings.OPENAI_API_KEY
    
    used_mode = "api"
    provider = (req.provider or "groq").lower()
    model = req.model or (settings.DEFAULT_GROQ_MODEL if provider == "groq" else settings.DEFAULT_OPENAI_MODEL)

    if provider == "groq" and effective_groq_key:
        try:
            raw_response = call_groq_api(system_prompt, user_prompt, effective_groq_key, model)
            parsed_dict = clean_and_parse_json(raw_response)
            used_mode = f"groq:{model}"
        except Exception as e:
            print(f"[analyzer] Groq API call failed: {e}. Falling back to simulation.")
            parsed_dict = mock_deterministic_simulation(req.transcript)
            used_mode = f"simulation_fallback (error: {type(e).__name__})"
    elif provider == "openai" and effective_openai_key:
        try:
            raw_response = call_openai_api(system_prompt, user_prompt, effective_openai_key, model)
            parsed_dict = clean_and_parse_json(raw_response)
            used_mode = f"openai:{model}"
        except Exception as e:
            print(f"[analyzer] OpenAI API call failed: {e}. Falling back to simulation.")
            parsed_dict = mock_deterministic_simulation(req.transcript)
            used_mode = f"simulation_fallback (error: {type(e).__name__})"
    else:
        # Offline simulation
        parsed_dict = mock_deterministic_simulation(req.transcript)
        used_mode = "deterministic_simulation (no API key or simulation selected)"

    # Inject title/date/participants if provided
    if req.meeting_title and not parsed_dict.get("meeting_title"):
        parsed_dict["meeting_title"] = req.meeting_title
    if req.meeting_date and not parsed_dict.get("meeting_date"):
        parsed_dict["meeting_date"] = req.meeting_date
    if req.participants and not parsed_dict.get("participants"):
        parsed_dict["participants"] = req.participants

    validated_result = validate_meeting_result(parsed_dict)

    metadata = {
        "provider": provider,
        "model": model,
        "mode": used_mode,
        "characters_processed": len(req.transcript),
        "validation_passed": True
    }

    return validated_result, metadata

