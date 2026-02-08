import Database, { type Database as DatabaseType } from 'better-sqlite3'
export const db: DatabaseType = new Database('./app.db')

// Enable WAL for concurrency
db.pragma('journal_mode = WAL')

db.exec(
  `
  CREATE TABLE IF NOT EXISTS notifications(
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    createdAt TEXT NOT NULL,
    isRead BOOLEAN NOT NULL
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions(
    endpoint TEXT PRIMARY KEY,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL
  );
  `
)
