import { useCallback } from 'react';
import { useGameStore } from '../stores';
import { GAME_EVENTS, EXTENDED_CARDS, GOVERNMENT_EFFECTS, GOVERNMENT_LABELS } from '@leviathan/shared';
import type { GameEvent, NationState, NationStatChanges, EventFlavorRequest } from '@leviathan/shared';
import { apiFetch } from '../lib/api';
import { audioManager } from '../lib/audioManager';

const DAY_MILESTONES = [3, 5, 8];

export function useGameLoop() {
  const advanceDay = useCallback(() => {
    const store = useGameStore.getState();
    const { day, phase } = store;

    if (phase !== 'draw' && phase !== 'settle') return;

    // New day
    store.nextDay();
    const newDay = day + 1;

    // Draw cards
    store.drawCards(3);

    // Apply government-specific daily entropy
    const govType = store.nation.government_type;
    const entropy = GOVERNMENT_EFFECTS[govType] || GOVERNMENT_EFFECTS['undefined'];
    const entropyChanges: Partial<NationStatChanges> = { ...entropy };

    // Apply scapegoat bonuses (non-sacrificed groups provide per-turn bonuses)
    for (const sg of store.scapegoats) {
      if (!sg.sacrificed) {
        for (const [key, value] of Object.entries(sg.stat_bonus)) {
          const k = key as keyof NationStatChanges;
          entropyChanges[k] = ((entropyChanges[k] as number) || 0) + (value as number);
        }
      }
    }

    store.applyStatChanges(entropyChanges);

    // Check for government type transitions (fela check)
    const nationAfterEntropy = useGameStore.getState().nation;
    if (
      nationAfterEntropy.narrative_integrity < 20 &&
      nationAfterEntropy.violence_authority < 20 &&
      nationAfterEntropy.supply_level < 20 &&
      nationAfterEntropy.government_type !== 'fela'
    ) {
      store.setGovernmentType('fela');
      store.addHistoryEntry(`[第${newDay}天] 政体蜕变: 费拉不堪 — 一切都在崩溃`);
      store.addNarrative({
        day: newDay,
        title: '费拉不堪',
        text: '叙事失效、武力不足、物资匮乏——你的政权正在以所有可能的方式同时崩溃。历史学家们会称之为"费拉化"。',
        comment: '当一切指标都低于临界值，任何叙事都无法拯救这个政权。',
      });
    }

    // Check for pending government type transitions from previous actions
    const govTransition = store.consumeGovTransition();
    if (govTransition && govTransition !== 'fela') {
      audioManager.playSfx('gov-transition');
      const govLabel = GOVERNMENT_LABELS[govTransition] || '未知';
      store.addNarrative({
        day: newDay,
        title: `政体演变: ${govLabel}`,
        text: `你的一系列决策正在重塑这个政权的本质。人们开始用新的方式谈论你的统治——"${govLabel}"。这不仅仅是称呼的改变，权力的运作方式正在发生根本性的变化。`,
        comment: `[政体] 政府类型变更为「${govLabel}」，每日熵变效果已更新`,
      });
      store.addHistoryEntry(`[第${newDay}天] 政体演变: ${govLabel}`);
    }

    // Check death conditions AFTER entropy
    const nation = useGameStore.getState().nation;
    const deathCheck = checkDeath(nation);
    if (deathCheck) {
      store.setGameOver(deathCheck);
      return;
    }

    // Day milestone card discovery
    if (DAY_MILESTONES.includes(newDay)) {
      const undiscovered = EXTENDED_CARDS.filter(
        (c) => !store.discoveredExtended.includes(c.id),
      );
      if (undiscovered.length > 0) {
        const randomCard = undiscovered[Math.floor(Math.random() * undiscovered.length)];
        const discovered = store.discoverCard(randomCard.id);
        if (discovered) {
          audioManager.playSfx('discovery');
          store.addNarrative({
            day: newDay,
            title: `发现新素材: ${randomCard.name}`,
            text: `搜索队在废墟中发现了一件新的素材——${randomCard.name}。${randomCard.description}`,
            comment: `[发现] 新卡牌已加入牌组`,
          });
          store.addHistoryEntry(`[第${newDay}天] 发现新素材: ${randomCard.name}`);
        }
      }
    }

    // Check for triggered events
    const cooldowns = store.eventCooldowns;
    const triggered = GAME_EVENTS.filter(
      (evt) =>
        evt.trigger(nation) &&
        (cooldowns[evt.id] == null || cooldowns[evt.id] <= newDay),
    );

    if (triggered.length > 0) {
      // Pick first triggered event
      const event = triggered[0];
      triggerEvent(event, nation, store);
      return;
    }

    // No event — go to action phase
    store.setPhase('action');
  }, []);

  const endActionPhase = useCallback(() => {
    const store = useGameStore.getState();
    store.clearSelection();

    // Check death after action
    const nation = store.nation;
    const deathCheck = checkDeath(nation);
    if (deathCheck) {
      store.setGameOver(deathCheck);
      return;
    }

    store.setPhase('settle');
  }, []);

  return { advanceDay, endActionPhase };
}

function checkDeath(nation: NationState): 'riot' | 'starvation' | 'madness' | 'insanity' | null {
  if (nation.violence_authority <= 0) return 'riot';
  if (nation.supply_level <= 0) return 'starvation';
  if (nation.narrative_integrity >= 100) return 'madness';
  if (nation.sanity <= 0) return 'insanity';
  return null;
}

async function triggerEvent(
  event: GameEvent,
  nation: NationState,
  store: ReturnType<typeof useGameStore.getState>,
) {
  store.setPhase('event');

  // Try to get AI-flavored text
  try {
    const flavorReq: EventFlavorRequest = {
      event_id: event.id,
      base_text: event.base_text,
      government_type: nation.government_type,
      nation_name: nation.name,
      traits: nation.traits,
    };

    const res = await apiFetch('/api/event-flavor', {
      method: 'POST',
      body: JSON.stringify(flavorReq),
    });

    const data = await res.json();
    store.setActiveEvent(event, data.flavored_text);
  } catch {
    // Use base text on failure
    store.setActiveEvent(event, null);
  }
}
