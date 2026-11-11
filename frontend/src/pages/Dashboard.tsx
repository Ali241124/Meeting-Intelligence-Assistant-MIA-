import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ListTodo, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SessionAnalysisRecord } from '../types';

interface DashboardProps {
  recentAnalyses: SessionAnalysisRecord[];
  onStartNew: () => void;
  onOpenAnalysis: (record: SessionAnalysisRecord) => void;
  onOpenAudit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recentAnalyses,
  onStartNew,
  onOpenAnalysis,
  onOpenAudit,
}) => {
  // Calculate live statistics from actual analyses
  const totalAnalyses = recentAnalyses.length;
  const totalDecisions = recentAnalyses.reduce(
    (acc, curr) => acc + (curr.data.decisions?.length || 0), 
    0
  );
  const totalActions = recentAnalyses.reduce(
    (acc, curr) => acc + (curr.data.action_items?.length || 0), 
    0
  );
  const totalRisks = recentAnalyses.reduce(
    (acc, curr) => acc + (curr.data.risks?.length || 0), 
    0
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-charcoal-800 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-charcoal-800 text-brand-emerald border border-charcoal-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
            <span>AI Meeting Operations Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Meeting Intelligence
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Turn conversations into clear decisions and actionable work. Conservative, verifiable structured intelligence extracted directly from meeting notes.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-900/30 flex-shrink-0"
        >
          <span>New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Operational Metrics (Screen 1 Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Analyses</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{totalAnalyses}</div>
            <div className="text-[11px] text-slate-500 mt-1">in current active session</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Decisions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-emerald-400">{totalDecisions}</div>
            <div className="text-[11px] text-slate-500 mt-1">explicitly confirmed agreements</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Action Items</span>
            <ListTodo className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-indigo-400">{totalActions}</div>
            <div className="text-[11px] text-slate-500 mt-1">with traceable evidence quotes</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Identified Risks</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-amber-400">{totalRisks}</div>
            <div className="text-[11px] text-slate-500 mt-1">blockers & ambiguity surfaced</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Analyses & Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Sessions */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent Analyses</span>
            </h2>
            <span className="text-xs text-slate-500">Persists during current session</span>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="p-8 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-charcoal-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                📋
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No transcripts processed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste meeting notes or try one of the five preloaded benchmark scenarios to see structured decisions and action items.
              </p>
              <button
                onClick={onStartNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-white border border-charcoal-700 transition-colors"
              >
                <span>Analyze First Transcript</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onOpenAnalysis(rec)}
                  className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-850 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-brand-emerald transition-colors">
                      {rec.title}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {rec.timestamp}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {rec.summary}
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="text-emerald-400">{rec.data.decisions?.length || 0} decisions</span>
                    <span>•</span>
                    <span className="text-indigo-400">{rec.data.action_items?.length || 0} tasks</span>
                    <span>•</span>
                    <span className="text-amber-400">{rec.data.risks?.length || 0} risks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quality Assurance / Core Principles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounding Guarantee</span>
            </h2>
          </div>

          <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-4 text-xs text-slate-300">
            <div className="space-y-1">
              <div className="font-semibold text-slate-200">Zero Hallucination Rule</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If an owner, budget, or deadline is unmentioned in the transcript, it remains strictly <code className="text-amber-400 bg-charcoal-950 px-1 py-0.5 rounded">null</code>.
              </p>
            </div>

            <div className="space-y-1 border-t border-charcoal-800 pt-3">
              <div className="font-semibold text-slate-200">Decisions vs Proposals</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Mere suggestions, hypotheses, and deferred items are isolated from confirmed agreements.
              </p>
            </div>

            <div className="space-y-1 border-t border-charcoal-800 pt-3">
              <div className="font-semibold text-slate-200">Discrepancy Preservation</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Conflicting dates (e.g. Tuesday verbal vs Friday tracker) are surfaced transparently in ambiguities.
              </p>
            </div>

            <div className="border-t border-charcoal-800 pt-3">
              <button
                onClick={onOpenAudit}
                className="w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Run 5-Scenario Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

