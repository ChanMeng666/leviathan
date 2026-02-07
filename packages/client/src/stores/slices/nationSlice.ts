import type { StateCreator } from 'zustand';
import type { GovernmentType, MythCard, NationStatChanges } from '@leviathan/shared';
import { GOVERNMENT_AFFINITY_THRESHOLD } from '@leviathan/shared';

export interface NationSlice {
  nation: {
    name: string;
    power: number;
    supply: number;
    sanity: number;
    tyranny: number;
    mythDensity: number;
    mythology: MythCard[];
    traits: string[];
    government_type: GovernmentType;
    population: number;
    history_log: string[];
  };
  governmentAffinities: Record<GovernmentType, number>;
  pendingGovTransition: GovernmentType | null;
  setNationName: (name: string) => void;
  applyStatChanges: (changes: Partial<NationStatChanges>) => void;
  addTrait: (trait: string) => void;
  addMythology: (myth: MythCard) => void;
  addHistoryEntry: (entry: string) => void;
  setGovernmentType: (type: GovernmentType) => void;
  incrementAffinity: (type: GovernmentType, amount: number) => void;
  consumeGovTransition: () => GovernmentType | null;
  loadNation: (nation: NationSlice['nation']) => void;
  loadAffinities: (affinities: Record<GovernmentType, number>) => void;
  resetNation: () => void;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const INITIAL_AFFINITIES: Record<GovernmentType, number> = {
  undefined: 0, theocracy: 0, warlord: 0, bureaucracy: 0, tribal: 0, fela: 0,
};

const initialNation: NationSlice['nation'] = {
  name: '未定义的武装集团',
  power: 50,
  supply: 50,
  sanity: 70,
  tyranny: 10,
  mythDensity: 10,
  mythology: [],
  traits: [],
  government_type: 'undefined',
  population: 500,
  history_log: [],
};

export const createNationSlice: StateCreator<NationSlice, [], [], NationSlice> = (set, get) => ({
  nation: { ...initialNation },
  governmentAffinities: { ...INITIAL_AFFINITIES },
  pendingGovTransition: null,

  setNationName: (name) =>
    set((s) => ({ nation: { ...s.nation, name } })),

  applyStatChanges: (changes) =>
    set((s) => {
      const n = { ...s.nation };
      if (changes.power != null) n.power = clamp(n.power + changes.power);
      if (changes.supply != null) n.supply = clamp(n.supply + changes.supply);
      if (changes.sanity != null) n.sanity = clamp(n.sanity + changes.sanity);
      if (changes.tyranny != null) n.tyranny = clamp(n.tyranny + changes.tyranny);
      if (changes.mythDensity != null) n.mythDensity = clamp(n.mythDensity + changes.mythDensity);
      if (changes.population != null) n.population = Math.max(0, n.population + changes.population);
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
      nation: { ...s.nation, history_log: [...s.nation.history_log, entry] },
    })),

  setGovernmentType: (type) =>
    set((s) => ({ nation: { ...s.nation, government_type: type } })),

  incrementAffinity: (type, amount) =>
    set((s) => {
      const affinities = { ...s.governmentAffinities };
      affinities[type] = clamp((affinities[type] || 0) + amount);

      let newGovType = s.nation.government_type;
      let highestAffinity = 0;

      for (const [govType, value] of Object.entries(affinities)) {
        if (govType === 'undefined' || govType === 'fela') continue;
        if (value >= GOVERNMENT_AFFINITY_THRESHOLD && value > highestAffinity) {
          highestAffinity = value;
          newGovType = govType as GovernmentType;
        }
      }

      // Fela check
      const n = s.nation;
      if (n.power < 20 && n.supply < 20 && n.sanity < 20) {
        newGovType = 'fela';
      }

      if (newGovType !== s.nation.government_type) {
        return {
          governmentAffinities: affinities,
          nation: { ...s.nation, government_type: newGovType },
          pendingGovTransition: newGovType,
        };
      }

      return { governmentAffinities: affinities };
    }),

  consumeGovTransition: () => {
    const transition = get().pendingGovTransition;
    if (transition) set({ pendingGovTransition: null });
    return transition;
  },

  loadNation: (nation) => set({ nation }),
  loadAffinities: (affinities) => set({ governmentAffinities: affinities }),

  resetNation: () =>
    set({
      nation: { ...initialNation, mythology: [], traits: [], history_log: [] },
      governmentAffinities: { ...INITIAL_AFFINITIES },
      pendingGovTransition: null,
    }),
});
