export type TutorMode = 'tutor' | 'trace' | 'scam' | 'troubleshoot' | 'finetune';

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: TutorMode;
  provider?: string;
  model?: string;
}

export interface ProviderStatus {
  activeProvider: 'api' | 'local';
  api: {
    configured: boolean;
    model: string;
    fallbackModel: string;
  };
  local: {
    endpoint: string;
    model: string;
    reachable: boolean;
  };
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

export interface KnowledgeDomain {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: string[];
}
