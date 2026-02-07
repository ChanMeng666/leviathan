import type { NationStatChanges, Card, GovernmentType } from './game.js';

// ===== Prompt Style =====
export type PromptStyle =
  | 'historian'     // A: 解构主义史官
  | 'propagandist'  // B: 狂热宣传机器
  | 'nihilist';     // C: 市井虚无主义者

// ===== Weave Request / Response =====
export interface WeaveRequest {
  card_ids: string[];
  intent: string;         // Player's chosen narrative intent
  nation_state: {
    name: string;
    power: number;
    supply: number;
    sanity: number;
    tyranny: number;
    mythDensity: number;
    traits: string[];
    government_type: GovernmentType;
    population: number;
  };
  history_context: string[];  // Recent history_log entries
}

export interface WeaveResult {
  title: string;
  story_text: string;
  success_rate: number;         // 0.0-1.0
  stats_change: Partial<NationStatChanges>;
  new_item?: Card;
  comment: string;              // Narrator quip
  contradiction?: string;       // History contradiction warning
}

// ===== Event Flavor =====
export interface EventFlavorRequest {
  event_id: string;
  base_text: string;
  government_type: GovernmentType;
  nation_name: string;
  traits: string[];
}

export interface EventFlavorResult {
  flavored_text: string;
  narrator_comment: string;
}

// ===== Judge =====
export interface JudgeRequest {
  new_claim: string;
  history_log: string[];
}

export interface JudgeResult {
  consistent: boolean;
  contradiction_detail?: string;
  sanity_penalty: number;       // 0-20
}

// ===== History Book =====
export interface HistoryBookRequest {
  nation_state: {
    name: string;
    traits: string[];
    government_type: GovernmentType;
    population: number;
    tyranny: number;
    mythDensity: number;
  };
  history_log: string[];
  death_reason: string;
  eras_survived: number;
  total_score: number;
}

export interface HistoryBookResult {
  title: string;
  body: string;       // ~200 chars historical assessment
  epitaph: string;    // One-liner epitaph
}
