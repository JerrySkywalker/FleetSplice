import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { authFixture } from './fixtures/u160-auth.ts';

test('U03 expiry and logout keep draft/uncertain receipt without replay or renewed controller', async () => {
  const fixture = await authFixture(path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U03', `session-${Date.now()}`));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  try {
    const page = await context.newPage(); await page.goto(fixture.origin);
    const login = async () => { await page.getByRole('link', { name: 'Sign in', exact: true }).click(); await expect(page.getByTestId('native-prompt')).toBeVisible(); };
    await fixture.control('unknown'); await login();
    await page.getByTestId('ownership-action').click();
    await expect(page.getByTestId('ownership-surface')).toContainText('You control this session');
    await page.getByTestId('native-prompt').fill('Synthetic uncertain input, preserve exactly');
    await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('receipt-attention')).toContainText('Outcome unknown');
    const pending = await page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending'));
    assert.ok(pending); const count = (await fixture.control('counters')).syntheticCommands;
    assert.equal(count, 2);
    await fixture.control('expire'); await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.getByTestId('auth-gate')).toContainText('Your session ended');
    await expect(page.getByTestId('composer-send')).toHaveCount(0);
    await login();
    await expect(page.getByTestId('native-prompt')).toHaveValue('Synthetic uncertain input, preserve exactly');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending')), pending);
    await expect(page.getByTestId('native-prompt')).toBeDisabled();
    await expect(page.getByTestId('composer-send')).toHaveCount(0);
    await expect(page.getByTestId('ownership-surface')).toContainText('Read-only viewer');
    assert.equal((await fixture.control('counters')).syntheticCommands, count);
    await page.getByTestId('preferences').click();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByTestId('auth-gate')).toContainText('You are signed out');
    assert.equal((await context.cookies(fixture.origin)).some(cookie => cookie.name === '__Host-fleetsplice'), false);
    assert.equal((await page.evaluate(async () => (await fetch('/api/auth/status')).json())).authenticated, false);
    assert.equal((await fixture.control('counters')).realNativeEffects, 0);
  } finally { await context.close(); await browser.close(); await fixture.close(); }
});

test('U03 public status discovery does not renew the OIDC idle session', async () => {
  const fixture = await authFixture(path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U03', `idle-${Date.now()}`));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  try {
    const page = await context.newPage(); await page.goto(fixture.origin);
    await page.getByRole('link', { name: 'Sign in', exact: true }).click(); await expect(page.getByTestId('native-prompt')).toBeVisible();
    // A blank document stops application observations. Only public status is read next.
    await page.goto(`${fixture.origin}/manifest.webmanifest`);
    await fixture.control('idle14');
    assert.equal((await context.request.get(`${fixture.origin}/api/auth/status`).then(response => response.json())).authenticated, true);
    await fixture.control('idle2');
    assert.equal((await context.request.get(`${fixture.origin}/api/auth/status`).then(response => response.json())).authenticated, false);
  } finally { await context.close(); await browser.close(); await fixture.close(); }
});

test('U03 a different OIDC identity cannot replace the first Owner after logout', async () => {
  const fixture = await authFixture(path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U03', `owner-${Date.now()}`));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  try {
    const page = await context.newPage(); await page.goto(fixture.origin);
    await page.getByRole('link', { name: 'Sign in', exact: true }).click(); await expect(page.getByTestId('native-prompt')).toBeVisible();
    await page.getByTestId('preferences').click(); await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByTestId('auth-gate')).toBeVisible(); await fixture.control('otherOwner');
    const callback = page.waitForResponse(response => response.url().includes('/auth/oidc/callback?'));
    await page.getByRole('link', { name: 'Sign in', exact: true }).click();
    const response = await callback; assert.equal(response.status(), 403); assert.equal((await response.json()).error, 'OIDC_OWNER_ADMISSION_REJECTED');
    assert.equal((await context.request.get(`${fixture.origin}/api/auth/status`).then(response => response.json())).authenticated, false);
    assert.equal((await fixture.control('counters')).syntheticCommands, 0);
  } finally { await context.close(); await browser.close(); await fixture.close(); }
});
