import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env.local first (Vercel env pull), then .env as fallback
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimiter.js';
import { optionalAuth } from './middleware/auth.js';
import { initAI } from './ai.js';
import narrativeRouter from './routes/narrative.js';
import eventRouter from './routes/event.js';
import judgeRouter from './routes/judge.js';
import historyRouter from './routes/history.js';
import savesRouter from './routes/saves.js';
import { isDbConfigured } from './db/index.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

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

async function start() {
  await initAI();
  app.listen(PORT, () => {
    console.log(`[Server] Leviathan backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/api/health`);
  });
}

start();
