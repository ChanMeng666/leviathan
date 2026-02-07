import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores';
import { apiFetch } from '../lib/api';

/** Auto-save: Zustand persist handles localStorage. For authenticated users, also saves to cloud. */
export function useAutoSave() {
  const day = useGameStore((s) => s.day);
  const user = useGameStore((s) => s.user);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Only cloud-save for authenticated users, and only after day 0
    if (!user || day <= 0) return;

    // Debounce cloud save
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const store = useGameStore.getState();
      const body = {
        slotName: '自动存档',
        nation: store.nation,
        deck: store.deck,
        hand: store.hand,
        discard: store.discard,
        day: store.day,
        phase: store.phase,
        gameOver: store.gameOver,
        gameOverReason: store.gameOverReason,
        eventHistory: store.eventHistory,
        eventCooldowns: store.eventCooldowns,
        narrativeLog: store.narrativeLog,
      };

      apiFetch('/api/saves', {
        method: 'POST',
        body: JSON.stringify(body),
      }).catch(() => {
        // Fail silently — localStorage is primary
      });
    }, 2000);

    return () => clearTimeout(debounceRef.current);
  }, [day, user]);
}
