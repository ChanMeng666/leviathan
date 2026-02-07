import type { NarrativeIntent } from '../types/game.js';

export const INTENTS: NarrativeIntent[] = [
  {
    id: 'propaganda',
    name: '发动宣传攻势',
    base_nf: 15,
    base_pl: 1.5,
    risk: 1.0,
    minCards: 1,
    description: '最基础的叙事武器，稳定但平庸',
  },
  {
    id: 'forge_history',
    name: '伪造历史文献',
    base_nf: 20,
    base_pl: 2.0,
    risk: 1.2,
    minCards: 1,
    description: '篡改过去以服务现在',
  },
  {
    id: 'invent_hero',
    name: '发明民族英雄',
    base_nf: 25,
    base_pl: 2.5,
    risk: 1.5,
    minCards: 1,
    description: '虚构英雄凝聚人心',
  },
  {
    id: 'claim_legitimacy',
    name: '建立法统宣称',
    base_nf: 30,
    base_pl: 3.0,
    risk: 1.8,
    minCards: 2,
    description: '需要更多素材来编织法理',
  },
  {
    id: 'founding_myth',
    name: '编造建国神话',
    base_nf: 40,
    base_pl: 3.5,
    risk: 2.0,
    minCards: 2,
    description: '史诗级叙事工程',
  },
  {
    id: 'external_threat',
    name: '制造外部威胁',
    base_nf: 50,
    base_pl: 4.0,
    risk: 2.5,
    minCards: 2,
    description: '没有外敌？那就发明一个',
  },
  {
    id: 'deify_leader',
    name: '神化领袖',
    base_nf: 60,
    base_pl: 5.0,
    risk: 3.0,
    minCards: 3,
    description: '终极叙事——将凡人封神',
  },
];

/** Tag affinity groups — cards sharing the same group get bonuses */
export const TAG_AFFINITIES: Record<string, string[]> = {
  暴力: ['暴力', '武德', '恐惧', '边界', '权威'],
  信仰: ['信仰', '神话', '纯真', '圣物'],
  历史: ['历史', '残缺', '领土', '发明'],
  宣传: ['宣传', '噪音', '真理', '娱乐', '反射'],
  食物: ['食物', '腐烂', '外来'],
  官僚: ['官僚', '许可', '混乱', '知识', '脆弱'],
};

export function getIntentById(id: string): NarrativeIntent | undefined {
  return INTENTS.find((i) => i.id === id);
}

/** Count matching tags among cards based on TAG_AFFINITIES */
export function countTagMatches(cardTags: string[][]): { matchCount: number; allShareGroup: boolean } {
  let matchCount = 0;
  let allShareGroup = false;

  // Flatten all tags
  const allTags = cardTags.flat();

  // Check each affinity group
  for (const groupTags of Object.values(TAG_AFFINITIES)) {
    const matchesInGroup = allTags.filter((t) => groupTags.includes(t)).length;
    if (matchesInGroup > 0) matchCount += matchesInGroup;
  }

  // Check if all cards share at least one affinity group
  if (cardTags.length >= 2) {
    for (const groupTags of Object.values(TAG_AFFINITIES)) {
      const cardsInGroup = cardTags.filter((tags) => tags.some((t) => groupTags.includes(t)));
      if (cardsInGroup.length === cardTags.length) {
        allShareGroup = true;
        break;
      }
    }
  }

  return { matchCount, allShareGroup };
}
