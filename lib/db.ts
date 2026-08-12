import Database from 'better-sqlite3';
import {players} from './config';
const db=new Database('data/mvp.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`CREATE TABLE IF NOT EXISTS votes(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,user_login TEXT NOT NULL,player_id TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'mvp',created_at TEXT NOT NULL,UNIQUE(user_id,category));CREATE TABLE IF NOT EXISTS organizer_scores(player_id TEXT PRIMARY KEY,score REAL NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);`);

// Migrate any pre-existing "votes" table that predates the goalkeeper category.
// CREATE TABLE IF NOT EXISTS above is a no-op on an already-existing table, so an
// old table created with a single-column UNIQUE(user_id) constraint (one vote per
// user, period) would otherwise silently stick around and block a second category
// vote with a UNIQUE constraint error. Detect that case and rebuild the table.
const votesInfo = db.prepare('PRAGMA table_info(votes)').all() as any[];
const hasCategoryColumn = votesInfo.some((column: any) => column.name === 'category');

const indexList = db.prepare('PRAGMA index_list(votes)').all() as any[];
const hasLegacySingleColumnUnique = indexList.some((idx: any) => {
  if (!idx.unique) return false;
  const cols = db.prepare(`PRAGMA index_info(${idx.name})`).all() as any[];
  return cols.length === 1 && cols[0].name === 'user_id';
});

if (!hasCategoryColumn || hasLegacySingleColumnUnique) {
  db.exec('ALTER TABLE votes RENAME TO votes_legacy;');
  db.exec(
    `CREATE TABLE votes(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,user_login TEXT NOT NULL,player_id TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'mvp',created_at TEXT NOT NULL,UNIQUE(user_id,category));`
  );
  const legacyCols = db.prepare('PRAGMA table_info(votes_legacy)').all() as any[];
  const legacyHasCategory = legacyCols.some((c: any) => c.name === 'category');
  db.exec(
    legacyHasCategory
      ? `INSERT INTO votes(user_id,user_login,player_id,category,created_at) SELECT user_id,user_login,player_id,category,created_at FROM votes_legacy;`
      : `INSERT INTO votes(user_id,user_login,player_id,category,created_at) SELECT user_id,user_login,player_id,'mvp',created_at FROM votes_legacy;`
  );
  db.exec('DROP TABLE votes_legacy;');
}
for(const p of players) db.prepare('INSERT OR IGNORE INTO organizer_scores(player_id,score,updated_at) VALUES(?,?,?)').run(p.id,0,new Date().toISOString());
export default db;