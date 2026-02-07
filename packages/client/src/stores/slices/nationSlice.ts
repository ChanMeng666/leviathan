import type { StateCreator } from 'zustand';
import type { GovernmentType, MythCard, NationStatChanges, ScapegoatGroup } from '@leviathan/shared';
import { GOVERNMENT_AFFINITY_THRESHOLD } from '@leviathan/shared';

const INITIAL_SCAPEGOATS: ScapegoatGroup[] = [
  {
    id: 'sg_intellectuals',
    name: '知识分子',
    bonus_description: '+5 叙事完整度/回合',
    stat_bonus: { narrative_integrity: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_merchants',
    name: '商人阶层',
    bonus_description: '+5 给养/回合',
    stat_bonus: { supply_level: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_soldiers',
    name: '老兵集团',
    bonus_description: '+5 暴力权威/回合',
    stat_bonus: { violence_authority: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_priests',
    name: '宗教人士',
    bonus_description: '+5 理智/回合',
    stat_bonus: { sanity: 5 },
    sacrificed: false,
  },
];

const INITIAL_AFFINITIES: Record<GovernmentType, number> = {
  undefined: 0,
  theocracy: 0,
  warlord: 0,
  bureaucracy: 0,
  tribal: 0,
  fela: 0,
};

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
  scapegoats: ScapegoatGroup[];
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
  sacrificeGroup: (groupId: string) => void;
  loadNation: (nation: NationSlice['nation']) => void;
  loadScapegoats: (scapegoats: ScapegoatGroup[]) => void;
  loadAffinities: (affinities: Record<GovernmentType, number>) => void;
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

export const createNationSlice: StateCreator<NationSlice, [], [], NationSlice> = (set, get) => ({
  nation: { ...initialNation },
  scapegoats: INITIAL_SCAPEGOATS.map((s) => ({ ...s })),
  governmentAffinities: { ...INITIAL_AFFINITIES },
  pendingGovTransition: null,

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

  incrementAffinity: (type, amount) =>
    set((s) => {
      const affinities = { ...s.governmentAffinities };
      affinities[type] = clamp((affinities[type] || 0) + amount);

      // Check if any affinity crossed the threshold for a government type change
      let newGovType = s.nation.government_type;
      let highestAffinity = 0;

      for (const [govType, value] of Object.entries(affinities)) {
        if (govType === 'undefined' || govType === 'fela') continue;
        if (value >= GOVERNMENT_AFFINITY_THRESHOLD && value > highestAffinity) {
          highestAffinity = value;
          newGovType = govType as GovernmentType;
        }
      }

      // Check fela condition: if all main stats are low
      const n = s.nation;
      if (n.narrative_integrity < 20 && n.violence_authority < 20 && n.supply_level < 20) {
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
    if (transition) {
      set({ pendingGovTransition: null });
    }
    return transition;
  },

  sacrificeGroup: (groupId) =>
    set((s) => ({
      scapegoats: s.scapegoats.map((sg) =>
        sg.id === groupId ? { ...sg, sacrificed: true } : sg,
      ),
    })),

  loadNation: (nation) => set({ nation }),

  loadScapegoats: (scapegoats) => set({ scapegoats }),

  loadAffinities: (affinities) => set({ governmentAffinities: affinities }),

  resetNation: () =>
    set({
      nation: { ...initialNation, mythology: [], traits: [], history_log: [] },
      scapegoats: INITIAL_SCAPEGOATS.map((s) => ({ ...s })),
      governmentAffinities: { ...INITIAL_AFFINITIES },
    }),
});
