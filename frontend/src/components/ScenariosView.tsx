import React from 'react';
import { FlaskConical, ArrowRight, Users } from 'lucide-react';
import { Scenario } from '../types';

interface ScenariosViewProps {
  scenarios: Scenario[];
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  scenarios,
  onSelectScenario,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-brand-blue" />
          <span>MoinSystems Meeting Scenario Pack</span>
        </h1>
        <p className="text-xs text-slate-400">
          Five standalone meeting scenarios designed to test ordinary extraction, ambiguity, conflicting dates, missing data, and adversarial prompt injection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-emerald">Scenario {sc.id}</span>
                <span className="text-[10px] font-medium bg-charcoal-800 text-slate-400 px-2 py-0.5 rounded">
                  {sc.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{sc.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{sc.participants.join(', ')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-charcoal-800 flex justify-end">
              <button
                onClick={() => onSelectScenario(sc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-white border border-charcoal-700 transition-colors"
              >
                <span>Load in Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

