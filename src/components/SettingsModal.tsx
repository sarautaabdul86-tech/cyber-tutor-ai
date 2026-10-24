import React, { useState } from 'react';
import { X, Server, Cloud, Play, CheckCircle, AlertCircle, RefreshCw, Terminal, Check, Copy } from 'lucide-react';
import { ProviderStatus, SmokeTestResult } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ProviderStatus | null;
  onSwitchProvider: (provider: 'api' | 'local') => Promise<void>;
  onRefreshStatus: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onSwitchProvider,
  onRefreshStatus,
}) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smokeTestResult, setSmokeTestResult] = useState<SmokeTestResult | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleProviderToggle = async (target: 'api' | 'local') => {
    setIsSwitching(true);
    try {
      await onSwitchProvider(target);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleRunSmokeTest = async () => {
    setIsTesting(true);
    setSmokeTestResult(null);
    try {
      const res = await fetch('/api/smoke-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: status?.activeProvider }),
      });
      const data = await res.json();
      setSmokeTestResult(data);
    } catch (err: any) {
      setSmokeTestResult({
        pass: false,
        provider: status?.activeProvider || 'unknown',
        model: 'unknown',
        latencyMs: 0,
        sampleInput: 'Explain 2FA and OTP fraud red flags',
        sampleOutput: '',
        timestamp: new Date().toISOString(),
        error: err.message || 'Network error running smoke test',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npm run smoke-test');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">System, Provider & Diagnostics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* Active Provider Selector */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
              Active AI Provider Engine:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* API Provider Card */}
              <button
                onClick={() => handleProviderToggle('api')}
                disabled={isSwitching}
                className={`p-4 rounded-xl border text-left transition relative ${
                  status?.activeProvider === 'api'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-sm'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <Cloud className="w-4 h-4" />
                    <span>Gemini API (Gemma 4)</span>
                  </div>
                  {status?.activeProvider === 'api' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Managed cloud execution with model <code className="text-emerald-300">{status?.api.model || 'gemma-4-31b-it'}</code>.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${status?.api.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{status?.api.configured ? 'API Key Detected' : 'No API key in env'}</span>
                </div>
              </button>

              {/* Local Ollama Provider Card */}
              <button
                onClick={() => handleProviderToggle('local')}
                disabled={isSwitching}
                className={`p-4 rounded-xl border text-left transition relative ${
                  status?.activeProvider === 'local'
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-sm'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                    <Server className="w-4 h-4" />
                    <span>Local Ollama Fallback</span>
                  </div>
                  {status?.activeProvider === 'local' && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Self-hosted endpoint <code className="text-cyan-300">{status?.local.endpoint}</code> with <code className="text-cyan-300">{status?.local.model}</code>.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${status?.local.reachable ? 'bg-cyan-400' : 'bg-red-400'}`} />
                  <span>{status?.local.reachable ? 'Ollama Online' : 'Ollama Offline / Unreachable'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Smoke Test Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  Automated Smoke Test Verification
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dispatches a realistic defensive cybersecurity prompt through the active provider to verify response validity.
                </p>
              </div>

              <button
                onClick={handleRunSmokeTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium transition text-xs shadow-sm shrink-0"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Test...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Live Smoke Test</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Results Display */}
            {smokeTestResult && (
              <div className={`p-3.5 rounded-xl border mt-3 space-y-2 ${
                smokeTestResult.pass
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/20 border-red-500/40 text-red-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {smokeTestResult.pass ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>SMOKE TEST RESULT: {smokeTestResult.pass ? 'PASS' : 'FAIL'}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    Latency: {smokeTestResult.latencyMs}ms
                  </span>
                </div>

                <div className="text-[11px] space-y-1">
                  <p><strong className="text-white">Provider:</strong> {smokeTestResult.provider} ({smokeTestResult.model})</p>
                  <p><strong className="text-white">Sample Input:</strong> "{smokeTestResult.sampleInput}"</p>
                  {smokeTestResult.error ? (
                    <p className="text-red-400"><strong className="text-white">Error:</strong> {smokeTestResult.error}</p>
                  ) : (
                    <div>
                      <strong className="text-white">Sample Output Verified:</strong>
                      <p className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono line-clamp-3">
                        {smokeTestResult.sampleOutput}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Terminal Command Snippet */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-white font-medium block">Run via Terminal:</span>
                <code className="text-emerald-400 font-mono text-[11px]">npm run smoke-test</code>
              </div>
            </div>
            <button
              onClick={copyCliCommand}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Copy terminal command"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <button
            onClick={onRefreshStatus}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
