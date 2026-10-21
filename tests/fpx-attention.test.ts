import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';
import type { AdoptionCommand, AdoptionSnapshot, NativeThread } from '../packages/native-adoption/types.ts';

test('FPX UX03: exact approval, viewer, stale authority, review, ambiguous receipt and offline attention', async () => {
  const server = await preview({ configFile: path.resolve('apps/web/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US', reducedMotion: 'reduce' });
  // No SSE/native transport is opened. All API requests are intercepted below.
  await context.addInitScript(() => { (window as any).EventSource = class { close() {} }; });
  const page = await context.newPage();
  const thread: NativeThread = { id: 'fixture-attention', workspace: 'C:\\synthetic-fpx\\attention', workspaceIdentity: 'fixture-root', origin: 'NATIVE_ADOPTED',
    status: 'active', activeTurnId: 'fixture-turn', lastTurnStatus: null, model: 'fixture-model', permission: null, attached: true, stateToken: 'fixture-state', externalAdvance: false,
    history: [], turns: [{ id: 'fixture-turn', state: 'RUNNING', startedAt: null, completedAt: null, durationMs: null }], activity: [], historyLimited: true, residualCommandState: 'NONE_OBSERVED' };
  const approval = { requestId: 0, threadId: thread.id, turnId: 'fixture-turn', itemId: 'fixture-item', requestType: 'commandExecution', digest: 'fixture-digest',
    summary: 'Synthetic approval: inspect fixture output only', workspace: thread.workspace, status: 'PENDING' as const, supported: true, authority: 'fixture-authority' as string | null };
  const snapshot: AdoptionSnapshot = { runtimeId: 'fixture-runtime', state: 'READY', incarnation: 'fixture-incarnation',
    daemon: { executablePath: null, reportedVersion: 'fixture', sha256: null, processId: 202, processCreationTime: '2020001', endpoint: 'fixture-only', endpointIdentity: 'fixture', serverIncarnation: null },
    compatibility: { profile: 'ADOPT_FULL', observedAt: '2026-10-21T00:00:00Z', capabilities: Object.fromEntries(['sharedDaemon','threadList','threadRead','resume','events','turnStart','activeTurn','interrupt','steer','approvalObserve','approvalResolve','models','effectiveState'].map(key => [key, { available: true, evidence: 'SYNTHETIC_UI_ONLY' }])) as AdoptionSnapshot['compatibility']['capabilities'] },
    workspace: thread.workspace, controller: 'other-client', fence: 7, threads: [thread, { ...thread, id: 'fixture-other', history: [], turns: [], status: 'idle', activeTurnId: null }],
    receipts: [], approvals: [approval], controlMode: 'COOPERATIVE', observationFailure: null };
  const commands: AdoptionCommand[] = []; let lookups = 0; let ambiguousApproval = false; let staleReview = true;
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()); const send = (value: unknown) => route.fulfill({ json: value });
    if (url.pathname === '/api/client') return send({ actorId: 'fixture', clientInstanceId: 'fixture-client', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 3600000, csrf: 'synthetic' });
    if (url.pathname === '/api/mode') return send({ mode: 'NATIVE_ADOPTION' });
    if (url.pathname === '/api/fleet/summary') return send({ gateway: { status: 'READY', deployment: {} }, hosts: [], runtimes: [], sessions: { discovered: 2, active: 1 }, attention: [], devices: [] });
    if (url.pathname === '/api/auth/principal') return send({ principal: { issuer: 'fixture', subject: 'fixture', displayName: 'Synthetic Owner' }, mode: 'FIXTURE' });
    if (url.pathname === '/api/native/snapshot') return send(snapshot);
    const receipt = (command: AdoptionCommand, status: string, code: string) => ({ commandId: command.commandId, family: command.family, status, code, daemon: snapshot.daemon,
      threadId: command.threadId, turnId: command.activeTurnId, origin: 'NATIVE_ADOPTED', createdNativeThread: false, processTerminationClaim: false });
    if (url.pathname === '/api/native/commands') {
      const command = route.request().postDataJSON() as AdoptionCommand; commands.push(command);
      if (command.family === 'native.approval') {
        if (ambiguousApproval) { snapshot.approvals![0]!.status = 'UNKNOWN'; return send(receipt(command, 'AMBIGUOUS_EFFECT', 'SYNTHETIC_APPROVAL_UNKNOWN')); }
        snapshot.approvals![0]!.status = 'RESOLVED'; approval.authority = null;
        return send(receipt(command, 'REJECTED', 'STALE_NATIVE_REQUEST'));
      }
      if (command.family === 'native.reviewState') {
        if (staleReview) { staleReview = false; snapshot.fence = 8; return send(receipt(command, 'REJECTED', 'STALE_FENCE')); }
        thread.externalAdvance = false; thread.stateToken = 'reviewed-state'; return send(receipt(command, 'SUCCEEDED', 'SYNTHETIC_REVIEWED'));
      }
      if (command.family === 'native.submit') return route.abort('connectionreset');
      throw Error(`Unexpected synthetic write: ${command.family}`);
    }
    if (url.pathname.startsWith('/api/native/commands/')) {
      lookups++; const command = commands.at(-1)!;
      if (command.family === 'native.approval') { snapshot.approvals![0]!.status = 'RESOLVED'; return send(receipt(command, 'SUCCEEDED', 'SYNTHETIC_RECEIPT_RESOLVED')); }
      return send(receipt(command, 'AMBIGUOUS_EFFECT', 'SYNTHETIC_UNKNOWN_NO_REPLAY'));
    }
    throw Error(`Unexpected fixture request: ${url.pathname}`);
  });
  const artifact = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/execution-200h-20261021/UX03'); mkdirSync(artifact, { recursive: true });
  try {
    await page.goto(`http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`);
    const attention = page.getByTestId('session-attention'); const card = attention.getByTestId('approval-card'); const prompt = page.getByTestId('native-prompt');
    const refresh = () => page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(card).toContainText('Request 0'); await expect(card).toContainText('Item fixture-item');
    await expect(card.getByRole('button')).toHaveCount(0);
    await prompt.fill('Viewer draft'); await prompt.press('Control+Enter'); assert.equal(commands.length, 0);
    snapshot.controller = 'fixture-client'; approval.supported = false; await refresh();
    await expect(card).toContainText('native interface'); await expect(card.getByRole('button')).toHaveCount(0);
    approval.supported = true; await refresh();
    await expect(card.getByRole('button', { name: 'Allow once', exact: true })).toBeEnabled();
    await expect(card.getByRole('button', { name: 'Deny', exact: true })).toBeEnabled();
    await page.screenshot({ path: path.join(artifact, 'approval-1440.png') });
    await card.getByRole('button', { name: 'Allow once', exact: true }).click();
    await expect(card).toContainText('Native request resolved'); await expect(card.getByRole('button')).toHaveCount(0);
    assert.equal(commands.length, 1); assert.equal(commands[0]!.expectedFence, 7);
    assert.deepEqual(commands[0]!.approval, { requestId: 0, threadId: thread.id, turnId: 'fixture-turn', itemId: 'fixture-item', requestType: 'commandExecution', digest: 'fixture-digest', authority: 'fixture-authority', decision: 'ALLOW_ONCE' });
    thread.externalAdvance = true; thread.stateToken = 'advanced-state'; await refresh();
    await expect(page.getByTestId('external-review-action')).toHaveCount(1); await expect(page.getByTestId('composer-send')).toHaveCount(0);
    await page.getByTestId('external-review-action').click(); await expect(page.getByRole('alert')).toContainText('STALE_FENCE');
    await expect(page.getByTestId('external-review-action')).toBeEnabled(); assert.equal(commands.length, 2);
    await page.getByTestId('external-review-action').click(); await expect(page.getByTestId('external-review-action')).toHaveCount(0);
    assert.equal(commands[1]!.stateToken, 'advanced-state'); assert.equal(commands[1]!.family, 'native.reviewState');
    assert.equal(commands[2]!.expectedFence, 8);
    ambiguousApproval = true; snapshot.approvals![0]!.status = 'PENDING'; approval.authority = 'fixture-authority-2'; await refresh();
    await card.getByRole('button', { name: 'Deny', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Check receipt', exact: true })).toHaveCount(1);
    await expect(page.getByTestId('ownership-action')).toBeDisabled(); assert.equal(commands.length, 4);
    await page.getByRole('button', { name: 'Check receipt', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Check receipt', exact: true })).toHaveCount(0);
    thread.status = 'idle'; thread.activeTurnId = null; thread.turns[0]!.state = 'COMPLETED'; await refresh();
    await prompt.fill('Synthetic uncertain input'); await page.getByTestId('composer-send').click();
    await expect(attention.getByTestId('receipt-attention')).toContainText('Outcome unknown');
    await expect(page.getByRole('button', { name: 'Check receipt', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Check receipt', exact: true }).click();
    await expect(page.getByTestId('presentation-state')).toHaveText('Ambiguous effect');
    await expect(page.getByRole('button', { name: 'Check receipt', exact: true })).toHaveCount(1);
    assert.equal(lookups, 2); assert.equal(commands.length, 5);
    await page.keyboard.press('Control+k'); const switcher = page.getByRole('dialog', { name: 'Switch session', exact: true });
    await switcher.getByRole('combobox').fill('fixture-other'); await page.keyboard.press('Enter');
    await expect(page.getByTestId('other-thread-pending')).toContainText(thread.id);
    await prompt.fill('Keep this separate draft'); await expect(page.getByTestId('composer-send')).toBeDisabled();
    await prompt.press('Control+Enter'); assert.equal(commands.length, 5);
    await page.getByTestId('other-thread-pending').getByRole('button').click();
    snapshot.state = 'NATIVE_CONNECTION_LOST'; await refresh();
    await expect(page.getByTestId('observation-attention')).toContainText('Native execution state is unverified');
    await expect(page.getByRole('button', { name: 'Refresh observed state', exact: true })).toBeEnabled();
    await expect(page.getByTestId('ownership-action')).toBeDisabled();
    await expect(page.locator('body')).not.toContainText('original native TUI remains usable');
    await page.screenshot({ path: path.join(artifact, 'unknown-offline-1440.png') });
    assert.equal(commands.length, 5);
  } finally { await browser.close(); await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
