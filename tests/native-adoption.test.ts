import test from 'node:test';
import { Journal } from '../packages/journal/index.ts';
import { NativeActivityJournal } from '../packages/native-adoption/activity-journal.ts';
import { BrowserClientSession } from '../apps/web/client-session.ts';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NativeAdoptionAdapter } from '../packages/native-adoption/adapter.ts';
import { assertSameIncarnation, classifyCapabilities, incarnationOf } from '../packages/native-adoption/compatibility.ts';
import { NativeRpcError, type NativeRpc } from '../packages/native-adoption/transport.ts';
import type { AdoptionCommand, AdoptionSnapshot, NativeArtifactIdentity } from '../packages/native-adoption/types.ts';
import { rig } from './helpers.ts';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { chromium, expect } from '@playwright/test';
import { startHub } from '../apps/hub/server.ts';
import { target } from './helpers.ts';
import { NativeApprovals } from '../packages/native-adoption/approvals.ts';

async function approvalRig(options: Parameters<typeof setup>[0] = {}) {
  const r = await setup(options);
  const responses: { id: string | number; result: any }[] = [];
  const rpc = r.rpc as Rpc & { respond: (id: string | number, result: unknown) => Promise<void> };
  rpc.respond = async (id, result) => { responses.push({ id, result }); r.rpc.onEvent({ method: 'serverRequest/resolved', params: { threadId: r.rpc.thread.id, requestId: id } }); };
  await r.attach();
  await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
  const message = { id: 0, method: 'item/commandExecution/requestApproval', params: { threadId: r.rpc.thread.id,
    turnId: r.rpc.turns[0].id, itemId: 'approval-item', kind: 'command', cwd: workspace,
    command: 'harmless fixture action', availableDecisions: ['accept', 'cancel'] } };
  r.rpc.onEvent(message);
  const approvalCommand = async (decision: 'ALLOW_ONCE' | 'DENY' = 'ALLOW_ONCE') => {
    const snapshot = await r.adapter.snapshot(); const a = snapshot.approvals![0]!;
    return r.command(snapshot, 'native.approval', { approval: { requestId: a.requestId, threadId: a.threadId,
      turnId: a.turnId, itemId: a.itemId, requestType: a.requestType, digest: a.digest, authority: a.authority!, decision } });
  };
  return { ...r, responses, message, approvalCommand };
}

test('approval Allow Once and Deny use exact native request ID zero and offered decisions', async () => {
  for (const decision of ['ALLOW_ONCE', 'DENY'] as const) {
    const r = await approvalRig();
    const c = await r.approvalCommand(decision);
    assert.equal((await r.execute(c)).status, 'SUCCEEDED');
    assert.deepEqual(r.responses, [{ id: 0, result: { decision: decision === 'ALLOW_ONCE' ? 'accept' : 'cancel' } }]);
    assert.equal((await r.adapter.snapshot()).approvals![0]!.status, 'RESOLVED');
    assert.equal((await r.execute(c)).status, 'SUCCEEDED'); assert.equal(r.responses.length, 1);
  }
});

test('approval rejects wrong request, thread, turn, item, request type and digest without a response', async () => {
  for (const change of [{ requestId: '0' }, { requestId: 1 }, { threadId: 'wrong' }, { turnId: 'wrong' },
    { itemId: 'wrong' }, { requestType: 'item/tool/call' }, { digest: 'wrong' }]) {
    const r = await approvalRig(); const c = await r.approvalCommand(); Object.assign(c.approval!, change);
    assert.equal((await r.execute(c)).status, 'REJECTED'); assert.equal(r.responses.length, 0);
  }
});

test('approval rejects wrong daemon incarnation and stale controller fence', async () => {
  for (const change of [{ incarnation: 'wrong' }, { expectedFence: -1 }]) {
    const r = await approvalRig(); const c = await r.approvalCommand(); Object.assign(c, change);
    assert.equal((await r.execute(c)).status, 'REJECTED'); assert.equal(r.responses.length, 0);
  }
});

test('TUI-first approval race and resolution during native preflight never send a second response', async () => {
  for (const duringPreflight of [false, true]) {
    const r = await approvalRig(); const c = await r.approvalCommand();
    const resolve = () => r.rpc.onEvent({ method: 'serverRequest/resolved', params: { threadId: r.rpc.thread.id, requestId: 0 } });
    if (duringPreflight) r.rpc.before = method => { if (method === 'thread/read') resolve(); }; else resolve();
    const receipt = await r.execute(c);
    assert.equal(receipt.code, 'NATIVE_APPROVAL_ALREADY_RESOLVED'); assert.equal(receipt.status, 'REJECTED'); assert.equal(r.responses.length, 0);
  }
});

test('Web-first approval race leaves repeated native notification and stale Web command unavailable', async () => {
  const r = await approvalRig(); const c = await r.approvalCommand();
  assert.equal((await r.execute(c)).status, 'SUCCEEDED');
  r.rpc.onEvent({ method: 'serverRequest/resolved', params: { threadId: r.rpc.thread.id, requestId: 0 } });
  const fresh = await r.approvalCommand(); assert.equal((await r.execute(fresh)).code, 'NATIVE_APPROVAL_ALREADY_RESOLVED');
  assert.equal(r.responses.length, 1);
});

test('viewer and new client cannot inherit approval authority', async () => {
  const r = await approvalRig(); const c = await r.approvalCommand(); const viewer = randomUUID(); c.clientInstanceId = viewer;
  assert.equal((await r.execute(c, viewer)).code, 'FLEET_VIEWER_CANNOT_CONTROL'); assert.equal(r.responses.length, 0);
});

test('same browser renewal retains controller but invalidates old approval grant and fence', async () => {
  let now = 1000; const r = await approvalRig({ now: () => now }); const old = await r.approvalCommand();
  const snapshot = await r.adapter.snapshot(); const next = { ...r.authority, grantRevision: '2', expiresAt: r.expiresAt + 1000 };
  await r.adapter.renewClient(r.authority, next, { runtimeId: snapshot.runtimeId, incarnation: snapshot.incarnation, controller: snapshot.controller, fence: snapshot.fence });
  assert.equal((await r.execute(old)).status, 'REJECTED');
  const fresh = await r.approvalCommand(); assert.notEqual(fresh.approval!.authority, old.approval!.authority);
  assert.equal((await r.adapter.execute(fresh, next)).status, 'SUCCEEDED'); assert.equal(r.responses.length, 1);
});

test('controller release or expiry invalidates old approval controls', async () => {
  for (const expire of [false, true]) {
    let now = 1000; const r = await approvalRig({ now: () => now }); const c = await r.approvalCommand();
    if (expire) now = r.expiresAt; else await r.execute(r.command(await r.adapter.snapshot(), 'native.release'));
    assert.equal((await r.execute(c)).status, 'REJECTED'); assert.equal(r.responses.length, 0);
    assert.equal((await r.adapter.snapshot()).approvals![0]!.authority, null);
  }
});

test('approval Interrupt and Steer preserve exact active turn and invalidate interrupted request', async () => {
  const r = await approvalRig();
  const steer = r.command(await r.adapter.snapshot(), 'native.steer'); assert.equal((await r.execute(steer)).status, 'SUCCEEDED');
  assert.equal(r.rpc.calls.findLast(x => x.method === 'turn/steer')!.params.expectedTurnId, r.message.params.turnId);
  const interrupt = r.command(await r.adapter.snapshot(), 'native.interrupt'); assert.equal((await r.execute(interrupt)).status, 'SUCCEEDED');
  assert.equal(r.rpc.calls.findLast(x => x.method === 'turn/interrupt')!.params.turnId, r.message.params.turnId);
  assert.equal((await r.adapter.snapshot()).approvals![0]!.status, 'STALE');
  assert.equal((await r.execute(await r.approvalCommand())).status, 'REJECTED'); assert.equal(r.responses.length, 0);
});

test('approval capability is observed without version or SHA allowlists', async () => {
  const r = await approvalRig({ version: 'unknown-future', sha: 'not-a-release' });
  assert.equal((await r.adapter.snapshot()).compatibility.capabilities.approvalResolve.available, true);
  assert.equal((await r.execute(await r.approvalCommand())).status, 'SUCCEEDED');
});

test('file approval, unknown requests and turn-scoped permission grants have distinct admission', () => {
  for (const method of ['item/fileChange/requestApproval', 'item/permissions/requestApproval', 'item/tool/call', 'unknown/requestApproval']) {
    const store = new NativeApprovals();
    const supported = store.observe({ id: 'request', method, params: { threadId: 'thread', turnId: 'turn', itemId: 'item' } }, workspace);
    assert.equal(supported, false); // File-change params alone contain no inspectable paths/diffs.
    if (!supported) assert.throws(() => store.exact(store.views()[0]!), /APPROVAL_UNAVAILABLE/);
  }
});

test('approval ID reuse and persistent file grants remain fail closed', () => {
  const store = new NativeApprovals();
  const message = { id: 0, method: 'item/fileChange/requestApproval', params: { threadId: 'thread', turnId: 'turn', itemId: 'item', grantRoot: 'V:\\' } };
  assert.equal(store.observe(message, workspace), false);
  assert.throws(() => store.observe({ ...message, params: { ...message.params, itemId: 'another' } }, workspace), /NATIVE_REQUEST_ID_REUSED/);
});

test('approval preserves complete command details and refuses hidden or unavailable action context', () => {
  for (const command of ['x'.repeat(1100), 'x'.repeat(4001), '', 'echo safe\u202Ehidden']) {
    const store = new NativeApprovals();
    const supported = store.observe({ id: 0, method: 'item/commandExecution/requestApproval', params: {
      threadId: 'thread', turnId: 'turn', itemId: 'item', command } }, workspace);
    assert.equal(supported, command.length === 1100);
    if (supported) assert.equal(store.views()[0]!.summary, command);
    else assert.throws(() => store.exact(store.views()[0]!), /APPROVAL_UNAVAILABLE/);
  }
  const store = new NativeApprovals();
  store.observe({ id: 0, method: 'item/commandExecution/requestApproval', params: { threadId: 'thread', turnId: 'turn', itemId: 'item',
    command: 'echo hello', environmentId: 'local', reason: 'test reason', additionalPermissions: { network: true } } }, workspace);
  assert.match(store.views()[0]!.summary, /echo hello\nReason: test reason\nEnvironment: local\nRequested command permissions:.*network/);
});

test('approval deadline bounds stalled send and resolution and preserves unknown without replay', { timeout: 2000 }, async () => {
  for (const stalledSend of [true, false]) {
    const store = new NativeApprovals(20); let sent = 0;
    store.observe({ id: 0, method: 'item/commandExecution/requestApproval', params: {
      threadId: 'thread', turnId: 'turn', itemId: 'item', command: 'echo safe' } }, workspace);
    const request = store.views()[0]!;
    await assert.rejects(store.respond(request, 'ALLOW_ONCE', async () => {
      sent++;
      if (stalledSend) { store.resolved('thread', 0); await new Promise(() => {}); }
    }), /NATIVE_APPROVAL_OUTCOME_UNKNOWN/);
    assert.equal(store.views()[0]!.status, 'UNKNOWN');
    await assert.rejects(store.respond(request, 'ALLOW_ONCE', async () => { sent++; }), /STALE_NATIVE_REQUEST/);
    assert.equal(sent, 1);
  }
});

const workspace = 'V:\\disposable-native-demo';
class Rpc implements NativeRpc {
  onEvent: NativeRpc['onEvent'] = () => {}; onClose = () => {};
  thread: any = { id: 'native-existing-thread', cwd: workspace, status: { type: 'idle' }, model: 'native-model', canAcceptDirectInput: true, threadSource: 'user', ephemeral: false };
  ephemeralCandidate: any = null;
  turns: any[] = [{ id: 'native-existing-turn', status: 'completed', items: [{ id: 'first-user', type: 'userMessage', content: [{ type: 'text', text: 'Original TUI conversation' }] }, { id: 'first-answer', type: 'agentMessage', text: 'Original native answer' }] }];
  calls: { method: string; params: any }[] = [];
  missing = new Set<string>(); loaded = true; resumeId: string | null = null;
  before: (method: string, params: any) => void = () => {};
  delayedInputs: { turnId: string; item: any }[] = []; delayInput = false;
  flushInputs() { for (const pending of this.delayedInputs) this.turns.find(t => t.id === pending.turnId).items.push(pending.item); this.delayedInputs = []; }
  close() { this.onClose(); }
  async call(method: string, params: any): Promise<any> {
    this.calls.push({ method, params: structuredClone(params) }); this.before(method, params);
    if (this.missing.has(method)) throw new NativeRpcError(-32601, 'Method not found');
    if (this.ephemeralCandidate && params.threadId === this.ephemeralCandidate.id) {
      if (method === 'thread/read') return { thread: structuredClone(this.ephemeralCandidate) };
      if (method === 'thread/turns/list') throw new NativeRpcError(-32600, 'ephemeral threads do not support thread/turns/list');
      throw Error('Ephemeral thread received unexpected effect');
    }
    if (params.threadId && params.threadId !== this.thread.id) throw new NativeRpcError(-32600, 'thread not found');
    if (method === 'thread/list') return { data: [structuredClone(this.thread)], nextCursor: null };
    if (method === 'thread/loaded/list') return { data: this.loaded ? [this.thread.id, ...(this.ephemeralCandidate ? [this.ephemeralCandidate.id] : [])] : [], nextCursor: null };
    if (method === 'thread/read') return { thread: structuredClone(this.thread) };
    if (method === 'thread/turns/list') return { data: structuredClone(this.turns), nextCursor: null };
    if (method === 'thread/resume') return { thread: { ...structuredClone(this.thread), id: this.resumeId ?? this.thread.id }, approvalPolicy: 'never', sandbox: { type: 'dangerFullAccess' } };
    if (method === 'model/list') { this.onEvent({ method: 'remoteControl/status/changed', params: { status: 'disabled' } }); return { data: [] }; }
    if (method === 'turn/start') {
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      const turn = { id: randomUUID(), status: 'inProgress', startedAt: Math.floor(Date.now() / 1000), items: this.delayInput ? [] : [item] };
      if (this.delayInput) this.delayedInputs.push({ turnId: turn.id, item });
      this.turns.unshift(turn); this.thread.status.type = 'active'; this.onEvent({ method: 'turn/started', params: { threadId: this.thread.id, turn } }); return { turn: structuredClone(turn) };
    }
    if (method === 'turn/steer') {
      assert.equal(params.expectedTurnId, this.turns[0].id);
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      if (this.delayInput) this.delayedInputs.push({ turnId: this.turns[0].id, item }); else this.turns[0].items.push(item);
      return { turnId: this.turns[0].id };
    }
    if (method === 'turn/interrupt') {
      assert.equal(params.turnId, this.turns[0].id); this.turns[0].status = 'interrupted'; this.thread.status.type = 'idle';
      this.onEvent({ method: 'turn/completed', params: { threadId: this.thread.id, turn: structuredClone(this.turns[0]) } }); return {};
    }
    throw Error('unexpected fixture RPC');
  }
}
async function setup(options: { version?: string; sha?: string; missing?: string[]; now?: () => number } = {}) {
  const rpc = new Rpc(); for (const method of options.missing ?? []) rpc.missing.add(method);
  let identity: NativeArtifactIdentity = { executablePath: 'C:\\official\\codex.exe', reportedVersion: options.version ?? 'future-build', sha256: options.sha ?? 'b'.repeat(64),
    processId: 100, processCreationTime: '123456', endpoint: 'C:\\user\\native.sock', endpointIdentity: 'socket-birth', serverIncarnation: null };
  const evidence: any[] = [];
  const journal = new Journal(path.join(mkdtempSync(path.join(tmpdir(), 'fleet-activity-')), 'native.sqlite'));
  const activity = new NativeActivityJournal(journal);
  const adapter = new NativeAdoptionAdapter(structuredClone(identity), rpc, workspace, 'workspace-identity', () => identity,
    () => ({ root: workspace, rootIdentity: 'workspace-identity' }), { append: (kind, key, value) => evidence.push({ kind, key, value }) }, activity, options.now);
  await adapter.qualify();
  const client = randomUUID(); const expiresAt = (options.now ?? Date.now)() + 600000;
  const authority = { clientInstanceId: client, sessionBinding: randomUUID(), grantId: randomUUID(), grantRevision: '1', expiresAt };
  const command = (snapshot: AdoptionSnapshot, family: AdoptionCommand['family'], changes: Partial<AdoptionCommand> = {}): AdoptionCommand => ({ commandId: randomUUID(),
    runtimeId: snapshot.runtimeId, clientInstanceId: client, expectedFence: snapshot.fence, incarnation: snapshot.incarnation,
    threadId: rpc.thread.id, stateToken: snapshot.threads[0]?.stateToken ?? '', activeTurnId: snapshot.threads[0]?.activeTurnId ?? null,
    family, text: ['native.submit', 'native.steer'].includes(family) ? 'A harmless continuation' : '', ...changes });
  const execute = (value: AdoptionCommand, actor = client) => adapter.execute(value, { ...authority, clientInstanceId: actor });
  const attach = async () => execute(command(await adapter.snapshot(), 'native.attach'));
  return { rpc, adapter, command, execute, attach, client, expiresAt, evidence, journal, activity, authority, replace: (change: Partial<NativeArtifactIdentity>) => { identity = { ...identity, ...change }; } };
}
test('adoption version and SHA are evidence rather than an allowlist; runtime capabilities admit ADOPT_FULL', async () => {
  for (const [version, sha] of [['future.9000', 'a'.repeat(64)], ['unversioned-development', 'c'.repeat(64)]]) {
    const r = await setup({ version, sha });
    assert.equal(r.adapter.compatibility.profile, 'ADOPT_FULL'); assert.equal((await r.attach()).status, 'SUCCEEDED');
    assert.equal(r.adapter.identity.reportedVersion, version); assert.equal(r.adapter.identity.sha256, sha);
    assert.equal(r.rpc.calls.filter(c => c.method === 'thread/start').length, 0);
  }
});

test('source uses exact client ID on the same native thread, preserves explicit labels, never attributes equal text', async () => {
  const r = await setup(); await r.attach();
  const text = 'Original TUI conversation';
  const command = r.command(await r.adapter.snapshot(), 'native.submit', { text, clientDisplayLabel: 'Personal Web', deviceLabel: 'Jerry Fold' });
  assert.equal((await r.execute(command)).status, 'SUCCEEDED');
  let view = (await r.adapter.snapshot()).threads[0]!;
  assert.equal(view.id, r.rpc.thread.id);
  assert.deepEqual(view.history[0]!.source, { kind: 'NATIVE_EXTERNAL' });
  assert.deepEqual(view.history.find(message => message.turnId === r.rpc.turns[0].id)!.source,
    { kind: 'FLEETSPLICE_WEB', clientInstanceId: r.client, clientDisplayLabel: 'Personal Web', deviceLabel: 'Jerry Fold' });
  r.rpc.turns[0].items.push({ id: 'external-identical-text', type: 'userMessage', content: [{ type: 'text', text }] });
  view = (await r.adapter.snapshot()).threads[0]!;
  assert.deepEqual(view.history.at(-1)!.source, { kind: 'NATIVE_EXTERNAL' });
  assert.equal(view.externalAdvance, true);
});

test('turn states preserve structured native timing and degrade absent or invalid fields', async () => {
  const r = await setup(); await r.attach();
  for (const [status, state] of [['inProgress', 'RUNNING'], ['completed', 'COMPLETED'], ['interrupted', 'INTERRUPTED'], ['failed', 'FAILED']]) {
    Object.assign(r.rpc.turns[0], { status, startedAt: 1700000000, completedAt: status === 'inProgress' ? null : 1700000133, durationMs: status === 'inProgress' ? null : 133000 });
    r.rpc.thread.status.type = status === 'inProgress' ? 'active' : 'idle';
    const view = (await r.adapter.snapshot()).threads[0]!;
    assert.deepEqual(view.turns[0], { id: r.rpc.turns[0].id, state, startedAt: 1700000000, completedAt: status === 'inProgress' ? null : 1700000133, durationMs: status === 'inProgress' ? null : 133000 });
    assert.equal(view.activeTurnId, status === 'inProgress' ? r.rpc.turns[0].id : null);
  }
  delete r.rpc.turns[0].startedAt; r.rpc.turns[0].completedAt = 'yesterday'; r.rpc.turns[0].durationMs = -1;
  const turn = (await r.adapter.snapshot()).threads[0]!.turns[0]!;
  assert.equal(turn.startedAt, null); assert.equal(turn.completedAt, null); assert.equal(turn.durationMs, null);
});

test('successful journal input restores source after reconnect without replay or text attribution', async () => {
  const r = await setup(); await r.attach();
  const command = r.command(await r.adapter.snapshot(), 'native.submit', { deviceLabel: 'Jerry Fold' });
  const receipt = await r.execute(command);
  const next = new NativeAdoptionAdapter(r.adapter.identity, r.rpc, workspace, 'workspace-identity', () => r.adapter.identity,
    () => ({ root: workspace, rootIdentity: 'workspace-identity' }), { append: () => {} }, r.activity);
  next.restoreInput(command, receipt);
  await next.qualify();
  const view = (await next.snapshot()).threads[0]!;
  assert.deepEqual(view.history.at(-1)!.source, { kind: 'FLEETSPLICE_WEB', clientInstanceId: r.client, deviceLabel: 'Jerry Fold' });
  assert.equal(r.rpc.calls.filter(call => call.method === 'turn/start' && call.params.threadId === r.rpc.thread.id).length, 1);
  assert.throws(() => next.restoreInput(command, { ...receipt, status: 'AMBIGUOUS_EFFECT' }), /NATIVE_SOURCE_EVIDENCE_UNPROVABLE/);
  assert.throws(() => next.restoreInput(command, { ...receipt, threadId: 'different-thread' }), /NATIVE_SOURCE_EVIDENCE_UNPROVABLE/);
});

test('interrupt residual commands drain only after every observed command is terminal; stale reads cannot resurrect them', async () => {
  const r = await setup(); await r.attach();
  await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
  const turn = r.rpc.turns[0];
  turn.items.push(...['one', 'two'].map(id => ({ id, type: 'commandExecution', command: 'harmless sleep', status: 'inProgress' })));
  await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
  assert.equal((await r.adapter.snapshot()).threads[0]!.residualCommandState, 'MAY_STILL_BE_RUNNING');
  const complete = (id: string) => r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id, turnId: turn.id, item: { id, type: 'commandExecution', status: 'completed' } } });
  complete('one'); assert.equal((await r.adapter.snapshot()).threads[0]!.residualCommandState, 'MAY_STILL_BE_RUNNING');
  complete('two'); const view = (await r.adapter.snapshot()).threads[0]!;
  assert.equal(view.residualCommandState, 'OBSERVED_DRAINED'); assert.equal(view.turns.at(-1)!.state, 'INTERRUPTED'); assert.equal(view.activeTurnId, null);
});

test('completed commands and interruptions without commands cannot leave stale warnings', async () => {
  for (const withCommand of [false, true]) {
    const r = await setup(); await r.attach(); await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
    if (withCommand) r.rpc.turns[0].items.push({ id: 'already-completed', type: 'commandExecution', status: 'completed' });
    await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
    assert.equal((await r.adapter.snapshot()).threads[0]!.residualCommandState, withCommand ? 'OBSERVED_DRAINED' : 'NONE_OBSERVED');
  }
});

test('terminal archive retains identity without resurrecting drained warnings after 64 commands', async () => {
  const r = await setup(); await r.attach(); await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
  const turn = r.rpc.turns[0];
  turn.items.push({ id: 'retained-terminal', type: 'commandExecution', status: 'inProgress' });
  await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
  const event = (id: string, status: string, turnId = turn.id) => r.rpc.onEvent({ method: status === 'completed' ? 'item/completed' : 'item/started',
    params: { threadId: r.rpc.thread.id, turnId, item: { id, type: 'commandExecution', status } } });
  event('retained-terminal', 'completed');
  assert.equal((await r.adapter.snapshot()).threads[0]!.residualCommandState, 'OBSERVED_DRAINED');
  for (let index = 0; index < 64; index++) event(`later-${index}`, 'completed', 'later-turn');
  event('retained-terminal', 'inProgress');
  const callCount = r.rpc.calls.length;
  const snapshot = await r.adapter.snapshot();
  assert.equal(snapshot.state, 'READY');
  assert.equal(snapshot.controller, r.client); assert.ok(r.rpc.calls.length > callCount);
  assert.equal(snapshot.threads[0]!.residualCommandState, 'OBSERVED_DRAINED');
  assert.equal(snapshot.threads[0]!.lastTurnStatus, 'interrupted');
  const continued = await r.execute(r.command(snapshot, 'native.submit'));
  assert.equal(continued.status, 'SUCCEEDED');
});

for (const phase of ['initial', 'final'] as const) test(`attach ${phase} refresh archives terminal overflow before granting control`, async () => {
  const r = await setup();
  r.rpc.turns[0].items.push(...Array.from({ length: 64 }, (_, index) => ({ id: `command-${index}`, type: 'commandExecution', status: 'completed' })));
  const command = r.command(await r.adapter.snapshot(), 'native.attach');
  let resumed = false; let injected = false;
  r.rpc.before = method => {
    if (method === 'thread/resume') resumed = true;
    if (!injected && method === 'thread/turns/list' && (phase === 'initial' || resumed)) {
      injected = true; r.rpc.turns[0].items.push({ id: 'command-65', type: 'commandExecution', status: 'completed' });
    }
  };
  const receipt = await r.execute(command);
  assert.equal(injected, true); assert.equal(receipt.status, 'SUCCEEDED');
  assert.equal(r.rpc.calls.filter(call => call.method === 'thread/resume' && call.params.threadId === r.rpc.thread.id).length, 1);
  const snapshot = await r.adapter.snapshot(); assert.equal(snapshot.state, 'READY'); assert.equal(snapshot.controller, r.client);
  assert.equal(Number(r.journal.db.prepare('SELECT COUNT(*) AS n FROM native_commands WHERE terminal=1').get()!.n), 65);
  assert.ok(snapshot.threads[0]!.activity.length <= 16);
});
test('capability modes downgrade without requiring optional controls', async () => {
  const r = await setup(); const c = structuredClone(r.adapter.compatibility.capabilities);
  c.steer.available = false; c.interrupt.available = false; assert.equal(classifyCapabilities(c), 'ADOPT_FULL');
  c.events.available = false; assert.equal(classifyCapabilities(c), 'ADOPT_RESUME');
  c.resume.available = false; c.events.available = true; assert.equal(classifyCapabilities(c), 'MANAGED_ONLY');
  c.turnStart.available = false; assert.equal(classifyCapabilities(c), 'UNSUPPORTED');
});
test('PID reuse, process replacement, endpoint replacement and server incarnation change fail closed', async () => {
  for (const change of [{ processId: 101 }, { processCreationTime: '987654' }, { endpointIdentity: 'new-socket' }, { serverIncarnation: 'new-server' }]) {
    const r = await setup(); await r.attach(); const snapshot = await r.adapter.snapshot(); const before = structuredClone(r.adapter.identity);
    assert.throws(() => assertSameIncarnation(before, { ...before, ...change }), /NATIVE_SERVER_INCARCATION_CHANGED/);
    r.replace(change); const receipt = await r.execute(r.command(snapshot, 'native.submit'));
    assert.equal(receipt.code, 'NATIVE_SERVER_INCARCATION_CHANGED'); assert.equal(receipt.status, 'REJECTED');
    assert.equal(r.rpc.calls.filter(c => c.method === 'turn/start' && c.params.threadId === r.rpc.thread.id).length, 0);
  }
});
test('metadata changes alone do not claim a replacement incarnation', async () => {
  const r = await setup(); assert.equal(incarnationOf(r.adapter.identity), incarnationOf({ ...r.adapter.identity, reportedVersion: 'new metadata', sha256: 'd'.repeat(64) }));
});
test('missing steer or interrupt is disabled and cannot issue that native effect', async () => {
  for (const family of ['native.steer', 'native.interrupt'] as const) {
    const method = family === 'native.steer' ? 'turn/steer' : 'turn/interrupt'; const capability = family === 'native.steer' ? 'steer' : 'interrupt';
    const r = await setup({ missing: [method] }); await r.attach();
    await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
    const snapshot = await r.adapter.snapshot(); assert.equal(snapshot.compatibility.capabilities[capability].available, false);
    const receipt = await r.execute(r.command(snapshot, family)); assert.equal(receipt.status, 'REJECTED');
    assert.equal(receipt.code, family === 'native.steer' ? 'NATIVE_STEER_UNAVAILABLE' : 'NATIVE_INTERRUPT_UNAVAILABLE');
    assert.equal(r.rpc.calls.filter(c => c.method === method && c.params.threadId === r.rpc.thread.id).length, 0);
  }
});
test('exact loaded thread is required and a returned replacement cannot masquerade as adoption', async () => {
  const missing = await setup(); const initial = await missing.adapter.snapshot(); missing.rpc.loaded = false;
  assert.equal((await missing.execute(missing.command(initial, 'native.attach'))).code, 'NATIVE_EXACT_LOADED_THREAD_REQUIRED');
  const wrong = await setup(); wrong.rpc.resumeId = 'replacement-thread';
  const receipt = await wrong.attach(); assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'NATIVE_THREAD_IDENTITY_MISMATCH');
  assert.equal((await wrong.adapter.snapshot()).threads[0]!.attached, false);
});
test('same-thread history, continuation, steer and interrupt retain native identity and honest residual state', async () => {
  const r = await setup(); const receipt = await r.attach(); assert.equal(receipt.createdNativeThread, false);
  let snapshot = await r.adapter.snapshot(); assert.match(snapshot.threads[0]!.history[0]!.text, /Original TUI/);
  const continuation = await r.execute(r.command(snapshot, 'native.submit')); assert.equal(continuation.threadId, r.rpc.thread.id);
  snapshot = await r.adapter.snapshot(); assert.equal(snapshot.threads[0]!.activeTurnId, continuation.turnId);
  const steer = await r.execute(r.command(snapshot, 'native.steer')); assert.equal(steer.turnId, continuation.turnId);
  r.rpc.turns[0].items.push({ id: 'residual-command', type: 'commandExecution', command: 'harmless sleep', status: 'inProgress' });
  const interrupted = await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
  assert.equal(interrupted.status, 'SUCCEEDED'); assert.equal(interrupted.turnId, continuation.turnId); assert.equal(interrupted.processTerminationClaim, false);
  snapshot = await r.adapter.snapshot(); assert.equal(snapshot.threads[0]!.lastTurnStatus, 'interrupted');
  assert.equal(snapshot.threads[0]!.residualCommandState, 'MAY_STILL_BE_RUNNING');
});
test('only one Fleet Web controller writes, including concurrent acquisition', async () => {
  const r = await setup(); const snapshot = await r.adapter.snapshot(); const other = randomUUID();
  const results = await Promise.all([r.execute(r.command(snapshot, 'native.attach')),
    r.execute(r.command(snapshot, 'native.attach', { clientInstanceId: other }), other)]);
  assert.deepEqual(results.map(result => result.status).sort(), ['REJECTED', 'SUCCEEDED']);
  const current = await r.adapter.snapshot(); const receipt = await r.execute(r.command(current, 'native.submit', { clientInstanceId: other }), other);
  assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'FLEET_VIEWER_CANNOT_CONTROL');
  assert.equal(current.controlMode, 'COOPERATIVE');
});
test('local native advancement rejects stale Web input and requires explicit review of current state', async () => {
  const r = await setup(); await r.attach(); const old = await r.adapter.snapshot();
  r.rpc.turns.unshift({ id: 'external-turn', status: 'inProgress', items: [{ id: 'external-input', type: 'userMessage', content: [{ type: 'text', text: 'Local TUI input' }] }] });
  r.rpc.thread.status.type = 'active';
  const rejected = await r.execute(r.command(old, 'native.submit')); assert.equal(rejected.code, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
  const current = await r.adapter.snapshot(); assert.equal(current.threads[0]!.externalAdvance, true);
  const stale = await r.execute(r.command(current, 'native.steer')); assert.equal(stale.code, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
  assert.equal((await r.execute(r.command(await r.adapter.snapshot(), 'native.reviewState'))).status, 'SUCCEEDED');
  const steered = await r.execute(r.command(await r.adapter.snapshot(), 'native.steer')); assert.equal(steered.turnId, 'external-turn'); assert.equal(steered.status, 'SUCCEEDED');
});
test('stale active turn and stale Fleet fences reject before a native effect; command lookup never replays', async () => {
  const r = await setup(); await r.attach(); const old = await r.adapter.snapshot();
  await r.execute(r.command(old, 'native.submit')); const snapshot = await r.adapter.snapshot();
  assert.equal((await r.execute(r.command(snapshot, 'native.interrupt', { activeTurnId: 'old-turn' }))).code, 'STALE_NATIVE_ACTIVE_TURN');
  assert.equal((await r.execute(r.command(old, 'native.submit'))).code, 'STALE_FLEET_CONTROLLER_FENCE');
  const value = r.command(await r.adapter.snapshot(), 'native.interrupt'); const first = await r.execute(value); const count = r.rpc.calls.length;
  assert.deepEqual(await r.execute(value), first); assert.deepEqual(r.adapter.lookup(value.commandId), first); assert.equal(r.rpc.calls.length, count);
});

test('input arriving during the final acknowledgement read remains unreviewed', async () => {
  const r = await setup(); await r.attach();
  r.rpc.turns[0].items.push({ id: 'external-before-review', type: 'userMessage', content: [{ type: 'text', text: 'Visible local input' }] });
  const displayed = await r.adapter.snapshot(); assert.equal(displayed.threads[0]!.externalAdvance, true);
  let reads = 0;
  r.rpc.before = method => {
    if (method === 'thread/turns/list' && ++reads === 2) r.rpc.turns[0].items.push({ id: 'external-during-review', type: 'userMessage', content: [{ type: 'text', text: 'Unseen newer local input' }] });
  };
  const receipt = await r.execute(r.command(displayed, 'native.reviewState'));
  assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
  const current = await r.adapter.snapshot(); assert.equal(current.fence, displayed.fence); assert.equal(current.threads[0]!.externalAdvance, true);
  assert.equal((await r.execute(r.command(current, 'native.submit'))).code, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
  r.rpc.before = () => {};
  assert.equal((await r.execute(r.command(current, 'native.reviewState'))).status, 'SUCCEEDED');
});

test('a failed observation retains sanitized phase and identity evidence and never retries or permits effects', async () => {
  const r = await setup(); await r.attach();
  r.rpc.before = method => { if (method === 'thread/turns/list') throw new NativeRpcError(-32603, 'resource busy: unrelated private path and payload'); };
  const held = await r.adapter.snapshot(); const calls = r.rpc.calls.length;
  assert.equal(held.state, 'NATIVE_OPERATION_UNPROVABLE'); assert.equal(held.controller, null);
  assert.equal(held.observationFailure?.phase, 'thread/turns/list'); assert.equal(held.observationFailure?.nativeCode, -32603);
  assert.equal(held.observationFailure?.reason, 'RESOURCE_BUSY'); assert.equal(held.observationFailure?.threadId, r.rpc.thread.id);
  assert.equal(held.observationFailure?.incarnation, held.incarnation);
  assert.ok(r.evidence.some(e => e.kind === 'NATIVE_OBSERVATION_FAILURE'));
  assert.doesNotMatch(JSON.stringify(r.evidence), /unrelated private path|payload/);
  await r.adapter.snapshot(); assert.equal(r.rpc.calls.length, calls);
  assert.equal((await r.execute(r.command(held, 'native.submit'))).status, 'REJECTED'); assert.equal(r.rpc.calls.length, calls);
});

test('native ephemeral background candidates never hydrate history or disable the adopted TUI controller', async () => {
  const r = await setup(); await r.attach(); const before = await r.adapter.snapshot();
  r.rpc.ephemeralCandidate = { ...structuredClone(r.rpc.thread), id: 'native-ephemeral-background', ephemeral: true };
  for (let i = 0; i < 3; i++) {
    const observed = await r.adapter.snapshot();
    assert.equal(observed.state, 'READY'); assert.equal(observed.controller, r.client); assert.equal(observed.fence, before.fence);
    assert.deepEqual(observed.threads.map(t => t.id), [r.rpc.thread.id]);
  }
  assert.equal(r.rpc.calls.filter(c => c.params.threadId === r.rpc.ephemeralCandidate.id && c.method !== 'thread/read').length, 0);
  assert.equal(r.evidence.filter(e => e.kind === 'NATIVE_DISCOVERY_NOT_ATTACHABLE').length, 1);
  assert.equal((await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'))).status, 'SUCCEEDED');
  r.rpc.thread.ephemeral = true; const held = await r.adapter.snapshot();
  assert.equal(held.state, 'NATIVE_THREAD_NOT_ATTACHABLE'); assert.equal(held.controller, null);
});
test('ambiguous native response closes admission and cannot be resubmitted under a fresh command ID', async () => {
  const r = await setup(); await r.attach();
  r.rpc.before = (method, params) => { if (method === 'turn/start' && params.threadId === r.rpc.thread.id) throw Error('response lost'); };
  const first = await r.execute(r.command(await r.adapter.snapshot(), 'native.submit')); assert.equal(first.status, 'AMBIGUOUS_EFFECT');
  const snapshot = await r.adapter.snapshot(); assert.equal(snapshot.state, 'NATIVE_EFFECT_UNKNOWN_NO_REPLAY');
  assert.equal((await r.execute(r.command(snapshot, 'native.submit'))).status, 'REJECTED');
});
test('delayed own submit and steer observations correlate exact client IDs without adopting another native writer', async () => {
  const r = await setup(); await r.attach(); r.rpc.delayInput = true;
  const submitted = await r.execute(r.command(await r.adapter.snapshot(), 'native.submit')); assert.equal(submitted.status, 'SUCCEEDED');
  r.rpc.flushInputs(); assert.equal((await r.adapter.snapshot()).threads[0]!.externalAdvance, false);
  const steered = await r.execute(r.command(await r.adapter.snapshot(), 'native.steer')); assert.equal(steered.status, 'SUCCEEDED');
  r.rpc.flushInputs(); assert.equal((await r.adapter.snapshot()).threads[0]!.externalAdvance, false);
  r.rpc.turns[0].items.push({ id: 'external-identical-text', clientId: 'another-native-writer', type: 'userMessage', content: [{ type: 'text', text: 'A harmless continuation', text_elements: [] }] });
  assert.equal((await r.adapter.snapshot()).threads[0]!.externalAdvance, true);
});
test('a client expiring during the final native read is rejected before effect dispatch', async () => {
  let now = 1000000; const r = await setup({ now: () => now }); await r.attach(); const c = r.command(await r.adapter.snapshot(), 'native.submit');
  let reads = 0;
  r.rpc.before = method => { if (method === 'thread/read' && ++reads === 2) now = r.expiresAt; };
  const receipt = await r.adapter.execute(c, r.authority);
  assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'STALE_FLEET_CONTROLLER_FENCE');
  assert.equal(r.rpc.calls.filter(c => c.method === 'turn/start' && c.params.threadId === r.rpc.thread.id).length, 0);
});

test('managed and adopted origins are distinguishable without changing the managed native driver', async () => {
  const r = await setup(); await r.attach(); assert.equal((await r.adapter.snapshot()).threads[0]!.origin, 'NATIVE_ADOPTED');
  const managed = rig(); try {
    await managed.admit('workspace.register', { root: 'V:\\disposable-fixture' });
    await managed.admit('logicalSession.create', { title: 'Managed fixture' });
    assert.equal(managed.hub.snapshot().lanes[0]!.origin, 'FLEETSPLICE_MANAGED');
  } finally { managed.close(); }
});
test('SYNTHETIC_BROWSER_ADOPTION: existing history, cooperative controls, same-turn steer and honest interrupt', async () => {
  const r = await setup();
  r.rpc.turns[0].durationMs = 133000;
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const bootstrapToken = randomUUID();
  const hub = await startHub({ port, target: target(), root: workspace, sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-native-browser-')), webDirectory: path.resolve('dist/web'), hcpToken: randomUUID(), bootstrapToken }, {
    snapshot: () => r.adapter.snapshot(), execute: (command, client) => r.adapter.execute(command, client), renewClient: (previous, next, continuity) => r.adapter.renewClient(previous, next, continuity), lookup: async commandId => r.adapter.lookup(commandId) });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1480, height: 1000 } });
    const page = await context.newPage(); await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await page.getByRole('button', { name: 'Attach', exact: true }).click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
    await expect(page.locator('[data-source="NATIVE_EXTERNAL"]')).toBeVisible();
    await expect(page.getByText('Done · Worked for 2m 13s', { exact: true })).toBeVisible();
    await expect(page.getByText('CONTROL_MODE=COOPERATIVE', { exact: true })).toBeVisible();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(r.rpc.thread.id);
    await page.locator('#native-prompt').fill('Browser continuation'); await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
    await expect(page.getByTestId('adopted-turn-id')).not.toHaveText('—');
    await expect(page.locator('.session-heading [data-turn-state="RUNNING"]')).toContainText(/Working · \d+m \d+s/);
    await expect(page.locator('[data-source="FLEETSPLICE_WEB"]')).toBeVisible();
    const active = await page.getByTestId('adopted-turn-id').innerText();
    await page.locator('#native-prompt').fill('Guide this turn'); await page.getByRole('button', { name: 'Steer', exact: true }).click();
    await expect(page.getByText('Guide this turn', { exact: true })).toBeVisible();
    await expect(page.getByTestId('adopted-turn-id')).toHaveText(active);
    r.rpc.turns[0].items.push({ id: 'browser-residual', type: 'commandExecution', command: 'harmless sleep', status: 'inProgress' });
    await page.getByRole('button', { name: 'Interrupt turn', exact: true }).click();
    await expect(page.getByText('Turn interrupted', { exact: true })).toBeVisible();
    await expect(page.getByText(/A native command may still be finishing/)).toBeVisible();
    r.rpc.turns[0].items.find((item: any) => item.id === 'browser-residual').status = 'completed';
    await expect(page.locator('[data-residual-state="OBSERVED_DRAINED"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/A native command may still be finishing/)).toHaveCount(0);
    await expect(page.getByText('Turn interrupted', { exact: true })).toBeVisible();
    const viewer = await context.newPage(); await viewer.goto(`http://127.0.0.1:${port}/`);
    await expect(viewer.getByTestId('adopted-thread-id')).toHaveText(r.rpc.thread.id);
    await expect(viewer.getByRole('button', { name: 'Send continuation', exact: true })).toBeDisabled();
  } finally { await browser.close(); await hub.close(); }
});

test('exact grant renewal binds client/session/revision/controller/fence without any native call', async () => {
  let now = 1000000; const r = await setup({ now: () => now }); await r.attach();
  const before = await r.adapter.snapshot(); const calls = r.rpc.calls.length;
  now += 300000;
  const next = { ...r.authority, grantRevision: '2', expiresAt: now + 600000 };
  for (const change of [{ clientInstanceId: randomUUID() }, { sessionBinding: 'wrong' }, { grantId: randomUUID() }, { grantRevision: '0' }]) {
    const old = { ...r.authority, ...change };
    await assert.rejects(r.adapter.renewClient(old, { ...old, grantRevision: String(BigInt(old.grantRevision) + 1n), expiresAt: next.expiresAt }, before));
  }
  await assert.rejects(r.adapter.renewClient(r.authority, next, { ...before, fence: before.fence - 1 }), /STALE_FLEET_CONTROLLER_FENCE/);
  const renewed = await r.adapter.renewClient(r.authority, next, before);
  assert.equal(renewed.controller, r.client); assert.equal(renewed.fence, before.fence + 1); assert.equal(r.rpc.calls.length, calls);
  now = r.authority.expiresAt + 1;
  const current = await r.adapter.snapshot(); assert.equal(current.controller, r.client);
  assert.equal(current.incarnation, before.incarnation); assert.equal(current.threads[0]!.id, before.threads[0]!.id);
  assert.equal((await r.adapter.execute(r.command(current, 'native.submit'), r.authority)).status, 'REJECTED');
  assert.equal((await r.adapter.execute(r.command(before, 'native.submit'), next)).code, 'STALE_FLEET_CONTROLLER_FENCE');
  assert.equal((await r.adapter.execute(r.command(current, 'native.submit'), next)).status, 'SUCCEEDED');
});

test('expired renewal never resurrects controller and a new viewer cannot inherit it', async () => {
  let now = 1000000; const r = await setup({ now: () => now }); await r.attach();
  const before = await r.adapter.snapshot(); now += 300000;
  const viewer = { ...r.authority, clientInstanceId: randomUUID(), grantId: randomUUID() };
  assert.equal((await r.adapter.renewClient(viewer, { ...viewer, grantRevision: '2', expiresAt: now + 600000 }, null)).controller, r.client);
  now = r.authority.expiresAt;
  await assert.rejects(r.adapter.renewClient(r.authority, { ...r.authority, grantRevision: '2', expiresAt: now + 600000 }, before), /CLIENT_RENEWAL_REJECTED/);
  assert.equal((await r.adapter.snapshot()).controller, null);
});

test('400 terminal commands archive durably while active and interrupted residual commands stay retained', async () => {
  const r = await setup(); await r.attach(); await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
  const turn = r.rpc.turns[0];
  turn.items.push({ id: 'unknown-residual', type: 'commandExecution', status: 'unknown' });
  await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
  for (let n = 0; n < 400; n++) r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id, turnId: 'later-turn',
    item: { id: `many-${n}`, type: 'commandExecution', status: 'completed', command: 'harmless synthetic command' } } });
  let snapshot = await r.adapter.snapshot(); assert.equal(snapshot.state, 'READY'); assert.equal(snapshot.controller, r.client);
  assert.equal(snapshot.threads[0]!.residualCommandState, 'MAY_STILL_BE_RUNNING');
  assert.ok(snapshot.threads[0]!.activity.some(tool => tool.id === 'unknown-residual'), 'archived history must not hide current nonterminal activity');
  assert.equal(r.activity.unsafe(r.adapter.incarnation, r.rpc.thread.id)[0]!.id, 'unknown-residual');
  assert.equal(Number(r.journal.db.prepare("SELECT COUNT(*) AS n FROM evidence WHERE kind='NATIVE_COMMAND_EVIDENCE'").get()!.n), 401);
  // Inspect the actual bounded safety cache as well as the persisted evidence.
  const tools = (r.adapter as any).threads.get(r.rpc.thread.id).tools as Map<string, any>;
  assert.ok(tools.has('unknown-residual')); assert.ok(tools.size <= 17); assert.ok(!tools.has('many-0'));
  assert.ok(r.journal.db.prepare("SELECT 1 FROM native_commands WHERE id='many-0' AND terminal=1").get());
  const recovered = new NativeActivityJournal(r.journal);
  assert.equal(recovered.unsafe(r.adapter.incarnation, r.rpc.thread.id)[0]!.status, 'unknown');
  assert.throws(() => recovered.assertRecovery('replacement-incarnation'), /NATIVE_PREDECESSOR_COMMAND_UNKNOWN_NO_REPLAY/);
  r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id, turnId: turn.id,
    item: { id: 'unknown-residual', type: 'commandExecution', status: 'completed' } } });
  snapshot = await r.adapter.snapshot(); assert.equal(snapshot.threads[0]!.residualCommandState, 'OBSERVED_DRAINED');
  assert.equal(recovered.unsafe(r.adapter.incarnation, r.rpc.thread.id).length, 0);
  assert.equal((await r.execute(r.command(snapshot, 'native.submit'))).status, 'SUCCEEDED');
});

test('journal failure before terminal commit cannot evict an active command or claim residual drain', async () => {
  const r = await setup(); await r.attach(); await r.execute(r.command(await r.adapter.snapshot(), 'native.submit'));
  const turn = r.rpc.turns[0]; turn.items.push({ id: 'not-committed', type: 'commandExecution', status: 'inProgress' });
  await r.execute(r.command(await r.adapter.snapshot(), 'native.interrupt'));
  r.journal.db.exec("CREATE TRIGGER deny_terminal BEFORE UPDATE ON native_commands WHEN NEW.terminal=1 BEGIN SELECT RAISE(ABORT,'fixture disk failure'); END");
  r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id, turnId: turn.id,
    item: { id: 'not-committed', type: 'commandExecution', status: 'completed' } } });
  const snapshot = await r.adapter.snapshot(); assert.equal(snapshot.state, 'NATIVE_JOURNAL_UNPROVABLE'); assert.equal(snapshot.controller, null);
  assert.equal(r.activity.residual(r.adapter.incarnation, r.rpc.thread.id), 'MAY_STILL_BE_RUNNING');
  assert.equal((r.adapter as any).threads.get(r.rpc.thread.id).tools.get('not-committed').status, 'inProgress');
  assert.equal(Number(r.journal.db.prepare("SELECT COUNT(*) AS n FROM evidence WHERE kind='NATIVE_COMMAND_EVIDENCE'").get()!.n), 1);
});

test('HTTP and browser grant renewal spans original expiry; invalid session/client/CSRF/revision fail closed', async () => {
  let now = Date.now(); const r = await setup({ now: () => now });
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`; const bootstrapToken = randomUUID();
  const hub = await startHub({ port, target: target(), root: workspace, sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-renewal-')), webDirectory: path.resolve('dist/web'), hcpToken: randomUUID(), bootstrapToken }, {
    snapshot: () => r.adapter.snapshot(), execute: (c, client) => r.adapter.execute(c, client),
    renewClient: (previous, next, continuity) => r.adapter.renewClient(previous, next, continuity), lookup: async id => r.adapter.lookup(id)
  }, () => now);
  try {
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: bootstrapToken }) });
    const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const transport: typeof fetch = (url, init) => fetch(`${origin}${url}`, { ...init, headers: { ...init?.headers, Origin: origin, Cookie: cookie } });
    const changes: any[] = []; const browser = new BrowserClientSession(c => changes.push(c), () => now, transport);
    browser.setClient(await browser.request('/api/client', {})); browser.native = true;
    const original = { ...browser.client! };
    const snapshot = await browser.request('/api/native/snapshot');
    assert.equal((await browser.request('/api/native/commands', r.command(snapshot, 'native.attach', { clientInstanceId: original.clientInstanceId }))).status, 'SUCCEEDED');
    const attached = await browser.request('/api/native/snapshot'); const calls = r.rpc.calls.length;
    const bad = async (headers: object, body = { grantId: original.grantId, grantRevision: original.grantRevision, continuity: attached }) => {
      const response = await fetch(`${origin}/api/client/renew`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie,
        'X-Fleet-Client': original.clientInstanceId, 'X-Fleet-Csrf': original.csrf, ...headers }, body: JSON.stringify(body) });
      assert.equal(response.status, 403);
    };
    await bad({ Cookie: `fleetsplice=${'0'.repeat(64)}` }); await bad({ 'X-Fleet-Client': randomUUID() }); await bad({ 'X-Fleet-Csrf': 'wrong' });
    await bad({}, { grantId: original.grantId, grantRevision: '0', continuity: attached });
    const viewer = new BrowserClientSession(() => {}, () => now, transport); viewer.setClient(await viewer.request('/api/client', {})); viewer.native = true;
    assert.notEqual(viewer.client!.clientInstanceId, original.clientInstanceId);
    now += 25 * 60_000;
    const continued = await browser.request('/api/native/snapshot');
    assert.equal(browser.client!.clientInstanceId, original.clientInstanceId); assert.equal(browser.client!.grantRevision, '2');
    assert.notEqual(browser.client!.csrf, original.csrf); assert.equal(continued.controller, original.clientInstanceId);
    assert.equal(continued.fence, attached.fence + 1); assert.equal(continued.incarnation, attached.incarnation);
    assert.ok(r.rpc.calls.slice(calls).every(c => !['turn/start', 'turn/steer', 'turn/interrupt', 'thread/resume'].includes(c.method)));
    await bad({}); // Old CSRF cannot revive revision 1.
    assert.equal((await viewer.request('/api/native/snapshot')).controller, original.clientInstanceId);
    assert.equal((await viewer.request('/api/native/commands', r.command(continued, 'native.submit', { clientInstanceId: viewer.client!.clientInstanceId }))).status, 'REJECTED');
    now = original.expiresAt + 1;
    assert.equal((await browser.request('/api/native/snapshot')).state, 'READY'); assert.equal(changes.length, 2);
    const unrenewed = await transport('/api/client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); const expired = await unrenewed.json();
    now = expired.expiresAt;
    await bad({ 'X-Fleet-Client': expired.clientInstanceId, 'X-Fleet-Csrf': expired.csrf }, { grantId: expired.grantId, grantRevision: expired.grantRevision, continuity: null });
  } finally { await hub.close(); }
});

test('browser ambiguous renewal closes all subsequent observation and effects without retry', async () => {
  let count = 0; const now = 1000000;
  const browser = new BrowserClientSession(() => {}, () => now, async () => { count++; throw Error('fixture response lost'); });
  browser.setClient({ actorId: randomUUID(), clientInstanceId: randomUUID(), grantId: randomUUID(), grantRevision: '1', csrf: 'old', expiresAt: now + 1000 });
  await assert.rejects(browser.request('/api/native/snapshot'), /fixture response lost/);
  await assert.rejects(browser.request('/api/native/commands', {}), /CLIENT_RENEWAL_FAILED_CLOSED/); assert.equal(count, 1);
});

test('durable archive and UNKNOWN survive an actual SQLite close/reopen', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'fleet-restart-')), 'native.sqlite');
  let journal = new Journal(file); let activity = new NativeActivityJournal(journal);
  activity.interrupt('incarnation', 'thread', 'interrupted');
  activity.observe('incarnation', 'thread', { id: 'unknown', turnId: 'interrupted', status: 'unknown', text: 'unresolved' });
  for (let n = 0; n < 100; n++) activity.observe('incarnation', 'thread', { id: `done-${n}`, turnId: 'interrupted', status: 'completed', text: 'terminal' });
  journal.close(); journal = new Journal(file); activity = new NativeActivityJournal(journal);
  try {
    assert.equal(activity.unsafe('incarnation', 'thread')[0]!.status, 'unknown');
    assert.equal(activity.residual('incarnation', 'thread'), 'MAY_STILL_BE_RUNNING');
    assert.equal(activity.observe('incarnation', 'thread', { id: 'done-0', turnId: 'interrupted', status: 'inProgress', text: 'stale' }).status, 'completed');
    assert.throws(() => activity.assertRecovery('replacement'), /NATIVE_PREDECESSOR_COMMAND_UNKNOWN_NO_REPLAY/);
    activity.observe('incarnation', 'thread', { id: 'unknown', turnId: 'interrupted', status: 'completed', text: 'terminal observation' });
    assert.equal(activity.residual('incarnation', 'thread'), 'OBSERVED_DRAINED');
  } finally { journal.close(); }
});

test('more than 64 active commands are never evicted by terminal compaction', async () => {
  const r = await setup(); await r.attach();
  for (let n = 0; n < 80; n++) r.rpc.onEvent({ method: 'item/started', params: { threadId: r.rpc.thread.id, turnId: 'active-turn',
    item: { id: `active-${n}`, type: 'commandExecution', status: 'inProgress' } } });
  for (let n = 0; n < 160; n++) r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id, turnId: 'other-turn',
    item: { id: `terminal-${n}`, type: 'commandExecution', status: 'completed' } } });
  assert.equal(r.activity.unsafe(r.adapter.incarnation, r.rpc.thread.id).length, 80);
  const tools = (r.adapter as any).threads.get(r.rpc.thread.id).tools as Map<string, any>;
  assert.equal([...tools.values()].filter(t => t.status === 'inProgress').length, 80);
  assert.equal((await r.adapter.snapshot()).state, 'READY');
});

for (const phase of ['initial', 'final'] as const) test(`attach ${phase} terminal journal failure holds before control assignment`, async () => {
  const r = await setup(); const command = r.command(await r.adapter.snapshot(), 'native.attach');
  r.journal.db.exec("CREATE TRIGGER deny_command BEFORE INSERT ON native_commands BEGIN SELECT RAISE(ABORT,'fixture journal unavailable'); END");
  let resumed = false;
  r.rpc.before = method => {
    if (method === 'thread/resume') resumed = true;
    if (method === 'thread/turns/list' && (phase === 'initial' || resumed))
      r.rpc.turns[0].items.push({ id: 'unjournaled', type: 'commandExecution', status: 'completed' });
  };
  const receipt = await r.execute(command); assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'NATIVE_JOURNAL_UNPROVABLE');
  assert.equal((await r.adapter.snapshot()).controller, null);
  assert.equal(r.rpc.calls.filter(c => c.method === 'thread/resume' && c.params.threadId === r.rpc.thread.id).length, phase === 'initial' ? 0 : 1);
});

test('an event journal failure during the final native read blocks dispatch without replay', async () => {
  const r = await setup(); await r.attach(); const command = r.command(await r.adapter.snapshot(), 'native.submit');
  r.journal.db.exec("CREATE TRIGGER deny_command BEFORE INSERT ON native_commands BEGIN SELECT RAISE(ABORT,'fixture event journal failure'); END");
  let reads = 0;
  r.rpc.before = method => {
    if (method === 'thread/turns/list' && ++reads === 2) r.rpc.onEvent({ method: 'item/completed', params: { threadId: r.rpc.thread.id,
      turnId: r.rpc.turns[0].id, item: { id: 'concurrent-terminal', type: 'commandExecution', status: 'completed' } } });
  };
  const receipt = await r.execute(command); assert.equal(receipt.status, 'REJECTED'); assert.equal(receipt.code, 'NATIVE_JOURNAL_UNPROVABLE');
  assert.equal(r.rpc.calls.filter(c => c.method === 'turn/start' && c.params.threadId === r.rpc.thread.id).length, 0);
});
