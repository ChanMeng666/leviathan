import type { StateCreator } from 'zustand';
import type { Decree, Consumable, IntentLevel } from '@leviathan/shared';
import { INTENTS } from '@leviathan/shared';

export interface ShopSlice {
  influence: number;
  equippedDecrees: Decree[];
  consumables: Consumable[];
  intentLevels: IntentLevel[];
  doublePlNext: boolean; // from terror broadcast consumable

  addInfluence: (amount: number) => void;
  spendInfluence: (amount: number) => boolean;
  equipDecree: (decree: Decree) => boolean;
  unequipDecree: (decreeId: string) => Decree | null;
  addConsumable: (consumable: Consumable) => boolean;
  useConsumable: (consumableId: string) => Consumable | null;
  upgradeIntent: (intentId: string) => boolean;
  getIntentLevel: (intentId: string) => number;
  setDoublePlNext: (v: boolean) => void;
  loadShop: (influence: number, decrees: Decree[], consumables: Consumable[], levels: IntentLevel[]) => void;
  resetShop: () => void;
}

export const createShopSlice: StateCreator<ShopSlice, [], [], ShopSlice> = (set, get) => ({
  influence: 0,
  equippedDecrees: [],
  consumables: [],
  intentLevels: INTENTS.map((i) => ({ intentId: i.id, level: 1 })),
  doublePlNext: false,

  addInfluence: (amount) =>
    set((s) => ({ influence: s.influence + amount })),

  spendInfluence: (amount) => {
    const s = get();
    if (s.influence < amount) return false;
    set({ influence: s.influence - amount });
    return true;
  },

  equipDecree: (decree) => {
    const s = get();
    if (s.equippedDecrees.length >= 5) return false;
    if (s.equippedDecrees.some((d) => d.id === decree.id)) return false;
    set({ equippedDecrees: [...s.equippedDecrees, decree] });
    return true;
  },

  unequipDecree: (decreeId) => {
    const s = get();
    const decree = s.equippedDecrees.find((d) => d.id === decreeId);
    if (!decree) return null;
    set({ equippedDecrees: s.equippedDecrees.filter((d) => d.id !== decreeId) });
    return decree;
  },

  addConsumable: (consumable) => {
    const s = get();
    if (s.consumables.length >= 2) return false;
    set({ consumables: [...s.consumables, consumable] });
    return true;
  },

  useConsumable: (consumableId) => {
    const s = get();
    const item = s.consumables.find((c) => c.id === consumableId);
    if (!item) return null;
    set({ consumables: s.consumables.filter((c) => c.id !== consumableId) });
    return item;
  },

  upgradeIntent: (intentId) => {
    const s = get();
    if (s.influence < 3) return false;
    const levels = s.intentLevels.map((l) =>
      l.intentId === intentId ? { ...l, level: l.level + 1 } : l,
    );
    set({ intentLevels: levels, influence: s.influence - 3 });
    return true;
  },

  getIntentLevel: (intentId) => {
    const s = get();
    return s.intentLevels.find((l) => l.intentId === intentId)?.level ?? 1;
  },

  setDoublePlNext: (v) => set({ doublePlNext: v }),

  loadShop: (influence, decrees, consumables, levels) =>
    set({ influence, equippedDecrees: decrees, consumables, intentLevels: levels }),

  resetShop: () =>
    set({
      influence: 0,
      equippedDecrees: [],
      consumables: [],
      intentLevels: INTENTS.map((i) => ({ intentId: i.id, level: 1 })),
      doublePlNext: false,
    }),
});
