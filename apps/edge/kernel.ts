import { randomUUID } from 'node:crypto';
import { canonical, digest, next, requireThat, validate, Fault, ClockFence, type EdgeCommand, type Fence, type NativeEvent, type Receipt, type Target } from '../../packages/contracts/index.ts';
import { Journal } from '../../packages/journal/index.ts';
import type { NativePort, NativeSignal } from '../../packages/driver-codex/index.ts';

type EdgeLane = { fence: Fence; sessionId: string; segmentId: string; threadId: string | null; turnId: string | null; state: string; activeStep: string | null; creationStep: string | null; turnStartedObserved: boolean };
type StepRecord = { command: EdgeCommand; receipt: Receipt; attempted: boolean };
export class EdgeKernel {
  connected = false;
  blocked: string | null;
  closing = false;
  private serial: Promise<unknown> = Promise.resolve();
  private lanes: Record<string, EdgeLane>;
  private current: EdgeCommand | null = null;
  private nativeStarted = false;
  private clock = new ClockFence(Date.now(), performance.now());
  private queued = 0;
  private outputCharacters = 0;
  constructor(readonly journal: Journal, readonly target: Target, private native: NativePort,
    private verifyLocal: () => Promise<void>, private emit: (event: NativeEvent) => void,
    private nativeProcessProof: () => Promise<void> = async () => {}) {
    this.blocked = journal.recovered ? 'RECOVERY_REQUIRED' : null;
    this.lanes = journal.get('lanes') ?? {};
    native.signals.on('signal', (signal: NativeSignal) => { try { this.signal(signal); } catch (error) {
      this.journal.append('REJECTED_NATIVE_OBSERVATION', this.target.edgeRuntimeId, { method: signal.method, threadId: typeof signal.params.threadId === 'string' ? signal.params.threadId : null, turnId: typeof signal.params.turnId === 'string' ? signal.params.turnId : null, code: error instanceof Fault ? error.code : 'NATIVE_EVIDENCE_INVALID' });
      this.quarantine(error instanceof Fault ? error.code : 'NATIVE_EVIDENCE_INVALID');
    } });
    native.signals.on('fault', (code: string) => { if (!this.closing) this.quarantine(code); });
  }
  execute(input: EdgeCommand): Promise<Receipt> {
    if (this.queued >= 32) return Promise.reject(new Fault('EDGE_BACKPRESSURE'));
    this.queued++;
    const work = this.serial.then(() => this.dispatch(input)).catch(error => {
      if (!(error instanceof Fault)) {
        this.connected = false; this.blocked = 'JOURNAL_OR_LOCAL_PROOF_FAILED';
        try { this.journal.set('blocked', this.blocked); } catch { /* The in-memory gate stays closed when storage is unavailable. */ }
      }
      throw error;
    }).finally(() => { this.queued--; });
    this.serial = work.catch(() => {}); return work;
  }
  private saveLanes(): void { this.journal.set('lanes', this.lanes); }
  private receipt(command: EdgeCommand, status: Receipt['status'], code: string): Receipt {
    const lane = command.plan.laneId ? this.lanes[command.plan.laneId] : undefined;
    return { edgeCommandId: command.edgeCommandId, status, code, nativeThreadId: lane?.threadId ?? null, nativeTurnId: lane?.turnId ?? null, nativeRequestId: null, nativeProcessId: this.native.pid, nativeInstanceId: this.nativeStarted ? this.native.instanceId : null };
  }
  private async dispatch(input: EdgeCommand): Promise<Receipt> {
    try { this.clock.check(Date.now(), performance.now()); } catch (error) { this.connected = false; this.blocked = 'CLOCK_CONTINUITY_UNKNOWN'; throw error; }
    const command = validate<EdgeCommand>('edgeCommand', input);
    const { stepDigest, ...payload } = command;
    requireThat(stepDigest === await digest('step', payload), 'EDGE_DIGEST_MISMATCH');
    const old = this.journal.lookup<StepRecord>(command.edgeCommandId);
    if (old) { requireThat(old.digest === stepDigest, 'EDGE_COMMAND_ID_REUSE_CONFLICT'); return old.value.receipt; }
    const { plan, command: fleet } = command;
    requireThat(command.planDigest === await digest('plan', plan) && fleet.intentDigest === await digest('intent', fleet.intent), 'PLAN_DIGEST_MISMATCH');
    requireThat(plan.commandId === fleet.commandId && plan.intentDigest === fleet.intentDigest && canonical(plan.target) === canonical(fleet.intent.target), 'PLAN_INTENT_MISMATCH');
    requireThat(plan.steps.length === 1 && plan.steps[0]!.edgeCommandId === command.edgeCommandId && plan.steps[0]!.operation === fleet.intent.family, 'INVALID_PLAN_STEP');
    requireThat(canonical(plan.target) === canonical(this.target), 'STALE_TARGET');
    requireThat(this.connected && !this.closing, 'EDGE_DISCONNECTED');
    requireThat(!this.blocked, this.blocked ?? 'RECOVERY_REQUIRED');
    requireThat(plan.decision.expiresAt > Date.now() && plan.decision.expiresAt <= Date.now() + 31 * 60_000 && plan.decision.ceiling === 'windows-user.read-only', 'DECISION_EXPIRED_OR_INVALID');
    for (const key of ['actorId', 'clientInstanceId', 'grantId', 'grantRevision'] as const) requireThat(plan.decision[key] === fleet.intent[key], 'DECISION_INTENT_MISMATCH');
    await this.verifyLocal();
    this.clock.check(Date.now(), performance.now());
    requireThat(this.connected && !this.blocked && plan.decision.expiresAt > Date.now(), 'ADMISSION_CLOSED');
    const family = fleet.intent.family;
    let lane: EdgeLane | undefined;
    if (family === 'workspace.register') {
      requireThat(plan.laneId === null && plan.before === null && plan.after === null, 'INVALID_WORKSPACE_PLAN');
      requireThat(fleet.intent.family === 'workspace.register' && fleet.intent.body.root === this.journal.get<string>('root'), 'WRONG_WORKSPACE');
    } else {
      requireThat(family !== 'logicalSession.create' && plan.laneId && plan.sessionId && plan.segmentId && plan.before && plan.after, 'INVALID_LANE_PLAN');
      requireThat(plan.laneId === fleet.intent.laneId && canonical(plan.before) === canonical(fleet.intent.expected), 'PLAN_FENCE_MISMATCH');
      lane = this.lanes[plan.laneId];
      if (!lane) {
        requireThat(family === 'sessionLane.acquireControl' && canonical(plan.before) === canonical({ epoch: '0', revision: '0', controller: null }), 'UNKNOWN_LANE');
        lane = { fence: plan.before, sessionId: plan.sessionId, segmentId: plan.segmentId, threadId: null, turnId: null, state: 'EMPTY', activeStep: null, creationStep: null, turnStartedObserved: false };
      }
      requireThat(lane.sessionId === plan.sessionId && lane.segmentId === plan.segmentId && canonical(lane.fence) === canonical(plan.before), 'STALE_FENCE');
      const after: Fence = { ...lane.fence, revision: next(lane.fence.revision) };
      if (family === 'sessionLane.acquireControl') {
        requireThat(lane.fence.controller === null, 'LANE_OWNED'); after.controller = fleet.intent.clientInstanceId; after.epoch = next(after.epoch);
      } else {
        requireThat(lane.fence.controller === fleet.intent.clientInstanceId, 'NOT_CONTROLLER');
        if (family === 'sessionLane.releaseControl') { after.controller = null; after.epoch = next(after.epoch); }
      }
      requireThat(canonical(after) === canonical(plan.after), 'INVALID_SUCCESSOR_FENCE');
      if (family === 'turn.submit' || family === 'sessionLane.continue') {
        requireThat(Object.values(this.lanes).every(item => ['EMPTY', 'IDLE'].includes(item.state)), 'WORKSPACE_BUSY_OR_UNKNOWN');
      }
      if (family === 'turn.submit') requireThat(lane.threadId && lane.state === 'IDLE', 'CONTINUE_REQUIRED');
      lane.fence = after; this.lanes[plan.laneId] = lane;
    }
    const isNative = family === 'turn.submit' || (family === 'sessionLane.continue' && !lane?.threadId);
    const receipt = this.receipt(command, isNative ? 'DISPATCHED' : 'SUCCEEDED', isNative ? 'DISPATCH_ATTEMPTED' : 'APPLIED');
    const record: StepRecord = { command, receipt, attempted: isNative };
    if (isNative) {
      receipt.nativeRequestId = randomUUID();
      lane!.state = 'DISPATCHED'; lane!.activeStep = command.edgeCommandId;
      if (family === 'sessionLane.continue') lane!.creationStep = command.edgeCommandId;
      else lane!.turnStartedObserved = false;
    }
    // COMMIT with synchronous=FULL is the linearization point. No native call before this returns.
    this.journal.transaction(() => {
      this.journal.insert(command.edgeCommandId, stepDigest, record);
      this.journal.append(isNative ? 'DISPATCH_ATTEMPT' : 'LOCAL_APPLIED', command.edgeCommandId, record);
      this.saveLanes();
    });
    if (!isNative) return receipt;
    this.current = command;
    try {
      requireThat(this.connected && plan.decision.expiresAt > Date.now(), 'DISCONNECTED_BEFORE_NATIVE');
      if (!this.nativeStarted) {
        this.nativeStarted = true; await this.native.start(); await this.nativeProcessProof();
        requireThat(this.connected && !this.blocked && plan.decision.expiresAt > Date.now(), 'ADMISSION_CLOSED');
      }
      this.clock.check(Date.now(), performance.now());
      receipt.nativeProcessId = this.native.pid; receipt.nativeInstanceId = this.native.instanceId;
      if (family === 'sessionLane.continue') {
        const result = await this.native.create(receipt.nativeRequestId!, this.journal.get<string>('root')!);
        requireThat(!lane!.threadId || lane!.threadId === result.threadId, 'NATIVE_THREAD_CONFLICT');
        lane!.threadId = result.threadId; lane!.state = 'IDLE'; lane!.activeStep = null;
        this.journal.append('NATIVE_BINDING', command.edgeCommandId, { ...result, processId: this.native.pid, instanceId: this.native.instanceId });
      } else {
        requireThat(fleet.intent.family === 'turn.submit', 'INVALID_NATIVE_OPERATION');
        const turnId = await this.native.turn(receipt.nativeRequestId!, lane!.threadId!, this.journal.get<string>('root')!, fleet.intent.body.text);
        requireThat(!lane!.turnId || lane!.turnId === turnId || lane!.state === 'DISPATCHED', 'NATIVE_TURN_CONFLICT');
        lane!.turnId = turnId;
        if (lane!.state === 'DISPATCHED') lane!.state = 'RUNNING';
      }
      requireThat(!this.blocked, this.blocked ?? 'NATIVE_EVIDENCE_INVALID');
      receipt.nativeThreadId = lane!.threadId; receipt.nativeTurnId = family === 'turn.submit' ? lane!.turnId : null;
      receipt.status = 'SUCCEEDED'; receipt.code = family === 'turn.submit' ? 'NATIVE_TURN_ACCEPTED' : 'NATIVE_SESSION_READY';
      this.journal.transaction(() => { this.journal.update(command.edgeCommandId, record); this.journal.append('NATIVE_RESULT', command.edgeCommandId, receipt); this.saveLanes(); });
      return receipt;
    } catch (error) {
      receipt.status = 'AMBIGUOUS_EFFECT'; receipt.code = error instanceof Fault ? error.code : 'NATIVE_EFFECT_UNKNOWN';
      receipt.nativeThreadId = lane!.threadId; receipt.nativeTurnId = lane!.turnId;
      this.journal.transaction(() => { this.journal.update(command.edgeCommandId, record); this.journal.append('AMBIGUOUS_EFFECT', command.edgeCommandId, receipt); });
      this.quarantine(receipt.code); return receipt;
    } finally { this.current = null; }
  }
  private signal(signal: NativeSignal): void {
    if (this.blocked && signal.method !== 'turn/completed') return;
    const p = signal.params;
    if (signal.requestId !== undefined) { this.quarantine('BLOCKED_UNSUPPORTED_APPROVAL'); return; }
    if (signal.method === 'thread/started') {
      const lane = this.current?.command.intent.family === 'sessionLane.continue' && this.current.plan.laneId
        ? this.lanes[this.current.plan.laneId]
        : Object.values(this.lanes).find(item => item.threadId === p.thread?.id && item.creationStep);
      requireThat(lane?.creationStep, 'EXTERNAL_NATIVE_WRITER');
      requireThat(typeof p.thread?.id === 'string' && (!lane.threadId || lane.threadId === p.thread.id), 'NATIVE_THREAD_CONFLICT');
      lane.threadId = p.thread.id; this.saveLanes(); this.journal.append('THREAD_OBSERVED', lane.creationStep, { threadId: lane.threadId }); return;
    }
    const relevant = ['turn/started', 'turn/completed', 'item/agentMessage/delta', 'item/started', 'item/completed'];
    if (!relevant.includes(signal.method)) return;
    const entry = Object.entries(this.lanes).find(([, lane]) => lane.threadId === p.threadId);
    requireThat(entry, 'EXTERNAL_NATIVE_WRITER');
    const [laneId, lane] = entry;
    const turnId = p.turn?.id ?? p.turnId;
    if (signal.method === 'turn/started') {
      requireThat(lane.activeStep && ['DISPATCHED', 'RUNNING'].includes(lane.state), 'EXTERNAL_NATIVE_WRITER');
      const admitted = this.journal.lookup<StepRecord>(lane.activeStep);
      requireThat(admitted?.value.command.command.intent.family === 'turn.submit', 'UNADMITTED_NATIVE_TURN');
      requireThat(typeof turnId === 'string' && (lane.state === 'DISPATCHED' || lane.turnId === turnId), 'NATIVE_TURN_CONFLICT');
      if (lane.turnStartedObserved) return;
      lane.turnStartedObserved = true; lane.turnId = turnId; lane.state = 'RUNNING';
    } else requireThat(lane.activeStep && lane.turnId === turnId, 'UNEXPECTED_NATIVE_TURN');
    let kind: NativeEvent['kind']; let text = ''; let status = lane.state;
    if (signal.method === 'turn/started') kind = 'turnStarted';
    else if (signal.method === 'turn/completed') { kind = 'turnCompleted'; status = p.turn.status; lane.state = 'IDLE'; }
    else if (signal.method === 'item/agentMessage/delta') { kind = 'delta'; text = p.delta; }
    else {
      if (['userMessage', 'agentMessage', 'reasoning'].includes(p.item?.type)) return;
      kind = 'tool'; text = `${p.item?.type ?? 'unknown'}: ${signal.method}`;
      // The qualified G05 profile has no tools. Unexpected tools close admission.
      this.quarantine('NATIVE_TOOL_SCOPE_VIOLATION');
    }
    const event: NativeEvent = { laneId, edgeCommandId: lane.activeStep!, kind, text, threadId: lane.threadId, turnId: lane.turnId, status };
    requireThat(typeof text === 'string' && text.length <= 24000 && typeof status === 'string', 'NATIVE_EVENT_INVALID');
    this.outputCharacters += text.length;
    if (this.outputCharacters > 500000) { this.quarantine('NATIVE_OUTPUT_LIMIT'); return; }
    this.journal.transaction(() => { this.journal.append('NATIVE_EVENT', event.edgeCommandId, event); if (kind === 'turnCompleted') lane.activeStep = null; this.saveLanes(); });
    this.emit(event);
  }
  quarantine(reason: string): void {
    this.blocked = reason;
    const events: NativeEvent[] = [];
    this.journal.transaction(() => {
      this.journal.set('blocked', reason);
      for (const [laneId, lane] of Object.entries(this.lanes)) {
        const edgeCommandId = lane.activeStep ?? lane.creationStep;
        if (edgeCommandId) {
          lane.state = reason === 'BLOCKED_UNSUPPORTED_APPROVAL' ? reason : lane.activeStep ? 'AMBIGUOUS_EFFECT' : 'RECOVERY_REQUIRED';
          const event: NativeEvent = { laneId, edgeCommandId, kind: 'blocked', text: reason, threadId: lane.threadId, turnId: lane.turnId, status: lane.state };
          this.journal.append('NATIVE_EVENT', edgeCommandId, event); events.push(event);
        }
      }
      this.saveLanes();
    });
    for (const event of events) this.emit(event);
  }
  async close(): Promise<boolean> {
    this.closing = true; this.connected = false; await this.serial;
    const quiescent = !this.blocked && Object.values(this.lanes).every(lane => ['EMPTY', 'IDLE'].includes(lane.state));
    const nativeExited = await this.native.close();
    this.journal.append('LOCAL_CLOSURE', this.target.edgeRuntimeId, { quiescent, nativeExited, nativeInstanceId: this.native.instanceId, pid: this.native.pid });
    return quiescent && nativeExited;
  }
}
