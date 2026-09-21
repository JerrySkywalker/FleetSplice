import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDeploymentProfile } from '../packages/deployment/index.ts';

test('loopback profile derives HTTP and WS discovery from one Gateway URL', () => {
  const value = resolveDeploymentProfile({ kind: 'LOOPBACK', publicBaseUrl: 'http://127.0.0.1:43155' });
  assert.deepEqual(value.discovery, { version: 1, profile: 'LOOPBACK', apiBaseUrl: 'http://127.0.0.1:43155/api/', realtimeUrl: 'http://127.0.0.1:43155/api/events', hcpUrl: 'ws://127.0.0.1:43155/hcp/v1/connect', loginUrl: 'http://127.0.0.1:43155/auth/login', enrollment: { supported: true, url: 'http://127.0.0.1:43155/api/devices/enroll', keyType: 'Ed25519' } });
});

test('public profile is HTTPS/WSS only and rejects ambiguous URLs', () => {
  const value = resolveDeploymentProfile({ kind: 'PUBLIC_HTTPS', publicBaseUrl: 'https://fleet.example' });
  assert.equal(value.discovery.hcpUrl, 'wss://fleet.example/hcp/v1/connect');
  assert.throws(() => resolveDeploymentProfile({ kind: 'PUBLIC_HTTPS', publicBaseUrl: 'http://fleet.example' }), /DEPLOYMENT_BASE_URL_INVALID/);
  assert.throws(() => resolveDeploymentProfile({ kind: 'LOOPBACK', publicBaseUrl: 'http://owner:secret@127.0.0.1:43155' }), /DEPLOYMENT_BASE_URL_INVALID/);
});
