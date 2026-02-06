import { findMatchingCombo, getCardById } from '@leviathan/shared';
import type { WeaveRequest, WeaveResult, Card, ComboFormula } from '@leviathan/shared';

/**
 * Local rule engine — used as fallback when no AI API key is configured.
 * Checks for combo matches and generates deterministic results.
 */
export function processMockWeave(req: WeaveRequest): WeaveResult {
  const cards = req.card_ids
    .map((id) => getCardById(id))
    .filter((c): c is Card => c !== undefined);

  // Check for combo match
  const combo = findMatchingCombo(req.card_ids);
  if (combo) {
    return comboResult(combo, cards, req);
  }

  // No combo — generate based on card stats
  return genericResult(cards, req);
}

function comboResult(combo: ComboFormula, cards: Card[], req: WeaveRequest): WeaveResult {
  const avgPotential = cards.reduce((s, c) => s + c.narrative_potential, 0) / cards.length;
  const successRate = Math.min(0.95, avgPotential / 100 + 0.2);

  return {
    title: combo.name,
    story_text: combo.description,
    success_rate: successRate,
    stats_change: { ...combo.result.effect },
    new_item: undefined,
    comment: `[旁白] 垃圾堆里居然拼出了奇迹。大概这就是所谓的"民族发明"吧。`,
    contradiction: undefined,
  };
}

function genericResult(cards: Card[], req: WeaveRequest): WeaveResult {
  const totalPotential = cards.reduce((s, c) => s + c.narrative_potential, 0);
  const totalPhysical = cards.reduce((s, c) => s + c.physical_value, 0);
  const avgPotential = cards.length > 0 ? totalPotential / cards.length : 0;
  const successRate = Math.min(0.9, Math.max(0.1, avgPotential / 120));

  const allTags = cards.flatMap((c) => c.tags);
  const hasFood = allTags.includes('食物');
  const hasViolence = allTags.includes('暴力') || allTags.includes('武德');
  const hasAuthority = allTags.includes('权威') || allTags.includes('官僚');
  const hasFaith = allTags.includes('信仰') || allTags.includes('神话');
  const hasPropaganda = allTags.includes('宣传') || allTags.includes('历史');

  const statsChange: Record<string, number> = {};
  if (hasPropaganda || hasFaith) statsChange.narrative_integrity = Math.round(totalPotential * 0.15);
  if (hasViolence) statsChange.violence_authority = Math.round(totalPotential * 0.1);
  if (hasFood) statsChange.supply_level = Math.round(totalPhysical * 0.3);
  if (hasAuthority) statsChange.corruption = Math.round(totalPotential * 0.05);
  statsChange.sanity = -Math.round(totalPotential * 0.05);

  const cardNames = cards.map((c) => c.name).join('、');
  const storyText = `民族发明家将${cardNames}投入叙事纺织机。`
    + `在一阵令人不安的嗡鸣声中，这些垃圾素材被编织成了一段关于"${req.intent}"的故事。`
    + `成功率${Math.round(successRate * 100)}%——考虑到原材料的质量，这已经是奇迹了。`;

  return {
    title: `${req.intent}（草稿版）`,
    story_text: storyText,
    success_rate: successRate,
    stats_change: statsChange,
    comment: `[旁白] 用${cardNames}来编造"${req.intent}"？行吧，反正历史都是编的。`,
    contradiction: undefined,
  };
}

/** Mock event flavor — deterministic based on government type */
export function processMockEventFlavor(
  baseText: string,
  governmentType: string,
  nationName: string,
): { flavored_text: string; narrator_comment: string } {
  const flavorMap: Record<string, (t: string) => string> = {
    theocracy: (t) => `[神谕] ${nationName}的大祭司宣布：${t} 这是神的考验。`,
    warlord: (t) => `[军令] ${nationName}司令部通告：${t} 违令者军法处置。`,
    bureaucracy: (t) => `[公文] 关于${nationName}辖区内${t}的处理办法（试行）。请各部门阅后转发。`,
    tribal: (t) => `[传说] ${nationName}的长老们围坐火堆，讲述着${t}的预兆。祖先的血在召唤。`,
    fela: (t) => `${t} ${nationName}的居民们看了一眼，叹了口气，继续排队买馒头。`,
    undefined: (t) => `${t} 没有人知道该怎么办。但每个人都在等别人先说话。`,
  };

  const flavorer = flavorMap[governmentType] ?? flavorMap.undefined;
  return {
    flavored_text: flavorer(baseText),
    narrator_comment: '又到了考验人性的时刻。不过说实话，考了这么多次，结果都差不多。',
  };
}

/** Mock history book */
export function processMockHistoryBook(
  nationName: string,
  deathReason: string,
  daysSurvived: number,
  traits: string[],
): { title: string; body: string; epitaph: string } {
  const traitStr = traits.length > 0 ? traits.join('、') : '一无所有';
  return {
    title: `${nationName}：一个${daysSurvived}天的实验`,
    body: `${nationName}，一个存续了${daysSurvived}天的政治实体，以"${deathReason}"的方式走向终结。`
      + `后世历史学家对这个短暂政权的评价莫衷一是，但有一点是确定的：`
      + `它留下了${traitStr}等令人印象深刻的"遗产"。`
      + `有学者认为，${nationName}的真正意义在于证明了一个古老的命题——`
      + `任何叙事都能构建，但并非所有叙事都能在现实面前存活。`,
    epitaph: `"它曾试图用谎言抵挡真相，用故事战胜饥饿。它失败了——但至少它曾存在过。"`,
  };
}
