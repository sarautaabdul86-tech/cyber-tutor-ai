import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, Search, HelpCircle, ArrowRight, ExternalLink, Lock } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface ScamAnalyzerViewProps {
  onAnalyzeScam: (text: string) => Promise<string>;
}

const SCAM_PRESETS = [
  {
    title: 'Bank Urgency & OTP Theft (SMS)',
    preview: 'Chase Bank Alert: Unusual Zelle transfer of $950.00...',
    text: `CHASE ALERT: Did you approve a Zelle payment of $950.00 to Alex Miller? If NO, reply STOP and click https://chase-security-verify24.com/login to cancel immediately. Do not share your 6-digit OTP code with anyone except our fraud team.`
  },
  {
    title: 'Fake Remote Job / Equipment Check Scam',
    preview: 'Remote Data Entry: $45/hr + $2,000 equipment check...',
    text: `Congratulations! You have been accepted for the Remote Data Entry Assistant position at Global Tech Logistics Inc. Salary is $45/hour. We are sending an electronic check for $2,400 to your email. Deposit it into your bank account and immediately wire $1,900 via CashApp to our verified office supplier for your laptop.`
  },
  {
    title: 'Guaranteed Crypto / AI Trading Scam',
    preview: 'Guaranteed 500% ROI in 7 days via automated bot...',
    text: `Exclusive VIP invitation: Our patented quantum AI arbitrage algorithm guarantees 500% returns every 7 days with ZERO risk. Deposit 0.05 BTC to wallet address bc1q9x... to activate your automated compounding contract today. 100% money-back guarantee endorsed by Elon Musk.`
  },
  {
    title: 'Fake Delivery Notification (USPS / DHL)',
    preview: 'USPS: Package on hold due to wrong street address...',
    text: `USPS Delivery Notice: Your package US940550212398 cannot be delivered because the street number is missing. Please confirm your address and pay a $1.85 redelivery customs fee at https://usps-parcel-resolution.top/redeliver within 24 hours or package will be returned to sender.`
  },
];

export const ScamAnalyzerView: React.FC<ScamAnalyzerViewProps> = ({ onAnalyzeScam }) => {
  const [inputText, setInputText] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await onAnalyzeScam(inputText);
      setReport(result);
    } catch (err: any) {
      setReport(`Analysis error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Scam & Fraud Lab
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Threat Analysis & Phishing Detector</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Paste suspicious SMS messages, emails, URLs, job offers, or payment requests. Gemma 4 dissects the deception tactics, highlights red flags, and provides a safe protective action plan.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-400">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight">Zero-Knowledge Safety: Never enter real passwords or OTP codes.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Paste the Suspicious Text, Email, SMS, or Link:
            </label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste the exact message or URL you received..."
              rows={8}
              className="w-full bg-slate-950 text-xs p-3 rounded-xl border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-slate-200 resize-none leading-relaxed"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {inputText.length} characters
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Search className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Risk...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Analyze Threat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Realistic Examples */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Common Real-World Examples:
            </span>
            <div className="space-y-2">
              {SCAM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(preset.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition text-xs"
                >
                  <div className="flex items-center justify-between text-amber-300 font-semibold mb-0.5">
                    <span>{preset.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{preset.preview}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Output */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 min-h-[460px] flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white text-xs">Security Assessment & Action Plan</span>
              </div>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Analyzing social engineering tactics & domain structures...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Checking for false urgency, impersonation flags, spoofed domains, and credential harvesters.
                  </p>
                </div>
              ) : report ? (
                <MarkdownView content={report} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No scan performed yet.</p>
                  <p className="text-[11px] max-w-sm">
                    Paste a suspicious message or choose one of the real-world samples on the left to review the security breakdown.
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
