import { Router, Request, Response } from 'express';
import {
  generateCyberTutorResponse,
  getActiveProvider,
  setActiveProvider,
  runSmokeTest,
  CONFIG,
  ChatMessage
} from './aiService';

export const apiRouter = Router();

// Health & configuration status
apiRouter.get('/status', async (_req: Request, res: Response) => {
  const currentProvider = getActiveProvider();
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

  let ollamaReachable = false;
  try {
    const testRes = await fetch(`${CONFIG.ollamaEndpoint.replace(/\/+$/, '')}/api/tags`, {
      signal: AbortSignal.timeout(1500)
    });
    ollamaReachable = testRes.ok;
  } catch {
    ollamaReachable = false;
  }

  res.json({
    activeProvider: currentProvider,
    api: {
      configured: hasApiKey,
      model: CONFIG.apiModel,
      fallbackModel: CONFIG.apiFallbackModel
    },
    local: {
      endpoint: CONFIG.ollamaEndpoint,
      model: CONFIG.ollamaModel,
      reachable: ollamaReachable
    }
  });
});

// Switch active provider
apiRouter.post('/set-provider', (req: Request, res: Response) => {
  const { provider } = req.body;
  if (provider === 'api' || provider === 'local') {
    setActiveProvider(provider);
    return res.json({ success: true, activeProvider: getActiveProvider() });
  }
  return res.status(400).json({ error: 'Invalid provider. Must be "api" or "local".' });
});

// Chat & teaching requests
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, history, mode, providerOverride } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const chatHistory: ChatMessage[] = Array.isArray(history) ? history : [];
    const validMode = ['tutor', 'trace', 'scam', 'troubleshoot', 'finetune'].includes(mode) ? mode : 'tutor';

    const result = await generateCyberTutorResponse(prompt, chatHistory, {
      mode: validMode,
      providerOverride: providerOverride === 'api' || providerOverride === 'local' ? providerOverride : undefined
    });

    res.json(result);
  } catch (err: any) {
    console.error('[API /chat error]:', err);
    res.status(500).json({
      error: err.message || 'An error occurred while generating a response from CyberTutor AI.',
    });
  }
});

// Run smoke test endpoint
apiRouter.post('/smoke-test', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    const target = provider === 'api' || provider === 'local' ? provider : undefined;
    const result = await runSmokeTest(target);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      pass: false,
      error: err.message || 'Smoke test execution failed.',
    });
  }
});
