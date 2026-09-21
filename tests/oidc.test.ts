import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import test from 'node:test';
import { GenericOidcAuthenticator, principalFromClaims } from '../packages/oidc/index.ts';

const issuer = 'https://issuer.example'; const redirectUri = 'https://fleet.example/auth/oidc/callback';
const keypair = generateKeyPairSync('rsa', { modulusLength: 2048 }); const jwk = keypair.publicKey.export({ format: 'jwk' });
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = (nonce: string, patch: Record<string, unknown> = {}) => {
  const header = encode({ alg: 'RS256', kid: 'fixture' }); const claims = encode({ iss: issuer, aud: 'fleet-client', sub: 'owner-123', nonce, exp: Math.floor(Date.now() / 1000) + 60, iat: Math.floor(Date.now() / 1000), name: 'Owner', email: 'owner@example.test', groups: ['owners'], ...patch });
  return `${header}.${claims}.${sign('RSA-SHA256', Buffer.from(`${header}.${claims}`), keypair.privateKey).toString('base64url')}`;
};
const fixtureFetch: typeof fetch = async input => {
  const url = String(input);
  if (url.includes('openid-configuration')) return new Response(JSON.stringify({ issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`, jwks_uri: `${issuer}/jwks` }), { status: 200 });
  if (url.endsWith('/jwks')) return new Response(JSON.stringify({ keys: [{ ...jwk, kid: 'fixture', alg: 'RS256' }] }), { status: 200 });
  return new Response(JSON.stringify({ id_token: token((fixtureFetch as any).nonce) }), { status: 200 });
};

test('generic OIDC normalizes issuer and subject into a stable Fleet principal', async () => {
  const auth = new GenericOidcAuthenticator({ issuer, clientId: 'fleet-client', redirectUri }, fixtureFetch);
  const started = await auth.start(); (fixtureFetch as any).nonce = started.nonce;
  assert.match(started.authorizationUrl, /response_type=code/); assert.match(started.authorizationUrl, /state=/);
  const principal = await auth.complete({ state: started.state, code: 'fixture-code' });
  assert.equal(principal.issuer, issuer); assert.equal(principal.subject, 'owner-123'); assert.equal(principal.email, 'owner@example.test'); assert.deepEqual(principal.groups, ['owners']);
  assert.equal(principal.id, principalFromClaims({ sub: 'owner-123' }, issuer).id);
});

test('generic OIDC consumes state and rejects wrong nonce or token audience', async () => {
  const auth = new GenericOidcAuthenticator({ issuer, clientId: 'fleet-client', redirectUri }, fixtureFetch);
  const started = await auth.start(); (fixtureFetch as any).nonce = 'wrong';
  await assert.rejects(auth.complete({ state: started.state, code: 'fixture-code' }), /OIDC_ID_TOKEN_CLAIMS_INVALID/);
  await assert.rejects(auth.complete({ state: started.state, code: 'fixture-code' }), /OIDC_STATE_INVALID/);
});
