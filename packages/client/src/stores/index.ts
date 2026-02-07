import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNationSlice, type NationSlice } from './slices/nationSlice';
import { createCardsSlice, type CardsSlice } from './slices/cardsSlice';
import { createEventsSlice, type EventsSlice } from './slices/eventsSlice';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createNarrativeSlice, type NarrativeSlice } from './slices/narrativeSlice';
import { createAuthSlice, type AuthSlice } from './slices/authSlice';
import { createAudioSlice, type AudioSlice } from './slices/audioSlice';
import { createShopSlice, type ShopSlice } from './slices/shopSlice';
import { createMetaSlice, type MetaSlice } from './slices/metaSlice';
import { buildSaveState } from './buildSaveState';

export type GameStore = NationSlice & CardsSlice & EventsSlice & GameSlice & NarrativeSlice & AuthSlice & AudioSlice & ShopSlice & MetaSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createNationSlice(...a),
      ...createCardsSlice(...a),
      ...createEventsSlice(...a),
      ...createGameSlice(...a),
      ...createNarrativeSlice(...a),
      ...createAuthSlice(...a),
      ...createAudioSlice(...a),
      ...createShopSlice(...a),
      ...createMetaSlice(...a),
    }),
    {
      name: 'leviathan-save',
      version: 2, // Force clear old saves
      partialize: (state) => buildSaveState(state),
      migrate: () => {
        // V2 is a complete redesign — discard any old data
        return {} as any;
      },
    },
  ),
);
