import test from 'node:test';
import assert from 'node:assert/strict';
import { foldTimeline, projectExecutionToTimeline, retireLiveWhenAuthoritative, timelineFromEvents } from '../packages/contracts/realtime-timeline.ts';
import type { AgentExecutionEvent } from '../packages/contracts/realtime-streams.ts';

const base = {
  eventId: 'e1', revision: '1', observedAt: '2026-09-17T00:00:00.000Z', sessionKey: 's',
  threadId: 't1', turnId: 'u1', stream: 'agent.execution' as const, trustLevel: 'NATIVE_STRUCTURED_API' as const,
};

test('folds deltas by exact itemId and never merges distinct assistant items in one turn', () => {
  let items = foldTimeline([], projectExecutionToTimeline({ ...base, kind: 'turn.started', payload: { status: 'RUNNING' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'a1', kind: 'message.delta', payload: { role: 'assistant', text: 'First', itemId: 'msg-a' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'a2', kind: 'message.final', payload: { role: 'assistant', text: 'First answer', itemId: 'msg-a' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 't1', kind: 'tool.started', payload: { toolId: 'tool-1', text: 'npm test', status: 'inProgress' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 't2', kind: 'tool.completed', payload: { toolId: 'tool-1', text: 'npm test', status: 'completed' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'b1', kind: 'message.delta', payload: { role: 'assistant', text: 'Second', itemId: 'msg-b' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'b2', kind: 'message.final', payload: { role: 'assistant', text: 'Second answer', itemId: 'msg-b' } })!);
  const assistants = items.filter(item => item.kind === 'message.final');
  assert.equal(assistants.length, 2);
  assert.deepEqual(assistants.map(item => item.itemId), ['msg-a', 'msg-b']);
  assert.deepEqual(assistants.map(item => item.text), ['First answer', 'Second answer']);
  assert.equal(items.filter(item => item.toolId === 'tool-1').length, 1);
});

test('message.final stays visible until authoritative history carries the same exact itemId', () => {
  let items = foldTimeline([], projectExecutionToTimeline({ ...base, eventId: 'd1', kind: 'message.delta', payload: { role: 'assistant', text: 'Hel', itemId: 'msg-1' } })!);
  items = foldTimeline(items, projectExecutionToTimeline({ ...base, eventId: 'f1', kind: 'message.final', payload: { role: 'assistant', text: 'Hello', itemId: 'msg-1' } })!);
  assert.equal(items.find(item => item.kind === 'message.final')?.text, 'Hello');
  // Delayed snapshot without identity must not retire by text equality.
  items = retireLiveWhenAuthoritative(items, [{ role: 'assistant', text: 'Hello', turnId: 'u1' }]);
  assert.equal(items.find(item => item.kind === 'message.final')?.itemId, 'msg-1');
  items = retireLiveWhenAuthoritative(items, [{ role: 'assistant', text: 'Hello', turnId: 'u1', itemId: 'msg-1' }]);
  assert.equal(items.some(item => item.kind === 'message.final'), false);
});

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
