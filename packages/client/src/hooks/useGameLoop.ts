import { useCallback } from 'react';
import { useGameStore } from '../stores';
import { GOVERNMENT_EFFECTS, GOVERNMENT_LABELS, getEraTransitionEvent, getEra, getCrisisReward } from '@leviathan/shared';
import type { NationState, NationStatChanges, EventFlavorRequest } from '@leviathan/shared';
import { apiFetch } from '../lib/api';
import { audioManager } from '../lib/audioManager';

export function useGameLoop() {
  /** Start a new crisis round: deal hand, show crisis screen */
  const startCrisis = useCallback(() => {
    const store = useGameStore.getState();
    const { crisisState } = store;

    // Draw full hand
    store.drawCards(crisisState.handSize);
    store.setPhase('crisis_start');
  }, []);

  /** After viewing crisis_start screen, begin weaving phase */
  const beginWeavePhase = useCallback(() => {
    const store = useGameStore.getState();
    store.setPhase('weave');
  }, []);

  /** End the current crisis and evaluate success */
  const endCrisis = useCallback(() => {
    const store = useGameStore.getState();
    const { crisisState } = store;

    // Clear any remaining selection
    store.clearSelection();

    // Check if target was met
    const success = crisisState.roundScore >= crisisState.targetScore;
    const overDouble = crisisState.roundScore >= crisisState.targetScore * 2;

    if (!success) {
      // Lose a life
      const newLives = crisisState.lives - 1;
      store.setCrisisState({ lives: newLives });

      if (newLives <= 0) {
        // Game over
        store.setGameOver('insanity');
        return;
      }
    } else {
      // Earn influence reward
      const reward = getCrisisReward(crisisState.crisisType, overDouble);
      store.addInfluence(reward);
    }

    store.setPhase('crisis_end');
  }, []);

  /** After crisis_end, advance to shop or next crisis */
  const afterCrisisEnd = useCallback(() => {
    const store = useGameStore.getState();
    const { crisisState } = store;
    const success = crisisState.roundScore >= crisisState.targetScore;

    if (!success) {
      // Failed crisis — replay same crisis with remaining lives
      store.setCrisisState({
        roundScore: 0,
        weavesRemaining: crisisState.bossModifier === 'silence' ? 1 : 3,
        discardsRemaining: 2,
      });
      // Return cards to deck and reshuffle
      store.returnAllToDeck();
      store.drawCards(crisisState.handSize);
      store.setPhase('crisis_start');
      return;
    }

    // Check if era boss was completed (crisisIndex === 2)
    if (crisisState.crisisIndex === 2) {
      // Era transition: apply entropy + trigger narrative event
      handleEraTransition(store);
      return;
    }

    // Regular crisis cleared — go to shop
    store.returnAllToDeck();
    store.setPhase('shop');
  }, []);

  /** After shop, advance to next crisis */
  const afterShop = useCallback(() => {
    const store = useGameStore.getState();
    const nextCrisis = store.advanceCrisis();

    if (!nextCrisis) {
      // Victory!
      store.setPhase('victory');
      return;
    }

    // Draw hand for new crisis
    store.returnAllToDeck();
    store.drawCards(nextCrisis.handSize);
    store.setPhase('crisis_start');
  }, []);

  /** After era_transition event is resolved */
  const afterEraTransition = useCallback(() => {
    const store = useGameStore.getState();
    // Go to shop after era transition
    store.returnAllToDeck();
    store.setPhase('shop');
  }, []);

  return { startCrisis, beginWeavePhase, endCrisis, afterCrisisEnd, afterShop, afterEraTransition };
}

async function handleEraTransition(store: ReturnType<typeof useGameStore.getState>) {
  const { crisisState, nation, eventHistory } = store;

  // Apply government entropy (scaled by era)
  const govType = nation.government_type;
  const entropy = GOVERNMENT_EFFECTS[govType] || GOVERNMENT_EFFECTS['undefined'];
  const eraMultiplier = crisisState.era;
  const scaledEntropy: Partial<NationStatChanges> = {};
  for (const [key, value] of Object.entries(entropy)) {
    (scaledEntropy as any)[key] = Math.round((value as number) * eraMultiplier * 0.5);
  }
  store.applyStatChanges(scaledEntropy);

  // Check government transition
  const govTransition = store.consumeGovTransition();
  if (govTransition && govTransition !== 'fela') {
    audioManager.playSfx('gov-transition');
    const govLabel = GOVERNMENT_LABELS[govTransition] || '未知';
    store.addNarrative({
      day: crisisState.era,
      title: `政体演变: ${govLabel}`,
      text: `你的一系列决策正在重塑政权的本质。"${govLabel}"——这不仅是称呼的改变。`,
      comment: `[政体] 变更为「${govLabel}」`,
    });
    store.addHistoryEntry(`[纪元${crisisState.era}] 政体演变: ${govLabel}`);
  }

  // Check fela condition
  const nationAfter = useGameStore.getState().nation;
  if (nationAfter.power < 20 && nationAfter.supply < 20 && nationAfter.sanity < 20 && nationAfter.government_type !== 'fela') {
    store.setGovernmentType('fela');
    store.addHistoryEntry(`[纪元${crisisState.era}] 费拉不堪`);
  }

  // Check death conditions
  const deathCheck = checkDeath(useGameStore.getState().nation);
  if (deathCheck) {
    store.setGameOver(deathCheck);
    return;
  }

  // Get era transition event
  const usedIds = eventHistory.map((e) => e.eventId);
  const event = getEraTransitionEvent(crisisState.era, usedIds);

  if (event) {
    store.setPhase('era_transition');

    // Get AI-flavored text
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
      store.setActiveEvent(event, null);
    }
  } else {
    // No event — go straight to shop
    const eraName = getEra(crisisState.era)?.name || `纪元${crisisState.era}`;
    store.addNarrative({
      day: crisisState.era,
      title: `${eraName}结束`,
      text: `纪元${crisisState.era}的最后一个危机已经过去。前方还有更大的考验。`,
      comment: `[纪元] ${eraName}完成`,
    });
    store.addHistoryEntry(`[纪元${crisisState.era}] ${eraName}结束`);
    store.returnAllToDeck();
    store.setPhase('shop');
  }
}

function checkDeath(nation: NationState): 'riot' | 'starvation' | 'insanity' | null {
  if (nation.power <= 0) return 'riot';
  if (nation.supply <= 0) return 'starvation';
  if (nation.sanity <= 0) return 'insanity';
  return null;
}
