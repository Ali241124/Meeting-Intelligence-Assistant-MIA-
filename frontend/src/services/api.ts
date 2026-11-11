import { AnalyzeResponse, Scenario, AuditScorecardResponse } from '../types';

const API_BASE = '/api/v1';

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function getScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to load meeting scenarios');
  return res.json();
}

export async function analyzeTranscript(params: {
  transcript: string;
  meeting_title?: string;
  meeting_date?: string;
  participants?: string[];
  provider?: string;
  model?: string;
  api_key?: string;
}): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis request failed');
  }
  return res.json();
}

export async function runComplianceAudit(params: {
  provider?: string;
  api_key?: string;
}): Promise<AuditScorecardResponse> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Compliance audit run failed');
  return res.json();
}

export async function getSystemPrompt(): Promise<string> {
  const res = await fetch(`${API_BASE}/prompt`);
  if (!res.ok) throw new Error('Failed to load system prompt');
  const data = await res.json();
  return data.prompt;
}
