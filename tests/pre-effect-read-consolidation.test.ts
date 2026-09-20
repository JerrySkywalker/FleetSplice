import assert from 'node:assert/strict';
import test from 'node:test';
import { createPerfAdoptionFixture } from './fixtures/perf-adoption-fixture.ts';

test('submit uses one final pre-effect readThread and one post-effect readThread', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 2, messagesPerTurn: 2 });
  await fx.attach();
  const before = await fx.adapter.snapshot({});
  fx.rpc.resetCalls();
  const receipt = await fx.execute(fx.command(before, 'native.submit', { text: 'consolidate submit' }));
  assert.equal(receipt.status, 'SUCCEEDED');
  const methods = fx.rpc.calls.map(c => c.method);
  const startIdx = methods.indexOf('turn/start');
  assert.ok(startIdx >= 0);
  const pre = methods.slice(0, startIdx);
  const post = methods.slice(startIdx + 1);
  assert.equal(pre.filter(m => m === 'thread/read').length, 1);
  assert.equal(post.filter(m => m === 'thread/read').length, 1);
  assert.deepEqual(pre, ['thread/loaded/list', 'thread/read', 'thread/turns/list']);
  fx.journal.close();
});

test('stale stateToken still rejects before effect with consolidated read', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
  await fx.attach();
  const old = await fx.adapter.snapshot({});
  fx.rpc.turns.unshift({
    id: 'external-turn',
    status: 'inProgress',
    items: [{ id: 'external-input', type: 'userMessage', content: [{ type: 'text', text: 'Local TUI input' }] }],
  });
  fx.rpc.thread.status.type = 'active';
  fx.rpc.resetCalls();
  const rejected = await fx.execute(fx.command(old, 'native.submit', { text: 'stale' }));
  assert.equal(rejected.status, 'REJECTED');
  assert.equal(rejected.code, 'NATIVE_STATE_ADVANCED_EXTERNALLY');
  assert.equal(fx.rpc.calls.filter(c => c.method === 'turn/start').length, 0);
  fx.journal.close();
});

test('ambiguous effect still closes admission without replay', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
  await fx.attach();
  const before = await fx.adapter.snapshot({});
  const original = fx.rpc.call.bind(fx.rpc);
  fx.rpc.call = async (method: string, params: any) => {
    if (method === 'turn/start') throw new Error('response lost');
    return original(method, params);
  };
  const first = await fx.execute(fx.command(before, 'native.submit', { text: 'lost' }));
  assert.equal(first.status, 'AMBIGUOUS_EFFECT');
  const snap = await fx.adapter.snapshot({});
  assert.equal(snap.state, 'NATIVE_EFFECT_UNKNOWN_NO_REPLAY');
  const second = await fx.execute(fx.command(snap, 'native.submit', { text: 'retry' }));
  assert.equal(second.status, 'REJECTED');
  fx.journal.close();
});
