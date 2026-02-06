import { useCallback } from 'react';
import { useGameStore } from '../stores';
import { GAME_EVENTS } from '@leviathan/shared';
import type { GameEvent, NationState, EventFlavorRequest } from '@leviathan/shared';

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

    // Apply daily entropy
    store.applyStatChanges({
      narrative_integrity: -5,
      supply_level: -5,
      violence_authority: -2,
    });

    // Check death conditions AFTER entropy
    const nation = useGameStore.getState().nation;
    const deathCheck = checkDeath(nation);
    if (deathCheck) {
      store.setGameOver(deathCheck);
      return;
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

    const res = await fetch('/api/event-flavor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flavorReq),
    });

    const data = await res.json();
    store.setActiveEvent(event, data.flavored_text);
  } catch {
    // Use base text on failure
    store.setActiveEvent(event, null);
  }
}
