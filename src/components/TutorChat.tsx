import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shield, Cpu, Globe, Code2, Lock, Terminal, RefreshCw, AlertCircle } from 'lucide-react';
import { ChatMessage, KnowledgeLevel } from '../types';
import { MarkdownView } from './MarkdownView';

interface TutorChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mode?: 'tutor' | 'trace') => void;
  isLoading: boolean;
  onClearChat: () => void;
}

const DOMAINS = [
  { id: 'scams', title: 'Scams & Phishing', icon: Shield, prompt: 'How do scammers trick people with urgent bank verification SMS messages?' },
  { id: 'cyber', title: 'Defensive Cyber & DNS', icon: Globe, prompt: 'Explain how DNS works and how DNS spoofing can redirect someone to a fake site.' },
  { id: 'hardware', title: 'Hardware & Diagnosis', icon: Cpu, prompt: 'How does RAM differ from SSD storage, and how do I know if my RAM is faulty?' },
  { id: 'software', title: 'Coding & APIs', icon: Code2, prompt: 'Teach me the basics of how web APIs exchange data using JSON.' },
  { id: 'privacy', title: 'Privacy & 2FA', icon: Lock, prompt: 'What is the safest way to set up Two-Factor Authentication (2FA) today?' },
];

export const TutorChat: React.FC<TutorChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
}) => {
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<KnowledgeLevel>('beginner');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Detect if user pasted code or error trace to suggest TRACE mode
    const isCodeOrError = input.includes('Traceback') || input.includes('Error:') || input.includes('function') || input.includes('const ') || input.includes('def ') || input.split('\n').length > 4;
    onSendMessage(input, isCodeOrError ? 'trace' : 'tutor');
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 py-3">
      {/* Top Bar: Knowledge Level & Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Your Level:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['beginner', 'intermediate', 'advanced'] as KnowledgeLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-2.5 py-1 rounded-md capitalize transition ${
                  level === lvl ? 'bg-emerald-600 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to CyberTutor AI</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Your patient, jargon-free guide to defensive cybersecurity, scam defense, computer hardware, and programming. Powered by Gemma 4.
            </p>

            {/* Quick starter topics */}
            <div className="w-full text-left">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Choose a topic to explore:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DOMAINS.map(domain => {
                  const Icon = domain.icon;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => onSendMessage(domain.prompt)}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition group shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1 group-hover:text-emerald-300">
                        <Icon className="w-4 h-4" />
                        <span>{domain.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{domain.prompt}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                {msg.role === 'assistant' ? (
                  <>
                    <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                      G4
                    </div>
                    <span className="font-semibold text-slate-300">CyberTutor</span>
                    {msg.mode === 'trace' && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px]">
                        TRACE Mode
                      </span>
                    )}
                    <span className="text-slate-400">{msg.model || 'Gemma 4'}</span>
                  </>
                ) : (
                  <span className="font-medium text-slate-400">You</span>
                )}
                <span className="text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-3xl rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <MarkdownView content={msg.content} />
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Gemma 4 is formulating a clear step-by-step explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-slate-800">
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/40 transition">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask anything (e.g. 'How does phishing work?', 'What is an IP address?')..."
            rows={2}
            className="w-full bg-transparent p-3 pr-24 text-xs text-white placeholder-slate-400 focus:outline-hidden resize-none"
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (input.trim()) onSendMessage(input, 'trace');
              }}
              title="Run structured TRACE mode on this input"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono hidden sm:inline">TRACE</span>
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-2">
          Defensive cybersecurity and educational tool. Never paste real passwords, PINs, or private API keys.
        </p>
      </form>
    </div>
  );
};
