import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores';
import { apiFetch } from '../lib/api';
import { buildSaveState } from '../stores/buildSaveState';

/** Auto-save: Zustand persist handles localStorage. For authenticated users, also saves to cloud. */
export function useAutoSave() {
  const era = useGameStore((s) => s.crisisState.era);
  const crisisIndex = useGameStore((s) => s.crisisState.crisisIndex);
  const user = useGameStore((s) => s.user);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Only cloud-save for authenticated users, and only after the game has started
    if (!user || era <= 0) return;

    // Debounce cloud save
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const store = useGameStore.getState();
      const body = {
        slotName: '自动存档',
        ...buildSaveState(store),
      };

      apiFetch('/api/saves', {
        method: 'POST',
        body: JSON.stringify(body),
      }).catch(() => {
        // Fail silently — localStorage is primary
      });
    }, 2000);

    return () => clearTimeout(debounceRef.current);
  }, [era, crisisIndex, user]);
}
