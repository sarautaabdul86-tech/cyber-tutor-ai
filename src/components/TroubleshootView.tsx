import React, { useState } from 'react';
import { Wrench, Monitor, Cpu, HardDrive, Wifi, AlertTriangle, ShieldCheck, Play, Sparkles } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface TroubleshootViewProps {
  onTroubleshoot: (prompt: string) => Promise<string>;
}

const DEVICES = ['Desktop PC', 'Laptop', 'Home Server / NAS', 'Raspberry Pi'];
const OPERATING_SYSTEMS = ['Windows 11 / 10', 'Linux (Ubuntu/Debian)', 'Linux (Arch/Fedora)', 'macOS'];

const COMMON_SYMPTOMS = [
  {
    icon: Cpu,
    title: 'Overheating & Jet-Engine Fans',
    desc: 'CPU reaches 90°C+, thermal throttling, fan constantly at 100%, sudden power-off under load.',
  },
  {
    icon: Monitor,
    title: 'PC Turns On, but Black Screen (No POST)',
    desc: 'Fans spin and motherboard LEDs light up, but no signal on monitor, no BIOS splash screen.',
  },
  {
    icon: AlertTriangle,
    title: 'Random Crash / Blue Screen (BSOD)',
    desc: 'System freezes randomly or crashes with MEMORY_MANAGEMENT or CRITICAL_PROCESS_DIED.',
  },
  {
    icon: Wifi,
    title: 'Connected to Wi-Fi, but No Internet / DNS Failure',
    desc: 'Router says connected, ping 8.8.8.8 works, but browser reports ERR_NAME_NOT_RESOLVED.',
  },
  {
    icon: HardDrive,
    title: 'Disk 100% Full / SSD Not Detected in BIOS',
    desc: 'Root partition is 100% full, OS fails to boot or NVMe drive does not appear in boot order.',
  },
];

export const TroubleshootView: React.FC<TroubleshootViewProps> = ({ onTroubleshoot }) => {
  const [device, setDevice] = useState(DEVICES[0]);
  const [os, setOs] = useState(OPERATING_SYSTEMS[0]);
  const [symptom, setSymptom] = useState(COMMON_SYMPTOMS[0].desc);
  const [customSymptom, setCustomSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunDiagnosis = async () => {
    const activeSymptom = customSymptom.trim() || symptom;
    if (!activeSymptom || isLoading) return;

    setIsLoading(true);
    const prompt = `TROUBLESHOOTING REQUEST:
Device: ${device}
Operating System: ${os}
Symptom & Observed Behavior: ${activeSymptom}

Please provide:
1. Preliminary Root Cause Hypotheses (ranked most likely to least likely).
2. Safe, Non-Destructive Diagnostic Steps (with explicit commands and what output to check).
3. Least destructive fix first.
4. Clear WARNINGS for any step that could affect user data or system integrity.
5. Verification test to confirm the fix works.`;

    try {
      const result = await onTroubleshoot(prompt);
      setDiagnosis(result);
    } catch (err: any) {
      setDiagnosis(`Diagnosis error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Hardware & System Doctor
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Interactive Computer Troubleshooter</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step diagnostic wizard for computer hardware and operating system problems. Recommends safe, non-destructive checks first and warns before risky commands.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight">Safety-First Protocol: Non-destructive checks are always tested first.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Symptom selector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Device & OS */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">1. Device Type:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {DEVICES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                      device === d
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">2. Operating System:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {OPERATING_SYSTEMS.map(o => (
                  <button
                    key={o}
                    onClick={() => setOs(o)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                      os === o
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                3. Describe Symptom or Error Message:
              </label>
              <textarea
                value={customSymptom}
                onChange={e => setCustomSymptom(e.target.value)}
                placeholder="Or type your specific symptoms (e.g., 'Error 0x80070005 when updating', 'PC beeps 3 times on boot')..."
                rows={3}
                className="w-full bg-slate-950 text-xs p-3 rounded-xl border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 text-slate-200 resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleRunDiagnosis}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Diagnosing Hardware & Software...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Safe Diagnosis</span>
                </>
              )}
            </button>
          </div>

          {/* Common Presets */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Common Technical Faults:
            </span>
            <div className="space-y-2">
              {COMMON_SYMPTOMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSymptom(item.desc);
                      setCustomSymptom(item.desc);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition text-xs"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-0.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnosis Plan */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 min-h-[480px] flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white text-xs">Diagnostic Steps & Safe Fixes</span>
              </div>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                    <Wrench className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Assembling non-destructive diagnostic tree...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Structuring checks from physical inspections to kernel logs and command diagnostics.
                  </p>
                </div>
              ) : diagnosis ? (
                <MarkdownView content={diagnosis} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
                  <Cpu className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No active diagnosis.</p>
                  <p className="text-[11px] max-w-sm">
                    Select your device, OS, and symptoms on the left to receive a step-by-step diagnostic guide.
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
