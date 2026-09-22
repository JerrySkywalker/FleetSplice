import { createServer as createHttpServer, type ServerResponse, type IncomingMessage } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type { Socket } from 'node:net';
import { randomBytes, randomUUID, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { Fault, parseJson, canonical, requireThat, validate, type Target, type Hcp, type EdgeCommand, type Receipt } from '../../packages/contracts/index.ts';
import { HubKernel, AdmissionRejected, type ClientGrant } from './kernel.ts';
import { Journal } from '../../packages/journal/index.ts';
import type { WorkspaceBinding } from '../../packages/contracts/index.ts';
import type { AdoptionPort, AdoptionClient } from '../../packages/native-adoption/types.ts';
import { RemoteAdoptionPortProxy } from '../../packages/remote-adoption/index.ts';
import { gatewayAdoptionPort, type GatewayAdoptionCarriage } from '../../packages/product-path/index.ts';
import { resolveDeploymentProfile, type DeploymentProfileInput } from '../../packages/deployment/index.ts';
import { GenericOidcAuthenticator, type HumanPrincipal, type OidcProviderConfig } from '../../packages/oidc/index.ts';
import { DeviceEnrollmentService } from '../../packages/device-enrollment/index.ts';
import { DurableIdentityStore } from '../../packages/durable-identity/index.ts';

export type HubAuthConfig = { mode: 'LOOPBACK_BOOTSTRAP' } | { mode: 'OIDC'; provider: OidcProviderConfig };
export type GatewayListener = { host?: string; tls?: { keyPem: string; certPem: string } };
export type HubConfig = { port: number; target: Target; root: string; sid: string; principal: string; sessionId: number; stateDirectory: string; durableStateDirectory?: string; webDirectory: string; hcpToken: string; bootstrapToken: string; workspaces?: WorkspaceBinding[]; adoptionCarriage?: GatewayAdoptionCarriage; deployment?: DeploymentProfileInput; listener?: GatewayListener; auth?: HubAuthConfig };
const equalSecret = (a: string, b: string) => {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export async function startHub(config: HubConfig, adoption?: AdoptionPort, now: () => number = Date.now) {
  const adoptionPort = adoption ?? (config.adoptionCarriage ? gatewayAdoptionPort(config.adoptionCarriage) : undefined);
  const defaultOrigin = `http://127.0.0.1:${config.port}`;
  const deployment = resolveDeploymentProfile(config.deployment ?? { kind: 'LOOPBACK', publicBaseUrl: defaultOrigin });
  const origin = deployment.baseUrl; const host = new URL(origin).host;
  const listener = { host: '127.0.0.1', ...config.listener };
  requireThat(deployment.kind === 'LOOPBACK' || !!listener.tls, 'GATEWAY_TLS_REQUIRED_FOR_NON_LOOPBACK');
  const oidc = config.auth?.mode === 'OIDC' ? new GenericOidcAuthenticator(config.auth.provider) : null;
  const authorityStore = new DurableIdentityStore(path.join(config.durableStateDirectory ?? config.stateDirectory, 'gateway-authority.json'), value => {
    const item = value as { v?: unknown; configurationDigest?: unknown; ownerId?: unknown }; requireThat(item?.v === 1 && typeof item.configurationDigest === 'string' && /^[0-9a-f]{64}$/.test(item.configurationDigest) && (item.ownerId === null || typeof item.ownerId === 'string'), 'DURABLE_IDENTITY_STORE_INVALID'); return item as { v: 1; configurationDigest: string; ownerId: string | null };
  });
  const configurationDigest = createHash('sha256').update(canonical({ deployment: deployment.discovery, auth: config.auth ?? { mode: 'LOOPBACK_BOOTSTRAP' } })).digest('hex');
  const restoredAuthority = authorityStore.read();
  if (restoredAuthority) requireThat(restoredAuthority.configurationDigest === configurationDigest, 'DURABLE_IDENTITY_CONFIG_MISMATCH');
  const persistAuthority = (ownerId: string | null) => authorityStore.write({ v: 1 as const, configurationDigest, ownerId });
  const deviceStore = new DurableIdentityStore(path.join(config.durableStateDirectory ?? config.stateDirectory, 'device-identities.json'), value => {
    const item = value as { v?: unknown; records?: unknown }; requireThat(item?.v === 1 && Array.isArray(item.records), 'DURABLE_IDENTITY_STORE_INVALID'); return item as import('../../packages/device-enrollment/index.ts').DurableDeviceEnrollmentState;
  });
  const devices = new DeviceEnrollmentService(deviceStore.read() ?? undefined);
  const persistDevices = () => deviceStore.write(devices.durableState());
  const cookieName = oidc && deployment.kind !== 'LOOPBACK' ? '__Host-fleetsplice' : 'fleetsplice';
  const actorId = randomUUID();
  const sessions = new Map<string, { expiresAt: number; idleExpiresAt: number; principal: HumanPrincipal }>();
  const clients = new Map<string, ClientGrant & { csrf: string; session: string }>();
  const streams = new Set<ServerResponse>();
  const nativeStreams = new Set<ServerResponse>();
  let nativeRevision = '0';
  let nativeUnsubscribe: (() => void) | null = null;
  let edge: WebSocket | null = null; let edgeGeneration: number | null = null; let usedBootstrap = false; let hcpAccepted = false; let hcpPending = false;
  const edgeDetachWaiters = new Set<() => void>();
  const edgeDetached = () => { hcpAccepted = false; hcpPending = false; for (const resolve of edgeDetachWaiters) resolve(); edgeDetachWaiters.clear(); };
  const waitForEdgeDetach = () => !edge ? Promise.resolve() : new Promise<void>(resolve => edgeDetachWaiters.add(resolve));
  const remoteAdoption = adoptionPort instanceof RemoteAdoptionPortProxy ? adoptionPort : null;
  const pending = new Map<string, { resolve: (receipt: Receipt) => void; reject: () => void; timer: NodeJS.Timeout }>();
  const sendTo = (socket: WebSocket, message: Hcp) => {
    requireThat(socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 262144, 'EDGE_DISCONNECTED');
    socket.send(canonical(message));
  };
  const send = (message: Hcp) => {
    requireThat(hcpAccepted && edge !== null, 'EDGE_DISCONNECTED');
    sendTo(edge, message);
  };
  // The carriage supplies a construction-time sender, but it is not an Edge
  // binding. Product NativeAdoption is bound only after this HCP connection is
  // admitted (after enrollment proof when enrollment is required).
  remoteAdoption?.unbind(undefined, 'EDGE_DISCONNECTED');
  const journal = new Journal(path.join(config.stateDirectory, 'hub.sqlite'));
  const kernel = new HubKernel(journal, config.target, config.root, (command: EdgeCommand) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(command.edgeCommandId); reject(new Fault('RECEIPT_UNKNOWN')); }, 55000);
    pending.set(command.edgeCommandId, { resolve, reject: () => reject(new Fault('EDGE_DISCONNECTED')), timer });
    try { send({ v: 1, kind: 'command', connectionId: config.target.connectionId, target: config.target, command }); }
    catch (error) { clearTimeout(timer); pending.delete(command.edgeCommandId); reject(error); }
  }), () => { for (const stream of streams) if (!stream.write(`data: ${kernel.snapshot().cursor}\n\n`)) { stream.end(); streams.delete(stream); } }, config.workspaces);
  const writeNative = (payload: unknown) => {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const stream of nativeStreams) if (!stream.write(data)) { stream.end(); nativeStreams.delete(stream); }
  };
  /** Catch-up only (reconnect / missed buffer). Not the primary delivery path. */
  const catchUpNativeRealtime = async () => {
    if (!adoptionPort?.pollRealtime || nativeStreams.size === 0) return;
    try {
      const since = nativeRevision;
      const page = await adoptionPort.pollRealtime(since);
      // pollRealtime may publish a new control observation that live subscribeRealtime
      // already wrote and advanced nativeRevision. Never double-write those envelopes.
      if (page.events.length) {
        for (const envelope of page.events) {
          let revision: bigint;
          try { revision = BigInt(envelope.revision); } catch { continue; }
          let cursor: bigint;
          try { cursor = BigInt(nativeRevision || '0'); } catch { cursor = 0n; }
          if (revision > cursor) {
            nativeRevision = envelope.revision;
            writeNative(envelope);
          }
        }
        try {
          if (BigInt(page.revision) > BigInt(nativeRevision || '0')) nativeRevision = page.revision;
        } catch { /* keep live cursor */ }
      } else if (page.revision !== nativeRevision) {
        nativeRevision = page.revision;
        writeNative({ revision: nativeRevision, eventId: `rev-${nativeRevision}`, stream: 'fleet.control', kind: 'fence.advanced', threadId: null, turnId: null });
      }
    } catch { /* Observation catch-up failures do not invent events; clients retain fallback refresh. */ }
  };
  /** Post-command catch-up is redundant while a direct subscribeRealtime push is healthy. */
  const catchUpAfterCommandIfNeeded = () => {
    if (nativeUnsubscribe) return;
    void catchUpNativeRealtime();
  };
  const ensureNativeSubscription = () => {
    if (nativeUnsubscribe || !adoptionPort?.subscribeRealtime) return;
    nativeUnsubscribe = adoptionPort.subscribeRealtime(envelope => {
      nativeRevision = envelope.revision;
      writeNative(envelope);
    });
  };
  const stopNativeSubscription = () => {
    if (nativeStreams.size || !nativeUnsubscribe) return;
    nativeUnsubscribe(); nativeUnsubscribe = null;
  };
  const json = (res: ServerResponse, status: number, value: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  const body = async (req: IncomingMessage) => {
    const chunks: Buffer[] = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; requireThat(size <= 262144, 'MESSAGE_TOO_LARGE'); chunks.push(chunk); }
    return parseJson(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  };
  const session = (req: IncomingMessage): string => {
    const cookie = new RegExp(`(?:^|;\\s*)${cookieName}=([0-9a-f]{64})(?:;|$)`).exec(req.headers.cookie ?? '')?.[1];
    const current = cookie ? sessions.get(cookie) : undefined;
    requireThat(cookie && current && current.expiresAt > now() && current.idleExpiresAt > now(), 'AUTH_REQUIRED');
    if (oidc) current.idleExpiresAt = Math.min(current.expiresAt, now() + 15 * 60_000); return cookie;
  };
  const openSession = (principal: HumanPrincipal) => {
    const token = randomBytes(32).toString('hex'); const expiresAt = now() + 8 * 60 * 60_000;
    sessions.set(token, { expiresAt, idleExpiresAt: oidc ? Math.min(expiresAt, now() + 15 * 60_000) : expiresAt, principal });
    return { token, cookie: `${cookieName}=${token}; ${oidc && deployment.kind !== 'LOOPBACK' ? 'Secure; ' : ''}HttpOnly; SameSite=Strict; Path=/` };
  };
  const grant = (req: IncomingMessage) => {
    const client = clients.get(String(req.headers['x-fleet-client']));
    requireThat(client && client.session === session(req) && equalSecret(String(req.headers['x-fleet-csrf']), client.csrf) && client.expiresAt > now(), 'CLIENT_AUTH_REQUIRED'); return client;
  };
  const adoptionClient = (client: ClientGrant & { session: string }): AdoptionClient => ({
    clientInstanceId: client.clientInstanceId, grantId: client.grantId, grantRevision: client.grantRevision,
    expiresAt: client.expiresAt, sessionBinding: createHash('sha256').update(client.session).digest('hex') });
  const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      requireThat(req.headers.host === host, 'HOST_REJECTED');
      if (deployment.kind === 'LOOPBACK') requireThat(req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1', 'HOST_REJECTED');
      if (req.headers.origin) requireThat(req.headers.origin === origin, 'ORIGIN_REJECTED');
      if (req.method === 'POST') requireThat(req.headers.origin === origin && req.headers['content-type'] === 'application/json', 'ORIGIN_OR_CONTENT_TYPE_REJECTED');
      if (req.method === 'GET' && req.url === '/.well-known/fleetsplice') { json(res, 200, deployment.discovery); return; }
      if (req.method === 'GET' && req.url === '/auth/login') {
        requireThat(oidc, 'OIDC_NOT_CONFIGURED'); const started = await oidc.start(); res.writeHead(302, { Location: started.authorizationUrl }); res.end(); return;
      }
      if (req.method === 'GET' && req.url?.startsWith('/auth/oidc/callback?')) {
        requireThat(oidc, 'OIDC_NOT_CONFIGURED'); const url = new URL(req.url, origin); const principal = await oidc.complete({ state: url.searchParams.get('state') ?? '', code: url.searchParams.get('code') ?? '' });
        const existing = restoredAuthority?.ownerId ?? [...sessions.values()][0]?.principal.id; requireThat(!existing || existing === principal.id, 'OIDC_OWNER_ADMISSION_REJECTED');
        persistAuthority(principal.id);
        const opened = openSession(principal); res.writeHead(302, { Location: '/', 'Set-Cookie': opened.cookie }); res.end(); return;
      }
      if (req.method === 'POST' && req.url === '/api/bootstrap') {
        requireThat(!oidc, 'OIDC_REQUIRED');
        const value = await body(req) as any;
        requireThat(value && Object.keys(value).length === 1 && typeof value.token === 'string' && !usedBootstrap && equalSecret(value.token, config.bootstrapToken), 'BOOTSTRAP_REJECTED');
        usedBootstrap = true; const opened = openSession({ id: createHash('sha256').update('loopback-development\0owner').digest('hex'), issuer: 'loopback-development', subject: 'owner', displayName: 'Loopback development owner', email: null, avatar: null, groups: [] });
        res.setHeader('Set-Cookie', opened.cookie); json(res, 200, { authenticated: true }); return;
      }
      if (req.method === 'POST' && req.url === '/api/devices/enroll') {
        // A device can create only a pending public-key request. Human session
        // approval happens separately and no OIDC token ever reaches this route.
        const requested = devices.request(await body(req), now()); persistDevices(); json(res, 202, { requestId: requested.requestId, state: requested.state, publicFingerprint: requested.identity.publicFingerprint }); return;
      }
      if (req.method === 'GET' && /^\/api\/devices\/[0-9a-f-]{36}\/status$/.test(req.url ?? '')) {
        const requestId = /^\/api\/devices\/([0-9a-f-]{36})\/status$/.exec(req.url!)![1]!;
        const device = devices.status(requestId); json(res, 200, { requestId: device.requestId, state: device.state }); return;
      }
      if (req.url?.startsWith('/api/')) {
        const authenticatedSession = session(req);
        if (req.method === 'POST' && req.url === '/api/auth/logout') {
          for (const [id, client] of clients) if (client.session === authenticatedSession) clients.delete(id);
          sessions.delete(authenticatedSession); res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`); json(res, 200, { loggedOut: true }); return;
        }
        if (req.method === 'GET' && req.url === '/api/auth/principal') {
          const principal = sessions.get(authenticatedSession)!.principal; json(res, 200, { principal, mode: oidc ? 'OIDC' : 'LOOPBACK_BOOTSTRAP' }); return;
        }
        if (req.method === 'GET' && req.url === '/api/fleet/summary') {
          let discoveredSessions = 0; let activeSessions = 0; let runtimeStatus: 'healthy' | 'degraded' | 'unavailable' = hcpAccepted ? 'healthy' : 'unavailable';
          let observation: string | null = null;
          if (adoptionPort) {
            try {
              const native = await adoptionPort.snapshot({}); discoveredSessions = native.threads.length; activeSessions = native.threads.filter(thread => thread.activeTurnId !== null).length;
              runtimeStatus = native.observationFailure ? 'degraded' : 'healthy'; observation = native.observationFailure?.code ?? null;
            } catch { runtimeStatus = 'unavailable'; observation = 'RUNTIME_OBSERVATION_UNAVAILABLE'; }
          } else {
            const managed = kernel.snapshot(); discoveredSessions = managed.lanes.length; activeSessions = managed.lanes.filter(lane => lane.state === 'RUNNING').length;
          }
          const gatewayStatus = adoptionPort ? (hcpAccepted ? 'online' : 'unknown') : (kernel.status === 'READY' ? 'online' : 'unknown');
          json(res, 200, {
            gateway: { status: gatewayStatus, deployment: deployment.discovery },
            hosts: [{ hostId: config.target.hostId, status: gatewayStatus, lastSeen: hcpAccepted ? 'CONNECTED_NOW' : 'UNKNOWN' }],
            runtimes: adoptionPort ? [{ adapterId: 'codex-native', enabled: true, shared: true, status: runtimeStatus, discoveredSessions, observation }] : [],
            sessions: { discovered: discoveredSessions, active: activeSessions },
            attention: [...(gatewayStatus === 'online' ? [] : [{ code: 'HOST_CONNECTION_UNKNOWN' }]), ...(observation ? [{ code: observation }] : [])],
            devices: devices.projections(),
          }); return;
        }
        if (req.method === 'POST' && req.url === '/api/client') {
          requireThat(canonical(await body(req)) === '{}', 'SCHEMA_INVALID'); requireThat(clients.size < 64, 'CLIENT_LIMIT');
          const client = { actorId, clientInstanceId: randomUUID(), grantId: randomUUID(), grantRevision: '1', expiresAt: Math.min(now() + 30 * 60_000, sessions.get(authenticatedSession)!.expiresAt), csrf: randomBytes(32).toString('hex'), session: authenticatedSession };
          clients.set(client.clientInstanceId, client); const { session: _, ...projection } = client; json(res, 200, projection); return;
        }
        if (req.method === 'GET' && req.url === '/api/devices') { grant(req); json(res, 200, devices.projections()); return; }
        if (req.method === 'POST' && /^\/api\/devices\/[0-9a-f-]{36}\/(approve|revoke)$/.test(req.url ?? '')) {
          grant(req); requireThat(canonical(await body(req)) === '{}', 'SCHEMA_INVALID');
          const match = /^\/api\/devices\/([0-9a-f-]{36})\/(approve|revoke)$/.exec(req.url!)!;
          const device = match[2] === 'approve' ? devices.approve(match[1]!) : devices.revoke(match[1]!); persistDevices(); json(res, 200, { requestId: device.requestId, state: device.state }); return;
        }
        if (req.method === 'POST' && req.url === '/api/client/renew') {
          // Authenticate again after reading the body; a concurrent rotation cannot
          // reuse a previously checked grant. Never recreate an expired identity.
          const value = await body(req) as any;
          const previous = grant(req);
          requireThat(value && Object.keys(value).sort().join(',') === 'continuity,grantId,grantRevision' &&
            value.grantId === previous.grantId && value.grantRevision === previous.grantRevision, 'CLIENT_RENEWAL_REJECTED');
          const next = { ...previous, grantRevision: String(BigInt(previous.grantRevision) + 1n),
            expiresAt: Math.min(now() + 30 * 60_000, sessions.get(authenticatedSession)!.expiresAt), csrf: randomBytes(32).toString('hex') };
          requireThat(next.expiresAt > previous.expiresAt, 'CLIENT_RENEWAL_SESSION_LIMIT');
          // Retire old credentials before crossing IPC. Any failure or lost response
          // is closed; neither this route nor the browser retries the renewal.
          clients.delete(previous.clientInstanceId);
          if (adoptionPort) await adoptionPort.renewClient(adoptionClient(previous), adoptionClient(next), value.continuity);
          else requireThat(value.continuity === null, 'CLIENT_RENEWAL_REJECTED');
          requireThat(session(req) === authenticatedSession && next.expiresAt > now(), 'CLIENT_RENEWAL_EXPIRED');
          clients.set(next.clientInstanceId, next);
          const { session: _, ...projection } = next; json(res, 200, projection); return;
        }
        if (req.method === 'GET' && req.url === '/api/events') {
          requireThat(req.headers.origin === origin || req.headers['sec-fetch-site'] === 'same-origin', 'OBSERVATION_ORIGIN_REJECTED');
          requireThat(streams.size < 16, 'OBSERVER_LIMIT');
          res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' }); res.write(`data: ${kernel.snapshot().cursor}\n\n`); streams.add(res);
          const expiry = setTimeout(() => res.end(), Math.min(30 * 60_000, sessions.get(authenticatedSession)!.expiresAt - now(), sessions.get(authenticatedSession)!.idleExpiresAt - now()));
          req.on('close', () => { clearTimeout(expiry); streams.delete(res); }); return;
        }
        if (req.method === 'GET' && req.url === '/api/native/events') {
          requireThat(!!adoptionPort, 'ROUTE_NOT_FOUND');
          requireThat(req.headers.origin === origin || req.headers['sec-fetch-site'] === 'same-origin', 'OBSERVATION_ORIGIN_REJECTED');
          requireThat(nativeStreams.size < 16, 'OBSERVER_LIMIT');
          res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
          res.write(`data: ${JSON.stringify({ revision: nativeRevision, eventId: `hello-${nativeRevision}`, stream: 'fleet.control', kind: 'reconnect', threadId: null, turnId: null })}\n\n`);
          nativeStreams.add(res); ensureNativeSubscription(); void catchUpNativeRealtime();
          const expiry = setTimeout(() => res.end(), Math.min(30 * 60_000, sessions.get(authenticatedSession)!.expiresAt - now(), sessions.get(authenticatedSession)!.idleExpiresAt - now()));
          req.on('close', () => { clearTimeout(expiry); nativeStreams.delete(res); stopNativeSubscription(); }); return;
        }
        grant(req);
        if (req.method === 'GET' && req.url === '/api/mode') { json(res, 200, { mode: adoptionPort ? 'NATIVE_ADOPTION' : 'FLEETSPLICE_MANAGED' }); return; }
        if (adoptionPort) {
          if (req.method === 'GET' && (req.url === '/api/native/snapshot' || req.url?.startsWith('/api/native/snapshot?'))) {
            const discover = new URL(req.url!, origin).searchParams.get('discover') === '1';
            json(res, 200, await adoptionPort.snapshot(discover ? { discover: true } : {})); return;
          }
          if (req.method === 'POST' && req.url === '/api/native/commands') {
            const command = await body(req); const client = grant(req); json(res, 200, await adoptionPort.execute(command, adoptionClient(client))); catchUpAfterCommandIfNeeded(); return;
          }
          if (req.method === 'GET' && /^\/api\/native\/commands\/[a-zA-Z0-9_-]{1,200}$/.test(req.url ?? '')) {
            const receipt = await adoptionPort.lookup(req.url!.slice('/api/native/commands/'.length)); json(res, receipt ? 200 : 404, receipt ?? { error: 'COMMAND_UNKNOWN_NO_REPLAY' }); return;
          }
          throw new Fault('ROUTE_NOT_FOUND');
        }
        if (req.method === 'GET' && req.url === '/api/snapshot') { json(res, 200, kernel.snapshot()); return; }
        if (req.method === 'GET' && /^\/api\/commands\/[0-9a-f-]{36}$/.test(req.url ?? '')) {
          const record = kernel.lookup(req.url!.slice('/api/commands/'.length)); json(res, record ? 200 : 404, record ?? { error: 'COMMAND_UNKNOWN' }); return;
        }
        if (req.method === 'POST' && req.url === '/api/commands') { const result = await kernel.execute(await body(req), grant(req)); json(res, 200, result); return; }
        throw new Fault('ROUTE_NOT_FOUND');
      }
      requireThat(req.method === 'GET' && (req.url === '/' || /^\/assets\/[a-zA-Z0-9_-]+\.(js|css)$/.test(req.url ?? '')), 'ROUTE_NOT_FOUND');
      const filename = path.join(config.webDirectory, req.url === '/' ? 'index.html' : req.url!.slice(1));
      const bytes = readFileSync(filename);
      res.writeHead(200, { 'Content-Type': filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html' }); res.end(bytes);
    } catch (error) {
      if (res.headersSent) res.end();
      else if (error instanceof AdmissionRejected) json(res, 409, { error: error.code, admission: 'REJECTED_BEFORE_ADMISSION', commandId: error.commandId, canonicalCommandId: error.canonicalCommandId, intentDigest: error.intentDigest });
      else json(res, error instanceof Fault && error.code === 'ROUTE_NOT_FOUND' ? 404 : 403, { error: error instanceof Fault ? error.code : 'REQUEST_REJECTED' });
    }
  };
  const server = listener.tls ? createHttpsServer({ key: listener.tls.keyPem, cert: listener.tls.certPem }, requestHandler) : createHttpServer(requestHandler);
  const listenerSockets = new Set<Socket>();
  server.on('connection', socket => { listenerSockets.add(socket); socket.once('close', () => listenerSockets.delete(socket)); });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 262144, perMessageDeflate: false, handleProtocols: protocols => protocols.has('fleetsplice.hcp.v1') ? 'fleetsplice.hcp.v1' : false });
  const enrollmentRequired = new WeakMap<WebSocket, boolean>();
  server.on('upgrade', (req, socket, head) => {
    const authorization = req.headers.authorization;
    const bootstrapAccepted = equalSecret(authorization ?? '', `Bearer ${config.hcpToken}`);
    // An enrolled Edge intentionally has no bearer. A supplied but incorrect
    // bearer is neither bootstrap nor an enrollment request and is rejected
    // before it can hold the one pending HCP admission slot.
    const enrollmentRequested = authorization === undefined;
    if (hcpAccepted || hcpPending || !bootstrapAccepted && !enrollmentRequested || req.url !== '/hcp/v1/connect' || req.headers.host !== host || (deployment.kind === 'LOOPBACK' && req.socket.remoteAddress !== '127.0.0.1' && req.socket.remoteAddress !== '::1') || req.headers.origin !== origin || req.headers['sec-websocket-protocol'] !== 'fleetsplice.hcp.v1') { socket.destroy(); return; }
    hcpPending = true; wss.handleUpgrade(req, socket, head, ws => { enrollmentRequired.set(ws, !bootstrapAccepted); wss.emit('connection', ws); });
  });
  wss.on('connection', (ws: WebSocket) => {
    edge = ws; let hello = false; let pendingEnrollment: Extract<Hcp, { kind: 'hello' }> | null = null; let connectedHostId: string | null = null;
    const admit = (recovered: boolean) => {
      requireThat(edge === ws, 'STALE_CONNECTION');
      // Binding precedes ready, so the Edge cannot start realtime/native work
      // before this exact authenticated socket owns the proxy generation.
      edgeGeneration = remoteAdoption?.bindSender(message => sendTo(ws, message)) ?? null;
      hello = true; hcpAccepted = true; hcpPending = false; kernel.ready(recovered);
      sendTo(ws, { v: 1, kind: 'ready', connectionId: config.target.connectionId, target: config.target, recoveryRequired: kernel.status === 'RECOVERY_REQUIRED' });
    };
    ws.on('message', (data, binary) => {
      try {
        requireThat(!binary, 'HCP_BINARY_REJECTED');
        const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
        requireThat(message.connectionId === config.target.connectionId && canonical(message.target) === canonical(config.target), 'STALE_CONNECTION');
        if (message.kind === 'hello' && !hello) {
          requireThat(message.identity.sid === config.sid && message.identity.principal === config.principal && message.identity.sessionId === config.sessionId && message.identity.root === config.root && message.identity.rootIdentity === config.target.rootIdentity, 'EDGE_IDENTITY_REJECTED');
          if (enrollmentRequired.get(ws)) {
            requireThat(!!message.enrollment && message.enrollment.hostId === config.target.hostId && message.enrollment.environmentId === config.target.environmentId, 'HOST_NOT_ENROLLED');
            const challenge = devices.issueChallenge(message.enrollment.hostId, now()); requireThat(canonical(challenge.expected) === canonical(message.enrollment), 'ENROLLMENT_IDENTITY_MISMATCH');
            pendingEnrollment = message; sendTo(ws, { v: 1, kind: 'enrollment.challenge', connectionId: config.target.connectionId, target: config.target, challenge }); return;
          }
          admit(message.recovered);
        } else if (message.kind === 'enrollment.proof' && !hello && pendingEnrollment) {
          requireThat(message.hostId === pendingEnrollment.enrollment!.hostId, 'ENROLLMENT_IDENTITY_MISMATCH'); devices.admitProof(message.hostId, message.proof, now()); connectedHostId = message.hostId;
          admit(pendingEnrollment.recovered);
        } else {
          requireThat(hello && edge === ws && hcpAccepted, 'HCP_NOT_ADMITTED');
          if (message.kind === 'receipt') {
            const item = pending.get(message.receipt.edgeCommandId);
            if (item) { clearTimeout(item.timer); pending.delete(message.receipt.edgeCommandId); item.resolve(message.receipt); }
            else journal.append('LATE_RECEIPT_OBSERVATION', message.receipt.edgeCommandId, message.receipt);
          } else if (message.kind === 'event') kernel.event(message.event);
          else if (message.kind === 'closed') kernel.disconnect(message.reason);
          else if (message.kind === 'adoption.response' || message.kind === 'adoption.realtime') {
            requireThat(remoteAdoption, 'HCP_UNEXPECTED_MESSAGE');
            requireThat(edgeGeneration !== null, 'HCP_NOT_ADMITTED');
            remoteAdoption.accept(message, edgeGeneration);
          }
          else throw new Fault('HCP_UNEXPECTED_MESSAGE');
        }
      } catch { if (edge === ws) kernel.disconnect('RECOVERY_REQUIRED'); ws.close(); }
    });
    ws.on('close', () => {
      // An old socket may finish closing after a replacement was admitted. It
      // must not detach the current socket or invalidate its proxy generation.
      if (edge !== ws) return;
      const detachedGeneration = edgeGeneration;
      if (connectedHostId) devices.disconnect(connectedHostId);
      edge = null; edgeGeneration = null; edgeDetached(); kernel.disconnect();
      if (detachedGeneration !== null) remoteAdoption?.unbind(detachedGeneration, 'EDGE_DISCONNECTED');
      for (const item of pending.values()) { clearTimeout(item.timer); item.reject(); } pending.clear();
    });
    ws.on('error', () => { if (edge === ws) kernel.disconnect(); });
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(config.port, listener.host, resolve); });
  return { kernel, waitForEdgeDetach, close: async () => {
    if (nativeUnsubscribe) { nativeUnsubscribe(); nativeUnsubscribe = null; }
    for (const stream of streams) stream.end();
    for (const stream of nativeStreams) stream.end();
    remoteAdoption?.dispose('GATEWAY_DISPOSED');
    edge?.close(); for (const client of wss.clients) client.terminate(); wss.close();
    for (const socket of listenerSockets) socket.destroy();
    await new Promise<void>(resolve => server.close(() => resolve())); journal.close();
  } };
}

if (process.send && process.argv[1] === fileURLToPath(import.meta.url)) process.once('message', async (config: HubConfig) => {
  try {
    const hub = await startHub(config); process.send!({ kind: 'hubListening' });
    process.on('message', async message => {
      if ((message as any).kind === 'stop') { await hub.close(); process.exit(0); }
      if ((message as any).kind === 'waitEdgeDetach') { await hub.waitForEdgeDetach(); process.send!({ kind: 'edgeDetached' }); }
    });
    process.on('disconnect', async () => { await hub.close(); process.exit(2); });
  } catch { process.send!({ kind: 'error', code: 'HUB_START_FAILED' }); process.exitCode = 1; }
});
