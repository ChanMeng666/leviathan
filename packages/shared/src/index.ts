// Types
export type {
  GovernmentType,
  CardRarity,
  Card,
  MythCard,
  NationState,
  NationStatChanges,
  EventChoice,
  GameEvent,
  GamePhase,
  GameOverReason,
  ComboFormula,
  ScenarioChoice,
  Scenario,
  ScapegoatGroup,
} from './types/game.js';

export type {
  PromptStyle,
  WeaveRequest,
  WeaveResult,
  EventFlavorRequest,
  EventFlavorResult,
  JudgeRequest,
  JudgeResult,
  HistoryBookRequest,
  HistoryBookResult,
} from './types/ai.js';

export type {
  GameSaveState,
  GameSaveMeta,
  GameRunRecord,
  EventRecord,
  NarrativeEntry,
} from './types/save.js';

// Constants
export { INITIAL_CARDS, EXTENDED_CARDS, ALL_CARDS, getCardById } from './constants/cards.js';
export { GAME_EVENTS, getEventById } from './constants/events.js';
export { COMBO_FORMULAS, findMatchingCombo } from './constants/combos.js';
export {
  SYSTEM_PROMPTS,
  WEAVE_FORMAT_PROMPT,
  EVENT_FLAVOR_PROMPT,
  JUDGE_FORMAT_PROMPT,
  HISTORY_BOOK_PROMPT,
} from './constants/prompts.js';
