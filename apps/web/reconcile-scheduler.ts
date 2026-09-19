/** Bounded authoritative snapshot reconciliation. Never dispatches native effects. */

export type ReconcileReason =
  | 'turn.final'
  | 'fleet.control'
  | 'fallback'
  | 'visibility'
  | 'manual'
  | 'command'
  | 'initial';

export type AuthoritativeReconcileSchedulerOptions = {
  /** Bounded debounce for burst coalescing (ms). */
  debounceMs?: number;
  /** Injected timer helpers for deterministic tests. */
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

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

  constructor(
    private readonly refresh: () => Promise<void>,
    options: AuthoritativeReconcileSchedulerOptions = {},
  ) {
    this.debounceMs = options.debounceMs ?? 48;
    this.setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
    this.clearTimer = options.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>));
  }

  /** Schedule an authoritative reconcile. Coalesces while pending/running. */
  schedule(_reason: ReconcileReason): void {
    if (this.disposed) return;
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
    this.pending = false;
    this.dirty = false;
    this.running = true;
    this.refreshCount += 1;
    try {
      await this.refresh();
    } finally {
      this.running = false;
      if (this.disposed) { this.notifyIdle(); return; }
      if (this.dirty || this.pending) {
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
