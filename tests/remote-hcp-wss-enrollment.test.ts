import assert from 'node:assert/strict';
import test from 'node:test';
import { WebSocket } from 'ws';
import {
  generateHostEnrollmentKey,
  issueEnrollmentChallenge,
  signEnrollmentChallenge,
  verifyEnrollmentProof,
  HostEnrollmentRegistry,
} from '../packages/remote-enrollment/index.ts';
import {
  createEphemeralTlsMaterial,
  startEphemeralHcpWssServer,
  connectEphemeralHcpWss,
  REMOTE_ENROLLED_WSS,
} from '../packages/remote-transport/index.ts';

test('Ed25519 host enrollment challenge/signature and stale generation reject', () => {
  const material = generateHostEnrollmentKey({
    fleetId: 'fleet-1', hostId: 'host-1', environmentId: 'env-1', enrollmentGeneration: '1',
  });
  const publicIdentity = {
    fleetId: material.fleetId,
    hostId: material.hostId,
    environmentId: material.environmentId,
    enrollmentGeneration: material.enrollmentGeneration,
    publicKeySpkiPem: material.publicKeySpkiPem,
    publicFingerprint: material.publicFingerprint,
  };
  const registry = new HostEnrollmentRegistry();
  registry.enroll(publicIdentity);
  const challenge = issueEnrollmentChallenge(publicIdentity);
  const proof = signEnrollmentChallenge(material, challenge);
  verifyEnrollmentProof(challenge, proof);

  const stale = generateHostEnrollmentKey({
    fleetId: 'fleet-1', hostId: 'host-1', environmentId: 'env-1', enrollmentGeneration: '0',
  });
  assert.throws(() => registry.enroll({
    fleetId: stale.fleetId, hostId: stale.hostId, environmentId: stale.environmentId,
    enrollmentGeneration: stale.enrollmentGeneration, publicKeySpkiPem: stale.publicKeySpkiPem,
    publicFingerprint: stale.publicFingerprint,
  }), /STALE_ENROLLMENT_GENERATION/);

  const wrong = generateHostEnrollmentKey({
    fleetId: 'fleet-1', hostId: 'host-1', environmentId: 'env-1', enrollmentGeneration: '1',
  });
  assert.throws(() => signEnrollmentChallenge(wrong, challenge), /ENROLLMENT_IDENTITY_MISMATCH/);
});

test('manual revoke and re-enroll primitives', () => {
  const first = generateHostEnrollmentKey({
    fleetId: 'fleet-1', hostId: 'host-1', environmentId: 'env-1', enrollmentGeneration: '1',
  });
  const identity = {
    fleetId: first.fleetId, hostId: first.hostId, environmentId: first.environmentId,
    enrollmentGeneration: first.enrollmentGeneration, publicKeySpkiPem: first.publicKeySpkiPem,
    publicFingerprint: first.publicFingerprint,
  };
  const registry = new HostEnrollmentRegistry();
  registry.enroll(identity);
  registry.revoke(identity);
  assert.throws(() => registry.requireActive(identity), /ENROLLMENT_REVOKED/);
  const second = generateHostEnrollmentKey({
    fleetId: 'fleet-1', hostId: 'host-1', environmentId: 'env-1', enrollmentGeneration: '2',
  });
  const next = {
    fleetId: second.fleetId, hostId: second.hostId, environmentId: second.environmentId,
    enrollmentGeneration: second.enrollmentGeneration, publicKeySpkiPem: second.publicKeySpkiPem,
    publicFingerprint: second.publicFingerprint,
  };
  registry.enroll(next);
  registry.requireActive(next);
});

test('REMOTE_ENROLLED_WSS accepts Edge-initiated TLS and rejects wrong hostname', async () => {
  const tls = createEphemeralTlsMaterial('localhost');
  assert.equal(REMOTE_ENROLLED_WSS.compression, false);
  assert.equal(REMOTE_ENROLLED_WSS.maxPayload, 262144);
  let opened = false;
  const server = await startEphemeralHcpWssServer({
    tls,
    onConnection: ws => { opened = true; ws.close(); },
  });
  try {
    const ws = connectEphemeralHcpWss({ port: server.port, tls, expectedHostname: 'localhost' });
    await new Promise<void>((resolve, reject) => {
      ws.once('open', () => resolve());
      ws.once('error', reject);
    });
    assert.equal(opened, true);
    ws.close();
    assert.throws(() => connectEphemeralHcpWss({
      port: server.port, tls, expectedHostname: 'wrong.example',
    }), /TLS_HOSTNAME_MISMATCH/);
  } finally {
    await server.close();
  }
});

test('duplicate active Edge connection fails closed', async () => {
  const tls = createEphemeralTlsMaterial('localhost');
  const sockets: WebSocket[] = [];
  const server = await startEphemeralHcpWssServer({
    tls,
    activeEdgeLimit: 1,
    onConnection: ws => { sockets.push(ws); },
  });
  try {
    const first = connectEphemeralHcpWss({ port: server.port, tls, expectedHostname: 'localhost' });
    await new Promise<void>((resolve, reject) => {
      first.once('open', () => resolve());
      first.once('error', reject);
    });
    const second = connectEphemeralHcpWss({ port: server.port, tls, expectedHostname: 'localhost' });
    const outcome = await new Promise<'open' | 'error'>(resolve => {
      second.once('open', () => resolve('open'));
      second.once('unexpected-response', () => resolve('error'));
      second.once('error', () => resolve('error'));
      setTimeout(() => resolve('error'), 2000);
    });
    assert.equal(outcome, 'error');
    first.close();
    second.terminate();
  } finally {
    for (const ws of sockets) ws.close();
    await server.close();
  }
});
