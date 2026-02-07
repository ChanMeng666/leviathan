import type { StateCreator } from 'zustand';
import type { Card } from '@leviathan/shared';
import { INITIAL_CARDS, EXTENDED_CARDS, getCardById } from '@leviathan/shared';

export interface CardsSlice {
  deck: Card[];        // Draw pile
  hand: Card[];        // Current hand
  discard: Card[];     // Used cards
  selectedCards: Card[]; // Cards selected for the loom
  discoveredExtended: string[];  // IDs of discovered extended cards

  drawCards: (n: number) => void;
  selectCard: (card: Card) => void;
  deselectCard: (cardId: string) => void;
  clearSelection: () => void;
  discardSelected: () => void;
  addCardToHand: (card: Card) => void;
  addCardToDeck: (card: Card) => void;
  discoverCard: (cardId: string) => boolean;  // returns true if newly discovered
  loadCards: (deck: Card[], hand: Card[], discard: Card[]) => void;
  loadDiscovered: (discovered: string[]) => void;
  resetCards: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const createCardsSlice: StateCreator<CardsSlice, [], [], CardsSlice> = (set, get) => ({
  deck: shuffleArray(INITIAL_CARDS),
  hand: [],
  discard: [],
  selectedCards: [],
  discoveredExtended: [],

  drawCards: (n) =>
    set((s) => {
      let deck = [...s.deck];
      const hand = [...s.hand];
      let reshuffled = false;

      // Reshuffle discard into deck if needed
      if (deck.length < n) {
        deck = [...deck, ...shuffleArray(s.discard)];
        reshuffled = true;
      }

      const drawn = deck.splice(0, n);
      hand.push(...drawn);

      return { deck, hand, discard: reshuffled ? [] : s.discard };
    }),

  selectCard: (card) =>
    set((s) => {
      if (s.selectedCards.length >= 3) return s;
      if (s.selectedCards.find((c) => c.id === card.id)) return s;
      return {
        selectedCards: [...s.selectedCards, card],
        hand: s.hand.filter((c) => c.id !== card.id),
      };
    }),

  deselectCard: (cardId) =>
    set((s) => {
      const card = s.selectedCards.find((c) => c.id === cardId);
      if (!card) return s;
      return {
        selectedCards: s.selectedCards.filter((c) => c.id !== cardId),
        hand: [...s.hand, card],
      };
    }),

  clearSelection: () =>
    set((s) => ({
      hand: [...s.hand, ...s.selectedCards],
      selectedCards: [],
    })),

  discardSelected: () =>
    set((s) => ({
      discard: [...s.discard, ...s.selectedCards],
      selectedCards: [],
    })),

  addCardToHand: (card) =>
    set((s) => ({ hand: [...s.hand, card] })),

  addCardToDeck: (card) =>
    set((s) => ({ deck: [...s.deck, card] })),

  discoverCard: (cardId) => {
    const s = get();
    if (s.discoveredExtended.includes(cardId)) return false;
    const card = getCardById(cardId);
    if (!card) return false;
    set({
      discoveredExtended: [...s.discoveredExtended, cardId],
      hand: [...s.hand, card],
    });
    return true;
  },

  loadCards: (deck, hand, discard) =>
    set({ deck, hand, discard, selectedCards: [] }),

  loadDiscovered: (discovered) =>
    set({ discoveredExtended: discovered }),

  resetCards: () =>
    set({
      deck: shuffleArray(INITIAL_CARDS),
      hand: [],
      discard: [],
      selectedCards: [],
      discoveredExtended: [],
    }),
});
