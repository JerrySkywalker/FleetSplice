import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, renameSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { changeRegistry, readRegistry, registryPath, workspaceValidity } from '../packages/workspaces/index.ts';
import { digest, requireThat, type Intent, type WorkspaceBinding } from '../packages/contracts/index.ts';
import { rootProof, rootProofNow } from '../apps/edge/identity.ts';
import { rig } from './helpers.ts';

const host = { principal: 'fixture-host\\fixture-user', sid: 'S-1-5-21-1' };
const noAcl = () => {};
test('Workspace registry registers existing roots, selects explicitly and removes only registration', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-registry-')); const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'workspace'); mkdirSync(root); writeFileSync(path.join(root, 'marker.txt'), 'preserve');
  const registered = await changeRegistry(host, 'add', root, 'Fixture', env, noAcl); const entry = registered.entries[0]!;
  assert.equal(registered.selectedId, entry.id); assert.equal(entry.rootIdentity, (await rootProof(root)).rootIdentity);
  assert.deepEqual(rootProofNow(root), await rootProof(root));
  assert.equal((await changeRegistry(host, 'select', entry.id, undefined, env, noAcl)).selectedId, entry.id);
  assert.throws(() => readRegistry({ ...host, sid: 'S-1-5-21-2' }, env), /HOST_OR_SCHEMA/);
  await assert.rejects(changeRegistry(host, 'add', path.join(directory, 'absent'), 'Absent', env, noAcl));
  assert.equal(existsSync(path.join(directory, 'absent')), false);
  const removed = await changeRegistry(host, 'remove', entry.id, undefined, env, noAcl);
  assert.equal(removed.selectedId, null); assert.equal(removed.entries.length, 0); assert.equal(readFileSync(path.join(root, 'marker.txt'), 'utf8'), 'preserve');
});
test('Workspace registry rejects substituted root identity, malformed records and competing writers', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-registry-')); const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'workspace'); mkdirSync(root);
  const entry = (await changeRegistry(host, 'add', root, 'Fixture', env, noAcl)).entries[0]!;
  renameSync(root, path.join(directory, 'preserved-root')); mkdirSync(root);
  assert.equal(await workspaceValidity(entry), false);
  await assert.rejects(changeRegistry(host, 'select', entry.id, undefined, env, noAcl), /MISSING_OR_REPLACED/);
  writeFileSync(`${registryPath(env)}.lock`, 'other writer');
  await assert.rejects(changeRegistry(host, 'remove', entry.id, undefined, env, noAcl), /EEXIST/);
  assert.equal(readFileSync(`${registryPath(env)}.lock`, 'utf8'), 'other writer');
  writeFileSync(registryPath(env), '{"version":1,"version":2}'); assert.throws(() => readRegistry(host, env));
});
const bindings = (target: import('../packages/contracts/index.ts').Target): WorkspaceBinding[] => [
  { registryId: randomUUID(), displayName: 'A', root: 'V:\\disposable-fixture', rootIdentity: target.rootIdentity, target, valid: true },
  { registryId: randomUUID(), displayName: 'B', root: 'V:\\disposable-fixture-b', rootIdentity: 'b'.repeat(64), target: { ...target, workspaceId: randomUUID(), rootIdentity: 'b'.repeat(64) }, valid: true }
];
test('New sessions bind different registered roots while existing sessions cannot be retargeted', async () => {
  const r = rig(bindings); const workspaces = r.hub.snapshot().workspaces;
  const submit = async (index: number, family: Intent['family'], body: unknown = {}, laneId: string | null = null) => {
    const command = await r.make(family, body, laneId); command.intent.target = workspaces[index]!.target; command.intentDigest = await digest('intent', command.intent); return r.hub.execute(command, r.client);
  };
  const nativeRoots: string[] = []; const create = r.native.create.bind(r.native);
  r.native.create = async (id, root, configuration, gate) => { r.native.threadId = randomUUID(); nativeRoots.push(root); return create(id, root, configuration, gate); };
  try {
    const lanes: string[] = [];
    for (const index of [0, 1]) {
      await submit(index, 'workspace.register', { root: workspaces[index]!.root });
      const lane = (await submit(index, 'logicalSession.create', { title: String(index) })).plan.laneId!; lanes.push(lane);
      await submit(index, 'sessionLane.acquireControl', {}, lane); await submit(index, 'sessionLane.continue', {}, lane);
    }
    assert.deepEqual(nativeRoots, workspaces.map(w => w.root));
    const before = r.hub.snapshot().lanes[0]!;
    await assert.rejects(submit(1, 'sessionLane.continue', {}, lanes[0]!), /SESSION_WORKSPACE_IMMUTABLE/);
    assert.deepEqual(r.hub.snapshot().lanes[0], before); assert.equal(r.native.creates, 2);
    assert.notEqual(r.hub.snapshot().lanes[0]!.nativeThreadId, r.hub.snapshot().lanes[1]!.nativeThreadId);
  } finally { r.close(); }
});
test('Workspace replacement at the final native boundary blocks dispatch and cannot be replayed', async () => {
  let valid = true; const r = rig(bindings, () => requireThat(valid, 'WORKSPACE_MISSING_OR_REPLACED'));
  try {
    const lane = await r.setup(); r.native.qualify = async () => { valid = false; };
    const command = await r.make('sessionLane.continue', {}, lane); const result = await r.hub.execute(command, r.client);
    assert.equal(result.receipt?.status, 'AMBIGUOUS_EFFECT'); assert.equal(result.receipt?.code, 'WORKSPACE_MISSING_OR_REPLACED'); assert.equal(r.native.creates, 0);
    await r.hub.execute(command, r.client); assert.equal(r.native.creates, 0);
  } finally { r.close(); }
});
