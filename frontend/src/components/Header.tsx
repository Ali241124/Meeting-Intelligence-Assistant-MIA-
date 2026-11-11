import React from 'react';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onOpenAudit: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenAudit,
  onOpenSettings,
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Overview & Operational Metrics';
      case 'new-analysis':
        return 'Analyze Meeting Transcript';
      case 'results':
        return 'Meeting Intelligence Workspace';
      case 'scenarios':
        return 'MoinSystems Scenario Pack';
      default:
        return 'Meeting Intelligence';
    }
  };

  return (
    <header className="h-14 border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Workspace</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-semibold">{getViewTitle()}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAudit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40 transition-colors shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Scorecard (5/5)</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Engine Config</span>
        </button>
      </div>
    </header>
  );
};
