import type { StateCreator } from 'zustand';
import type { GamePhase, GameOverReason } from '@leviathan/shared';

export interface GameSlice {
  day: number;
  phase: GamePhase;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  isWeaving: boolean;       // AI request in progress
  showMenu: boolean;

  nextDay: () => void;
  setPhase: (phase: GamePhase) => void;
  setGameOver: (reason: GameOverReason) => void;
  setIsWeaving: (v: boolean) => void;
  setShowMenu: (v: boolean) => void;
  resetGame: () => void;
}

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set) => ({
  day: 0,
  phase: 'draw',
  gameOver: false,
  gameOverReason: null,
  isWeaving: false,
  showMenu: true,

  nextDay: () =>
    set((s) => ({ day: s.day + 1, phase: 'draw' })),

  setPhase: (phase) => set({ phase }),

  setGameOver: (reason) =>
    set({ gameOver: true, gameOverReason: reason, phase: 'gameover' }),

  setIsWeaving: (v) => set({ isWeaving: v }),

  setShowMenu: (v) => set({ showMenu: v }),

  resetGame: () =>
    set({
      day: 0,
      phase: 'draw',
      gameOver: false,
      gameOverReason: null,
      isWeaving: false,
      showMenu: true,
    }),
});
