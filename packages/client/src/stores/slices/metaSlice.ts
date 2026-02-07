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
      const meta = {
        ...s.meta,
        unlockedDecrees: [...s.meta.unlockedDecrees],
        unlockedCards: [...s.meta.unlockedCards],
        clearedGovernments: [...s.meta.clearedGovernments],
      };
      meta.totalClears++;
      if (!meta.clearedGovernments.includes(governmentType)) {
        meta.clearedGovernments.push(governmentType);
      }
      if (era > meta.highestEra) meta.highestEra = era;
      if (score > meta.highScore) meta.highScore = score;

      // Unlock rewards based on conditions
      // First clear: unlock 3 decrees
      if (meta.totalClears === 1) {
        for (const id of ['decree_info_control', 'decree_scapegoat_mechanism', 'decree_absolute_obedience']) {
          if (!meta.unlockedDecrees.includes(id)) meta.unlockedDecrees.push(id);
        }
      }
      // Theocracy clear: unlock 天命所归
      if (governmentType === 'theocracy' && !meta.unlockedDecrees.includes('decree_mandate_of_heaven')) {
        meta.unlockedDecrees.push('decree_mandate_of_heaven');
      }
      // Warlord clear: unlock 铁幕
      if (governmentType === 'warlord' && !meta.unlockedDecrees.includes('decree_iron_curtain')) {
        meta.unlockedDecrees.push('decree_iron_curtain');
      }
      // Era 5 clear: unlock 2 legendary cards
      if (era >= 5) {
        for (const id of ['card_enemy_corpse', 'card_child_drawing']) {
          if (!meta.unlockedCards.includes(id)) meta.unlockedCards.push(id);
        }
      }

      saveToStorage(meta);
      return { meta };
    }),

  recordDefeat: (era, score) =>
    set((s) => {
      const meta = {
        ...s.meta,
        unlockedCards: [...s.meta.unlockedCards],
      };
      if (era > meta.highestEra) meta.highestEra = era;
      if (score > meta.highScore) meta.highScore = score;

      // Era 3+ defeat: unlock 2 new cards
      if (era >= 3) {
        for (const id of ['card_rusted_medal', 'card_propaganda_leaflet']) {
          if (!meta.unlockedCards.includes(id)) meta.unlockedCards.push(id);
        }
      }

      saveToStorage(meta);
      return { meta };
    }),
});
