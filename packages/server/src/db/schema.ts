import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const gameSaves = pgTable('game_saves', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  slotName: text('slot_name').notNull(),
  nationState: jsonb('nation_state').notNull(),
  deck: jsonb('deck').notNull(),
  hand: jsonb('hand').notNull(),
  discard: jsonb('discard').notNull(),
  phase: text('phase').notNull(),
  gameOver: boolean('game_over').notNull().default(false),
  gameOverReason: text('game_over_reason'),
  crisisState: jsonb('crisis_state').notNull(),
  eventHistory: jsonb('event_history').notNull(),
  narrativeLog: jsonb('narrative_log').notNull(),
  influence: integer('influence').notNull().default(0),
  equippedDecrees: jsonb('equipped_decrees').notNull(),
  consumables: jsonb('consumables').notNull(),
  intentLevels: jsonb('intent_levels').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('game_saves_user_id_idx').on(table.userId),
  index('game_saves_user_slot_idx').on(table.userId, table.slotName),
]);

export const gameRuns = pgTable('game_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  nationName: text('nation_name').notNull(),
  erasSurvived: integer('eras_survived').notNull(),
  deathReason: text('death_reason'),
  victoryType: text('victory_type'),
  governmentType: text('government_type').notNull(),
  totalScore: integer('total_score').notNull().default(0),
  finalPopulation: integer('final_population').notNull(),
  epitaph: text('epitaph'),
  traits: jsonb('traits'),
  mythology: jsonb('mythology'),
  finalStats: jsonb('final_stats'),
  historyBookTitle: text('history_book_title'),
  historyBookBody: text('history_book_body'),
  historyLog: jsonb('history_log'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('game_runs_user_id_idx').on(table.userId),
]);
