from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

class Decision(BaseModel):
    decision: str = Field(description="Confirmed decision made during the meeting")
    evidence: str = Field(description="Concise verbatim snippet supporting this decision")

class ActionItem(BaseModel):
    task: str = Field(description="Actionable task or commitment")
    owner: Optional[str] = Field(default=None, description="Explicit owner name or role; null if unassigned")
    deadline: Optional[str] = Field(default=None, description="Explicit deadline or date; null if not specified")
    priority: Optional[Literal["high", "medium", "low"]] = Field(default=None, description="Explicitly stated priority; null if not stated")
    evidence: str = Field(description="Concise verbatim snippet supporting this action item")

class Risk(BaseModel):
    risk: str = Field(description="Operational, technical, or business risk")
    evidence: str = Field(description="Concise verbatim snippet supporting this risk")

class OpenQuestion(BaseModel):
    question: str = Field(description="Unanswered question or clarification needed")
    owner: Optional[str] = Field(default=None, description="Person asked to answer; null if unassigned")
    evidence: str = Field(description="Concise verbatim snippet supporting this question")

class Ambiguity(BaseModel):
    issue: str = Field(description="Unresolved ambiguity, conflicting statements, or unconfirmed estimates")
    why_ambiguous: str = Field(description="Why this is ambiguous or conflicting rather than a confirmed fact")
    evidence: str = Field(description="Concise verbatim quotes showing the conflict or ambiguity")

class MeetingAnalysisResult(BaseModel):
    meeting_title: Optional[str] = Field(default=None, description="Meeting title")
    meeting_date: Optional[str] = Field(default=None, description="Meeting date if specified")
    participants: Optional[List[str]] = Field(default_factory=list, description="Participants mentioned")
    summary: str = Field(description="Objective 2-3 sentence executive summary")
    decisions: List[Decision] = Field(default_factory=list, description="Explicitly confirmed decisions")
    action_items: List[ActionItem] = Field(default_factory=list, description="Explicit action items")
    risks: List[Risk] = Field(default_factory=list, description="Stated risks and blockers")
    open_questions: List[OpenQuestion] = Field(default_factory=list, description="Unresolved questions")
    ambiguities: List[Ambiguity] = Field(default_factory=list, description="Conflicting statements or unconfirmed estimates")

class AnalyzeMeetingRequest(BaseModel):
    transcript: str = Field(..., min_length=1, description="Raw meeting notes or transcript")
    meeting_title: Optional[str] = Field(default=None, description="Optional meeting title")
    meeting_date: Optional[str] = Field(default=None, description="Optional meeting date")
    participants: Optional[List[str]] = Field(default_factory=list, description="Optional list of participant names")
    provider: Optional[str] = Field(default="groq", description="LLM provider: groq, openai, or simulation")
    model: Optional[str] = Field(default="qwen/qwen3.8-27b", description="Model identifier")
    api_key: Optional[str] = Field(default=None, description="Optional client-supplied API key")

class AnalyzeMeetingResponse(BaseModel):
    success: bool
    data: MeetingAnalysisResult
    metadata: Dict[str, Any]
    error: Optional[str] = None

