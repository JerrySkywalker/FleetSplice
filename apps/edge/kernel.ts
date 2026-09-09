import { randomUUID } from 'node:crypto';
import { canonical, digest, next, requireThat, validate, Fault, ClockFence, type EdgeCommand, type Fence, type NativeCapabilityCatalog, type NativeEvent, type Receipt, type Target } from '../../packages/contracts/index.ts';
import { Journal } from '../../packages/journal/index.ts';
import type { NativePort, NativeSignal } from '../../packages/driver-codex/index.ts';
import type { WorkspaceBinding } from '../../packages/contracts/index.ts';

type EdgeLane = { fence: Fence; sessionId: string; segmentId: string; target: Target; root: string; threadId: string | null; turnId: string | null; state: string; activeStep: string | null; creationStep: string | null; turnStartedObserved: boolean; configuration?: { model: string; reasoningEffort: string } };
type StepRecord = { command: EdgeCommand; receipt: Receipt; attempted: boolean };
type CommandLifecycle = { laneId: string; edgeCommandId: string; threadId: string; turnId: string; itemId: string; signature: string; state: 'STARTED' | 'COMPLETED' };
export class EdgeKernel {
  connected = false;
  blocked: string | null;
  closing = false;
  private serial: Promise<unknown> = Promise.resolve();
  private lanes: Record<string, EdgeLane>;
  private current: EdgeCommand | null = null;
  private nativeStarted = false;
  private capabilities: NativeCapabilityCatalog | null;
  private clock = new ClockFence(Date.now(), performance.now());
  private queued = 0;
  private outputCharacters = 0;
  // This is deliberately separate from lane state: an app-server notification
  // sequence is correlated by its native item id, rather than inferred from a
  // completion-only tool observation or an incidental notification order.
  private commandLifecycles = new Map<string, CommandLifecycle>();
  private reasoningItems = new Map<string, { threadId: string; turnId: string; completed: boolean }>();
  constructor(readonly journal: Journal, readonly target: Target, private native: NativePort,
    private verifyLocal: () => Promise<void>, private emit: (event: NativeEvent) => void,
    private nativeProcessProof: () => Promise<void> = async () => {},
    private workspaces: WorkspaceBinding[] = [{ registryId: target.workspaceId, displayName: 'Workspace', root: journal.get<string>('root')!, rootIdentity: target.rootIdentity, target, valid: true }],
    private verifyWorkspace: (workspace: WorkspaceBinding) => Promise<void> = async () => {},
    private verifyWorkspaceNow: (workspace: WorkspaceBinding) => void = () => {}) {
    this.blocked = journal.recovered ? 'RECOVERY_REQUIRED' : null;
    this.lanes = journal.get('lanes') ?? {};
    this.capabilities = journal.get<NativeCapabilityCatalog>('capabilities') ?? null;
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
    return { edgeCommandId: command.edgeCommandId, status, code, nativeThreadId: lane?.threadId ?? null, nativeTurnId: lane?.turnId ?? null, nativeRequestId: null, nativeProcessId: this.native.pid, nativeInstanceId: this.nativeStarted ? this.native.instanceId : null, nativeCapabilities: null, nativeConfiguration: null };
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
    const workspace = this.workspaces.find(w => canonical(w.target) === canonical(plan.target));
    requireThat(workspace?.valid, 'STALE_TARGET');
    requireThat(this.connected && !this.closing, 'EDGE_DISCONNECTED');
    requireThat(!this.blocked, this.blocked ?? 'RECOVERY_REQUIRED');
    requireThat(plan.decision.expiresAt > Date.now() && plan.decision.expiresAt <= Date.now() + 31 * 60_000 && plan.decision.ceiling === 'windows-user.read-only', 'DECISION_EXPIRED_OR_INVALID');
    for (const key of ['actorId', 'clientInstanceId', 'grantId', 'grantRevision'] as const) requireThat(plan.decision[key] === fleet.intent[key], 'DECISION_INTENT_MISMATCH');
    await this.verifyLocal();
    await this.verifyWorkspace(workspace);
    this.clock.check(Date.now(), performance.now());
    requireThat(this.connected && !this.blocked && plan.decision.expiresAt > Date.now(), 'ADMISSION_CLOSED');
    const family = fleet.intent.family;
    let lane: EdgeLane | undefined;
    if (family === 'workspace.register') {
      requireThat(plan.laneId === null && plan.before === null && plan.after === null, 'INVALID_WORKSPACE_PLAN');
      requireThat(fleet.intent.family === 'workspace.register' && fleet.intent.body.root === workspace.root, 'WRONG_WORKSPACE');
    } else if (family === 'native.capabilities.read') {
      requireThat(plan.laneId === null && plan.sessionId === null && plan.segmentId === null && plan.before === null && plan.after === null, 'INVALID_CAPABILITY_PLAN');
    } else {
      requireThat(family !== 'logicalSession.create' && plan.laneId && plan.sessionId && plan.segmentId && plan.before && plan.after, 'INVALID_LANE_PLAN');
      requireThat(plan.laneId === fleet.intent.laneId && canonical(plan.before) === canonical(fleet.intent.expected), 'PLAN_FENCE_MISMATCH');
      lane = this.lanes[plan.laneId];
      if (!lane) {
        requireThat(family === 'sessionLane.acquireControl' && canonical(plan.before) === canonical({ epoch: '0', revision: '0', controller: null }), 'UNKNOWN_LANE');
        lane = { fence: plan.before, sessionId: plan.sessionId, segmentId: plan.segmentId, target: structuredClone(workspace.target), root: workspace.root, threadId: null, turnId: null, state: 'EMPTY', activeStep: null, creationStep: null, turnStartedObserved: false };
      }
      requireThat(canonical(lane.target) === canonical(workspace.target) && lane.root === workspace.root, 'SESSION_WORKSPACE_IMMUTABLE');
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
    const isNative = family === 'native.capabilities.read' || family === 'turn.submit' || (family === 'sessionLane.continue' && !lane?.threadId);
    const receipt = this.receipt(command, isNative ? 'DISPATCHED' : 'SUCCEEDED', isNative ? 'DISPATCH_ATTEMPTED' : 'APPLIED');
    if (family === 'sessionLane.continue' && lane?.threadId && (lane.configuration?.model !== fleet.intent.body.model || lane.configuration?.reasoningEffort !== fleet.intent.body.reasoningEffort)) {
      receipt.status = 'REJECTED'; receipt.code = 'EXISTING_NATIVE_CONFIGURATION_IMMUTABLE';
    }
    const record: StepRecord = { command, receipt, attempted: isNative };
    if (isNative) {
      receipt.nativeRequestId = randomUUID();
      if (lane) {
        lane.state = 'DISPATCHED'; lane.activeStep = command.edgeCommandId;
        if (family === 'sessionLane.continue') lane.creationStep = command.edgeCommandId;
        else lane.turnStartedObserved = false;
      }
    }
    // COMMIT with synchronous=FULL is the linearization point. No native call before this returns.
    this.journal.transaction(() => {
      this.journal.insert(command.edgeCommandId, stepDigest, record);
      this.journal.append(isNative ? 'DISPATCH_ATTEMPT' : 'LOCAL_APPLIED', command.edgeCommandId, record);
      this.saveLanes();
    });
    if (!isNative) return receipt;
    this.current = command;
    // The driver calls this synchronously after non-effecting async qualification,
    // immediately before spawn/thread/start/turn/start. The original attempt remains
    // durable if this gate aborts; there is no second dispatch or retry.
    const beforeNativeEffect = () => {
      this.clock.check(Date.now(), performance.now());
      requireThat(this.connected && !this.closing && !this.blocked && plan.decision.expiresAt > Date.now(), 'ADMISSION_CLOSED');
      this.verifyWorkspaceNow(workspace);
    };
    try {
      requireThat(this.connected && plan.decision.expiresAt > Date.now(), 'DISCONNECTED_BEFORE_NATIVE');
      if (!this.nativeStarted) {
        this.nativeStarted = true; await this.native.start(beforeNativeEffect); await this.nativeProcessProof();
        requireThat(this.connected && !this.blocked && plan.decision.expiresAt > Date.now(), 'ADMISSION_CLOSED');
      }
      this.clock.check(Date.now(), performance.now());
      receipt.nativeProcessId = this.native.pid; receipt.nativeInstanceId = this.native.instanceId;
      if (family === 'native.capabilities.read') {
        const catalog = await this.native.capabilities(receipt.nativeRequestId!, beforeNativeEffect);
        this.capabilities = catalog; receipt.nativeCapabilities = catalog;
        receipt.status = 'SUCCEEDED'; receipt.code = 'NATIVE_CAPABILITIES_READY';
        this.journal.transaction(() => {
          this.journal.set('capabilities', catalog); this.journal.update(command.edgeCommandId, record);
          this.journal.append('NATIVE_CAPABILITIES', command.edgeCommandId, catalog); this.journal.append('NATIVE_RESULT', command.edgeCommandId, receipt);
          this.saveLanes();
        });
        return receipt;
      }
      if (family === 'sessionLane.continue') {
        const configuration = fleet.intent.body as { model: string; reasoningEffort: string };
        const catalog = await this.native.capabilities(randomUUID(), beforeNativeEffect);
        this.capabilities = catalog; receipt.nativeCapabilities = catalog;
        const selected = catalog.models.find(model => model.id === configuration.model);
        const staleCode = !selected ? 'STALE_MODEL_SELECTION' : !selected.supportedReasoningEfforts.some(choice => choice.reasoningEffort === configuration.reasoningEffort) ? 'STALE_REASONING_SELECTION' : null;
        if (staleCode) {
          receipt.status = 'REJECTED'; receipt.code = staleCode;
          lane!.state = 'EMPTY'; lane!.activeStep = null; lane!.creationStep = null;
          this.journal.transaction(() => {
            this.journal.set('capabilities', catalog); this.journal.update(command.edgeCommandId, record);
            this.journal.append('NATIVE_CAPABILITIES', command.edgeCommandId, catalog); this.journal.append('NATIVE_RESULT', command.edgeCommandId, receipt); this.saveLanes();
          });
          return receipt;
        }
        const result = await this.native.create(receipt.nativeRequestId!, lane!.root, configuration, beforeNativeEffect);
        requireThat(!lane!.threadId || lane!.threadId === result.threadId, 'NATIVE_THREAD_CONFLICT');
        lane!.threadId = result.threadId; lane!.state = 'IDLE'; lane!.activeStep = null;
        receipt.nativeConfiguration = { requestedModel: configuration.model, requestedReasoningEffort: configuration.reasoningEffort, effectiveModel: result.model, effectiveReasoningEffort: result.reasoningEffort };
        lane!.configuration = { ...configuration };
        this.journal.append('NATIVE_BINDING', command.edgeCommandId, { ...result, root: lane!.root, workspaceTarget: workspace.target, processId: this.native.pid, instanceId: this.native.instanceId });
      } else {
        requireThat(fleet.intent.family === 'turn.submit', 'INVALID_NATIVE_OPERATION');
        const turnId = await this.native.turn(receipt.nativeRequestId!, lane!.threadId!, lane!.root, fleet.intent.body.text, beforeNativeEffect);
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
      receipt.nativeThreadId = lane?.threadId ?? null; receipt.nativeTurnId = lane?.turnId ?? null;
      receipt.nativeProcessId = this.native.pid; receipt.nativeInstanceId = this.nativeStarted ? this.native.instanceId : null;
      this.journal.transaction(() => { this.journal.update(command.edgeCommandId, record); this.journal.append('AMBIGUOUS_EFFECT', command.edgeCommandId, receipt); });
      this.quarantine(receipt.code); return receipt;
    } finally { this.current = null; }
  }
  private signal(signal: NativeSignal): void {
    if (this.blocked && signal.method !== 'turn/completed') return;
    const p = signal.params;
    if (signal.requestId !== undefined) { this.quarantine('BLOCKED_UNSUPPORTED_APPROVAL'); return; }
    if (signal.method === 'thread/started') {
      const lane = Object.values(this.lanes).find(item => item.threadId === p.thread?.id && item.creationStep) ?? (this.current?.command.intent.family === 'sessionLane.continue' && this.current.plan.laneId
        ? this.lanes[this.current.plan.laneId]
        : undefined);
      requireThat(lane?.creationStep, 'EXTERNAL_NATIVE_WRITER');
      requireThat(typeof p.thread?.id === 'string' && (!lane.threadId || lane.threadId === p.thread.id), 'NATIVE_THREAD_CONFLICT');
      lane.threadId = p.thread.id; this.saveLanes(); this.journal.append('THREAD_OBSERVED', lane.creationStep, { threadId: lane.threadId }); return;
    }
    // The qualified 0.153.4 schema has these process/terminal notifications,
    // but P1 has no terminal-interaction surface. They remain explicitly
    // fail-closed rather than becoming a generic tool-event allow path.
    if (['process/outputDelta', 'process/exited', 'item/commandExecution/terminalInteraction'].includes(signal.method)) {
      this.quarantine('NATIVE_TERMINAL_INTERACTION_UNSUPPORTED'); return;
    }
    if (signal.method === 'item/commandExecution/outputDelta') {
      this.observeCommandOutput(p); return;
    }
    if (['item/reasoning/summaryTextDelta', 'item/reasoning/summaryPartAdded', 'item/reasoning/textDelta'].includes(signal.method)) {
      const item = this.reasoningItems.get(p.itemId);
      const lane = Object.values(this.lanes).find(value => value.threadId === p.threadId);
      const index = signal.method === 'item/reasoning/textDelta' ? p.contentIndex : p.summaryIndex;
      requireThat(item && !item.completed && item.threadId === p.threadId && item.turnId === p.turnId && lane?.activeStep && lane.turnId === p.turnId && Number.isSafeInteger(index) && index >= 0, 'NATIVE_REASONING_IDENTITY_INVALID');
      requireThat(signal.method === 'item/reasoning/summaryPartAdded' || (typeof p.delta === 'string' && p.delta.length <= 256000), 'NATIVE_REASONING_INVALID');
      // Reasoning content is validated for correlation, never projected or retained.
      return;
    }
    if (signal.method === 'model/rerouted') {
      const entry = Object.entries(this.lanes).find(([, value]) => value.threadId === p.threadId);
      requireThat(entry && entry[1].activeStep && entry[1].turnId === p.turnId && typeof p.fromModel === 'string' && p.fromModel.length > 0 && p.fromModel.length <= 200 && typeof p.toModel === 'string' && p.toModel.length > 0 && p.toModel.length <= 200 && p.reason === 'highRiskCyberActivity', 'NATIVE_MODEL_REROUTE_INVALID');
      const [laneId, lane] = entry;
      this.journal.append('NATIVE_MODEL_REROUTE', lane.activeStep!, { threadId: p.threadId, turnId: p.turnId, fromModel: p.fromModel, toModel: p.toModel, reason: p.reason });
      this.recordNativeEvent({ laneId, edgeCommandId: lane.activeStep!, kind: 'configurationInvalidated', text: 'NATIVE_MODEL_REROUTED', threadId: lane.threadId, turnId: lane.turnId, status: 'EFFECTIVE_CONFIGURATION_UNKNOWN' }, lane);
      return;
    }
    const relevant = ['turn/started', 'turn/completed', 'item/agentMessage/delta', 'item/started', 'item/completed'];
    if (!relevant.includes(signal.method)) {
      if (signal.method.startsWith('item/')) this.quarantine('NATIVE_TOOL_SCOPE_VIOLATION');
      return;
    }
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
    } else if (signal.method !== 'item/completed') requireThat(lane.activeStep && lane.turnId === turnId, 'UNEXPECTED_NATIVE_TURN');
    let kind: NativeEvent['kind']; let text = ''; let status = lane.state;
    if (signal.method === 'turn/started') kind = 'turnStarted';
    else if (signal.method === 'turn/completed') { kind = 'turnCompleted'; status = p.turn.status; lane.state = 'IDLE'; }
    else if (signal.method === 'item/agentMessage/delta') { kind = 'delta'; text = p.delta; }
    else {
      if (p.item?.type === 'reasoning') {
        requireThat(lane.activeStep && lane.turnId === turnId && typeof p.item.id === 'string' && p.item.id.length > 0 && p.item.id.length <= 200, 'NATIVE_REASONING_IDENTITY_INVALID');
        if (signal.method === 'item/started') {
          requireThat(!this.reasoningItems.has(p.item.id) && this.reasoningItems.size < 4096, 'NATIVE_REASONING_IDENTITY_INVALID');
          this.reasoningItems.set(p.item.id, { threadId: p.threadId, turnId, completed: false });
        } else {
          const item = this.reasoningItems.get(p.item.id);
          requireThat(item && !item.completed && item.threadId === p.threadId && item.turnId === turnId, 'NATIVE_REASONING_IDENTITY_INVALID');
          item.completed = true;
        }
        return;
      }
      if (['userMessage', 'agentMessage'].includes(p.item?.type)) return;
      requireThat(p.item?.type === 'commandExecution', 'NATIVE_TOOL_SCOPE_VIOLATION');
      if (signal.method === 'item/started') {
        requireThat(lane.activeStep && lane.turnId === turnId, 'UNEXPECTED_NATIVE_TURN');
        const lifecycle = this.startCommandLifecycle(laneId, lane, p.item, turnId, p.startedAtMs);
        this.recordNativeEvent({ laneId, edgeCommandId: lifecycle.edgeCommandId, kind: 'tool', text: this.commandActivity(p.item, lane.root), threadId: lifecycle.threadId, turnId: lifecycle.turnId, status: 'inProgress' }, lane);
        return;
      }
      const lifecycle = this.completeCommandLifecycle(lane, p.item, turnId, p.completedAtMs);
      this.recordNativeEvent({ laneId: lifecycle.laneId, edgeCommandId: lifecycle.edgeCommandId, kind: 'tool', text: this.commandCompletion(p.item), threadId: lifecycle.threadId, turnId: lifecycle.turnId, status: p.item.status }, lane);
      return;
    }
    const event: NativeEvent = { laneId, edgeCommandId: lane.activeStep!, kind, text, threadId: lane.threadId, turnId: lane.turnId, status };
    this.recordNativeEvent(event, lane, kind === 'turnCompleted');
  }
  private recordNativeEvent(event: NativeEvent, lane: EdgeLane, clearActiveStep = false): void {
    requireThat(typeof event.text === 'string' && event.text.length <= 24000 && typeof event.status === 'string', 'NATIVE_EVENT_INVALID');
    this.outputCharacters += event.text.length;
    if (this.outputCharacters > 500000) { this.quarantine('NATIVE_OUTPUT_LIMIT'); return; }
    this.journal.transaction(() => { this.journal.append('NATIVE_EVENT', event.edgeCommandId, event); if (clearActiveStep) lane.activeStep = null; this.saveLanes(); });
    this.emit(event);
  }
  private commandItem(item: any, phase: 'started' | 'completed'): { itemId: string; signature: string } {
    // `source` is defaulted by the qualified schema and omitted by an observed
    // installed-runtime event. A present value must still be one of that exact
    // artifact's enum values; it never bypasses the command-action allowlist.
    requireThat(item && typeof item === 'object' && !Array.isArray(item) && item.type === 'commandExecution' && typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 200 && (item.source === undefined || ['agent', 'userShell', 'unifiedExecStartup', 'unifiedExecInteraction'].includes(item.source)) && typeof item.command === 'string' && item.command.length > 0 && item.command.length <= 16000 && typeof item.cwd === 'string' && item.cwd.length <= 16000 && Array.isArray(item.commandActions) && item.commandActions.length > 0 && item.commandActions.length <= 64 && ['inProgress', 'completed', 'failed', 'declined'].includes(item.status), 'NATIVE_TOOL_SCOPE_VIOLATION');
    requireThat(phase === 'started' ? item.status === 'inProgress' : ['completed', 'failed', 'declined'].includes(item.status), 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    const actions = item.commandActions.map((action: any) => {
      requireThat(action && typeof action === 'object' && !Array.isArray(action) && typeof action.command === 'string' && action.command.length > 0 && action.command.length <= 16000 && ['read', 'listFiles', 'search', 'unknown'].includes(action.type), 'NATIVE_TOOL_SCOPE_VIOLATION');
      if (action.type === 'read') requireThat(typeof action.name === 'string' && action.name.length > 0 && action.name.length <= 16000 && typeof action.path === 'string' && action.path.length <= 16000, 'NATIVE_TOOL_SCOPE_VIOLATION');
      if (action.type === 'listFiles') requireThat(action.path === undefined || action.path === null || (typeof action.path === 'string' && action.path.length <= 16000), 'NATIVE_TOOL_SCOPE_VIOLATION');
      if (action.type === 'search') requireThat((action.path === undefined || action.path === null || (typeof action.path === 'string' && action.path.length <= 16000)) && (action.query === undefined || action.query === null || (typeof action.query === 'string' && action.query.length <= 16000)), 'NATIVE_TOOL_SCOPE_VIOLATION');
      return { type: action.type, command: action.command, name: action.name ?? null, path: action.path ?? null, query: action.query ?? null };
    });
    return { itemId: item.id, signature: canonical({ source: item.source ?? 'agent', command: item.command, cwd: item.cwd, actions }) };
  }
  private startCommandLifecycle(laneId: string, lane: EdgeLane, item: any, turnId: unknown, startedAtMs: unknown): CommandLifecycle {
    requireThat(typeof lane.threadId === 'string' && typeof turnId === 'string' && lane.activeStep && typeof startedAtMs === 'number' && Number.isSafeInteger(startedAtMs) && startedAtMs >= 0, 'UNEXPECTED_NATIVE_TURN');
    const checked = this.commandItem(item, 'started');
    requireThat(!this.commandLifecycles.has(checked.itemId) && this.commandLifecycles.size < 4096, 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    const lifecycle: CommandLifecycle = { laneId, edgeCommandId: lane.activeStep, threadId: lane.threadId, turnId, itemId: checked.itemId, signature: checked.signature, state: 'STARTED' };
    this.commandLifecycles.set(lifecycle.itemId, lifecycle); return lifecycle;
  }
  private lifecycleFor(itemId: unknown, threadId: unknown, turnId: unknown): CommandLifecycle {
    requireThat(typeof itemId === 'string' && typeof threadId === 'string' && typeof turnId === 'string', 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    const lifecycle = this.commandLifecycles.get(itemId);
    requireThat(lifecycle && lifecycle.threadId === threadId && lifecycle.turnId === turnId && lifecycle.state === 'STARTED', 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    return lifecycle;
  }
  private observeCommandOutput(params: any): void {
    const lifecycle = this.lifecycleFor(params.itemId, params.threadId, params.turnId);
    requireThat(typeof params.delta === 'string' && params.delta.length <= 256000, 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    // Output is protocol-validated and deliberately not forwarded as a shell
    // transcript. The lifecycle's compact start/completion activity is enough.
    void lifecycle;
  }
  private completeCommandLifecycle(lane: EdgeLane, item: any, turnId: unknown, completedAtMs: unknown): CommandLifecycle {
    requireThat(typeof completedAtMs === 'number' && Number.isSafeInteger(completedAtMs) && completedAtMs >= 0, 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    const checked = this.commandItem(item, 'completed');
    const lifecycle = this.lifecycleFor(checked.itemId, lane.threadId, turnId);
    requireThat(lifecycle.laneId && lifecycle.signature === checked.signature, 'NATIVE_COMMAND_LIFECYCLE_INVALID');
    lifecycle.state = 'COMPLETED'; return lifecycle;
  }
  private commandActivity(item: any, root: string): string {
    const scope = (value: unknown) => typeof value === 'string' && value.toLowerCase().startsWith(root.toLowerCase()) ? (value.slice(root.length).replace(/^[\\/]+/, '') || '.') : 'workspace';
    const action = item.commandActions[0];
    if (action.type === 'read') return `Reading ${scope(action.path)}`;
    if (action.type === 'search') return `Searching ${scope(action.path)}`;
    if (action.type === 'listFiles') return `Inspecting ${scope(action.path)}`;
    return 'Running read-only command';
  }
  private commandCompletion(item: any): string {
    return item.status === 'completed' ? 'Command completed' : item.status === 'failed' ? 'Command failed' : 'Command declined';
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
