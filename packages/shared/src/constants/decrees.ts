import type { Decree } from '../types/game.js';

export const DECREES: Decree[] = [
  // === Common ===
  {
    id: 'decree_narrative_monopoly',
    name: '官方叙事垄断',
    description: '+20 叙事力',
    rarity: 'common',
    cost: 3,
    sellValue: 1,
    effectType: 'add_nf',
    effectValue: 20,
  },
  {
    id: 'decree_fear_tax',
    name: '恐惧税',
    description: '+1.0 政治杠杆',
    rarity: 'common',
    cost: 3,
    sellValue: 1,
    effectType: 'add_pl',
    effectValue: 1.0,
  },
  {
    id: 'decree_history_revision',
    name: '历史修正主义',
    description: '历史标签牌 +15 叙事力',
    rarity: 'common',
    cost: 4,
    sellValue: 1,
    effectType: 'conditional',
    effectValue: 15,
    condition: 'history_tag',
  },
  {
    id: 'decree_requisition',
    name: '物资征用令',
    description: '物理价值以 2:1 转换为叙事力',
    rarity: 'common',
    cost: 4,
    sellValue: 1,
    effectType: 'conditional',
    effectValue: 0, // calculated dynamically
    condition: 'physical_convert',
  },
  // === Rare ===
  {
    id: 'decree_absolute_obedience',
    name: '绝对服从',
    description: '×1.5 政治杠杆',
    rarity: 'rare',
    cost: 5,
    sellValue: 2,
    effectType: 'mult_pl',
    effectValue: 1.5,
  },
  {
    id: 'decree_info_control',
    name: '信息管制',
    description: '2+ 张牌时 +30 叙事力',
    rarity: 'rare',
    cost: 4,
    sellValue: 2,
    effectType: 'conditional',
    effectValue: 30,
    condition: 'two_plus_cards',
  },
  {
    id: 'decree_doublethink',
    name: '双重思想',
    description: '+50 叙事力，每次纺织 -10 理智',
    rarity: 'rare',
    cost: 5,
    sellValue: 2,
    effectType: 'add_nf',
    effectValue: 50,
  },
  {
    id: 'decree_permanent_revolution',
    name: '永久革命论',
    description: '×2.0 政治杠杆，每次纺织 -3 物资',
    rarity: 'rare',
    cost: 6,
    sellValue: 2,
    effectType: 'mult_pl',
    effectValue: 2.0,
  },
  {
    id: 'decree_scapegoat_mechanism',
    name: '替罪机制',
    description: '每个已清洗群体 ×1.3 政治杠杆',
    rarity: 'rare',
    cost: 5,
    sellValue: 2,
    effectType: 'conditional',
    effectValue: 1.3,
    condition: 'has_scapegoats',
  },
  // === Legendary ===
  {
    id: 'decree_mandate_of_heaven',
    name: '天命所归',
    description: '神权时 ×3.0 政治杠杆',
    rarity: 'legendary',
    cost: 7,
    sellValue: 3,
    effectType: 'conditional',
    effectValue: 3.0,
    condition: 'theocracy',
  },
  {
    id: 'decree_iron_curtain',
    name: '铁幕',
    description: '×2.5 政治杠杆, 每牌 +10 叙事力',
    rarity: 'legendary',
    cost: 7,
    sellValue: 3,
    effectType: 'mult_pl',
    effectValue: 2.5,
  },
  {
    id: 'decree_leviathan_heart',
    name: '利维坦之心',
    description: '每个神话 ×1.0 政治杠杆',
    rarity: 'legendary',
    cost: 8,
    sellValue: 3,
    effectType: 'conditional',
    effectValue: 1.0,
    condition: 'per_myth',
  },
];

export function getDecreeById(id: string): Decree | undefined {
  return DECREES.find((d) => d.id === id);
}

/** Get decrees available in shop at given era. Higher eras unlock rarer decrees. */
export function getShopDecrees(era: number, owned: string[]): Decree[] {
  const available = DECREES.filter((d) => {
    if (owned.includes(d.id)) return false;
    if (d.rarity === 'legendary' && era < 3) return false;
    if (d.rarity === 'rare' && era < 2) return false;
    return true;
  });

  // Shuffle and pick 3
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
