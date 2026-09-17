/** Bounded monotonic local-loop timing. Presentation metrics only; never admits effects. */
export type TimingStage =
  | 'local_echo'
  | 'command_send'
  | 'effect_dispatch'
  | 'native_event_observed'
  | 'hub_sse_emit'
  | 'browser_receive_render'
  | 'receipt'
  | 'final_reconciliation';

export type TimingSample = {
  stage: TimingStage;
  startedAt: number;
  endedAt: number;
  durationMs: number;
};

export class LocalLoopTimer {
  private samples: TimingSample[] = [];
  constructor(private readonly now: () => number = () => performance.now()) {}

  measure<T>(stage: TimingStage, work: () => T): T {
    const startedAt = this.now();
    const result = work();
    this.record(stage, startedAt, this.now());
    return result;
  }

  async measureAsync<T>(stage: TimingStage, work: () => Promise<T>): Promise<T> {
    const startedAt = this.now();
    const result = await work();
    this.record(stage, startedAt, this.now());
    return result;
  }

  record(stage: TimingStage, startedAt: number, endedAt = this.now()): TimingSample {
    const sample = { stage, startedAt, endedAt, durationMs: Math.max(0, endedAt - startedAt) };
    this.samples.push(sample);
    if (this.samples.length > 256) this.samples.splice(0, this.samples.length - 256);
    return sample;
  }

  latest(stage: TimingStage): TimingSample | null {
    for (let i = this.samples.length - 1; i >= 0; i--) if (this.samples[i]!.stage === stage) return this.samples[i]!;
    return null;
  }

  all(): readonly TimingSample[] { return this.samples; }

  summary(): Record<TimingStage, number | null> {
    const stages: TimingStage[] = ['local_echo', 'command_send', 'effect_dispatch', 'native_event_observed', 'hub_sse_emit', 'browser_receive_render', 'receipt', 'final_reconciliation'];
    return Object.fromEntries(stages.map(stage => [stage, this.latest(stage)?.durationMs ?? null])) as Record<TimingStage, number | null>;
  }
}

export const LOCAL_LOOP_TARGETS_MS = {
  local_echo: 50,
  native_event_to_ui: 250,
  turn_start_visible: 300,
  agent_delta_to_ui: 200,
  command_accepted_indicator: 500,
  final_authoritative_reconciliation: 1500,
} as const;
