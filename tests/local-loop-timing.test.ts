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
  }, 'DETERMINISTIC_TEST_ONLY');
  const sample = timer.latest('local_echo');
  assert.equal(sample?.durationMs, 2);
  assert.equal(sample?.claim, 'DETERMINISTIC_TEST_ONLY');
  assert.ok((sample?.durationMs ?? 999) < LOCAL_LOOP_TARGETS_MS.local_echo);
});

test('records bounded monotonic stages without inventing wall-clock guarantees', async () => {
  let now = 0;
  const timer = new LocalLoopTimer(() => now);
  timer.record('command_send', 0, 10, 'DETERMINISTIC_TEST_ONLY');
  timer.record('effect_dispatch', 10, 40, 'DETERMINISTIC_TEST_ONLY');
  timer.record('native_event_observed', 40, 55, 'DETERMINISTIC_TEST_ONLY');
  timer.record('hub_sse_emit', 55, 60, 'DETERMINISTIC_TEST_ONLY');
  timer.record('browser_receive_queue', 60, 65, 'DETERMINISTIC_TEST_ONLY');
  timer.markUnmeasured('browser_receive_render');
  timer.record('receipt', 80, 90, 'DETERMINISTIC_TEST_ONLY');
  await timer.measureAsync('final_reconciliation', async () => { now = 200; }, 'DETERMINISTIC_TEST_ONLY');
  const summary = timer.summary();
  assert.equal(summary.command_send, 10);
  assert.equal(summary.browser_receive_queue, 5);
  assert.equal(summary.browser_receive_render, 0);
  assert.equal(timer.latest('browser_receive_render')?.claim, 'UNMEASURED');
  assert.equal(summary.final_reconciliation, 200);
  assert.ok(summary.native_event_observed! <= LOCAL_LOOP_TARGETS_MS.native_event_to_ui);
  assert.ok(summary.browser_receive_queue! <= LOCAL_LOOP_TARGETS_MS.agent_delta_to_ui);
  assert.equal(timer.claimSummary().local_echo, null);
  assert.equal(timer.claimSummary().final_reconciliation, 'DETERMINISTIC_TEST_ONLY');
});
