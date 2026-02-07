import {
  SYSTEM_PROMPTS,
  WEAVE_FORMAT_PROMPT,
  EVENT_FLAVOR_PROMPT,
  JUDGE_FORMAT_PROMPT,
  HISTORY_BOOK_PROMPT,
  GOVERNMENT_LABELS,
  DEATH_REASON_LABELS,
} from '@leviathan/shared';
import type {
  PromptStyle,
  WeaveRequest,
  EventFlavorRequest,
  JudgeRequest,
  HistoryBookRequest,
  GovernmentType,
  GameOverReason,
} from '@leviathan/shared';

function nationContext(req: WeaveRequest): string {
  const s = req.nation_state;
  const govLabel = GOVERNMENT_LABELS[s.government_type as GovernmentType] || s.government_type;
  return `
当前国家状态：
- 国名: ${s.name}
- 政体: ${govLabel}
- 叙事完整度: ${s.narrative_integrity}/100
- 暴力权威: ${s.violence_authority}/100
- 给养储备: ${s.supply_level}/100
- 理智度: ${s.sanity}/100
- 残暴值: ${s.cruelty}/100
- 腐败值: ${s.corruption}/100
- 人口: ${s.population}
- 特质: ${s.traits.length > 0 ? s.traits.join(', ') : '无'}

历史记录（最近${req.history_context.length}条）：
${req.history_context.length > 0 ? req.history_context.map((h, i) => `${i + 1}. ${h}`).join('\n') : '（空白——一切尚未书写）'}`;
}

export function buildWeavePrompt(req: WeaveRequest, cardDescriptions: string): string {
  const system = SYSTEM_PROMPTS.propagandist;
  const context = nationContext(req);
  return `${system}\n\n${context}\n\n投入的素材卡片：\n${cardDescriptions}\n\n玩家的叙事意图：${req.intent}\n${WEAVE_FORMAT_PROMPT}`;
}

export function buildEventFlavorPrompt(req: EventFlavorRequest): string {
  const system = SYSTEM_PROMPTS.propagandist;
  const govLabel = GOVERNMENT_LABELS[req.government_type as GovernmentType] || req.government_type;
  return `${system}\n\n国家名称: ${req.nation_name}\n政体类型: ${govLabel}\n特质: ${req.traits.join(', ') || '无'}\n\n原始事件描述：\n${req.base_text}\n${EVENT_FLAVOR_PROMPT}`;
}

export function buildJudgePrompt(req: JudgeRequest): string {
  const system = SYSTEM_PROMPTS.historian;
  const history = req.history_log.length > 0
    ? req.history_log.map((h, i) => `${i + 1}. ${h}`).join('\n')
    : '（空白）';
  return `${system}\n\n已有历史记录：\n${history}\n\n新的叙事宣称：\n${req.new_claim}\n${JUDGE_FORMAT_PROMPT}`;
}

export function buildHistoryBookPrompt(req: HistoryBookRequest): string {
  const system = SYSTEM_PROMPTS.historian;
  const s = req.nation_state;
  const history = req.history_log.map((h, i) => `${i + 1}. ${h}`).join('\n');
  const govLabel = GOVERNMENT_LABELS[s.government_type as GovernmentType] || s.government_type;
  const deathLabel = DEATH_REASON_LABELS[req.death_reason as GameOverReason] || req.death_reason;
  return `${system}\n\n政治实体档案：
- 国名: ${s.name}
- 政体: ${govLabel}
- 特质: ${s.traits.join(', ') || '无'}
- 最终人口: ${s.population}
- 残暴值: ${s.cruelty}
- 腐败值: ${s.corruption}
- 存活天数: ${req.days_survived}
- 死因: ${deathLabel}

完整历史记录：
${history}\n${HISTORY_BOOK_PROMPT}`;
}

export function getStyleForRoute(route: 'weave' | 'event' | 'judge' | 'history'): PromptStyle {
  switch (route) {
    case 'weave': return 'propagandist';
    case 'event': return 'propagandist';
    case 'judge': return 'historian';
    case 'history': return 'historian';
  }
}
