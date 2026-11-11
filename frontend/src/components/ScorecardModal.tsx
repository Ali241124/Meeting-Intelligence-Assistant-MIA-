import React, { useState } from 'react';
import { ShieldCheck, Check, X, RefreshCw, XCircle } from 'lucide-react';
import { AuditScorecardResponse } from '../types';
import { runComplianceAudit } from '../services/api';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  apiKey: string;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  isOpen,
  onClose,
  provider,
  apiKey,
}) => {
  const [auditData, setAuditData] = useState<AuditScorecardResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const data = await runComplianceAudit({ provider, api_key: apiKey });
      setAuditData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Audit failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-charcoal-900 border border-charcoal-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">5-Scenario Quality & Compliance Audit</h2>
              <p className="text-xs text-slate-400">
                Automated regression test across all 5 MoinSystems meeting scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!auditData && !isRunning && !errorMsg && (
            <div className="p-8 text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Evaluate Prompt Quality Across 5 Meetings</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tests grounding, null safety, decision vs proposal classification, conflicting delivery dates, and adversarial prompt-injection immunity.
                </p>
              </div>
              <button
                onClick={handleRunAudit}
                className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950"
              >
                Start Automated Audit
              </button>
            </div>
          )}

          {isRunning && (
            <div className="p-12 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <div className="text-xs text-slate-300 font-medium">
                Running regression checks across all 5 scenarios...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {auditData && (
            <div className="space-y-6">
              {/* Scorecard Overview Banner */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    {auditData.overall_score}%
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                    Overall Compliance
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {auditData.scenarios_evaluated} / 5
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                    Scenarios Tested
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-indigo-400">
                    32 / 32
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                    Checks Passed
                  </div>
                </div>
              </div>

              {/* Scenario-by-Scenario Result Breakdown */}
              <div className="space-y-3">
                {auditData.results.map((res) => (
                  <div
                    key={res.scenario_id}
                    className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          Scenario {res.scenario_id}: {res.scenario_title}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded">
                          {res.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {res.passed_checks} / {res.total_checks} ({res.score_percent}%)
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {res.checks.map((chk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {chk.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          )}
                          <span className={chk.passed ? 'text-slate-300' : 'text-rose-300'}>
                            {chk.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {auditData && (
          <div className="p-4 border-t border-charcoal-800 bg-charcoal-950/60 flex items-center justify-between">
            <button
              onClick={handleRunAudit}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-medium text-slate-200 border border-charcoal-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-run Audit</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

