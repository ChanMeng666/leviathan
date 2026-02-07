import type { CrisisDefinition } from '../types/game.js';

export interface EraDefinition {
  era: number;
  name: string;
  description: string;
  crises: CrisisDefinition[];
}

export const ERAS: EraDefinition[] = [
  {
    era: 1,
    name: '蛮荒纪',
    description: '文明的火种在废墟中摇曳',
    crises: [
      { era: 1, crisisIndex: 0, crisisType: 'small', targetScore: 300, bossModifier: null },
      { era: 1, crisisIndex: 1, crisisType: 'big', targetScore: 500, bossModifier: null },
      { era: 1, crisisIndex: 2, crisisType: 'boss', targetScore: 800, bossModifier: 'no_food_cards' },
    ],
  },
  {
    era: 2,
    name: '建构纪',
    description: '叙事的骨架开始成型',
    crises: [
      { era: 2, crisisIndex: 0, crisisType: 'small', targetScore: 1200, bossModifier: null },
      { era: 2, crisisIndex: 1, crisisType: 'big', targetScore: 2000, bossModifier: null },
      { era: 2, crisisIndex: 2, crisisType: 'boss', targetScore: 3500, bossModifier: 'narrative_cap' },
    ],
  },
  {
    era: 3,
    name: '膨胀纪',
    description: '权力膨胀到危险的临界点',
    crises: [
      { era: 3, crisisIndex: 0, crisisType: 'small', targetScore: 5000, bossModifier: null },
      { era: 3, crisisIndex: 1, crisisType: 'big', targetScore: 8000, bossModifier: null },
      { era: 3, crisisIndex: 2, crisisType: 'boss', targetScore: 12000, bossModifier: 'no_combos' },
    ],
  },
  {
    era: 4,
    name: '腐朽纪',
    description: '体制的裂痕无法再被掩饰',
    crises: [
      { era: 4, crisisIndex: 0, crisisType: 'small', targetScore: 18000, bossModifier: null },
      { era: 4, crisisIndex: 1, crisisType: 'big', targetScore: 30000, bossModifier: null },
      { era: 4, crisisIndex: 2, crisisType: 'boss', targetScore: 50000, bossModifier: 'silence' },
    ],
  },
  {
    era: 5,
    name: '利维坦纪',
    description: '最终的觉醒——或永恒的沉沦',
    crises: [
      { era: 5, crisisIndex: 0, crisisType: 'small', targetScore: 80000, bossModifier: null },
      { era: 5, crisisIndex: 1, crisisType: 'big', targetScore: 150000, bossModifier: null },
      { era: 5, crisisIndex: 2, crisisType: 'boss', targetScore: 300000, bossModifier: 'fela_decay' },
    ],
  },
];

export function getCrisis(era: number, crisisIndex: number): CrisisDefinition | undefined {
  const eraDef = ERAS.find((e) => e.era === era);
  return eraDef?.crises[crisisIndex];
}

export function getEra(era: number): EraDefinition | undefined {
  return ERAS.find((e) => e.era === era);
}

export function getNextCrisis(era: number, crisisIndex: number): CrisisDefinition | null {
  if (crisisIndex < 2) {
    return getCrisis(era, crisisIndex + 1) ?? null;
  }
  if (era < 5) {
    return getCrisis(era + 1, 0) ?? null;
  }
  return null; // Victory!
}

/** Influence reward for completing a crisis */
export function getCrisisReward(crisisType: 'small' | 'big' | 'boss', overDouble: boolean): number {
  const base = crisisType === 'small' ? 3 : crisisType === 'big' ? 5 : 8;
  return overDouble ? base + 2 : base;
}
