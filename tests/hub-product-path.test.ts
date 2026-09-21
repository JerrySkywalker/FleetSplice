import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { WebSocket } from 'ws';
import { startHub } from '../apps/hub/server.ts';
import { canonical, type Hcp, type Target } from '../packages/contracts/index.ts';

const target = (): Target => ({
  authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(),
  hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1',
  environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1',
  rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID(),
});

test('production Hub config selects RemoteAdoptionPortProxy over its HCP connection', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const value = target(); const bootstrapToken = randomBytes(32).toString('hex'); const hcpToken = randomBytes(32).toString('hex');
  const stateDirectory = path.resolve(`test-results/hub-product-path-${randomUUID()}`); mkdirSync(stateDirectory, { recursive: true });
  const hub = await startHub({
    port, target: value, root: 'V:\\product-path-fixture', sid: 'S-fixture', principal: 'fixture', sessionId: 1,
    stateDirectory, webDirectory: path.resolve('dist/web'), hcpToken, bootstrapToken,
    adoptionCarriage: { kind: 'REMOTE_ADOPTION', target: value, send: () => { throw new Error('HCP_NOT_CONNECTED'); } },
  });
  const origin = `http://127.0.0.1:${port}`;
  const socket = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin, headers: { Authorization: `Bearer ${hcpToken}` }, perMessageDeflate: false });
  try {
    await new Promise<void>((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    socket.send(canonical({ v: 1, kind: 'hello', connectionId: value.connectionId, target: value,
      identity: { principal: 'fixture', sid: 'S-fixture', sessionId: 1, elevated: false, root: 'V:\\product-path-fixture', rootIdentity: value.rootIdentity }, recovered: false } satisfies Hcp));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('HCP_READY_TIMEOUT')), 5000);
      socket.on('message', bytes => { const message = JSON.parse(String(bytes)); if (message.kind === 'ready') { clearTimeout(timer); resolve(); } });
    });
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ token: bootstrapToken }) });
    assert.equal(boot.status, 200); const cookie = boot.headers.get('set-cookie')!;
    const clientResponse = await fetch(`${origin}/api/client`, { method: 'POST', headers: { origin, cookie, 'content-type': 'application/json' }, body: '{}' });
    const client = await clientResponse.json() as { clientInstanceId: string; csrf: string };
    const mode = await fetch(`${origin}/api/mode`, { headers: { origin, cookie, 'x-fleet-client': client.clientInstanceId, 'x-fleet-csrf': client.csrf } });
    assert.deepEqual(await mode.json(), { mode: 'NATIVE_ADOPTION' });
  } finally {
    socket.close(); await hub.close();
  }
});
