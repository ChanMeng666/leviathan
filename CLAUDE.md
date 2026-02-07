# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leviathan (利维坦的诞生) is a political simulation card game built as a monorepo with npm workspaces. Players act as "nation inventors" using junk material cards to fabricate mythologies and build nations in a post-empire power vacuum. The game has a Balatro-inspired visual aesthetic and supports both AI-powered narrative generation (via OpenAI/Anthropic) and a fully playable mock mode with deterministic logic.

All UI text and game content is in Chinese (Simplified).

**Vercel project name: `leviathan-client`** (scope: `chan-mengs-projects`). Always use `--project=leviathan-client` when running `vercel link`. The project called `leviathan` was deleted — do not recreate it.

## Commands

```bash
# Install dependencies (from repo root)
npm install

# Development - run these in separate terminals
npm run dev:server    # Express backend on :3001 (uses tsx watch)
npm run dev:client    # Vite frontend on :5173 (proxies /api to :3001)

# Build
npm run build         # Builds shared → client → server sequentially
npm run build:shared  # Build only shared package

# Type checking (shared package)
npm run typecheck -w packages/shared

# Database (requires .env.local with DATABASE_URL_UNPOOLED)
npm run --include-workspace-root db:push      # Push schema to Neon
npm run --include-workspace-root db:generate  # Generate migrations
npm run --include-workspace-root db:migrate   # Run migrations
npm run --include-workspace-root db:studio    # Open Drizzle Studio

# Environment setup (Vercel + Neon)
vercel link --project=leviathan-client
vercel env pull .env.local
```

No test framework is configured. No linter is configured.

## Architecture

### Monorepo Structure (3 packages)

**`packages/shared`** — Types and game data, consumed by both client and server via `@leviathan/shared`
- `types/game.ts` — Core types: NationState, Card, MythCard, GameEvent, GamePhase, GovernmentType, ComboFormula, ScapegoatGroup
- `types/ai.ts` — API request/response types: WeaveRequest/Result, JudgeRequest/Result, EventFlavorRequest/Result, HistoryBookRequest/Result
- `constants/` — All game data: 14 cards, 5 combo formulas, 4 events, 3 AI narrator personas (historian/propagandist/nihilist), prompt templates
- Exported directly from source (no build step required for dev — `"main": "./src/index.ts"`)

**`packages/client`** — Vite 6 + React 19 + TypeScript SPA
- Zustand 5 store with 6 slices: `gameSlice` (phase/day), `nationSlice` (stats), `cardsSlice` (deck/hand/discard), `eventsSlice` (triggers/cooldowns), `narrativeSlice` (AI story log), `authSlice` (user/guest/token)
- Persist middleware auto-saves to localStorage key `'leviathan-save'` (auth state excluded from persistence)
- Neon Auth client (`@neondatabase/neon-js`) for Google OAuth + email/password authentication
- `apiFetch()` wrapper in `lib/api.ts` auto-attaches Bearer token for authenticated users
- Cloud auto-save on day change (debounced 2s) for authenticated users; localStorage remains primary
- Guest mode bypasses login entirely — game works exactly as before
- Tailwind CSS 4 with Balatro-inspired theme defined in `styles/terminal.css`
- Framer Motion for card/dialog animations
- Vite proxies `/api` requests to the backend at localhost:3001

**`packages/server`** — Express 5 backend
- 4 API routes, each with AI mode and mock fallback:
  - `POST /api/weave` — Narrative synthesis from cards (temp 0.9)
  - `POST /api/event-flavor` — Government-type flavored event text (temp 0.8)
  - `POST /api/judge` — Historical consistency check (temp 0.3)
  - `POST /api/history-book` — Post-death historical epitaph (temp 0.7)
- Save/Load routes (all require `requireAuth` JWT middleware):
  - `GET /api/saves` — List user's cloud saves
  - `GET /api/saves/:id` — Load a specific save
  - `POST /api/saves` — Create/update save (upsert by userId + slotName)
  - `DELETE /api/saves/:id` — Delete a save
  - `POST /api/saves/record-run` — Record completed game history
  - `GET /api/saves/runs` — Get user's past game runs
- `GET /api/health` — Returns `{status, mode, db}` (ai or mock, db connectivity)
- Auth middleware: `optionalAuth` on all `/api` routes, `requireAuth` on `/api/saves`
- JWT verification via `jose` against Neon Auth JWKS endpoint
- Drizzle ORM with `@neondatabase/serverless` (neon-http driver)
- Database schema: `game_saves` (JSONB state snapshots), `game_runs` (completed game history)
- AI provider priority: OpenAI (`gpt-4.1-mini-2025-04-14`) > Anthropic (`claude-sonnet-4-5`) > mock mode
- Services: `comboEngine` (deterministic mock logic), `promptBuilder` (prompt construction), `contextManager` (sliding window of 20 entries)
- Rate limiter: 20 req/min per IP on all `/api` routes
- Loads `.env.local` then `.env` from monorepo root

### Key Data Flow

1. Player selects cards (max 3) and a narrative intent in the NarrativeLoom
2. Client POSTs to `/api/weave` with selected cards, intent, nation state, and history
3. Server builds prompt using propagandist persona + card descriptions + nation context
4. AI generates WeaveResult (or comboEngine produces deterministic result in mock mode)
5. Client applies stat changes, checks for combo matches (shared `findMatchingCombo`), updates narrative log
6. At day end, `useGameLoop` applies daily entropy (narrative -5, supply -5, authority -2), checks 4 death conditions, and scans for triggered events

### Game State

- Stats are clamped 0–100 (except population)
- 4 death conditions: violence_authority ≤ 0, supply_level ≤ 0, narrative_integrity ≥ 100, sanity ≤ 0
- Events have cooldown timers and trigger conditions based on nation stats
- Cards cycle through deck → hand → selected → discard, with Fisher-Yates shuffle on reshuffle

## Environment Variables

Use `vercel env pull .env.local` to get database and auth variables. Copy `.env.example` to `.env` for local overrides. Without API keys, the game runs in mock mode. Without DATABASE_URL, cloud saves are disabled.

```
OPENAI_API_KEY=          # Primary AI provider
ANTHROPIC_API_KEY=       # Fallback AI provider
PORT=3001                # Server port
DATABASE_URL=            # Neon Postgres (pooled)
DATABASE_URL_UNPOOLED=   # Neon Postgres (direct, for migrations)
NEON_AUTH_BASE_URL=      # Neon Auth server URL (JWKS derived from this)
VITE_NEON_AUTH_URL=      # Neon Auth client URL (exposed to browser)
```
