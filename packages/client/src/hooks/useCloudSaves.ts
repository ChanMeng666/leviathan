import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import { useGameStore } from '../stores';
import { buildSaveState } from '../stores/buildSaveState';
import type { GameSaveMeta } from '@leviathan/shared';

export function useCloudSaves() {
  const [saves, setSaves] = useState<GameSaveMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/saves');
      if (res.ok) {
        const data = await res.json();
        setSaves(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGame = useCallback(async (slotName: string) => {
    const store = useGameStore.getState();
    const body = {
      slotName,
      ...buildSaveState(store),
    };

    const res = await apiFetch('/api/saves', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('保存失败');
    }

    return res.json();
  }, []);

  const loadSave = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/saves/${id}`);
    if (!res.ok) {
      throw new Error('加载存档失败');
    }

    const data = await res.json();
    const store = useGameStore.getState();

    // Apply loaded state to store
    store.loadNation(data.nation);
    store.loadCards(data.deck, data.hand, data.discard);
    store.loadEvents(data.eventHistory, data.eventCooldowns);
    store.loadGame(data.day, data.phase, data.gameOver, data.gameOverReason);
    store.loadNarratives(data.narrativeLog);
  }, []);

  const deleteSave = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/saves/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('删除存档失败');
    }
    setSaves((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { saves, isLoading, fetchSaves, saveGame, loadSave, deleteSave };
}
