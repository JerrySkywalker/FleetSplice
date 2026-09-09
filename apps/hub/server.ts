import { createServer, type ServerResponse, type IncomingMessage } from 'node:http';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { Fault, parseJson, canonical, requireThat, validate, type Target, type Hcp, type EdgeCommand, type Receipt } from '../../packages/contracts/index.ts';
import { HubKernel, AdmissionRejected, type ClientGrant } from './kernel.ts';
import { Journal } from '../../packages/journal/index.ts';
import type { WorkspaceBinding } from '../../packages/contracts/index.ts';

export type HubConfig = { port: number; target: Target; root: string; sid: string; principal: string; sessionId: number; stateDirectory: string; webDirectory: string; hcpToken: string; bootstrapToken: string; workspaces?: WorkspaceBinding[] };
const equalSecret = (a: string, b: string) => {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export async function startHub(config: HubConfig) {
  const origin = `http://127.0.0.1:${config.port}`; const host = `127.0.0.1:${config.port}`;
  const actorId = randomUUID();
  const sessions = new Map<string, number>();
  const clients = new Map<string, ClientGrant & { csrf: string; session: string }>();
  const streams = new Set<ServerResponse>();
  let edge: WebSocket | null = null; let usedBootstrap = false; let hcpAccepted = false;
  const pending = new Map<string, { resolve: (receipt: Receipt) => void; reject: () => void; timer: NodeJS.Timeout }>();
  const send = (message: Hcp) => {
    requireThat(edge?.readyState === WebSocket.OPEN && edge.bufferedAmount < 262144, 'EDGE_DISCONNECTED');
    edge.send(canonical(message));
  };
  const journal = new Journal(path.join(config.stateDirectory, 'hub.sqlite'));
  const kernel = new HubKernel(journal, config.target, config.root, (command: EdgeCommand) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(command.edgeCommandId); reject(new Fault('RECEIPT_UNKNOWN')); }, 55000);
    pending.set(command.edgeCommandId, { resolve, reject: () => reject(new Fault('EDGE_DISCONNECTED')), timer });
    try { send({ v: 1, kind: 'command', connectionId: config.target.connectionId, target: config.target, command }); }
    catch (error) { clearTimeout(timer); pending.delete(command.edgeCommandId); reject(error); }
  }), () => { for (const stream of streams) if (!stream.write(`data: ${kernel.snapshot().cursor}\n\n`)) { stream.end(); streams.delete(stream); } }, config.workspaces);
  const json = (res: ServerResponse, status: number, value: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  const body = async (req: IncomingMessage) => {
    const chunks: Buffer[] = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; requireThat(size <= 262144, 'MESSAGE_TOO_LARGE'); chunks.push(chunk); }
    return parseJson(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  };
  const session = (req: IncomingMessage): string => {
    const cookie = /(?:^|;\s*)fleetsplice=([0-9a-f]{64})(?:;|$)/.exec(req.headers.cookie ?? '')?.[1];
    requireThat(cookie && (sessions.get(cookie) ?? 0) > Date.now(), 'AUTH_REQUIRED'); return cookie;
  };
  const grant = (req: IncomingMessage) => {
    const client = clients.get(String(req.headers['x-fleet-client']));
    requireThat(client && client.session === session(req) && equalSecret(String(req.headers['x-fleet-csrf']), client.csrf) && client.expiresAt > Date.now(), 'CLIENT_AUTH_REQUIRED'); return client;
  };
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      requireThat(req.headers.host === host && req.socket.remoteAddress === '127.0.0.1', 'HOST_REJECTED');
      if (req.headers.origin) requireThat(req.headers.origin === origin, 'ORIGIN_REJECTED');
      if (req.method === 'POST') requireThat(req.headers.origin === origin && req.headers['content-type'] === 'application/json', 'ORIGIN_OR_CONTENT_TYPE_REJECTED');
      if (req.method === 'POST' && req.url === '/api/bootstrap') {
        const value = await body(req) as any;
        requireThat(value && Object.keys(value).length === 1 && typeof value.token === 'string' && !usedBootstrap && equalSecret(value.token, config.bootstrapToken), 'BOOTSTRAP_REJECTED');
        usedBootstrap = true; const token = randomBytes(32).toString('hex'); sessions.set(token, Date.now() + 8 * 60 * 60_000);
        res.setHeader('Set-Cookie', `fleetsplice=${token}; HttpOnly; SameSite=Strict; Path=/`); json(res, 200, { authenticated: true }); return;
      }
      if (req.url?.startsWith('/api/')) {
        const authenticatedSession = session(req);
        if (req.method === 'POST' && req.url === '/api/client') {
          requireThat(canonical(await body(req)) === '{}', 'SCHEMA_INVALID'); requireThat(clients.size < 64, 'CLIENT_LIMIT');
          const client = { actorId, clientInstanceId: randomUUID(), grantId: randomUUID(), grantRevision: '1', expiresAt: Date.now() + 30 * 60_000, csrf: randomBytes(32).toString('hex'), session: authenticatedSession };
          clients.set(client.clientInstanceId, client); const { session: _, ...projection } = client; json(res, 200, projection); return;
        }
        if (req.method === 'GET' && req.url === '/api/events') {
          requireThat(req.headers.origin === origin || req.headers['sec-fetch-site'] === 'same-origin', 'OBSERVATION_ORIGIN_REJECTED');
          requireThat(streams.size < 16, 'OBSERVER_LIMIT');
          res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' }); res.write(`data: ${kernel.snapshot().cursor}\n\n`); streams.add(res);
          const expiry = setTimeout(() => res.end(), Math.min(30 * 60_000, sessions.get(authenticatedSession)! - Date.now()));
          req.on('close', () => { clearTimeout(expiry); streams.delete(res); }); return;
        }
        grant(req);
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
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 262144, perMessageDeflate: false, handleProtocols: protocols => protocols.has('fleetsplice.hcp.v1') ? 'fleetsplice.hcp.v1' : false });
  server.on('upgrade', (req, socket, head) => {
    if (hcpAccepted || req.url !== '/hcp/v1/connect' || req.headers.host !== host || req.socket.remoteAddress !== '127.0.0.1' || req.headers.origin !== origin || req.headers['sec-websocket-protocol'] !== 'fleetsplice.hcp.v1' || !equalSecret(req.headers.authorization ?? '', `Bearer ${config.hcpToken}`)) { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, ws => { hcpAccepted = true; wss.emit('connection', ws); });
  });
  wss.on('connection', (ws: WebSocket) => {
    edge = ws; let hello = false;
    ws.on('message', (data, binary) => {
      try {
        requireThat(!binary, 'HCP_BINARY_REJECTED');
        const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
        requireThat(message.connectionId === config.target.connectionId && canonical(message.target) === canonical(config.target), 'STALE_CONNECTION');
        if (message.kind === 'hello' && !hello) {
          requireThat(message.identity.sid === config.sid && message.identity.principal === config.principal && message.identity.sessionId === config.sessionId && message.identity.root === config.root && message.identity.rootIdentity === config.target.rootIdentity, 'EDGE_IDENTITY_REJECTED');
          hello = true; kernel.ready(message.recovered); send({ v: 1, kind: 'ready', connectionId: config.target.connectionId, target: config.target, recoveryRequired: kernel.status === 'RECOVERY_REQUIRED' });
        } else {
          requireThat(hello, 'HCP_NOT_ADMITTED');
          if (message.kind === 'receipt') {
            const item = pending.get(message.receipt.edgeCommandId);
            if (item) { clearTimeout(item.timer); pending.delete(message.receipt.edgeCommandId); item.resolve(message.receipt); }
            else journal.append('LATE_RECEIPT_OBSERVATION', message.receipt.edgeCommandId, message.receipt);
          } else if (message.kind === 'event') kernel.event(message.event);
          else if (message.kind === 'closed') kernel.disconnect(message.reason);
          else throw new Fault('HCP_UNEXPECTED_MESSAGE');
        }
      } catch { kernel.disconnect('RECOVERY_REQUIRED'); ws.close(); }
    });
    ws.on('close', () => { edge = null; kernel.disconnect(); for (const item of pending.values()) { clearTimeout(item.timer); item.reject(); } pending.clear(); });
    ws.on('error', () => { kernel.disconnect(); });
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(config.port, '127.0.0.1', resolve); });
  return { kernel, close: async () => { for (const stream of streams) stream.end(); edge?.close(); wss.close(); await new Promise<void>(resolve => server.close(() => resolve())); journal.close(); } };
}

if (process.send && process.argv[1] === fileURLToPath(import.meta.url)) process.once('message', async (config: HubConfig) => {
  try {
    const hub = await startHub(config); process.send!({ kind: 'hubListening' });
    process.on('message', async message => { if ((message as any).kind === 'stop') { await hub.close(); process.exit(0); } });
    process.on('disconnect', async () => { await hub.close(); process.exit(2); });
  } catch { process.send!({ kind: 'error', code: 'HUB_START_FAILED' }); process.exitCode = 1; }
});
