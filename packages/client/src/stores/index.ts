import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNationSlice, type NationSlice } from './slices/nationSlice';
import { createCardsSlice, type CardsSlice } from './slices/cardsSlice';
import { createEventsSlice, type EventsSlice } from './slices/eventsSlice';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createNarrativeSlice, type NarrativeSlice } from './slices/narrativeSlice';

export type GameStore = NationSlice & CardsSlice & EventsSlice & GameSlice & NarrativeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createNationSlice(...a),
      ...createCardsSlice(...a),
      ...createEventsSlice(...a),
      ...createGameSlice(...a),
      ...createNarrativeSlice(...a),
    }),
    {
      name: 'leviathan-save',
      partialize: (state) => ({
        // Persist game-critical state; skip transient UI state
        nation: state.nation,
        deck: state.deck,
        hand: state.hand,
        discard: state.discard,
        day: state.day,
        phase: state.phase,
        gameOver: state.gameOver,
        gameOverReason: state.gameOverReason,
        eventHistory: state.eventHistory,
        eventCooldowns: state.eventCooldowns,
        narrativeLog: state.narrativeLog,
      }),
    },
  ),
);
