import type { GovernmentType, GameOverReason, NationStatChanges } from '../types/game.js';

/**
 * Entropy modifiers per government type.
 * Applied at each era transition (not every day).
 * Era multiplier is applied externally.
 */
export const GOVERNMENT_EFFECTS: Record<GovernmentType, Partial<NationStatChanges>> = {
  undefined:   { power: -3, supply: -3, sanity: -2 },
  theocracy:   { power: -2, supply: -3, sanity: -4 },
  warlord:     { power: -1, supply: -5, sanity: -2 },
  bureaucracy: { power: -2, supply: -2, sanity: -2, tyranny: 3 },
  tribal:      { power: -3, supply: -2, sanity: -1 },
  fela:        { power: -5, supply: -4, sanity: -5, tyranny: 5 },
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
  theocracy:   '叙事力 ×1.15 | 理智衰减加速',
  warlord:     '政治杠杆 ×1.15 | 物资消耗加速',
  bureaucracy: '叙事力 +20 | 暴虐值缓慢增长',
  tribal:      '共享标签时 PL+0.5 | 均衡衰减',
  fela:        '全面衰退——计分 ×0.7',
};

export const DEATH_REASON_LABELS: Record<GameOverReason, string> = {
  riot: '暴乱',
  starvation: '饥荒',
  insanity: '精神崩溃',
};

export const STAT_LABELS: Record<string, string> = {
  power: '权力',
  supply: '物资',
  sanity: '理智',
  tyranny: '暴虐',
  mythDensity: '神话浓度',
  population: '人口',
};

/** Affinity threshold to trigger government type change */
export const GOVERNMENT_AFFINITY_THRESHOLD = 50;
