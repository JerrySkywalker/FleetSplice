import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, renameSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { changeRegistry, readRegistry, registeredStartRoot, registryPath, withRegistryLock, workspaceValidity } from '../packages/workspaces/index.ts';
import { digest, requireThat, type Intent, type WorkspaceBinding } from '../packages/contracts/index.ts';
import { rootProof, rootProofNow } from '../apps/edge/identity.ts';
import { rig } from './helpers.ts';

const host = { principal: 'fixture-host\\fixture-user', sid: 'S-1-5-21-1' };
const noAcl = () => {};
test('first-use Desktop-equivalent add, select and start bind the registered root independent of launcher cwd', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-first-use-'));
  const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'workspace'); mkdirSync(root);
  assert.equal(readRegistry(host, env), null);
  await assert.rejects(registeredStartRoot(host, undefined, env), /WORKSPACE_SELECTION_REQUIRED_OR_INVALID/);
  assert.equal(existsSync(registryPath(env)), false);
  const added = await changeRegistry(host, 'add', root, 'First use', env, noAcl);
  await changeRegistry(host, 'select', added.entries[0]!.id, undefined, env, noAcl);
  const initialCwd = process.cwd();
  try {
    process.chdir(tmpdir());
    assert.equal(await registeredStartRoot(host, undefined, env), (await rootProof(root)).root);
    assert.equal(await registeredStartRoot(host, root, env), (await rootProof(root)).root);
  } finally { process.chdir(initialCwd); }
  await assert.rejects(registeredStartRoot(host, directory, env), /WORKSPACE_NOT_REGISTERED_OR_REPLACED/);
  await assert.rejects(registeredStartRoot(host, `\\\\?\\${root}`, env), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
  await assert.rejects(registeredStartRoot(host, 'relative', env), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
  assert.equal(readRegistry(host, env)!.selectedId, added.entries[0]!.id);
});
test('selected or explicit workspace replacement cannot admit a different root', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-start-identity-'));
  const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'workspace'); mkdirSync(root);
  const selected = (await changeRegistry(host, 'add', root, 'Selected', env, noAcl)).entries[0]!;
  renameSync(root, `${root}-old`); mkdirSync(root);
  await assert.rejects(registeredStartRoot(host, undefined, env), /WORKSPACE_SELECTION_REQUIRED_OR_INVALID/);
  await assert.rejects(registeredStartRoot(host, root, env), /WORKSPACE_NOT_REGISTERED_OR_REPLACED/);
  assert.equal(readRegistry(host, env)!.selectedId, selected.id);
  assert.equal(existsSync(path.join(directory, 'FleetSplice', 'G05', 'environment-guard.json')), false);
});
test('CLI start lock serializes workspace selection with process admission', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-start-lock-'));
  const env = { LOCALAPPDATA: directory };
  const first = path.join(directory, 'first'); const second = path.join(directory, 'second'); mkdirSync(first); mkdirSync(second);
  const selected = await changeRegistry(host, 'add', first, 'First', env, noAcl);
  const next = await changeRegistry(host, 'add', second, 'Second', env, noAcl);
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const admission = withRegistryLock(host, async () => {
    assert.equal(await registeredStartRoot(host, undefined, env), selected.entries[0]!.root);
    entered(); await barrier;
  }, env);
  await started;
  await assert.rejects(changeRegistry(host, 'select', next.entries[1]!.id, undefined, env, noAcl), /WORKSPACE_REGISTRY_BUSY/);
  assert.equal(readRegistry(host, env)!.selectedId, selected.selectedId);
  release(); await admission;
  assert.equal(await registeredStartRoot(host, second, env), next.entries[1]!.root);
  await changeRegistry(host, 'select', next.entries[1]!.id, undefined, env, noAcl);
  assert.equal(await registeredStartRoot(host, undefined, env), next.entries[1]!.root);
});
test('workspace admission lock disappears when its owning process exits unexpectedly', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-lock-exit-'));
  const env = { LOCALAPPDATA: directory }; const root = path.join(directory, 'workspace'); mkdirSync(root);
  const selected = await changeRegistry(host, 'add', root, 'Root', env, noAcl);
  const name = createHash('sha256').update(`${registryPath(env).toLowerCase()}\0${host.sid}`).digest('hex').slice(0, 32);
  const pipe = `\\\\.\\pipe\\fleetsplice-workspace-lock-${name}`;
  const child = spawnSync(process.execPath, ['-e', 'const {createServer}=require("node:net");createServer(socket=>socket.destroy()).listen(process.argv[1],()=>process.exit(17))', pipe], { windowsHide: true, timeout: 10000 });
  assert.equal(child.status, 17);
  assert.equal((await changeRegistry(host, 'select', selected.selectedId!, undefined, env, noAcl)).selectedId, selected.selectedId);
  assert.equal(existsSync(`${registryPath(env)}.lock`), false);
});
test('onboarding selects and starts under one registry lock without committing on a failed precheck', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-select-start-'));
  const env = { LOCALAPPDATA: directory };
  const first = path.join(directory, 'first'); const second = path.join(directory, 'second'); mkdirSync(first); mkdirSync(second);
  const original = await changeRegistry(host, 'add', first, 'First', env, noAcl);
  const added = await changeRegistry(host, 'add', second, 'Second', env, noAcl);
  const secondId = added.entries[1]!.id;
  const originalBytes = readFileSync(registryPath(env));
  await assert.rejects(changeRegistry(host, 'select', secondId, undefined, env, noAcl, () => { throw Error('RECOVERY_REQUIRED'); }), /RECOVERY_REQUIRED/);
  assert.deepEqual(readFileSync(registryPath(env)), originalBytes);
  await assert.rejects(changeRegistry(host, 'select', secondId, undefined, env, noAcl, async () => { await Promise.resolve(); throw Error('START_FAILED'); }), /START_FAILED/);
  assert.deepEqual(readFileSync(registryPath(env)), originalBytes);
  let started = false;
  await changeRegistry(host, 'select', secondId, undefined, env, noAcl, async registry => {
    assert.equal(registry.selectedId, secondId);
    assert.equal(readRegistry(host, env)!.selectedId, original.selectedId);
    assert.equal(existsSync(`${registryPath(env)}.lock`), false);
    await assert.rejects(changeRegistry(host, 'select', original.selectedId!, undefined, env, noAcl), /WORKSPACE_REGISTRY_BUSY/);
    started = true;
  });
  assert.equal(started, true);
  assert.equal(readRegistry(host, env)!.selectedId, secondId);
  assert.equal(existsSync(`${registryPath(env)}.lock`), false);
});
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
  const readded = await changeRegistry(host, 'add', root, 'Fixture again', env, noAcl);
  assert.equal(readded.selectedId, null);
  assert.equal((await changeRegistry(host, 'select', readded.entries[0]!.id, undefined, env, noAcl)).selectedId, readded.entries[0]!.id);
});
test('Adding a root preserves explicit reselection after removing the default with other registrations', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-selection-')); const env = { LOCALAPPDATA: directory };
  const roots = ['a', 'b', 'c'].map(name => path.join(directory, name)); roots.forEach(root => mkdirSync(root));
  const first = await changeRegistry(host, 'add', roots[0]!, 'A', env, noAcl);
  await changeRegistry(host, 'add', roots[1]!, 'B', env, noAcl);
  await changeRegistry(host, 'remove', first.selectedId!, undefined, env, noAcl);
  const added = await changeRegistry(host, 'add', roots[2]!, 'C', env, noAcl);
  assert.equal(added.selectedId, null); assert.equal(readRegistry(host, env)!.selectedId, null);
  assert.equal((await changeRegistry(host, 'select', added.entries[1]!.id, undefined, env, noAcl)).selectedId, added.entries[1]!.id);
});
test('Overlong canonical roots are rejected without changing existing registry bytes', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-root-limit-')); const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'valid'); mkdirSync(root);
  await changeRegistry(host, 'add', root, 'Valid', env, noAcl);
  const before = readFileSync(registryPath(env));
  const longRoot = path.join(directory, ...Array.from({ length: 12 }, (_, index) => `${index}-${'x'.repeat(90)}`));
  mkdirSync(longRoot, { recursive: true });
  assert.ok((await rootProof(longRoot)).root.length > 1024);
  await assert.rejects(changeRegistry(host, 'add', longRoot, 'Too long', env, noAcl), /WORKSPACE_ROOT_TOO_LONG/);
  assert.deepEqual(readFileSync(registryPath(env)), before);
  assert.equal(readRegistry(host, env)!.entries.length, 1);
  assert.equal(existsSync(`${registryPath(env)}.lock`), false);
});
test('Workspace registry rejects substituted root identity, malformed records and competing writers', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-registry-')); const env = { LOCALAPPDATA: directory };
  const root = path.join(directory, 'workspace'); mkdirSync(root);
  const entry = (await changeRegistry(host, 'add', root, 'Fixture', env, noAcl)).entries[0]!;
  renameSync(root, path.join(directory, 'preserved-root')); mkdirSync(root);
  assert.equal(await workspaceValidity(entry), false);
  await assert.rejects(changeRegistry(host, 'select', entry.id, undefined, env, noAcl), /MISSING_OR_REPLACED/);
  writeFileSync(`${registryPath(env)}.lock`, 'other writer');
  await assert.rejects(changeRegistry(host, 'remove', entry.id, undefined, env, noAcl), /WORKSPACE_REGISTRY_LEGACY_LOCK_RECOVERY_REQUIRED/);
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
