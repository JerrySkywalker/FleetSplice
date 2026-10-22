import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { authFixture } from './fixtures/u160-auth.ts';

test('U07 real Gateway/Edge HCP with synthetic Native: response loss, disconnect, lookup and reauthentication', { timeout: 60000 }, async () => {
  const directory = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U07', `integration-${Date.now()}`);
  const fixture = await authFixture(directory, 'remote');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const record = process.env.FLEETSPLICE_U160_RECORD_VIDEO === '1';
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US', viewport: { width: 1440, height: 900 }, ...(record ? { recordVideo: { dir: directory, size: { width: 1280, height: 800 } } } : {}) });
  const viewer = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
  const page = await context.newPage(); const video = page.video();
  const capture = (name: string) => page.screenshot({ path: path.join(directory, `${name}.png`) });
  try {
    const login = async () => { await page.getByRole('link', { name: 'Sign in', exact: true }).click(); await expect(page.getByTestId('native-prompt')).toBeVisible(); };
    await page.goto(fixture.origin); await capture('signed-out'); await login();
    await expect(page.getByTestId('ownership-action')).toHaveText('Acquire control');
    await page.getByTestId('ownership-action').click(); await expect(page.getByTestId('ownership-surface')).toContainText('You control this session');
    const prompt = page.getByTestId('native-prompt'); await prompt.fill('Synthetic HCP normal roundtrip'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('conversation-timeline')).toContainText('Synthetic response: preview input received. No native action was performed.');
    await expect(prompt).toBeEnabled();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending'))).toBeNull();
    const other = await viewer.newPage(); await other.goto(fixture.origin); await other.getByRole('link', { name: 'Sign in', exact: true }).click();
    await expect(other.getByTestId('ownership-surface')).toContainText('Read-only viewer'); await other.getByTestId('native-prompt').fill('Viewer local draft only');
    await other.getByTestId('native-prompt').press('Control+Enter'); assert.equal((await fixture.control('counters')).syntheticCommands, 2);
    await capture('normal-controller');
    // Deliver one command to the real Gateway/Edge, then lose only its HTTP response.
    await page.route('**/api/native/commands', async route => { await route.fetch(); await route.abort('connectionreset'); }, { times: 1 });
    await prompt.fill('Synthetic response deliberately lost, do not replay'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('receipt-attention')).toContainText('Outcome unknown');
    const pending = await page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending'));
    assert.ok(pending); const command = JSON.parse(pending);
    assert.equal((await fixture.control('counters')).syntheticCommands, 3);
    await fixture.control('disconnect'); await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(page.locator('footer')).toContainText('NATIVE_OBSERVATION_LOST');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending')), pending); await capture('disconnected-pending');
    await fixture.control('reconnect'); await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(page.locator('footer')).toContainText('READY');
    await page.getByRole('button', { name: 'Check receipt', exact: true }).click();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('fleetsplice.native.pending'))).toBeNull();
    await expect(page.getByTestId('receipt-attention')).toHaveCount(0); await capture('receipt-resolved');
    const counters = await fixture.control('counters'); assert.equal(counters.hcpConnections, 2); assert.equal(counters.hcpExecutes, 3); assert.equal(counters.syntheticCommands, 3); assert.ok(counters.hcpLookups! >= 1);
    const wire = JSON.parse(readFileSync(path.join(directory, 'HCP-TRACE.json'), 'utf8'));
    assert.equal(wire.kind, 'REAL_EDGE_HCP_ENDPOINT_SYNTHETIC_NATIVE');
    assert.equal(wire.trace.filter((row: any) => row.op === 'execute' && row.commandId === command.commandId).length, 1);
    assert.ok(wire.trace.some((row: any) => row.op === 'lookup' && row.commandId === command.commandId));
    assert.ok(wire.trace.every((row: any) => row.connectionId === wire.binding.connectionId));
    await prompt.fill('Unsent draft across OIDC expiration'); await fixture.control('expire'); await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.getByTestId('auth-gate')).toContainText('Your session ended'); await login();
    await expect(prompt).toHaveValue('Unsent draft across OIDC expiration'); await expect(page.getByTestId('ownership-surface')).toContainText('Read-only viewer');
    const final = await fixture.control('counters'); assert.equal(final.hcpExecutes, 3); assert.equal(final.realNativeConnections, 0); assert.equal(final.realNativeEffects, 0);
    await page.setViewportSize({ width: 390, height: 844 }); await capture('reauthenticated-viewer-390');
    writeFileSync(path.join(directory, 'RESULT.json'), JSON.stringify({ status: 'PASS', evidence: 'REAL_GATEWAY_OIDC_EDGE_HCP_SYNTHETIC_NATIVE_BROWSER', counters: final, actualOsIdentity: 'NOT_RUN', ordinaryAgentLifecycle: 'NOT_RUN', realNative: 'NOT_RUN_0_0' }, null, 2));
  } finally {
    await viewer.close(); await context.close(); if (video) await video.saveAs(path.join(directory, 'synthetic-integration.webm'));
    await browser.close(); await fixture.close();
  }
});
