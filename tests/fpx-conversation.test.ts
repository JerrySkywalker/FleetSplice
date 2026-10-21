import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';
import { messageBlocks } from '../apps/web/components/MessageText.tsx';
import { observedProvisional } from '../apps/web/NativeAdoption.tsx';
import type { AdoptionSnapshot, AdoptionCommand, NativeThread } from '../packages/native-adoption/types.ts';

test('FPX fenced blocks preserve text/code and unterminated stream without parsing HTML', () => {
  assert.deepEqual(messageBlocks('Literal <img src=x>\n```ts\nconst a = 1;\nconsole.log(a);\n```\nTail'), [
    { kind: 'text', text: 'Literal <img src=x>' }, { kind: 'code', language: 'ts', text: 'const a = 1;\nconsole.log(a);' }, { kind: 'text', text: 'Tail' },
  ]);
  assert.deepEqual(messageBlocks('```\npartial'), [{ kind: 'code', language: '', text: 'partial' }]);
});
test('FPX existing identical input in a steer Turn cannot prove the newly accepted input item', () => {
  const provisional = { commandId: 'new-command', family: 'native.steer' as const, text: 'continue', state: 'NATIVE_ACCEPTED' as const,
    createdAt: 0, threadId: 'thread', incarnation: 'incarnation', nativeTurnId: 'turn', draftKey: 'draft' };
  const thread = { id: 'thread', history: [{ role: 'user', text: 'continue', turnId: 'turn', itemId: 'previous-input', source: { kind: 'FLEETSPLICE_WEB', clientInstanceId: 'client' } }] } as NativeThread;
  assert.equal(observedProvisional(provisional, thread, 'incarnation', 'client'), false);
  assert.equal(observedProvisional({ ...provisional, family: 'native.submit' }, thread, 'another-incarnation', 'client'), false);
});

test('FPX UX02: inert rich text, native-item DOM continuity, scroll-away, IME and one explicit submission', async () => {
  const server = await preview({ configFile: path.resolve('apps/web/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', reducedMotion: 'reduce' });
  // Browser transport/clipboard doubles, never native RPC or the OS clipboard.
  await context.addInitScript(() => {
    const fixture = window as any;
    class FixtureEvents { onmessage: ((event: MessageEvent) => void) | null = null; onerror = null;
      constructor() { fixture.emit = (data: unknown) => this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) })); }
      close() {} }
    fixture.EventSource = FixtureEvents;
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => { fixture.copied = text; } } });
  });
  const page = await context.newPage();
  const scenarios = JSON.parse(readFileSync('docs/ux/fixtures/fpx-cockpit-scenarios.json', 'utf8')).scenarios;
  const code = scenarios.find((s: any) => s.id === 'long-code').messages[0].text;
  const thread: NativeThread = { id: 'fixture-conversation', workspace: 'C:\\synthetic-fpx\\workspace', workspaceIdentity: 'fixture-root', origin: 'NATIVE_ADOPTED',
    status: 'idle', activeTurnId: null, lastTurnStatus: 'completed', model: 'fixture-model', permission: null, attached: true, stateToken: 'fixture-state', externalAdvance: false,
    history: [{ role: 'assistant', text: `${code}\n<script>window.pwned=true</script>`, turnId: 'old-turn', itemId: 'old-answer' },
      ...Array.from({ length: 16 }, (_, index) => ({ role: 'assistant' as const, text: `Synthetic reading paragraph ${index}\n${'Preserve the reader position. '.repeat(24)}`, turnId: 'old-turn', itemId: `old-${index}` }))],
    turns: [{ id: 'old-turn', state: 'COMPLETED', startedAt: null, completedAt: null, durationMs: null }],
    activity: [{ id: 'unknown-tool', turnId: 'old-turn', text: 'Synthetic tool summary', status: 'unknown' }], historyLimited: true, residualCommandState: 'NONE_OBSERVED' };
  const snapshot: AdoptionSnapshot = { runtimeId: 'fixture-runtime', state: 'READY', incarnation: 'fixture-incarnation',
    daemon: { executablePath: null, reportedVersion: 'fixture', sha256: null, processId: 202, processCreationTime: '2020001', endpoint: 'fixture-only', endpointIdentity: 'fixture', serverIncarnation: null },
    compatibility: { profile: 'ADOPT_FULL', observedAt: '2026-10-21T00:00:00Z', capabilities: Object.fromEntries(['sharedDaemon','threadList','threadRead','resume','events','turnStart','activeTurn','interrupt','steer','approvalObserve','approvalResolve','models','effectiveState'].map(key => [key, { available: false, evidence: 'SYNTHETIC_UI_ONLY' }])) as AdoptionSnapshot['compatibility']['capabilities'] },
    workspace: thread.workspace, controller: null, fence: 0, threads: [thread], receipts: [], controlMode: 'COOPERATIVE', observationFailure: null };
  const other = JSON.parse(JSON.stringify(thread)) as NativeThread;
  other.id = 'fixture-conversation-other';
  other.history[0]!.text = 'Another thread\n```ts\nconst second = 2;\n```';
  snapshot.threads.push(other); // Deliberately colliding Turn/item IDs in the same workspace.
  const commands: AdoptionCommand[] = [];
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()); const send = (value: unknown) => route.fulfill({ json: value });
    if (url.pathname === '/api/client') return send({ actorId: 'fixture', clientInstanceId: 'fixture-client', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 3600000, csrf: 'synthetic' });
    if (url.pathname === '/api/mode') return send({ mode: 'NATIVE_ADOPTION' });
    if (url.pathname === '/api/fleet/summary') return send({ gateway: { status: 'READY', deployment: {} }, hosts: [], runtimes: [], sessions: { discovered: 2, active: 0 }, attention: [], devices: [] });
    if (url.pathname === '/api/auth/principal') return send({ principal: { issuer: 'fixture', subject: 'fixture', displayName: 'Synthetic Owner' }, mode: 'FIXTURE' });
    if (url.pathname === '/api/native/snapshot') return send(snapshot);
    if (url.pathname === '/api/native/commands') {
      const command = route.request().postDataJSON() as AdoptionCommand; commands.push(command);
      thread.status = 'active'; thread.activeTurnId = 'accepted-turn'; thread.turns.push({ id: 'accepted-turn', state: 'RUNNING', startedAt: null, completedAt: null, durationMs: null });
      return send({ commandId: command.commandId, family: command.family, status: 'SUCCEEDED', code: 'SYNTHETIC_NATIVE_ACCEPTED', daemon: snapshot.daemon,
        threadId: thread.id, turnId: 'accepted-turn', origin: 'NATIVE_ADOPTED', createdNativeThread: false, processTerminationClaim: false });
    }
    throw Error(`Unexpected fixture request: ${url.pathname}`);
  });
  const artifact = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S04'); mkdirSync(artifact, { recursive: true });
  try {
    await page.goto(`http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`);
    const prompt = page.getByTestId('native-prompt'); await expect(prompt).toBeEnabled();
    assert.ok(await prompt.evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 14));
    await expect(page.locator('[data-tool-status="unknown"]')).toContainText('Status unknown');
    const tool = page.locator('[data-tool-status="unknown"]');
    assert.ok((await tool.boundingBox())!.height <= 52, 'tool begins as a compact trace row');
    await tool.getByRole('button').click(); await expect(tool.locator('pre')).toHaveText('Synthetic tool summary');
    await tool.getByRole('button').click(); await expect(tool.locator('pre')).toHaveCount(0);
    assert.equal(await page.evaluate(() => (window as any).pwned), undefined);
    await expect(page.locator('.message-code pre')).toHaveCount(1);
    await page.getByRole('button', { name: 'Copy code', exact: true }).click();
    assert.match(await page.evaluate(() => (window as any).copied), /const message =/);
    const timeline = page.getByTestId('conversation-timeline');
    await timeline.evaluate(node => node.scrollTo({ top: 240, behavior: 'instant' }));
    const readingA = await timeline.evaluate(node => node.scrollTop);
    await page.keyboard.press('Control+k');
    const switcher = page.getByRole('dialog', { name: 'Switch session', exact: true });
    await switcher.getByRole('combobox').fill(other.id); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toHaveCount(1);
    await expect(page.locator('.message-code pre')).toContainText('const second = 2;');
    await page.keyboard.press('Control+k');
    // Full native IDs are not visible row copy; Command's value still binds the
    // exact thread, including fixture IDs sharing the same prefix.
    await switcher.locator(`[cmdk-item][data-value="${thread.id}"]`).click();
    await expect.poll(async () => Math.abs(await timeline.evaluate(node => node.scrollTop) - readingA)).toBeLessThan(2);
    await prompt.fill('Viewer draft'); await prompt.press('Enter');
    await expect(prompt).toHaveValue('Viewer draft\n');
    await prompt.press('Control+Enter'); assert.equal(commands.length, 0);
    snapshot.controller = 'fixture-client';
    await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(page.getByTestId('composer-send')).toBeEnabled();
    await prompt.dispatchEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true, keyCode: 229 });
    assert.equal(commands.length, 0);
    await prompt.press('Control+Enter');
    await expect.poll(() => commands.length).toBe(1);
    await expect(page.getByTestId('presentation-state')).toHaveText('Accepted (awaiting observation)');
    await expect(page.locator('.native-turn-marker [data-turn-id="accepted-turn"]')).toContainText('Working');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'active-turn controls wrap within the phone width');
    await expect(page.getByTestId('config-capsule')).toBeVisible();
    await page.screenshot({ path: path.join(artifact, 'composer-active-390.png') });
    await page.setViewportSize({ width: 1440, height: 900 });
    const emit = async (eventId: string, kind: string, text: string, itemId = 'new-answer') => page.evaluate(data => (window as any).emit(data), {
      eventId, revision: eventId, stream: 'agent.execution', kind, threadId: thread.id, turnId: 'accepted-turn', semantic: { role: 'assistant', text, itemId },
    });
    await emit('d1', 'message.delta', 'Hello');
    const message = page.locator('[data-item-id="new-answer"]'); await expect(message).toContainText('Hello');
    await message.evaluate(node => { (node as any).identityProbe = 'preserved'; });
    await emit('d2', 'message.delta', ' world'); await emit('f1', 'message.final', 'Hello world'); await emit('f2', 'message.final', 'Hello world'); await emit('d3', 'message.delta', 'old fragment');
    await expect(message).toHaveCount(1); await expect(message).toContainText('Hello world'); await expect(message).not.toContainText('old fragment');
    await timeline.evaluate(node => node.scrollTo({ top: node.scrollHeight, behavior: 'instant' }));
    await page.evaluate(data => (window as any).emit(data), { eventId: 'tool-only', revision: '50', stream: 'agent.execution', kind: 'tool.started',
      threadId: thread.id, turnId: 'accepted-turn', semantic: { role: 'tool', toolId: 'tool-only', itemId: 'tool-only', status: 'inProgress', text: `powershell ${'Synthetic tool-only output summary. '.repeat(40)}` } });
    await expect(page.locator('[data-item-id="tool-only"]')).toHaveAttribute('data-tool-status', 'running');
    await expect.poll(() => timeline.evaluate(node => node.scrollTop + node.clientHeight >= node.scrollHeight - 48)).toBe(true);
    thread.activity.push({ id: 'observed-tool-only', turnId: 'accepted-turn', text: `powershell ${'Authoritative activity-only summary. '.repeat(40)}`, status: 'inProgress' });
    await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(page.locator('[data-item-id="observed-tool-only"]')).toHaveAttribute('data-tool-status', 'running');
    await expect.poll(() => timeline.evaluate(node => node.scrollTop + node.clientHeight >= node.scrollHeight - 48)).toBe(true);
    await timeline.evaluate(node => node.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.getByRole('button', { name: 'Jump to latest activity' })).toBeVisible();
    await emit('d4', 'message.delta', 'New output while reading', 'another-answer');
    await expect(page.locator('[data-item-id="another-answer"]')).toContainText('New output while reading');
    assert.ok(await timeline.evaluate(node => node.scrollTop < 20));
    thread.history.push({ role: 'user', text: commands[0]!.text, turnId: 'accepted-turn', itemId: 'new-user', source: { kind: 'FLEETSPLICE_WEB', clientInstanceId: 'fixture-client' } },
      { role: 'assistant', text: 'Hello world', turnId: 'accepted-turn', itemId: 'new-answer' });
    thread.turns.at(-1)!.state = 'COMPLETED'; thread.status = 'idle'; thread.activeTurnId = null;
    await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await expect(message).toHaveAttribute('data-testid', 'conversation-message');
    assert.equal(await message.evaluate(node => (node as any).identityProbe), 'preserved');
    await expect(page.getByTestId('presentation-state')).toHaveCount(0);
    await expect(page.getByTestId('partial-assistant')).toContainText('Turn ended; partial observation');
    await page.getByRole('button', { name: 'Jump to latest activity' }).click();
    await expect.poll(() => timeline.evaluate(node => node.scrollTop + node.clientHeight >= node.scrollHeight - 48)).toBe(true);
    await expect(page.getByRole('button', { name: 'Jump to latest activity' })).toHaveCount(0);
    await page.screenshot({ path: path.join(artifact, 'conversation-1440.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(artifact, 'conversation-390.png') });
    assert.equal(commands.length, 1);
  } finally { await browser.close(); await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
