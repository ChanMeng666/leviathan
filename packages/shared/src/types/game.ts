// ===== Government Types =====
export type GovernmentType =
  | 'undefined'       // 未定义的武装集团
  | 'theocracy'       // 神权国家
  | 'warlord'         // 军阀政权
  | 'bureaucracy'     // 官僚体制
  | 'tribal'          // 部落联盟
  | 'fela';           // 费拉不堪

// ===== Card Types =====
export type CardRarity = 'common' | 'rare' | 'legendary';
export type CardEnhancement = 'normal' | 'foil' | 'holographic';

export interface Card {
  id: string;
  name: string;
  tags: string[];
  description: string;
  physical_value: number;
  narrative_potential: number;
  rarity: CardRarity;
  enhancement?: CardEnhancement;
}

// ===== Myth Buff =====
export interface MythCard {
  id: string;
  name: string;
  description: string;
  effect: Partial<NationStatChanges>;
  source_combo: string[];  // Card IDs used to create it
}

// ===== Nation State (Simplified 3+2) =====
export interface NationState {
  name: string;
  power: number;          // 0-100, ≤0 → 暴乱 (was violence_authority)
  supply: number;         // 0-100, ≤0 → 饥荒 (was supply_level)
  sanity: number;         // 0-100, ≤0 → 精神崩溃
  tyranny: number;        // 0-100, scaling stat (merged cruelty + corruption)
  mythDensity: number;    // 0-100, scaling stat (replaces narrative_integrity)
  mythology: MythCard[];
  traits: string[];
  government_type: GovernmentType;
  population: number;
  history_log: string[];
}

export type NationStatChanges = Pick<
  NationState,
  | 'power'
  | 'supply'
  | 'sanity'
  | 'tyranny'
  | 'mythDensity'
  | 'population'
>;

// ===== Events =====
export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effect: Partial<NationStatChanges>;
  ai_intent: string;
  new_trait?: string;
  new_card?: string;
  scoringReward?: { baseBonus?: number; multBonus?: number; influence?: number };
}

export interface GameEvent {
  id: string;
  title: string;
  base_text: string;
  eraRange: [number, number];  // [minEra, maxEra] — when this event can appear
  choices: EventChoice[];
}

// ===== Game Phase =====
export type GamePhase =
  | 'prologue'         // Opening prologue
  | 'crisis_start'     // Show crisis target
  | 'weave'            // Play cards / weave (can repeat)
  | 'crisis_end'       // Round results
  | 'shop'             // Black market shop
  | 'era_transition'   // Era narrative + event
  | 'victory'          // Won the game
  | 'gameover';        // Death screen

export type GameOverReason =
  | 'riot'             // power ≤ 0
  | 'starvation'       // supply ≤ 0
  | 'insanity';        // sanity ≤ 0

// ===== Crisis / Era =====
export type CrisisType = 'small' | 'big' | 'boss';

export interface CrisisDefinition {
  era: number;
  crisisIndex: number;
  crisisType: CrisisType;
  targetScore: number;
  bossModifier: string | null;
}

export interface CrisisState {
  era: number;              // 1-5
  crisisIndex: number;      // 0-2 (small/big/boss)
  crisisType: CrisisType;
  targetScore: number;
  bossModifier: string | null;
  roundScore: number;       // accumulated this crisis
  lives: number;            // starts at 3
  weavesRemaining: number;  // per crisis, starts at 3
  discardsRemaining: number; // per crisis, starts at 2
  handSize: number;         // default 5, upgradable
  totalScore: number;       // lifetime score across all crises
}

// ===== Scoring =====
export interface ScoringStep {
  label: string;
  nfDelta: number;
  plDelta: number;
  nfAfter: number;
  plAfter: number;
}

export interface ScoringBreakdown {
  steps: ScoringStep[];
  finalNF: number;
  finalPL: number;
  finalScore: number;
}

// ===== Narrative Intent =====
export interface NarrativeIntent {
  id: string;
  name: string;
  base_nf: number;
  base_pl: number;
  risk: number;
  minCards: number;
  description: string;
}

export interface IntentLevel {
  intentId: string;
  level: number;  // starts at 1
}

// ===== Combo =====
export interface ComboFormula {
  id: string;
  name: string;
  description: string;
  required_cards: string[];  // Card IDs (all must be present)
  result: MythCard;
  nfBonus: number;
  plBonus: number;
}

// ===== Scenario =====
export interface ScenarioChoice {
  id: string;
  label: string;
  description: string;
  effect: Partial<NationStatChanges>;
  ai_intent: string;
  new_trait?: string;
  new_cards?: string[];
}

export interface Scenario {
  id: string;
  day: number;
  title: string;
  text: string;
  choices: ScenarioChoice[];
  triggered: boolean;
}

// ===== Decree (Joker equivalent) =====
export type DecreeRarity = 'common' | 'rare' | 'legendary';

export interface Decree {
  id: string;
  name: string;
  description: string;
  rarity: DecreeRarity;
  cost: number;
  sellValue: number;
  // Effect type determines when/how it applies during scoring
  effectType: 'add_nf' | 'add_pl' | 'mult_pl' | 'conditional';
  effectValue: number;
  // For conditional decrees
  condition?: string;
}

// ===== Consumable =====
export interface Consumable {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'extra_weave' | 'remove_card' | 'restore_life' | 'double_pl';
}

// ===== Scapegoat (kept for thematic reasons) =====
export interface ScapegoatGroup {
  id: string;
  name: string;
  bonus_description: string;
  stat_bonus: Partial<NationStatChanges>;
  sacrificed: boolean;
}

// ===== Boss Modifier =====
export interface BossModifier {
  id: string;
  name: string;
  description: string;
  effect: string;
}
