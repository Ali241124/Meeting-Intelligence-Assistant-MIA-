import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Key, Cpu, FileText, Eye, EyeOff, XCircle } from 'lucide-react';
import { getSystemPrompt } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  setProvider: (p: string) => void;
  model: string;
  setModel: (m: string) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  provider,
  setProvider,
  model,
  setModel,
  apiKey,
  setApiKey,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [viewPrompt, setViewPrompt] = useState(false);

  useEffect(() => {
    if (isOpen && !systemPrompt) {
      getSystemPrompt()
        .then(setSystemPrompt)
        .catch(() => setSystemPrompt('Could not load prompt.'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-charcoal-900 border border-charcoal-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-slate-300">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Engine Configuration</h2>
              <p className="text-xs text-slate-400">Manage LLM provider, models, and API keys</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Inference Provider</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'groq', name: 'Groq (Ultra-Fast)', sub: 'Qwen 3.8 27B' },
                { id: 'openai', name: 'OpenAI API', sub: 'GPT-4o Mini' },
                { id: 'simulation', name: 'Offline Simulation', sub: 'High-Fidelity Mock' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    if (p.id === 'groq') setModel('qwen/qwen3.8-27b');
                    if (p.id === 'openai') setModel('gpt-4o-mini');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'bg-charcoal-800 border-brand-emerald text-white shadow-sm'
                      : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">Model Engine</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-white focus:outline-none focus:border-charcoal-600"
            >
              {provider === 'groq' ? (
                <>
                  <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Recommended)</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                </>
              )}
            </select>
          </div>

          {/* API Key */}
          {provider !== 'simulation' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider === 'groq' ? 'Groq API Key' : 'OpenAI API Key'}</span>
                </label>
                <span className="text-[11px] text-slate-500">Stored locally in your browser</span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'groq' ? 'gsk_... or configured in backend .env' : 'sk-... or in backend .env'}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-charcoal-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Prompt Viewer Toggle */}
          <div className="border-t border-charcoal-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>8-Layer Prompt Architecture</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Inspect the system instructions enforcing zero-invention and null safety
                </div>
              </div>
              <button
                onClick={() => setViewPrompt(!viewPrompt)}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs text-slate-300 font-medium"
              >
                {viewPrompt ? 'Hide Prompt' : 'View Prompt'}
              </button>
            </div>

            {viewPrompt && (
              <pre className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {systemPrompt}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-800 bg-charcoal-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white font-semibold text-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
