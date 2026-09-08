import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { chromium, expect } from '@playwright/test';
import { WebSocket } from 'ws';
import { startHub } from '../apps/hub/server.ts';
import { EdgeKernel } from '../apps/edge/kernel.ts';
import { Journal } from '../packages/journal/index.ts';
import { canonical, type Hcp } from '../packages/contracts/index.ts';
import { FixtureNative, target } from './helpers.ts';
import { expectState, inspectContrast, setPresentation } from './ui-preferences.ts';

test('SYNTHETIC_BROWSER: create, control, stream rendering, viewer and loss lookup without re-emission', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`; const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-browser-'));
  const identity = target(); const bootstrapToken = randomBytes(32).toString('hex'); const hcpToken = randomBytes(32).toString('hex');
  const hub = await startHub({ port, target: identity, root: 'V:\\synthetic-workspace', sid: 'fixture', principal: 'fixture', sessionId: 1, stateDirectory: directory, webDirectory: path.resolve('dist/web'), hcpToken, bootstrapToken });
  const journal = new Journal(path.join(directory, 'edge.sqlite')); journal.set('root', 'V:\\synthetic-workspace');
  const native = new FixtureNative();
  const socket = new WebSocket(`ws://127.0.0.1:${port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', { origin, headers: { Authorization: `Bearer ${hcpToken}` }, perMessageDeflate: false });
  const envelope = { v: 1 as const, target: identity, connectionId: identity.connectionId };
  const edge = new EdgeKernel(journal, identity, native, async () => {}, event => socket.send(canonical({ ...envelope, kind: 'event', event })));
  socket.on('message', async bytes => { const message = JSON.parse(String(bytes)) as Hcp;
    if (message.kind === 'ready') edge.connected = true;
    else if (message.kind === 'command') socket.send(canonical({ ...envelope, kind: 'receipt', receipt: await edge.execute(message.command) }));
  });
  await new Promise<void>(resolve => socket.once('open', resolve));
  socket.send(canonical({ ...envelope, kind: 'hello', identity: { principal: 'fixture', sid: 'fixture', sessionId: 1, elevated: false, root: 'V:\\synthetic-workspace', rootIdentity: identity.rootIdentity }, recovered: false }));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1480, height: 960 } }); const page = await context.newPage();
  const consoleErrors: string[] = []; page.on('pageerror', error => consoleErrors.push(error.message));
  try {
    await page.goto(`${origin}/#bootstrap=${bootstrapToken}`);
    await expectState(page.getByTestId('connection-status'), 'READY');
    assert.equal(new URL(page.url()).hash, '');
    await page.getByRole('button', { name: 'Register selected Workspace' }).click();
    await expect(page.getByRole('button', { name: '＋ New session' })).toBeEnabled();
    await page.getByRole('button', { name: '＋ New session' }).click();
    await expectState(page.getByTestId('lane-state'), 'EMPTY');
    assert.equal(native.creates, 0);
    await page.getByRole('button', { name: 'Acquire control' }).click();
    await expect(page.getByRole('button', { name: 'Continue session' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Continue session' })).toBeFocused();
    assert.equal(native.creates, 0, 'acquire only guides focus; it cannot create a native thread');
    await page.getByRole('button', { name: 'Continue session' }).click();
    await expectState(page.getByTestId('lane-state'), 'IDLE');

    await expect(page.getByRole('button', { name: 'Release control' })).toBeEnabled();
    await page.getByLabel('Message Codex').fill('Draft ORBIT-731');
    const beforePreferences = hub.kernel.snapshot();
    let preferenceCommandPosts = 0; let preferenceClientPosts = 0;
    const observePreferences = (request: import('@playwright/test').Request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/commands')) preferenceCommandPosts++;
      if (request.method() === 'POST' && request.url().endsWith('/api/client')) preferenceClientPosts++;
    };
    page.on('request', observePreferences);
    const contrast: unknown[] = [];
    for (const [locale, theme] of [['zh-CN', 'oled-black'], ['en-US', 'dark'], ['zh-CN', 'light']] as const) {
      await setPresentation(page, locale, theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expectState(page.getByTestId('lane-state'), 'IDLE', locale);
      contrast.push({ locale, theme, rows: await inspectContrast(page) });
      await page.getByTestId('preferences').focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      contrast.push({ locale, theme, dialog: await inspectContrast(page) });
      for (let tab = 0; tab < 6; tab++) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.querySelector('dialog')!.contains(document.activeElement)), true);
      }
      await page.keyboard.press('Escape'); await expect(page.getByTestId('preferences')).toBeFocused();
      if (theme === 'oled-black') {
        assert.equal(await page.locator('main').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(0, 0, 0)');
        await page.screenshot({ path: 'test-results/synthetic-zh-CN-oled-black.png', fullPage: true });
      }
      await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    }
    await setPresentation(page, 'en-US', 'system');
    for (const colorScheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme });
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    }
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'narrow UI must not overflow');
      await expect(page.locator('.context')).toBeVisible();
      await page.getByRole('button', { name: 'Release control' }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('button', { name: 'Release control' })).toBeInViewport();
      await page.getByTestId('preferences').click();
      await expect(page.getByRole('dialog')).toBeInViewport();
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({ width: 1480, height: 960 });
    await setPresentation(page, 'en-US', 'light');
    assert.deepEqual(await page.evaluate(() => [localStorage.getItem('fleetsplice.locale'), localStorage.getItem('fleetsplice.appearance')]), ['en-US', 'light']);
    // Main bundle blocked: saved presentation must already apply without React or a new client.
    for (const [locale, theme] of [['zh-CN', 'oled-black'], ['en-US', 'light']] as const) {
      await setPresentation(page, locale, theme);
      const prepaint = await context.newPage();
      await prepaint.route('**/assets/index-*.js', route => route.abort());
      await prepaint.goto(origin);
      await expect(prepaint.locator('html')).toHaveAttribute('lang', locale);
      await expect(prepaint.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(prepaint.locator('#root')).toBeEmpty();
      await prepaint.close();
    }
    await expect(page.getByLabel('Message Codex')).toHaveValue('Draft ORBIT-731');
    assert.deepEqual(hub.kernel.snapshot(), beforePreferences, 'preferences preserve all product state and authority');
    assert.equal(preferenceCommandPosts, 0); assert.equal(preferenceClientPosts, 0);
    assert.equal(native.creates, 1); assert.equal(native.turns, 0);
    page.off('request', observePreferences);
    await page.screenshot({ path: 'test-results/synthetic-en-US-light.png', fullPage: true });
    writeFileSync('test-results/owner-ux-contrast.json', JSON.stringify({ qualification: 'SYNTHETIC_OWNER_UX', contrast }, null, 2));
    const viewer = await context.newPage(); await viewer.goto(origin);
    await viewer.getByRole('navigation', { name: 'Sessions' }).getByRole('button').click();
    await expect(viewer.getByRole('button', { name: 'Send message' })).toBeDisabled();
    await expect(viewer.getByRole('button', { name: 'Acquire control' })).toBeDisabled();
    assert.equal(native.creates, 1);
    await page.getByLabel('Message Codex').fill('Render safely');
    await page.route('**/api/commands', async route => {
      try { const response = await route.fetch(); assert.equal(response.status(), 200); await route.abort('failed'); }
      catch { throw new Error('SYNTHETIC_REQUEST_FAILED'); }
    }, { times: 1 });
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('button', { name: 'Check command receipt' })).toBeVisible();
    await expectState(page.getByTestId('lane-state'), 'RUNNING');
    await expect(page.getByRole('button', { name: 'Check command receipt' })).toBeEnabled();
    const pendingBeforeSwitch = await page.evaluate(() => sessionStorage.getItem('fleetsplice.pending'));
    await setPresentation(page, 'zh-CN', 'oled-black');
    await expect(page.getByRole('button', { name: '查询命令回执' })).toBeVisible();
    await expectState(page.getByTestId('lane-state'), 'RUNNING', 'zh-CN');
    await setPresentation(page, 'en-US', 'light');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('fleetsplice.pending')), pendingBeforeSwitch);
    assert.equal(native.turns, 1, 'preference switches cannot retry a lost command');
    native.delta('<img src=x onerror=alert(1)> & real text is escaped'); native.complete();
    await page.getByRole('button', { name: 'Check command receipt' }).click();
    await expect(page.getByTestId('assistant-text')).toContainText('<img src=x');
    assert.equal(await page.locator('.message-text img').count(), 0);
    assert.equal(native.turns, 1);
    await expectState(page.getByTestId('lane-state'), 'IDLE');
    await page.getByRole('button', { name: 'Continue session' }).click();
    await expect(page.getByRole('button', { name: 'Release control' })).toBeEnabled();
    assert.equal(native.creates, 1);
    for (let index = 1; index < 23; index++) {
      await page.getByRole('button', { name: '＋ New session' }).click();
      await expect(page.getByRole('navigation', { name: 'Sessions' }).getByRole('button')).toHaveCount(index + 1);
      await expect(page.getByRole('button', { name: '＋ New session' })).toBeEnabled();
    }
    await page.getByRole('navigation', { name: 'Sessions' }).getByRole('button').first().click();
    await expect(viewer.getByRole('navigation', { name: 'Sessions' }).getByRole('button')).toHaveCount(23);
    const staleSnapshot = hub.kernel.snapshot();
    await viewer.route('**/api/snapshot', route => route.fulfill({ json: staleSnapshot }));
    // Another admitted creation fills the last slot after this tab has formed its command.
    await page.route('**/api/commands', async route => {
      const original = route.request().postDataJSON();
      const extra = await route.fetch({ postData: { ...original, commandId: randomUUID(), idempotencyKey: randomUUID() } });
      assert.equal(extra.status(), 200);
      const rejected = await route.fetch(); const acknowledgment = await rejected.json();
      assert.equal(rejected.status(), 409);
      assert.equal(acknowledgment.admission, 'REJECTED_BEFORE_ADMISSION');
      assert.equal(acknowledgment.commandId, original.commandId);
      assert.equal(acknowledgment.intentDigest, original.intentDigest);
      await route.fulfill({ response: rejected });
    }, { times: 1 });
    await page.getByRole('button', { name: '＋ New session' }).click();
    await expect(page.getByRole('alert')).toContainText('command rejected before admission');
    await expect(page.getByRole('button', { name: 'Check command receipt' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '＋ New session' })).toBeDisabled();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('fleetsplice.pending')), null);
    await expect(page.getByRole('button', { name: 'Continue session' })).toBeEnabled();
    await page.getByRole('button', { name: 'Continue session' }).click();
    await expect(page.getByRole('button', { name: 'Release control' })).toBeEnabled();
    await page.getByLabel('Message Codex').fill('Existing session remains operable');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expectState(page.getByTestId('lane-state'), 'RUNNING');
    native.delta('existing session output'); native.complete();
    await expectState(page.getByTestId('lane-state'), 'IDLE');
    assert.equal(native.creates, 1); assert.equal(native.turns, 2);
    // A lost rejection response stays pending until the retained outcome is looked up.
    await viewer.route('**/api/commands', async route => {
      const rejected = await route.fetch(); assert.equal(rejected.status(), 409);
      await route.abort('failed');
    }, { times: 1 });
    await viewer.getByRole('button', { name: '＋ New session' }).click();
    await expect(viewer.getByRole('button', { name: 'Check command receipt' })).toBeEnabled();
    assert.notEqual(await viewer.evaluate(() => sessionStorage.getItem('fleetsplice.pending')), null);
    await viewer.unroute('**/api/snapshot');
    await viewer.getByRole('button', { name: 'Check command receipt' }).click();
    await expect(viewer.getByRole('alert')).toContainText('command rejected before admission');
    await expect(viewer.getByRole('button', { name: 'Check command receipt' })).toHaveCount(0);
    await expect(viewer.getByRole('button', { name: '＋ New session' })).toBeDisabled();
    assert.equal(native.turns, 2);
    await page.getByRole('button', { name: 'Release control' }).click();
    await expect(viewer.getByRole('button', { name: 'Acquire control' })).toBeEnabled();
    await page.screenshot({ path: 'test-results/synthetic-browser.png', fullPage: true });
    native.signals.emit('fault', 'NATIVE_EXITED');
    for (const observer of [page, viewer]) {
      await expectState(observer.getByTestId('connection-status'), 'RECOVERY_REQUIRED');
      await expectState(observer.getByTestId('lane-state'), 'RECOVERY_REQUIRED');
      await expect(observer.getByText('Native continuity unavailable', { exact: true })).toBeVisible();
      await expect(observer.getByRole('button', { name: 'Continue session' })).toBeDisabled();
      await expect(observer.getByRole('button', { name: 'Acquire control' })).toBeDisabled();
    }
    assert.deepEqual(consoleErrors, []);
    await page.setViewportSize({ width: 320, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'recovery machine code remains readable at narrow width');
  } finally { await browser.close(); socket.close(); await hub.close(); journal.close(); }
});
