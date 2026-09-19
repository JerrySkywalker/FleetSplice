import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { foldTimeline, projectExecutionToTimeline } from '../packages/contracts/realtime-timeline.ts';
import type { AgentExecutionEvent } from '../packages/contracts/realtime-streams.ts';
import { AuthoritativeReconcileScheduler } from '../apps/web/reconcile-scheduler.ts';
import { classifyRealtimeRefresh, shouldUpdateLiveTimeline } from '../apps/web/realtime-refresh-policy.ts';

const base = {
  eventId: 'e0',
  revision: '1',
  observedAt: '2026-09-19T00:00:00.000Z',
  sessionKey: 'session',
  threadId: 'thread-1',
  turnId: 'turn-1',
  stream: 'agent.execution' as const,
  trustLevel: 'NATIVE_STRUCTURED_API' as const,
  payload: {} as Record<string, unknown>,
};

function envelope(kind: string, stream: 'agent.execution' | 'fleet.control' = 'agent.execution') {
  return { stream, kind };
}

test('Agent Execution message/tool events are live-only; turn terminal schedules reconcile', () => {
  for (const kind of ['message.delta', 'message.final', 'tool.started', 'tool.updated', 'tool.completed', 'tool.failed', 'turn.started']) {
    assert.deepEqual(classifyRealtimeRefresh(envelope(kind)), { mode: 'live_only' });
  }
  for (const kind of ['turn.completed', 'turn.interrupted', 'turn.failed']) {
    assert.deepEqual(classifyRealtimeRefresh(envelope(kind)), { mode: 'schedule_reconcile', reason: 'turn.final' });
  }
});

test('Fleet Control external-state-advanced and authority events schedule reconcile', () => {
  assert.deepEqual(
    classifyRealtimeRefresh(envelope('external-state-advanced', 'fleet.control')),
    { mode: 'schedule_reconcile', reason: 'fleet.control' },
  );
  for (const kind of ['controller.changed', 'fence.advanced', 'recovery.required', 'reconnect', 'incarnation.changed']) {
    assert.deepEqual(
      classifyRealtimeRefresh(envelope(kind, 'fleet.control')),
      { mode: 'schedule_reconcile', reason: 'fleet.control' },
    );
  }
});

test('reconcile scheduler coalesces bursts and retains one dirty follow-up', async () => {
  const calls: number[] = [];
  const gates: Array<() => void> = [];
  const scheduler = new AuthoritativeReconcileScheduler(async () => {
    calls.push(Date.now());
    await new Promise<void>(resolve => { gates.push(resolve); });
  }, { debounceMs: 5 });

  scheduler.schedule('fleet.control');
  scheduler.schedule('fleet.control');
  scheduler.schedule('turn.final');
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls.length, 1);
  assert.equal(gates.length, 1);
  scheduler.schedule('fleet.control');
  scheduler.schedule('turn.final');
  gates[0]!();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls.length, 2);
  assert.equal(gates.length, 2);
  gates[1]!();
  await scheduler.whenIdle();
  assert.equal(calls.length, 2);
  scheduler.dispose();
});

test('synthetic Web-owned turn keeps realtime-event snapshot fanout <= 2', async () => {
  let snapshots = 0;
  const scheduler = new AuthoritativeReconcileScheduler(async () => { snapshots += 1; }, { debounceMs: 5 });
  let timeline: ReturnType<typeof foldTimeline> = [];

  const sequence: AgentExecutionEvent[] = [
    { ...base, eventId: 't0', kind: 'turn.started', payload: { status: 'RUNNING' } },
    ...Array.from({ length: 12 }, (_, i) => ({
      ...base, eventId: `d${i}`, kind: 'message.delta' as const,
      payload: { role: 'assistant', text: `chunk-${i}`, itemId: 'msg-1' },
    })),
    { ...base, eventId: 'tool-s', kind: 'tool.started', payload: { toolId: 'c1', text: 'git rev-parse --short HEAD', status: 'inProgress' } },
    { ...base, eventId: 'tool-c', kind: 'tool.completed', payload: { toolId: 'c1', text: 'git rev-parse --short HEAD', status: 'completed' } },
    { ...base, eventId: 'final', kind: 'message.final', payload: { role: 'assistant', text: 'OWNER_WEB_PHASE_B', itemId: 'msg-1' } },
    { ...base, eventId: 'tdone', kind: 'turn.completed', payload: { status: 'COMPLETED' } },
  ];

  for (const event of sequence) {
    const decision = classifyRealtimeRefresh(event);
    if (shouldUpdateLiveTimeline(event)) {
      const item = projectExecutionToTimeline(event);
      if (item) timeline = foldTimeline(timeline, item);
    }
    if (decision.mode === 'schedule_reconcile') scheduler.schedule(decision.reason);
  }

  await scheduler.whenIdle();
  assert.ok(timeline.some(item => item.kind === 'message.delta' || item.kind === 'message.final'));
  assert.ok(timeline.some(item => item.kind.startsWith('tool.')));
  assert.ok(snapshots >= 1, 'terminal turn must reconcile');
  assert.ok(snapshots <= 2, `realtime-event snapshot fanout was ${snapshots}, expected <= 2`);
  scheduler.dispose();
});

test('explicit external-state-advanced prompts authoritative reconcile without auto-clearing gate', async () => {
  let snapshots = 0;
  const scheduler = new AuthoritativeReconcileScheduler(async () => { snapshots += 1; }, { debounceMs: 5 });
  const decision = classifyRealtimeRefresh(envelope('external-state-advanced', 'fleet.control'));
  assert.equal(decision.mode, 'schedule_reconcile');
  scheduler.schedule(decision.mode === 'schedule_reconcile' ? decision.reason : 'fleet.control');
  await scheduler.whenIdle();
  assert.equal(snapshots, 1);
  // Repeated notifications coalesce into one additional refresh at most.
  scheduler.schedule('fleet.control');
  scheduler.schedule('fleet.control');
  scheduler.schedule('fleet.control');
  await scheduler.whenIdle();
  assert.equal(snapshots, 2);
  scheduler.dispose();
});

test('fallback refresh path remains available on the scheduler', async () => {
  let snapshots = 0;
  const scheduler = new AuthoritativeReconcileScheduler(async () => { snapshots += 1; }, { debounceMs: 5 });
  scheduler.schedule('fallback');
  await scheduler.whenIdle();
  assert.equal(snapshots, 1);
  scheduler.dispose();
});

test('NativeAdoption source no longer refreshes on every SSE message', () => {
  const source = readFileSync(path.join('apps', 'web', 'NativeAdoption.tsx'), 'utf8');
  assert.match(source, /classifyRealtimeRefresh/);
  assert.match(source, /AuthoritativeReconcileScheduler/);
  assert.match(source, /schedule\('fallback'\)/);
  assert.doesNotMatch(source, /onmessage[\s\S]{0,800}void refresh\(\)/);
});
