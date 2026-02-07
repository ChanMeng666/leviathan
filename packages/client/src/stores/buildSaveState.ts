import type { GameSaveState, Card } from '@leviathan/shared';

type SaveableState = GameSaveState & { selectedCards: Card[] };

/**
 * Build a safe snapshot of game state for persistence.
 * - Merges selectedCards back into hand (selectedCards are transient)
 * - Normalizes event phase to action (activeEvent is transient)
 * - Normalizes prologue phase to draw (prologue is one-time)
 */
export function buildSaveState(state: SaveableState): GameSaveState {
  return {
    nation: state.nation,
    deck: state.deck,
    hand: state.selectedCards.length > 0
      ? [...state.hand, ...state.selectedCards]
      : state.hand,
    discard: state.discard,
    day: state.day,
    phase: state.phase === 'event' ? 'action' : state.phase === 'prologue' ? 'draw' : state.phase,
    gameOver: state.gameOver,
    gameOverReason: state.gameOverReason,
    eventHistory: state.eventHistory,
    eventCooldowns: state.eventCooldowns,
    narrativeLog: state.narrativeLog,
    scapegoats: state.scapegoats,
    governmentAffinities: state.governmentAffinities,
    discoveredExtended: state.discoveredExtended,
  };
}
