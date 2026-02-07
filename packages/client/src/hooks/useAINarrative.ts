import { useCallback } from 'react';
import { useGameStore } from '../stores';
import type { WeaveRequest, WeaveResult, ScoringBreakdown } from '@leviathan/shared';
import { findMatchingCombo, calculateScore, applyComboBonus, getIntentById } from '@leviathan/shared';
import type { ScoringInput } from '@leviathan/shared';
import { apiFetch } from '../lib/api';
import { audioManager } from '../lib/audioManager';

export function useAINarrative() {
  const weave = useCallback(async (intentId: string) => {
    const store = useGameStore.getState();
    const { selectedCards, nation, crisisState, equippedDecrees, doublePlNext } = store;

    if (selectedCards.length === 0) return;

    // Check weave count
    if (!store.useWeave()) return;

    store.setIsWeaving(true);

    try {
      const cardIds = selectedCards.map((c) => c.id);
      const intent = getIntentById(intentId);
      if (!intent) return;

      // Check minimum cards requirement
      if (selectedCards.length < intent.minCards) return;

      const intentLevel = store.getIntentLevel(intentId);

      // Calculate score locally
      const scoringInput: ScoringInput = {
        intent,
        intentLevel,
        cards: selectedCards,
        equippedDecrees,
        governmentType: nation.government_type,
        mythCount: nation.mythology.length,
        sacrificedCount: 0,
        bossModifier: crisisState.bossModifier,
        mythDensity: nation.mythDensity,
        tyranny: nation.tyranny,
      };

      let breakdown: ScoringBreakdown = calculateScore(scoringInput);

      // Check for combo (unless boss modifier disables)
      const combo = crisisState.bossModifier !== 'no_combos' ? findMatchingCombo(cardIds) : undefined;
      if (combo) {
        breakdown = applyComboBonus(breakdown, combo.name, combo.nfBonus, combo.plBonus, combo.required_cards.length);
        audioManager.playSfx('combo-acquire');
        store.addMythology(combo.result);
        store.addHistoryEntry(`[纪元${crisisState.era}] 合成: ${combo.name}`);
        store.incrementAffinity('theocracy', 8);
      }

      // Apply double PL from terror broadcast consumable
      if (doublePlNext) {
        const prevScore = breakdown.finalScore;
        breakdown = {
          ...breakdown,
          finalPL: breakdown.finalPL * 2,
          finalScore: Math.floor(breakdown.finalNF * breakdown.finalPL * 2),
          steps: [...breakdown.steps, {
            label: '恐怖广播 ×2 PL',
            nfDelta: 0,
            plDelta: breakdown.finalPL,
            nfAfter: breakdown.finalNF,
            plAfter: breakdown.finalPL * 2,
          }],
        };
        store.setDoublePlNext(false);
      }

      // Apply decree side effects
      for (const decree of equippedDecrees) {
        if (decree.id === 'decree_doublethink') {
          store.applyStatChanges({ sanity: -10 });
        }
        if (decree.id === 'decree_permanent_revolution') {
          store.applyStatChanges({ supply: -3 });
        }
      }

      // Add score to round total
      store.addRoundScore(breakdown.finalScore);

      // Set pending score animation
      store.setPendingScoreAnimation(breakdown);

      // Also call the server for narrative text
      const request: WeaveRequest = {
        card_ids: cardIds,
        intent: intent.name,
        nation_state: {
          name: nation.name,
          power: nation.power,
          supply: nation.supply,
          sanity: nation.sanity,
          tyranny: nation.tyranny,
          mythDensity: nation.mythDensity,
          traits: nation.traits,
          government_type: nation.government_type,
          population: nation.population,
        },
        history_context: nation.history_log.slice(-10),
      };

      const res = await apiFetch('/api/weave', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      const result: WeaveResult = await res.json();

      // Apply minimal stat changes from AI (scaled down since scoring is now separate)
      if (result.stats_change) {
        // Scale AI stat changes down to prevent overwhelming
        const scaled: Partial<typeof result.stats_change> = {};
        for (const [k, v] of Object.entries(result.stats_change)) {
          (scaled as any)[k] = Math.round((v as number) * 0.5);
        }
        store.applyStatChanges(scaled);

        // Government affinities
        if (result.stats_change.mythDensity && result.stats_change.mythDensity > 3)
          store.incrementAffinity('theocracy', 5);
        if (result.stats_change.power && result.stats_change.power > 3)
          store.incrementAffinity('warlord', 5);
        if (result.stats_change.tyranny && result.stats_change.tyranny > 3)
          store.incrementAffinity('bureaucracy', 5);
        if (result.stats_change.supply && result.stats_change.supply > 3)
          store.incrementAffinity('tribal', 3);
      }

      // Discard used cards, draw replacements
      const numUsed = selectedCards.length;
      store.discardSelected();
      store.drawCards(numUsed);

      // Add narrative
      audioManager.playSfx('weave-success');
      store.addNarrative({
        day: crisisState.era,
        title: result.title,
        text: result.story_text,
        comment: result.comment,
      });

      store.addHistoryEntry(
        `[纪元${crisisState.era}] 纺织: "${intent.name}" → ${result.title} (得分: ${breakdown.finalScore.toLocaleString()})`,
      );

      if (result.contradiction) {
        store.applyStatChanges({ sanity: -5 });
      }

    } catch (err) {
      console.error('Weave failed:', err);
      audioManager.playSfx('weave-fail');
      store.discardSelected();
      store.drawCards(selectedCards.length);
      store.addNarrative({
        day: crisisState.era,
        title: '纺织机故障',
        text: '叙事纺织机发出了令人不安的嗡嗡声，然后陷入沉默。',
        comment: '[系统] 连接失败',
      });
    } finally {
      store.setIsWeaving(false);
    }
  }, []);

  return { weave };
}
