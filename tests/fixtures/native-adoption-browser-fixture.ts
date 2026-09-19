/** Deterministic disposable Native Adoption fixture for browser acceptance / causality audit. */
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Journal } from '../../packages/journal/index.ts';
import { NativeActivityJournal } from '../../packages/native-adoption/activity-journal.ts';
import { NativeAdoptionAdapter } from '../../packages/native-adoption/adapter.ts';
import { NativeRpcError, type NativeRpc } from '../../packages/native-adoption/transport.ts';
import type { AdoptionCommand, AdoptionSnapshot, NativeArtifactIdentity } from '../../packages/native-adoption/types.ts';

export const DISPOSABLE_NATIVE_WORKSPACE = 'V:\\disposable-native-browser-accept';

export class DisposableNativeRpc implements NativeRpc {
  onEvent: NativeRpc['onEvent'] = () => {};
  onClose = () => {};
  thread: any = {
    id: 'native-existing-thread',
    cwd: DISPOSABLE_NATIVE_WORKSPACE,
    status: { type: 'idle' },
    model: 'native-model',
    canAcceptDirectInput: true,
    threadSource: 'user',
    ephemeral: false,
  };
  turns: any[] = [{
    id: 'native-existing-turn',
    status: 'completed',
    items: [
      { id: 'first-user', type: 'userMessage', content: [{ type: 'text', text: 'Original TUI conversation' }] },
      { id: 'first-answer', type: 'agentMessage', text: 'Original native answer' },
    ],
  }];
  calls: { method: string; params: any }[] = [];
  missing = new Set<string>();
  loaded = true;
  resumeId: string | null = null;
  before: (method: string, params: any) => void = () => {};
  delayedInputs: { turnId: string; item: any }[] = [];
  delayInput = false;
  /** Optional hook after turn/start returns so harness can emit a full lifecycle. */
  afterTurnStart: ((turnId: string) => void) | null = null;
  flushInputs() {
    for (const pending of this.delayedInputs) this.turns.find(t => t.id === pending.turnId).items.push(pending.item);
    this.delayedInputs = [];
  }
  close() { this.onClose(); }
  async call(method: string, params: any): Promise<any> {
    this.calls.push({ method, params: structuredClone(params) });
    this.before(method, params);
    if (this.missing.has(method)) throw new NativeRpcError(-32601, 'Method not found');
    if (params.threadId && params.threadId !== this.thread.id) throw new NativeRpcError(-32600, 'thread not found');
    if (method === 'thread/list') return { data: [structuredClone(this.thread)], nextCursor: null };
    if (method === 'thread/loaded/list') return { data: this.loaded ? [this.thread.id] : [], nextCursor: null };
    if (method === 'thread/read') return { thread: structuredClone(this.thread) };
    if (method === 'thread/turns/list') return { data: structuredClone(this.turns), nextCursor: null };
    if (method === 'thread/resume') {
      return {
        thread: { ...structuredClone(this.thread), id: this.resumeId ?? this.thread.id },
        approvalPolicy: 'never',
        sandbox: { type: 'dangerFullAccess' },
      };
    }
    if (method === 'model/list') {
      this.onEvent({ method: 'remoteControl/status/changed', params: { status: 'disabled' } });
      return { data: [] };
    }
    if (method === 'turn/start') {
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      const turn = {
        id: randomUUID(),
        status: 'inProgress',
        startedAt: Math.floor(Date.now() / 1000),
        items: this.delayInput ? [] : [item],
      };
      if (this.delayInput) this.delayedInputs.push({ turnId: turn.id, item });
      this.turns.unshift(turn);
      this.thread.status.type = 'active';
      this.onEvent({ method: 'turn/started', params: { threadId: this.thread.id, turn } });
      const result = { turn: structuredClone(turn) };
      this.afterTurnStart?.(turn.id);
      return result;
    }
    if (method === 'turn/steer') {
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      if (this.delayInput) this.delayedInputs.push({ turnId: this.turns[0].id, item });
      else this.turns[0].items.push(item);
      return { turnId: this.turns[0].id };
    }
    if (method === 'turn/interrupt') {
      this.turns[0].status = 'interrupted';
      this.thread.status.type = 'idle';
      this.onEvent({ method: 'turn/completed', params: { threadId: this.thread.id, turn: structuredClone(this.turns[0]) } });
      return {};
    }
    throw Error('unexpected fixture RPC');
  }

  /** Emit a deterministic Web-owned turn lifecycle after turn/start (assistant A, tool, assistant B, completed). */
  emitOwnedTurnLifecycle(turnId: string, options: {
    assistantA?: string;
    assistantB?: string;
    toolCommand?: string;
    complete?: boolean;
  } = {}) {
    const turn = this.turns.find(item => item.id === turnId) ?? this.turns[0];
    const assistantA = options.assistantA ?? 'LIVE_ASSISTANT_A';
    const assistantB = options.assistantB ?? 'LIVE_ASSISTANT_B_FINAL';
    const toolCommand = options.toolCommand ?? 'git rev-parse --short HEAD';
    const itemA = { id: 'assist-a', type: 'agentMessage', text: assistantA };
    const tool = { id: 'tool-1', type: 'commandExecution', command: toolCommand, status: 'inProgress' };
    const itemB = { id: 'assist-b', type: 'agentMessage', text: assistantB };
    turn.items.push(itemA);
    this.onEvent({
      method: 'item/agentMessage/delta',
      params: { threadId: this.thread.id, turnId: turn.id, itemId: itemA.id, delta: assistantA.slice(0, 8) },
    });
    this.onEvent({
      method: 'item/completed',
      params: { threadId: this.thread.id, turnId: turn.id, item: structuredClone(itemA) },
    });
    turn.items.push(tool);
    this.onEvent({
      method: 'item/started',
      params: { threadId: this.thread.id, turnId: turn.id, item: structuredClone(tool) },
    });
    tool.status = 'completed';
    this.onEvent({
      method: 'item/completed',
      params: { threadId: this.thread.id, turnId: turn.id, item: structuredClone(tool) },
    });
    turn.items.push(itemB);
    this.onEvent({
      method: 'item/agentMessage/delta',
      params: { threadId: this.thread.id, turnId: turn.id, itemId: itemB.id, delta: assistantB },
    });
    this.onEvent({
      method: 'item/completed',
      params: { threadId: this.thread.id, turnId: turn.id, item: structuredClone(itemB) },
    });
    if (options.complete !== false) {
      turn.status = 'completed';
      turn.completedAt = Math.floor(Date.now() / 1000);
      turn.durationMs = 1500;
      this.thread.status.type = 'idle';
      this.onEvent({ method: 'turn/completed', params: { threadId: this.thread.id, turn: structuredClone(turn) } });
    }
  }

  /** Emit an external native turn (not owned by Web command) to force externalAdvance. */
  emitExternalTurn(text = 'EXTERNAL_NATIVE_ADVANCE') {
    const turn = {
      id: randomUUID(),
      status: 'completed',
      startedAt: Math.floor(Date.now() / 1000),
      completedAt: Math.floor(Date.now() / 1000),
      durationMs: 100,
      items: [
        { id: randomUUID(), type: 'userMessage', content: [{ type: 'text', text }] },
        { id: randomUUID(), type: 'agentMessage', text: 'External native reply' },
      ],
    };
    this.turns.unshift(turn);
    this.thread.status.type = 'idle';
    this.onEvent({ method: 'turn/started', params: { threadId: this.thread.id, turn: { ...turn, status: 'inProgress' } } });
    this.onEvent({ method: 'turn/completed', params: { threadId: this.thread.id, turn: structuredClone(turn) } });
  }
}

export async function createDisposableAdoptionFixture(options: { now?: () => number } = {}) {
  const rpc = new DisposableNativeRpc();
  let identity: NativeArtifactIdentity = {
    executablePath: 'C:\\official\\codex.exe',
    reportedVersion: 'future-build',
    sha256: 'b'.repeat(64),
    processId: 100,
    processCreationTime: '123456',
    endpoint: 'C:\\user\\native.sock',
    endpointIdentity: 'socket-birth',
    serverIncarnation: null,
  };
  const evidence: any[] = [];
  const journal = new Journal(path.join(mkdtempSync(path.join(tmpdir(), 'fleet-accept-native-')), 'native.sqlite'));
  const activity = new NativeActivityJournal(journal);
  const adapter = new NativeAdoptionAdapter(
    structuredClone(identity),
    rpc,
    DISPOSABLE_NATIVE_WORKSPACE,
    'workspace-identity',
    () => identity,
    () => ({ root: DISPOSABLE_NATIVE_WORKSPACE, rootIdentity: 'workspace-identity' }),
    { append: (kind: string, key: string, value: unknown) => evidence.push({ kind, key, value }) },
    activity,
    options.now,
    0,
  );
  await adapter.qualify();
  const client = randomUUID();
  const expiresAt = (options.now ?? Date.now)() + 600_000;
  const authority = {
    clientInstanceId: client,
    sessionBinding: randomUUID(),
    grantId: randomUUID(),
    grantRevision: '1',
    expiresAt,
  };
  const command = (snapshot: AdoptionSnapshot, family: AdoptionCommand['family'], changes: Partial<AdoptionCommand> = {}): AdoptionCommand => ({
    commandId: randomUUID(),
    runtimeId: snapshot.runtimeId,
    clientInstanceId: client,
    expectedFence: snapshot.fence,
    incarnation: snapshot.incarnation,
    threadId: rpc.thread.id,
    stateToken: snapshot.threads[0]?.stateToken ?? '',
    activeTurnId: snapshot.threads[0]?.activeTurnId ?? null,
    family,
    text: ['native.submit', 'native.steer'].includes(family) ? 'A harmless continuation' : '',
    ...changes,
  });
  const execute = (value: AdoptionCommand, actor = client) => adapter.execute(value, { ...authority, clientInstanceId: actor });
  const attach = async () => execute(command(await adapter.snapshot(), 'native.attach'));
  const adoptionPort = {
    snapshot: (opts?: { discover?: boolean }) => adapter.snapshot(opts),
    execute: (cmd: AdoptionCommand, adoptionClient: typeof authority) => adapter.execute(cmd, adoptionClient),
    renewClient: (
      previous: typeof authority,
      next: typeof authority,
      continuity: Parameters<NativeAdoptionAdapter['renewClient']>[2],
    ) => adapter.renewClient(previous, next, continuity),
    lookup: async (commandId: string) => adapter.lookup(commandId),
    pollRealtime: (since: string) => Promise.resolve(adapter.pollRealtime(since)),
    subscribeRealtime: (listener: Parameters<NativeAdoptionAdapter['subscribeRealtime']>[0]) => adapter.subscribeRealtime(listener),
  };
  return { rpc, adapter, command, execute, attach, client, expiresAt, evidence, journal, activity, authority, adoptionPort };
}
