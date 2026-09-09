import test from 'node:test';
import assert from 'node:assert/strict';
import { capabilityCatalog } from '../packages/driver-codex/index.ts';
import { NATIVE_POLICY_ARGS } from '../packages/driver-codex/policy.ts';
import { rig } from './helpers.ts';

test('P1 projects only the native catalog and sends its selected configuration to thread/start', async () => {
  const r = rig();
  try {
    await r.admit('workspace.register', { root: 'V:\\disposable-fixture' });
    const catalog = await r.admit('native.capabilities.read');
    assert.equal(catalog.receipt?.code, 'NATIVE_CAPABILITIES_READY');
    assert.deepEqual(catalog.receipt?.nativeCapabilities, r.native.catalog);
    assert.deepEqual(r.hub.snapshot().capabilities, r.native.catalog);
    assert.equal(r.native.capabilityReads, 1);

    const created = await r.admit('logicalSession.create', { title: 'fixture only' });
    const lane = created.plan.laneId!;
    await r.admit('sessionLane.acquireControl', {}, lane);
    const started = await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-deep' }, lane);
    assert.equal(started.receipt?.code, 'NATIVE_SESSION_READY');
    assert.deepEqual(r.native.lastConfiguration, { model: 'fixture-model', reasoningEffort: 'fixture-deep' });
    const observed = r.hub.snapshot().lanes.find(item => item.laneId === lane)!;
    assert.deepEqual([observed.requestedModel, observed.requestedReasoningEffort, observed.effectiveModel, observed.effectiveReasoningEffort], ['fixture-model', 'fixture-deep', 'fixture-model', 'fixture-deep']);
    assert.equal(r.native.capabilityReads, 2, 'new native sessions revalidate against the running native app-server');
  } finally { r.close(); }
});

test('P1 rejects removed models and unsupported reasoning without substitution or a native thread', async () => {
  for (const [body, code] of [
    [{ model: 'removed-model', reasoningEffort: 'fixture-reasoning' }, 'STALE_MODEL_SELECTION'],
    [{ model: 'fixture-model', reasoningEffort: 'removed-reasoning' }, 'STALE_REASONING_SELECTION'],
  ] as const) {
    const r = rig();
    try {
      const lane = await r.setup();
      const result = await r.admit('sessionLane.continue', body, lane);
      assert.equal(result.status, 'REJECTED'); assert.equal(result.receipt?.code, code);
      assert.equal(r.hub.status, 'READY'); assert.equal(r.hub.snapshot().lanes.find(item => item.laneId === lane)?.state, 'EMPTY');
      assert.equal(r.native.creates, 0); assert.equal(r.native.lastConfiguration, null);
    } finally { r.close(); }
  }
});

test('P1 projects native-observed configuration rather than fabricating the requested value', async () => {
  const r = rig();
  try {
    const lane = await r.setup();
    const create = r.native.create.bind(r.native);
    r.native.create = async (requestId, root, configuration, beforeEffect) => ({ ...(await create(requestId, root, configuration, beforeEffect)), model: 'native-observed-model', reasoningEffort: 'native-observed-effort' });
    await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-reasoning' }, lane);
    const observed = r.hub.snapshot().lanes.find(item => item.laneId === lane)!;
    assert.deepEqual([observed.requestedModel, observed.requestedReasoningEffort, observed.effectiveModel, observed.effectiveReasoningEffort], ['fixture-model', 'fixture-reasoning', 'native-observed-model', 'native-observed-effort']);
  } finally { r.close(); }
});

const commandItem = (id: string, status: 'inProgress' | 'completed' | 'failed' | 'declined' = 'inProgress', action: Record<string, unknown> = { type: 'read', command: 'Get-Content package.json', name: 'Get-Content', path: 'V:\\disposable-fixture\\package.json' }, source?: string) => ({ type: 'commandExecution', command: 'Get-Content package.json', cwd: 'V:\\disposable-fixture', id, status, commandActions: [action], ...(source === undefined ? {} : { source }) });
async function admittedReadOnlyTurn(r: ReturnType<typeof rig>): Promise<string> {
  const lane = await r.setup();
  await r.admit('sessionLane.continue', { model: 'fixture-model', reasoningEffort: 'fixture-reasoning' }, lane);
  await r.admit('turn.submit', { text: 'inspect only' }, lane);
  return lane;
}
const itemStarted = (r: ReturnType<typeof rig>, item: unknown, threadId: string = r.native.threadId, turnId: string = r.native.turnId) => r.native.signals.emit('signal', { method: 'item/started', params: { threadId, turnId, startedAtMs: 1, item } });
const itemCompleted = (r: ReturnType<typeof rig>, item: unknown, threadId: string = r.native.threadId, turnId: string = r.native.turnId) => r.native.signals.emit('signal', { method: 'item/completed', params: { threadId, turnId, completedAtMs: 2, item } });
const commandOutput = (r: ReturnType<typeof rig>, itemId: string, delta = 'x', threadId: string = r.native.threadId, turnId: string = r.native.turnId) => r.native.signals.emit('signal', { method: 'item/commandExecution/outputDelta', params: { threadId, turnId, itemId, delta } });

test('P1 correlates the installed commandExecution lifecycle and projects bounded activity only', async () => {
  const r = rig();
  try {
    const lane = await admittedReadOnlyTurn(r);
    // The live qualified server omits this schema-default `source: agent`.
    const item = commandItem('cmd-1');
    itemStarted(r, item);
    commandOutput(r, 'cmd-1', 'private native output is intentionally ignored');
    itemCompleted(r, { ...item, status: 'completed' });
    const search = commandItem('cmd-2', 'inProgress', { type: 'search', command: 'rg package apps', path: 'V:\\disposable-fixture', query: 'package' }, 'unifiedExecStartup');
    const list = commandItem('cmd-3', 'inProgress', { type: 'listFiles', command: 'Get-ChildItem', path: 'V:\\disposable-fixture' }, 'userShell');
    const unknown = commandItem('cmd-4', 'inProgress', { type: 'unknown', command: 'pwd' });
    for (const next of [search, list, unknown]) itemStarted(r, next);
    assert.equal(r.edge.blocked, null);
    assert.deepEqual(r.hub.snapshot().lanes.find(value => value.laneId === lane)?.activity.map(value => value.text), ['Reading package.json', 'Command completed', 'Searching .', 'Inspecting .', 'Running read-only command']);
  } finally { r.close(); }
});

test('P1 fails closed on contradictory, uncorrelated, malformed, and unsupported native observations', async () => {
  const cases: Array<{ name: string; emit: (r: ReturnType<typeof rig>) => void; code: string }> = [
    { name: 'wrong thread', emit: r => itemStarted(r, commandItem('cmd-1'), 'wrong-thread'), code: 'EXTERNAL_NATIVE_WRITER' },
    { name: 'wrong turn', emit: r => itemStarted(r, commandItem('cmd-1'), r.native.threadId, 'wrong-turn'), code: 'UNEXPECTED_NATIVE_TURN' },
    { name: 'completion for unknown item', emit: r => itemCompleted(r, commandItem('unknown', 'completed')), code: 'NATIVE_COMMAND_LIFECYCLE_INVALID' },
    { name: 'output for unknown item', emit: r => commandOutput(r, 'unknown'), code: 'NATIVE_COMMAND_LIFECYCLE_INVALID' },
    { name: 'malformed source', emit: r => itemStarted(r, commandItem('cmd-1', 'inProgress', undefined, 'invented-source')), code: 'NATIVE_TOOL_SCOPE_VIOLATION' },
    { name: 'missing required lifecycle timestamp', emit: r => r.native.signals.emit('signal', { method: 'item/started', params: { threadId: r.native.threadId, turnId: r.native.turnId, item: commandItem('cmd-1') } }), code: 'UNEXPECTED_NATIVE_TURN' },
    { name: 'file mutation item', emit: r => itemStarted(r, { type: 'fileChange' }), code: 'NATIVE_TOOL_SCOPE_VIOLATION' },
    { name: 'unknown item type', emit: r => itemStarted(r, { type: 'futureNativeTool' }), code: 'NATIVE_TOOL_SCOPE_VIOLATION' },
    { name: 'approval request', emit: r => r.native.signals.emit('signal', { method: 'item/commandExecution/requestApproval', requestId: 7, params: {} }), code: 'BLOCKED_UNSUPPORTED_APPROVAL' },
    { name: 'terminal interaction notification', emit: r => r.native.signals.emit('signal', { method: 'item/commandExecution/terminalInteraction', params: { threadId: r.native.threadId, turnId: r.native.turnId, itemId: 'cmd-1', processId: 'process-1', stdin: 'input' } }), code: 'NATIVE_TERMINAL_INTERACTION_UNSUPPORTED' },
  ];
  for (const scenario of cases) {
    const r = rig();
    try {
      await admittedReadOnlyTurn(r); scenario.emit(r);
      assert.equal(r.edge.blocked, scenario.code, scenario.name);
    } finally { r.close(); }
  }
});

test('P1 rejects duplicate lifecycle starts and lifecycle identity changes', async () => {
  for (const [name, emit] of [
    ['duplicate start', (r: ReturnType<typeof rig>) => { const item = commandItem('cmd-1'); itemStarted(r, item); itemStarted(r, item); }],
    ['changed completion item', (r: ReturnType<typeof rig>) => { const item = commandItem('cmd-1'); itemStarted(r, item); itemCompleted(r, { ...item, command: 'different command', status: 'completed' }); }],
    ['wrong output turn after valid start', (r: ReturnType<typeof rig>) => { const item = commandItem('cmd-1'); itemStarted(r, item); commandOutput(r, 'cmd-1', 'x', r.native.threadId, 'wrong-turn'); }],
    ['output after item completion', (r: ReturnType<typeof rig>) => { const item = commandItem('cmd-1'); itemStarted(r, item); itemCompleted(r, { ...item, status: 'completed' }); commandOutput(r, 'cmd-1', 'late'); }],
  ] as const) {
    const r = rig();
    try {
      await admittedReadOnlyTurn(r); emit(r);
      assert.equal(r.edge.blocked, 'NATIVE_COMMAND_LIFECYCLE_INVALID', name);
    } finally { r.close(); }
  }
});

test('P1 preserves native defaults and never enables workspace-write or YOLO', () => {
  const projected = capabilityCatalog({ data: [{ id: 'new-native-model', displayName: 'New native model', isDefault: true, supportedReasoningEfforts: [{ reasoningEffort: 'native-default', description: 'Native default' }, { reasoningEffort: 'native-deep', description: 'Native deep' }], defaultReasoningEffort: 'native-default' }] });
  assert.deepEqual(projected, { models: [{ id: 'new-native-model', displayName: 'New native model', isDefault: true, supportedReasoningEfforts: [{ reasoningEffort: 'native-default', description: 'Native default' }, { reasoningEffort: 'native-deep', description: 'Native deep' }], defaultReasoningEffort: 'native-default' }] });
  assert.ok(NATIVE_POLICY_ARGS.includes('sandbox_mode="read-only"'));
  assert.equal(NATIVE_POLICY_ARGS.some(value => /workspace-write|danger-full-access|yolo/i.test(value)), false);
});
