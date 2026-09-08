import { randomUUID } from 'node:crypto';
import { canonical, digest, next, requireThat, validate, ClockFence, Fault, type CommandRecord, type EdgeCommand, type FleetCommand, type Lane, type NativeEvent, type Plan, type Receipt, type Snapshot, type Target } from '../../packages/contracts/index.ts';
import { Journal } from '../../packages/journal/index.ts';

export type ClientGrant = { actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number };
export class AdmissionRejected extends Fault {
  constructor(code: string, readonly commandId: string, readonly intentDigest: string) { super(code); }
}
export class HubKernel {
  status: string;
  private serial: Promise<unknown> = Promise.resolve();
  private lanes: Lane[];
  private registered: boolean;
  private cursor = 0n;
  private outputCharacters = 0;
  private clock = new ClockFence(Date.now(), performance.now());
  private queued = 0;
  private storageFailed = false;
  constructor(readonly journal: Journal, readonly target: Target, readonly root: string,
    private deliver: (command: EdgeCommand) => Promise<Receipt>, private changed: () => void) {
    this.status = journal.recovered ? 'RECOVERY_REQUIRED' : 'CONNECTING';
    this.lanes = journal.get<Lane[]>('lanes') ?? []; this.registered = journal.get<boolean>('registered') ?? false;
  }
  snapshot(): Snapshot {
    return { status: this.status, target: this.target, root: this.root, registered: this.registered, lanes: structuredClone(this.lanes), commands: this.journal.list<CommandRecord>(), cursor: this.cursor.toString() };
  }
  lookup(id: string): CommandRecord | null { return this.journal.lookup<CommandRecord>(id)?.value ?? null; }
  private publish(): void { this.cursor++; this.changed(); }
  private save(): void { this.journal.set('lanes', this.lanes); this.journal.set('registered', this.registered); }
  ready(recovered: boolean): void { this.status = this.storageFailed || this.journal.recovered || recovered ? 'RECOVERY_REQUIRED' : 'READY'; this.publish(); }
  disconnect(reason = 'EDGE_DISCONNECTED'): void { this.status = this.storageFailed ? 'RECOVERY_REQUIRED' : reason; this.publish(); }
  private failStorage(error: unknown): void {
    if (error instanceof Fault && error.code !== 'MISSING_JOURNAL_RECORD') return;
    this.storageFailed = true; this.status = 'RECOVERY_REQUIRED';
    for (const lane of this.lanes) lane.state = 'RECOVERY_REQUIRED';
    // The gate must remain closed even when persisting or publishing is unavailable.
    try { this.publish(); } catch { /* A failed snapshot cannot reopen admission. */ }
  }
  private rejection(input: unknown, error: unknown): unknown {
    if (error instanceof Fault && !this.storageFailed) {
      try {
        const command = validate<FleetCommand>('command', input);
        return new AdmissionRejected(error.code, command.commandId, command.intentDigest);
      } catch { /* Malformed requests receive no command-specific acknowledgment. */ }
    }
    return error;
  }
  execute(input: unknown, grant: ClientGrant): Promise<CommandRecord> {
    if (this.queued >= 32) return Promise.reject(this.rejection(input, new Fault('COMMAND_BACKPRESSURE')));
    this.queued++;
    let admitted = false;
    const work = this.serial.then(() => this.admit(input, grant, () => { admitted = true; })).catch(error => {
      this.failStorage(error); throw admitted ? error : this.rejection(input, error);
    }).finally(() => { this.queued--; });
    this.serial = work.catch(() => {}); return work;
  }
  private async admit(input: unknown, grant: ClientGrant, committed: () => void): Promise<CommandRecord> {
    try { this.clock.check(Date.now(), performance.now()); } catch (error) { this.disconnect('CLOCK_CONTINUITY_UNKNOWN'); throw error; }
    const command = validate<FleetCommand>('command', input);
    const intent = command.intent;
    requireThat(command.intentDigest === await digest('intent', intent), 'INTENT_DIGEST_MISMATCH');
    for (const field of ['actorId', 'clientInstanceId', 'grantId', 'grantRevision'] as const) requireThat(intent[field] === grant[field], 'WRONG_ACTOR_OR_GRANT');
    requireThat(grant.expiresAt > Date.now(), 'GRANT_EXPIRED');
    const previous = this.journal.lookup<CommandRecord>(command.commandId);
    if (previous) { requireThat(previous.digest === command.intentDigest && previous.value.command.idempotencyKey === command.idempotencyKey, 'COMMAND_ID_REUSE_CONFLICT'); return previous.value; }
    const alias = canonical({ actor: intent.actorId, grant: intent.grantId, revision: intent.grantRevision, family: intent.family, target: intent.target, lane: intent.laneId, key: command.idempotencyKey });
    const priorAlias = this.journal.db.prepare('SELECT id,digest FROM aliases WHERE alias=?').get(alias);
    if (priorAlias) { requireThat(priorAlias.digest === command.intentDigest, 'IDEMPOTENCY_CONFLICT'); return this.lookup(String(priorAlias.id))!; }
    requireThat(this.status === 'READY', this.status);
    requireThat(canonical(intent.target) === canonical(this.target), 'STALE_TARGET');
    requireThat(this.journal.list<CommandRecord>().length < 500, 'LOCAL_SESSION_LIMIT');
    const lane = intent.laneId ? this.lanes.find(item => item.laneId === intent.laneId) : undefined;
    const family = intent.family;
    const plan: Plan = { v: 1, planId: randomUUID(), commandId: command.commandId, intentDigest: command.intentDigest, target: structuredClone(intent.target),
      decision: { decisionId: randomUUID(), actorId: grant.actorId, clientInstanceId: grant.clientInstanceId, grantId: grant.grantId, grantRevision: grant.grantRevision, expiresAt: grant.expiresAt, ceiling: 'windows-user.read-only' }, sessionId: lane?.sessionId ?? null, laneId: lane?.laneId ?? null, segmentId: lane?.segmentId ?? null, before: lane ? structuredClone(lane.fence) : null, after: lane ? structuredClone(lane.fence) : null, steps: [] };
    let created: Lane | null = null;
    if (family === 'workspace.register') {
      requireThat(intent.laneId === null && intent.expected === null && intent.body.root === this.root, 'WRONG_WORKSPACE');
      requireThat(!this.registered, 'WORKSPACE_ALREADY_REGISTERED');
    } else if (family === 'logicalSession.create') {
      requireThat(this.lanes.length < 24, 'LOCAL_SESSION_LIMIT');
      requireThat(this.registered && intent.laneId === null && intent.expected === null, 'WORKSPACE_NOT_REGISTERED');
      created = { sessionId: randomUUID(), laneId: randomUUID(), segmentId: randomUUID(), title: intent.body.title, fence: { epoch: '0', revision: '0', controller: null }, state: 'EMPTY', nativeThreadId: null, nativeTurnId: null, transcript: [] };
      plan.sessionId = created.sessionId; plan.laneId = created.laneId; plan.segmentId = created.segmentId;
    } else {
      requireThat(lane && intent.expected && canonical(lane.fence) === canonical(intent.expected), 'STALE_FENCE');
      requireThat(!['PENDING', 'AMBIGUOUS_EFFECT', 'RECOVERY_REQUIRED'].includes(lane.state), 'LANE_BLOCKED');
      plan.after!.revision = next(lane.fence.revision);
      if (family === 'sessionLane.acquireControl') {
        requireThat(lane.fence.controller === null, 'LANE_OWNED');
        plan.after!.controller = grant.clientInstanceId; plan.after!.epoch = next(lane.fence.epoch);
      } else {
        requireThat(lane.fence.controller === grant.clientInstanceId, 'NOT_CONTROLLER');
        if (family === 'sessionLane.releaseControl') { plan.after!.controller = null; plan.after!.epoch = next(lane.fence.epoch); }
        else {
          requireThat(this.lanes.every(item => ['EMPTY', 'IDLE'].includes(item.state)), 'WORKSPACE_BUSY_OR_UNKNOWN');
          if (family === 'turn.submit') requireThat(lane.nativeThreadId && lane.state === 'IDLE', 'CONTINUE_REQUIRED');
        }
      }
    }
    if (family !== 'logicalSession.create') plan.steps.push({ edgeCommandId: randomUUID(), operation: family, dependsOn: [] });
    validate('plan', plan);
    const record: CommandRecord = { command, plan, status: 'ADMITTED', receipt: null };
    const formerState = lane?.state;
    this.journal.transaction(() => {
      this.journal.insert(command.commandId, command.intentDigest, record);
      this.journal.db.prepare('INSERT INTO aliases VALUES(?,?,?)').run(alias, command.commandId, command.intentDigest);
      this.journal.append('ADMITTED_PLAN', command.commandId, record);
      if (lane) { lane.fence = structuredClone(plan.after!); lane.state = 'PENDING'; }
      if (created) this.lanes.push(created);
      this.save();
    });
    committed();
    this.publish();
    if (created) {
      record.status = 'SUCCEEDED'; this.journal.update(command.commandId, record); this.journal.append('LOGICAL_ONLY', command.commandId, { nativeCreated: false }); this.publish(); return record;
    }
    const payload = { v: 1 as const, edgeCommandId: plan.steps[0]!.edgeCommandId, planDigest: await digest('plan', plan), plan, command };
    const edgeCommand: EdgeCommand = { ...payload, stepDigest: await digest('step', payload) };
    try {
      const receipt = await this.deliver(edgeCommand);
      requireThat(receipt.edgeCommandId === edgeCommand.edgeCommandId, 'WRONG_RECEIPT');
      record.receipt = receipt; record.status = receipt.status;
      if (receipt.status === 'AMBIGUOUS_EFFECT' || receipt.status === 'DISPATCHED') { this.status = 'AMBIGUOUS_EFFECT'; if (lane) lane.state = 'AMBIGUOUS_EFFECT'; }
      else if (receipt.status === 'REJECTED') { this.status = 'RECOVERY_REQUIRED'; if (lane) lane.state = 'RECOVERY_REQUIRED'; }
      else {
        if (family === 'workspace.register') this.registered = true;
        if (lane) {
          lane.nativeThreadId = receipt.nativeThreadId ?? lane.nativeThreadId;
          if (family === 'turn.submit') {
            lane.nativeTurnId = receipt.nativeTurnId;
            if (lane.state === 'PENDING') lane.state = 'RUNNING';
          } else if (lane.state === 'PENDING') lane.state = family === 'sessionLane.continue' ? 'IDLE' : formerState!;
        }
      }
    } catch {
      record.status = 'AMBIGUOUS_EFFECT'; this.status = 'AMBIGUOUS_EFFECT'; if (lane) lane.state = 'AMBIGUOUS_EFFECT';
      this.journal.append('DELIVERY_UNKNOWN', command.commandId, { edgeCommandId: edgeCommand.edgeCommandId });
    }
    this.journal.transaction(() => { this.journal.update(command.commandId, record); this.journal.append('COMMAND_RESULT', command.commandId, record); this.save(); });
    this.publish(); return record;
  }
  event(event: NativeEvent): void {
    try { this.observe(event); } catch (error) { this.failStorage(error); throw error; }
  }
  private observe(event: NativeEvent): void {
    const lane = this.lanes.find(item => item.laneId === event.laneId);
    requireThat(lane, 'EVENT_LANE_UNKNOWN');
    const command = this.journal.list<CommandRecord>().find(item => item.plan.steps[0]?.edgeCommandId === event.edgeCommandId);
    requireThat(command && command.plan.laneId === lane.laneId, 'EVENT_STEP_UNKNOWN');
    if (lane.nativeThreadId) requireThat(lane.nativeThreadId === event.threadId, 'EVENT_THREAD_CONFLICT');
    if (event.kind === 'turnStarted') {
      requireThat(command.command.intent.family === 'turn.submit' && event.turnId, 'EVENT_TURN_INVALID');
      lane.nativeTurnId = event.turnId; lane.nativeThreadId = event.threadId;
      lane.transcript.push({ role: 'user', text: command.command.intent.body.text }, { role: 'assistant', text: '' });
      if (this.status === 'READY') lane.state = 'RUNNING';
    } else {
      if (event.kind !== 'blocked') requireThat(event.turnId === lane.nativeTurnId, 'EVENT_TURN_CONFLICT');
      if (event.kind === 'delta') {
        this.outputCharacters += event.text.length;
        requireThat(this.outputCharacters <= 500000, 'LOCAL_OUTPUT_LIMIT');
        const last = lane.transcript.at(-1); requireThat(last?.role === 'assistant', 'EVENT_ORDER_INVALID'); last.text += event.text;
      } else if (event.kind === 'turnCompleted') {
        requireThat(['completed', 'interrupted', 'failed'].includes(event.status), 'NATIVE_TERMINAL_UNKNOWN');
        if (this.status === 'READY') lane.state = 'IDLE';
        lane.transcript.push({ role: 'system', text: `Turn ${event.status}` });
      } else if (event.kind === 'blocked') {
        this.status = event.status; lane.state = event.status; lane.transcript.push({ role: 'system', text: event.text });
      } else lane.transcript.push({ role: 'system', text: event.text });
    }
    this.journal.transaction(() => { this.journal.append('OBSERVED_NATIVE_EVENT', event.edgeCommandId, event); this.save(); });
    this.publish();
  }
}
