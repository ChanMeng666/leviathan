import { Router } from 'express';
import type { EventFlavorRequest, EventFlavorResult } from '@leviathan/shared';
import { buildEventFlavorPrompt } from '../services/promptBuilder.js';
import { processMockEventFlavor } from '../services/comboEngine.js';
import { getAIProvider } from '../ai.js';

const router = Router();

router.post('/event-flavor', async (req, res) => {
  try {
    const body = req.body as EventFlavorRequest;
    if (!body.base_text || !body.government_type) {
      res.status(400).json({ error: 'base_text and government_type are required' });
      return;
    }

    const ai = getAIProvider();

    if (!ai) {
      const result = processMockEventFlavor(
        body.base_text,
        body.government_type,
        body.nation_name,
      );
      res.json(result);
      return;
    }

    const prompt = buildEventFlavorPrompt(body);
    const { generateText } = await import('ai');
    const { text } = await generateText({
      model: ai,
      prompt,
      temperature: 0.8,
      maxTokens: 400,
    });

    let result: EventFlavorResult;
    try {
      result = JSON.parse(text);
    } catch {
      result = processMockEventFlavor(body.base_text, body.government_type, body.nation_name);
    }

    res.json(result);
  } catch (err) {
    console.error('[/api/event-flavor] Error:', err);
    const body = req.body as EventFlavorRequest;
    res.json(processMockEventFlavor(body.base_text, body.government_type, body.nation_name));
  }
});

export default router;
