import type { Card, NationState, GovernmentType, GamePhase, GameOverReason, CrisisState, Decree, Consumable, IntentLevel } from './game.js';

export interface EventRecord {
  eventId: string;
  era: number;
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

/** Full game state for cloud save */
export interface GameSaveState {
  nation: NationState;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  phase: GamePhase;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  eventHistory: EventRecord[];
  narrativeLog: NarrativeEntry[];
  // New crisis system
  crisisState: CrisisState;
  // Shop state
  influence: number;
  equippedDecrees: Decree[];
  consumables: Consumable[];
  intentLevels: IntentLevel[];
}

/** Lightweight save listing for UI display */
export interface GameSaveMeta {
  id: string;
  slotName: string;
  era: number;
  crisisIndex: number;
  phase: GamePhase;
  gameOver: boolean;
  nationName: string;
  totalScore: number;
  updatedAt: string;
}

/** Completed game run record */
export interface GameRunRecord {
  id: string;
  nationName: string;
  erasSurvived: number;
  deathReason: string | null;
  victoryType: string | null;
  governmentType: string;
  totalScore: number;
  finalPopulation: number;
  epitaph: string | null;
  traits: string[] | null;
  mythology: { name: string; description: string }[] | null;
  finalStats: {
    power: number;
    supply: number;
    sanity: number;
    tyranny: number;
    mythDensity: number;
  } | null;
  historyBookTitle: string | null;
  historyBookBody: string | null;
  historyLog: string[] | null;
  createdAt: string;
}
