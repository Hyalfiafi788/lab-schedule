import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';

let db: Database.Database;

export function initDatabase(): void {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'lab-schedule.db');

  log.info('Initializing database at:', dbPath);

  db = new Database(dbPath, { verbose: undefined });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema();
  log.info('Database initialized successfully');
}

function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_data (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function dbGet(key: string): string | null {
  const row = db.prepare('SELECT value FROM app_data WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function dbSet(key: string, value: string): void {
  db.prepare(`
    INSERT INTO app_data (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value);
}

export function dbDelete(key: string): void {
  db.prepare('DELETE FROM app_data WHERE key = ?').run(key);
}

export function dbAll(): { key: string; value: string }[] {
  return db.prepare('SELECT key, value FROM app_data').all() as { key: string; value: string }[];
}

export function getDbPath(): string {
  return path.join(app.getPath('userData'), 'lab-schedule.db');
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    log.info('Database closed');
  }
}
