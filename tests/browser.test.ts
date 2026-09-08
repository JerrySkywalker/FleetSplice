import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
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
  const context = await browser.newContext({ viewport: { width: 1480, height: 960 } }); const page = await context.newPage();
  const consoleErrors: string[] = []; page.on('pageerror', error => consoleErrors.push(error.message));
  try {
    await page.goto(`${origin}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByTestId('connection-status')).toHaveText('READY');
    assert.equal(new URL(page.url()).hash, '');
    await page.getByRole('button', { name: 'Register selected Workspace' }).click();
    await expect(page.getByRole('button', { name: '＋ New session' })).toBeEnabled();
    await page.getByRole('button', { name: '＋ New session' }).click();
    await expect(page.getByTestId('lane-state')).toHaveText('EMPTY');
    assert.equal(native.creates, 0);
    await page.getByRole('button', { name: 'Acquire control' }).click();
    await expect(page.getByRole('button', { name: 'Continue session' })).toBeEnabled();
    await page.getByRole('button', { name: 'Continue session' }).click();
    await expect(page.getByTestId('lane-state')).toHaveText('IDLE');
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
    await expect(page.getByTestId('lane-state')).toHaveText('RUNNING');
    await expect(page.getByRole('button', { name: 'Check command receipt' })).toBeEnabled();
    native.delta('<img src=x onerror=alert(1)> & real text is escaped'); native.complete();
    await page.getByRole('button', { name: 'Check command receipt' }).click();
    await expect(page.getByTestId('assistant-text')).toContainText('<img src=x');
    assert.equal(await page.locator('.message-text img').count(), 0);
    assert.equal(native.turns, 1);
    await expect(page.getByTestId('lane-state')).toHaveText('IDLE');
    await page.getByRole('button', { name: 'Continue session' }).click();
    await expect(page.getByRole('button', { name: 'Release control' })).toBeEnabled();
    assert.equal(native.creates, 1);
    for (let index = 1; index < 23; index++) {
      await page.getByRole('button', { name: '＋ New session' }).click();
      await expect(page.getByRole('navigation', { name: 'Sessions' }).getByRole('button')).toHaveCount(index + 1);
      await expect(page.getByRole('button', { name: '＋ New session' })).toBeEnabled();
    }
    await page.getByRole('navigation', { name: 'Sessions' }).getByRole('button').first().click();
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
    await expect(page.getByTestId('lane-state')).toHaveText('RUNNING');
    native.delta('existing session output'); native.complete();
    await expect(page.getByTestId('lane-state')).toHaveText('IDLE');
    assert.equal(native.creates, 1); assert.equal(native.turns, 2);
    await page.getByRole('button', { name: 'Release control' }).click();
    await expect(viewer.getByRole('button', { name: 'Acquire control' })).toBeEnabled();
    await page.screenshot({ path: 'test-results/synthetic-browser.png', fullPage: true });
    native.signals.emit('fault', 'NATIVE_EXITED');
    for (const observer of [page, viewer]) {
      await expect(observer.getByTestId('connection-status')).toHaveText('RECOVERY_REQUIRED');
      await expect(observer.getByTestId('lane-state')).toHaveText('RECOVERY_REQUIRED');
      await expect(observer.getByText('Native continuity unavailable', { exact: true })).toBeVisible();
      await expect(observer.getByRole('button', { name: 'Continue session' })).toBeDisabled();
      await expect(observer.getByRole('button', { name: 'Acquire control' })).toBeDisabled();
    }
    assert.deepEqual(consoleErrors, []);
  } finally { await browser.close(); socket.close(); await hub.close(); journal.close(); }
});
