import { randomUUID, createHash } from 'node:crypto';
import { canonical, Fault, requireThat } from '../contracts/json.ts';
import { assertSameIncarnation, classifyCapabilities, incarnationOf } from './compatibility.ts';
import { NativeRpcError, type NativeRpc, type NativeMessage } from './transport.ts';
import type { AdoptionCommand, AdoptionReceipt, AdoptionSnapshot, CapabilityName, Compatibility, NativeArtifactIdentity, NativeThread } from './types.ts';

const hash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');
const keys: CapabilityName[] = ['sharedDaemon', 'threadList', 'threadRead', 'resume', 'events', 'turnStart', 'activeTurn', 'interrupt', 'steer', 'approvalObserve', 'approvalResolve', 'models', 'effectiveState'];
const families = ['native.attach', 'native.reviewState', 'native.release', 'native.submit', 'native.steer', 'native.interrupt'];
const id = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,200}$/.test(value);
const failCode = (error: unknown) => error instanceof Fault ? error.code : 'NATIVE_OPERATION_UNPROVABLE';
type Binding = { view: NativeThread; userState: Map<string, string>; tools: Map<string, NativeThread['activity'][number]> };
export type AdoptionEvidence = { append(kind: string, key: string, value: unknown): void };

export class NativeAdoptionAdapter {
  readonly runtimeId = randomUUID();
  readonly incarnation: string;
  readonly compatibility: Compatibility;
  private state = 'READY';
  private controller: string | null = null;
  private controllerExpires = 0;
  private fence = 0;
  private threads = new Map<string, Binding>();
  private receipts = new Map<string, { digest: string; receipt: AdoptionReceipt }>();
  private queue: Promise<unknown> = Promise.resolve();
  private observedEvents = false;
  private nativeStateEvents = 0;
  private effectPending = false;
  private ownedTurns = new Set<string>();
  private ownedInputs = new Map<string, { threadId: string; turnId: string | null; text: string }>();
  constructor(readonly identity: NativeArtifactIdentity, private readonly rpc: NativeRpc,
    readonly workspace: string, private readonly workspaceIdentity: string,
    private readonly identityNow: () => NativeArtifactIdentity,
    private readonly rootNow: () => { root: string; rootIdentity: string },
    private readonly evidence: AdoptionEvidence) {
    this.incarnation = incarnationOf(identity);
    this.compatibility = { profile: 'UNSUPPORTED', observedAt: new Date().toISOString(),
      capabilities: Object.fromEntries(keys.map(key => [key, { available: false, evidence: 'NOT_OBSERVED' }])) as Compatibility['capabilities'] };
    rpc.onEvent = message => this.event(message);
    rpc.onClose = () => { this.state = 'NATIVE_CONNECTION_LOST'; this.controller = null; this.fence++; };
  }
  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.queue.then(operation); this.queue = next.catch(() => {}); return next;
  }
  private capability(name: CapabilityName, available: boolean, evidence: string) {
    this.compatibility.capabilities[name] = { available, evidence };
    this.compatibility.profile = classifyCapabilities(this.compatibility.capabilities);
  }
  async qualify(): Promise<void> {
    this.revalidate();
    this.capability('sharedDaemon', true, 'Official daemon status, PID FILETIME, owner, endpoint ACL and connected native initialize');
    const list = await this.rpc.call('thread/list', { cwd: this.workspace, limit: 20 });
    requireThat(Array.isArray(list.data), 'NATIVE_THREAD_LIST_UNPROVABLE');
    this.capability('threadList', true, 'Live thread/list response; exact Workspace filter');
    const missing = randomUUID();
    // A nonexistent identity cannot authorize native effects. Only an explicit
    // recognized-method, missing-thread rejection counts; arbitrary errors do not.
    const probes: [CapabilityName, string, object][] = [
      ['threadRead', 'thread/read', { threadId: missing }],
      ['resume', 'thread/resume', { threadId: missing }],
      ['turnStart', 'turn/start', { threadId: missing, input: [{ type: 'text', text: 'FleetSplice capability probe: nonexistent thread', text_elements: [] }] }],
      ['activeTurn', 'thread/turns/list', { threadId: missing, limit: 1, itemsView: 'full' }],
      ['interrupt', 'turn/interrupt', { threadId: missing, turnId: missing }],
      ['steer', 'turn/steer', { threadId: missing, expectedTurnId: missing, input: [{ type: 'text', text: 'nonexistent thread probe', text_elements: [] }] }]
    ];
    for (const [name, method, params] of probes) {
      try {
        await this.rpc.call(method, params);
        this.state = 'NATIVE_PROBE_UNEXPECTED_SUCCESS'; throw new Fault(this.state);
      } catch (error) {
        if (!(error instanceof NativeRpcError)) throw error;
        const recognized = /(?:thread.*not found|no rollout found|thread.*does not exist|unknown thread|thread.*not loaded|conversation.*not found)/i.test(error.message)
          && !/unknown (?:variant|method)|method not found/i.test(error.message);
        this.capability(name, recognized, recognized ? `Live ${method}: nonexistent thread rejected before effect` : `Live ${method}: capability not proved (RPC ${error.code})`);
      }
    }
    try { const models = await this.rpc.call('model/list', { limit: 1 }); this.capability('models', Array.isArray(models.data), 'Live model/list response'); } catch { /* Optional observation stays unavailable. */ }
    this.capability('events', this.observedEvents, 'Native notification observed on this initialized connection; thread subscription still requires attach');
    this.revalidate();
    this.evidence.append('NATIVE_COMPATIBILITY', this.runtimeId, { identity: this.identity, compatibility: this.compatibility });
  }
  private revalidate() {
    requireThat(this.state === 'READY', this.state);
    try {
      assertSameIncarnation(this.identity, this.identityNow());
      const root = this.rootNow();
      requireThat(root.root.toLowerCase() === this.workspace.toLowerCase() && root.rootIdentity === this.workspaceIdentity, 'NATIVE_WORKSPACE_IDENTITY_CHANGED');
    } catch (error) {
      this.state = error instanceof Fault ? error.code : 'NATIVE_SERVER_IDENTITY_UNPROVABLE';
      this.controller = null; this.fence++; throw new Fault(this.state);
    }
  }
  private expireController() {
    if (this.controller && this.controllerExpires <= Date.now()) { this.controller = null; this.fence++; }
  }
  private event(message: NativeMessage) {
    this.observedEvents = true;
    const p = message.params;
    const threadId = p?.threadId ?? p?.thread?.id;
    const binding = this.threads.get(threadId);
    if (!binding?.view.attached) return; // Never retain foreign thread payloads.
    const turnId = p.turnId ?? p.turn?.id;
    if (['turn/started', 'turn/completed', 'thread/status/changed', 'thread/settings/updated', 'serverRequest/resolved'].includes(message.method ?? '') || p.item?.type === 'userMessage') this.nativeStateEvents++;
    if (message.method === 'thread/settings/updated') { binding.view.permission = null; binding.view.externalAdvance = true; }
    if (message.method === 'turn/started' && !this.effectPending && !binding.userState.has(turnId) && !this.ownedTurns.has(turnId)) binding.view.externalAdvance = true;
    if (message.id !== undefined && message.method?.includes('requestApproval')) {
      this.capability('approvalObserve', true, 'Approval request observed on this exact attached thread');
      binding.view.externalAdvance = true;
      // The native TUI resolves approvals in D0. Never automatically respond.
    }
    if (message.method === 'serverRequest/resolved') this.capability('approvalResolve', true, 'Native serverRequest/resolved observed; no Web approval control implemented');
    if (p.item?.type === 'commandExecution' && id(p.item.id) && id(turnId)) {
      binding.tools.set(p.item.id, { id: p.item.id, turnId, text: String(p.item.command ?? 'Native command').slice(0,1000), status: String(p.item.status ?? 'unknown') });
      if (binding.tools.size > 64) binding.tools.delete(binding.tools.keys().next().value!);
    }
    if (message.method === 'turn/completed' && p.turn?.status === 'interrupted') {
      binding.view.residualCommandState = 'MAY_STILL_BE_RUNNING';
    }
    // Keep compact native lifecycle evidence, never raw/global native payloads.
    if (/^(turn\/|item\/(started|completed)|serverRequest\/)/.test(message.method ?? '')) this.evidence.append('NATIVE_ADOPTED_EVENT', threadId,
      { method: message.method, threadId, turnId: turnId ?? null, itemId: p.item?.id ?? null, type: p.item?.type ?? null, status: p.turn?.status ?? p.item?.status ?? null });
  }
  private assertThread(thread: any, expectedId: string) {
    requireThat(thread && thread.id === expectedId && typeof thread.cwd === 'string' && thread.cwd.toLowerCase() === this.workspace.toLowerCase(), 'NATIVE_THREAD_IDENTITY_MISMATCH');
    requireThat(thread.canAcceptDirectInput !== false && thread.threadSource !== 'subAgent', 'NATIVE_THREAD_NOT_ATTACHABLE');
  }
  private async loaded(): Promise<Set<string>> {
    const result = await this.rpc.call('thread/loaded/list', { limit: 64 });
    requireThat(Array.isArray(result.data) && result.data.length <= 64 && !result.nextCursor && result.data.every(id), 'NATIVE_LOADED_LIST_BOUND_EXCEEDED');
    return new Set<string>(result.data);
  }
  private async readThread(threadId: string, accept = false): Promise<Binding> {
    const result = await this.rpc.call('thread/read', { threadId, includeTurns: false });
    this.assertThread(result.thread, threadId);
    const thread = result.thread;
    const page = await this.rpc.call('thread/turns/list', { threadId, limit: 12, sortDirection: 'desc', itemsView: 'full' });
    requireThat(Array.isArray(page.data) && page.data.length <= 12, 'NATIVE_HISTORY_UNPROVABLE');
    const turns: any[] = page.data;
    requireThat(turns.every(turn => id(turn.id) && Array.isArray(turn.items) && ['inProgress', 'completed', 'interrupted', 'failed'].includes(turn.status)), 'NATIVE_TURN_STATE_UNPROVABLE');
    const active = turns.filter(turn => turn.status === 'inProgress');
    requireThat(active.length <= 1 && (thread.status?.type !== 'active' || active.length === 1), 'NATIVE_ACTIVE_TURN_UNPROVABLE');
    const prior = this.threads.get(threadId);
    const users = new Map<string, string>();
    const history: NativeThread['history'] = [];
    const tools = prior?.tools ?? new Map<string, NativeThread['activity'][number]>();
    for (const turn of [...turns].reverse()) {
      const messages = turn.items.filter((item: any) => item.type === 'userMessage');
      const externalMessages = messages.filter((message: any) => {
        const expected = this.ownedInputs.get(message.clientId ?? message.id);
        if (!expected) return true;
        requireThat(expected.threadId === threadId && expected.turnId === turn.id &&
          message.content?.filter((item: any) => item.type === 'text').map((item: any) => item.text).join('\n') === expected.text,
          'NATIVE_OWN_INPUT_CORRELATION_MISMATCH');
        return false;
      });
      users.set(turn.id, hash(externalMessages));
      for (const item of turn.items) {
        if (item.type === 'userMessage' || item.type === 'agentMessage') {
          const text = item.type === 'agentMessage' ? item.text : item.content?.filter((x: any) => x.type === 'text').map((x: any) => x.text).join('\n');
          if (typeof text === 'string') history.push({ role: item.type === 'userMessage' ? 'user' : 'assistant', text: text.slice(0,24000), turnId: turn.id });
        } else if (item.type === 'commandExecution' && id(item.id)) tools.set(item.id, { id: item.id, turnId: turn.id, text: String(item.command ?? 'Native command').slice(0,1000), status: String(item.status ?? 'unknown') });
      }
    }
    let externalAdvance = prior?.view.externalAdvance ?? false;
    if (prior?.view.attached && !accept) for (const [turnId, userHash] of users) {
      // Native acknowledgments can precede persisted userMessage observations.
      // Correlate our exact client message ID/turn/text, never merely equal text.
      if (!prior.userState.has(turnId) && this.ownedTurns.has(turnId) && userHash === hash([])) prior.userState.set(turnId, userHash);
      if (prior.userState.get(turnId) !== userHash) externalAdvance = true;
    }
    const stateToken = hash({ threadId, workspace: this.workspaceIdentity, status: thread.status, model: thread.model ?? null,
      reasoning: thread.reasoningEffort ?? null, turns: turns.map(turn => ({ id: turn.id, status: turn.status, users: users.get(turn.id) })),
      permission: prior?.view.permission ?? null });
    const view: NativeThread = { id: threadId, workspace: this.workspace, workspaceIdentity: this.workspaceIdentity,
      origin: 'NATIVE_ADOPTED', status: active.length ? 'active' : String(thread.status?.type ?? 'unknown'),
      activeTurnId: active[0]?.id ?? null, lastTurnStatus: turns[0]?.status ?? null, model: typeof thread.model === 'string' ? thread.model : null,
      permission: prior?.view.permission ?? null, attached: prior?.view.attached ?? false, stateToken,
      externalAdvance: accept ? false : externalAdvance, history: history.slice(-48), activity: [...tools.values()].slice(-16),
      historyLimited: !!page.nextCursor || history.length > 48,
      residualCommandState: prior?.view.residualCommandState ?? 'NONE_OBSERVED' };
    const binding = { view, tools, userState: accept || !prior ? users : prior.userState };
    this.threads.set(threadId, binding); return binding;
  }
  snapshot(): Promise<AdoptionSnapshot> { return this.serial(async () => {
    this.expireController();
    if (this.state === 'READY') {
      try {
        this.revalidate();
        const loaded = await this.loaded();
        // thread/list is scoped natively. A metadata-only loaded read handles
        // native index lag; foreign cwd payloads are discarded immediately.
        const listing = await this.rpc.call('thread/list', { cwd: this.workspace, limit: 32 });
        requireThat(Array.isArray(listing.data) && !listing.nextCursor, 'NATIVE_DISCOVERY_BOUND_EXCEEDED');
        const candidates = new Set<string>(listing.data.filter((t: any) => loaded.has(t.id) && t.cwd?.toLowerCase() === this.workspace.toLowerCase()).map((t: any) => t.id));
        for (const threadId of loaded) {
          if (candidates.has(threadId)) continue;
          const metadata = await this.rpc.call('thread/read', { threadId, includeTurns: false });
          if (metadata.thread?.id === threadId && metadata.thread.cwd?.toLowerCase() === this.workspace.toLowerCase()) candidates.add(threadId);
        }
        requireThat(candidates.size <= 8, 'NATIVE_DISCOVERY_BOUND_EXCEEDED');
        for (const threadId of candidates) {
          try { await this.readThread(threadId); }
          catch (error) {
            // A just-opened TUI may not yet have persisted its first turn.
            // Only this known read-only absence is rediscovered later.
            if (error instanceof NativeRpcError && !this.threads.get(threadId)?.view.attached && /no rollout found/i.test(error.message)) continue;
            throw error;
          }
        }
        for (const [threadId, binding] of this.threads) if (!candidates.has(threadId)) {
          if (binding.view.attached) { binding.view.status = 'notLoaded'; binding.view.externalAdvance = true; }
          else this.threads.delete(threadId);
        }
      } catch (error) { this.state = failCode(error); this.controller = null; this.fence++; }
    }
    return this.projection();
  }); }
  private projection(): AdoptionSnapshot {
    return JSON.parse(JSON.stringify({ runtimeId: this.runtimeId, state: this.state, incarnation: this.incarnation,
      daemon: this.identity, compatibility: this.compatibility, workspace: this.workspace,
      controller: this.controller, fence: this.fence, threads: [...this.threads.values()].map(b => b.view),
      receipts: [...this.receipts.values()].slice(-20).map(r => r.receipt), controlMode: 'COOPERATIVE' }));
  }
  lookup(commandId: string): AdoptionReceipt | null { return this.receipts.get(commandId)?.receipt ?? null; }
  execute(value: unknown, authenticatedClient: string, expiresAt: number): Promise<AdoptionReceipt> {
    return this.serial(async () => {
      const c = value as AdoptionCommand;
      requireThat(c && typeof c === 'object' && Object.keys(c).sort().join(',') === 'activeTurnId,clientInstanceId,commandId,expectedFence,family,incarnation,runtimeId,stateToken,text,threadId' &&
        id(c.commandId) && id(c.threadId) && id(c.runtimeId) && c.clientInstanceId === authenticatedClient && families.includes(c.family) &&
        Number.isSafeInteger(c.expectedFence) && typeof c.incarnation === 'string' && typeof c.stateToken === 'string' &&
        (c.activeTurnId === null || id(c.activeTurnId)) && typeof c.text === 'string' && c.text.length <= 16000, 'NATIVE_COMMAND_INVALID');
      const digest = hash(c); const previous = this.receipts.get(c.commandId);
      if (previous) { requireThat(previous.digest === digest, 'NATIVE_COMMAND_ID_CONFLICT'); return previous.receipt; }
      requireThat(this.receipts.size < 200, 'NATIVE_DEMO_COMMAND_BOUND_EXCEEDED');
      let effectSent = false;
      let turnId: string | null = c.activeTurnId;
      let status: AdoptionReceipt['status'] = 'SUCCEEDED'; let code = 'NATIVE_CONTROL_OBSERVED';
      try {
        this.expireController(); this.revalidate();
        requireThat(c.runtimeId === this.runtimeId && c.incarnation === this.incarnation, 'NATIVE_SERVER_INCARCATION_CHANGED');
        requireThat(expiresAt > Date.now() && c.expectedFence === this.fence, 'STALE_FLEET_CONTROLLER_FENCE');
        requireThat(this.compatibility.profile === 'ADOPT_FULL', 'NATIVE_ADOPT_FULL_REQUIRED');
        requireThat(this.threads.has(c.threadId) && (await this.loaded()).has(c.threadId), 'NATIVE_EXACT_LOADED_THREAD_REQUIRED');
        const baseline = this.nativeStateEvents;
        const binding = await this.readThread(c.threadId);
        requireThat(binding.view.stateToken === c.stateToken && this.nativeStateEvents === baseline, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
        if (c.family === 'native.attach') {
          requireThat(!this.controller || this.controller === authenticatedClient, 'FLEET_CONTROLLER_ALREADY_HELD');
          requireThat(!binding.view.attached || this.controller !== authenticatedClient, 'NATIVE_ALREADY_ATTACHED_USE_REVIEW_STATE');
          // Exact loaded ID only; no path, history, model or permission overrides.
          this.evidence.append('NATIVE_ATTACH_ATTEMPT', c.commandId, { command: c, daemon: this.identity, createdNativeThread: false });
          const resumed = await this.rpc.call('thread/resume', { threadId: c.threadId, excludeTurns: true });
          this.assertThread(resumed.thread, c.threadId);
          this.revalidate(); requireThat((await this.loaded()).has(c.threadId), 'NATIVE_EXACT_LOADED_THREAD_REQUIRED');
          binding.view.attached = true;
          binding.view.permission = typeof resumed.approvalPolicy === 'string' && typeof resumed.sandbox?.type === 'string' ? `${resumed.sandbox.type} · approval=${resumed.approvalPolicy}` : null;
          this.capability('effectiveState', !!binding.view.permission, 'Exact thread/resume response; no configuration overrides');
          await this.readThread(c.threadId, true);
          this.controller = authenticatedClient; this.controllerExpires = expiresAt; this.fence++;
          code = 'NATIVE_SAME_THREAD_ATTACHED_COOPERATIVE';
        } else {
          requireThat(binding.view.attached && this.controller === authenticatedClient && this.controllerExpires > Date.now(), 'FLEET_VIEWER_CANNOT_CONTROL');
          if (c.family === 'native.release') { this.controller = null; this.fence++; code = 'FLEET_CONTROL_RELEASED_NATIVE_UNCHANGED'; }
          else if (c.family === 'native.reviewState') { await this.readThread(c.threadId, true); this.fence++; code = 'NATIVE_STATE_REVIEWED'; }
          else {
            requireThat(!binding.view.externalAdvance, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
            requireThat(binding.view.activeTurnId === c.activeTurnId, 'STALE_NATIVE_ACTIVE_TURN');
            const isSubmit = c.family === 'native.submit';
            requireThat(isSubmit ? binding.view.status === 'idle' && c.activeTurnId === null : binding.view.status === 'active' && !!c.activeTurnId, 'NATIVE_TURN_STATE_INCOMPATIBLE');
            requireThat(c.family === 'native.interrupt' || c.text.trim().length > 0, 'NATIVE_INPUT_REQUIRED');
            if (c.family === 'native.interrupt') requireThat(this.compatibility.capabilities.interrupt.available, 'NATIVE_INTERRUPT_UNAVAILABLE');
            if (c.family === 'native.steer') requireThat(this.compatibility.capabilities.steer.available, 'NATIVE_STEER_UNAVAILABLE');
            // Refresh the OS identity first, then obtain the final native state.
            // No awaited work follows that response before the dispatch decision.
            this.revalidate();
            const finalBinding = await this.readThread(c.threadId);
            requireThat(finalBinding.view.stateToken === c.stateToken && !finalBinding.view.externalAdvance && this.nativeStateEvents === baseline, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
            requireThat(expiresAt > Date.now() && this.controllerExpires > Date.now() && this.controller === authenticatedClient && this.fence === c.expectedFence, 'STALE_FLEET_CONTROLLER_FENCE');
            this.evidence.append('NATIVE_EFFECT_ATTEMPT', c.commandId, { command: c, daemon: this.identity, origin: 'NATIVE_ADOPTED', createdNativeThread: false });
            effectSent = true; this.effectPending = true; this.fence++;
            if (c.family !== 'native.interrupt') this.ownedInputs.set(c.commandId, { threadId: c.threadId, turnId: c.activeTurnId, text: c.text });
            const input = [{ type: 'text', text: c.text, text_elements: [] }];
            const result = await this.rpc.call(isSubmit ? 'turn/start' : c.family === 'native.steer' ? 'turn/steer' : 'turn/interrupt', isSubmit ?
              { threadId: c.threadId, clientUserMessageId: c.commandId, input } : c.family === 'native.steer' ? { threadId: c.threadId, expectedTurnId: c.activeTurnId, clientUserMessageId: c.commandId, input } : { threadId: c.threadId, turnId: c.activeTurnId });
            if (isSubmit) {
              requireThat(id(result.turn?.id) && !binding.userState.has(result.turn.id), 'NATIVE_SUBMIT_TARGET_UNPROVABLE'); turnId = result.turn.id;
              this.ownedTurns.add(turnId!); this.ownedInputs.get(c.commandId)!.turnId = turnId;
            }
            if (c.family === 'native.steer') requireThat(result.turnId === c.activeTurnId, 'STALE_NATIVE_ACTIVE_TURN');
            this.revalidate();
            const afterEffect = await this.readThread(c.threadId);
            requireThat(!afterEffect.view.externalAdvance, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
            if (c.family === 'native.interrupt') {
              this.threads.get(c.threadId)!.view.residualCommandState = 'MAY_STILL_BE_RUNNING';
              code = 'NATIVE_INTERRUPT_REQUEST_ACCEPTED';
            } else code = isSubmit ? 'NATIVE_CONTINUATION_ACCEPTED' : 'NATIVE_STEER_SAME_TURN_ACCEPTED';
          }
        }
      } catch (error) {
        code = failCode(error); status = effectSent ? 'AMBIGUOUS_EFFECT' : 'REJECTED';
        if (code === 'NATIVE_STATE_ADVANCED_EXTERNALLY') { const b = this.threads.get(c.threadId); if (b) b.view.externalAdvance = true; }
        if (effectSent) { this.state = 'NATIVE_EFFECT_UNKNOWN_NO_REPLAY'; this.controller = null; this.fence++; }
      } finally { this.effectPending = false; }
      const receipt: AdoptionReceipt = { commandId: c.commandId, family: c.family, status, code, daemon: this.identity,
        threadId: c.threadId, turnId, origin: 'NATIVE_ADOPTED', createdNativeThread: false, processTerminationClaim: false };
      try { this.evidence.append('NATIVE_ADOPTION_RECEIPT', c.commandId, receipt); }
      catch { this.state = 'NATIVE_JOURNAL_UNPROVABLE'; this.controller = null; this.fence++; throw new Fault(this.state); }
      this.receipts.set(c.commandId, { digest, receipt }); return receipt;
    });
  }
  close() { this.controller = null; this.fence++; this.state = 'FLEET_CLIENT_CLOSED'; this.rpc.close(); }
}
