import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCAL_LOOP_TARGETS_MS, LocalLoopTimer } from '../packages/contracts/local-loop-timing.ts';
import { createProvisional } from '../apps/web/optimistic-command.ts';

test('local echo presentation is recorded under the 50ms target in deterministic timer', () => {
  let now = 1000;
  const timer = new LocalLoopTimer(() => now);
  timer.measure('local_echo', () => {
    now += 2;
    return createProvisional('cmd', 'native.submit', 'hello', now);
  });
  const sample = timer.latest('local_echo');
  assert.equal(sample?.durationMs, 2);
  assert.ok((sample?.durationMs ?? 999) < LOCAL_LOOP_TARGETS_MS.local_echo);
});

test('records bounded monotonic stages without inventing wall-clock guarantees', async () => {
  let now = 0;
  const timer = new LocalLoopTimer(() => now);
  timer.record('command_send', 0, 10);
  timer.record('effect_dispatch', 10, 40);
  timer.record('native_event_observed', 40, 55);
  timer.record('hub_sse_emit', 55, 60);
  timer.record('browser_receive_render', 60, 80);
  timer.record('receipt', 80, 90);
  await timer.measureAsync('final_reconciliation', async () => { now = 200; });
  const summary = timer.summary();
  assert.equal(summary.command_send, 10);
  assert.equal(summary.browser_receive_render, 20);
  assert.equal(summary.final_reconciliation, 200);
  assert.ok(summary.native_event_observed! <= LOCAL_LOOP_TARGETS_MS.native_event_to_ui);
  assert.ok(summary.browser_receive_render! <= LOCAL_LOOP_TARGETS_MS.agent_delta_to_ui);
});
