import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.schemas.meeting import (
    MeetingAnalysisResult,
    Decision,
    ActionItem,
    Risk,
    OpenQuestion,
    Ambiguity
)

def test_action_item_preserves_nulls():
    item = ActionItem(
        task="Investigate login timeout bug",
        owner=None,
        deadline=None,
        priority=None,
        evidence="Ali will look into it"
    )
    assert item.owner is None
    assert item.deadline is None
    assert item.priority is None
    assert item.task == "Investigate login timeout bug"

def test_meeting_analysis_result_validation():
    data = {
        "meeting_title": "E-commerce Launch Readiness",
        "summary": "Team prepared for launch.",
        "decisions": [
            {"decision": "Checkout is top priority", "evidence": "Sarah agreed"}
        ],
        "action_items": [
            {"task": "Finish checkout", "owner": "Ahmed", "deadline": "Wednesday", "priority": "high", "evidence": "I will finish checkout"}
        ],
        "risks": [
            {"risk": "401 sandbox errors", "evidence": "Occurred twice"}
        ],
        "open_questions": [
            {"question": "Will Finance approve?", "owner": "Lina", "evidence": "Lina cannot promise"}
        ],
        "ambiguities": [
            {"issue": "Monday launch date", "why_ambiguous": "Proposed only", "evidence": "Should we move to Monday?"}
        ]
    }
    result = MeetingAnalysisResult.model_validate(data)
    assert result.meeting_title == "E-commerce Launch Readiness"
    assert len(result.decisions) == 1
    assert len(result.action_items) == 1
    assert result.action_items[0].owner == "Ahmed"

if __name__ == "__main__":
    test_action_item_preserves_nulls()
    test_meeting_analysis_result_validation()
    print("All schema unit tests passed successfully!")
