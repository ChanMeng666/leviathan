import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNationSlice, type NationSlice } from './slices/nationSlice';
import { createCardsSlice, type CardsSlice } from './slices/cardsSlice';
import { createEventsSlice, type EventsSlice } from './slices/eventsSlice';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createNarrativeSlice, type NarrativeSlice } from './slices/narrativeSlice';
import { createAuthSlice, type AuthSlice } from './slices/authSlice';
import { createAudioSlice, type AudioSlice } from './slices/audioSlice';
import { buildSaveState } from './buildSaveState';

export type GameStore = NationSlice & CardsSlice & EventsSlice & GameSlice & NarrativeSlice & AuthSlice & AudioSlice;

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
    }),
    {
      name: 'leviathan-save',
      partialize: (state) => buildSaveState(state),
    },
  ),
);
