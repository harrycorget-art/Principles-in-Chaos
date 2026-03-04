import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, '../data/portfolio.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('stock','mutual','bond','crypto')),
    name TEXT,
    shares REAL NOT NULL,
    buy_price REAL NOT NULL,
    buy_date TEXT NOT NULL,
    reason TEXT,
    current_price REAL,
    last_updated TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    target_strategy TEXT DEFAULT 'aggressive',
    risk_tolerance INTEGER DEFAULT 6,
    target_return REAL DEFAULT 0.25,
    time_horizon INTEGER DEFAULT 12
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy TEXT NOT NULL,
    action TEXT NOT NULL,
    symbol TEXT NOT NULL,
    shares REAL,
    target_price REAL,
    stop_loss REAL,
    reasoning TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    executed INTEGER DEFAULT 0
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`)

export default db
