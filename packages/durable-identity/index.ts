import { existsSync, mkdirSync, openSync, closeSync, writeSync, fsyncSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { canonical, Fault, requireThat } from '../contracts/index.ts';

export const DURABLE_IDENTITY_VERSION = 1 as const;

/**
 * Small, authority-only record store. It deliberately excludes browser sessions,
 * client grants, controller leases, reconnect grace, and any command history.
 */
export class DurableIdentityStore<T> {
  constructor(private readonly file: string, private readonly validate: (value: unknown) => T) {}

  read(): T | null {
    if (!existsSync(this.file)) return null;
    try { return this.validate(JSON.parse(readFileSync(this.file, 'utf8'))); }
    catch { throw new Fault('DURABLE_IDENTITY_STORE_INVALID'); }
  }

  write(value: T): void {
    const directory = path.dirname(this.file); mkdirSync(directory, { recursive: true });
    const temporary = `${this.file}.next`;
    try {
      const fd = openSync(temporary, 'w', 0o600); try { writeSync(fd, canonical(value)); fsyncSync(fd); } finally { closeSync(fd); }
      renameSync(temporary, this.file);
    } catch (error) { try { if (existsSync(temporary)) unlinkSync(temporary); } catch { /* preserve original authority record */ } throw error; }
  }

  require(): T { const value = this.read(); requireThat(!!value, 'DURABLE_IDENTITY_STORE_MISSING'); return value; }
}
