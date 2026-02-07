import type { StateCreator } from 'zustand';
import type { GamePhase, GameOverReason } from '@leviathan/shared';

export type Screen = 'welcome' | 'game' | 'gallery';

export interface GameSlice {
  day: number;
  phase: GamePhase;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  isWeaving: boolean;       // AI request in progress
  screen: Screen;

  nextDay: () => void;
  setPhase: (phase: GamePhase) => void;
  setGameOver: (reason: GameOverReason) => void;
  setIsWeaving: (v: boolean) => void;
  setScreen: (s: Screen) => void;
  loadGame: (day: number, phase: GamePhase, gameOver: boolean, gameOverReason: GameOverReason | null) => void;
  resetGame: () => void;
}

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set) => ({
  day: 0,
  phase: 'draw',
  gameOver: false,
  gameOverReason: null,
  isWeaving: false,
  screen: 'welcome',

  nextDay: () =>
    set((s) => ({ day: s.day + 1, phase: 'draw' })),

  setPhase: (phase) => set({ phase }),

  setGameOver: (reason) =>
    set({ gameOver: true, gameOverReason: reason, phase: 'gameover' }),

  setIsWeaving: (v) => set({ isWeaving: v }),

  setScreen: (s) => set({ screen: s }),

  loadGame: (day, phase, gameOver, gameOverReason) =>
    set({ day, phase, gameOver, gameOverReason, isWeaving: false, screen: 'game' }),

  resetGame: () =>
    set({
      day: 0,
      phase: 'prologue',
      gameOver: false,
      gameOverReason: null,
      isWeaving: false,
      screen: 'welcome',
    }),
});
