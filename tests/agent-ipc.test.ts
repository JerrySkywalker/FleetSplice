import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_IPC_MAX_BYTES, AGENT_IPC_VERSION, parseAgentIpcRequest, validateAgentConfiguration } from '../packages/agent-ipc/index.ts';

test('Agent IPC is versioned, strict, bounded and has no network transport shape', () => {
  assert.equal(AGENT_IPC_VERSION, 1); assert.equal(AGENT_IPC_MAX_BYTES, 8192);
  const request = parseAgentIpcRequest({ v: 1, token: 'a'.repeat(64), command: 'diagnostics' });
  assert.equal(request.command, 'diagnostics');
  assert.throws(() => parseAgentIpcRequest({ token: 'a'.repeat(64), command: 'status' }), /AGENT_IPC_REQUEST_INVALID/);
  assert.throws(() => parseAgentIpcRequest({ v: 1, token: 'a'.repeat(64), command: 'status', endpoint: 'http://127.0.0.1' }), /AGENT_IPC_REQUEST_INVALID/);
});

test('Agent configuration accepts credential-free Gateway URLs only', () => {
  assert.deepEqual(validateAgentConfiguration({ gatewayUrl: null }), { gatewayUrl: null });
  assert.deepEqual(validateAgentConfiguration({ gatewayUrl: 'https://fleet.example' }), { gatewayUrl: 'https://fleet.example' });
  assert.throws(() => validateAgentConfiguration({ gatewayUrl: 'https://owner:secret@fleet.example' }), /AGENT_GATEWAY_URL_INVALID/);
  assert.throws(() => validateAgentConfiguration({ gatewayUrl: 'ssh://fleet.example' }), /AGENT_GATEWAY_URL_INVALID/);
});
