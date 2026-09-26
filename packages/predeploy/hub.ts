import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Fault, requireThat } from '../contracts/json.ts';
import {
  type ProductionAdmissionDraft,
  createUnresolvedAdmissionDraft,
  assertPlaceholdersUnresolved,
} from './placeholders.ts';

export const HUB_SCHEMA_VERSION = 1;

export type HubPredeployConfig = {
  schemaVersion: typeof HUB_SCHEMA_VERSION;
  /** Local/test bind only. Production listen address stays in admission draft. */
  listen: { host: string; port: number };
  stateDirectory: string;
  logRedaction: {
    redactAuthorizationHeaders: true;
    redactCookieValues: true;
    redactEnrollmentPrivateKeys: true;
  };
  /** Exact CORS origins when configured; empty means deny-all until admission. */
  allowedOrigins: string[];
  requestTimeoutMs: number;
  maxBodyBytes: number;
  /** Historical v1 local predeploy invariant; Gate S admission uses v2 offline. */
  admission: ProductionAdmissionDraft;
};

export type HubHealth = {
  status: 'ok' | 'not_ready';
  schemaVersion: number;
  stateDirectoryPresent: boolean;
  databaseOpenable: boolean;
  stopping: boolean;
};

export type HubDoctorReport = {
  healthy: boolean;
  readiness: HubHealth;
  configValid: boolean;
  placeholdersUnresolved: boolean;
  findings: string[];
};

const HUB_DDL = `
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_startup (
  run_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  stopped_at TEXT
);
`;

export function createLocalHubPredeployConfig(stateDirectory: string, port = 0): HubPredeployConfig {
  return {
    schemaVersion: HUB_SCHEMA_VERSION,
    listen: { host: '127.0.0.1', port },
    stateDirectory,
    logRedaction: {
      redactAuthorizationHeaders: true,
      redactCookieValues: true,
      redactEnrollmentPrivateKeys: true,
    },
    allowedOrigins: [],
    requestTimeoutMs: 30_000,
    maxBodyBytes: 262_144,
    admission: createUnresolvedAdmissionDraft(),
  };
}

export function validateHubConfig(config: HubPredeployConfig): void {
  requireThat(config.schemaVersion === HUB_SCHEMA_VERSION, 'HUB_SCHEMA_VERSION_UNSUPPORTED');
  requireThat(path.isAbsolute(config.stateDirectory), 'HUB_STATE_DIRECTORY_MUST_BE_ABSOLUTE');
  requireThat(config.listen.host === '127.0.0.1' || config.listen.host === '::1', 'HUB_PREDEPLOY_BIND_LOOPBACK_ONLY');
  requireThat(config.requestTimeoutMs > 0 && config.requestTimeoutMs <= 120_000, 'HUB_REQUEST_TIMEOUT_INVALID');
  requireThat(config.maxBodyBytes > 0 && config.maxBodyBytes <= 1_048_576, 'HUB_MAX_BODY_INVALID');
  requireThat(Array.isArray(config.allowedOrigins), 'HUB_ALLOWED_ORIGINS_INVALID');
  requireThat(!config.allowedOrigins.includes('*'), 'HUB_WILDCARD_CORS_FORBIDDEN');
  assertPlaceholdersUnresolved(config.admission);
}

export function ensureHubStateDirectory(config: HubPredeployConfig): string {
  validateHubConfig(config);
  mkdirSync(config.stateDirectory, { recursive: true });
  mkdirSync(path.join(config.stateDirectory, 'journals'), { recursive: true });
  mkdirSync(path.join(config.stateDirectory, 'backups'), { recursive: true });
  return config.stateDirectory;
}

export function validateHubDatabaseStartup(stateDirectory: string): { schemaVersion: number; path: string } {
  const dbPath = path.join(stateDirectory, 'hub.sqlite');
  const db = new DatabaseSync(dbPath);
  try {
    db.exec(HUB_DDL);
    const row = db.prepare('SELECT value FROM schema_meta WHERE key = ?').get('schema_version') as { value?: string } | undefined;
    if (!row?.value) {
      db.prepare('INSERT INTO schema_meta(key, value) VALUES(?, ?)').run('schema_version', String(HUB_SCHEMA_VERSION));
    } else {
      requireThat(Number(row.value) === HUB_SCHEMA_VERSION, 'HUB_SCHEMA_MIGRATION_REQUIRED');
    }
    return { schemaVersion: HUB_SCHEMA_VERSION, path: dbPath };
  } finally {
    db.close();
  }
}

export class HubPredeployRuntime {
  private stopping = false;
  private started = false;
  private runId: string | null = null;

  constructor(private readonly config: HubPredeployConfig) {
    validateHubConfig(config);
  }

  start() {
    requireThat(!this.stopping, 'HUB_STOPPING');
    ensureHubStateDirectory(this.config);
    validateHubDatabaseStartup(this.config.stateDirectory);
    this.runId = createHash('sha256').update(`${Date.now()}:${this.config.stateDirectory}`).digest('hex').slice(0, 32);
    const db = new DatabaseSync(path.join(this.config.stateDirectory, 'hub.sqlite'));
    try {
      db.prepare('INSERT INTO hub_startup(run_id, started_at) VALUES(?, ?)').run(this.runId, new Date().toISOString());
    } finally {
      db.close();
    }
    this.started = true;
    return { runId: this.runId };
  }

  health(): HubHealth {
    const stateDirectoryPresent = existsSync(this.config.stateDirectory);
    let databaseOpenable = false;
    if (stateDirectoryPresent) {
      try {
        const db = new DatabaseSync(path.join(this.config.stateDirectory, 'hub.sqlite'), { readOnly: true });
        db.prepare('SELECT 1').get();
        db.close();
        databaseOpenable = true;
      } catch {
        databaseOpenable = false;
      }
    }
    const ready = this.started && !this.stopping && stateDirectoryPresent && databaseOpenable;
    return {
      status: ready ? 'ok' : 'not_ready',
      schemaVersion: HUB_SCHEMA_VERSION,
      stateDirectoryPresent,
      databaseOpenable,
      stopping: this.stopping,
    };
  }

  readiness(): HubHealth {
    return this.health();
  }

  /** Graceful stop: mark stopping, record stop time, refuse new work. */
  stop() {
    this.stopping = true;
    if (this.runId && existsSync(path.join(this.config.stateDirectory, 'hub.sqlite'))) {
      const db = new DatabaseSync(path.join(this.config.stateDirectory, 'hub.sqlite'));
      try {
        db.prepare('UPDATE hub_startup SET stopped_at = ? WHERE run_id = ?').run(new Date().toISOString(), this.runId);
      } finally {
        db.close();
      }
    }
    this.started = false;
  }

  doctor(): HubDoctorReport {
    const findings: string[] = [];
    let configValid = true;
    let placeholdersUnresolved = true;
    try {
      validateHubConfig(this.config);
    } catch (error) {
      configValid = false;
      findings.push(error instanceof Fault ? error.code : String(error));
    }
    try {
      assertPlaceholdersUnresolved(this.config.admission);
    } catch (error) {
      placeholdersUnresolved = false;
      findings.push(String(error));
    }
    const readiness = this.health();
    if (readiness.status !== 'ok') findings.push('HUB_NOT_READY');
    return {
      healthy: configValid && placeholdersUnresolved && readiness.status === 'ok',
      readiness,
      configValid,
      placeholdersUnresolved,
      findings,
    };
  }

  /** Fail-closed backup hook: copy SQLite bytes only; never restores authority. */
  createFailClosedBackup(label: string): string {
    requireThat(this.started || existsSync(path.join(this.config.stateDirectory, 'hub.sqlite')), 'HUB_BACKUP_SOURCE_MISSING');
    const source = path.join(this.config.stateDirectory, 'hub.sqlite');
    const destDir = path.join(this.config.stateDirectory, 'backups');
    mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, `hub-${label}.sqlite`);
    writeFileSync(dest, readFileSync(source));
    return dest;
  }

  /** Restore hook records evidence only; authority remains blocked until re-admission. */
  restoreBackupBytes(backupPath: string): { restoredPath: string; authority: 'BLOCKED_PENDING_READMISSION' } {
    requireThat(existsSync(backupPath), 'HUB_BACKUP_MISSING');
    const restoredPath = path.join(this.config.stateDirectory, 'hub.restored.sqlite');
    writeFileSync(restoredPath, readFileSync(backupPath));
    return { restoredPath, authority: 'BLOCKED_PENDING_READMISSION' };
  }

  redactLogLine(line: string): string {
    let out = line;
    if (this.config.logRedaction.redactAuthorizationHeaders) {
      out = out.replace(/(Authorization:\s*)(\S+)/gi, '$1<redacted>');
    }
    if (this.config.logRedaction.redactCookieValues) {
      out = out.replace(/(__Host-fleetsplice=)[0-9a-f]+/gi, '$1<redacted>');
    }
    if (this.config.logRedaction.redactEnrollmentPrivateKeys) {
      out = out.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, '<redacted-private-key>');
    }
    return out;
  }

  disposeStateForTests() {
    if (existsSync(this.config.stateDirectory)) rmSync(this.config.stateDirectory, { recursive: true, force: true });
  }
}
