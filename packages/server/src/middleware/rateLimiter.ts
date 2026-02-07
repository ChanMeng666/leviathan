import type { Request, Response, NextFunction } from 'express';

const windowMs = 60_000; // 1 minute
const maxRequests = 20;

// In-memory rate limiting only works in long-lived processes.
// On Vercel serverless, each invocation is stateless — skip it
// (Vercel provides its own DDoS protection).
const isServerless = !!process.env.VERCEL;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  if (isServerless) {
    next();
    return;
  }

  const key = req.ip ?? 'unknown';
  const now = Date.now();

  let record = hits.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    hits.set(key, record);
  }

  record.count++;
  if (record.count > maxRequests) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
    return;
  }

  next();
}
