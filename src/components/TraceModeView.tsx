import React, { useState } from 'react';
import { Terminal, Play, Sparkles, CheckSquare, Layers, HelpCircle, Copy, Check } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface TraceModeViewProps {
  onExecuteTrace: (input: string) => Promise<string>;
}

const TEMPLATES = [
  {
    title: 'Debug Error / Stack Trace',
    snippet: `TypeError: Cannot read properties of undefined (reading 'split')
    at parseAuthHeader (auth.js:42:21)
    at verifyToken (middleware.js:15:9)
    at Layer.handle [as handle_request] (express/router/layer.js:95:5)`,
  },
  {
    title: 'Idea: Local Port Scanner (Defensive)',
    snippet: `I want to build a small Python tool that scans my home network router to check which ports (like 80, 443, 22) are open and explain what services run on them.`,
  },
  {
    title: 'Assignment: Explain DNS Cache Poisoning',
    snippet: `Explain DNS Cache Poisoning (Kaminsky attack style) in simple terms, show how attackers poison recursive resolvers, and describe how DNSSEC stops it.`,
  },
  {
    title: 'Fix Script: Automate Log File Backup',
    snippet: `Write a clean Bash script that looks in /var/log/nginx, compresses .log files older than 7 days into .tar.gz, deletes the originals, and logs the operation.`,
  },
];

export const TraceModeView: React.FC<TraceModeViewProps> = ({ onExecuteTrace }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const response = await onExecuteTrace(input);
      setOutput(response);
    } catch (err: any) {
      setOutput(`Error executing TRACE: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
                TRACE Framework
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Structured Engineering & Debugger</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Paste any technical idea, code, error message, or lab problem. CyberTutor AI uses Gemma 4 to formulate an authoritative 5-stage plan.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center shrink-0 w-full sm:w-auto">
            {[
              { letter: 'T', name: 'Target' },
              { letter: 'R', name: 'Review' },
              { letter: 'A', name: 'Architect' },
              { letter: 'C', name: 'Carry Out' },
              { letter: 'E', name: 'Evaluate' },
            ].map(stage => (
              <div key={stage.letter} className="px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-mono font-bold text-cyan-400 text-sm block">{stage.letter}</span>
                <span className="text-[10px] text-slate-400 block">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Paste Error, Code, Assignment, or Idea:
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste terminal output, python traceback, project goal, or hardware error here..."
              rows={8}
              className="w-full bg-slate-950 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 text-slate-200 resize-none leading-relaxed"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {input.length} characters
              </span>
              <button
                onClick={handleRun}
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute TRACE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Starter Templates */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              Sample Scenarios:
            </span>
            <div className="space-y-2">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(tmpl.snippet)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 transition text-xs"
                >
                  <span className="font-semibold text-cyan-300 block mb-0.5">{tmpl.title}</span>
                  <span className="text-slate-400 font-mono text-[11px] line-clamp-1">{tmpl.snippet}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output column */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 min-h-[460px] flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-xs">TRACE Output & Verification</span>
              </div>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Full Plan</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Deconstructing problem with Gemma 4...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Target, Review, Architect, Carry Out, and Evaluate stages are being assembled.
                  </p>
                </div>
              ) : output ? (
                <MarkdownView content={output} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No analysis generated yet.</p>
                  <p className="text-[11px] max-w-sm">
                    Select a sample scenario from the left or paste your code/error to get a complete, verifiable roadmap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
