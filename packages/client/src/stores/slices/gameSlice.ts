import type { StateCreator } from 'zustand';
import type { GamePhase, GameOverReason, CrisisState, ScoringBreakdown } from '@leviathan/shared';
import { getCrisis } from '@leviathan/shared';

export type Screen = 'welcome' | 'game' | 'gallery';

const INITIAL_CRISIS: CrisisState = {
  era: 1,
  crisisIndex: 0,
  crisisType: 'small',
  targetScore: 300,
  bossModifier: null,
  roundScore: 0,
  lives: 3,
  weavesRemaining: 3,
  discardsRemaining: 2,
  handSize: 5,
  totalScore: 0,
};

export interface GameSlice {
  phase: GamePhase;
  crisisState: CrisisState;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  isWeaving: boolean;
  screen: Screen;
  pendingScoreAnimation: ScoringBreakdown | null;

  setPhase: (phase: GamePhase) => void;
  setCrisisState: (crisis: Partial<CrisisState>) => void;
  addRoundScore: (score: number) => void;
  useWeave: () => boolean;
  useDiscard: () => boolean;
  advanceCrisis: () => CrisisState | null; // returns next crisis or null (victory)
  setGameOver: (reason: GameOverReason) => void;
  setIsWeaving: (v: boolean) => void;
  setScreen: (s: Screen) => void;
  setPendingScoreAnimation: (anim: ScoringBreakdown | null) => void;
  loadGame: (phase: GamePhase, crisis: CrisisState, gameOver: boolean, gameOverReason: GameOverReason | null) => void;
  resetGame: () => void;
}

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set, get) => ({
  phase: 'prologue',
  crisisState: { ...INITIAL_CRISIS },
  gameOver: false,
  gameOverReason: null,
  isWeaving: false,
  screen: 'welcome',
  pendingScoreAnimation: null,

  setPhase: (phase) => set({ phase }),

  setCrisisState: (crisis) =>
    set((s) => ({ crisisState: { ...s.crisisState, ...crisis } })),

  addRoundScore: (score) =>
    set((s) => ({
      crisisState: {
        ...s.crisisState,
        roundScore: s.crisisState.roundScore + score,
        totalScore: s.crisisState.totalScore + score,
      },
    })),

  useWeave: () => {
    const s = get();
    if (s.crisisState.weavesRemaining <= 0) return false;
    set((state) => ({
      crisisState: {
        ...state.crisisState,
        weavesRemaining: state.crisisState.weavesRemaining - 1,
      },
    }));
    return true;
  },

  useDiscard: () => {
    const s = get();
    if (s.crisisState.discardsRemaining <= 0) return false;
    set((state) => ({
      crisisState: {
        ...state.crisisState,
        discardsRemaining: state.crisisState.discardsRemaining - 1,
      },
    }));
    return true;
  },

  advanceCrisis: () => {
    const s = get();
    const { era, crisisIndex } = s.crisisState;
    let nextEra = era;
    let nextIndex = crisisIndex + 1;

    if (nextIndex > 2) {
      nextEra = era + 1;
      nextIndex = 0;
    }

    if (nextEra > 5) {
      // Victory!
      return null;
    }

    const nextCrisisDef = getCrisis(nextEra, nextIndex);
    if (!nextCrisisDef) return null;

    // Determine weaves for boss modifier 'silence'
    let weaves = 3;
    if (nextCrisisDef.bossModifier === 'silence') weaves = 1;

    const nextState: CrisisState = {
      era: nextEra,
      crisisIndex: nextIndex,
      crisisType: nextCrisisDef.crisisType,
      targetScore: nextCrisisDef.targetScore,
      bossModifier: nextCrisisDef.bossModifier,
      roundScore: 0,
      lives: s.crisisState.lives,
      weavesRemaining: weaves,
      discardsRemaining: 2,
      handSize: s.crisisState.handSize,
      totalScore: s.crisisState.totalScore,
    };

    set({ crisisState: nextState });
    return nextState;
  },

  setGameOver: (reason) =>
    set({ gameOver: true, gameOverReason: reason, phase: 'gameover' }),

  setIsWeaving: (v) => set({ isWeaving: v }),

  setScreen: (s) => set({ screen: s }),

  setPendingScoreAnimation: (anim) => set({ pendingScoreAnimation: anim }),

  loadGame: (phase, crisis, gameOver, gameOverReason) =>
    set({ phase, crisisState: crisis, gameOver, gameOverReason, isWeaving: false, screen: 'game' }),

  resetGame: () =>
    set({
      phase: 'prologue',
      crisisState: { ...INITIAL_CRISIS },
      gameOver: false,
      gameOverReason: null,
      isWeaving: false,
      screen: 'welcome',
      pendingScoreAnimation: null,
    }),
});
