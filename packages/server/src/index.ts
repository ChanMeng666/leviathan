import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Skip dotenv in Vercel — env vars are injected by the platform
if (!process.env.VERCEL) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: resolve(__dirname, '../../../.env.local') });
  dotenv.config({ path: resolve(__dirname, '../../../.env') });
}

import express from 'express';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimiter.js';
import { optionalAuth } from './middleware/auth.js';
import narrativeRouter from './routes/narrative.js';
import eventRouter from './routes/event.js';
import judgeRouter from './routes/judge.js';
import historyRouter from './routes/history.js';
import savesRouter from './routes/saves.js';
import { isDbConfigured } from './db/index.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', optionalAuth);
  app.use('/api', rateLimiter);

  // Routes
  app.use('/api', narrativeRouter);
  app.use('/api', eventRouter);
  app.use('/api', judgeRouter);
  app.use('/api', historyRouter);
  app.use('/api', savesRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY ? 'ai' : 'mock',
      db: isDbConfigured(),
    });
  });

  return app;
}

// Export the app for Vercel serverless
export const app = createApp();

// Only listen when running directly (npm run dev:server), not when imported by Vercel
const isDirectRun = !process.env.VERCEL && process.argv[1]?.includes('packages/server');
if (isDirectRun) {
  const PORT = Number(process.env.PORT) || 3001;
  app.listen(PORT, () => {
    console.log(`[Server] Leviathan backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/api/health`);
  });
}
