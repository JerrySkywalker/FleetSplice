import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';
import { createFpxOwnerFixture } from './fixtures/fpx-owner-preview.ts';

test('U05 unreachable, signed-out and incompatible states offer observation/login only', async () => {
  const server = await preview({ configFile: path.resolve('apps/web/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ locale: 'en-US' });
  await context.addInitScript(() => { (window as any).EventSource = class { close() {} }; });
  const fixture = createFpxOwnerFixture(); const snapshot = await fixture.port.snapshot({}); snapshot.compatibility.profile = 'UNSUPPORTED';
  let mode = 'unreachable'; let mutations = 0; let observations = 0;
  await context.route('**/api/**', async route => {
    const url = new URL(route.request().url()); const send = (value: unknown) => route.fulfill({ json: value });
    if (url.pathname === '/api/auth/status') return mode === 'unreachable' ? route.abort('connectionrefused') : send({ mode: 'OIDC', authenticated: mode === 'unsupported', principalId: 'synthetic' });
    if (url.pathname === '/api/client') return send({ actorId: 'fixture', clientInstanceId: 'fixture-client', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 3600000, csrf: 'synthetic' });
    if (url.pathname === '/api/mode') return send({ mode: 'NATIVE_ADOPTION' });
    if (url.pathname === '/api/native/snapshot') { observations++; return send(snapshot); }
    if (url.pathname === '/api/fleet/summary') return send({ gateway: { status: 'READY', deployment: {} }, hosts: [], runtimes: [], sessions: { discovered: 0, active: 0 }, attention: [], devices: [] });
    if (url.pathname === '/api/auth/principal') return send({ principal: { issuer: 'fixture', subject: 'fixture' }, mode: 'OIDC' });
    if (url.pathname === '/api/native/commands') { mutations++; return route.fulfill({ status: 403, json: { error: 'UNEXPECTED_SYNTHETIC_WRITE' } }); }
    throw Error(`Unexpected fixture request: ${url.pathname}`);
  });
  try {
    const page = await context.newPage(); const origin = `http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`;
    await page.goto(origin); await expect(page.getByRole('alert')).toContainText('Gateway could not be reached');
    mode = 'signedOut'; await page.getByRole('button', { name: 'Check connection' }).click(); await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute('href', '/auth/login');
    mode = 'unsupported'; await page.getByRole('button', { name: 'Check connection' }).click();
    await expect(page.getByTestId('compatibility-attention')).toContainText('Native control is not supported');
    await expect(page.getByTestId('compatibility-attention')).toContainText('UNSUPPORTED');
    const before = observations; await page.getByTestId('compatibility-attention').getByRole('button', { name: 'Refresh observed state' }).click();
    await expect.poll(() => observations).toBeGreaterThan(before);
    await expect(page.getByTestId('ownership-action')).toBeDisabled(); assert.equal(mutations, 0);
  } finally { fixture.close(); await browser.close(); await new Promise<void>(resolve => server.httpServer.close(() => resolve())); }
});

test('U04/U05 Manager keeps the public origin and explains a bound window or unavailable Agent', async () => {
  const server = await preview({ configFile: path.resolve('apps/desktop/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true }); const context = await browser.newContext({ locale: 'en-US' });
  await context.addInitScript(() => {
    const fixture = window as any; fixture.calls = [];
    fixture.__TAURI_INTERNALS__ = { invoke: async (command: string) => {
      fixture.calls.push(command);
      if (command === 'agent_status') throw 'SUPERVISOR_UNAVAILABLE';
      if (command === 'agent_runtimes') return [];
      if (command === 'autostart_enabled') return false;
      if (command === 'open_workspace') { if (fixture.boundOther) throw 'WORKSPACE_OPEN_AT_ANOTHER_ORIGIN_CLOSE_IT_FIRST'; return; }
      throw Error(`Unexpected fixture IPC:${command}`);
    } };
  });
  try {
    const page = await context.newPage(); await page.goto(`http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`);
    await expect(page.getByRole('status')).toContainText('The local Agent is unavailable');
    await page.getByRole('button', { name: 'Workspace', exact: true }).click();
    await page.getByLabel('Gateway origin').fill('https://gateway.example.test');
    await page.getByRole('button', { name: 'Open / return to Workspace', exact: true }).click();
    assert.equal(await page.evaluate(() => localStorage.getItem('fleetsplice.workspace.origin')), 'https://gateway.example.test');
    await page.evaluate(() => { (window as any).boundOther = true; });
    await page.getByLabel('Gateway origin').fill('https://other.example.test');
    await page.getByRole('button', { name: 'Open / return to Workspace', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('close it before opening a different Gateway');
    assert.equal(await page.evaluate(() => localStorage.getItem('fleetsplice.workspace.origin')), 'https://gateway.example.test');
    assert.deepEqual(await page.evaluate(() => (window as any).calls), ['agent_status', 'agent_runtimes', 'autostart_enabled', 'open_workspace', 'open_workspace']);
  } finally { await browser.close(); await new Promise<void>(resolve => server.httpServer.close(() => resolve())); }
});
