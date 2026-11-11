export interface Decision {
  decision: string;
  evidence: string;
}

export interface ActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  evidence: string;
}

export interface Risk {
  risk: string;
  evidence: string;
}

export interface OpenQuestion {
  question: string;
  owner: string | null;
  evidence: string;
}

export interface Ambiguity {
  issue: string;
  why_ambiguous: string;
  evidence: string;
}

export interface MeetingAnalysisResult {
  meeting_title?: string | null;
  meeting_date?: string | null;
  participants?: string[];
  summary: string;
  decisions: Decision[];
  action_items: ActionItem[];
  risks: Risk[];
  open_questions: OpenQuestion[];
  ambiguities: Ambiguity[];
}

export interface AnalysisMetadata {
  provider: string;
  model: string;
  mode: string;
  characters_processed: number;
  validation_passed: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  data: MeetingAnalysisResult;
  metadata: AnalysisMetadata;
  error?: string;
}

export interface Scenario {
  id: number;
  title: string;
  category: string;
  description: string;
  participants: string[];
  transcript: string;
}

export interface AuditCheck {
  name: string;
  passed: boolean;
}

export interface ScenarioAuditResult {
  scenario_id: number;
  scenario_title: string;
  category: string;
  passed_checks: number;
  total_checks: number;
  score_percent: number;
  checks: AuditCheck[];
  error?: string;
}

export interface AuditScorecardResponse {
  overall_score: number;
  scenarios_evaluated: number;
  results: ScenarioAuditResult[];
}

export interface SessionAnalysisRecord {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  data: MeetingAnalysisResult;
  metadata: AnalysisMetadata;
}

