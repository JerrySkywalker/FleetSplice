/** Bounded authoritative snapshot reconciliation. Never dispatches native effects. */

export type ReconcileReason =
  | 'turn.final'
  | 'fleet.control'
  | 'fallback'
  | 'visibility'
  | 'manual'
  | 'command'
  | 'initial';

export type ReconcileScheduleRecord = {
  at: number;
  reason: ReconcileReason;
  coalesced: boolean;
  whileRunning: boolean;
};

export type ReconcileExecutionRecord = {
  seq: number;
  startedAt: number;
  completedAt: number | null;
  reasons: ReconcileReason[];
  scheduleCountContributed: number;
  coalescedOrExecuted: 'executed';
};

export type ReconcileAuditSnapshot = {
  scheduleCount: number;
  coalescedCount: number;
  executedCount: number;
  schedules: ReconcileScheduleRecord[];
  executions: ReconcileExecutionRecord[];
};

export type AuthoritativeReconcileSchedulerOptions = {
  /** Bounded debounce for burst coalescing (ms). */
  debounceMs?: number;
  /** Injected timer helpers for deterministic tests. */
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

export type AuthoritativeRefresh = (reasons: readonly ReconcileReason[]) => Promise<void>;

/**
 * At most one active refresh; coalesce bursts; retain one dirty follow-up if
 * another authority-relevant trigger arrives during refresh.
 */
export class AuthoritativeReconcileScheduler {
  private readonly debounceMs: number;
  private readonly setTimer: (fn: () => void, ms: number) => unknown;
  private readonly clearTimer: (handle: unknown) => void;
  private timer: unknown = null;
  private running = false;
  private pending = false;
  private dirty = false;
  private disposed = false;
  private refreshCount = 0;
  private waiters: Array<() => void> = [];
  private pendingReasons: ReconcileReason[] = [];
  private scheduleCount = 0;
  private coalescedCount = 0;
  private readonly schedules: ReconcileScheduleRecord[] = [];
  private readonly executions: ReconcileExecutionRecord[] = [];

  constructor(
    private readonly refresh: AuthoritativeRefresh,
    options: AuthoritativeReconcileSchedulerOptions = {},
  ) {
    this.debounceMs = options.debounceMs ?? 48;
    this.setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
    this.clearTimer = options.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>));
  }

  /** Schedule an authoritative reconcile. Coalesces while pending/running. */
  schedule(reason: ReconcileReason): void {
    if (this.disposed) return;
    this.scheduleCount += 1;
    const whileRunning = this.running;
    const coalesced = whileRunning || this.pending || this.timer !== null;
    if (coalesced) this.coalescedCount += 1;
    this.schedules.push({ at: Date.now(), reason, coalesced, whileRunning });
    this.pendingReasons.push(reason);
    if (this.running) {
      this.dirty = true;
      return;
    }
    this.pending = true;
    if (this.timer !== null) return;
    this.timer = this.setTimer(() => { this.timer = null; void this.flush(); }, this.debounceMs);
  }

  /** Observable count of authoritative refresh invocations (tests / dogfood). */
  authoritativeRefreshCount(): number { return this.refreshCount; }

  /** Machine-readable causality counters for audit / browser acceptance. */
  audit(): ReconcileAuditSnapshot {
    return {
      scheduleCount: this.scheduleCount,
      coalescedCount: this.coalescedCount,
      executedCount: this.refreshCount,
      schedules: this.schedules.map(item => ({ ...item })),
      executions: this.executions.map(item => ({ ...item, reasons: [...item.reasons] })),
    };
  }

  /** True when a refresh is running or a coalesced trigger is waiting. */
  isBusy(): boolean { return this.running || this.pending || this.dirty || this.timer !== null; }

  /** Resolve when the scheduler is idle (no pending/running/dirty work). */
  whenIdle(): Promise<void> {
    if (!this.isBusy()) return Promise.resolve();
    return new Promise(resolve => { this.waiters.push(resolve); });
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer !== null) { this.clearTimer(this.timer); this.timer = null; }
    this.pending = false;
    this.dirty = false;
    this.pendingReasons = [];
    this.notifyIdle();
  }

  private notifyIdle(): void {
    if (this.isBusy()) return;
    const waiters = this.waiters.splice(0);
    for (const resolve of waiters) resolve();
  }

  private async flush(): Promise<void> {
    if (this.disposed || this.running) return;
    if (!this.pending && !this.dirty) { this.notifyIdle(); return; }
    const reasons = this.pendingReasons.splice(0);
    this.pending = false;
    this.dirty = false;
    this.running = true;
    this.refreshCount += 1;
    const seq = this.refreshCount;
    const startedAt = Date.now();
    const record: ReconcileExecutionRecord = {
      seq,
      startedAt,
      completedAt: null,
      reasons: reasons.length ? reasons : ['manual'],
      scheduleCountContributed: reasons.length || 1,
      coalescedOrExecuted: 'executed',
    };
    this.executions.push(record);
    try {
      await this.refresh(record.reasons);
    } finally {
      record.completedAt = Date.now();
      this.running = false;
      if (this.disposed) { this.notifyIdle(); return; }
      if (this.dirty || this.pending || this.pendingReasons.length) {
        this.pending = true;
        this.dirty = false;
        if (this.timer === null) {
          this.timer = this.setTimer(() => { this.timer = null; void this.flush(); }, this.debounceMs);
        }
      } else {
        this.notifyIdle();
      }
    }
  }
}
