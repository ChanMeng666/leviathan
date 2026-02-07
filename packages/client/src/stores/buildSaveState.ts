import type { GameSaveState, Card } from '@leviathan/shared';

type SaveableState = GameSaveState & { selectedCards: Card[] };

/**
 * Build a safe snapshot of game state for persistence.
 * - Merges selectedCards back into hand
 * - Normalizes transient phases
 */
export function buildSaveState(state: SaveableState): GameSaveState {
  return {
    nation: state.nation,
    deck: state.deck,
    hand: state.selectedCards?.length > 0
      ? [...state.hand, ...state.selectedCards]
      : state.hand,
    discard: state.discard,
    phase: state.phase === 'era_transition' ? 'crisis_start' : state.phase === 'prologue' ? 'crisis_start' : state.phase,
    gameOver: state.gameOver,
    gameOverReason: state.gameOverReason,
    eventHistory: state.eventHistory,
    narrativeLog: state.narrativeLog,
    crisisState: state.crisisState,
    influence: state.influence,
    equippedDecrees: state.equippedDecrees,
    consumables: state.consumables,
    intentLevels: state.intentLevels,
  };
}
