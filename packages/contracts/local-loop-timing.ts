/** Bounded monotonic local-loop timing. Presentation metrics only; never admits effects. */
export type TimingStage =
  | 'local_echo'
  | 'command_send'
  | 'effect_dispatch'
  | 'native_event_observed'
  | 'hub_sse_emit'
  | 'browser_receive_queue'
  | 'browser_receive_render'
  | 'receipt'
  | 'final_reconciliation';

/** How a timing claim was obtained. Never invent wall-clock P95 from fake clocks. */
export type TimingClaimClass = 'MEASURED' | 'DETERMINISTIC_TEST_ONLY' | 'UNMEASURED';

export type TimingSample = {
  stage: TimingStage;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  claim: TimingClaimClass;
};

export class LocalLoopTimer {
  private samples: TimingSample[] = [];
  constructor(private readonly now: () => number = () => performance.now()) {}

  measure<T>(stage: TimingStage, work: () => T, claim: TimingClaimClass = 'MEASURED'): T {
    const startedAt = this.now();
    const result = work();
    this.record(stage, startedAt, this.now(), claim);
    return result;
  }

  async measureAsync<T>(stage: TimingStage, work: () => Promise<T>, claim: TimingClaimClass = 'MEASURED'): Promise<T> {
    const startedAt = this.now();
    const result = await work();
    this.record(stage, startedAt, this.now(), claim);
    return result;
  }

  /**
   * Record a correlated stage duration. Callers must supply both start and end
   * from a defensible common clock. A single now() value must never be claimed
   * as event-to-render latency.
   */
  record(stage: TimingStage, startedAt: number, endedAt: number, claim: TimingClaimClass = 'MEASURED'): TimingSample {
    const sample = { stage, startedAt, endedAt, durationMs: Math.max(0, endedAt - startedAt), claim };
    this.samples.push(sample);
    if (this.samples.length > 256) this.samples.splice(0, this.samples.length - 256);
    return sample;
  }

  /** Mark a stage as observed without inventing a cross-context duration. */
  markUnmeasured(stage: TimingStage): TimingSample {
    const at = this.now();
    return this.record(stage, at, at, 'UNMEASURED');
  }

  latest(stage: TimingStage): TimingSample | null {
    for (let i = this.samples.length - 1; i >= 0; i--) if (this.samples[i]!.stage === stage) return this.samples[i]!;
    return null;
  }

  all(): readonly TimingSample[] { return this.samples; }

  summary(): Record<TimingStage, number | null> {
    const stages: TimingStage[] = ['local_echo', 'command_send', 'effect_dispatch', 'native_event_observed', 'hub_sse_emit', 'browser_receive_queue', 'browser_receive_render', 'receipt', 'final_reconciliation'];
    return Object.fromEntries(stages.map(stage => [stage, this.latest(stage)?.durationMs ?? null])) as Record<TimingStage, number | null>;
  }

  claimSummary(): Record<TimingStage, TimingClaimClass | null> {
    const stages: TimingStage[] = ['local_echo', 'command_send', 'effect_dispatch', 'native_event_observed', 'hub_sse_emit', 'browser_receive_queue', 'browser_receive_render', 'receipt', 'final_reconciliation'];
    return Object.fromEntries(stages.map(stage => [stage, this.latest(stage)?.claim ?? null])) as Record<TimingStage, TimingClaimClass | null>;
  }
}

/** Targets remain targets, not self-certified wall-clock facts. */
export const LOCAL_LOOP_TARGETS_MS = {
  local_echo: 50,
  native_event_to_ui: 250,
  turn_start_visible: 300,
  agent_delta_to_ui: 200,
  command_accepted_indicator: 500,
  final_authoritative_reconciliation: 1500,
} as const;
