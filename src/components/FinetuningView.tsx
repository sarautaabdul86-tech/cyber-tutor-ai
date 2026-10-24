import React, { useState } from 'react';
import { Database, Download, CheckCircle, AlertTriangle, Cpu, BookOpen, Layers, Terminal, Sparkles, Copy, Check } from 'lucide-react';

interface DatasetPair {
  id: string;
  system: string;
  user: string;
  assistant: string;
  domain: string;
}

const INITIAL_DATASET: DatasetPair[] = [
  {
    id: '1',
    domain: 'Scam Defense',
    system: 'You are CyberTutor AI in SCAM ANALYSIS MODE.',
    user: 'I got a text saying: "Bank Alert: $420 sent to Amazon. Reply with 6-digit code to cancel: https://fraud-fix.xyz"',
    assistant: 'THREAT LEVEL: [CRITICAL SCAM]\n- Claims & Tactics: False financial alarm, urgency, and OTP harvesting.\n- Warning Signs: Generic URL (fraud-fix.xyz), asks for 2FA code.\n- Immediate Action: Do NOT reply or visit the link. Block sender. Real banks never ask you to text your 2FA OTP.',
  },
  {
    id: '2',
    domain: 'TRACE Framework',
    system: 'You are CyberTutor AI in TRACE MODE.',
    user: 'How do I securely hash user passwords in Node.js?',
    assistant: 'T — TARGET: Securely hash and salt passwords before storing them in a database.\nR — REVIEW: Never use MD5/SHA256 for passwords. Use argon2 or bcrypt with high work factor.\nA — ARCHITECT: Install bcrypt, generate salt with cost factor 12+, store hash only.\nC — CARRY OUT:\n```js\nimport bcrypt from "bcrypt";\nconst hash = await bcrypt.hash(password, 12);\n```\nE — EVALUATE: Test verification using `bcrypt.compare`. Verify no plain passwords enter logs.',
  },
  {
    id: '3',
    domain: 'Hardware Diagnosis',
    system: 'You are CyberTutor AI in COMPUTER TROUBLESHOOTING MODE.',
    user: 'My laptop fan is screaming at 100% and the keyboard feels scorching hot.',
    assistant: 'Preliminary Diagnosis: Thermal throttling caused by blocked heatsink fins or dried thermal paste.\nSafe First Step: Check temperatures using a free diagnostic tool (e.g. HWMonitor on Windows, or `sensors` on Linux).\nSafe Cleaning: Use compressed air in short bursts into exhaust vents while powered off. ⚠️ Never spin fans at high speeds with compressed air without gently holding the blade, to prevent bearing or electrical damage.',
  },
  {
    id: '4',
    domain: 'Digital Literacy',
    system: 'You are CyberTutor AI.',
    user: 'What is the easiest way to make a master password that is uncrackable but easy to remember?',
    assistant: 'Use a Passphrase of 4 to 5 random, unrelated words (the Diceware method). Example: "apple-rocket-blanket-purple".\nWhy it works: Computers struggle with length (20+ characters is billions of years to brute force), while your human brain easily remembers word imagery.',
  },
];

export const FinetuningView: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetPair[]>(INITIAL_DATASET);
  const [activeTab, setActiveTab] = useState<'tradeoffs' | 'dataset' | 'lora_config'>('dataset');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states for adding new pair
  const [systemPrompt, setSystemPrompt] = useState('You are CyberTutor AI.');
  const [userPrompt, setUserPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [domainTag, setDomainTag] = useState('Cybersecurity');

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim() || !assistantResponse.trim()) return;

    const newPair: DatasetPair = {
      id: Date.now().toString(),
      system: systemPrompt,
      user: userPrompt,
      assistant: assistantResponse,
      domain: domainTag,
    };

    setDataset([newPair, ...dataset]);
    setUserPrompt('');
    setAssistantResponse('');
  };

  const handleDownloadJsonl = (type: 'train' | 'eval') => {
    // Standard OpenAI / Hugging Face chat completion format
    const lines = dataset.map(item =>
      JSON.stringify({
        messages: [
          { role: 'system', content: item.system },
          { role: 'user', content: item.user },
          { role: 'assistant', content: item.assistant },
        ],
      })
    );

    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybertutor_gemma4_${type}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loraScript = `# Gemma 4 LoRA Fine-Tuning Script using Hugging Face TRL & PEFT
import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

MODEL_ID = "google/gemma-4-31b-it" # Or gemma-4-4b-it for consumer GPUs

# 1. 4-bit Quantization Config (QLoRA)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=bnb_config,
    device_map="auto"
)

# 2. LoRA Adapter Configuration
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# 3. Load Verified CyberTutor JSONL Dataset
dataset = load_dataset("json", data_files={"train": "cybertutor_gemma4_train.jsonl"})

# 4. Supervised Fine-Tuning Trainer
training_args = SFTConfig(
    output_dir="./gemma4-cybertutor-adapter",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=False,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch"
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    peft_config=peft_config,
    args=training_args,
)

trainer.train()
trainer.model.save_pretrained("./gemma4-cybertutor-adapter")
print(">> LoRA Fine-Tuning Complete! Adapter saved.")`;

  const copyScript = () => {
    navigator.clipboard.writeText(loraScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Gemma 4 Fine-Tuning Studio
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Dataset Engineering & LoRA Training</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Learn how open-weight models like Gemma 4 are adapted. Build high-quality conversational JSONL datasets, inspect LoRA/QLoRA parameters, and understand architectural trade-offs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadJsonl('train')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export train.jsonl ({dataset.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('dataset')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'dataset' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          JSONL Dataset Builder ({dataset.length})
        </button>

        <button
          onClick={() => setActiveTab('tradeoffs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'tradeoffs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Prompting vs RAG vs Fine-Tuning
        </button>

        <button
          onClick={() => setActiveTab('lora_config')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'lora_config' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          LoRA / QLoRA Training Script
        </button>
      </div>

      {activeTab === 'dataset' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add form */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleAddPair} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Add Supervised Training Sample</span>
                <span className="text-[11px] text-slate-400 font-mono">ChatML / JSONL</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Domain Tag:</label>
                <select
                  value={domainTag}
                  onChange={e => setDomainTag(e.target.value)}
                  className="w-full bg-slate-950 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-200"
                >
                  <option value="Scam Defense">Scam Defense</option>
                  <option value="Cybersecurity">Cybersecurity & Networks</option>
                  <option value="Hardware Diagnosis">Hardware Diagnosis</option>
                  <option value="TRACE Framework">TRACE Framework</option>
                  <option value="Digital Literacy">Digital Literacy</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">User Prompt (Input):</label>
                <textarea
                  value={userPrompt}
                  onChange={e => setUserPrompt(e.target.value)}
                  placeholder="e.g. 'How does phishing work?' or realistic suspicious text..."
                  rows={3}
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-xl border border-slate-800 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 text-slate-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Assistant Response:</label>
                <textarea
                  value={assistantResponse}
                  onChange={e => setAssistantResponse(e.target.value)}
                  placeholder="The ideal, high-quality response demonstrating correct formatting and defensive reasoning..."
                  rows={4}
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-xl border border-slate-800 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 text-slate-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!userPrompt.trim() || !assistantResponse.trim()}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm"
              >
                + Add Verified Training Pair
              </button>
            </form>

            {/* Quality Checklist */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block mb-1">
                Dataset Quality Safeguards:
              </span>
              {[
                'Zero sensitive credentials, real OTPs, or API keys in records.',
                'Diverse phrasing to prevent repetitive overfitting.',
                'Distinct separation into 80% train and 20% evaluation splits.',
                'Formatted cleanly into standard messages [{"role": "..."}].',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset list */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Current Instruction Dataset ({dataset.length} examples)
              </span>
              <span className="text-[11px] text-indigo-400 font-mono">Ready for Gemma 4 SFT</span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {dataset.map(item => (
                <div key={item.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-semibold">
                      {item.domain}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">ID: #{item.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">User Input:</span>
                    <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                      {item.user}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Target Tutor Output:</span>
                    <p className="text-xs text-emerald-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 whitespace-pre-wrap font-mono text-[11px]">
                      {item.assistant}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tradeoffs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-sm">System Prompting</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instructing the model at inference time with behavioral instructions, safety boundaries, and personas.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <p><strong className="text-emerald-400">Best For:</strong> Tone adjustments, persona rules, formatting constraints.</p>
              <p><strong className="text-amber-400">Cost/Setup:</strong> Zero training cost, immediate updates.</p>
              <p><strong className="text-red-400">Limitation:</strong> Limited by context window size; can forget rules in long chats.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-sm">RAG (Retrieval)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Injecting relevant documents, real-time manuals, CVE databases, or live articles into the prompt before generating.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <p><strong className="text-emerald-400">Best For:</strong> Dynamic knowledge, recent scam alerts, proprietary documentation.</p>
              <p><strong className="text-amber-400">Cost/Setup:</strong> Vector database setup, fast retrieval.</p>
              <p><strong className="text-red-400">Limitation:</strong> Doesn't change reasoning style, only injects text passages.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-indigo-500/40 bg-indigo-950/10 p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-sm">LoRA Fine-Tuning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adapting model weights via low-rank parameter matrices to internalize structured outputs (like TRACE) and domain reasoning.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <p><strong className="text-emerald-400">Best For:</strong> Deep structural adherence, custom dialects, specialized tasks.</p>
              <p><strong className="text-amber-400">Cost/Setup:</strong> Requires GPU (T4/A10G/A100) and curated JSONL dataset.</p>
              <p><strong className="text-red-400">Limitation:</strong> Not ideal for rapidly changing facts; requires training runs.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lora_config' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Reproducible LoRA Training Recipe for Gemma 4</h3>
              <p className="text-xs text-slate-400">Using Python, PyTorch, Hugging Face TRL, and bitsandbytes 4-bit QLoRA.</p>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Script Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Training Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800 select-all">
            <code>{loraScript}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
