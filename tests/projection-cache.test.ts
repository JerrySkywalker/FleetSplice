import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NativeAdoptionAdapter } from '../packages/native-adoption/adapter.ts';
import { NativeActivityJournal } from '../packages/native-adoption/activity-journal.ts';
import { Journal } from '../packages/journal/index.ts';
import type { NativeArtifactIdentity } from '../packages/native-adoption/types.ts';

const workspace = 'V:\\projection-cache-workspace';

class Rpc {
  calls: { method: string; params: any }[] = [];
  onEvent: (message: any) => void = () => {};
  onClose = () => {};
  thread = { id: 'thread-1', cwd: workspace, status: { type: 'idle' }, model: 'fixture-model', ephemeral: false, canAcceptDirectInput: true };
  turns: any[] = [{ id: 'turn-1', status: 'completed', items: [{ id: 'u1', type: 'userMessage', content: [{ type: 'text', text: 'hi' }] }] }];
  loaded = true;
  close() {}
  async call(method: string, params: any = {}) {
    this.calls.push({ method, params });
    if (method === 'thread/list') return { data: [this.thread], nextCursor: null };
    if (method === 'thread/loaded/list') return { data: this.loaded ? [this.thread.id] : [], nextCursor: null };
    if (method === 'thread/read') return { thread: structuredClone(this.thread) };
    if (method === 'thread/turns/list') return { data: structuredClone(this.turns), nextCursor: null };
    if (method === 'thread/resume') return { thread: structuredClone(this.thread) };
    if (method === 'thread/name/list' || method === 'model/list') return { data: [] };
    if (method === 'turn/start' || method === 'turn/steer' || method === 'turn/interrupt') {
      const err: any = new Error(`thread not found: ${params.threadId}`); err.code = -32600; throw Object.assign(err, { code: -32600 });
    }
    throw Object.assign(new Error(`thread not found: ${params.threadId}`), { code: -32600 });
  }
  async respond() {}
}

async function makeAdapter(intervalMs: number, now: () => number = Date.now) {
  const rpc = new Rpc();
  const identity: NativeArtifactIdentity = {
    executablePath: 'C:\\official\\codex.exe', reportedVersion: 'future', sha256: 'a'.repeat(64),
    processId: 1, processCreationTime: '1', endpoint: 'C:\\sock', endpointIdentity: 'birth', serverIncarnation: null,
  };
  const journal = new Journal(path.join(mkdtempSync(path.join(tmpdir(), 'fleet-proj-')), 'native.sqlite'));
  const adapter = new NativeAdoptionAdapter(identity, rpc as any, workspace, 'workspace-identity', () => identity,
    () => ({ root: workspace, rootIdentity: 'workspace-identity' }), { append: () => {} }, new NativeActivityJournal(journal), now, intervalMs);
  // Bypass qualify probes by marking capabilities after a lightweight init path.
  (adapter as any).capability('sharedDaemon', true, 'fixture');
  (adapter as any).capability('threadList', true, 'fixture');
  (adapter as any).capability('threadRead', true, 'fixture');
  (adapter as any).capability('resume', true, 'fixture');
  (adapter as any).capability('turnStart', true, 'fixture');
  (adapter as any).capability('activeTurn', true, 'fixture');
  (adapter as any).capability('interrupt', true, 'fixture');
  (adapter as any).capability('steer', true, 'fixture');
  (adapter as any).capability('events', true, 'fixture');
  (adapter as any).capability('models', true, 'fixture');
  (adapter as any).capability('effectiveState', true, 'fixture');
  (adapter as any).capability('approvalObserve', false, 'fixture');
  (adapter as any).capability('approvalResolve', false, 'fixture');
  return { adapter, rpc, journal };
}

test('ordinary snapshot reads project memory without provider-wide RPC fanout', async () => {
  const { adapter, rpc, journal } = await makeAdapter(60_000);
  try {
    await adapter.snapshot({ discover: true });
    const afterDiscover = rpc.calls.length;
    assert.ok(rpc.calls.some(c => c.method === 'thread/loaded/list'));
    assert.ok(rpc.calls.some(c => c.method === 'thread/list'));
    await adapter.snapshot();
    await adapter.snapshot();
    assert.equal(rpc.calls.length, afterDiscover);
  } finally { journal.close(); adapter.close(); }
});

test('dirty attached thread reconciles only that thread until fallback discovery', async () => {
  let now = 1_000_000;
  const { adapter, rpc, journal } = await makeAdapter(30_000, () => now);
  try {
    const first = await adapter.snapshot({ discover: true });
    const client = randomUUID();
    const authority = { clientInstanceId: client, sessionBinding: randomUUID(), grantId: randomUUID(), grantRevision: '1', expiresAt: now + 600_000 };
    await adapter.execute({
      commandId: randomUUID(), runtimeId: first.runtimeId, clientInstanceId: client, expectedFence: first.fence,
      incarnation: first.incarnation, threadId: 'thread-1', stateToken: first.threads[0]!.stateToken, activeTurnId: null,
      family: 'native.attach', text: '',
    }, authority);
    rpc.calls.length = 0;
    rpc.onEvent({ method: 'turn/started', params: { threadId: 'thread-1', turn: { id: 'turn-2', status: 'inProgress' } } });
    await adapter.snapshot();
    assert.ok(rpc.calls.every(c => c.method === 'thread/read' || c.method === 'thread/turns/list'));
    assert.equal(rpc.calls.filter(c => c.method === 'thread/list').length, 0);
    assert.equal(rpc.calls.filter(c => c.method === 'thread/loaded/list').length, 0);
    rpc.calls.length = 0;
    now += 31_000;
    await adapter.snapshot();
    assert.ok(rpc.calls.some(c => c.method === 'thread/list'));
    assert.ok(rpc.calls.some(c => c.method === 'thread/loaded/list'));
  } finally { journal.close(); adapter.close(); }
});
