import { sql } from '@vercel/postgres';
import { players } from './config';

let initialized = false;

export async function initDb() {
  if (initialized) return;
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_login TEXT NOT NULL,
        player_id TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'mvp',
        created_at TEXT NOT NULL,
        UNIQUE(user_id, category)
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS organizer_scores (
        player_id TEXT PRIMARY KEY,
        score REAL NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `;
    
    for (const p of players) {
      await sql`
        INSERT INTO organizer_scores (player_id, score, updated_at)
        VALUES (${p.id}, 0, ${new Date().toISOString()})
        ON CONFLICT (player_id) DO NOTHING;
      `;
    }
    
    initialized = true;
  } catch (error) {
    console.error("FATAL ERROR IN initDb:", error);
    // Don't crash the entire page if possible, though queries might fail later
  }
}

export { sql };