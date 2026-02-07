import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request, Response, NextFunction } from 'express';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    // Support explicit JWKS URL or derive from base URL
    const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    const url = jwksUrl ?? (baseUrl ? `${baseUrl.replace(/\/$/, '')}/.well-known/jwks.json` : null);
    if (!url) {
      throw new Error('NEON_AUTH_JWKS_URL or NEON_AUTH_BASE_URL must be set');
    }
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

async function verifyToken(token: string): Promise<{ userId: string; email?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJWKS());
    const userId = payload.sub;
    if (!userId) return null;
    return {
      userId,
      email: payload.email as string | undefined,
    };
  } catch {
    return null;
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

/** Requires a valid JWT. Returns 401 if missing or invalid. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const user = await verifyToken(token);
  if (!user) {
    res.status(401).json({ error: '登录已过期' });
    return;
  }

  req.userId = user.userId;
  req.userEmail = user.email;
  next();
}

/** Attaches user info if token present, passes through if not. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const user = await verifyToken(token);
    if (user) {
      req.userId = user.userId;
      req.userEmail = user.email;
    }
  }
  next();
}
