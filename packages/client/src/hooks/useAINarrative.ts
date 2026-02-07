import { useCallback } from 'react';
import { useGameStore } from '../stores';
import type { WeaveRequest, WeaveResult } from '@leviathan/shared';
import { findMatchingCombo, EXTENDED_CARDS } from '@leviathan/shared';
import { apiFetch } from '../lib/api';
import { audioManager } from '../lib/audioManager';

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

      const res = await apiFetch('/api/weave', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      const result: WeaveResult = await res.json();

      // Apply stat changes
      if (result.stats_change) {
        store.applyStatChanges(result.stats_change);

        // Increment government affinities based on stat changes
        if (result.stats_change.narrative_integrity && result.stats_change.narrative_integrity > 5) {
          store.incrementAffinity('theocracy', 5);
        }
        if (result.stats_change.violence_authority && result.stats_change.violence_authority > 5) {
          store.incrementAffinity('warlord', 5);
        }
        if (result.stats_change.corruption && result.stats_change.corruption > 5) {
          store.incrementAffinity('bureaucracy', 5);
        }
        if (result.stats_change.supply_level && result.stats_change.supply_level > 5) {
          store.incrementAffinity('tribal', 3);
        }
      }

      // Check for combo
      const combo = findMatchingCombo(cardIds);
      if (combo) {
        audioManager.playSfx('combo-acquire');
        store.addMythology(combo.result);
        store.addHistoryEntry(
          `[第${day}天] 合成成功: ${combo.name} — ${combo.description.slice(0, 50)}...`,
        );
        // Combo creation boosts theocracy affinity
        store.incrementAffinity('theocracy', 8);
      }

      // Add new item if any
      if (result.new_item) {
        store.addCardToDeck(result.new_item);
      }

      // Discard used cards
      store.discardSelected();

      // Add narrative to log
      audioManager.playSfx('weave-success');
      store.addNarrative({
        day,
        title: result.title,
        text: result.story_text,
        comment: result.comment,
      });

      // Add to history log
      store.addHistoryEntry(
        `[第${day}天] 纺织: "${intent}" → ${result.title} (成功率: ${Math.round(result.success_rate * 100)}%)`,
      );

      // Handle contradiction
      if (result.contradiction) {
        store.applyStatChanges({ sanity: -10 });
        store.addHistoryEntry(`[第${day}天] 矛盾警告: ${result.contradiction}`);
      }

      // Post-weave card discovery: 20% chance on high success rate
      if (result.success_rate > 0.8 && Math.random() < 0.2) {
        const undiscovered = EXTENDED_CARDS.filter(
          (c) => !store.discoveredExtended.includes(c.id),
        );
        if (undiscovered.length > 0) {
          const randomCard = undiscovered[Math.floor(Math.random() * undiscovered.length)];
          const discovered = store.discoverCard(randomCard.id);
          if (discovered) {
            audioManager.playSfx('discovery');
            store.addNarrative({
              day,
              title: `意外发现: ${randomCard.name}`,
              text: `纺织过程中，一件意想不到的素材出现在你的视野中——${randomCard.name}。${randomCard.description}`,
              comment: `[发现] 高成功率纺织带来了意外收获！新卡牌已加入牌组`,
            });
            store.addHistoryEntry(`[第${day}天] 纺织发现新素材: ${randomCard.name}`);
          }
        }
      }
    } catch (err) {
      console.error('Weave failed:', err);
      audioManager.playSfx('weave-fail');
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
