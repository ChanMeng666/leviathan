import type { StateCreator } from 'zustand';
import type { GovernmentType, MythCard, NationStatChanges } from '@leviathan/shared';

export interface NationSlice {
  nation: {
    name: string;
    narrative_integrity: number;
    violence_authority: number;
    supply_level: number;
    sanity: number;
    cruelty: number;
    corruption: number;
    mythology: MythCard[];
    traits: string[];
    government_type: GovernmentType;
    population: number;
    history_log: string[];
  };
  setNationName: (name: string) => void;
  applyStatChanges: (changes: Partial<NationStatChanges>) => void;
  addTrait: (trait: string) => void;
  addMythology: (myth: MythCard) => void;
  addHistoryEntry: (entry: string) => void;
  setGovernmentType: (type: GovernmentType) => void;
  resetNation: () => void;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const initialNation: NationSlice['nation'] = {
  name: '未定义的武装集团',
  narrative_integrity: 30,
  violence_authority: 40,
  supply_level: 50,
  sanity: 80,
  cruelty: 10,
  corruption: 10,
  mythology: [],
  traits: [],
  government_type: 'undefined',
  population: 500,
  history_log: [],
};

export const createNationSlice: StateCreator<NationSlice, [], [], NationSlice> = (set) => ({
  nation: { ...initialNation },

  setNationName: (name) =>
    set((s) => ({ nation: { ...s.nation, name } })),

  applyStatChanges: (changes) =>
    set((s) => {
      const n = { ...s.nation };
      if (changes.narrative_integrity != null)
        n.narrative_integrity = clamp(n.narrative_integrity + changes.narrative_integrity);
      if (changes.violence_authority != null)
        n.violence_authority = clamp(n.violence_authority + changes.violence_authority);
      if (changes.supply_level != null)
        n.supply_level = clamp(n.supply_level + changes.supply_level);
      if (changes.sanity != null) n.sanity = clamp(n.sanity + changes.sanity);
      if (changes.cruelty != null) n.cruelty = clamp(n.cruelty + changes.cruelty);
      if (changes.corruption != null)
        n.corruption = clamp(n.corruption + changes.corruption);
      if (changes.population != null)
        n.population = Math.max(0, n.population + changes.population);
      return { nation: n };
    }),

  addTrait: (trait) =>
    set((s) => {
      if (s.nation.traits.includes(trait)) return s;
      return { nation: { ...s.nation, traits: [...s.nation.traits, trait] } };
    }),

  addMythology: (myth) =>
    set((s) => ({
      nation: { ...s.nation, mythology: [...s.nation.mythology, myth] },
    })),

  addHistoryEntry: (entry) =>
    set((s) => ({
      nation: {
        ...s.nation,
        history_log: [...s.nation.history_log, entry],
      },
    })),

  setGovernmentType: (type) =>
    set((s) => ({ nation: { ...s.nation, government_type: type } })),

  resetNation: () => set({ nation: { ...initialNation, mythology: [], traits: [], history_log: [] } }),
});
