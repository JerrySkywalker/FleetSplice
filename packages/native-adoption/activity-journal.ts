import { Journal } from '../journal/index.ts';
import { requireThat } from '../contracts/json.ts';
import { commandTerminal } from './projection.ts';
import type { NativeThread } from './types.ts';

type Activity = NativeThread['activity'][number];
/** Durable safety evidence, independent of the recent UI cache. No replay path. */
export class NativeActivityJournal {
  constructor(private readonly journal: Journal) {
    journal.db.exec(`CREATE TABLE IF NOT EXISTS native_commands (
      incarnation TEXT NOT NULL, thread TEXT NOT NULL, id TEXT NOT NULL,
      turn TEXT NOT NULL, terminal INTEGER NOT NULL, value TEXT NOT NULL,
      PRIMARY KEY(incarnation,thread,id));
      CREATE TABLE IF NOT EXISTS native_interrupted (
      incarnation TEXT NOT NULL, thread TEXT NOT NULL, turn TEXT NOT NULL,
      PRIMARY KEY(incarnation,thread,turn));`);
  }
  observe(incarnation: string, thread: string, item: Activity): Activity {
    const prior = this.journal.db.prepare('SELECT value FROM native_commands WHERE incarnation=? AND thread=? AND id=?').get(incarnation, thread, item.id);
    if (prior) {
      const known = JSON.parse(String(prior.value)) as Activity;
      requireThat(known.turnId === item.turnId, 'NATIVE_COMMAND_IDENTITY_CONFLICT');
      if (commandTerminal(known.status) || JSON.stringify(known) === JSON.stringify(item)) return known;
    }
    this.journal.transaction(() => {
      this.journal.append('NATIVE_COMMAND_EVIDENCE', item.id, { incarnation, threadId: thread, ...item });
      this.journal.db.prepare('INSERT INTO native_commands VALUES(?,?,?,?,?,?) ON CONFLICT(incarnation,thread,id) DO UPDATE SET terminal=excluded.terminal,value=excluded.value')
        .run(incarnation, thread, item.id, item.turnId, commandTerminal(item.status) ? 1 : 0, JSON.stringify(item));
    });
    return item; // FULL commit has completed before the caller may evict.
  }
  interrupt(incarnation: string, thread: string, turn: string) {
    this.journal.db.prepare('INSERT OR IGNORE INTO native_interrupted VALUES(?,?,?)').run(incarnation, thread, turn);
  }
  unsafe(incarnation: string, thread: string): Activity[] {
    return this.journal.db.prepare('SELECT value FROM native_commands WHERE incarnation=? AND thread=? AND terminal=0').all(incarnation, thread)
      .map(row => JSON.parse(String(row.value)) as Activity);
  }
  assertRecovery(incarnation: string) {
    requireThat(!this.journal.db.prepare('SELECT 1 FROM native_commands WHERE incarnation<>? AND terminal=0 LIMIT 1').get(incarnation), 'NATIVE_PREDECESSOR_COMMAND_UNKNOWN_NO_REPLAY');
  }
  residual(incarnation: string, thread: string): NativeThread['residualCommandState'] {
    const counts = this.journal.db.prepare(`SELECT COUNT(*) AS total, MIN(c.terminal) AS drained FROM native_commands c
      JOIN native_interrupted i ON c.incarnation=i.incarnation AND c.thread=i.thread AND c.turn=i.turn
      WHERE c.incarnation=? AND c.thread=?`).get(incarnation, thread)!;
    return Number(counts.total) === 0 ? 'NONE_OBSERVED' : Number(counts.drained) === 1 ? 'OBSERVED_DRAINED' : 'MAY_STILL_BE_RUNNING';
  }
}
