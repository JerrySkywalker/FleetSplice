import test from 'node:test';
import assert from 'node:assert/strict';
import { foldTimeline, projectExecutionToTimeline, timelineFromEvents } from '../packages/contracts/realtime-timeline.ts';
import type { AgentExecutionEvent } from '../packages/contracts/realtime-streams.ts';

const base = {
  eventId: 'e1', revision: '1', observedAt: '2026-09-17T00:00:00.000Z', sessionKey: 's',
  threadId: 't1', turnId: 'u1', stream: 'agent.execution' as const, trustLevel: 'NATIVE_STRUCTURED_API' as const,
};

test('projects turn start, message delta/final, and tool lifecycle', () => {
  const turn = projectExecutionToTimeline({ ...base, kind: 'turn.started', payload: { status: 'RUNNING' } });
  assert.equal(turn?.kind, 'turn.started');
  const delta = projectExecutionToTimeline({ ...base, eventId: 'e2', kind: 'message.delta', payload: { role: 'assistant', text: 'Hel' } });
  assert.equal(delta?.text, 'Hel');
  const tool = projectExecutionToTimeline({ ...base, eventId: 'e3', kind: 'tool.started', payload: { toolId: 'c1', text: 'npm test', status: 'inProgress' } });
  assert.equal(tool?.toolId, 'c1');
});

test('folds deltas, replaces with finals, updates tools, and ignores late duplicates by eventId', () => {
  let items = foldTimeline([], projectExecutionToTimeline({ ...base, kind: 'turn.started', payload: { status: 'RUNNING' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'd1', kind: 'message.delta', payload: { role: 'assistant', text: 'Hel' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'd2', kind: 'message.delta', payload: { role: 'assistant', text: 'lo' } })!);
  assert.equal(items.filter(item => item.kind === 'message.delta').length, 1);
  assert.equal(items.find(item => item.kind === 'message.delta')?.text, 'Hello');
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'f1', kind: 'message.final', payload: { role: 'assistant', text: 'Hello' } })!);
  assert.equal(items.some(item => item.kind === 'message.delta'), false);
  assert.equal(items.find(item => item.kind === 'message.final')?.text, 'Hello');
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'c1', kind: 'tool.started', payload: { toolId: 'tool-1', text: 'sleep', status: 'inProgress' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'c2', kind: 'tool.completed', payload: { toolId: 'tool-1', text: 'sleep', status: 'completed' } })!);
  assert.equal(items.filter(item => item.toolId === 'tool-1').length, 1);
  assert.equal(items.find(item => item.toolId === 'tool-1')?.kind, 'tool.completed');
  const before = items.length;
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'f1', kind: 'message.final', payload: { role: 'assistant', text: 'Hello' } })!);
  assert.equal(items.length, before);
});

test('interrupt completion and unsupported events degrade without fabricating deltas', () => {
  const events: AgentExecutionEvent[] = [
    { ...base, kind: 'turn.started', payload: { status: 'RUNNING' } },
    { ...base, eventId: 'e2', kind: 'turn.interrupted', payload: { status: 'interrupted' } },
    { ...base, eventId: 'e3', kind: 'unsupported', payload: { reason: 'no deltas' } },
  ];
  const items = timelineFromEvents(events);
  assert.deepEqual(items.map(item => item.kind), ['turn.started', 'turn.interrupted']);
  assert.equal(items.every(item => item.ephemeral === true), true);
});
