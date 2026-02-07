import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    const sql = neon(databaseUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
