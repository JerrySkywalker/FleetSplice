import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ceilingPath, permits, readCeiling, writeCeiling } from '../packages/permissions/index.ts';
import { observePermission, permissionCapabilities, permissionRequest, turnPermission } from '../packages/driver-codex/permissions.ts';
import { rig } from './helpers.ts';

const profiles = [{ id: ':read-only', allowed: true }, { id: ':workspace', allowed: true }, { id: ':danger-full-access', allowed: true }];
test('Host permission ceiling defaults read-only, is local and rejects malformed or foreign ownership', () => {
  const env = { LOCALAPPDATA: mkdtempSync(path.join(tmpdir(), 'fleetsplice-permission-')) }, host = { principal: 'fixture', sid: 'S-1-5-21-1' };
  assert.equal(readCeiling(host, env), 'READ_ONLY'); assert.equal(permits('READ_ONLY', 'YOLO'), false);
  writeCeiling(host, 'YOLO', env, () => {}); assert.equal(readCeiling(host, env), 'YOLO');
  const bytes = readFileSync(ceilingPath(env));
  assert.throws(() => readCeiling({ ...host, sid: 'other' }, env), /INVALID/);
  assert.throws(() => writeCeiling(host, 'INVALID' as any, env, () => {}), /UNKNOWN/);
  assert.deepEqual(readFileSync(ceilingPath(env)), bytes);
  writeFileSync(ceilingPath(env), '{"version":1,"version":2}'); assert.throws(() => readCeiling(host, env));
});
test('Native permission mapping requires live profile availability and exact effective evidence', () => {
  const catalog = permissionCapabilities(profiles); assert.equal(catalog.every(item => item.allowed), true);
  assert.equal(permissionCapabilities([]).every(item => !item.allowed), true);
  assert.throws(() => permissionCapabilities([...profiles, profiles[0]]), /INVALID/);
  assert.equal(permissionRequest('WORKSPACE_AUTO').sandbox, 'workspace-write');
  assert.throws(() => observePermission('YOLO', { approvalPolicy: 'never', sandbox: { type: 'readOnly', networkAccess: false } }), /UNOBSERVED/);
  const auto = { approvalPolicy: 'never', sandbox: { type: 'workspaceWrite', networkAccess: false, writableRoots: [], excludeTmpdirEnvVar: true, excludeSlashTmp: true } };
  assert.equal(observePermission('WORKSPACE_AUTO', auto).network, 'denied');
  assert.throws(() => observePermission('WORKSPACE_AUTO', { ...auto, sandbox: { ...auto.sandbox, writableRoots: ['V:\\outside'] } }), /UNOBSERVED/);
  assert.throws(() => observePermission('WORKSPACE_AUTO', { ...auto, sandbox: { ...auto.sandbox, networkAccess: true } }), /UNOBSERVED/);
  const yolo = observePermission('YOLO', { approvalPolicy: 'never', sandbox: { type: 'dangerFullAccess' } });
  assert.equal(yolo.network, 'native-unrestricted'); assert.deepEqual(turnPermission(yolo), { type: 'dangerFullAccess' });
});
test('Browser cannot widen Host ceiling; permission changes cannot rebind an existing thread', async () => {
  let maximum = false; const r = rig(undefined, undefined, preset => preset === 'READ_ONLY' || maximum);
  try {
    r.native.catalog.permissions = permissionCapabilities(profiles); const lane = await r.setup();
    const body = { model: 'fixture-model', reasoningEffort: 'fixture-reasoning', permission: 'YOLO' };
    const denied = await r.admit('sessionLane.continue', body, lane);
    assert.equal(denied.receipt?.code, 'HOST_PERMISSION_CEILING_REJECTED'); assert.equal(denied.receipt?.nativeRequestId, null); assert.equal(r.native.creates, 0); assert.equal(r.hub.snapshot().status, 'READY');
    maximum = true; const created = await r.admit('sessionLane.continue', body, lane);
    assert.equal(created.receipt?.nativeConfiguration?.effectivePermission?.preset, 'YOLO');
    const changed = await r.admit('sessionLane.continue', { ...body, permission: 'READ_ONLY' }, lane);
    assert.equal(changed.receipt?.code, 'EXISTING_NATIVE_CONFIGURATION_IMMUTABLE'); assert.equal(r.native.creates, 1);
    maximum = false; const rejected = await r.admit('turn.submit', { text: 'not allowed after ceiling reduction' }, lane);
    assert.equal(rejected.receipt?.code, 'HOST_PERMISSION_CEILING_REJECTED'); assert.equal(r.native.turns, 0);
  } finally { r.close(); }
});
test('Stale native permission fails closed and final ceiling recheck prevents dispatch without replay', async () => {
  let allowed = true; const r = rig(undefined, undefined, () => allowed);
  try {
    const lane = await r.setup(), body = { model: 'fixture-model', reasoningEffort: 'fixture-reasoning', permission: 'YOLO' };
    const stale = await r.admit('sessionLane.continue', body, lane); assert.equal(stale.receipt?.code, 'STALE_PERMISSION_SELECTION'); assert.equal(r.native.creates, 0);
    r.native.catalog.permissions = permissionCapabilities(profiles); r.native.qualify = async () => { allowed = false; };
    const command = await r.make('sessionLane.continue', body, lane), result = await r.hub.execute(command, r.client);
    assert.equal(result.receipt?.code, 'HOST_PERMISSION_CEILING_CHANGED'); assert.equal(r.native.creates, 0);
    await r.hub.execute(command, r.client); assert.equal(r.native.creates, 0);
  } finally { r.close(); }
});

test('Permission transition journal binds Host, Workspace, session, prior state and observed permission', async () => {
  for (const preset of ['READ_ONLY', 'WORKSPACE_AUTO', 'YOLO'] as const) {
    const r = rig(undefined, undefined, () => true);
    try {
      r.native.catalog.permissions = permissionCapabilities(profiles); const lane = await r.setup();
      await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-reasoning', permission: preset }, lane);
      const rows = r.edgeJournal.db.prepare("SELECT kind,value FROM evidence WHERE kind LIKE 'PERMISSION_TRANSITION_%' ORDER BY seq").all();
      assert.deepEqual(rows.map(row => row.kind), ['PERMISSION_TRANSITION_REQUESTED', 'PERMISSION_TRANSITION_OBSERVED']);
      const requested = JSON.parse(String(rows[0]!.value)), observed = JSON.parse(String(rows[1]!.value));
      assert.equal(requested.hostId, r.identity.hostId); assert.deepEqual(requested.workspaceTarget, r.identity);
      assert.equal(requested.laneId, lane); assert.equal(requested.sessionId, r.hub.snapshot().lanes[0]!.sessionId);
      assert.equal(requested.previousEffectivePermission, null); assert.equal(requested.nativeThreadId, null);
      assert.equal(requested.requestedPermission, preset); assert.equal(requested.requestedNativeSettings.approvalPolicy, 'never');
      assert.equal(observed.nativeThreadId, r.native.threadId); assert.equal(observed.nativeInstanceId, r.native.instanceId);
      assert.equal(observed.observedEffectivePermission.preset, preset);
    } finally { r.close(); }
  }
});

test('Edge rejects malformed effective permission even when the driver reports the requested preset', async () => {
  const r = rig(undefined, undefined, () => true);
  try {
    r.native.catalog.permissions = permissionCapabilities(profiles); const lane = await r.setup();
    const create = r.native.create.bind(r.native);
    r.native.create = async (...args) => { const result = await create(...args); result.permission.network = 'native-unrestricted'; return result; };
    const result = await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-reasoning', permission: 'WORKSPACE_AUTO' }, lane);
    assert.equal(result.receipt?.code, 'NATIVE_PERMISSION_UNOBSERVED'); assert.equal(r.edge.blocked, 'NATIVE_PERMISSION_UNOBSERVED');
  } finally { r.close(); }
});
test('Exact file-change lifecycle projects compact activity; readonly and outside-root writes fail closed', async () => {
  for (const mode of ['valid', 'readonly', 'outside', 'wrong-turn'] as const) {
    const r = rig(undefined, undefined, () => true);
    try {
      r.native.catalog.permissions = permissionCapabilities(profiles); const lane = await r.setup();
      await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-reasoning', permission: mode === 'readonly' ? 'READ_ONLY' : 'WORKSPACE_AUTO' }, lane);
      await r.admit('turn.submit', { text: 'fixture edit' }, lane);
      const changes = [{ path: mode === 'outside' ? 'V:\\outside\\value.js' : 'V:\\disposable-fixture\\value.js', kind: { type: 'update' }, diff: '-1\n+2' }];
      const item = { type: 'fileChange', id: randomUUID(), changes, status: 'inProgress' };
      const params = { threadId: r.native.threadId, turnId: mode === 'wrong-turn' ? randomUUID() : r.native.turnId, item };
      r.native.signals.emit('signal', { method: 'item/started', params });
      if (mode !== 'valid') { assert.ok(r.edge.blocked); continue; }
      r.native.signals.emit('signal', { method: 'item/fileChange/patchUpdated', params: { threadId: r.native.threadId, turnId: r.native.turnId, itemId: item.id, changes } });
      r.native.signals.emit('signal', { method: 'item/fileChange/outputDelta', params: { threadId: r.native.threadId, turnId: r.native.turnId, itemId: item.id, delta: 'applied' } });
      r.native.signals.emit('signal', { method: 'item/completed', params: { ...params, item: { ...item, status: 'completed' } } });
      r.native.signals.emit('signal', { method: 'turn/diff/updated', params: { threadId: r.native.threadId, turnId: r.native.turnId, diff: '-1\n+2' } });
      assert.equal(r.edge.blocked, null); assert.deepEqual(r.hub.snapshot().lanes[0]!.activity.map(item => item.text), ['Editing file', 'File change completed']);
      r.native.signals.emit('signal', { method: 'item/completed', params: { ...params, item: { ...item, status: 'completed' } } }); assert.ok(r.edge.blocked);
    } finally { r.close(); }
  }
});
