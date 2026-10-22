import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { authFixture } from './fixtures/u160-auth.ts';

test('U02 fresh browser signs in through real Gateway OIDC exchange, without Native commands', async () => {
  const fixture = await authFixture(path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U02', `auth-${Date.now()}`));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  try {
    const page = await context.newPage(); await page.goto(fixture.origin);
    await expect(page.getByTestId('auth-gate')).toBeVisible();
    assert.deepEqual(await page.evaluate(async () => (await fetch('/api/auth/status')).json()), { mode: 'OIDC', authenticated: false });
    await page.getByRole('link', { name: 'Sign in', exact: true }).click();
    await expect(page.getByTestId('native-prompt')).toBeVisible();
    const principal = await page.evaluate(async () => (await fetch('/api/auth/principal')).json());
    assert.equal(principal.principal.subject, 'synthetic-owner'); assert.equal(principal.mode, 'OIDC');
    const cookie = (await context.cookies(fixture.origin)).find(item => item.name === '__Host-fleetsplice')!;
    assert.ok(cookie.httpOnly && cookie.secure); assert.equal(cookie.sameSite, 'Strict');
    assert.equal(await page.evaluate(() => document.cookie), '');
    const counters = await fixture.control('counters'); assert.equal(counters.exchanges, 1); assert.equal(counters.syntheticCommands, 0); assert.equal(counters.realNativeConnections, 0); assert.equal(counters.realNativeEffects, 0);
  } finally { await context.close(); await browser.close(); await fixture.close(); }
});
