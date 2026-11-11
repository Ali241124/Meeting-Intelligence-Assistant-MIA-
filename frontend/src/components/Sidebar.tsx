import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  FlaskConical, 
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SessionAnalysisRecord } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'new-analysis' | 'results' | 'scenarios';
  setCurrentView: (view: 'dashboard' | 'new-analysis' | 'results' | 'scenarios') => void;
  recentAnalyses: SessionAnalysisRecord[];
  onSelectRecent: (record: SessionAnalysisRecord) => void;
  onOpenSettings: () => void;
  provider: string;
  hasKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  recentAnalyses,
  onSelectRecent,
  onOpenSettings,
  provider,
  hasKey
}) => {
  return (
    <aside className="w-64 bg-charcoal-900 border-r border-charcoal-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-charcoal-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-charcoal-700 to-charcoal-800 border border-charcoal-600 flex items-center justify-center font-bold text-white shadow-sm">
          MIA
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white">Meeting Intelligence</h1>
          <p className="text-[11px] text-slate-400">Executive Ops Assistant</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'dashboard'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setCurrentView('new-analysis')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'new-analysis'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <FileText className="w-4 h-4 text-brand-emerald" />
          <span>New Analysis</span>
        </button>

        <button
          onClick={() => setCurrentView('scenarios')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'scenarios'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-brand-blue" />
          <span>Test Scenarios</span>
        </button>

        {/* Recent Analyses (Session History) */}
        <div className="pt-5 pb-2">
          <div className="px-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Sessions
            </span>
            <span className="bg-charcoal-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
              {recentAnalyses.length}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {recentAnalyses.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-600 italic">No analyses yet in this session</p>
            ) : (
              recentAnalyses.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => onSelectRecent(rec)}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-slate-400 hover:text-white hover:bg-charcoal-850 transition-colors truncate block"
                  title={rec.title}
                >
                  <div className="truncate font-medium">{rec.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{rec.timestamp}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Footer / Status bar */}
      <div className="p-3 border-t border-charcoal-800 bg-charcoal-950/60">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-charcoal-850 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-1.5">
            {provider === 'simulation' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-charcoal-800 text-slate-400 border border-charcoal-700">
                Simulation
              </span>
            ) : hasKey ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-2.5 h-2.5" /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60">
                <AlertCircle className="w-2.5 h-2.5" /> Demo
              </span>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
};

