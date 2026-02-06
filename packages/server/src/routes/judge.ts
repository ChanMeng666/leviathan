import { Router } from 'express';
import type { JudgeRequest, JudgeResult } from '@leviathan/shared';
import { buildJudgePrompt } from '../services/promptBuilder.js';
import { getAIProvider } from '../ai.js';

const router = Router();

router.post('/judge', async (req, res) => {
  try {
    const body = req.body as JudgeRequest;
    if (!body.new_claim) {
      res.status(400).json({ error: 'new_claim is required' });
      return;
    }

    const ai = getAIProvider();

    // Mock mode: always consistent (no AI to check)
    if (!ai) {
      const result: JudgeResult = {
        consistent: true,
        sanity_penalty: 0,
      };
      res.json(result);
      return;
    }

    const prompt = buildJudgePrompt(body);
    const { generateText } = await import('ai');
    const { text } = await generateText({
      model: ai,
      prompt,
      temperature: 0.3,
      maxTokens: 300,
    });

    let result: JudgeResult;
    try {
      result = JSON.parse(text);
    } catch {
      result = { consistent: true, sanity_penalty: 0 };
    }

    res.json(result);
  } catch (err) {
    console.error('[/api/judge] Error:', err);
    res.json({ consistent: true, sanity_penalty: 0 } satisfies JudgeResult);
  }
});

export default router;
