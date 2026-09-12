import test from 'node:test';
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

const workspace = 'V:\\disposable-native-demo';
class Rpc implements NativeRpc {
  onEvent: NativeRpc['onEvent'] = () => {}; onClose = () => {};
  thread: any = { id: 'native-existing-thread', cwd: workspace, status: { type: 'idle' }, model: 'native-model', canAcceptDirectInput: true, threadSource: 'user' };
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
    if (params.threadId && params.threadId !== this.thread.id) throw new NativeRpcError(-32600, 'thread not found');
    if (method === 'thread/list') return { data: [structuredClone(this.thread)], nextCursor: null };
    if (method === 'thread/loaded/list') return { data: this.loaded ? [this.thread.id] : [], nextCursor: null };
    if (method === 'thread/read') return { thread: structuredClone(this.thread) };
    if (method === 'thread/turns/list') return { data: structuredClone(this.turns), nextCursor: null };
    if (method === 'thread/resume') return { thread: { ...structuredClone(this.thread), id: this.resumeId ?? this.thread.id }, approvalPolicy: 'never', sandbox: { type: 'dangerFullAccess' } };
    if (method === 'model/list') { this.onEvent({ method: 'remoteControl/status/changed', params: { status: 'disabled' } }); return { data: [] }; }
    if (method === 'turn/start') {
      const item = { id: randomUUID(), clientId: params.clientUserMessageId, type: 'userMessage', content: params.input };
      const turn = { id: randomUUID(), status: 'inProgress', items: this.delayInput ? [] : [item] };
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
async function setup(options: { version?: string; sha?: string; missing?: string[] } = {}) {
  const rpc = new Rpc(); for (const method of options.missing ?? []) rpc.missing.add(method);
  let identity: NativeArtifactIdentity = { executablePath: 'C:\\official\\codex.exe', reportedVersion: options.version ?? 'future-build', sha256: options.sha ?? 'b'.repeat(64),
    processId: 100, processCreationTime: '123456', endpoint: 'C:\\user\\native.sock', endpointIdentity: 'socket-birth', serverIncarnation: null };
  const evidence: any[] = [];
  const adapter = new NativeAdoptionAdapter(structuredClone(identity), rpc, workspace, 'workspace-identity', () => identity,
    () => ({ root: workspace, rootIdentity: 'workspace-identity' }), { append: (kind, key, value) => evidence.push({ kind, key, value }) });
  await adapter.qualify();
  const client = randomUUID(); const expiresAt = Date.now() + 600000;
  const command = (snapshot: AdoptionSnapshot, family: AdoptionCommand['family'], changes: Partial<AdoptionCommand> = {}): AdoptionCommand => ({ commandId: randomUUID(),
    runtimeId: snapshot.runtimeId, clientInstanceId: client, expectedFence: snapshot.fence, incarnation: snapshot.incarnation,
    threadId: rpc.thread.id, stateToken: snapshot.threads[0]?.stateToken ?? '', activeTurnId: snapshot.threads[0]?.activeTurnId ?? null,
    family, text: ['native.submit', 'native.steer'].includes(family) ? 'A harmless continuation' : '', ...changes });
  const execute = (value: AdoptionCommand, actor = client) => adapter.execute(value, actor, expiresAt);
  const attach = async () => execute(command(await adapter.snapshot(), 'native.attach'));
  return { rpc, adapter, command, execute, attach, client, expiresAt, evidence, replace: (change: Partial<NativeArtifactIdentity>) => { identity = { ...identity, ...change }; } };
}
test('adoption version and SHA are evidence rather than an allowlist; runtime capabilities admit ADOPT_FULL', async () => {
  for (const [version, sha] of [['future.9000', 'a'.repeat(64)], ['unversioned-development', 'c'.repeat(64)]]) {
    const r = await setup({ version, sha });
    assert.equal(r.adapter.compatibility.profile, 'ADOPT_FULL'); assert.equal((await r.attach()).status, 'SUCCEEDED');
    assert.equal(r.adapter.identity.reportedVersion, version); assert.equal(r.adapter.identity.sha256, sha);
    assert.equal(r.rpc.calls.filter(c => c.method === 'thread/start').length, 0);
  }
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
  const r = await setup(); await r.attach(); const c = r.command(await r.adapter.snapshot(), 'native.submit');
  let reads = 0; const deadline = Date.now() + 40;
  r.rpc.before = method => { if (method === 'thread/read' && ++reads === 2) while (Date.now() <= deadline) { /* Bounded fixture-only expiry. */ } };
  const receipt = await r.adapter.execute(c, r.client, deadline);
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
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const bootstrapToken = randomUUID();
  const hub = await startHub({ port, target: target(), root: workspace, sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-native-browser-')), webDirectory: path.resolve('dist/web'), hcpToken: randomUUID(), bootstrapToken }, {
    snapshot: () => r.adapter.snapshot(), execute: (command, client, expiresAt) => r.adapter.execute(command, client, expiresAt), lookup: async commandId => r.adapter.lookup(commandId) });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1480, height: 1000 } });
    const page = await context.newPage(); await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await page.getByRole('button', { name: 'Attach', exact: true }).click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
    await expect(page.getByText('CONTROL_MODE=COOPERATIVE', { exact: true })).toBeVisible();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(r.rpc.thread.id);
    await page.locator('#native-prompt').fill('Browser continuation'); await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
    await expect(page.getByTestId('adopted-turn-id')).not.toHaveText('—');
    const active = await page.getByTestId('adopted-turn-id').innerText();
    await page.locator('#native-prompt').fill('Guide this turn'); await page.getByRole('button', { name: 'Steer', exact: true }).click();
    await expect(page.getByText('Guide this turn', { exact: true })).toBeVisible();
    await expect(page.getByTestId('adopted-turn-id')).toHaveText(active);
    await page.getByRole('button', { name: 'Interrupt turn', exact: true }).click();
    await expect(page.getByText('Turn interrupted', { exact: true })).toBeVisible();
    await expect(page.getByText(/A native command may still be finishing/)).toBeVisible();
    const viewer = await context.newPage(); await viewer.goto(`http://127.0.0.1:${port}/`);
    await expect(viewer.getByTestId('adopted-thread-id')).toHaveText(r.rpc.thread.id);
    await expect(viewer.getByRole('button', { name: 'Send continuation', exact: true })).toBeDisabled();
  } finally { await browser.close(); await hub.close(); }
});
