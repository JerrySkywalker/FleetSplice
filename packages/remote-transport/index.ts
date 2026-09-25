import { createServer as createHttpsServer, type Server as HttpsServer } from 'node:https';
import { X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { WebSocketServer, WebSocket, type ClientOptions } from 'ws';
import { requireThat } from '../contracts/json.ts';

export type EphemeralTlsMaterial = {
  hostname: string;
  keyPem: string;
  certPem: string;
};

/**
 * Local/test TLS only. Fresh, explicitly trusted localhost material prevents
 * historical fixture expiry from changing test results. Requires OpenSSL on
 * PATH; never installs trust or creates production certificates.
 */
export function createEphemeralTlsMaterial(hostname = 'localhost'): EphemeralTlsMaterial {
  requireThat(hostname === 'localhost', 'EPHEMERAL_TLS_HOSTNAME_FIXED_FOR_FIXTURE');
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-local-test-tls-'));
  const key = path.join(directory, 'key.pem'), cert = path.join(directory, 'cert.pem');
  const config = path.join(directory, 'openssl.cnf');
  try {
    writeFileSync(config, '[req]\ndistinguished_name=dn\n[dn]\n', { mode: 0o600 });
    try {
      execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2',
        '-config', config,
        '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost',
        '-keyout', key, '-out', cert], { windowsHide: true, stdio: 'pipe', timeout: 20000 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('OPENSSL_LOCAL_TEST_TLS_REQUIRED: OpenSSL on PATH is required for ephemeral localhost test TLS only');
      }
      throw error;
    }
    return { hostname, keyPem: readFileSync(key, 'utf8'), certPem: readFileSync(cert, 'utf8') };
  } finally {
    for (const file of [key, cert, config]) if (existsSync(file)) unlinkSync(file);
    rmdirSync(directory);
  }
}

export type RemoteWssProfile = {
  mode: 'REMOTE_ENROLLED_WSS';
  maxPayload: 262144;
  compression: false;
  subprotocol: 'fleetsplice.hcp.v1';
};

export const REMOTE_ENROLLED_WSS: RemoteWssProfile = {
  mode: 'REMOTE_ENROLLED_WSS',
  maxPayload: 262144,
  compression: false,
  subprotocol: 'fleetsplice.hcp.v1',
};

export async function startEphemeralHcpWssServer(options: {
  tls: EphemeralTlsMaterial;
  onConnection: (ws: WebSocket) => void;
  activeEdgeLimit?: number;
}): Promise<{ port: number; wss: WebSocketServer; server: HttpsServer; close: () => Promise<void> }> {
  let active = 0;
  const limit = options.activeEdgeLimit ?? 1;
  const server = createHttpsServer({ key: options.tls.keyPem, cert: options.tls.certPem });
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: REMOTE_ENROLLED_WSS.maxPayload,
    perMessageDeflate: REMOTE_ENROLLED_WSS.compression,
    handleProtocols: protocols => protocols.has(REMOTE_ENROLLED_WSS.subprotocol) ? REMOTE_ENROLLED_WSS.subprotocol : false,
  });
  server.on('upgrade', (req, socket, head) => {
    try {
      requireThat(req.url === '/hcp/v1/connect', 'HCP_PATH_REJECTED');
      requireThat(active < limit, 'DUPLICATE_ACTIVE_EDGE_CONNECTION');
      wss.handleUpgrade(req, socket, head, ws => {
        active++;
        ws.on('close', () => { active = Math.max(0, active - 1); });
        options.onConnection(ws);
        wss.emit('connection', ws, req);
      });
    } catch {
      socket.destroy();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = (server.address() as { port: number }).port;
  return {
    port,
    wss,
    server,
    close: async () => {
      wss.close();
      await new Promise<void>(resolve => server.close(() => resolve()));
    },
  };
}

export function connectEphemeralHcpWss(options: {
  port: number;
  tls: EphemeralTlsMaterial;
  expectedHostname: string;
  authorization?: string;
}): WebSocket {
  requireThat(options.expectedHostname === options.tls.hostname, 'TLS_HOSTNAME_MISMATCH');
  const peer = new X509Certificate(options.tls.certPem);
  requireThat(peer.subject.includes(`CN=${options.expectedHostname}`), 'TLS_HOSTNAME_MISMATCH');
  const clientOptions: ClientOptions = {
    rejectUnauthorized: true,
    ca: options.tls.certPem,
    perMessageDeflate: false,
    maxPayload: REMOTE_ENROLLED_WSS.maxPayload,
    headers: options.authorization ? { Authorization: options.authorization } : {},
  };
  // TLS servername is carried via the URL host for this loopback fixture.
  return new WebSocket(`wss://localhost:${options.port}/hcp/v1/connect`, REMOTE_ENROLLED_WSS.subprotocol, clientOptions);
}

export function assertSendBudget(ws: WebSocket, maxBuffered = 262144) {
  requireThat(ws.readyState === WebSocket.OPEN && ws.bufferedAmount < maxBuffered, 'HCP_BACKPRESSURE_OR_DISCONNECTED');
}
