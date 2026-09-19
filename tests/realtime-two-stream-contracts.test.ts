import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isAgentExecutionEvent,
  isFleetControlEvent,
  observationMayAuthorizeEffect,
  type AgentExecutionEvent,
  type AgentRuntimeDescriptor,
  type FleetControlEvent,
  type InferenceProviderDescriptor,
  type RealtimeStreamEvent,
} from '../packages/contracts/realtime-streams.ts';

const envelope = {
  eventId: 'evt-1',
  revision: '1',
  observedAt: '2026-09-17T00:00:00.000Z',
  sessionKey: 'session-a',
  threadId: 'thread-a',
  turnId: 'turn-a',
};

test('AgentExecutionEvent and FleetControlEvent remain distinct streams', () => {
  const execution: AgentExecutionEvent = {
    ...envelope,
    stream: 'agent.execution',
    kind: 'message.delta',
    payload: { role: 'assistant', text: 'hello' },
    trustLevel: 'NATIVE_STRUCTURED_API',
  };
  const control: FleetControlEvent = {
    ...envelope,
    stream: 'fleet.control',
    kind: 'receipt',
    payload: { status: 'SUCCEEDED', code: 'OK' },
  };
  const events: RealtimeStreamEvent[] = [execution, control];
  assert.equal(isAgentExecutionEvent(events[0]!), true);
  assert.equal(isFleetControlEvent(events[0]!), false);
  assert.equal(isFleetControlEvent(events[1]!), true);
  assert.equal(isAgentExecutionEvent(events[1]!), false);
});

test('capability evidence does not assume every runtime supports steer/interrupt/approval', () => {
  const runtime: AgentRuntimeDescriptor = {
    runtimeKind: 'AgentRuntime',
    adapterId: 'example-adapter',
    capabilities: [
      { feature: 'messageFinal', available: true, evidence: 'structured finals observed', trustLevel: 'NATIVE_STRUCTURED_API' },
      { feature: 'messageDelta', available: false, evidence: 'delta streaming not offered', trustLevel: 'NATIVE_STRUCTURED_API' },
      { feature: 'steer', available: false, evidence: 'steer not offered by this runtime', trustLevel: 'NATIVE_STRUCTURED_API' },
      { feature: 'interrupt', available: false, evidence: 'interrupt not offered by this runtime', trustLevel: 'NATIVE_STRUCTURED_API' },
      { feature: 'approvalResolve', available: false, evidence: 'approval resolution not offered', trustLevel: 'NATIVE_STRUCTURED_API' },
    ],
  };
  assert.equal(runtime.runtimeKind, 'AgentRuntime');
  assert.equal(runtime.capabilities.find(item => item.feature === 'steer')?.available, false);
  assert.equal(runtime.capabilities.find(item => item.feature === 'approvalResolve')?.available, false);
});

test('AgentRuntime stays distinct from InferenceProvider', () => {
  const runtime: AgentRuntimeDescriptor = { runtimeKind: 'AgentRuntime', adapterId: 'codex-native', capabilities: [] };
  const inference: InferenceProviderDescriptor = { providerKind: 'InferenceProvider', providerId: 'example-model-host' };
  assert.notEqual(runtime.runtimeKind, inference.providerKind);
});

test('terminal scraping cannot authorize effects', () => {
  assert.equal(observationMayAuthorizeEffect('NATIVE_STRUCTURED_API'), true);
  assert.equal(observationMayAuthorizeEffect('OFFICIAL_HOOK_PLUGIN'), true);
  assert.equal(observationMayAuthorizeEffect('DURABLE_STRUCTURED_ARTIFACT'), true);
  assert.equal(observationMayAuthorizeEffect('TERMINAL_SCRAPING'), false);
});

test('FleetControlEvent includes provider-neutral external-state-advanced', () => {
  const control: FleetControlEvent = {
    ...envelope,
    stream: 'fleet.control',
    kind: 'external-state-advanced',
    payload: { reason: 'external_turn_started', externalAdvance: true },
  };
  assert.equal(isFleetControlEvent(control), true);
  assert.equal(control.kind, 'external-state-advanced');
  assert.equal('raw' in control.payload, false);
});

test('unsupported provider observations degrade without fabricating deltas', () => {
  const event: AgentExecutionEvent = {
    ...envelope,
    stream: 'agent.execution',
    kind: 'unsupported',
    payload: { reason: 'provider event not mapped' },
    trustLevel: 'NATIVE_STRUCTURED_API',
    adapterEvidence: { opaque: true },
  };
  assert.equal(event.kind, 'unsupported');
  assert.equal('text' in event.payload, false);
});

test('Core realtime contract source does not encode Codex RPC or ANSI assumptions', () => {
  const source = readFileSync(path.join('packages', 'contracts', 'realtime-streams.ts'), 'utf8');
  assert.doesNotMatch(source, /thread\/list|thread\/read|turn\/start|app-server|codex\.exe|\\x1b/i);
  assert.match(source, /AgentRuntime/);
  assert.match(source, /InferenceProvider/);
  assert.match(source, /TERMINAL_SCRAPING/);
});
