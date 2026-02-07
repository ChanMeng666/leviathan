import type { LanguageModelV1 } from 'ai';

let _provider: LanguageModelV1 | null = null;
let _initialized = false;
let _initPromise: Promise<void> | null = null;

async function _initAI(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    try {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const openai = createOpenAI({ apiKey: openaiKey });
      _provider = openai('gpt-4.1-mini-2025-04-14');
      console.log('[AI] Using OpenAI provider (gpt-4.1-mini-2025-04-14)');
    } catch (err) {
      console.warn('[AI] Failed to init OpenAI:', err);
    }
  } else if (anthropicKey) {
    try {
      // @ts-ignore - @ai-sdk/anthropic is an optional dependency
      const mod = await import('@ai-sdk/anthropic').catch(() => null);
      if (mod) {
        const anthropic = mod.createAnthropic({ apiKey: anthropicKey });
        _provider = anthropic('claude-sonnet-4-5-20250929');
        console.log('[AI] Using Anthropic provider (claude-sonnet-4-5)');
      }
    } catch (err) {
      console.warn('[AI] Failed to init Anthropic:', err);
    }
  }

  if (!_provider) {
    console.log('[AI] No API key configured — running in MOCK mode');
    console.log('[AI] Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env to enable AI');
  }
}

/** Lazy-initializes AI on first call. Safe to call multiple times. */
export async function getAIProvider(): Promise<LanguageModelV1 | null> {
  if (!_initPromise) {
    _initPromise = _initAI();
  }
  await _initPromise;
  return _provider;
}
