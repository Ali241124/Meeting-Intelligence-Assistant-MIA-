from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json
from pathlib import Path
from ...data.scenarios import SCENARIOS

router = APIRouter()

# Custom scenarios storage
CUSTOM_SCENARIOS_FILE = Path(__file__).resolve().parent.parent.parent.parent.parent / "custom_scenarios.json"

def load_custom_scenarios():
    if CUSTOM_SCENARIOS_FILE.exists():
        try:
            with open(CUSTOM_SCENARIOS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading custom scenarios: {e}")
            return []
    return []

def save_custom_scenarios(scenarios):
    try:
        CUSTOM_SCENARIOS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CUSTOM_SCENARIOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(scenarios, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving custom scenarios: {e}")
        raise

class SaveScenarioRequest(BaseModel):
    title: str
    transcript: str
    category: str = "Custom"
    description: str = ""
    participants: Optional[List[str]] = None

@router.post("/scenarios", tags=["Scenarios"])
def save_scenario(req: SaveScenarioRequest):
    """Save a custom scenario for later testing."""
    try:
        custom = load_custom_scenarios()
        new_id = max([s["id"] for s in custom], default=99) + 1
        new_scenario = {
            "id": new_id,
            "title": req.title,
            "category": req.category,
            "description": req.description or "Custom user scenario",
            "participants": req.participants or [],
            "expected_focus": [],
            "traps": "",
            "transcript": req.transcript,
        }
        custom.append(new_scenario)
        save_custom_scenarios(custom)
        return new_scenario
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scenarios", tags=["Scenarios"])
def get_all_scenarios():
    """Retrieve the five standalone benchmark meeting scenarios plus custom scenarios."""
    custom = load_custom_scenarios()
    return SCENARIOS + custom

@router.get("/scenarios/{scenario_id}", tags=["Scenarios"])
def get_scenario_by_id(scenario_id: int):
    """Retrieve a single scenario by ID (1-5 for built-in, 100+ for custom)."""
    all_scenarios = SCENARIOS + load_custom_scenarios()
    for s in all_scenarios:
        if s["id"] == scenario_id:
            return s
    raise HTTPException(status_code=404, detail=f"Scenario with ID {scenario_id} not found.")

