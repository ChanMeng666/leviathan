import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const gameSaves = pgTable('game_saves', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  slotName: text('slot_name').notNull(),
  nationState: jsonb('nation_state').notNull(),
  deck: jsonb('deck').notNull(),
  hand: jsonb('hand').notNull(),
  discard: jsonb('discard').notNull(),
  day: integer('day').notNull(),
  phase: text('phase').notNull(),
  gameOver: boolean('game_over').notNull().default(false),
  gameOverReason: text('game_over_reason'),
  eventHistory: jsonb('event_history').notNull(),
  eventCooldowns: jsonb('event_cooldowns').notNull(),
  narrativeLog: jsonb('narrative_log').notNull(),
  scapegoats: jsonb('scapegoats'),
  governmentAffinities: jsonb('government_affinities'),
  discoveredExtended: jsonb('discovered_extended'),
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
  daysSurvived: integer('days_survived').notNull(),
  deathReason: text('death_reason').notNull(),
  governmentType: text('government_type').notNull(),
  finalPopulation: integer('final_population').notNull(),
  epitaph: text('epitaph'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('game_runs_user_id_idx').on(table.userId),
]);
