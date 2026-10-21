import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';
import { startHub } from '../apps/hub/server.ts';
import { target } from './helpers.ts';
import type { AdoptionSnapshot, NativeThread } from '../packages/native-adoption/types.ts';

const artifacts = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S07/responsive');

test('FPX UX04: PWA assets are narrowly served with explicit MIME and no-store', async () => {
  mkdirSync(artifacts, { recursive: true });
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  const hub = await startHub({ port, target: target(), root: 'C:\\synthetic-fpx', sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(artifacts, 'hub-')), webDirectory: path.resolve('dist/web'), hcpToken: randomBytes(32).toString('hex'), bootstrapToken: randomBytes(32).toString('hex') });
  const origin = `http://127.0.0.1:${port}`;
  try {
    for (const [asset, mime] of [['fleetsplice.webmanifest', 'application/manifest+json'], ['fleetsplice.svg', 'image/svg+xml']]) {
      const response = await fetch(`${origin}/assets/${asset}`); assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), mime); assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    assert.equal((await fetch(`${origin}/assets/unrelated.svg`)).status, 404);
    const manifest = await (await fetch(`${origin}/assets/fleetsplice.webmanifest`)).json() as { start_url: string; icons: unknown[] };
    assert.equal(manifest.start_url, '/'); assert.equal(manifest.icons.length, 1);
  } finally { await hub.close(); }
});

test('FPX UX04: responsive viewport matrix, keyboard viewport, focus, drafts and no offline command queue', async () => {
  const server = await preview({ configFile: path.resolve('apps/web/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', reducedMotion: 'reduce', hasTouch: true });
  await context.addInitScript(() => { (window as any).EventSource = class { close() {} }; });
  const page = await context.newPage();
  const scenarios = JSON.parse(readFileSync('docs/ux/fixtures/fpx-cockpit-scenarios.json', 'utf8')).scenarios;
  const thread: NativeThread = { id: 'fixture-responsive', workspace: 'C:\\synthetic-fpx\\responsive', workspaceIdentity: 'fixture-root', origin: 'NATIVE_ADOPTED', status: 'idle', activeTurnId: null,
    lastTurnStatus: 'completed', model: 'fixture-model', permission: null, attached: true, stateToken: 'fixture-state', externalAdvance: false,
    history: [{ role: 'assistant', text: scenarios.find((s: any) => s.id === 'long-code').messages[0].text, turnId: 'fixture-turn', itemId: 'fixture-answer' }],
    turns: [{ id: 'fixture-turn', state: 'COMPLETED', startedAt: null, completedAt: null, durationMs: null }],
    activity: [{ id: 'fixture-tool', turnId: 'fixture-turn', text: 'Synthetic tool ' + 'long output '.repeat(100), status: 'completed' }], historyLimited: true, residualCommandState: 'NONE_OBSERVED' };
  const snapshot: AdoptionSnapshot = { runtimeId: 'fixture-runtime', state: 'READY', incarnation: 'fixture-incarnation',
    daemon: { executablePath: null, reportedVersion: 'fixture', sha256: null, processId: 202, processCreationTime: '2020001', endpoint: 'fixture-only', endpointIdentity: 'fixture', serverIncarnation: null },
    compatibility: { profile: 'ADOPT_FULL', observedAt: '2026-10-21T00:00:00Z', capabilities: Object.fromEntries(['sharedDaemon','threadList','threadRead','resume','events','turnStart','activeTurn','interrupt','steer','approvalObserve','approvalResolve','models','effectiveState'].map(key => [key, { available: false, evidence: 'SYNTHETIC_UI_ONLY' }])) as AdoptionSnapshot['compatibility']['capabilities'] },
    workspace: thread.workspace, controller: 'fixture-client', fence: 1, threads: [thread], receipts: [], approvals: [{ requestId: 0, threadId: thread.id, turnId: 'fixture-turn', itemId: 'fixture-item',
      requestType: 'fixture', digest: 'fixture-digest', summary: 'Synthetic approval. Responses unavailable.', workspace: thread.workspace, status: 'PENDING', supported: false, authority: null }], controlMode: 'COOPERATIVE', observationFailure: null };
  let writes = 0;
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()); const send = (value: unknown) => route.fulfill({ json: value });
    if (url.pathname === '/api/client') return send({ actorId: 'fixture', clientInstanceId: 'fixture-client', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 3600000, csrf: 'synthetic' });
    if (url.pathname === '/api/mode') return send({ mode: 'NATIVE_ADOPTION' });
    if (url.pathname === '/api/fleet/summary') return send({ gateway: { status: 'READY', deployment: {} }, hosts: [], runtimes: [], sessions: { discovered: 1, active: 0 }, attention: [], devices: [] });
    if (url.pathname === '/api/auth/principal') return send({ principal: { issuer: 'fixture', subject: 'fixture', displayName: 'Synthetic Owner' }, mode: 'FIXTURE' });
    if (url.pathname === '/api/native/snapshot') return send(snapshot);
    writes++; throw Error(`Unexpected fixture request: ${url.pathname}`);
  });
  const measurements: unknown[] = [];
  try {
    await page.goto(`http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`);
    const prompt = page.getByTestId('native-prompt'); await expect(prompt).toBeEnabled(); await prompt.fill('Preserve this draft across resize');
    for (const [width, height] of [[390,844],[412,915],[768,1024],[1024,768],[360,740],[540,720],[844,390],[1440,900]]) {
      await page.setViewportSize({ width: width!, height: height! });
      await expect.poll(() => page.getByTestId('composer-surface').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight + 1), { message: `${width}x${height} composer stays in view` }).toBe(true);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1), `${width}x${height} page overflow`);
      await expect(prompt).toHaveValue('Preserve this draft across resize'); await expect(page.getByTestId('composer-send')).toBeEnabled();
      const bounds = await page.getByTestId('composer-surface').boundingBox(); measurements.push({ width, height, composer: bounds });
      if ([390,768,1440].includes(width!)) await page.screenshot({ path: path.join(artifacts, `responsive-${width}.png`) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.locator('.message-code pre').evaluate(node => node.scrollWidth > node.clientWidth), 'long code scrolls locally');
    for (const id of ['nav-menu','context-menu','composer-send','config-capsule']) assert.ok((await page.getByTestId(id).boundingBox())!.height >= 44, `${id} touch height`);
    await page.getByTestId('nav-menu').click(); await expect(page.getByTestId('nav-drawer')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByTestId('nav-menu')).toBeFocused();
    await page.getByTestId('config-capsule').click(); await expect(page.getByTestId('config-sheet')).toBeVisible();
    await page.screenshot({ path: path.join(artifacts, 'config-sheet-390.png') });
    for (let index = 0; index < 4; index++) { await page.keyboard.press('Tab'); await expect.poll(() => page.getByTestId('config-sheet').evaluate(node => node.contains(document.activeElement))).toBe(true); }
    await page.keyboard.press('Escape'); await expect(page.getByTestId('config-capsule')).toBeFocused();
    await page.evaluate(() => { Object.defineProperty(visualViewport!, 'height', { configurable: true, value: 380 }); visualViewport!.dispatchEvent(new Event('resize')); });
    await expect.poll(() => page.getByTestId('composer-surface').evaluate(node => node.getBoundingClientRect().bottom <= 381)).toBe(true);
    await expect(prompt).toHaveValue('Preserve this draft across resize');
    await page.evaluate(() => { Object.defineProperty(visualViewport!, 'scale', { configurable: true, value: 2 }); visualViewport!.dispatchEvent(new Event('resize')); });
    assert.equal(await page.locator('.native-workspace').evaluate(node => (node as HTMLElement).style.getPropertyValue('--workspace-height')), '');
    await page.evaluate(() => { delete (visualViewport as any).height; delete (visualViewport as any).scale; visualViewport!.dispatchEvent(new Event('resize')); document.documentElement.style.fontSize = '20px'; });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('button', { name: 'Preferences', exact: true }).click(); await page.getByTestId('appearance-select').selectOption('dark'); await page.keyboard.press('Escape');
    snapshot.state = 'NATIVE_CONNECTION_LOST';
    await page.getByTestId('nav-menu').click(); await page.getByTestId('nav-drawer').getByRole('button', { name: 'Refresh discovery', exact: true }).click(); await page.keyboard.press('Escape');
    await expect(page.getByTestId('observation-attention')).toContainText('unverified'); await expect(page.getByTestId('composer-send')).toBeDisabled();
    snapshot.state = 'READY'; await page.getByRole('button', { name: 'Refresh observed state', exact: true }).click(); await expect(page.getByTestId('composer-send')).toBeEnabled();
    assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0); assert.equal(writes, 0);
    await page.screenshot({ path: path.join(artifacts, 'responsive-dark-390.png') });
    await page.evaluate(() => {
      const command = { commandId: 'fixture-unknown', runtimeId: 'fixture-runtime', incarnation: 'fixture-incarnation', clientInstanceId: 'fixture-client', expectedFence: 1,
        threadId: 'fixture-responsive', stateToken: 'fixture-state', activeTurnId: null, family: 'native.submit', text: 'Synthetic unknown input' };
      sessionStorage.setItem('fleetsplice.native.pending', JSON.stringify(command));
      sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify({ commandId: command.commandId, family: command.family, text: command.text, state: 'OUTCOME_UNKNOWN', createdAt: Date.now(),
        threadId: command.threadId, incarnation: command.incarnation, nativeTurnId: null, draftKey: 'fixture-incarnation:fixture-root:fixture-responsive' }));
    });
    await page.reload(); await expect(page.getByTestId('receipt-attention')).toContainText('Outcome unknown'); await expect(page.getByRole('button', { name: 'Check receipt', exact: true })).toBeVisible();
    assert.ok(await page.getByTestId('composer-surface').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight + 1)); assert.equal(writes, 0);
    await page.screenshot({ path: path.join(artifacts, 'unknown-390.png') });
    writeFileSync(path.join(artifacts, 'VIEWPORT-MEASUREMENTS.json'), JSON.stringify(measurements, null, 2));
  } finally { await browser.close(); await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
