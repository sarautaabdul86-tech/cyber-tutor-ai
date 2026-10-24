import React from 'react';
import { Shield, Sparkles, Terminal, AlertTriangle, Wrench, Database, Settings } from 'lucide-react';
import { TutorMode, ProviderStatus } from '../types';

interface NavbarProps {
  currentMode: TutorMode;
  onSelectMode: (mode: TutorMode) => void;
  status: ProviderStatus | null;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  status,
  onOpenSettings,
}) => {
  const isApi = status?.activeProvider === 'api';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">CyberTutor</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Gemma 4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Defensive Security • Hardware • Digital Literacy</p>
            </div>
          </div>

          {/* Navigation Modes */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectMode('tutor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'tutor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tutor Chat
            </button>

            <button
              onClick={() => onSelectMode('trace')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'trace'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              TRACE Mode
            </button>

            <button
              onClick={() => onSelectMode('scam')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'scam'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Scam Lab
            </button>

            <button
              onClick={() => onSelectMode('troubleshoot')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'troubleshoot'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              System Doctor
            </button>

            <button
              onClick={() => onSelectMode('finetune')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'finetune'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Fine-Tuning
            </button>
          </nav>

          {/* Right Action: Provider Status & Settings */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition text-slate-300"
              title="Click to switch provider or run live smoke test"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isApi
                    ? status?.api.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    : status?.local.reachable ? 'bg-cyan-400' : 'bg-red-400'
                }`}
              />
              <span className="font-medium hidden sm:inline">
                {isApi ? 'Gemini API' : 'Local Ollama'}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {isApi ? 'gemma-4-31b-it' : 'gemma4:e2b'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'tutor', label: 'Tutor', icon: Sparkles },
            { id: 'trace', label: 'TRACE', icon: Terminal },
            { id: 'scam', label: 'Scams', icon: AlertTriangle },
            { id: 'troubleshoot', label: 'Doctor', icon: Wrench },
            { id: 'finetune', label: 'Fine-Tune', icon: Database },
          ].map(item => {
            const Icon = item.icon;
            const active = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id as TutorMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                  active ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
