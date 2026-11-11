import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ListTodo, 
  AlertTriangle, 
  HelpCircle, 
  Scale, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Download, 
  Copy, 
  Code2, 
  Eye, 
  Sparkles,
  ArrowLeft,
  Check,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { MeetingAnalysisResult, AnalysisMetadata, ActionItem } from '../types';

interface ResultsWorkspaceProps {
  data: MeetingAnalysisResult;
  metadata: AnalysisMetadata;
  onUpdateData: (newData: MeetingAnalysisResult) => void;
  onBackToNew: () => void;
}

export const ResultsWorkspace: React.FC<ResultsWorkspaceProps> = ({
  data,
  metadata,
  onUpdateData,
  onBackToNew,
}) => {
  // Screen 4: Two editing modes (Visual Editor vs JSON Editor)
  const [editorMode, setEditorMode] = useState<'visual' | 'json'>('visual');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Expandable evidence state
  const [expandedDecisions, setExpandedDecisions] = useState<Record<number, boolean>>({});
  const [expandedActions, setExpandedActions] = useState<Record<number, boolean>>({});
  const [expandedRisks, setExpandedRisks] = useState<Record<number, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleDecision = (idx: number) => {
    setExpandedDecisions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAction = (idx: number) => {
    setExpandedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRisk = (idx: number) => {
    setExpandedRisks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Switch to JSON Editor
  const handleSwitchToJson = () => {
    setJsonText(JSON.stringify(data, null, 2));
    setJsonError(null);
    setEditorMode('json');
  };

  // Apply JSON edits
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onUpdateData(parsed);
      setJsonError(null);
      setEditorMode('visual');
    } catch (err: any) {
      setJsonError(`JSON Syntax Error: ${err.message}`);
    }
  };

  // Visual editing helpers
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateData({ ...data, summary: e.target.value });
  };

  const handleActionChange = (idx: number, field: keyof ActionItem, value: any) => {
    const updated = [...data.action_items];
    updated[idx] = { ...updated[idx], [field]: value === '' ? null : value };
    onUpdateData({ ...data, action_items: updated });
  };

  const handleAddAction = () => {
    const newItem: ActionItem = {
      task: 'New follow-up action',
      owner: null,
      deadline: null,
      priority: null,
      evidence: 'Added during human review',
    };
    onUpdateData({
      ...data,
      action_items: [...data.action_items, newItem],
    });
  };

  const handleDeleteAction = (idx: number) => {
    const updated = data.action_items.filter((_, i) => i !== idx);
    onUpdateData({ ...data, action_items: updated });
  };

  // Screen 5: Exports
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.meeting_title || 'meeting').toLowerCase().replace(/\s+/g, '_')}_intelligence.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['Task', 'Owner', 'Deadline', 'Priority', 'Evidence'];
    const rows = (data.action_items || []).map((item) => [
      `"${(item.task || '').replace(/"/g, '""')}"`,
      `"${(item.owner || 'null').replace(/"/g, '""')}"`,
      `"${(item.deadline || 'null').replace(/"/g, '""')}"`,
      `"${(item.priority || 'null').replace(/"/g, '""')}"`,
      `"${(item.evidence || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.meeting_title || 'action_items').toLowerCase().replace(/\s+/g, '_')}_tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-md">
        <div className="space-y-1.5">
          <button
            onClick={onBackToNew}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Analyze another transcript</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {data.meeting_title || 'Meeting Intelligence Report'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              Analysis complete
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Validated by Pydantic • Mode: <code className="text-slate-400">{metadata.mode}</code>
          </div>
        </div>

        {/* Action Buttons: Mode Switch + Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Two-mode Editor Switch (Screen 4) */}
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                editorMode === 'visual'
                  ? 'bg-charcoal-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </button>
            <button
              onClick={handleSwitchToJson}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                editorMode === 'json'
                  ? 'bg-charcoal-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON Editor</span>
            </button>
          </div>

          <div className="h-6 w-px bg-charcoal-800 mx-1 hidden sm:block" />

          {/* Export Actions (Screen 5) */}
          <button
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-charcoal-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-charcoal-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Screen 3 Requirement: Results Section Divider Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{data.decisions?.length || 0}</div>
            <div className="text-[11px] text-slate-400">Decisions Confirmed</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{data.action_items?.length || 0}</div>
            <div className="text-[11px] text-slate-400">Action Items</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{data.risks?.length || 0}</div>
            <div className="text-[11px] text-slate-400">Risks Stated</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{data.open_questions?.length || 0}</div>
            <div className="text-[11px] text-slate-400">Open Questions</div>
          </div>
        </div>
      </div>

      {/* Mode 2: JSON Editor (Screen 4 Requirement) */}
      {editorMode === 'json' ? (
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-emerald" />
                <span>Raw JSON Editor</span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect or modify the underlying machine-readable output. Edits are re-validated before saving.
              </p>
            </div>
            <button
              onClick={handleApplyJson}
              className="px-4 py-2 rounded-lg bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-semibold"
            >
              Apply JSON Changes
            </button>
          </div>

          {jsonError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {jsonError}
            </div>
          )}

          <textarea
            rows={22}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-charcoal-600"
          />
        </div>
      ) : (
        /* Mode 1: Visual Editor (Screen 3 & 4) */
        <div className="space-y-6">
          {/* Executive Summary Section */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-emerald" />
              <span>Executive Summary</span>
            </h2>
            <textarea
              rows={3}
              value={data.summary}
              onChange={handleSummaryChange}
              className="w-full p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-charcoal-600"
            />
          </div>

          {/* Confirmed Decisions Section */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirmed Decisions ({data.decisions?.length || 0})</span>
              </h2>
              <span className="text-xs text-slate-500">Separated from proposals & discussions</span>
            </div>

            {(!data.decisions || data.decisions.length === 0) ? (
              <div className="p-4 rounded-lg bg-charcoal-950 text-xs text-slate-500 italic">
                No explicitly confirmed decisions found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.decisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800/80 space-y-2"
                  >
                    <div className="text-xs font-medium text-slate-100 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                      <span className="flex-1">{dec.decision}</span>
                    </div>

                    {/* Expandable Evidence Quote (Screen 3 Requirement) */}
                    <button
                      onClick={() => toggleDecision(idx)}
                      className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-medium pt-1"
                    >
                      {expandedDecisions[idx] ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <span>Trace Transcript Evidence</span>
                    </button>

                    {expandedDecisions[idx] && (
                      <div className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-slate-400 italic">
                        "{dec.evidence}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Items Section (Table with inline editing) */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-indigo-400" />
                  <span>Action Items & Ownership ({data.action_items?.length || 0})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any cell to edit task, owner, deadline, or priority before export.
                </p>
              </div>

              <button
                onClick={handleAddAction}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-white border border-charcoal-700 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-charcoal-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-charcoal-950 text-slate-400 text-[11px] font-semibold border-b border-charcoal-800">
                  <tr>
                    <th className="py-2.5 px-3">Task Commitment</th>
                    <th className="py-2.5 px-3 w-36">Owner</th>
                    <th className="py-2.5 px-3 w-36">Deadline</th>
                    <th className="py-2.5 px-3 w-28">Priority</th>
                    <th className="py-2.5 px-3 w-36">Evidence Trace</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800/60 bg-charcoal-950/40">
                  {(!data.action_items || data.action_items.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                        No action items extracted.
                      </td>
                    </tr>
                  ) : (
                    data.action_items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-charcoal-850/50 transition-colors">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.task}
                              onChange={(e) => handleActionChange(idx, 'task', e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-charcoal-700 focus:border-brand-emerald focus:bg-charcoal-950 rounded px-2 py-1 text-slate-200 outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={item.owner || ''}
                                placeholder="null"
                                onChange={(e) => handleActionChange(idx, 'owner', e.target.value)}
                                className={`w-full bg-transparent border border-transparent hover:border-charcoal-700 focus:border-brand-emerald focus:bg-charcoal-950 rounded px-2 py-1 outline-none ${
                                  item.owner ? 'text-indigo-300 font-medium' : 'text-slate-500 italic'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={item.deadline || ''}
                                placeholder="null"
                                onChange={(e) => handleActionChange(idx, 'deadline', e.target.value)}
                                className={`w-full bg-transparent border border-transparent hover:border-charcoal-700 focus:border-brand-emerald focus:bg-charcoal-950 rounded px-2 py-1 outline-none ${
                                  item.deadline ? 'text-amber-300 font-medium' : 'text-slate-500 italic'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <select
                              value={item.priority || ''}
                              onChange={(e) => handleActionChange(idx, 'priority', e.target.value)}
                              className={`bg-transparent border border-transparent hover:border-charcoal-700 focus:border-brand-emerald focus:bg-charcoal-950 rounded px-1.5 py-1 text-[11px] outline-none font-medium ${
                                item.priority === 'high'
                                  ? 'text-rose-400 font-bold'
                                  : item.priority === 'medium'
                                  ? 'text-amber-400'
                                  : item.priority === 'low'
                                  ? 'text-emerald-400'
                                  : 'text-slate-500 italic'
                              }`}
                            >
                              <option value="" className="bg-charcoal-950 text-slate-500">null</option>
                              <option value="high" className="bg-charcoal-950 text-rose-400">high</option>
                              <option value="medium" className="bg-charcoal-950 text-amber-400">medium</option>
                              <option value="low" className="bg-charcoal-950 text-emerald-400">low</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => toggleAction(idx)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 truncate w-full text-left"
                              title={item.evidence}
                            >
                              <span className="truncate italic font-mono">"{item.evidence}"</span>
                            </button>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDeleteAction(idx)}
                              className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                        {expandedActions[idx] && (
                          <tr className="bg-charcoal-900/90">
                            <td colSpan={6} className="p-3 text-[11px] font-mono text-slate-400 italic border-b border-charcoal-800">
                              <strong>Evidence for task:</strong> "{item.evidence}"
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Risks & Ambiguities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risks Section */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Operational Risks ({data.risks?.length || 0})</span>
              </h2>

              {(!data.risks || data.risks.length === 0) ? (
                <div className="p-4 rounded-lg bg-charcoal-950 text-xs text-slate-500 italic">
                  No operational risks stated.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.risks.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-charcoal-950 border border-amber-950/60 border-l-4 border-l-amber-500 space-y-2"
                    >
                      <div className="text-xs font-medium text-slate-200">{r.risk}</div>
                      <button
                        onClick={() => toggleRisk(idx)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-medium"
                      >
                        {expandedRisks[idx] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                        <span>Evidence Snippet</span>
                      </button>
                      {expandedRisks[idx] && (
                        <div className="p-2 rounded bg-charcoal-900 text-[11px] font-mono text-slate-400 italic">
                          "{r.evidence}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ambiguities & Conflicts Section */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>Ambiguities & Conflicts ({data.ambiguities?.length || 0})</span>
              </h2>

              {(!data.ambiguities || data.ambiguities.length === 0) ? (
                <div className="p-4 rounded-lg bg-charcoal-950 text-xs text-slate-500 italic">
                  No conflicting statements or unconfirmed estimates.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.ambiguities.map((amb, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-charcoal-950 border border-indigo-950/60 border-l-4 border-l-indigo-500 space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-slate-200">{amb.issue}</div>
                      <div className="text-[11px] text-slate-400">{amb.why_ambiguous}</div>
                      <div className="text-[11px] font-mono text-slate-500 italic pt-1">
                        "{amb.evidence}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Open Questions Section */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Open Questions & Clarifications ({data.open_questions?.length || 0})</span>
            </h2>

            {(!data.open_questions || data.open_questions.length === 0) ? (
              <div className="p-4 rounded-lg bg-charcoal-950 text-xs text-slate-500 italic">
                No unresolved questions captured.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.open_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-medium text-slate-200">
                        {q.question}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-charcoal-800 text-slate-300 border border-charcoal-700 flex-shrink-0">
                        {q.owner ? `@${q.owner}` : 'Unassigned (null)'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 italic pt-1">
                      "{q.evidence}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
