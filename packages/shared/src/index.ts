// Types
export type {
  GovernmentType,
  CardRarity,
  CardEnhancement,
  Card,
  MythCard,
  NationState,
  NationStatChanges,
  EventChoice,
  GameEvent,
  GamePhase,
  GameOverReason,
  CrisisType,
  CrisisDefinition,
  CrisisState,
  ScoringStep,
  ScoringBreakdown,
  NarrativeIntent,
  IntentLevel,
  ComboFormula,
  ScenarioChoice,
  Scenario,
  ScapegoatGroup,
  DecreeRarity,
  Decree,
  Consumable,
  BossModifier,
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
export { GAME_EVENTS, getEventById, getEraTransitionEvent } from './constants/events.js';
export { COMBO_FORMULAS, findMatchingCombo } from './constants/combos.js';
export { PROLOGUE_SCENARIO } from './constants/scenarios.js';
export {
  GOVERNMENT_EFFECTS,
  GOVERNMENT_LABELS,
  GOVERNMENT_DESCRIPTIONS,
  GOVERNMENT_AFFINITY_THRESHOLD,
  DEATH_REASON_LABELS,
  STAT_LABELS,
} from './constants/governments.js';
export {
  SYSTEM_PROMPTS,
  WEAVE_FORMAT_PROMPT,
  EVENT_FLAVOR_PROMPT,
  JUDGE_FORMAT_PROMPT,
  HISTORY_BOOK_PROMPT,
} from './constants/prompts.js';
export { ERAS, getCrisis, getEra, getNextCrisis, getCrisisReward } from './constants/eras.js';
export { INTENTS, TAG_AFFINITIES, getIntentById, countTagMatches } from './constants/intents.js';
export { calculateScore, applyComboBonus } from './constants/scoring.js';
export type { ScoringInput } from './constants/scoring.js';
export { DECREES, getDecreeById, getShopDecrees } from './constants/decrees.js';
export { CONSUMABLES, getShopConsumables } from './constants/consumables.js';
export { BOSS_MODIFIERS, getBossModifier } from './constants/bossModifiers.js';
export { UNLOCK_CONDITIONS } from './constants/unlocks.js';
