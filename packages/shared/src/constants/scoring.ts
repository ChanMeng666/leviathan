import type { Card, NarrativeIntent, IntentLevel, Decree, GovernmentType, ScoringBreakdown, ScoringStep } from '../types/game.js';
import { countTagMatches } from './intents.js';

export interface ScoringInput {
  intent: NarrativeIntent;
  intentLevel: number;
  cards: Card[];
  equippedDecrees: Decree[];
  governmentType: GovernmentType;
  mythCount: number;
  sacrificedCount: number;
  bossModifier: string | null;
  mythDensity: number;
  tyranny: number;
}

/**
 * Calculate the full scoring breakdown for a weave action.
 * Score = floor(NF × PL), computed step by step like Balatro.
 */
export function calculateScore(input: ScoringInput): ScoringBreakdown {
  const steps: ScoringStep[] = [];
  let nf = 0;
  let pl = 0;

  // ① Intent base values (with level scaling)
  const levelBonus = (input.intentLevel - 1);
  const baseNF = input.intent.base_nf + levelBonus * 10;
  const basePL = input.intent.base_pl + levelBonus * 0.5;
  nf += baseNF;
  pl += basePL;
  steps.push({
    label: `意图「${input.intent.name}」Lv.${input.intentLevel}`,
    nfDelta: baseNF,
    plDelta: basePL,
    nfAfter: nf,
    plAfter: pl,
  });

  // ② Card narrative force
  for (const card of input.cards) {
    let cardNF = card.narrative_potential;

    // Boss modifier: no_food_cards
    if (input.bossModifier === 'no_food_cards' && card.tags.includes('食物')) {
      cardNF = 0;
    }

    // Boss modifier: narrative_cap
    if (input.bossModifier === 'narrative_cap') {
      cardNF = Math.min(50, cardNF);
    }

    // Card enhancement bonus
    if (card.enhancement === 'foil') {
      cardNF = Math.round(cardNF * 1.5);
    } else if (card.enhancement === 'holographic') {
      cardNF = Math.round(cardNF * 2.0);
    }

    nf += cardNF;
    const plAdd = card.enhancement === 'holographic' ? 0.5 : 0;
    pl += plAdd;
    steps.push({
      label: `卡牌「${card.name}」${card.enhancement === 'foil' ? '✦' : card.enhancement === 'holographic' ? '✧' : ''}`,
      nfDelta: cardNF,
      plDelta: plAdd,
      nfAfter: nf,
      plAfter: pl,
    });
  }

  // ③ Tag affinity matching
  const cardTags = input.cards.map((c) => c.tags);
  const { matchCount, allShareGroup } = countTagMatches(cardTags);
  if (matchCount > 0) {
    const tagNF = 10 * matchCount;
    nf += tagNF;
    const tagPL = allShareGroup ? 1.0 : 0;
    pl += tagPL;
    steps.push({
      label: `标签亲和 (${matchCount}匹配${allShareGroup ? '+花色' : ''})`,
      nfDelta: tagNF,
      plDelta: tagPL,
      nfAfter: nf,
      plAfter: pl,
    });
  }

  // ④ Card count bonus
  if (input.cards.length === 2) {
    nf += 15;
    steps.push({ label: '双牌加成', nfDelta: 15, plDelta: 0, nfAfter: nf, plAfter: pl });
  } else if (input.cards.length >= 3) {
    nf += 30;
    pl += 0.5;
    steps.push({ label: '三牌加成', nfDelta: 30, plDelta: 0.5, nfAfter: nf, plAfter: pl });
  }

  // ⑤ Card slot position bonuses
  if (input.cards.length >= 1) {
    nf += 5;
    steps.push({ label: '槽位1: +NF', nfDelta: 5, plDelta: 0, nfAfter: nf, plAfter: pl });
  }
  if (input.cards.length >= 2) {
    pl += 0.3;
    steps.push({ label: '槽位2: +PL', nfDelta: 0, plDelta: 0.3, nfAfter: nf, plAfter: pl });
  }
  if (input.cards.length >= 3) {
    const plBefore = pl;
    pl *= 1.15;
    steps.push({ label: '槽位3: ×1.15 PL', nfDelta: 0, plDelta: pl - plBefore, nfAfter: nf, plAfter: pl });
  }

  // ⑥ Combo bonus (if boss modifier is no_combos, skip)
  // This is handled externally — combo detection happens in the caller
  // The caller should pass nfBonus/plBonus from the combo if matched

  // ⑦ Decree effects (sorted: add_nf first, add_pl next, mult_pl last)
  const sortedDecrees = [...input.equippedDecrees].sort((a, b) => {
    const order = { add_nf: 0, add_pl: 1, conditional: 2, mult_pl: 3 };
    return (order[a.effectType] ?? 2) - (order[b.effectType] ?? 2);
  });

  for (const decree of sortedDecrees) {
    let applies = true;

    // Check conditions for conditional decrees
    if (decree.effectType === 'conditional' && decree.condition) {
      applies = evaluateDecreeCondition(decree.condition, input);
    }

    if (!applies) continue;

    if (decree.effectType === 'add_nf' || (decree.effectType === 'conditional' && decree.condition?.includes('nf'))) {
      nf += decree.effectValue;
      steps.push({
        label: `法令「${decree.name}」`,
        nfDelta: decree.effectValue,
        plDelta: 0,
        nfAfter: nf,
        plAfter: pl,
      });
    } else if (decree.effectType === 'add_pl') {
      pl += decree.effectValue;
      steps.push({
        label: `法令「${decree.name}」`,
        nfDelta: 0,
        plDelta: decree.effectValue,
        nfAfter: nf,
        plAfter: pl,
      });
    } else if (decree.effectType === 'mult_pl') {
      const plBefore = pl;
      pl *= decree.effectValue;
      steps.push({
        label: `法令「${decree.name}」×${decree.effectValue}`,
        nfDelta: 0,
        plDelta: pl - plBefore,
        nfAfter: nf,
        plAfter: pl,
      });
    } else if (decree.effectType === 'conditional') {
      // Conditional decrees that add PL
      pl += decree.effectValue;
      steps.push({
        label: `法令「${decree.name}」`,
        nfDelta: 0,
        plDelta: decree.effectValue,
        nfAfter: nf,
        plAfter: pl,
      });
    }
  }

  // ⑧ Government type modifier
  const govMod = getGovernmentScoringModifier(input.governmentType);
  if (govMod.label) {
    const prevNF = nf;
    const prevPL = pl;
    if (govMod.nfMult) nf *= govMod.nfMult;
    if (govMod.plMult) pl *= govMod.plMult;
    if (govMod.nfAdd) nf += govMod.nfAdd;
    if (govMod.plAdd && allShareGroup) pl += govMod.plAdd; // tribal bonus only on shared tags
    if (input.governmentType === 'fela') {
      nf *= 0.7;
      pl *= 0.7;
    }
    steps.push({
      label: `政体「${govMod.label}」`,
      nfDelta: nf - prevNF,
      plDelta: pl - prevPL,
      nfAfter: nf,
      plAfter: pl,
    });
  }

  // Myth density bonus: +0.5% per point
  if (input.mythDensity > 0) {
    const bonus = 1 + input.mythDensity * 0.005;
    const prevNF = nf;
    nf *= bonus;
    steps.push({
      label: `神话浓度 (${input.mythDensity}%)`,
      nfDelta: nf - prevNF,
      plDelta: 0,
      nfAfter: nf,
      plAfter: pl,
    });
  }

  // Boss modifier: fela_decay
  if (input.bossModifier === 'fela_decay') {
    const prevNF = nf;
    const prevPL = pl;
    nf *= 0.7;
    pl *= 0.7;
    steps.push({
      label: 'Boss: 费拉衰减',
      nfDelta: nf - prevNF,
      plDelta: pl - prevPL,
      nfAfter: nf,
      plAfter: pl,
    });
  }

  // ⑨ Final score
  const finalScore = Math.floor(nf * pl);

  return {
    steps,
    finalNF: Math.round(nf * 10) / 10,
    finalPL: Math.round(pl * 10) / 10,
    finalScore,
  };
}

function getGovernmentScoringModifier(gov: GovernmentType): {
  label: string;
  nfMult?: number;
  plMult?: number;
  nfAdd?: number;
  plAdd?: number;
} {
  switch (gov) {
    case 'theocracy':
      return { label: '神权国家', nfMult: 1.15 };
    case 'warlord':
      return { label: '军阀政权', plMult: 1.15 };
    case 'bureaucracy':
      return { label: '官僚体制', nfAdd: 20 };
    case 'tribal':
      return { label: '部落联盟', plAdd: 0.5 };
    case 'fela':
      return { label: '费拉不堪' }; // ×0.7 handled in main flow
    default:
      return { label: '' };
  }
}

function evaluateDecreeCondition(condition: string, input: ScoringInput): boolean {
  switch (condition) {
    case 'history_tag':
      return input.cards.some((c) => c.tags.includes('历史'));
    case 'two_plus_cards':
      return input.cards.length >= 2;
    case 'theocracy':
      return input.governmentType === 'theocracy';
    case 'has_scapegoats':
      return input.sacrificedCount > 0;
    case 'per_myth':
      return input.mythCount > 0;
    case 'physical_convert':
      return input.cards.some((c) => c.physical_value > 0);
    default:
      return true;
  }
}

/**
 * Apply combo bonus to an existing scoring breakdown.
 * Called after base score calculation if a combo is matched.
 */
export function applyComboBonus(
  breakdown: ScoringBreakdown,
  comboName: string,
  nfBonus: number,
  plBonus: number,
  cardCount: number,
): ScoringBreakdown {
  const steps = [...breakdown.steps];
  let nf = breakdown.finalNF + nfBonus;
  let pl = breakdown.finalPL + plBonus;

  steps.push({
    label: `合成「${comboName}」(${cardCount}牌)`,
    nfDelta: nfBonus,
    plDelta: plBonus,
    nfAfter: nf,
    plAfter: pl,
  });

  return {
    steps,
    finalNF: Math.round(nf * 10) / 10,
    finalPL: Math.round(pl * 10) / 10,
    finalScore: Math.floor(nf * pl),
  };
}
