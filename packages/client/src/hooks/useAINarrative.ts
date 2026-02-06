import { useCallback } from 'react';
import { useGameStore } from '../stores';
import type { WeaveRequest, WeaveResult } from '@leviathan/shared';
import { findMatchingCombo, getCardById } from '@leviathan/shared';

export function useAINarrative() {
  const weave = useCallback(async (intent: string) => {
    const store = useGameStore.getState();
    const { selectedCards, nation, day } = store;

    if (selectedCards.length === 0) return;

    store.setIsWeaving(true);

    try {
      const cardIds = selectedCards.map((c) => c.id);

      const request: WeaveRequest = {
        card_ids: cardIds,
        intent,
        nation_state: {
          name: nation.name,
          narrative_integrity: nation.narrative_integrity,
          violence_authority: nation.violence_authority,
          supply_level: nation.supply_level,
          sanity: nation.sanity,
          cruelty: nation.cruelty,
          corruption: nation.corruption,
          traits: nation.traits,
          government_type: nation.government_type,
          population: nation.population,
        },
        history_context: nation.history_log.slice(-10),
      };

      const res = await fetch('/api/weave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result: WeaveResult = await res.json();

      // Apply stat changes
      if (result.stats_change) {
        store.applyStatChanges(result.stats_change);
      }

      // Check for combo
      const combo = findMatchingCombo(cardIds);
      if (combo) {
        store.addMythology(combo.result);
        store.addHistoryEntry(
          `[Day ${day}] 合成成功: ${combo.name} — ${combo.description.slice(0, 50)}...`,
        );
      }

      // Add new item if any
      if (result.new_item) {
        store.addCardToDeck(result.new_item);
      }

      // Discard used cards
      store.discardSelected();

      // Add narrative to log
      store.addNarrative({
        day,
        title: result.title,
        text: result.story_text,
        comment: result.comment,
      });

      // Add to history log
      store.addHistoryEntry(
        `[Day ${day}] 纺织: "${intent}" → ${result.title} (成功率: ${Math.round(result.success_rate * 100)}%)`,
      );

      // Handle contradiction
      if (result.contradiction) {
        store.applyStatChanges({ sanity: -10 });
        store.addHistoryEntry(`[Day ${day}] 矛盾警告: ${result.contradiction}`);
      }
    } catch (err) {
      console.error('Weave failed:', err);
      // Still discard cards on error to prevent stuck state
      store.discardSelected();
      store.addNarrative({
        day,
        title: '纺织机故障',
        text: '叙事纺织机发出了令人不安的嗡嗡声，然后陷入沉默。也许现实太过坚硬，连谎言都无法穿透。',
        comment: '[系统] 连接失败，但素材已经消耗了。这就是人生。',
      });
    } finally {
      store.setIsWeaving(false);
    }
  }, []);

  return { weave };
}
