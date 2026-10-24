import React, { useState, useEffect } from 'react';
import { TutorMode, ChatMessage, ProviderStatus } from './types';
import { Navbar } from './components/Navbar';
import { TutorChat } from './components/TutorChat';
import { TraceModeView } from './components/TraceModeView';
import { ScamAnalyzerView } from './components/ScamAnalyzerView';
import { TroubleshootView } from './components/TroubleshootView';
import { FinetuningView } from './components/FinetuningView';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentMode, setCurrentMode] = useState<TutorMode>('tutor');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch initial system and provider status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch provider status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Send message in general chat
  const handleSendMessage = async (text: string, modeOverride?: 'tutor' | 'trace') => {
    if (!text.trim() || isLoading) return;

    setGlobalError(null);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const activeMode = modeOverride || (currentMode === 'trace' ? 'trace' : 'tutor');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
        provider: data.provider,
        model: data.model,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setGlobalError(err.message || 'Failed to generate response.');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Service Error:** ${err.message}\n\nPlease check your configuration in Settings (top right) or verify your API key or local Ollama service.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated execution helper for specific modes (TRACE, Scam, Troubleshoot)
  const executeModePrompt = async (prompt: string, mode: TutorMode): Promise<string> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        history: [],
        mode,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  };

  // Switch active provider
  const handleSwitchProvider = async (provider: 'api' | 'local') => {
    try {
      const res = await fetch('/api/set-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error('Failed to switch provider:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        status={status}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentMode === 'tutor' && (
          <TutorChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onClearChat={() => setMessages([])}
          />
        )}

        {currentMode === 'trace' && (
          <TraceModeView
            onExecuteTrace={input => executeModePrompt(input, 'trace')}
          />
        )}

        {currentMode === 'scam' && (
          <ScamAnalyzerView
            onAnalyzeScam={input => executeModePrompt(input, 'scam')}
          />
        )}

        {currentMode === 'troubleshoot' && (
          <TroubleshootView
            onTroubleshoot={input => executeModePrompt(input, 'troubleshoot')}
          />
        )}

        {currentMode === 'finetune' && (
          <FinetuningView />
        )}
      </main>

      {/* Settings & Smoke Test Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={status}
        onSwitchProvider={handleSwitchProvider}
        onRefreshStatus={fetchStatus}
      />
    </div>
  );
}
