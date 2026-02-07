import { Router } from 'express';
import type { WeaveRequest, WeaveResult } from '@leviathan/shared';
import { getCardById } from '@leviathan/shared';
import { buildWeavePrompt } from '../services/promptBuilder.js';
import { processMockWeave } from '../services/comboEngine.js';
import { addEntry } from '../services/contextManager.js';
import { getAIProvider } from '../ai.js';

const router = Router();

router.post('/weave', async (req, res) => {
  try {
    const body = req.body as WeaveRequest;
    if (!body.card_ids?.length || !body.intent) {
      res.status(400).json({ error: 'card_ids and intent are required' });
      return;
    }

    const ai = await getAIProvider();

    // Mock mode
    if (!ai) {
      const result = processMockWeave(body);
      addEntry('default', {
        role: 'assistant',
        content: result.story_text,
        timestamp: Date.now(),
      });
      res.json(result);
      return;
    }

    // AI mode
    const cardDescriptions = body.card_ids
      .map((id) => {
        const c = getCardById(id);
        return c ? `- ${c.name} [${c.tags.join(',')}] (叙事潜力:${c.narrative_potential})` : `- (未知卡片: ${id})`;
      })
      .join('\n');

    const prompt = buildWeavePrompt(body, cardDescriptions);

    const { generateText } = await import('ai');
    const { text } = await generateText({
      model: ai,
      prompt,
      temperature: 0.9,
      maxTokens: 800,
    });

    let result: WeaveResult;
    try {
      result = JSON.parse(text);
    } catch {
      result = processMockWeave(body);
      result.comment = `[系统] AI返回了无法解析的内容，已使用本地规则引擎。原始回复片段: ${text.slice(0, 100)}`;
    }

    addEntry('default', {
      role: 'assistant',
      content: result.story_text,
      timestamp: Date.now(),
    });

    res.json(result);
  } catch (err) {
    console.error('[/api/weave] Error:', err);
    // Fallback to mock
    const result = processMockWeave(req.body as WeaveRequest);
    result.comment = `[系统] AI调用失败，已使用本地规则引擎。`;
    res.json(result);
  }
});

export default router;
