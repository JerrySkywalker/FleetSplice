import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { canonical, parseJson, validate, type Hcp, type Target } from '../packages/contracts/index.ts';
import { RemoteAdoptionPortProxy, EdgeNativeAdoptionEndpoint } from '../packages/remote-adoption/index.ts';
import { createPerfAdoptionFixture } from './fixtures/perf-adoption-fixture.ts';
import type { NativeAdoptionAdapter } from '../packages/native-adoption/adapter.ts';

function target(): Target {
  return {
    authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(),
    hubRecoveryGeneration: '0', edgeRecoveryGeneration: '0', hostId: randomUUID(), hostGeneration: '0',
    environmentId: randomUUID(), environmentGeneration: '0', workspaceId: randomUUID(), workspaceGeneration: '0',
    rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID(),
  };
}

/** Real sockets: Edge initiates WSS to Hub; typed HCP adoption framing only. */
async function duplexAdoption(localPort: NativeAdoptionAdapter, tgt: Target) {
  const hubServer = createServer();
  await new Promise<void>(resolve => hubServer.listen(0, '127.0.0.1', resolve));
  const hubPort = (hubServer.address() as { port: number }).port;
  const hubWss = new WebSocketServer({
    noServer: true, maxPayload: 262144, perMessageDeflate: false,
    handleProtocols: p => (p.has('fleetsplice.hcp.v1') ? 'fleetsplice.hcp.v1' : false),
  });
  let hubEdge: WebSocket | null = null;
  hubServer.on('upgrade', (req, socket, head) => {
    if (req.url !== '/hcp/v1/connect') { socket.destroy(); return; }
    hubWss.handleUpgrade(req, socket, head, ws => { hubEdge = ws; hubWss.emit('connection', ws); });
  });

  const proxy = new RemoteAdoptionPortProxy(tgt, msg => {
    if (!hubEdge || hubEdge.readyState !== WebSocket.OPEN || hubEdge.bufferedAmount >= 262144) {
      throw new Error('EDGE_DISCONNECTED');
    }
    hubEdge.send(canonical(msg));
  });

  const hubConnected = new Promise<void>(resolve => {
    hubWss.on('connection', ws => {
      ws.on('message', data => {
        const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
        proxy.accept(message);
      });
      ws.on('close', () => proxy.close('EDGE_DISCONNECTED'));
      resolve();
    });
  });

  const edgeWs = new WebSocket(`ws://127.0.0.1:${hubPort}/hcp/v1/connect`, 'fleetsplice.hcp.v1', {
    perMessageDeflate: false, maxPayload: 262144, origin: `http://127.0.0.1:${hubPort}`,
  });
  await new Promise<void>((resolve, reject) => {
    edgeWs.once('open', () => resolve());
    edgeWs.once('error', reject);
  });
  await hubConnected;

  const endpoint = new EdgeNativeAdoptionEndpoint(localPort, tgt, msg => {
    if (edgeWs.readyState !== WebSocket.OPEN || edgeWs.bufferedAmount >= 262144) throw new Error('HCP_BACKPRESSURE_OR_DISCONNECTED');
    edgeWs.send(canonical(msg));
  });
  endpoint.startRealtimePush();
  edgeWs.on('message', async data => {
    const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
    if (message.kind === 'adoption.request') await endpoint.accept(message);
  });

  return {
    proxy,
    endpoint,
    close: async () => {
      endpoint.stop();
      proxy.close();
      edgeWs.close();
      hubEdge?.close();
      hubWss.close();
      await new Promise<void>(resolve => hubServer.close(() => resolve()));
    },
  };
}

test('remote AdoptionPort snapshot/execute/lookup over real HCP framing', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
  const pair = await duplexAdoption(fx.adapter, target());
  try {
    const snap = await pair.proxy.snapshot({ discover: true });
    assert.equal(snap.state, 'READY');
    assert.equal(snap.threads.length, 1);
    await fx.attach();
    const before = await pair.proxy.snapshot({});
    const receipt = await pair.proxy.execute(
      fx.command(before, 'native.submit', { text: 'remote hcp submit' }),
      fx.authority,
    );
    assert.equal(receipt.status, 'SUCCEEDED');
    assert.deepEqual(await pair.proxy.lookup(receipt.commandId), receipt);
  } finally {
    await pair.close();
    fx.journal.close();
  }
});

test('closed remote adoption proxy fails closed without effect', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  const pair = await duplexAdoption(fx.adapter, target());
  try {
    await pair.proxy.snapshot({ discover: true });
    pair.proxy.close('EDGE_DISCONNECTED');
    await assert.rejects(() => pair.proxy.snapshot({}), /EDGE_DISCONNECTED|ADOPTION_REMOTE/);
  } finally {
    await pair.close();
    fx.journal.close();
  }
});

test('duplicate adoption requestId returns original response without re-dispatch', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
  await fx.attach();
  fx.rpc.resetCalls();
  const tgt = target();
  const captured: Hcp[] = [];
  const endpoint = new EdgeNativeAdoptionEndpoint(fx.adapter, tgt, msg => { captured.push(msg); });
  const requestId = randomUUID();
  const req: Hcp = {
    v: 1, kind: 'adoption.request', connectionId: tgt.connectionId, target: tgt, requestId,
    op: 'lookup', body: { commandId: randomUUID() },
  };
  await endpoint.accept(req);
  await endpoint.accept(req);
  assert.equal(captured.length, 2);
  assert.equal(captured[0]!.kind, 'adoption.response');
  assert.deepEqual(captured[0], captured[1]);
  assert.equal(fx.rpc.calls.filter(c => c.method === 'turn/start').length, 0);
  endpoint.stop();
  fx.journal.close();
});

test('response loss leaves lookup as the only recovery path (no semantic replay)', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
  await fx.attach();
  fx.rpc.resetCalls();
  const before = await fx.adapter.snapshot({});
  const cmd = fx.command(before, 'native.submit', { text: 'lost-response' });
  const receipt = await fx.adapter.execute(cmd, fx.authority);
  assert.equal(receipt.status, 'SUCCEEDED');
  assert.deepEqual(await fx.adapter.lookup(cmd.commandId), receipt);
  assert.deepEqual(await fx.adapter.execute(cmd, fx.authority), receipt);
  assert.equal(fx.rpc.calls.filter(c => c.method === 'turn/start' && c.params.threadId === fx.rpc.primaryId).length, 1);
  fx.journal.close();
});
