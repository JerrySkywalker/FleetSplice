/** Deterministic multi-scenario Native Adoption fixture for performance audit. */
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Journal } from '../../packages/journal/index.ts';
import { NativeActivityJournal } from '../../packages/native-adoption/activity-journal.ts';
import { NativeAdoptionAdapter } from '../../packages/native-adoption/adapter.ts';
import { NativeRpcError, type NativeRpc } from '../../packages/native-adoption/transport.ts';
import type { AdoptionCommand, AdoptionSnapshot, NativeArtifactIdentity } from '../../packages/native-adoption/types.ts';
import { DISPOSABLE_NATIVE_WORKSPACE } from './native-adoption-browser-fixture.ts';

export type PerfThreadSpec = {
  id: string;
  eligible: boolean;
  turns?: number;
  messagesPerTurn?: number;
};

function makeTurn(turnIndex: number, messagesPerTurn: number, threadId: string) {
  const turnId = `perf-turn-${threadId}-${turnIndex}`;
  const items: any[] = [];
  for (let m = 0; m < messagesPerTurn; m++) {
    const roleUser = m % 2 === 0;
    if (roleUser) {
      items.push({
        id: `u-${threadId}-${turnIndex}-${m}`,
        type: 'userMessage',
        content: [{ type: 'text', text: `User message ${turnIndex}.${m} on ${threadId}` }],
      });
    } else {
      items.push({
        id: `a-${threadId}-${turnIndex}-${m}`,
        type: 'agentMessage',
        text: `Assistant message ${turnIndex}.${m} on ${threadId} `.repeat(2).slice(0, 400),
      });
    }
  }
  // Ensure at least one tool activity opportunity on later turns.
  if (turnIndex === 0 && messagesPerTurn >= 2) {
    items.push({
      id: `tool-${threadId}-seed`,
      type: 'commandExecution',
      command: 'git status --short',
      status: 'completed',
    });
  }
  return {
    id: turnId,
    status: 'completed' as const,
    startedAt: 1_700_000_000 + turnIndex,
    completedAt: 1_700_000_100 + turnIndex,
    durationMs: 100,
    items,
  };
}

export class PerfNativeRpc implements NativeRpc {
  onEvent: NativeRpc['onEvent'] = () => {};
  onClose = () => {};
  calls: { method: string; params: any; at: number }[] = [];
  missing = new Set<string>();
  afterTurnStart: ((turnId: string) => void) | null = null;
  threads = new Map<string, any>();
  turnsByThread = new Map<string, any[]>();
  loadedIds: string[] = [];
  primaryId = 'perf-thread-0';

  constructor() {
    this.configureSingleThread();
  }

  resetCalls() { this.calls = []; }

  methodCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const call of this.calls) counts[call.method] = (counts[call.method] ?? 0) + 1;
    return counts;
  }

  configureSingleThread(options: { turns?: number; messagesPerTurn?: number } = {}) {
    const turns = options.turns ?? 1;
    const messagesPerTurn = options.messagesPerTurn ?? 2;
    this.threads.clear();
    this.turnsByThread.clear();
    const id = this.primaryId;
    this.threads.set(id, {
      id,
      cwd: DISPOSABLE_NATIVE_WORKSPACE,
      status: { type: 'idle' },
      model: 'gpt-5.6-terra',
      canAcceptDirectInput: true,
      threadSource: 'user',
      ephemeral: false,
    });
    const turnList = [];
    for (let t = 0; t < turns; t++) turnList.push(makeTurn(t, messagesPerTurn, id));
    // Newest first (native desc page).
    this.turnsByThread.set(id, turnList.reverse());
    this.loadedIds = [id];
  }

  /** CURRENT_BOUNDED_MAX: 12 turns, 48 messages (4 msgs/turn), activity + receipts filled separately. */
  configureBoundedMax() {
    this.configureSingleThread({ turns: 12, messagesPerTurn: 4 });
    const turns = this.turnsByThread.get(this.primaryId)!;
    // Seed 16 terminal tools across turns for activity bound pressure.
    for (let i = 0; i < 16; i++) {
      const turn = turns[i % turns.length]!;
      turn.items.push({
        id: `tool-bound-${i}`,
        type: 'commandExecution',
        command: `echo bound-tool-${i}`,
        status: 'completed',
      });
    }
  }

  /** DISCOVERY_FANOUT: up to 64 loaded, 8 eligible attachable. */
  configureDiscoveryFanout(options: { loaded?: number; eligible?: number } = {}) {
    const loaded = Math.min(options.loaded ?? 64, 64);
    const eligible = Math.min(options.eligible ?? 8, 8);
    this.threads.clear();
    this.turnsByThread.clear();
    this.loadedIds = [];
    for (let i = 0; i < loaded; i++) {
      const id = `perf-thread-${i}`;
      const isEligible = i < eligible;
      this.threads.set(id, {
        id,
        cwd: DISPOSABLE_NATIVE_WORKSPACE,
        status: { type: 'idle' },
        model: 'gpt-5.6-terra',
        canAcceptDirectInput: isEligible,
        threadSource: isEligible ? 'user' : 'subAgent',
        ephemeral: !isEligible,
        parentThreadId: isEligible ? undefined : `perf-parent-${i}`,
      });
      if (isEligible) {
        this.turnsByThread.set(id, [makeTurn(0, 2, id)]);
      } else {
        this.turnsByThread.set(id, []);
      }
      this.loadedIds.push(id);
    }
    this.primaryId = 'perf-thread-0';
  }

  /** MULTI_THREAD_PROJECTION: N eligible sessions within bound. */
  configureMultiThread(count: number) {
    this.configureDiscoveryFanout({ loaded: count, eligible: count });
  }

  get thread() { return this.threads.get(this.primaryId); }
  get turns() { return this.turnsByThread.get(this.primaryId) ?? []; }

  close() { this.onClose(); }

  async call(method: string, params: any): Promise<any> {
    this.calls.push({ method, params: structuredClone(params), at: Date.now() });
    if (this.missing.has(method)) throw new NativeRpcError(-32601, 'Method not found');
    if (method === 'thread/list') {
      return {
        data: [...this.threads.values()].filter(t => t.cwd === DISPOSABLE_NATIVE_WORKSPACE).map(t => structuredClone(t)),
        nextCursor: null,
      };
    }
    if (method === 'thread/loaded/list') {
      return { data: this.loadedIds.slice(0, params.limit ?? 64), nextCursor: null };
    }
    if (method === 'thread/read') {
      const thread = this.threads.get(params.threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      return { thread: structuredClone(thread) };
    }
    if (method === 'thread/turns/list') {
      const thread = this.threads.get(params.threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      if (thread.ephemeral === true) throw new NativeRpcError(-32600, 'ephemeral threads do not support thread/turns/list');
      const all = this.turnsByThread.get(params.threadId) ?? [];
      const limit = typeof params.limit === 'number' ? params.limit : 12;
      return { data: structuredClone(all.slice(0, limit)), nextCursor: all.length > limit ? 'more' : null };
    }
    if (method === 'thread/resume') {
      const thread = this.threads.get(params.threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      return {
        thread: structuredClone(thread),
        approvalPolicy: 'never',
        sandbox: { type: 'dangerFullAccess' },
      };
    }
    if (method === 'model/list') {
      this.onEvent({ method: 'remoteControl/status/changed', params: { status: 'disabled' } });
      return { data: [] };
    }
    if (method === 'turn/start') {
      const threadId = params.threadId;
      const thread = this.threads.get(threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      const turn = { id: randomUUID(), status: 'inProgress', startedAt: Math.floor(Date.now() / 1000), items: [item] };
      const list = this.turnsByThread.get(threadId) ?? [];
      list.unshift(turn);
      this.turnsByThread.set(threadId, list);
      thread.status.type = 'active';
      this.onEvent({ method: 'turn/started', params: { threadId, turn } });
      const result = { turn: structuredClone(turn) };
      this.afterTurnStart?.(turn.id);
      return result;
    }
    if (method === 'turn/steer') {
      const thread = this.threads.get(params.threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      const list = this.turnsByThread.get(params.threadId) ?? [];
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      list[0]?.items.push(item);
      return { turnId: list[0]?.id };
    }
    if (method === 'turn/interrupt') {
      const thread = this.threads.get(params.threadId);
      if (!thread) throw new NativeRpcError(-32600, 'thread not found');
      const list = this.turnsByThread.get(params.threadId) ?? [];
      if (list[0]) {
        list[0].status = 'interrupted';
        thread.status.type = 'idle';
        this.onEvent({ method: 'turn/completed', params: { threadId: params.threadId, turn: structuredClone(list[0]) } });
      }
      return {};
    }
    throw Error(`unexpected perf fixture RPC: ${method}`);
  }

  emitDeltas(threadId: string, turnId: string, itemId: string, count: number, chunk = 'x') {
    for (let i = 0; i < count; i++) {
      this.onEvent({
        method: 'item/agentMessage/delta',
        params: { threadId, turnId, itemId, delta: `${chunk}${i}` },
      });
    }
  }

  emitToolBurst(threadId: string, turnId: string, toolCount: number) {
    for (let i = 0; i < toolCount; i++) {
      const tool = { id: `burst-tool-${i}`, type: 'commandExecution', command: `tool-${i}`, status: 'inProgress' };
      this.onEvent({ method: 'item/started', params: { threadId, turnId, item: structuredClone(tool) } });
      tool.status = 'completed';
      this.onEvent({ method: 'item/completed', params: { threadId, turnId, item: structuredClone(tool) } });
    }
  }

  emitOwnedTurnLifecycle(turnId: string, options: {
    threadId?: string;
    assistantA?: string;
    assistantB?: string;
    toolCommand?: string;
    complete?: boolean;
    deltaCount?: number;
  } = {}) {
    const threadId = options.threadId ?? this.primaryId;
    const list = this.turnsByThread.get(threadId) ?? [];
    const turn = list.find(item => item.id === turnId) ?? list[0];
    if (!turn) return;
    const assistantA = options.assistantA ?? 'PERF_ASSISTANT_A';
    const assistantB = options.assistantB ?? 'PERF_ASSISTANT_B_FINAL';
    const toolCommand = options.toolCommand ?? 'git rev-parse --short HEAD';
    const itemA = { id: 'assist-a', type: 'agentMessage', text: assistantA };
    const tool = { id: 'tool-1', type: 'commandExecution', command: toolCommand, status: 'inProgress' };
    const itemB = { id: 'assist-b', type: 'agentMessage', text: assistantB };
    turn.items.push(itemA);
    const deltas = options.deltaCount ?? 2;
    for (let i = 0; i < deltas; i++) {
      this.onEvent({
        method: 'item/agentMessage/delta',
        params: { threadId, turnId: turn.id, itemId: itemA.id, delta: assistantA.slice(0, Math.min(8, assistantA.length)) },
      });
    }
    this.onEvent({ method: 'item/completed', params: { threadId, turnId: turn.id, item: structuredClone(itemA) } });
    turn.items.push(tool);
    this.onEvent({ method: 'item/started', params: { threadId, turnId: turn.id, item: structuredClone(tool) } });
    tool.status = 'completed';
    this.onEvent({ method: 'item/completed', params: { threadId, turnId: turn.id, item: structuredClone(tool) } });
    turn.items.push(itemB);
    this.onEvent({
      method: 'item/agentMessage/delta',
      params: { threadId, turnId: turn.id, itemId: itemB.id, delta: assistantB },
    });
    this.onEvent({ method: 'item/completed', params: { threadId, turnId: turn.id, item: structuredClone(itemB) } });
    if (options.complete !== false) {
      turn.status = 'completed';
      turn.completedAt = Math.floor(Date.now() / 1000);
      turn.durationMs = 1500;
      this.threads.get(threadId)!.status.type = 'idle';
      this.onEvent({ method: 'turn/completed', params: { threadId, turn: structuredClone(turn) } });
    }
  }
}

export async function createPerfAdoptionFixture(options: {
  now?: () => number;
  discoveryIntervalMs?: number;
} = {}) {
  const rpc = new PerfNativeRpc();
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
  const journal = new Journal(path.join(mkdtempSync(path.join(tmpdir(), 'fleet-perf-')), 'native.sqlite'));
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
    options.discoveryIntervalMs ?? 0,
  );
  await adapter.qualify();
  const client = randomUUID();
  const expiresAt = (options.now ?? Date.now)() + 3_600_000;
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
    threadId: rpc.primaryId,
    stateToken: snapshot.threads.find(t => t.id === rpc.primaryId)?.stateToken
      ?? snapshot.threads[0]?.stateToken ?? '',
    activeTurnId: snapshot.threads.find(t => t.id === rpc.primaryId)?.activeTurnId
      ?? snapshot.threads[0]?.activeTurnId ?? null,
    family,
    text: ['native.submit', 'native.steer'].includes(family) ? 'Perf continuation' : '',
    ...changes,
  });
  const execute = (value: AdoptionCommand, actor = client) => adapter.execute(value, { ...authority, clientInstanceId: actor });
  const attach = async () => execute(command(await adapter.snapshot({ discover: true }), 'native.attach'));
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
