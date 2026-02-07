import type { StateCreator } from 'zustand';

export interface MetaProgress {
  totalClears: number;
  clearedGovernments: string[];
  highestEra: number;
  highScore: number;
  unlockedDecrees: string[];
  unlockedCards: string[];
}

export interface MetaSlice {
  meta: MetaProgress;
  loadMeta: () => void;
  saveMeta: () => void;
  recordClear: (governmentType: string, era: number, score: number) => void;
  recordDefeat: (era: number, score: number) => void;
}

const INITIAL_META: MetaProgress = {
  totalClears: 0,
  clearedGovernments: [],
  highestEra: 0,
  highScore: 0,
  unlockedDecrees: [],
  unlockedCards: [],
};

const META_KEY = 'leviathan-meta';

function loadFromStorage(): MetaProgress {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return { ...INITIAL_META, ...JSON.parse(raw) };
  } catch {}
  return { ...INITIAL_META };
}

function saveToStorage(meta: MetaProgress) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {}
}

export const createMetaSlice: StateCreator<MetaSlice, [], [], MetaSlice> = (set, get) => ({
  meta: loadFromStorage(),

  loadMeta: () => set({ meta: loadFromStorage() }),

  saveMeta: () => saveToStorage(get().meta),

  recordClear: (governmentType, era, score) =>
    set((s) => {
      const meta = { ...s.meta };
      meta.totalClears++;
      if (!meta.clearedGovernments.includes(governmentType)) {
        meta.clearedGovernments.push(governmentType);
      }
      if (era > meta.highestEra) meta.highestEra = era;
      if (score > meta.highScore) meta.highScore = score;
      saveToStorage(meta);
      return { meta };
    }),

  recordDefeat: (era, score) =>
    set((s) => {
      const meta = { ...s.meta };
      if (era > meta.highestEra) meta.highestEra = era;
      if (score > meta.highScore) meta.highScore = score;
      saveToStorage(meta);
      return { meta };
    }),
});
