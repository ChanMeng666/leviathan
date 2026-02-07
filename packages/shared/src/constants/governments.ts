import type { GovernmentType, GameOverReason, NationStatChanges } from '../types/game.js';

/**
 * Daily entropy modifiers per government type.
 * These replace the flat -5/-5/-2 entropy with government-specific rates.
 * More negative = faster decay. Values represent daily stat changes.
 */
export const GOVERNMENT_EFFECTS: Record<GovernmentType, Partial<NationStatChanges>> = {
  undefined:   { narrative_integrity: -5, supply_level: -5, violence_authority: -2 },
  theocracy:   { narrative_integrity: -3, supply_level: -5, violence_authority: -2, sanity: -3 },
  warlord:     { narrative_integrity: -7, supply_level: -7, violence_authority: -1 },
  bureaucracy: { narrative_integrity: -4, supply_level: -3, violence_authority: -2, corruption: 3 },
  tribal:      { narrative_integrity: -5, supply_level: -4, violence_authority: -3, sanity: -1 },
  fela:        { narrative_integrity: -8, supply_level: -3, violence_authority: -4 },
};

export const GOVERNMENT_LABELS: Record<GovernmentType, string> = {
  undefined:   '未定义的武装集团',
  theocracy:   '神权国家',
  warlord:     '军阀政权',
  bureaucracy: '官僚体制',
  tribal:      '部落联盟',
  fela:        '费拉不堪',
};

export const GOVERNMENT_DESCRIPTIONS: Record<GovernmentType, string> = {
  undefined:   '尚未形成明确的政体',
  theocracy:   '叙事衰减缓慢，但理智加速流失',
  warlord:     '军事强势，但资源和叙事快速消耗',
  bureaucracy: '稳定但腐败不断滋生',
  tribal:      '韧性强但发展受限',
  fela:        '全面衰退——一切都在加速崩溃',
};

export const DEATH_REASON_LABELS: Record<GameOverReason, string> = {
  riot: '暴乱',
  starvation: '饥荒',
  madness: '叙事过载',
  insanity: '精神崩溃',
};

export const STAT_LABELS: Record<string, string> = {
  narrative_integrity: '叙事完整度',
  violence_authority: '暴力权威',
  supply_level: '给养储备',
  sanity: '理智度',
  cruelty: '残暴值',
  corruption: '腐败值',
  population: '人口',
};

/** Affinity threshold to trigger government type change */
export const GOVERNMENT_AFFINITY_THRESHOLD = 50;
