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

export interface Card {
  id: string;
  name: string;
  tags: string[];
  description: string;
  physical_value: number;
  narrative_potential: number;
  rarity: CardRarity;
}

// ===== Myth Buff =====
export interface MythCard {
  id: string;
  name: string;
  description: string;
  effect: Partial<NationStatChanges>;
  source_combo: string[];  // Card IDs used to create it
}

// ===== Nation State =====
export interface NationState {
  name: string;
  narrative_integrity: number;  // 0-100 blue
  violence_authority: number;   // 0-100 red
  supply_level: number;         // 0-100 yellow
  sanity: number;               // 0-100 hidden
  cruelty: number;              // 0-100
  corruption: number;           // 0-100
  mythology: MythCard[];
  traits: string[];
  government_type: GovernmentType;
  population: number;
  history_log: string[];
}

export type NationStatChanges = Pick<
  NationState,
  | 'narrative_integrity'
  | 'violence_authority'
  | 'supply_level'
  | 'sanity'
  | 'cruelty'
  | 'corruption'
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
}

export interface GameEvent {
  id: string;
  title: string;
  base_text: string;
  trigger: (stats: NationState) => boolean;
  choices: EventChoice[];
  cooldown: number;
}

// ===== Game Phase =====
export type GamePhase =
  | 'prologue'    // Opening prologue (Day 0)
  | 'draw'        // Draw cards
  | 'action'      // Play cards / weave narratives
  | 'event'       // Resolve events
  | 'settle'      // End-of-day settlement
  | 'gameover';   // Death screen

export type GameOverReason =
  | 'riot'        // violence <= 0
  | 'starvation'  // supply <= 0
  | 'madness'     // narrative >= 100
  | 'insanity';   // sanity <= 0

// ===== Combo =====
export interface ComboFormula {
  id: string;
  name: string;
  description: string;
  required_cards: string[];  // Card IDs (all must be present)
  result: MythCard;
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

// ===== Scapegoat =====
export interface ScapegoatGroup {
  id: string;
  name: string;
  bonus_description: string;
  stat_bonus: Partial<NationStatChanges>;
  sacrificed: boolean;
}
