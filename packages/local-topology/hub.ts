import { createServer as createHttpsServer } from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { canonical, parseJson, validate, type Hcp, type Target } from '../contracts/index.ts';
import { Fault, requireThat } from '../contracts/json.ts';
import { BrowserSecurityService, HOST_SESSION_COOKIE, parseHostSessionCookie } from '../browser-security/index.ts';
import { RemoteAdoptionPortProxy } from '../remote-adoption/index.ts';
import { ReconnectNoReplayCoordinator } from '../reconnect/index.ts';
import { createEphemeralTlsMaterial, REMOTE_ENROLLED_WSS } from '../remote-transport/index.ts';
import {
  HostEnrollmentRegistry,
  generateHostEnrollmentKey,
} from '../remote-enrollment/index.ts';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > 262_144) {
        reject(new Fault('MESSAGE_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    ...extraHeaders,
  });
  res.end(text);
}

export type HubTopologyOptions = {
  /** If omitted, derived as https://localhost:<port> after listen. */
  origin?: string;
  rpId: string;
  target: Target;
};

/** Multi-process Hub: HTTPS browser surface + enrolled WSS Edge carriage. */
export async function startHubTopologyProcess(options: HubTopologyOptions) {
  const tls = createEphemeralTlsMaterial('localhost');
  let origin = options.origin ?? '';
  const securityHolder: { current: BrowserSecurityService | null } = { current: null };
  const reconnect = new ReconnectNoReplayCoordinator();
  const enrollment = new HostEnrollmentRegistry();
  const material = generateHostEnrollmentKey({
    fleetId: 'fleet-topology',
    hostId: 'host-topology',
    environmentId: 'env-topology',
    enrollmentGeneration: '1',
  });
  const identity = {
    fleetId: material.fleetId,
    hostId: material.hostId,
    environmentId: material.environmentId,
    enrollmentGeneration: material.enrollmentGeneration,
    publicKeySpkiPem: material.publicKeySpkiPem,
    publicFingerprint: material.publicFingerprint,
  };
  enrollment.enroll(identity);

  let edgeWs: WebSocket | null = null;
  let edgeConnected = false;
  let proxy = new RemoteAdoptionPortProxy(options.target, msg => {
    requireThat(edgeWs && edgeWs.readyState === WebSocket.OPEN, 'EDGE_DISCONNECTED');
    edgeWs!.send(canonical(msg));
  });

  const recreateProxy = () => {
    proxy = new RemoteAdoptionPortProxy(options.target, msg => {
      requireThat(edgeWs && edgeWs.readyState === WebSocket.OPEN, 'EDGE_DISCONNECTED');
      edgeWs!.send(canonical(msg));
    });
  };

  const server = createHttpsServer({ key: tls.keyPem, cert: tls.certPem });
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: REMOTE_ENROLLED_WSS.maxPayload,
    perMessageDeflate: false,
    handleProtocols: p => (p.has(REMOTE_ENROLLED_WSS.subprotocol) ? REMOTE_ENROLLED_WSS.subprotocol : false),
  });

  server.on('upgrade', (req, socket, head) => {
    try {
      requireThat(req.url === '/hcp/v1/connect', 'HCP_PATH_REJECTED');
      requireThat(!edgeConnected, 'DUPLICATE_ACTIVE_EDGE_CONNECTION');
      wss.handleUpgrade(req, socket, head, ws => {
        edgeWs = ws;
        edgeConnected = true;
        reconnect.setEdgeConnected(true);
        reconnect.clearColdStartAfterReAdmission();
        recreateProxy();
        ws.on('message', data => {
          const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
          proxy.accept(message);
        });
        ws.on('close', () => {
          edgeConnected = false;
          edgeWs = null;
          reconnect.setEdgeConnected(false);
          proxy.close('EDGE_DISCONNECTED');
        });
        wss.emit('connection', ws, req);
      });
    } catch {
      socket.destroy();
    }
  });

  const security = () => {
    requireThat(securityHolder.current, 'HUB_ORIGIN_NOT_READY');
    return securityHolder.current!;
  };

  server.on('request', async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', origin || 'https://localhost');
      const reqOrigin = req.headers.origin;
      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok', origin });
        return;
      }
      if (url.pathname === '/ready') {
        sendJson(res, edgeConnected ? 200 : 503, {
          status: edgeConnected ? 'ok' : 'not_ready',
          edgeConnected,
          projection: reconnect.projectionHonesty(),
        });
        return;
      }
      if (url.pathname === '/auth/register' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, string>;
        security().assertExactOrigin(reqOrigin);
        const ceremony = security().beginCeremony('register');
        const opened = security().registerVirtualCredential({
          challengeId: ceremony.challengeId,
          origin,
          rpId: options.rpId,
          credentialId: body.credentialId || 'cred-topology',
          publicKeySpkiPem: '-----BEGIN PUBLIC KEY-----\nTEST\n-----END PUBLIC KEY-----\n',
          userHandle: 'owner',
        });
        sendJson(res, 200, { ok: true, sessionId: opened.sessionId }, { 'set-cookie': opened.cookie });
        return;
      }
      if (url.pathname === '/client' && req.method === 'POST') {
        const sessionId = parseHostSessionCookie(req.headers.cookie);
        requireThat(sessionId, 'AUTH_REQUIRED');
        security().assertExactOrigin(reqOrigin);
        const client = security().issueClient(sessionId);
        const projection = security().edgeSafeProjection(sessionId);
        reconnect.registerClient({
          clientInstanceId: client.clientInstanceId,
          sessionBinding: projection.sessionBinding,
          authenticatedAt: Date.now(),
        });
        sendJson(res, 200, { client, sessionBinding: projection.sessionBinding });
        return;
      }
      if (url.pathname === '/lane/ack' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as { fence: number };
        reconnect.acknowledgeEdgeFence(body.fence);
        sendJson(res, 200, { ok: true });
        return;
      }
      if (url.pathname === '/lane/acquire' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as {
          clientInstanceId: string; csrf: string;
        };
        security().requireMutation({
          origin: reqOrigin,
          cookieHeader: req.headers.cookie,
          clientInstanceId: body.clientInstanceId,
          csrf: body.csrf,
        });
        const lane = reconnect.acquireUnownedLane(body.clientInstanceId);
        sendJson(res, 200, { lane });
        return;
      }
      if (url.pathname === '/adoption/snapshot' && req.method === 'GET') {
        security().requireObservation({
          origin: reqOrigin,
          cookieHeader: req.headers.cookie,
          secFetchSite: req.headers['sec-fetch-site'] as string | undefined,
        });
        const snap = await proxy.snapshot({ discover: true });
        sendJson(res, 200, snap);
        return;
      }
      if (url.pathname === '/adoption/execute' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as {
          clientInstanceId: string; csrf: string; command: any; client: any;
        };
        security().requireMutation({
          origin: reqOrigin,
          cookieHeader: req.headers.cookie,
          clientInstanceId: body.clientInstanceId,
          csrf: body.csrf,
        });
        const receipt = await proxy.execute(body.command, body.client);
        reconnect.rememberReceipt(receipt.commandId, receipt);
        sendJson(res, 200, receipt);
        return;
      }
      if (url.pathname.startsWith('/adoption/lookup/') && req.method === 'GET') {
        security().requireObservation({ origin: reqOrigin, cookieHeader: req.headers.cookie });
        const commandId = decodeURIComponent(url.pathname.slice('/adoption/lookup/'.length));
        const receipt = reconnect.lookupReceipt(commandId) ?? await proxy.lookup(commandId);
        sendJson(res, 200, { receipt });
        return;
      }
      if (url.pathname === '/adoption/recover' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as {
          clientInstanceId: string; csrf: string; commandId: string;
        };
        security().requireMutation({
          origin: reqOrigin,
          cookieHeader: req.headers.cookie,
          clientInstanceId: body.clientInstanceId,
          csrf: body.csrf,
        });
        const receipt = reconnect.recoverLostResponse(body.commandId);
        sendJson(res, 200, { receipt, replayed: false });
        return;
      }
      if (url.pathname === '/realtime/advance' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as { revision: string };
        const revision = reconnect.advanceRealtime(body.revision);
        sendJson(res, 200, { revision });
        return;
      }
      if (url.pathname === '/control/edge-disconnect' && req.method === 'POST') {
        edgeWs?.close();
        edgeConnected = false;
        edgeWs = null;
        reconnect.setEdgeConnected(false);
        proxy.close('EDGE_DISCONNECTED');
        sendJson(res, 200, { ok: true, projection: reconnect.projectionHonesty() });
        return;
      }
      if (url.pathname === '/control/cold-start' && req.method === 'POST') {
        reconnect.markColdStart();
        proxy.bumpGeneration();
        sendJson(res, 200, { projection: reconnect.projectionHonesty() });
        return;
      }
      sendJson(res, 404, { error: 'NOT_FOUND' });
    } catch (error) {
      const code = error instanceof Fault ? error.code : 'HUB_REQUEST_FAILED';
      sendJson(res, 400, { error: code });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = (server.address() as { port: number }).port;
  origin = options.origin ?? `https://localhost:${port}`;
  securityHolder.current = new BrowserSecurityService({ origin, rpId: options.rpId });

  return {
    port,
    origin,
    tls,
    material,
    identity,
    HOST_SESSION_COOKIE,
    close: async () => {
      proxy.close();
      edgeWs?.close();
      wss.close();
      await new Promise<void>(resolve => server.close(() => resolve()));
    },
  };
}

export function makeTopologyTarget(connectionId?: string): Target {
  return {
    authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(),
    connectionId: (connectionId && connectionId.length > 0 ? connectionId : randomUUID()) as Target['connectionId'],
    hubRecoveryGeneration: '0', edgeRecoveryGeneration: '0', hostId: randomUUID(), hostGeneration: '0',
    environmentId: randomUUID(), environmentGeneration: '0', workspaceId: randomUUID(), workspaceGeneration: '0',
    rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID(),
  };
}
