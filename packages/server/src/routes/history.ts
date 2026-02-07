import { Router } from 'express';
import type { HistoryBookRequest, HistoryBookResult } from '@leviathan/shared';
import { buildHistoryBookPrompt } from '../services/promptBuilder.js';
import { processMockHistoryBook } from '../services/comboEngine.js';
import { getAIProvider } from '../ai.js';

const router = Router();

router.post('/history-book', async (req, res) => {
  try {
    const body = req.body as HistoryBookRequest;
    if (!body.history_log?.length) {
      res.status(400).json({ error: 'history_log is required' });
      return;
    }

    const ai = await getAIProvider();

    if (!ai) {
      const result = processMockHistoryBook(
        body.nation_state.name,
        body.death_reason,
        body.days_survived,
        body.nation_state.traits,
      );
      res.json(result);
      return;
    }

    const prompt = buildHistoryBookPrompt(body);
    const { generateText } = await import('ai');
    const { text } = await generateText({
      model: ai,
      prompt,
      temperature: 0.7,
      maxTokens: 600,
    });

    let result: HistoryBookResult;
    try {
      result = JSON.parse(text);
    } catch {
      result = processMockHistoryBook(
        body.nation_state.name,
        body.death_reason,
        body.days_survived,
        body.nation_state.traits,
      );
    }

    res.json(result);
  } catch (err) {
    console.error('[/api/history-book] Error:', err);
    const body = req.body as HistoryBookRequest;
    res.json(
      processMockHistoryBook(
        body.nation_state.name,
        body.death_reason,
        body.days_survived,
        body.nation_state.traits,
      ),
    );
  }
});

export default router;
