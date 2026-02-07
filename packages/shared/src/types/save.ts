import type { Card, NationState, GamePhase, GameOverReason } from './game.js';

export interface EventRecord {
  eventId: string;
  day: number;
  choiceId: string;
}

export interface NarrativeEntry {
  id: string;
  day: number;
  title: string;
  text: string;
  comment: string;
  timestamp: number;
}

/** Full game state for cloud save (matches Zustand partialize shape) */
export interface GameSaveState {
  nation: NationState;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  day: number;
  phase: GamePhase;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  eventHistory: EventRecord[];
  eventCooldowns: Record<string, number>;
  narrativeLog: NarrativeEntry[];
}

/** Lightweight save listing for UI display */
export interface GameSaveMeta {
  id: string;
  slotName: string;
  day: number;
  phase: GamePhase;
  gameOver: boolean;
  nationName: string;
  updatedAt: string;
}

/** Completed game run record */
export interface GameRunRecord {
  id: string;
  nationName: string;
  daysSurvived: number;
  deathReason: string;
  governmentType: string;
  finalPopulation: number;
  epitaph: string | null;
  createdAt: string;
}
