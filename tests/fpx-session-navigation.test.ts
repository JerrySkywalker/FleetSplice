import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { preview } from 'vite';
import { matchingSessions } from '../apps/web/layout/session-navigation.ts';
import type { AdoptionSnapshot, NativeThread } from '../packages/native-adoption/types.ts';

const scenarios = JSON.parse(readFileSync('docs/ux/fixtures/fpx-cockpit-scenarios.json', 'utf8')).scenarios;
const thread = (scenario: any, workspace = 'C:\\synthetic-fpx\\workspace'): NativeThread => ({
  id: scenario.thread_id, workspace, workspaceIdentity: 'fixture-root', origin: 'NATIVE_ADOPTED', status: 'idle', activeTurnId: null,
  lastTurnStatus: 'completed', model: 'fixture-model', permission: null, attached: false, stateToken: 'fixture-state', externalAdvance: false,
  history: [{ role: 'user', text: scenario.title, turnId: 'fixture-turn', itemId: 'fixture-user' }], turns: [], activity: [], historyLimited: false, residualCommandState: 'NONE_OBSERVED',
});
const threads = [thread(scenarios[0]), thread(scenarios[1], 'C:\\synthetic-fpx\\second-workspace')];
test('FPX navigation searches identity/workspace and prioritizes only observed recent sessions', () => {
  assert.equal(matchingSessions(threads, 'second-workspace code')[0]?.id, threads[1]!.id);
  assert.equal(matchingSessions(threads, threads[0]!.id)[0]?.id, threads[0]!.id);
  assert.equal(matchingSessions(threads, 'missing').length, 0);
  assert.deepEqual(matchingSessions(threads, '', ['missing', threads[1]!.id]).map(t => t.id), [threads[1]!.id, threads[0]!.id]);
});

test('FPX UX01: passive navigation, modal focus and attached-thread draft/unknown isolation', async () => {
  const server = await preview({ configFile: path.resolve('apps/web/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const artifact = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S03/navigation');
  mkdirSync(artifact, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();
  const commands: string[] = [];
  const nativeCommands: { family: string; threadId: string; text: string }[] = [];
  let syntheticCommandLoss = false; let sseContent = '\n';
  const daemon = { executablePath: 'C:\\synthetic-fpx\\codex.exe', reportedVersion: 'fixture', sha256: null, processId: 202,
    processCreationTime: '2020001', endpoint: 'fixture-only', endpointIdentity: 'fixture-endpoint', serverIncarnation: null };
  const snapshot: AdoptionSnapshot = { runtimeId: 'fixture-runtime', state: 'READY', incarnation: 'fixture-incarnation', daemon,
    compatibility: { profile: 'UNSUPPORTED', observedAt: '2026-10-21T00:00:00Z', capabilities: Object.fromEntries(['sharedDaemon','threadList','threadRead','resume','events','turnStart','activeTurn','interrupt','steer','approvalObserve','approvalResolve','models','effectiveState'].map(key => [key, { available: false, evidence: 'SYNTHETIC_UI_ONLY' }])) as AdoptionSnapshot['compatibility']['capabilities'] },
    workspace: threads[0]!.workspace, controller: null, fence: 0, threads, receipts: [], controlMode: 'COOPERATIVE', observationFailure: null };
  let delayed = false; let release: (() => void) | undefined; let staleDelivered = false;
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const send = (value: unknown) => route.fulfill({ json: value });
    if (url.pathname === '/api/client') return send({ actorId: 'fixture-actor', clientInstanceId: 'fixture-client', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 3600000, csrf: 'synthetic-only' });
    if (url.pathname === '/api/mode') return send({ mode: 'NATIVE_ADOPTION' });
    if (url.pathname === '/api/auth/principal') return send({ principal: { issuer: 'synthetic', subject: 'fixture', displayName: 'Synthetic Owner', email: null }, mode: 'FIXTURE' });
    if (url.pathname === '/api/fleet/summary') return send({ gateway: { status: 'READY', deployment: {} }, hosts: [], runtimes: [], sessions: { discovered: 2, active: 0 }, attention: [], devices: [] });
    if (url.pathname === '/api/native/events') return route.fulfill({ contentType: 'text/event-stream', body: sseContent });
    if (url.pathname === '/api/native/commands' && syntheticCommandLoss) {
      nativeCommands.push(route.request().postDataJSON()); return route.abort('failed');
    }
    if (url.pathname === '/api/native/snapshot') {
      if (delayed) {
        delayed = false;
        await new Promise<void>(resolve => { release = resolve; });
        staleDelivered = true;
        return send({ ...snapshot, state: 'STALE_SHOULD_NOT_RENDER' });
      }
      return send(snapshot);
    }
    commands.push(url.pathname); return route.fulfill({ status: 400, json: { error: 'NO_COMMANDS_AUTHORIZED_IN_UI_FIXTURE' } });
  });
  try {
    const port = (server.httpServer.address() as { port: number }).port;
    await page.goto(`http://127.0.0.1:${port}`);
    await expect(page.getByTestId('navigation-panel').getByRole('button', { name: /Review a small patch/ })).toBeVisible();
    await page.keyboard.press('Control+k');
    const switcher = page.getByRole('dialog', { name: 'Switch session', exact: true });
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveCSS('opacity', '1');
    await page.screenshot({ path: path.join(artifact, 'command-1440.png'), animations: 'disabled' });
    await switcher.getByRole('combobox').fill('second-workspace');
    await page.keyboard.press('Enter');
    await expect(switcher).not.toBeVisible();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(threads[1]!.id);
    await expect(page.getByTestId('quick-switch-trigger')).toBeFocused();
    await page.reload();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(threads[1]!.id);
    await page.getByTestId('toggle-left').click(); await page.reload();
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-left-collapsed', 'true');
    await page.getByTestId('toggle-left').click();
    await page.screenshot({ path: path.join(artifact, 'desktop-1440.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId('nav-menu').click();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByTestId('nav-drawer')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: path.join(artifact, 'session-sheet-390.png'), animations: 'disabled' });
    await page.getByTestId('nav-drawer').getByRole('button', { name: 'Close sessions' }).focus();
    await page.keyboard.press('Shift+Tab');
    assert.ok(await page.getByTestId('nav-drawer').evaluate(node => node.contains(document.activeElement)));
    // Base UI owns the modal focus guards; verify the keyboard behavior rather
    // than the former hand-written inert attribute implementation.
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Tab');
      await expect.poll(() => page.getByTestId('nav-drawer').evaluate(node => node.contains(document.activeElement))).toBe(true);
    }
    await page.getByTestId('nav-drawer').getByRole('button', { name: /Review a small patch/ }).click();
    await expect(page.getByTestId('nav-drawer')).toHaveCount(0);
    await expect(page.getByTestId('nav-menu')).toBeFocused();
    await page.getByTestId('quick-switch-trigger').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('quick-switch-trigger')).toBeFocused();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: path.join(artifact, 'mobile-390.png'), fullPage: true });
    // Force two overlapping read responses. The older response must not
    // replace the newer inventory/status; no command is part of this test.
    await page.getByTestId('nav-menu').click(); delayed = true;
    await page.getByTestId('nav-drawer').getByRole('button', { name: 'Refresh discovery' }).click();
    await expect.poll(() => !!release).toBe(true);
    await page.getByTestId('nav-drawer').getByRole('button', { name: 'Refresh discovery' }).click();
    release!(); await expect.poll(() => staleDelivered).toBe(true);
    await expect(page.getByTestId('nav-drawer').getByRole('status')).not.toHaveText('STALE_SHOULD_NOT_RENDER');
    assert.deepEqual(commands, []);
    // Attached sessions expose the review's cross-thread bugs. These API
    // replies are synthetic browser data, never a NativeRpc connection.
    await page.setViewportSize({ width: 1440, height: 900 });
    snapshot.compatibility.profile = 'ADOPT_FULL'; snapshot.controller = 'fixture-client';
    threads.forEach(thread => { thread.attached = true; });
    sseContent = `data: ${JSON.stringify({ eventId: 'fixture-live-A', revision: '1', stream: 'agent.execution', kind: 'message.delta', threadId: threads[0]!.id,
      turnId: 'fixture-live-turn', semantic: { role: 'assistant', text: 'Live content belongs only to A', itemId: 'fixture-live-item' } })}\n\n`;
    await page.reload();
    const prompt = page.getByTestId('native-prompt');
    await expect(prompt).toBeEnabled();
    await expect(page.getByText('Live content belongs only to A', { exact: true })).toBeVisible();
    await prompt.fill('Draft only for A');
    await page.keyboard.press('Control+k');
    await switcher.getByRole('combobox').fill('second-workspace'); await page.keyboard.press('Enter');
    await expect(prompt).toHaveValue('');
    await expect(page.getByText('Live content belongs only to A', { exact: true })).toHaveCount(0);
    await prompt.fill('Draft only for B');
    await page.keyboard.press('Control+k');
    await switcher.getByRole('combobox').fill('small patch'); await page.keyboard.press('Enter');
    await expect(prompt).toHaveValue('Draft only for A');
    await prompt.focus(); await page.keyboard.press('Control+k'); await page.keyboard.press('Escape');
    await expect(page.getByTestId('quick-switch-trigger')).toBeFocused();
    syntheticCommandLoss = true;
    await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('presentation-state')).toHaveText('Outcome unknown');
    await page.keyboard.press('Control+k');
    await switcher.getByRole('combobox').fill('second-workspace'); await page.keyboard.press('Enter');
    await expect(prompt).toHaveValue('Draft only for B');
    await expect(page.locator('.provisional')).toHaveCount(0);
    await expect(page.getByTestId('other-thread-pending')).toContainText(threads[0]!.id);
    await expect(page.getByTestId('composer-send')).toBeDisabled();
    assert.equal(nativeCommands.length, 1);
    assert.equal(nativeCommands[0]!.threadId, threads[0]!.id);
    assert.equal(nativeCommands[0]!.text, 'Draft only for A');
    snapshot.incarnation = 'fixture-new-incarnation';
    await page.reload();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(threads[0]!.id);
    await expect(prompt).toHaveValue('');
    await expect(page.getByTestId('composer-send')).toBeDisabled();
    assert.equal(nativeCommands.length, 1);
  } finally { release?.(); await browser.close(); await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
