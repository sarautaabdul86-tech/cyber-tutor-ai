import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerationOptions {
  mode?: 'tutor' | 'trace' | 'scam' | 'troubleshoot' | 'finetune';
  providerOverride?: 'api' | 'local';
}

export interface SmokeTestResult {
  pass: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  sampleInput: string;
  sampleOutput: string;
  timestamp: string;
  error?: string;
}

// Runtime provider state (default from env or 'api')
let activeProvider: 'api' | 'local' = (process.env.PROVIDER?.toLowerCase() === 'local') ? 'local' : 'api';

export function getActiveProvider(): 'api' | 'local' {
  return activeProvider;
}

export function setActiveProvider(provider: 'api' | 'local') {
  activeProvider = provider;
}

export const CONFIG = {
  apiModel: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  apiAlternateModel: 'gemma-4-31b-it',
  apiFallbackModel: 'gemini-3.8-flash',
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'gemma4:e2b',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  tutor: `You are CyberTutor AI — an intelligent, patient, and practical cybersecurity, digital literacy, and computer science tutor powered by Gemma 4.
Your mission is to teach people from absolute beginner to advanced level, help them recognize online scams, understand computer hardware and software, solve technical problems, and turn ideas into working projects.

Guidelines:
1. Understand the user's goal and approximate knowledge level.
2. Explain concepts in clear, simple language without unnecessary jargon.
3. Break complex topics into manageable, progressive steps.
4. Provide realistic, copy-ready commands or code snippets when helpful.
5. Include small exercises or checkpoints to test understanding.
6. Support defensive cybersecurity, authorized learning, and safe computer maintenance. Refuse malicious assistance (e.g. credential theft or malware creation) and redirect to defensive protection.
7. If the user pastes an idea, error message, or technical problem, guide them through TRACE steps.`,

  trace: `You are CyberTutor AI operating in TRACE MODE.
Whenever a user pastes an idea, assignment, error message, code snippet, terminal log, or technical problem, you MUST structure your answer using the TRACE framework:

T — TARGET: State the clear, intended goal and what success looks like.
R — REVIEW: Examine the prerequisites, given information, constraints, and potential security/technical risks.
A — ARCHITECT: Design the solution with a high-level roadmap and modular steps.
C — CARRY OUT: Provide actionable, step-by-step instructions with clean, copy-ready code/commands and realistic expected outputs.
E — EVALUATE: Provide test steps, common pitfalls/errors to watch for, and a verification checklist.

Keep explanations crisp, beginner-friendly, and actionable.`,

  scam: `You are CyberTutor AI in SCAM ANALYSIS MODE.
Your task is to analyze suspicious messages, emails, URLs, job offers, investment pitches, payment requests, or screenshots.
Always organize your analysis:
1. THREAT LEVEL: Categorize as [SAFE], [CAUTION], [HIGH RISK], or [CRITICAL SCAM].
2. CLAIMS & TECHNIQUES: Identify what the sender is claiming and social engineering tactics used (urgency, fear, fake authority, too-good-to-be-true rewards, fake sender domains, OTP requests).
3. VERIFIED FACTS VS UNKNOWNS: Distinguish what can be verified from unknowns. Never claim a site/company is verified unless verified.
4. WARNING SIGNS (RED FLAGS): Bullet-point specific red flags in the user's input.
5. IMMEDIATE ACTION PLAN: Step-by-step protective instructions (do not click, block sender, report, secure account).
6. SAFETY RULE: Never ask the user for passwords, OTPs, recovery keys, or bank credentials.`,

  troubleshoot: `You are CyberTutor AI in COMPUTER TROUBLESHOOTING MODE.
Your goal is to diagnose computer hardware, operating system, and software issues safely.
Follow these principles:
1. IDENTIFY: Clarify the device, operating system, exact symptoms, and error messages.
2. SAFE DIAGNOSTICS: Recommend non-destructive checks first (e.g., viewing logs, checking temps, verifying cabling, status commands).
3. EXPLAIN EVERY STEP: Tell the user what each command does before they run it.
4. EXPLICIT WARNINGS: Highlight any command or action that changes permissions, deletes files, formats drives, or modifies BIOS/registry with a clear ⚠️ WARNING.
5. VERIFICATION: Give the expected output so the user knows if the issue is solved.`,

  finetune: `You are CyberTutor AI in GEMMA 4 FINE-TUNING & DATASET ADVISOR MODE.
You educate users on how open-weight language models like Gemma 4 are trained and fine-tuned:
1. Explain the distinction between System Prompting, Retrieval-Augmented Generation (RAG), Supervised Fine-Tuning (SFT), and Parameter-Efficient Fine-Tuning (LoRA / QLoRA).
2. Teach dataset design: formatted JSONL prompt/response pairs with clear instructional diversity, no duplicates, and no private data.
3. Detail hardware requirements, compute budgets, and evaluation benchmarks.
4. Provide concrete, copy-ready JSONL samples and training script examples (e.g. Hugging Face TRL, Unsloth, PyTorch).`
};

/**
 * Calls Gemma 4 via Google AI Studio / Gemini API SDK
 */
async function callGeminiApi(
  prompt: string,
  history: ChatMessage[],
  systemInstruction: string,
  modelName: string = CONFIG.apiModel
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Prepare contents array with conversation history
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const output = response.text;
    if (!output) {
      throw new Error('Received an empty response from Gemma 4 API.');
    }
    return output;
  } catch (err: any) {
    if (modelName === CONFIG.apiModel && CONFIG.apiAlternateModel) {
      console.warn(`[Gemma API] Model ${modelName} returned error: ${err.message}. Retrying with ${CONFIG.apiAlternateModel}...`);
      return callGeminiApi(prompt, history, systemInstruction, CONFIG.apiAlternateModel);
    } else if (modelName !== CONFIG.apiFallbackModel) {
      console.warn(`[Gemma API] Model ${modelName} returned error: ${err.message}. Retrying with ${CONFIG.apiFallbackModel}...`);
      return callGeminiApi(prompt, history, systemInstruction, CONFIG.apiFallbackModel);
    }
    throw err;
  }
}

/**
 * Calls local Gemma 4 via Ollama REST API
 */
async function callOllama(
  prompt: string,
  history: ChatMessage[],
  systemInstruction: string,
  endpoint: string = CONFIG.ollamaEndpoint,
  model: string = CONFIG.ollamaModel
): Promise<string> {
  const url = `${endpoint.replace(/\/+$/, '')}/api/chat`;

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: prompt }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for local models

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const output = data.message?.content || data.response;
    if (!output) {
      throw new Error('Ollama returned an empty response.');
    }
    return output;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Ollama request timed out after 60s at ${endpoint}. Ensure ${model} is loaded.`);
    }
    throw new Error(
      `Could not connect to Ollama at ${endpoint}. Make sure Ollama is running ('ollama serve') and model '${model}' is pulled ('ollama pull ${model}'). Details: ${err.message}`
    );
  }
}

/**
 * Unified generation entry point
 */
export async function generateCyberTutorResponse(
  prompt: string,
  history: ChatMessage[] = [],
  options: GenerationOptions = {}
): Promise<{ text: string; provider: string; model: string; mode: string }> {
  const provider = options.providerOverride || activeProvider;
  const mode = options.mode || 'tutor';
  const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.tutor;

  if (provider === 'local') {
    const text = await callOllama(prompt, history, systemInstruction);
    return {
      text,
      provider: 'local (Ollama)',
      model: CONFIG.ollamaModel,
      mode,
    };
  } else {
    const text = await callGeminiApi(prompt, history, systemInstruction, CONFIG.apiModel);
    return {
      text,
      provider: 'api (Gemini / Gemma 4)',
      model: CONFIG.apiModel,
      mode,
    };
  }
}

/**
 * Smoke test function: sends a realistic cybersecurity prompt and verifies output
 */
export async function runSmokeTest(providerOverride?: 'api' | 'local'): Promise<SmokeTestResult> {
  const targetProvider = providerOverride || activeProvider;
  const sampleInput = 'Explain how two-factor authentication (2FA) protects an account in 2 short bullet points, and mention one red flag of OTP fraud.';
  const startTime = Date.now();

  try {
    const result = await generateCyberTutorResponse(
      sampleInput,
      [],
      { mode: 'tutor', providerOverride: targetProvider }
    );
    const latencyMs = Date.now() - startTime;
    const output = result.text.trim();

    // Verification check: output must be non-trivial and contain relevant security terms
    const lower = output.toLowerCase();
    const pass = output.length > 40 && (
      lower.includes('factor') ||
      lower.includes('auth') ||
      lower.includes('password') ||
      lower.includes('code') ||
      lower.includes('otp') ||
      lower.includes('security')
    );

    return {
      pass,
      provider: result.provider,
      model: result.model,
      latencyMs,
      sampleInput,
      sampleOutput: output,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      pass: false,
      provider: targetProvider === 'local' ? 'local (Ollama)' : 'api (Gemini / Gemma 4)',
      model: targetProvider === 'local' ? CONFIG.ollamaModel : CONFIG.apiModel,
      latencyMs,
      sampleInput,
      sampleOutput: '',
      timestamp: new Date().toISOString(),
      error: err.message || String(err),
    };
  }
}
