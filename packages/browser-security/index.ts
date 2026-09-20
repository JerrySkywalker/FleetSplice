import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Fault, requireThat } from '../contracts/json.ts';

export const HOST_SESSION_COOKIE = '__Host-fleetsplice';
export const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60_000;
export const IDLE_TIMEOUT_MS = 15 * 60_000;

export type BrowserSecurityConfig = {
  origin: string;
  rpId: string;
  now?: () => number;
};

export type VirtualPasskeyCredential = {
  credentialId: string;
  publicKeySpkiPem: string;
  userHandle: string;
  backup: boolean;
  revoked: boolean;
  createdAt: number;
};

export type OwnerSession = {
  sessionId: string;
  createdAt: number;
  lastSeenAt: number;
  absoluteExpiresAt: number;
  idleExpiresAt: number;
  revoked: boolean;
  credentialId: string;
};

export type CsrfBoundClient = {
  clientInstanceId: string;
  sessionId: string;
  csrf: string;
  expiresAt: number;
};

function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hostSessionCookieHeader(sessionId: string): string {
  // __Host- prefix requires Secure; Secure; HttpOnly; Path=/; no Domain.
  return `${HOST_SESSION_COOKIE}=${sessionId}; Secure; HttpOnly; SameSite=Strict; Path=/`;
}

export function parseHostSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = new RegExp(`(?:^|;\\s*)${HOST_SESSION_COOKIE}=([0-9a-f]{64})(?:;|$)`).exec(cookieHeader);
  return match?.[1] ?? null;
}

export class BrowserSecurityService {
  private readonly credentials = new Map<string, VirtualPasskeyCredential>();
  private readonly sessions = new Map<string, OwnerSession>();
  private readonly clients = new Map<string, CsrfBoundClient>();
  private readonly challenges = new Map<string, { rpId: string; origin: string; expiresAt: number; kind: 'register' | 'authenticate' }>();
  private readonly now: () => number;

  constructor(private readonly config: BrowserSecurityConfig) {
    this.now = config.now ?? Date.now;
  }

  assertExactOrigin(origin: string | undefined) {
    requireThat(origin === this.config.origin, 'ORIGIN_REJECTED');
  }

  assertExactRpId(rpId: string) {
    requireThat(rpId === this.config.rpId, 'RP_ID_REJECTED');
  }

  beginCeremony(kind: 'register' | 'authenticate') {
    const challengeId = randomBytes(32).toString('base64url');
    this.challenges.set(challengeId, {
      kind,
      rpId: this.config.rpId,
      origin: this.config.origin,
      expiresAt: this.now() + 60_000,
    });
    return { challengeId, rpId: this.config.rpId, origin: this.config.origin, userVerification: 'required' as const };
  }

  /** Local/test profile: register a Playwright virtual authenticator credential record. */
  registerVirtualCredential(input: {
    challengeId: string;
    origin: string;
    rpId: string;
    credentialId: string;
    publicKeySpkiPem: string;
    userHandle: string;
    backup?: boolean;
  }) {
    this.assertExactOrigin(input.origin);
    this.assertExactRpId(input.rpId);
    const challenge = this.challenges.get(input.challengeId);
    requireThat(challenge && challenge.kind === 'register' && challenge.expiresAt > this.now(), 'WEBAUTHN_CHALLENGE_INVALID');
    requireThat(!this.credentials.has(input.credentialId), 'WEBAUTHN_CREDENTIAL_EXISTS');
    // No public signup: only an attended local bootstrap may register.
    this.credentials.set(input.credentialId, {
      credentialId: input.credentialId,
      publicKeySpkiPem: input.publicKeySpkiPem,
      userHandle: input.userHandle,
      backup: input.backup === true,
      revoked: false,
      createdAt: this.now(),
    });
    this.challenges.delete(input.challengeId);
    return this.openSession(input.credentialId);
  }

  authenticateVirtualCredential(input: {
    challengeId: string;
    origin: string;
    rpId: string;
    credentialId: string;
    assertionOk: boolean;
  }) {
    this.assertExactOrigin(input.origin);
    this.assertExactRpId(input.rpId);
    const challenge = this.challenges.get(input.challengeId);
    requireThat(challenge && challenge.kind === 'authenticate' && challenge.expiresAt > this.now(), 'WEBAUTHN_CHALLENGE_INVALID');
    requireThat(input.assertionOk, 'WEBAUTHN_ASSERTION_FAILED');
    const credential = this.credentials.get(input.credentialId);
    requireThat(credential && !credential.revoked, 'WEBAUTHN_CREDENTIAL_REVOKED');
    this.challenges.delete(input.challengeId);
    return this.openSession(input.credentialId);
  }

  private openSession(credentialId: string) {
    const sessionId = randomBytes(32).toString('hex');
    const createdAt = this.now();
    const session: OwnerSession = {
      sessionId,
      createdAt,
      lastSeenAt: createdAt,
      absoluteExpiresAt: createdAt + ABSOLUTE_TIMEOUT_MS,
      idleExpiresAt: createdAt + IDLE_TIMEOUT_MS,
      revoked: false,
      credentialId,
    };
    this.sessions.set(sessionId, session);
    return { sessionId, cookie: hostSessionCookieHeader(sessionId) };
  }

  touchSession(sessionId: string) {
    const session = this.requireSession(sessionId);
    session.lastSeenAt = this.now();
    session.idleExpiresAt = session.lastSeenAt + IDLE_TIMEOUT_MS;
    return session;
  }

  requireSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    requireThat(session && !session.revoked, 'AUTH_REQUIRED');
    const t = this.now();
    requireThat(t <= session.absoluteExpiresAt, 'SESSION_ABSOLUTE_EXPIRED');
    requireThat(t <= session.idleExpiresAt, 'SESSION_IDLE_EXPIRED');
    return session;
  }

  revokeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) session.revoked = true;
  }

  revokeCredential(credentialId: string) {
    const credential = this.credentials.get(credentialId);
    requireThat(credential, 'WEBAUTHN_CREDENTIAL_UNKNOWN');
    credential.revoked = true;
    for (const session of this.sessions.values()) {
      if (session.credentialId === credentialId) session.revoked = true;
    }
  }

  issueClient(sessionId: string) {
    this.touchSession(sessionId);
    const client: CsrfBoundClient = {
      clientInstanceId: randomBytes(16).toString('hex'),
      sessionId,
      csrf: randomBytes(32).toString('hex'),
      expiresAt: Math.min(this.now() + 30 * 60_000, this.sessions.get(sessionId)!.absoluteExpiresAt),
    };
    this.clients.set(client.clientInstanceId, client);
    return client;
  }

  requireMutation(input: {
    origin: string | undefined;
    cookieHeader: string | undefined;
    clientInstanceId: string | undefined;
    csrf: string | undefined;
  }) {
    this.assertExactOrigin(input.origin);
    const sessionId = parseHostSessionCookie(input.cookieHeader);
    requireThat(sessionId, 'AUTH_REQUIRED');
    this.touchSession(sessionId);
    const client = this.clients.get(String(input.clientInstanceId));
    requireThat(client && client.sessionId === sessionId && equalSecret(String(input.csrf), client.csrf) && client.expiresAt > this.now(), 'CSRF_OR_CLIENT_REJECTED');
    return { sessionId, client };
  }

  requireObservation(input: { origin: string | undefined; cookieHeader: string | undefined; secFetchSite?: string }) {
    requireThat(input.origin === this.config.origin || input.secFetchSite === 'same-origin', 'OBSERVATION_ORIGIN_REJECTED');
    const sessionId = parseHostSessionCookie(input.cookieHeader);
    requireThat(sessionId, 'AUTH_REQUIRED');
    this.touchSession(sessionId);
    return sessionId;
  }

  /** Browser secrets never flow to Edge/native — only opaque session proof stays Hub-side. */
  edgeSafeProjection(sessionId: string) {
    this.requireSession(sessionId);
    return {
      authenticated: true,
      sessionBinding: createHash('sha256').update(sessionId).digest('hex'),
      // Intentionally omit cookie, csrf, passkey material.
    };
  }

  listCredentials() {
    return [...this.credentials.values()].map(c => ({
      credentialId: c.credentialId,
      backup: c.backup,
      revoked: c.revoked,
    }));
  }
}
