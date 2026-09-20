import assert from 'node:assert/strict';
import test from 'node:test';
import { Fault } from '../packages/contracts/json.ts';
import { RECONNECT_GRACE_MS, ReconnectNoReplayCoordinator } from '../packages/reconnect/index.ts';

test('same authenticated client resumes within grace; fresh client starts viewer', () => {
  let now = 1_000_000;
  const coord = new ReconnectNoReplayCoordinator(() => now);
  const first = coord.registerClient({
    clientInstanceId: 'client-a',
    sessionBinding: 'bind-a',
    authenticatedAt: now,
  });
  assert.equal(first.role, 'viewer');
  coord.acknowledgeEdgeFence(0);
  coord.acquireUnownedLane('client-a');
  assert.equal(coord.registerClient({
    clientInstanceId: 'client-a',
    sessionBinding: 'bind-a',
    authenticatedAt: now,
  }).role, 'controller');

  now += RECONNECT_GRACE_MS - 1;
  assert.equal(coord.registerClient({
    clientInstanceId: 'client-a',
    sessionBinding: 'bind-a',
    authenticatedAt: now,
  }).role, 'controller');

  const fresh = coord.registerClient({
    clientInstanceId: 'client-b',
    sessionBinding: 'bind-b',
    authenticatedAt: now,
  });
  assert.equal(fresh.role, 'viewer');
  assert.throws(() => coord.acquireUnownedLane('client-b'), /CONTROLLER_OWNED_TAKEOVER_IS_G07/);
});

test('unowned lane acquire requires Edge fence acknowledgement', () => {
  const coord = new ReconnectNoReplayCoordinator();
  coord.registerClient({ clientInstanceId: 'v1', sessionBinding: 'b', authenticatedAt: 1 });
  assert.throws(() => coord.acquireUnownedLane('v1'), /EDGE_FENCE_ACK_REQUIRED/);
  coord.acknowledgeEdgeFence(0);
  const lane = coord.acquireUnownedLane('v1');
  assert.equal(lane.controllerClientId, 'v1');
  assert.equal(lane.fence, 1);
});

test('response loss recovers by commandId lookup and never replays', () => {
  const coord = new ReconnectNoReplayCoordinator();
  const receipt = { commandId: 'c1', status: 'SUCCEEDED' };
  coord.rememberReceipt('c1', receipt);
  assert.deepEqual(coord.recoverLostResponse('c1'), receipt);
  assert.deepEqual(coord.rememberReceipt('c1', receipt), receipt);
  assert.throws(() => coord.rememberReceipt('c1', { commandId: 'c1', status: 'REJECTED' }), /NATIVE_COMMAND_ID_CONFLICT/);
  assert.throws(() => coord.recoverLostResponse('missing'), /COMMAND_UNKNOWN_NO_REPLAY/);
});

test('realtime cursor gap requires explicit resync; Edge disconnect is not guessed stopped', () => {
  const coord = new ReconnectNoReplayCoordinator();
  assert.equal(coord.advanceRealtime('0'), '0');
  assert.equal(coord.advanceRealtime('1'), '1');
  assert.throws(() => coord.advanceRealtime('5'), /RESYNC_REQUIRED/);
  coord.setEdgeConnected(false);
  assert.deepEqual(coord.projectionHonesty(), { state: 'EDGE_STALE_OR_UNKNOWN', guessStopped: false });
  coord.markColdStart();
  assert.deepEqual(coord.projectionHonesty(), { state: 'RECOVERY_REQUIRED', guessStopped: false });
  assert.throws(() => coord.registerClient({
    clientInstanceId: 'x', sessionBinding: 'y', authenticatedAt: 1,
  }), /RECOVERY_REQUIRED/);
});

test('stale client/generation style fence mismatch rejects', () => {
  const coord = new ReconnectNoReplayCoordinator();
  assert.throws(() => coord.acknowledgeEdgeFence(3), /STALE_EDGE_FENCE/);
  assert.ok(Fault);
});
