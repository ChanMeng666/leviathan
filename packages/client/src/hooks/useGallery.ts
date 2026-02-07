import { useState, useCallback } from 'react';
import type { GameRunRecord } from '@leviathan/shared';
import { apiFetch } from '../lib/api';
import { useGameStore } from '../stores';

export function useGallery() {
  const [runs, setRuns] = useState<GameRunRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useGameStore((s) => s.user);

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const res = await apiFetch('/api/saves/runs');
        if (res.ok) {
          const data = await res.json();
          setRuns(data);
          return;
        }
      }
      // Guest or fetch failed — fall back to localStorage
      const local: GameRunRecord[] = JSON.parse(localStorage.getItem('leviathan-gallery') || '[]');
      setRuns(local);
    } catch {
      const local: GameRunRecord[] = JSON.parse(localStorage.getItem('leviathan-gallery') || '[]');
      setRuns(local);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { runs, isLoading, fetchRuns };
}
