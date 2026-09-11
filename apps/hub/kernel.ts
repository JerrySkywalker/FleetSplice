import { randomUUID } from 'node:crypto';
import { canonical, digest, next, requireThat, validate, ClockFence, Fault, type CommandRecord, type EdgeCommand, type FleetCommand, type Lane, type NativeCapabilityCatalog, type NativeEvent, type Plan, type Receipt, type Snapshot, type Target } from '../../packages/contracts/index.ts';
import { Journal } from '../../packages/journal/index.ts';
import type { WorkspaceBinding } from '../../packages/contracts/index.ts';

export type ClientGrant = { actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number };
export class AdmissionRejected extends Fault {
  constructor(code: string, readonly commandId: string, readonly intentDigest: string, readonly canonicalCommandId = commandId) { super(code); }
}
type RejectedCommand = { command: FleetCommand; rejectionCode: string };
type AliasedCommand = { command: FleetCommand; canonicalCommandId: string };
type StoredCommand = CommandRecord | RejectedCommand | AliasedCommand;
export class HubKernel {
  status: string;
  private serial: Promise<unknown> = Promise.resolve();
  private lanes: Lane[];
  private registered: boolean;
  private registeredWorkspaceIds: string[];
  private capabilities: NativeCapabilityCatalog | null;
  private cursor = 0n;
  private outputCharacters = 0;
  private clock = new ClockFence(Date.now(), performance.now());
  private queued = 0;
  private storageFailed = false;
  constructor(readonly journal: Journal, readonly target: Target, readonly root: string,
    private deliver: (command: EdgeCommand) => Promise<Receipt>, private changed: () => void,
    private workspaces: WorkspaceBinding[] = [{ registryId: target.workspaceId, displayName: root, root, rootIdentity: target.rootIdentity, target, valid: true }]) {
    this.status = journal.recovered ? 'RECOVERY_REQUIRED' : 'CONNECTING';
    this.lanes = journal.get<Lane[]>('lanes') ?? []; this.registered = journal.get<boolean>('registered') ?? false;
    this.capabilities = journal.get<NativeCapabilityCatalog>('capabilities') ?? null;
    this.registeredWorkspaceIds = journal.get<string[]>('registeredWorkspaceIds') ?? (this.registered ? [target.workspaceId] : []);
  }
  snapshot(): Snapshot {
    return { status: this.status, target: this.target, root: this.root, registered: this.registered, workspaces: structuredClone(this.workspaces.map(w => ({ ...w, registered: this.registeredWorkspaceIds.includes(w.target.workspaceId) }))), capabilities: structuredClone(this.capabilities), lanes: structuredClone(this.lanes), commands: this.commands(), cursor: this.cursor.toString() };
  }
  private commands(): CommandRecord[] { return this.journal.list<StoredCommand>().filter((record): record is CommandRecord => 'plan' in record); }
  private replay(record: StoredCommand, requestedId = record.command.commandId): CommandRecord {
    if ('canonicalCommandId' in record) {
      const canonical = this.journal.lookup<StoredCommand>(record.canonicalCommandId);
      requireThat(canonical && canonical.digest === record.command.intentDigest && !('canonicalCommandId' in canonical.value), 'MISSING_JOURNAL_RECORD');
      return this.replay(canonical.value, requestedId);
    }
    if ('rejectionCode' in record) throw new AdmissionRejected(record.rejectionCode, requestedId, record.command.intentDigest, record.command.commandId);
    return record;
  }
  lookup(id: string): CommandRecord | null {
    const stored = this.journal.lookup<StoredCommand>(id); return stored ? this.replay(stored.value) : null;
  }
  private publish(): void { this.cursor++; this.changed(); }
  private save(): void { this.journal.set('lanes', this.lanes); this.journal.set('registered', this.registered); this.journal.set('registeredWorkspaceIds', this.registeredWorkspaceIds); this.journal.set('capabilities', this.capabilities); }
  ready(recovered: boolean): void { this.status = this.storageFailed || this.journal.recovered || recovered ? 'RECOVERY_REQUIRED' : 'READY'; this.publish(); }
  disconnect(reason = 'EDGE_DISCONNECTED'): void { this.status = this.storageFailed ? 'RECOVERY_REQUIRED' : reason; this.publish(); }
  private failStorage(error: unknown): void {
    if (error instanceof Fault && error.code !== 'MISSING_JOURNAL_RECORD') return;
    this.storageFailed = true; this.status = 'RECOVERY_REQUIRED';
    for (const lane of this.lanes) lane.state = 'RECOVERY_REQUIRED';
    // The gate must remain closed even when persisting or publishing is unavailable.
    try { this.publish(); } catch { /* A failed snapshot cannot reopen admission. */ }
  }
  execute(input: unknown, grant: ClientGrant): Promise<CommandRecord> {
    // Queue pressure cannot prove that another delivery of this ID has no effect.
    if (this.queued >= 32) return Promise.reject(new Fault('COMMAND_BACKPRESSURE'));
    this.queued++;
    const admission: { committed: boolean; newIntent: { command: FleetCommand; alias: string } | null } = { committed: false, newIntent: null };
    const work = this.serial.then(() => this.admit(input, grant, () => { admission.committed = true; }, (command, alias) => { admission.newIntent = { command, alias }; })).catch(error => {
      this.failStorage(error);
      if (!admission.committed && admission.newIntent && error instanceof Fault && !this.storageFailed) {
        const { command, alias } = admission.newIntent;
        const rejected: RejectedCommand = { command, rejectionCode: error.code };
        try {
          this.journal.transaction(() => {
            this.journal.insert(command.commandId, command.intentDigest, rejected);
            this.journal.db.prepare('INSERT INTO aliases VALUES(?,?,?)').run(alias, command.commandId, command.intentDigest);
            this.journal.append('REJECTED_BEFORE_ADMISSION', command.commandId, rejected);
          });
        } catch (storageError) { this.failStorage(storageError); throw storageError; }
        throw new AdmissionRejected(error.code, command.commandId, command.intentDigest);
      }
      throw error;
    }).finally(() => { this.queued--; });
    this.serial = work.catch(() => {}); return work;
  }
  private async admit(input: unknown, grant: ClientGrant, committed: () => void, newIntent: (command: FleetCommand, alias: string) => void): Promise<CommandRecord> {
    try { this.clock.check(Date.now(), performance.now()); } catch (error) { this.disconnect('CLOCK_CONTINUITY_UNKNOWN'); throw error; }
    const command = validate<FleetCommand>('command', input);
    const intent = command.intent;
    requireThat(command.intentDigest === await digest('intent', intent), 'INTENT_DIGEST_MISMATCH');
    for (const field of ['actorId', 'clientInstanceId', 'grantId', 'grantRevision'] as const) requireThat(intent[field] === grant[field], 'WRONG_ACTOR_OR_GRANT');
    requireThat(grant.expiresAt > Date.now(), 'GRANT_EXPIRED');
    const previous = this.journal.lookup<StoredCommand>(command.commandId);
    if (previous) { requireThat(previous.digest === command.intentDigest && previous.value.command.idempotencyKey === command.idempotencyKey, 'COMMAND_ID_REUSE_CONFLICT'); return this.replay(previous.value); }
    const alias = canonical({ actor: intent.actorId, grant: intent.grantId, revision: intent.grantRevision, family: intent.family, target: intent.target, lane: intent.laneId, key: command.idempotencyKey });
    const priorAlias = this.journal.db.prepare('SELECT id,digest FROM aliases WHERE alias=?').get(alias);
    if (priorAlias) {
      requireThat(priorAlias.digest === command.intentDigest, 'IDEMPOTENCY_CONFLICT');
      requireThat(this.journal.list<StoredCommand>().length < 500, 'LOCAL_SESSION_LIMIT');
      const aliased: AliasedCommand = { command, canonicalCommandId: String(priorAlias.id) };
      this.journal.transaction(() => {
        this.journal.insert(command.commandId, command.intentDigest, aliased);
        this.journal.append('COMMAND_ID_ALIAS', command.commandId, aliased);
      });
      return this.replay(aliased);
    }
    requireThat(this.journal.list<StoredCommand>().length < 500, 'LOCAL_SESSION_LIMIT');
    // Only this serialized, absent ID/alias may acquire a retained rejection.
    newIntent(command, alias);
    requireThat(this.status === 'READY', this.status);
    const workspace = this.workspaces.find(w => canonical(w.target) === canonical(intent.target));
    requireThat(workspace?.valid, 'STALE_TARGET');
    const lane = intent.laneId ? this.lanes.find(item => item.laneId === intent.laneId) : undefined;
    if (lane) requireThat(canonical(lane.target) === canonical(intent.target), 'SESSION_WORKSPACE_IMMUTABLE');
    const family = intent.family;
    const plan: Plan = { v: 1, planId: randomUUID(), commandId: command.commandId, intentDigest: command.intentDigest, target: structuredClone(intent.target),
      decision: { decisionId: randomUUID(), actorId: grant.actorId, clientInstanceId: grant.clientInstanceId, grantId: grant.grantId, grantRevision: grant.grantRevision, expiresAt: grant.expiresAt, ceiling: 'windows-user.local-host-policy' }, sessionId: lane?.sessionId ?? null, laneId: lane?.laneId ?? null, segmentId: lane?.segmentId ?? null, before: lane ? structuredClone(lane.fence) : null, after: lane ? structuredClone(lane.fence) : null, steps: [] };
    let created: Lane | null = null;
    if (family === 'workspace.register') {
      requireThat(intent.laneId === null && intent.expected === null && intent.body.root === workspace.root, 'WRONG_WORKSPACE');
      requireThat(!this.registeredWorkspaceIds.includes(workspace.target.workspaceId), 'WORKSPACE_ALREADY_REGISTERED');
    } else if (family === 'logicalSession.create') {
      requireThat(this.lanes.length < 24, 'LOCAL_SESSION_LIMIT');
      requireThat(this.registeredWorkspaceIds.includes(workspace.target.workspaceId) && intent.laneId === null && intent.expected === null, 'WORKSPACE_NOT_REGISTERED');
      created = { sessionId: randomUUID(), laneId: randomUUID(), segmentId: randomUUID(), title: intent.body.title, target: structuredClone(workspace.target), root: workspace.root, fence: { epoch: '0', revision: '0', controller: null }, state: 'EMPTY', nativeThreadId: null, nativeTurnId: null, requestedModel: null, requestedReasoningEffort: null, effectiveModel: null, effectiveReasoningEffort: null, activity: [], transcript: [] };
      plan.sessionId = created.sessionId; plan.laneId = created.laneId; plan.segmentId = created.segmentId;
    } else if (family === 'native.capabilities.read') {
      requireThat(this.registeredWorkspaceIds.includes(workspace.target.workspaceId) && intent.laneId === null && intent.expected === null, 'WORKSPACE_NOT_REGISTERED');
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
      if (receipt.nativeCapabilities) this.capabilities = receipt.nativeCapabilities;
      if (receipt.status === 'AMBIGUOUS_EFFECT' || receipt.status === 'DISPATCHED') { this.status = 'AMBIGUOUS_EFFECT'; if (lane) lane.state = 'AMBIGUOUS_EFFECT'; }
      else if (receipt.status === 'REJECTED') {
        // Fresh native catalog evidence can safely reject a browser-held stale
        // selection before thread/start. Require an explicit reselection rather
        // than silently changing model/reasoning or forcing recovery.
        if (lane && (['STALE_MODEL_SELECTION', 'STALE_REASONING_SELECTION', 'STALE_PERMISSION_SELECTION'].includes(receipt.code) || (receipt.code === 'HOST_PERMISSION_CEILING_REJECTED' && receipt.nativeRequestId === null) || (family === 'sessionLane.continue' && receipt.code === 'EXISTING_NATIVE_CONFIGURATION_IMMUTABLE' && receipt.nativeRequestId === null && receipt.nativeThreadId === lane.nativeThreadId))) lane.state = formerState!;
        else { this.status = 'RECOVERY_REQUIRED'; if (lane) lane.state = 'RECOVERY_REQUIRED'; }
      }
      else {
        if (family === 'workspace.register') { this.registeredWorkspaceIds.push(workspace.target.workspaceId); if (workspace.target.workspaceId === this.target.workspaceId) this.registered = true; }
        if (lane) {
          lane.nativeThreadId = receipt.nativeThreadId ?? lane.nativeThreadId;
          if (family === 'turn.submit') {
            lane.nativeTurnId = receipt.nativeTurnId;
            if (lane.state === 'PENDING') lane.state = 'RUNNING';
          } else if (family === 'sessionLane.continue' && receipt.nativeConfiguration !== null) {
            lane.requestedModel = receipt.nativeConfiguration.requestedModel; lane.requestedReasoningEffort = receipt.nativeConfiguration.requestedReasoningEffort;
            lane.effectiveModel = receipt.nativeConfiguration.effectiveModel; lane.effectiveReasoningEffort = receipt.nativeConfiguration.effectiveReasoningEffort;
            lane.requestedPermission = receipt.nativeConfiguration.requestedPermission; lane.effectivePermission = receipt.nativeConfiguration.effectivePermission;
            if (lane.state === 'PENDING') lane.state = 'IDLE';
          } else if (lane.state === 'PENDING') lane.state = formerState!;
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
    const command = this.commands().find(item => item.plan.steps[0]?.edgeCommandId === event.edgeCommandId);
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
      } else if (event.kind === 'configurationInvalidated') {
        requireThat(event.text === 'NATIVE_MODEL_REROUTED' && event.status === 'EFFECTIVE_CONFIGURATION_UNKNOWN', 'NATIVE_CONFIGURATION_EVENT_INVALID');
        lane.effectiveModel = null; lane.effectiveReasoningEffort = null;
        lane.transcript.push({ role: 'system', text: event.text });
      } else if (event.kind === 'tool') {
        requireThat(typeof event.text === 'string' && event.text.length > 0 && event.text.length <= 24000 && typeof event.status === 'string' && event.status.length <= 120, 'NATIVE_EVENT_INVALID');
        lane.activity.push({ text: event.text, status: event.status });
        if (lane.activity.length > 100) lane.activity.splice(0, lane.activity.length - 100);
      } else lane.transcript.push({ role: 'system', text: event.text });
    }
    this.journal.transaction(() => { this.journal.append('OBSERVED_NATIVE_EVENT', event.edgeCommandId, event); this.save(); });
    this.publish();
  }
}
