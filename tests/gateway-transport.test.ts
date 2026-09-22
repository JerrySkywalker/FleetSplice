import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { request } from 'node:https';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
import { startHub } from '../apps/hub/server.ts';
import { resolveEdgeHcpEndpoint } from '../apps/edge/main.ts';
import { createEphemeralTlsMaterial } from '../packages/remote-transport/index.ts';
import type { Target } from '../packages/contracts/index.ts';

const target = (): Target => ({ authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() });

async function vacantPort() {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve())); return port;
}

test('product Gateway serves declared HTTPS/WSS identity while binding separately', async () => {
  const port = await vacantPort(); const tls = createEphemeralTlsMaterial(); const identity = target(); const hcpToken = randomBytes(32).toString('hex');
  const hub = await startHub({ port, target: identity, root: 'V:\\transport-fixture', sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-gateway-transport-')), webDirectory: path.resolve('dist/web'), hcpToken, bootstrapToken: randomBytes(32).toString('hex'),
    deployment: { kind: 'PUBLIC_HTTPS', publicBaseUrl: `https://localhost:${port}` }, listener: { host: '127.0.0.1', tls } });
  try {
    const discovery = await new Promise<any>((resolve, reject) => {
      const req = request({ hostname: 'localhost', port, path: '/.well-known/fleetsplice', ca: tls.certPem, servername: 'localhost', headers: { host: `localhost:${port}` } }, res => {
        const chunks: Buffer[] = []; res.on('data', chunk => chunks.push(chunk)); res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
      }); req.on('error', reject); req.end();
    });
    assert.equal(discovery.hcpUrl, `wss://localhost:${port}/hcp/v1/connect`);
    const socket = new WebSocket(discovery.hcpUrl, 'fleetsplice.hcp.v1', { ca: tls.certPem, rejectUnauthorized: true, perMessageDeflate: false, origin: `https://localhost:${port}`, headers: { Authorization: `Bearer ${hcpToken}` } });
    await new Promise<void>((resolve, reject) => {
      socket.once('open', () => socket.send(JSON.stringify({ v: 1, kind: 'hello', connectionId: identity.connectionId, target: identity, identity: { principal: 'fixture', sid: 'fixture', sessionId: 1, elevated: false, root: 'V:\\transport-fixture', rootIdentity: identity.rootIdentity }, recovered: false })));
      socket.on('message', bytes => { if (JSON.parse(String(bytes)).kind === 'ready') { socket.close(); resolve(); } }); socket.once('error', reject);
    });
  } finally { await hub.close(); }
});

test('Edge endpoint rejects public cleartext and preserves strict TLS verification', () => {
  const local = resolveEdgeHcpEndpoint({ port: 43155 });
  assert.equal(local.url, 'ws://127.0.0.1:43155/hcp/v1/connect');
  assert.equal(local.options.origin, 'http://127.0.0.1:43155');
  assert.throws(() => resolveEdgeHcpEndpoint({ port: 43155, hcpUrl: 'ws://fleet.example/hcp/v1/connect' }), /EDGE_HCP_ENDPOINT_MUST_BE_WSS/);
  assert.throws(() => resolveEdgeHcpEndpoint({ port: 43155, hcpUrl: 'ws://localhost/hcp/v1/connect', testTlsCaPem: 'test' }), /EDGE_TEST_TLS_CA_REQUIRES_WSS/);
  const endpoint = resolveEdgeHcpEndpoint({ port: 43155, hcpUrl: 'wss://fleet.example/hcp/v1/connect' });
  assert.equal(endpoint.url, 'wss://fleet.example/hcp/v1/connect'); assert.equal(endpoint.options.rejectUnauthorized, true);
});
