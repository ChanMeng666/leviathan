/** Sliding-window context manager for AI conversation history */

const MAX_WINDOW = 20; // Keep last N history entries for context

export interface ContextEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const sessions = new Map<string, ContextEntry[]>();

export function getContext(sessionId: string): ContextEntry[] {
  return sessions.get(sessionId) ?? [];
}

export function addEntry(sessionId: string, entry: ContextEntry): void {
  const ctx = sessions.get(sessionId) ?? [];
  ctx.push(entry);
  // Keep sliding window
  if (ctx.length > MAX_WINDOW) {
    ctx.splice(0, ctx.length - MAX_WINDOW);
  }
  sessions.set(sessionId, ctx);
}

export function clearContext(sessionId: string): void {
  sessions.delete(sessionId);
}

export function getRecentHistory(sessionId: string, n: number = 10): string[] {
  const ctx = getContext(sessionId);
  return ctx
    .filter((e) => e.role === 'assistant')
    .slice(-n)
    .map((e) => e.content);
}
