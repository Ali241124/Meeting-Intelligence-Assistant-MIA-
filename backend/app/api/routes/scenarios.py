from fastapi import APIRouter, HTTPException
from ...data.scenarios import SCENARIOS

router = APIRouter()

@router.get("/scenarios", tags=["Scenarios"])
def get_all_scenarios():
    """Retrieve the five standalone benchmark meeting scenarios."""
    return SCENARIOS

@router.get("/scenarios/{scenario_id}", tags=["Scenarios"])
def get_scenario_by_id(scenario_id: int):
    """Retrieve a single scenario by ID."""
    for s in SCENARIOS:
        if s["id"] == scenario_id:
            return s
    raise HTTPException(status_code=404, detail=f"Scenario with ID {scenario_id} not found.")

