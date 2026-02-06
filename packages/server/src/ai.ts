import type { LanguageModelV1 } from 'ai';

let _provider: LanguageModelV1 | null = null;
let _initialized = false;

export async function initAI(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    try {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const openai = createOpenAI({ apiKey: openaiKey });
      _provider = openai('gpt-4o-mini');
      console.log('[AI] Using OpenAI provider (gpt-4o-mini)');
    } catch (err) {
      console.warn('[AI] Failed to init OpenAI:', err);
    }
  } else if (anthropicKey) {
    try {
      // Dynamic import — only if @ai-sdk/anthropic is installed
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

export function getAIProvider(): LanguageModelV1 | null {
  return _provider;
}
