import { DatabaseSync } from 'node:sqlite';
import { canonical, requireThat } from '../contracts/json.ts';

// A deliberately small shared storage primitive. Hub and Edge own different DBs.
export class Journal {
  readonly db: DatabaseSync;
  readonly recovered: boolean;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    const version = this.db.prepare('select sqlite_version() as v').get()!.v;
    requireThat(version === '3.53.4', 'SQLITE_BUILD_UNQUALIFIED');
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=1000');
    requireThat(this.db.prepare('PRAGMA integrity_check').get()!.integrity_check === 'ok', 'JOURNAL_CORRUPT');
    this.db.exec(`CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS evidence (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, digest TEXT NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS aliases (alias TEXT PRIMARY KEY, id TEXT NOT NULL REFERENCES records(id), digest TEXT NOT NULL);`);
    this.recovered = this.get('started') !== null;
    this.set('started', true);
  }
  transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  get<T = unknown>(key: string): T | null {
    const row = this.db.prepare('SELECT value FROM kv WHERE key=?').get(key);
    return row ? JSON.parse(String(row.value)) as T : null;
  }
  set(key: string, value: unknown): void {
    this.db.prepare('INSERT INTO kv VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, canonical(value));
  }
  append(kind: string, key: string, value: unknown): void {
    this.db.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run(kind, key, canonical(value));
  }
  lookup<T>(id: string): { digest: string; value: T } | null {
    const row = this.db.prepare('SELECT digest,value FROM records WHERE id=?').get(id);
    return row ? { digest: String(row.digest), value: JSON.parse(String(row.value)) as T } : null;
  }
  insert(id: string, digest: string, value: unknown): void {
    this.db.prepare('INSERT INTO records VALUES(?,?,?)').run(id, digest, canonical(value));
  }
  update(id: string, value: unknown): void {
    requireThat(this.db.prepare('UPDATE records SET value=? WHERE id=?').run(canonical(value), id).changes === 1, 'MISSING_JOURNAL_RECORD');
  }
  list<T>(): T[] { return this.db.prepare('SELECT value FROM records ORDER BY rowid').all().map(row => JSON.parse(String(row.value)) as T); }
  close(): void { this.db.close(); }
}
