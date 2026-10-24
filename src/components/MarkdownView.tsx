import React, { useState } from 'react';
import { Copy, Check, Terminal, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-slate-200 text-sm leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() : '';
          const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3).trim() : part.slice(3, -3).trim();

          const isCopied = copiedIndex === index;

          return (
            <div key={index} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 my-3 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang || 'command / code'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(code, index)}
                  className="flex items-center gap-1 text-[11px] hover:text-emerald-400 text-slate-400 px-2 py-0.5 rounded transition bg-slate-800/80 hover:bg-slate-800"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto font-mono text-xs text-emerald-300 leading-normal select-all">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render standard text with simple markdown features
        return (
          <div key={index} className="space-y-2">
            {part.split('\n\n').map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base font-semibold text-emerald-400 mt-4 mb-1">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={pIdx} className="text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={pIdx} className="text-xl font-extrabold text-white mt-6 mb-2">
                    {trimmed.replace('# ', '')}
                  </h1>
                );
              }

              // Special callouts for Warnings or TRACE steps
              if (trimmed.includes('⚠️ WARNING') || trimmed.includes('[CRITICAL SCAM]') || trimmed.includes('[HIGH RISK]')) {
                return (
                  <div key={pIdx} className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-2.5 my-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="text-xs leading-relaxed">{renderInlineFormatting(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.includes('✅') || trimmed.includes('[SAFE]') || trimmed.includes('PASS')) {
                return (
                  <div key={pIdx} className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 flex items-start gap-2.5 my-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="text-xs leading-relaxed">{renderInlineFormatting(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.startsWith('T — TARGET:') || trimmed.startsWith('R — REVIEW:') || trimmed.startsWith('A — ARCHITECT:') || trimmed.startsWith('C — CARRY OUT:') || trimmed.startsWith('E — EVALUATE:')) {
                const [letter, ...rest] = trimmed.split(':');
                return (
                  <div key={pIdx} className="p-3 rounded-xl border border-slate-700/80 bg-slate-900/60 my-2">
                    <div className="font-bold text-emerald-400 text-xs mb-1 uppercase tracking-wide">
                      {letter}
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed">
                      {renderInlineFormatting(rest.join(':').trim())}
                    </div>
                  </div>
                );
              }

              // Bullet points
              const lines = trimmed.split('\n');
              const isList = lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim()));

              if (isList) {
                return (
                  <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
                    {lines.map((line, lIdx) => {
                      const cleanLine = line.replace(/^[-*]\s+|\d+\.\s+/, '');
                      return (
                        <li key={lIdx} className="flex items-start gap-2 text-slate-300 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{renderInlineFormatting(cleanLine)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="text-slate-300 text-xs leading-relaxed">
                  {renderInlineFormatting(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function renderInlineFormatting(text: string) {
  // Format bold **text** and inline `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
