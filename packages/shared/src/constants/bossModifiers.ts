import type { BossModifier } from '../types/game.js';

export const BOSS_MODIFIERS: BossModifier[] = [
  {
    id: 'no_food_cards',
    name: '饥荒法令',
    description: '食物标签牌不贡献叙事力',
    effect: '食物 tag 牌 NF = 0',
  },
  {
    id: 'narrative_cap',
    name: '思想钳制',
    description: '所有牌叙事潜力上限 50',
    effect: '所有牌 narrative_potential 上限 50',
  },
  {
    id: 'no_combos',
    name: '叙事碎片化',
    description: '禁用合成配方检测',
    effect: '禁用 Combo',
  },
  {
    id: 'silence',
    name: '大沉默',
    description: '只有 1 次纺织机会',
    effect: '纺织次数 = 1',
  },
  {
    id: 'fela_decay',
    name: '费拉化衰减',
    description: '所有得分以费拉速率衰减 (×0.7)',
    effect: '最终 NF×PL × 0.7',
  },
];

export function getBossModifier(id: string): BossModifier | undefined {
  return BOSS_MODIFIERS.find((m) => m.id === id);
}
