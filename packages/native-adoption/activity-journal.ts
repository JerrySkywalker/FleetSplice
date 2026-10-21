import { Journal } from '../journal/index.ts';
import { canonical, requireThat } from '../contracts/json.ts';
import { commandTerminal } from './projection.ts';
import type { AdoptionCommand, AdoptionReceipt, NativeArtifactIdentity, NativeThread } from './types.ts';

type Activity = NativeThread['activity'][number];
type EvidenceRow = { seq: number; key: string; value: any };
/** Shared with local lifecycle admission; acknowledgment is not turn completion. */
export function nativeAttemptReceiptMatches(attempt: EvidenceRow, receipt: EvidenceRow | undefined): boolean {
  const command = attempt.value?.command; const result = receipt?.value;
  return !!command && command.commandId === attempt.key && !!receipt && receipt.key === attempt.key && receipt.seq > attempt.seq &&
    result?.commandId === attempt.key && result.status === 'SUCCEEDED' && result.family === command.family && result.threadId === command.threadId &&
    !!attempt.value.daemon && !!result.daemon && canonical(attempt.value.daemon) === canonical(result.daemon);
}
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
  /** Reuse the Edge's existing FULL-commit evidence, not a second ledger. */
  attempt(command: AdoptionCommand, daemon: NativeArtifactIdentity) {
    this.journal.append('NATIVE_EFFECT_ATTEMPT', command.commandId, { command, daemon, origin: 'NATIVE_ADOPTED', createdNativeThread: false });
  }
  receipt(receipt: AdoptionReceipt) {
    this.journal.append('NATIVE_ADOPTION_RECEIPT', receipt.commandId, receipt);
  }
  recoveredEffects(): { command: AdoptionCommand; receipt: AdoptionReceipt }[] {
    const seen = new Set<string>();
    return this.journal.db.prepare("SELECT seq,key,value FROM evidence WHERE kind='NATIVE_EFFECT_ATTEMPT' ORDER BY seq").all().map(row => {
      const attempt = { seq: Number(row.seq), key: String(row.key), value: JSON.parse(String(row.value)) };
      const saved = this.journal.db.prepare("SELECT seq,key,value FROM evidence WHERE kind='NATIVE_ADOPTION_RECEIPT' AND key=?").all(attempt.key);
      requireThat(!seen.has(attempt.key) && saved.length === 1, 'NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY');
      const receipt = { seq: Number(saved[0]!.seq), key: String(saved[0]!.key), value: JSON.parse(String(saved[0]!.value)) };
      requireThat(nativeAttemptReceiptMatches(attempt, receipt), 'NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY');
      seen.add(attempt.key);
      return { command: attempt.value.command as AdoptionCommand, receipt: receipt.value as AdoptionReceipt };
    });
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
