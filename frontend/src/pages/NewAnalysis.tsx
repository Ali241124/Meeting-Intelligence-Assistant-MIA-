import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Users, 
  Calendar, 
  Tag, 
  X,
  Play
} from 'lucide-react';
import { Scenario, AnalyzeResponse } from '../types';
import { analyzeTranscript } from '../services/api';

interface NewAnalysisProps {
  scenarios: Scenario[];
  onAnalysisSuccess: (result: AnalyzeResponse, rawInput: { title?: string; transcript: string }) => void;
  provider: string;
  model: string;
  apiKey: string;
}

export const NewAnalysis: React.FC<NewAnalysisProps> = ({
  scenarios,
  onAnalysisSuccess,
  provider,
  model,
  apiKey,
}) => {
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<number | null>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Progressive loading states (Screen 2 Requirement)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingStages = [
    'Reading meeting transcript...',
    'Identifying decisions and commitments...',
    'Extracting owners and deadlines...',
    'Validating structured output with Pydantic...',
  ];

  // Load initial Scenario 1 text by default
  React.useEffect(() => {
    if (scenarios.length > 0 && !transcript) {
      loadScenario(scenarios[0]);
    }
  }, [scenarios]);

  const loadScenario = (sc: Scenario) => {
    setActiveScenarioId(sc.id);
    setTitle(sc.title);
    setTranscript(sc.transcript);
    setParticipantsInput(sc.participants.join(', '));
    setUploadedFileName(null);
    setErrorMsg(null);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTranscript(text);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setUploadedFileName(file.name);
      setActiveScenarioId(null);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please ensure it is a text-based file (.txt, .md, .json, .csv).');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setErrorMsg('Meeting transcript cannot be empty.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setLoadingStage(0);

    // Progress interval for the 4 stages
    const stageTimer = setInterval(() => {
      setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 650);

    try {
      const participants = participantsInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const response = await analyzeTranscript({
        transcript: transcript.trim(),
        meeting_title: title.trim() || undefined,
        meeting_date: meetingDate || undefined,
        participants: participants.length > 0 ? participants : undefined,
        provider,
        model,
        api_key: apiKey.trim() || undefined,
      });

      clearInterval(stageTimer);
      onAnalysisSuccess(response, { title, transcript });
    } catch (err: any) {
      clearInterval(stageTimer);
      setErrorMsg(err.message || 'An error occurred during analysis.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Scenario Presets Pill Bar (Screen 2 Requirement C) */}
      <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Test Scenarios (MoinSystems Scenario Pack)</span>
          <span className="text-[11px] text-slate-500">1-click to test ordinary extraction, conflicts, missing data & injection</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => loadScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenarioId === sc.id
                  ? 'bg-charcoal-700 text-white border border-charcoal-600 shadow-sm'
                  : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 hover:bg-charcoal-800 border border-charcoal-800'
              }`}
            >
              <span className="text-slate-400 mr-1.5 font-bold">#{sc.id}</span>
              <span>{sc.title}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setActiveScenarioId(null);
              setTranscript('');
              setTitle('');
              setParticipantsInput('');
              setUploadedFileName(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeScenarioId === null && !uploadedFileName
                ? 'bg-charcoal-700 text-white border border-charcoal-600'
                : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-800'
            }`}
          >
            Custom Blank
          </button>
        </div>
      </div>

      {/* Main Analysis Input Box */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-6 shadow-xl">
        {/* A. Meeting Information (Screen 2 Requirement A) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Meeting Title (Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Roadmap Review"
              className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-charcoal-600 focus:ring-1 focus:ring-charcoal-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Meeting Date (Optional)</span>
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-charcoal-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Participants (Comma separated)</span>
            </label>
            <input
              type="text"
              value={participantsInput}
              onChange={(e) => setParticipantsInput(e.target.value)}
              placeholder="Sarah, Ahmed, Maria, Lina..."
              className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-charcoal-600"
            />
          </div>
        </div>

        {/* Drag-and-drop document upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-charcoal-800 hover:border-charcoal-700 bg-charcoal-950/60 rounded-xl p-4 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv,.log"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 group-hover:text-slate-200">
            <Upload className="w-4 h-4 text-slate-400 group-hover:text-brand-emerald transition-colors" />
            <span>Drop a meeting notes file here or click to upload (<span className="text-slate-500">.txt, .md, .json, .csv</span>)</span>
          </div>
          {uploadedFileName && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-xs text-emerald-400 font-medium">
              <FileText className="w-3.5 h-3.5" />
              <span>Loaded: {uploadedFileName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFileName(null);
                  setTranscript('');
                }}
                className="hover:text-rose-400 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* B. Transcript Input Area (Screen 2 Requirement B) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Meeting Transcript / Notes (Required)</label>
            <span className="text-slate-500">{transcript.length.toLocaleString()} characters</span>
          </div>

          <textarea
            rows={12}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here... Example: Sarah: We need to finish the checkout process by Wednesday. Ahmed: I will complete it by Wednesday evening. Maria: Product descriptions are still incomplete..."
            className="w-full p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs font-mono leading-relaxed text-slate-200 placeholder-slate-600 focus:outline-none focus:border-charcoal-600 focus:ring-1 focus:ring-charcoal-600 resize-y"
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button & Loading Stages (Screen 2 Requirement D) */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Using model <code className="text-slate-400 bg-charcoal-950 px-1 py-0.5 rounded">{model}</code> via <span className="capitalize text-slate-300 font-medium">{provider}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !transcript.trim()}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-emerald-950"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Analyze Meeting</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progressive Loading Indicators (Screen 2 Requirement) */}
        {isAnalyzing && (
          <div className="p-5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Analysis in progress</span>
              <span>Stage {loadingStage + 1} of 4</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-charcoal-800 overflow-hidden">
              <div 
                className="h-full bg-brand-emerald transition-all duration-500 rounded-full"
                style={{ width: `${((loadingStage + 1) / 4) * 100}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              {loadingStages.map((stage, idx) => {
                const isDone = idx < loadingStage;
                const isCurrent = idx === loadingStage;
                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-white font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
