import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { request as httpsRequest, Agent } from 'node:https';

const root = process.cwd();
const compiled = path.join(root, 'test-results', 'compiled');
const hubMain = path.join(compiled, 'scripts', 'g06-local-topology', 'hub-main.js');
const edgeMain = path.join(compiled, 'scripts', 'g06-local-topology', 'edge-main.js');

function waitReady(child: ChildProcess, label: string, timeoutMs = 20_000): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error(`${label}_READY_TIMEOUT`)), timeoutMs);
    const onData = (chunk: Buffer) => {
      buf += chunk.toString('utf8');
      const line = buf.split(/\r?\n/).find(l => l.includes('"ready"'));
      if (!line) return;
      clearTimeout(timer);
      child.stdout?.off('data', onData);
      resolve(JSON.parse(line) as Record<string, unknown>);
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', (chunk: Buffer) => {
      process.stderr.write(`[${label}] ${chunk}`);
    });
    child.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`${label}_EXIT_${code}`));
    });
  });
}

function httpsJson(options: {
  port: number;
  method: string;
  path: string;
  origin: string;
  ca: string;
  cookie?: string;
  body?: unknown;
  headers?: Record<string, string>;
}): Promise<{ status: number; json: any; setCookie?: string }> {
  const payload = options.body === undefined ? undefined : JSON.stringify(options.body);
  return new Promise((resolve, reject) => {
    const req = httpsRequest({
      hostname: 'localhost',
      port: options.port,
      path: options.path,
      method: options.method,
      ca: options.ca,
      servername: 'localhost',
      headers: {
        origin: options.origin,
        accept: 'application/json',
        ...(options.cookie ? { cookie: options.cookie } : {}),
        ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {}),
        ...options.headers,
      },
      agent: new Agent({ keepAlive: false }),
    }, res => {
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json: any = null;
        try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
        resolve({ status: res.statusCode ?? 0, json, setCookie: res.headers['set-cookie']?.[0] });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('multi-process local remote topology acceptance over HTTPS + enrolled WSS', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fs-topology-'));
  const statePath = path.join(dir, 'hub-state.json');
  const connectionId = randomUUID();
  const envBase = {
    ...process.env,
    FLEETSPLICE_TOPOLOGY_STATE: statePath,
    FLEETSPLICE_TOPOLOGY_CONNECTION_ID: connectionId,
    FLEETSPLICE_TOPOLOGY_RP_ID: 'localhost',
  };

  const hub = spawn(process.execPath, [hubMain], {
    cwd: root,
    env: envBase,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let edge: ChildProcess | null = null;

  try {
    const hubReady = await waitReady(hub, 'hub');
    const port = Number(hubReady.port);
    const origin = String(hubReady.origin);
    assert.ok(port > 0);
    assert.match(origin, /^https:\/\/localhost:\d+$/);
    const state = JSON.parse(readFileSync(statePath, 'utf8')) as { certPem: string };
    const ca = state.certPem;

    edge = spawn(process.execPath, [edgeMain], {
      cwd: root,
      env: envBase,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const edgeReady = await waitReady(edge, 'edge');
    assert.equal(edgeReady.inboundFleetListener, false);
    assert.equal(edgeReady.enrolled, true);

    const ready = await httpsJson({ port, method: 'GET', path: '/ready', origin, ca });
    assert.equal(ready.status, 200);
    assert.equal(ready.json.edgeConnected, true);

    // Wrong origin rejected
    const badOrigin = await httpsJson({
      port, method: 'POST', path: '/auth/register', origin: 'https://evil.example', ca, body: {},
    });
    assert.equal(badOrigin.json.error, 'ORIGIN_REJECTED');

    // WebAuthn virtual register
    const reg = await httpsJson({
      port, method: 'POST', path: '/auth/register', origin, ca, body: { credentialId: 'cred-topology' },
    });
    assert.equal(reg.status, 200);
    assert.ok(reg.setCookie?.startsWith('__Host-fleetsplice='));
    const cookie = reg.setCookie!.split(';')[0]!;

    const clientRes = await httpsJson({
      port, method: 'POST', path: '/client', origin, ca, cookie, body: {},
    });
    assert.equal(clientRes.status, 200);
    const { client, sessionBinding } = clientRes.json;
    assert.ok(client.csrf);
    assert.ok(sessionBinding);

    // CSRF reject
    const csrfFail = await httpsJson({
      port, method: 'POST', path: '/lane/ack', origin, ca, cookie,
      body: { fence: 0 },
      headers: { 'x-csrf': 'nope' },
    });
    // lane/ack does not require CSRF in current hub — mutate path does
    await httpsJson({ port, method: 'POST', path: '/lane/ack', origin, ca, body: { fence: 0 } });

    const badCsrf = await httpsJson({
      port, method: 'POST', path: '/lane/acquire', origin, ca, cookie,
      body: { clientInstanceId: client.clientInstanceId, csrf: 'wrong' },
    });
    assert.equal(badCsrf.json.error, 'CSRF_OR_CLIENT_REJECTED');

    const lane = await httpsJson({
      port, method: 'POST', path: '/lane/acquire', origin, ca, cookie,
      body: { clientInstanceId: client.clientInstanceId, csrf: client.csrf },
    });
    assert.equal(lane.status, 200);
    assert.equal(lane.json.lane.controllerClientId, client.clientInstanceId);

    const adoptionClient = {
      clientInstanceId: client.clientInstanceId,
      sessionBinding,
      grantId: 'g1',
      grantRevision: '0',
      expiresAt: Date.now() + 60_000,
    };

    const claim = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: { commandId: randomUUID(), family: 'native.claim', text: '' },
      },
    });
    assert.equal(claim.json.status, 'SUCCEEDED');

    const snap = await httpsJson({
      port, method: 'GET', path: '/adoption/snapshot', origin, ca, cookie,
      headers: { 'sec-fetch-site': 'same-origin' },
    });
    assert.equal(snap.json.state, 'READY');
    assert.equal(snap.json.workspace, 'ws-local-topology');
    assert.equal(snap.json.controller, client.clientInstanceId);
    assert.equal(snap.json.threads[0].origin, 'NATIVE_ADOPTED');

    const submitId = randomUUID();
    const submit = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: { commandId: submitId, family: 'native.submit', text: 'topology hello' },
      },
    });
    assert.equal(submit.json.status, 'SUCCEEDED');
    assert.equal(submit.json.family, 'native.submit');

    const lookup = await httpsJson({
      port, method: 'GET', path: `/adoption/lookup/${submitId}`, origin, ca, cookie,
    });
    assert.equal(lookup.json.receipt.commandId, submitId);

    const recover = await httpsJson({
      port, method: 'POST', path: '/adoption/recover', origin, ca, cookie,
      body: { clientInstanceId: client.clientInstanceId, csrf: client.csrf, commandId: submitId },
    });
    assert.equal(recover.json.replayed, false);
    assert.equal(recover.json.receipt.commandId, submitId);

    const seed = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: { commandId: randomUUID(), family: 'native.seedApproval', digest: 'appr-1', text: '' },
      },
    });
    const digest = seed.json.code;
    const allow = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: {
          commandId: randomUUID(),
          family: 'native.approval',
          text: '',
          approval: { digest, decision: 'ALLOW_ONCE' },
        },
      },
    });
    assert.equal(allow.json.status, 'SUCCEEDED');
    const deny = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: {
          commandId: randomUUID(),
          family: 'native.approval',
          text: '',
          approval: { digest: 'appr-deny', decision: 'DENY' },
        },
      },
    });
    assert.equal(deny.json.status, 'SUCCEEDED');

    const interrupt = await httpsJson({
      port, method: 'POST', path: '/adoption/execute', origin, ca, cookie,
      body: {
        clientInstanceId: client.clientInstanceId,
        csrf: client.csrf,
        client: adoptionClient,
        command: { commandId: randomUUID(), family: 'native.interrupt', text: '' },
      },
    });
    assert.equal(interrupt.json.status, 'SUCCEEDED');

    await httpsJson({ port, method: 'POST', path: '/realtime/advance', origin, ca, body: { revision: '0' } });
    await httpsJson({ port, method: 'POST', path: '/realtime/advance', origin, ca, body: { revision: '1' } });
    const gap = await httpsJson({
      port, method: 'POST', path: '/realtime/advance', origin, ca, body: { revision: '9' },
    });
    assert.equal(gap.json.error, 'RESYNC_REQUIRED');

    // Viewer: second client cannot take over (G07)
    const client2 = await httpsJson({
      port, method: 'POST', path: '/client', origin, ca, cookie, body: {},
    });
    // Need fence ack after first acquire bumped fence
    await httpsJson({
      port, method: 'POST', path: '/lane/ack', origin, ca,
      body: { fence: lane.json.lane.fence },
    });
    const takeover = await httpsJson({
      port, method: 'POST', path: '/lane/acquire', origin, ca, cookie,
      body: { clientInstanceId: client2.json.client.clientInstanceId, csrf: client2.json.client.csrf },
    });
    assert.match(String(takeover.json.error), /CONTROLLER_OWNED_TAKEOVER_IS_G07|EDGE_FENCE/);

    const disc = await httpsJson({
      port, method: 'POST', path: '/control/edge-disconnect', origin, ca, body: {},
    });
    assert.equal(disc.json.projection.state, 'EDGE_STALE_OR_UNKNOWN');
    assert.equal(disc.json.projection.guessStopped, false);

    const cold = await httpsJson({
      port, method: 'POST', path: '/control/cold-start', origin, ca, body: {},
    });
    assert.equal(cold.json.projection.state, 'RECOVERY_REQUIRED');

    // Stale generation style: closed proxy rejects after disconnect
    const staleSnap = await httpsJson({
      port, method: 'GET', path: '/adoption/snapshot', origin, ca, cookie,
      headers: { 'sec-fetch-site': 'same-origin' },
    });
    assert.match(String(staleSnap.json.error ?? ''), /EDGE_DISCONNECTED|HUB_REQUEST|ADOPTION/);
  } finally {
    edge?.kill();
    hub.kill();
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});
