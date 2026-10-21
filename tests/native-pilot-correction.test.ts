import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MockNative, workspace } from '../research/pilots/fleetsplice-b2-c-contract-parity-001/src/native.ts';
import { Journal } from '../packages/journal/index.ts';
import { NativeActivityJournal } from '../packages/native-adoption/activity-journal.ts';
import { NativeAdoptionAdapter } from '../packages/native-adoption/adapter.ts';
import { NativeRpcError } from '../packages/native-adoption/transport.ts';
import type { AdoptionCommand } from '../packages/native-adoption/types.ts';

// The exact PR #22 native fixture, using a persistent product journal instead
// of discarding a fresh :memory: database on every observer. No SDK retest.
async function fixture(native = new MockNative(), filename = path.join(mkdtempSync(path.join(tmpdir(), 'fs-c-parity-')), 'edge.sqlite')) {
  const journal = new Journal(filename);
  native.rpcError = (code, message) => new NativeRpcError(code, message);
  const identity = { executablePath: native.proof.executable, reportedVersion: 'fixture', sha256: native.proof.hash,
    processId: native.proof.serverPid, processCreationTime: native.proof.serverBirth, endpoint: native.proof.endpoint,
    endpointIdentity: 'fixture-endpoint-birth', serverIncarnation: null };
  let adapter: NativeAdoptionAdapter;
  try { adapter = new NativeAdoptionAdapter(identity, native, workspace, 'fixture-root', () => identity,
    () => ({ root: workspace, rootIdentity: 'fixture-root' }), journal, new NativeActivityJournal(journal)); }
  catch (error) { journal.close(); throw error; }
  await adapter.qualify();
  const client = { clientInstanceId: 'fixture-client', sessionBinding: 'fixture-binding', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 600000 };
  const command = async (family: AdoptionCommand['family']): Promise<AdoptionCommand> => {
    const snapshot = await adapter.snapshot(); const thread = snapshot.threads[0]!;
    return { commandId: family === 'native.attach' ? 'fixture-attach' : 'fixture-command', runtimeId: snapshot.runtimeId, clientInstanceId: client.clientInstanceId,
      expectedFence: snapshot.fence, incarnation: snapshot.incarnation, threadId: native.thread.id, stateToken: thread.stateToken,
      activeTurnId: thread.activeTurnId, family, text: 'Synthetic ACK' };
  };
  const simulateSubscribedControl = () => {
    // Explicit mock-only oracle, never a claim about OfficialNativeRpc.
    for (const cap of Object.values(adapter.compatibility.capabilities)) { cap.available = true; cap.evidence = 'TESTED_SYNTHETIC_ONLY'; }
    adapter.compatibility.profile = 'ADOPT_FULL';
  };
  return { adapter, native, journal, filename, command, client, simulateSubscribedControl,
    close: () => { adapter.close(); journal.close(); } };
}

test('same PR22 CP07 contract: zero resume; unsupported real subscription remains blocked', async () => {
  const r = await fixture();
  try {
    assert.equal((await r.adapter.execute(await r.command('native.attach'), r.client)).status, 'REJECTED');
    assert.equal(r.native.resumeCalls, 0); assert.equal(r.native.processStarts, 0); assert.equal(r.native.attempts, 0);
  } finally { r.close(); }
});
test('same PR22 CP11 contract: no echoed caller ID, completed exact native turn', async () => {
  const r = await fixture(); r.native.echoClientId = false; r.simulateSubscribedControl();
  try {
    await r.adapter.execute(await r.command('native.attach'), r.client);
    const receipt = await r.adapter.execute(await r.command('native.submit'), r.client);
    assert.equal(receipt.status, 'SUCCEEDED'); assert.equal(receipt.turnId, 'fixture-native-turn-1');
    assert.equal(r.native.turns[0].status, 'completed'); assert.equal(r.native.attempts, 1); assert.equal(r.native.resumeCalls, 0);
  } finally { r.close(); }
});
test('same PR22 CP15 contract with persistent Edge journal: unknown acceptance never gets a second dispatch', async () => {
  const r = await fixture(); r.native.loseReply = true; r.simulateSubscribedControl();
  await r.adapter.execute(await r.command('native.attach'), r.client);
  assert.equal((await r.adapter.execute(await r.command('native.submit'), r.client)).status, 'AMBIGUOUS_EFFECT');
  r.close(); r.native.loseReply = false; r.native.turns[0].status = 'completed'; r.native.thread.status.type = 'idle';
  await assert.rejects(fixture(r.native, r.filename), /NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY/);
  assert.equal(r.native.attempts, 1); assert.equal(r.native.writerCount, 1); assert.equal(r.native.processStarts, 0);
});
