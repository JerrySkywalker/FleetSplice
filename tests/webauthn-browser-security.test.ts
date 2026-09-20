import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BrowserSecurityService,
  HOST_SESSION_COOKIE,
  ABSOLUTE_TIMEOUT_MS,
  IDLE_TIMEOUT_MS,
  hostSessionCookieHeader,
  parseHostSessionCookie,
} from '../packages/browser-security/index.ts';

test('cookie contract and CSRF/origin mutation gates', () => {
  const security = new BrowserSecurityService({
    origin: 'https://localhost:9443',
    rpId: 'localhost',
  });
  const reg = security.beginCeremony('register');
  const opened = security.registerVirtualCredential({
    challengeId: reg.challengeId,
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    credentialId: 'cred-primary',
    publicKeySpkiPem: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----\n',
    userHandle: 'owner',
  });
  assert.match(opened.cookie, new RegExp(`^${HOST_SESSION_COOKIE}=[0-9a-f]{64}; Secure; HttpOnly; SameSite=Strict; Path=/$`));
  assert.equal(opened.cookie.includes('Domain='), false);
  const client = security.issueClient(opened.sessionId);
  assert.throws(() => security.requireMutation({
    origin: 'https://evil.example',
    cookieHeader: opened.cookie,
    clientInstanceId: client.clientInstanceId,
    csrf: client.csrf,
  }), /ORIGIN_REJECTED/);
  assert.throws(() => security.requireMutation({
    origin: 'https://localhost:9443',
    cookieHeader: opened.cookie,
    clientInstanceId: client.clientInstanceId,
    csrf: 'wrong',
  }), /CSRF_OR_CLIENT_REJECTED/);
  const ok = security.requireMutation({
    origin: 'https://localhost:9443',
    cookieHeader: `${HOST_SESSION_COOKIE}=${opened.sessionId}`,
    clientInstanceId: client.clientInstanceId,
    csrf: client.csrf,
  });
  assert.equal(ok.sessionId, opened.sessionId);
  const edge = security.edgeSafeProjection(opened.sessionId);
  assert.equal('cookie' in edge, false);
  assert.equal('csrf' in edge, false);
});

test('idle and absolute timeouts plus credential/session revocation', () => {
  let now = 1_000_000;
  const security = new BrowserSecurityService({
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    now: () => now,
  });
  const reg = security.beginCeremony('register');
  const opened = security.registerVirtualCredential({
    challengeId: reg.challengeId,
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    credentialId: 'cred-timeout',
    publicKeySpkiPem: 'k',
    userHandle: 'owner',
  });
  now += IDLE_TIMEOUT_MS + 1;
  assert.throws(() => security.requireSession(opened.sessionId), /SESSION_IDLE_EXPIRED/);

  now = 1_000_000;
  const reg2 = security.beginCeremony('register');
  const opened2 = security.registerVirtualCredential({
    challengeId: reg2.challengeId,
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    credentialId: 'cred-absolute',
    publicKeySpkiPem: 'k',
    userHandle: 'owner',
  });
  now += ABSOLUTE_TIMEOUT_MS + 1;
  assert.throws(() => security.requireSession(opened2.sessionId), /SESSION_ABSOLUTE_EXPIRED/);

  now = 1_000_000;
  const reg3 = security.beginCeremony('register');
  const opened3 = security.registerVirtualCredential({
    challengeId: reg3.challengeId,
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    credentialId: 'cred-revoke',
    publicKeySpkiPem: 'k',
    userHandle: 'owner',
    backup: true,
  });
  security.revokeCredential('cred-revoke');
  assert.throws(() => security.requireSession(opened3.sessionId), /AUTH_REQUIRED/);
  const auth = security.beginCeremony('authenticate');
  assert.throws(() => security.authenticateVirtualCredential({
    challengeId: auth.challengeId,
    origin: 'https://localhost:9443',
    rpId: 'localhost',
    credentialId: 'cred-revoke',
    assertionOk: true,
  }), /WEBAUTHN_CREDENTIAL_REVOKED/);
});

test('no transcript before auth; primary and backup virtual credentials', () => {
  const origin = 'https://localhost';
  const security = new BrowserSecurityService({ origin, rpId: 'localhost' });
  assert.throws(() => security.requireObservation({
    origin,
    cookieHeader: undefined,
    secFetchSite: 'same-origin',
  }), /AUTH_REQUIRED/);

  const primaryBegin = security.beginCeremony('register');
  const primary = security.registerVirtualCredential({
    challengeId: primaryBegin.challengeId,
    origin,
    rpId: 'localhost',
    credentialId: 'virtual-primary',
    publicKeySpkiPem: 'virtual',
    userHandle: 'owner',
  });
  const backupBegin = security.beginCeremony('register');
  security.registerVirtualCredential({
    challengeId: backupBegin.challengeId,
    origin,
    rpId: 'localhost',
    credentialId: 'virtual-backup',
    publicKeySpkiPem: 'virtual',
    userHandle: 'owner',
    backup: true,
  });
  assert.equal(security.listCredentials().length, 2);
  assert.equal(security.listCredentials().filter(c => c.backup && !c.revoked).length, 1);

  security.requireObservation({
    origin,
    cookieHeader: `${HOST_SESSION_COOKIE}=${primary.sessionId}`,
    secFetchSite: 'same-origin',
  });

  assert.throws(() => security.beginCeremony('register') && security.registerVirtualCredential({
    challengeId: 'missing',
    origin: 'https://evil.example',
    rpId: 'localhost',
    credentialId: 'x',
    publicKeySpkiPem: 'k',
    userHandle: 'owner',
  }), /ORIGIN_REJECTED|WEBAUTHN_CHALLENGE_INVALID/);

  assert.equal(parseHostSessionCookie(hostSessionCookieHeader('ab'.repeat(32))), 'ab'.repeat(32));
});

test('Playwright CDP virtual authenticator API is available for local HTTPS tests', async () => {
  const { chromium } = await import('@playwright/test');
  // Match accept-native-browser: use installed Edge channel rather than downloading Chromium.
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    const added = await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });
    assert.ok(added.authenticatorId);
  } finally {
    await browser.close();
  }
});
