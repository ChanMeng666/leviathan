import type { StateCreator } from 'zustand';

export interface NarrativeEntry {
  id: string;
  day: number;
  title: string;
  text: string;
  comment: string;
  timestamp: number;
}

export interface NarrativeSlice {
  narrativeLog: NarrativeEntry[];
  currentNarrative: NarrativeEntry | null;

  addNarrative: (entry: Omit<NarrativeEntry, 'id' | 'timestamp'>) => void;
  setCurrentNarrative: (entry: NarrativeEntry | null) => void;
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

  resetNarratives: () => {
    _narrativeId = 0;
    set({ narrativeLog: [], currentNarrative: null });
  },
});
