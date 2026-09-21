import test from 'node:test';
import assert from 'node:assert/strict';
import { DeviceEnrollmentService } from '../packages/device-enrollment/index.ts';
import { generateHostEnrollmentKey, signEnrollmentChallenge } from '../packages/remote-enrollment/index.ts';
import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { WebSocket } from 'ws';
import { startHub } from '../apps/hub/server.ts';
import type { Target } from '../packages/contracts/index.ts';

test('Gateway enrollment requires explicit approval and never receives a private key', () => {
  const material = generateHostEnrollmentKey({ fleetId: 'fleet', hostId: 'host', environmentId: 'env', enrollmentGeneration: '1' });
  const service = new DeviceEnrollmentService();
  const requested = service.request({ hostName: 'SKYFORGE-01', identity: { fleetId: material.fleetId, hostId: material.hostId, environmentId: material.environmentId, enrollmentGeneration: material.enrollmentGeneration, publicKeySpkiPem: material.publicKeySpkiPem, publicFingerprint: material.publicFingerprint } });
  assert.equal(requested.state, 'PENDING'); assert.equal('privateKeyPkcs8Pem' in requested.identity, false);
  assert.equal(service.approve(requested.requestId).state, 'APPROVED');
  const challenge = service.issueChallenge(material.hostId); service.admitProof(material.hostId, signEnrollmentChallenge(material, challenge));
  assert.equal(service.projections()[0]!.lastSeen, 'CONNECTED_NOW'); assert.equal(service.revoke(requested.requestId).state, 'REVOKED');
});

test('approved device completes the Gateway HCP challenge without a bootstrap bearer', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve)); const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const target: Target = { authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() };
  const token = randomBytes(32).toString('hex'); const hub = await startHub({ port, target, root: 'V:\\device-fixture', sid: 'fixture', principal: 'fixture', sessionId: 1, stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-device-')), webDirectory: path.resolve('dist/web'), hcpToken: randomBytes(32).toString('hex'), bootstrapToken: token }); const origin = `http://127.0.0.1:${port}`;
  try {
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const client = await (await fetch(`${origin}/api/client`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: '{}' })).json() as { clientInstanceId: string; csrf: string };
    const material = generateHostEnrollmentKey({ fleetId: 'fleet', hostId: target.hostId, environmentId: target.environmentId, enrollmentGeneration: '1' }); const enrollment = { fleetId: material.fleetId, hostId: material.hostId, environmentId: material.environmentId, enrollmentGeneration: material.enrollmentGeneration, publicKeySpkiPem: material.publicKeySpkiPem, publicFingerprint: material.publicFingerprint };
    const requested = await (await fetch(`${origin}/api/devices/enroll`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ hostName: 'SKYFORGE-01', identity: enrollment }) })).json() as { requestId: string };
    const headers = { Origin: origin, Cookie: cookie, 'X-Fleet-Client': client.clientInstanceId, 'X-Fleet-Csrf': client.csrf, 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${origin}/api/devices/${requested.requestId}/approve`, { method: 'POST', headers, body: '{}' })).status, 200);
    await new Promise<void>((resolve, reject) => { const ws = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin }); ws.once('error', reject); ws.on('open', () => ws.send(JSON.stringify({ v: 1, kind: 'hello', connectionId: target.connectionId, target, identity: { principal: 'fixture', sid: 'fixture', sessionId: 1, elevated: false, root: 'V:\\device-fixture', rootIdentity: target.rootIdentity }, recovered: false, enrollment }))); ws.on('message', bytes => { const message = JSON.parse(String(bytes)); if (message.kind === 'enrollment.challenge') ws.send(JSON.stringify({ v: 1, kind: 'enrollment.proof', connectionId: target.connectionId, target, hostId: material.hostId, proof: signEnrollmentChallenge(material, message.challenge) })); if (message.kind === 'ready') { ws.close(); resolve(); } }); });
  } finally { await hub.close(); }
});

test('an approved enrolled carriage replaces a detached bootstrap carriage', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve)); const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const target: Target = { authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: 'b'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() };
  const bootstrapToken = randomBytes(32).toString('hex'); const hcpToken = randomBytes(32).toString('hex'); const hub = await startHub({ port, target, root: 'V:\\device-fixture', sid: 'fixture', principal: 'fixture', sessionId: 1, stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-device-replace-')), webDirectory: path.resolve('dist/web'), hcpToken, bootstrapToken }); const origin = `http://127.0.0.1:${port}`;
  const identity = { principal: 'fixture', sid: 'fixture', sessionId: 1, elevated: false as const, root: 'V:\\device-fixture', rootIdentity: target.rootIdentity };
  try {
    const material = generateHostEnrollmentKey({ fleetId: 'fleet', hostId: target.hostId, environmentId: target.environmentId, enrollmentGeneration: '1' }); const enrollment = { fleetId: material.fleetId, hostId: material.hostId, environmentId: material.environmentId, enrollmentGeneration: material.enrollmentGeneration, publicKeySpkiPem: material.publicKeySpkiPem, publicFingerprint: material.publicFingerprint };
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: bootstrapToken }) }); const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const client = await (await fetch(`${origin}/api/client`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: '{}' })).json() as { clientInstanceId: string; csrf: string };
    const request = await (await fetch(`${origin}/api/devices/enroll`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ hostName: 'SKYFORGE-01', identity: enrollment }) })).json() as { requestId: string };
    const headers = { Origin: origin, Cookie: cookie, 'X-Fleet-Client': client.clientInstanceId, 'X-Fleet-Csrf': client.csrf, 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${origin}/api/devices/${request.requestId}/approve`, { method: 'POST', headers, body: '{}' })).status, 200);
    await new Promise<void>((resolve, reject) => { const ws = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin, headers: { Authorization: `Bearer ${hcpToken}` } }); ws.once('error', reject); ws.on('open', () => ws.send(JSON.stringify({ v: 1, kind: 'hello', connectionId: target.connectionId, target, identity, recovered: false }))); ws.on('message', bytes => { if (JSON.parse(String(bytes)).kind === 'ready') { const detached = hub.waitForEdgeDetach(); ws.close(); void detached.then(resolve, reject); } }); });
    await new Promise<void>((resolve, reject) => { const ws = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin }); ws.once('error', reject); ws.on('open', () => ws.send(JSON.stringify({ v: 1, kind: 'hello', connectionId: target.connectionId, target, identity, recovered: false, enrollment }))); ws.on('message', bytes => { const message = JSON.parse(String(bytes)); if (message.kind === 'enrollment.challenge') ws.send(JSON.stringify({ v: 1, kind: 'enrollment.proof', connectionId: target.connectionId, target, hostId: material.hostId, proof: signEnrollmentChallenge(material, message.challenge) })); if (message.kind === 'ready') { ws.close(); resolve(); } }); });
  } finally { await hub.close(); }
});
