/** Disposable real Gateway + synthetic OIDC provider. Never imports a native adapter. */
import { createServer } from 'node:https';
import { createServer as probeServer } from 'node:net';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { startHub } from '../../apps/hub/server.ts';
import { target } from '../helpers.ts';
import { createFpxOwnerFixture } from './fpx-owner-preview.ts';

const directory = process.argv[2]!;
const tls = { keyPem: readFileSync(path.join(directory, 'key.pem'), 'utf8'), certPem: readFileSync(path.join(directory, 'cert.pem'), 'utf8') };
const probe = probeServer();
await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = (probe.address() as { port: number }).port;
await new Promise<void>(resolve => probe.close(() => resolve()));
const origin = `https://127.0.0.1:${port}`;
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...keys.publicKey.export({ format: 'jwk' }), kid: 'u160-synthetic', alg: 'RS256', use: 'sig' };
const codes = new Map<string, string>(); let issuer = ''; let exchanges = 0; let clock = Date.now(); let subject = 'synthetic-owner';
const idp = createServer({ key: tls.keyPem, cert: tls.certPem }, async (req, res) => {
  const url = new URL(req.url!, issuer);
  const json = (value: unknown) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)); };
  if (url.pathname === '/.well-known/openid-configuration') return json({ issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`, jwks_uri: `${issuer}/jwks` });
  if (url.pathname === '/jwks') return json({ keys: [jwk] });
  if (url.pathname === '/authorize') {
    const code = randomUUID(); codes.set(code, url.searchParams.get('nonce')!);
    const callback = new URL('/auth/oidc/callback', origin); callback.searchParams.set('state', url.searchParams.get('state')!); callback.searchParams.set('code', code);
    res.writeHead(302, { location: callback.toString() }); res.end(); return;
  }
  if (url.pathname === '/token') {
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk);
    const code = new URLSearchParams(Buffer.concat(chunks).toString()).get('code')!;
    const nonce = codes.get(code); codes.delete(code);
    if (!nonce) { res.statusCode = 400; return json({ error: 'invalid_grant' }); }
    exchanges++;
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const signed = `${encode({ alg: 'RS256', kid: jwk.kid })}.${encode({ iss: issuer, aud: 'u160-fixture', sub: subject, name: 'Synthetic Owner', nonce, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })}`;
    return json({ id_token: `${signed}.${sign('RSA-SHA256', Buffer.from(signed), keys.privateKey).toString('base64url')}` });
  }
  res.statusCode = 404; res.end();
});
await new Promise<void>(resolve => idp.listen(0, 'localhost', resolve));
issuer = `https://localhost:${(idp.address() as { port: number }).port}`;
mkdirSync(path.join(directory, 'state'), { recursive: true });
const fixture = createFpxOwnerFixture();
const hub = await startHub({ port, target: target(), root: 'V:\\u160-synthetic', sid: 'u160-synthetic', principal: 'u160-synthetic', sessionId: 1,
  stateDirectory: path.join(directory, 'state'), webDirectory: path.resolve('dist/web'), hcpToken: randomUUID(), bootstrapToken: randomUUID(),
  deployment: { kind: 'PUBLIC_HTTPS', publicBaseUrl: origin }, listener: { host: '127.0.0.1', tls },
  auth: { mode: 'OIDC', provider: { issuer, clientId: 'u160-fixture', redirectUri: `${origin}/auth/oidc/callback` } } }, fixture.port, () => clock);
process.send!({ kind: 'ready', origin });
process.on('message', async (message: { kind: string; id: number }) => {
  if (message.kind === 'expire') clock += 8 * 60 * 60_000 + 1;
  if (message.kind === 'idle14') clock += 14 * 60_000;
  if (message.kind === 'idle2') clock += 2 * 60_000;
  if (message.kind === 'unknown') fixture.setScenario('unknown');
  if (message.kind === 'otherOwner') subject = 'synthetic-other';
  if (message.kind !== 'stop') process.send!({ kind: 'reply', id: message.id, exchanges, ...fixture.counters() });
  if (message.kind === 'stop') { fixture.close(); await hub.close(); idp.closeAllConnections(); await new Promise<void>(resolve => idp.close(() => resolve())); process.exit(0); }
});
