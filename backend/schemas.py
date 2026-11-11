from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class DecisionItem(BaseModel):
    decision: str = Field(description="Confirmed decision made during the meeting")
    evidence: str = Field(description="Concise direct quote or verbatim snippet supporting this decision")

class ActionItem(BaseModel):
    task: str = Field(description="Actionable task or commitment")
    owner: Optional[str] = Field(default=None, description="Explicit owner name or role; null if missing")
    deadline: Optional[str] = Field(default=None, description="Explicit deadline or date; null if not specified")
    priority: Optional[Literal["high", "medium", "low"]] = Field(default=None, description="Explicitly stated priority; null if not stated")
    evidence: str = Field(description="Concise direct quote or verbatim snippet supporting this action item")

class RiskItem(BaseModel):
    risk: str = Field(description="Operational, technical, or business risk")
    evidence: str = Field(description="Concise direct quote or snippet supporting this risk")

class OpenQuestionItem(BaseModel):
    question: str = Field(description="Unanswered question or clarification needed")
    owner: Optional[str] = Field(default=None, description="Person asked to answer or follow up; null if unassigned")
    evidence: str = Field(description="Concise direct quote or snippet supporting this question")

class AmbiguityItem(BaseModel):
    issue: str = Field(description="Unresolved ambiguity, conflicting statements, or unconfirmed estimates")
    why_ambiguous: str = Field(description="Why this is ambiguous or conflicting rather than a confirmed fact")
    evidence: str = Field(description="Concise direct quotes showing the conflict or ambiguity")

class MeetingExtractionResponse(BaseModel):
    meeting_title: Optional[str] = Field(default=None, description="Concise meeting title inferred from transcript or null")
    summary: str = Field(description="Objective 2-3 sentence executive summary of the meeting")
    decisions: List[DecisionItem] = Field(default_factory=list, description="Explicitly confirmed decisions only")
    action_items: List[ActionItem] = Field(default_factory=list, description="Explicitly confirmed commitments and tasks")
    risks: List[RiskItem] = Field(default_factory=list, description="Stated risks and blockers")
    open_questions: List[OpenQuestionItem] = Field(default_factory=list, description="Unresolved questions and clarification requests")
    ambiguities: List[AmbiguityItem] = Field(default_factory=list, description="Conflicting statements or unconfirmed estimates")

class AnalyzeRequest(BaseModel):
    transcript: str
    provider: Optional[str] = "groq"
    model: Optional[str] = "qwen/qwen3.8-27b"
    api_key: Optional[str] = None
    prompt_version: Optional[str] = "v2"

