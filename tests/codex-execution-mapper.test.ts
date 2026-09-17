import test from 'node:test';
import assert from 'node:assert/strict';
import { mapCodexNotification, CODEX_AGENT_RUNTIME_ADAPTER_ID } from '../packages/native-adoption/codex-execution-mapper.ts';
import { codexRuntimeDescriptor } from '../packages/native-adoption/codex-adapter.ts';
import type { Compatibility } from '../packages/native-adoption/types.ts';

const ctx = { sessionKey: 'runtime-1', revision: '7', observedAt: '2026-09-17T12:00:00.000Z', eventId: 'fixed-event' };

test('maps turn lifecycle without leaking raw method into payload', () => {
  const started = mapCodexNotification({ method: 'turn/started', params: { threadId: 't1', turn: { id: 'u1' } } }, ctx);
  assert.equal(started?.stream, 'agent.execution');
  assert.equal(started?.kind, 'turn.started');
  assert.equal(started?.payload.status, 'RUNNING');
  assert.equal((started?.adapterEvidence as any).method, 'turn/started');
  assert.equal('method' in (started?.payload ?? {}), false);

  const interrupted = mapCodexNotification({ method: 'turn/completed', params: { threadId: 't1', turn: { id: 'u1', status: 'interrupted' } } }, ctx);
  assert.equal(interrupted?.kind, 'turn.interrupted');
});

test('maps message deltas and finals from structured items', () => {
  const delta = mapCodexNotification({ method: 'item/agentMessage/delta', params: { threadId: 't1', turnId: 'u1', itemId: 'm1', delta: 'Hel' } }, ctx);
  assert.equal(delta?.kind, 'message.delta');
  assert.equal(delta?.payload.text, 'Hel');

  const finals = mapCodexNotification({ method: 'item/completed', params: { threadId: 't1', turnId: 'u1',
    item: { id: 'm1', type: 'agentMessage', text: 'Hello' } } }, ctx);
  assert.equal(finals?.kind, 'message.final');
  assert.equal(finals?.payload.text, 'Hello');
  assert.equal(finals?.payload.role, 'assistant');
});

test('maps tool lifecycle started/completed/failed', () => {
  const started = mapCodexNotification({ method: 'item/started', params: { threadId: 't1', turnId: 'u1',
    item: { id: 'c1', type: 'commandExecution', command: 'npm test', status: 'inProgress' } } }, ctx);
  assert.equal(started?.kind, 'tool.started');
  assert.equal(started?.payload.toolId, 'c1');

  const completed = mapCodexNotification({ method: 'item/completed', params: { threadId: 't1', turnId: 'u1',
    item: { id: 'c1', type: 'commandExecution', command: 'npm test', status: 'completed' } } }, ctx);
  assert.equal(completed?.kind, 'tool.completed');

  const failed = mapCodexNotification({ method: 'item/completed', params: { threadId: 't1', turnId: 'u1',
    item: { id: 'c1', type: 'commandExecution', command: 'npm test', status: 'failed' } } }, ctx);
  assert.equal(failed?.kind, 'tool.failed');
});

test('maps model and permission observations from thread settings', () => {
  const model = mapCodexNotification({ method: 'thread/settings/updated', params: { threadId: 't1', model: 'gpt-test' } }, ctx);
  assert.equal(model?.kind, 'model.observed');
  assert.equal(model?.payload.model, 'gpt-test');

  const permission = mapCodexNotification({ method: 'thread/status/changed', params: { threadId: 't1', permission: 'READ_ONLY' } }, ctx);
  assert.equal(permission?.kind, 'permission.observed');
});

test('maps approval requests and unsupported provider events', () => {
  const approval = mapCodexNotification({ id: 0, method: 'item/commandExecution/requestApproval',
    params: { threadId: 't1', turnId: 'u1', itemId: 'c1', command: 'rm -rf' } }, ctx);
  assert.equal(approval?.kind, 'approval.requested');
  assert.equal(approval?.payload.itemId, 'c1');

  const unsupported = mapCodexNotification({ method: 'item/reasoning/textDelta', params: { threadId: 't1', turnId: 'u1', delta: 'secret' } }, ctx);
  assert.equal(unsupported?.kind, 'unsupported');
  assert.equal('secret' in (unsupported?.payload ?? {}), false);
  assert.doesNotMatch(JSON.stringify(unsupported?.payload), /secret/);
});

test('ignores non-execution transport noise and never claims terminal scraping trust', () => {
  assert.equal(mapCodexNotification({ id: '1', result: {} }, ctx), null);
  const event = mapCodexNotification({ method: 'turn/started', params: { threadId: 't1', turn: { id: 'u1' } } }, ctx);
  assert.equal(event?.trustLevel, 'NATIVE_STRUCTURED_API');
  assert.equal(event?.adapterEvidence?.provider, CODEX_AGENT_RUNTIME_ADAPTER_ID);
});

test('Codex runtime descriptor projects capabilities without requiring every control', () => {
  const unavailable = { available: false, evidence: 'NOT_OBSERVED' };
  const compatibility: Compatibility = {
    profile: 'ADOPT_RESUME',
    observedAt: '2026-09-17T12:00:00.000Z',
    capabilities: {
      sharedDaemon: { available: true, evidence: 'ok' },
      threadList: { available: true, evidence: 'ok' },
      threadRead: { available: true, evidence: 'ok' },
      resume: { available: true, evidence: 'ok' },
      events: { available: true, evidence: 'ok' },
      turnStart: { available: true, evidence: 'ok' },
      activeTurn: { available: true, evidence: 'ok' },
      interrupt: unavailable,
      steer: unavailable,
      approvalObserve: unavailable,
      approvalResolve: unavailable,
      models: unavailable,
      effectiveState: unavailable,
    },
  };
  const descriptor = codexRuntimeDescriptor(compatibility);
  assert.equal(descriptor.runtimeKind, 'AgentRuntime');
  assert.equal(descriptor.adapterId, CODEX_AGENT_RUNTIME_ADAPTER_ID);
  assert.equal(descriptor.capabilities.find(item => item.feature === 'steer')?.available, false);
  assert.equal(descriptor.capabilities.find(item => item.feature === 'messageDelta')?.available, true);
});
