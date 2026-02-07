import type { Consumable } from '../types/game.js';

export const CONSUMABLES: Consumable[] = [
  {
    id: 'consume_emergency_mobilization',
    name: '紧急动员令',
    description: '+1 纺织次数',
    cost: 2,
    effectType: 'extra_weave',
  },
  {
    id: 'consume_secret_trial',
    name: '秘密审判',
    description: '永久移除 1 张牌',
    cost: 1,
    effectType: 'remove_card',
  },
  {
    id: 'consume_amnesty',
    name: '大赦天下',
    description: '恢复 1 命',
    cost: 3,
    effectType: 'restore_life',
  },
  {
    id: 'consume_terror_broadcast',
    name: '恐怖广播',
    description: '下次纺织 ×2 政治杠杆',
    cost: 2,
    effectType: 'double_pl',
  },
];

/** Get consumables available in shop (random 2) */
export function getShopConsumables(): Consumable[] {
  const shuffled = [...CONSUMABLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
