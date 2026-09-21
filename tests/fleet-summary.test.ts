import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { startHub } from '../apps/hub/server.ts';
import type { Target } from '../packages/contracts/index.ts';

const target = (): Target => ({ authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() });

test('Gateway dashboard summary reports unknown/empty observations without inventing fleet facts', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve)); const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const token = randomBytes(32).toString('hex'); const hub = await startHub({ port, target: target(), root: 'V:\\summary-fixture', sid: 'fixture', principal: 'fixture', sessionId: 1, stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-summary-')), webDirectory: path.resolve('dist/web'), hcpToken: randomBytes(32).toString('hex'), bootstrapToken: token }); const origin = `http://127.0.0.1:${port}`;
  try {
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const clientResponse = await fetch(`${origin}/api/client`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: '{}' }); const client = await clientResponse.json() as { clientInstanceId: string; csrf: string };
    const headers = { Cookie: cookie, 'X-Fleet-Client': client.clientInstanceId, 'X-Fleet-Csrf': client.csrf };
    const summary = await (await fetch(`${origin}/api/fleet/summary`, { headers })).json();
    assert.equal(summary.gateway.status, 'unknown'); assert.deepEqual(summary.devices, []); assert.deepEqual(summary.runtimes, []); assert.equal(summary.sessions.discovered, 0); assert.deepEqual(summary.attention, [{ code: 'HOST_CONNECTION_UNKNOWN' }]);
    const identity = await (await fetch(`${origin}/api/auth/principal`, { headers })).json(); assert.equal(identity.mode, 'LOOPBACK_BOOTSTRAP'); assert.equal(identity.principal.issuer, 'loopback-development');
  } finally { await hub.close(); }
});
