import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { request as httpRequest } from 'node:http';
import { WebSocket } from 'ws';
import { startHub } from '../apps/hub/server.ts';
import { target } from './helpers.ts';
import { canonical } from '../packages/contracts/index.ts';

test('loopback HTTP and HCP enforce distinct bootstrap, actor, Host, Origin, client and closed routes', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-http-'));
  const identity = target(); const token = randomBytes(32).toString('hex'); const hcpToken = randomBytes(32).toString('hex');
  const origin = `http://127.0.0.1:${port}`;
  const hub = await startHub({ port, target: identity, root: 'V:\\test', sid: 'fixture-sid', principal: 'fixture', sessionId: 1, stateDirectory: directory, webDirectory: path.resolve('dist/web'), hcpToken, bootstrapToken: token });
  let ws: WebSocket | undefined;
  try {
    assert.equal((await fetch(`${origin}/api/snapshot`)).status, 403);
    assert.equal((await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: 'https://evil.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })).status, 403);
    const wrongHost = await new Promise<number>(resolve => { const req = httpRequest(`${origin}/`, { headers: { Host: 'evil.invalid' } }, res => { res.resume(); resolve(res.statusCode!); }); req.end(); });
    assert.equal(wrongHost, 403);
    assert.equal((await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'é'.repeat(64) }) })).status, 403);
    const bootstrap = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    assert.equal(bootstrap.status, 200); const cookie = bootstrap.headers.get('set-cookie')!.split(';')[0]!;
    assert.match(bootstrap.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/);
    assert.equal((await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })).status, 403);
    const response = await fetch(`${origin}/api/client`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' });
    const client = await response.json() as any;
    assert.equal((await fetch(`${origin}/api/snapshot`, { headers: { Cookie: cookie } })).status, 403);
    const headers = { Cookie: cookie, 'X-Fleet-Client': client.clientInstanceId, 'X-Fleet-Csrf': client.csrf };
    assert.equal((await fetch(`${origin}/api/snapshot`, { headers })).status, 200);
    assert.equal((await fetch(`${origin}/api/native`, { method: 'POST', headers: { ...headers, Origin: origin, 'Content-Type': 'application/json' }, body: '{}' })).status, 404);
    const duplicate = await fetch(`${origin}/api/commands`, { method: 'POST', headers: { ...headers, Origin: origin, 'Content-Type': 'application/json' }, body: '{"v":1,"v":2}' });
    assert.equal((await duplicate.json() as any).error, 'DUPLICATE_KEY');
    for (const malformed of [token, 'é'.repeat(64)]) {
      const rejectedSocket = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin, headers: { Authorization: `Bearer ${malformed}` } });
      await new Promise<void>(resolve => rejectedSocket.once('error', () => resolve()));
      assert.equal(hub.kernel.status, 'CONNECTING');
      assert.equal((await fetch(`${origin}/api/snapshot`, { headers })).status, 200);
    }
    ws = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin, headers: { Authorization: `Bearer ${hcpToken}` }, perMessageDeflate: false });
    await new Promise<void>((resolve, reject) => { ws!.once('open', resolve); ws!.once('error', reject); });
    const ready = new Promise<any>(resolve => ws!.once('message', bytes => resolve(JSON.parse(String(bytes)))));
    ws.send(canonical({ v: 1, kind: 'hello', connectionId: identity.connectionId, target: identity, identity: { principal: 'fixture', sid: 'fixture-sid', sessionId: 1, elevated: false, root: 'V:\\test', rootIdentity: identity.rootIdentity }, recovered: false }));
    assert.equal((await ready).kind, 'ready'); assert.equal(hub.kernel.status, 'READY');
    const closed = new Promise<void>(resolve => ws!.once('close', () => resolve())); ws.send(Buffer.from('{}')); await closed;
    assert.notEqual(hub.kernel.status, 'READY');
  } finally { ws?.close(); await hub.close(); }
});
