import type { StateCreator } from 'zustand';
import type { NarrativeEntry } from '@leviathan/shared';

export interface NarrativeSlice {
  narrativeLog: NarrativeEntry[];
  currentNarrative: NarrativeEntry | null;

  addNarrative: (entry: Omit<NarrativeEntry, 'id' | 'timestamp'>) => void;
  setCurrentNarrative: (entry: NarrativeEntry | null) => void;
  loadNarratives: (log: NarrativeEntry[]) => void;
  resetNarratives: () => void;
}

let _narrativeId = 0;

export const createNarrativeSlice: StateCreator<NarrativeSlice, [], [], NarrativeSlice> = (
  set,
) => ({
  narrativeLog: [],
  currentNarrative: null,

  addNarrative: (entry) => {
    const full: NarrativeEntry = {
      ...entry,
      id: `nar_${++_narrativeId}`,
      timestamp: Date.now(),
    };
    set((s) => ({
      narrativeLog: [...s.narrativeLog, full],
      currentNarrative: full,
    }));
  },

  setCurrentNarrative: (entry) => set({ currentNarrative: entry }),

  loadNarratives: (log) => {
    _narrativeId = log.length;
    set({ narrativeLog: log, currentNarrative: log[log.length - 1] ?? null });
  },

  resetNarratives: () => {
    _narrativeId = 0;
    set({ narrativeLog: [], currentNarrative: null });
  },
});
