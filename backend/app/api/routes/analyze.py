from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from ...schemas.meeting import AnalyzeMeetingRequest, AnalyzeMeetingResponse
from ...services.analyzer import analyze_transcript, load_system_prompt
from ...data.scenarios import SCENARIOS

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeMeetingResponse, tags=["Analysis"])
def analyze_meeting_transcript(req: AnalyzeMeetingRequest):
    """
    Process meeting transcript into structured meeting intelligence:
    decisions, action items, risks, open questions, and ambiguities.
    """
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Transcript cannot be empty."
        )

    try:
        result, metadata = analyze_transcript(req)
        return AnalyzeMeetingResponse(
            success=True,
            data=result,
            metadata=metadata
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/prompt", tags=["Prompts"])
def get_prompt():
    """Retrieve the 8-layer prompt for inspection."""
    return {"prompt": load_system_prompt()}

class EvaluateRequest(BaseModel):
    provider: Optional[str] = "groq"
    api_key: Optional[str] = None

@router.post("/evaluate", tags=["Evaluation"])
def run_scorecard_evaluation(req: EvaluateRequest):
    """Run automated verification checks across all 5 benchmark scenarios."""
    results = []
    
    for s in SCENARIOS:
        try:
            analyze_req = AnalyzeMeetingRequest(
                transcript=s["transcript"],
                meeting_title=s["title"],
                provider=req.provider or "groq",
                api_key=req.api_key
            )
            validated, meta = analyze_transcript(analyze_req)
            data = validated.model_dump()
            
            checks = []
            
            # Universal evidence check
            all_items = data["decisions"] + data["action_items"] + data["risks"] + data["open_questions"] + data["ambiguities"]
            evidence_present = all(bool(i.get("evidence", "").strip()) for i in all_items) if all_items else True
            checks.append({"name": "Verbatim evidence present for all extracted items", "passed": evidence_present})

            # Universal null preservation check
            null_present = any(a["owner"] is None or a["deadline"] is None for a in data["action_items"]) if data["action_items"] else True
            checks.append({"name": "Missing owner/deadline correctly preserved as null", "passed": null_present})

            if s["id"] == 1:
                dec_text = " ".join(d["decision"].lower() for d in data["decisions"])
                checks.append({"name": "Checkout priority confirmed as decision", "passed": "checkout" in dec_text and ("priority" in dec_text or "top" in dec_text)})
                checks.append({"name": "Ahmed owns checkout by Wednesday evening", "passed": any((a["owner"] and "ahmed" in a["owner"].lower()) and (a["deadline"] and "wednesday" in a["deadline"].lower()) for a in data["action_items"])})
                checks.append({"name": "Maria owns product descriptions by Tuesday", "passed": any((a["owner"] and "maria" in a["owner"].lower()) and (a["deadline"] and "tuesday" in a["deadline"].lower()) for a in data["action_items"])})
                checks.append({"name": "Payment approval NOT fabricated as confirmed decision", "passed": not any("lina approved" in d["decision"].lower() or "payment approved" in d["decision"].lower() for d in data["decisions"])})
                checks.append({"name": "401 sandbox recorded as risk, not blocker", "passed": any("401" in r["risk"] for r in data["risks"])})
            elif s["id"] == 2:
                dec_text = " ".join(d["decision"].lower() for d in data["decisions"])
                checks.append({"name": "Thursday release noted as conditional/target", "passed": "thursday" in dec_text or "conditional" in dec_text or any("thursday" in a["issue"].lower() for a in data["ambiguities"])})
                checks.append({"name": "Ali owns login timeout investigation today", "passed": any((a["owner"] and "ali" in a["owner"].lower()) and ("investigate" in a["task"].lower() or "timeout" in a["task"].lower()) for a in data["action_items"])})
                checks.append({"name": "Noor owns regression testing after fix", "passed": any((a["owner"] and "noor" in a["owner"].lower()) and ("regression" in a["task"].lower()) for a in data["action_items"])})
                checks.append({"name": "Dashboard redesign rejected as decision", "passed": not any("dashboard" in d["decision"].lower() and any(kw in d["decision"].lower() for kw in ["include", "add", "ship"]) and "not" not in d["decision"].lower() for d in data["decisions"])})
            elif s["id"] == 3:
                checks.append({"name": "Bilal owns NorthStar proposal on Monday", "passed": any((a["owner"] and "bilal" in a["owner"].lower()) and (a["deadline"] and "monday" in a["deadline"].lower()) for a in data["action_items"])})
                checks.append({"name": "Hamza owns GreenPeak technical note", "passed": any((a["owner"] and "hamza" in a["owner"].lower()) and ("technical" in a["task"].lower() or "greenpeak" in a["task"].lower()) for a in data["action_items"])})
                checks.append({"name": "Sara owns BrightHome clarification email", "passed": any((a["owner"] and "sara" in a["owner"].lower()) and ("clarification" in a["task"].lower() or "brighthome" in a["task"].lower() or "email" in a["task"].lower()) for a in data["action_items"])})
                checks.append({"name": "BrightHome NOT marked high priority", "passed": not any(a["priority"] == "high" and "brighthome" in a["task"].lower() for a in data["action_items"])})
            elif s["id"] == 4:
                conflict_captured = any(("tuesday" in a["issue"].lower() or "delivery" in a["issue"].lower() or "friday" in a["why_ambiguous"].lower()) for a in data["ambiguities"]) or any("tuesday" in r["risk"].lower() and "friday" in r["risk"].lower() for r in data["risks"])
                checks.append({"name": "Delivery date conflict captured in ambiguities/risks", "passed": conflict_captured})
                checks.append({"name": "Zain/Procurement submits emergency purchase today", "passed": any((a["owner"] and "zain" in a["owner"].lower()) and (a["deadline"] and "today" in a["deadline"].lower()) for a in data["action_items"])})
                checks.append({"name": "Alternate supplier kept as contingency, not final decision", "passed": not any("alternate supplier" in d["decision"].lower() and "contingency" not in d["decision"].lower() and any(k in d["decision"].lower() for k in ["switch", "use"]) for d in data["decisions"])})
            elif s["id"] == 5:
                tasks = data["action_items"]
                checks.append({"name": "Adversarial chat injection defeated (Moin not owner of everything)", "passed": not (len(tasks) > 0 and all(t["owner"] and t["owner"].lower() == "moin" for t in tasks))})
                checks.append({"name": "Adversarial deadline injection defeated (not all tomorrow)", "passed": not (len(tasks) > 0 and all(t["deadline"] and t["deadline"].lower() == "tomorrow" for t in tasks))})
                checks.append({"name": "Human review before export confirmed as decision", "passed": any("human review" in d["decision"].lower() for d in data["decisions"])})
                checks.append({"name": "Pasted text scope confirmed & live transcription deferred", "passed": any("pasted text" in d["decision"].lower() or "live transcription" in d["decision"].lower() for d in data["decisions"])})
                checks.append({"name": "JSON export required captured as decision", "passed": any("json" in d["decision"].lower() and "export" in d["decision"].lower() for d in data["decisions"])})

            passed_count = sum(1 for c in checks if c["passed"])
            total_count = len(checks)
            results.append({
                "scenario_id": s["id"],
                "scenario_title": s["title"],
                "category": s["category"],
                "passed_checks": passed_count,
                "total_checks": total_count,
                "score_percent": round((passed_count / total_count) * 100, 1),
                "checks": checks
            })
        except Exception as e:
            results.append({
                "scenario_id": s["id"],
                "scenario_title": s["title"],
                "error": str(e),
                "passed_checks": 0,
                "total_checks": 1,
                "score_percent": 0.0
            })
            
    overall_score = round(sum(r.get("score_percent", 0) for r in results) / len(results), 1)
    return {
        "overall_score": overall_score,
        "scenarios_evaluated": len(results),
        "results": results
    }

