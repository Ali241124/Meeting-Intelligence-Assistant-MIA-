import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { NewAnalysis } from './pages/NewAnalysis';
import { ResultsWorkspace } from './pages/ResultsWorkspace';
import { ScenariosView } from './components/ScenariosView';
import { ScorecardModal } from './components/ScorecardModal';
import { SettingsModal } from './components/SettingsModal';
import { Scenario, SessionAnalysisRecord, AnalyzeResponse, MeetingAnalysisResult } from './types';
import { getScenarios } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-analysis' | 'results' | 'scenarios'>('dashboard');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  // Active result state
  const [activeResult, setActiveResult] = useState<MeetingAnalysisResult | null>(null);
  const [activeMetadata, setActiveMetadata] = useState<any>(null);

  // Session history (Screen 1 Requirement)
  const [recentAnalyses, setRecentAnalyses] = useState<SessionAnalysisRecord[]>(() => {
    try {
      const saved = sessionStorage.getItem('mia_recent_analyses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings state persisted in localStorage
  const [provider, setProvider] = useState(() => localStorage.getItem('mia_provider') || 'groq');
  const [model, setModel] = useState(() => localStorage.getItem('mia_model') || 'qwen/qwen3.8-27b');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mia_api_key') || '');

  // Modals
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mia_provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('mia_model', model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem('mia_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    sessionStorage.setItem('mia_recent_analyses', JSON.stringify(recentAnalyses));
  }, [recentAnalyses]);

  // Load scenarios on mount
  useEffect(() => {
    getScenarios()
      .then(setScenarios)
      .catch((err) => console.error('Failed to load scenarios:', err));
  }, []);

  const handleAnalysisSuccess = (res: AnalyzeResponse, rawInput: { title?: string; transcript: string }) => {
    setActiveResult(res.data);
    setActiveMetadata(res.metadata);

    // Save record to session history
    const newRecord: SessionAnalysisRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: res.data.meeting_title || rawInput.title || 'Untitled Meeting',
      summary: res.data.summary,
      data: res.data,
      metadata: res.metadata,
    };

    setRecentAnalyses((prev) => [newRecord, ...prev.filter((r) => r.title !== newRecord.title)]);
    setCurrentView('results');
  };

  const handleOpenRecent = (record: SessionAnalysisRecord) => {
    setActiveResult(record.data);
    setActiveMetadata(record.metadata);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        recentAnalyses={recentAnalyses}
        onSelectRecent={handleOpenRecent}
        onOpenSettings={() => setIsSettingsOpen(true)}
        provider={provider}
        hasKey={Boolean(apiKey.trim())}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header
          currentView={currentView}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="p-6 flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              recentAnalyses={recentAnalyses}
              onStartNew={() => setCurrentView('new-analysis')}
              onOpenAnalysis={handleOpenRecent}
              onOpenAudit={() => setIsAuditOpen(true)}
            />
          )}

          {currentView === 'new-analysis' && (
            <NewAnalysis
              scenarios={scenarios}
              onAnalysisSuccess={handleAnalysisSuccess}
              provider={provider}
              model={model}
              apiKey={apiKey}
            />
          )}

          {currentView === 'results' && activeResult && (
            <ResultsWorkspace
              data={activeResult}
              metadata={activeMetadata || { mode: 'processed' }}
              onUpdateData={setActiveResult}
              onBackToNew={() => setCurrentView('new-analysis')}
            />
          )}

          {currentView === 'scenarios' && (
            <ScenariosView
              scenarios={scenarios}
              onSelectScenario={() => {
                setCurrentView('new-analysis');
              }}
            />
          )}
        </main>
      </div>

      {/* Audit Scorecard Modal */}
      <ScorecardModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        provider={provider}
        apiKey={apiKey}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        setProvider={setProvider}
        model={model}
        setModel={setModel}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
};

