import re
import json
from typing import Dict, Any
from ..schemas.meeting import MeetingAnalysisResult

def clean_and_parse_json(raw_text: str) -> Dict[str, Any]:
    """
    Safely extract and parse JSON from LLM output,
    stripping markdown fences or surrounding chatter.
    """
    text = raw_text.strip()
    
    # Strip markdown ```json ... ``` blocks
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
            
    # Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # Search for first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except json.JSONDecodeError:
            pass
            
    raise ValueError(f"Could not parse valid JSON from response: {raw_text[:200]}...")

def validate_meeting_result(parsed_dict: Dict[str, Any]) -> MeetingAnalysisResult:
    """Validate parsed JSON dictionary against the strict Pydantic model."""
    return MeetingAnalysisResult.model_validate(parsed_dict)

