import { createHash, createPublicKey, randomBytes, verify } from 'node:crypto';
import { Fault, requireThat } from '../contracts/index.ts';

export type OidcProviderConfig = { issuer: string; clientId: string; clientSecret?: string; redirectUri: string; scopes?: string[] };
export type OidcDiscovery = { issuer: string; authorization_endpoint: string; token_endpoint: string; jwks_uri: string };
export type HumanPrincipal = { id: string; issuer: string; subject: string; displayName: string | null; email: string | null; avatar: string | null; groups: string[] };
export type OidcStart = { state: string; nonce: string; authorizationUrl: string };
type Pending = { nonce: string; expiresAt: number };
type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

const b64 = (part: string) => Buffer.from(part, 'base64url');
const json = (part: string, code: string): Record<string, unknown> => {
  try { const value = JSON.parse(b64(part).toString('utf8')); requireThat(!!value && typeof value === 'object' && !Array.isArray(value), code); return value as Record<string, unknown>; }
  catch (error) { if (error instanceof Fault) throw error; throw new Fault(code); }
};
const exactUrl = (value: string, code: string) => { try { const url = new URL(value); requireThat(url.protocol === 'https:' && !url.username && !url.password && !url.hash, code); return url; } catch (error) { if (error instanceof Fault) throw error; throw new Fault(code); } };
const audience = (value: unknown, clientId: string) => typeof value === 'string' ? value === clientId : Array.isArray(value) && value.includes(clientId);
const algorithm = (alg: unknown) => ({ RS256: 'RSA-SHA256', RS384: 'RSA-SHA384', RS512: 'RSA-SHA512', ES256: 'sha256', ES384: 'sha384', EdDSA: null } as const)[String(alg)];

export function principalFromClaims(claims: Record<string, unknown>, issuer: string): HumanPrincipal {
  const subject = typeof claims.sub === 'string' && claims.sub.length > 0 ? claims.sub : null;
  requireThat(subject, 'OIDC_SUBJECT_INVALID');
  const metadata = (name: string) => typeof claims[name] === 'string' && claims[name]!.length <= 1024 ? claims[name] as string : null;
  const groups = Array.isArray(claims.groups) ? claims.groups.filter((value): value is string => typeof value === 'string' && value.length <= 256).slice(0, 128) : [];
  return { id: createHash('sha256').update(`${issuer}\0${subject}`).digest('hex'), issuer, subject, displayName: metadata('name'), email: metadata('email'), avatar: metadata('picture'), groups };
}

export class GenericOidcAuthenticator {
  private readonly pending = new Map<string, Pending>();
  constructor(private readonly config: OidcProviderConfig, private readonly fetcher: typeof fetch = fetch, private readonly now: () => number = Date.now) {
    exactUrl(config.issuer, 'OIDC_ISSUER_INVALID'); exactUrl(config.redirectUri, 'OIDC_REDIRECT_URI_INVALID');
    requireThat(config.clientId.length > 0 && config.clientId.length <= 512, 'OIDC_CLIENT_ID_INVALID');
  }
  async start(): Promise<OidcStart> {
    const discovery = await this.discovery(); const state = randomBytes(32).toString('base64url'); const nonce = randomBytes(32).toString('base64url');
    this.pending.set(state, { nonce, expiresAt: this.now() + 5 * 60_000 });
    const url = exactUrl(discovery.authorization_endpoint, 'OIDC_AUTHORIZATION_ENDPOINT_INVALID');
    url.searchParams.set('response_type', 'code'); url.searchParams.set('client_id', this.config.clientId); url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('scope', (this.config.scopes?.length ? this.config.scopes : ['openid', 'profile', 'email']).join(' ')); url.searchParams.set('state', state); url.searchParams.set('nonce', nonce);
    return { state, nonce, authorizationUrl: url.toString() };
  }
  async complete(input: { state: string; code: string }): Promise<HumanPrincipal> {
    const pending = this.pending.get(input.state); this.pending.delete(input.state);
    requireThat(pending && pending.expiresAt >= this.now() && input.code.length > 0 && input.code.length <= 4096, 'OIDC_STATE_INVALID');
    const discovery = await this.discovery(); const response = await this.fetcher(discovery.token_endpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body: new URLSearchParams({ grant_type: 'authorization_code', code: input.code, redirect_uri: this.config.redirectUri, client_id: this.config.clientId, ...(this.config.clientSecret ? { client_secret: this.config.clientSecret } : {}) }).toString() });
    requireThat(response.ok, 'OIDC_TOKEN_EXCHANGE_REJECTED'); const body = await response.json() as { id_token?: unknown };
    requireThat(typeof body.id_token === 'string', 'OIDC_ID_TOKEN_MISSING'); return await this.verifyIdToken(body.id_token, pending.nonce, discovery);
  }
  private async discovery(): Promise<OidcDiscovery> {
    const issuer = exactUrl(this.config.issuer, 'OIDC_ISSUER_INVALID'); const response = await this.fetcher(new URL('.well-known/openid-configuration', issuer.toString().endsWith('/') ? issuer : new URL(`${issuer}/`)), { headers: { accept: 'application/json' } });
    requireThat(response.ok, 'OIDC_DISCOVERY_REJECTED'); const value = await response.json() as OidcDiscovery;
    requireThat(value.issuer === this.config.issuer && typeof value.authorization_endpoint === 'string' && typeof value.token_endpoint === 'string' && typeof value.jwks_uri === 'string', 'OIDC_DISCOVERY_INVALID');
    exactUrl(value.authorization_endpoint, 'OIDC_DISCOVERY_INVALID'); exactUrl(value.token_endpoint, 'OIDC_DISCOVERY_INVALID'); exactUrl(value.jwks_uri, 'OIDC_DISCOVERY_INVALID'); return value;
  }
  private async verifyIdToken(token: string, nonce: string, discovery: OidcDiscovery): Promise<HumanPrincipal> {
    const parts = token.split('.'); requireThat(parts.length === 3 && parts.every(Boolean), 'OIDC_ID_TOKEN_INVALID'); const header = json(parts[0]!, 'OIDC_ID_TOKEN_INVALID'); const claims = json(parts[1]!, 'OIDC_ID_TOKEN_INVALID'); const alg = algorithm(header.alg); requireThat(alg !== undefined && header.kid && typeof header.kid === 'string', 'OIDC_ID_TOKEN_ALGORITHM_INVALID');
    const jwksResponse = await this.fetcher(discovery.jwks_uri, { headers: { accept: 'application/json' } }); requireThat(jwksResponse.ok, 'OIDC_JWKS_REJECTED'); const jwks = await jwksResponse.json() as { keys?: Jwk[] }; const jwk = jwks.keys?.find(key => key.kid === header.kid);
    requireThat(jwk, 'OIDC_JWK_UNKNOWN'); const key = createPublicKey({ key: jwk as unknown as Record<string, string>, format: 'jwk' }); const signed = Buffer.from(`${parts[0]}.${parts[1]}`); const valid = verify(alg, signed, key, b64(parts[2]!)); requireThat(valid, 'OIDC_ID_TOKEN_SIGNATURE_INVALID');
    requireThat(claims.iss === this.config.issuer && audience(claims.aud, this.config.clientId), 'OIDC_ID_TOKEN_CLAIMS_INVALID'); requireThat(claims.nonce === nonce && typeof claims.exp === 'number' && claims.exp * 1000 >= this.now() && (typeof claims.iat !== 'number' || claims.iat * 1000 <= this.now() + 60_000), 'OIDC_ID_TOKEN_CLAIMS_INVALID');
    return principalFromClaims(claims, this.config.issuer);
  }
}
