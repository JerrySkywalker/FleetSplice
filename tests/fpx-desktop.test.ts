import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';

test('FPX UX05: Desktop modes preserve Manager selection and use only the explicit Workspace IPC', async () => {
  const server = await preview({ configFile: path.resolve('apps/desktop/vite.config.ts'), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 960, height: 680 }, deviceScaleFactor: 1.5 });
  await context.addInitScript(() => {
    const fixture = window as any; fixture.desktopCalls = []; fixture.failWorkspace = false;
    fixture.__TAURI_INTERNALS__ = { invoke: async (command: string, args: any) => {
      fixture.desktopCalls.push({ command, args });
      if (command === 'agent_status') return { code: 'SYNTHETIC_READY', hub: 'Fixture only', nativeCodex: 'NOT_CONNECTED' };
      if (command === 'agent_runtimes') return [];
      if (command === 'autostart_enabled') return false;
      if (command === 'open_workspace') {
        if (fixture.failWorkspace) throw 'SYNTHETIC_WORKSPACE_UNAVAILABLE';
        const url = new URL(args.origin);
        if (url.search || url.hash || url.username || url.password || url.pathname !== '/') throw 'WORKSPACE_ORIGIN_REQUIRED';
        return;
      }
      throw `UNEXPECTED_FIXTURE_IPC:${command}`;
    } };
  });
  const page = await context.newPage();
  const artifacts = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/execution-200h-20261021/UX05'); mkdirSync(artifacts, { recursive: true });
  try {
    await page.goto(`http://127.0.0.1:${(server.httpServer.address() as { port: number }).port}`);
    await expect(page.locator('main')).toContainText('SYNTHETIC_READY');
    await page.getByRole('button', { name: 'Gateway', exact: true }).click();
    await page.getByRole('button', { name: 'Workspace', exact: true }).click();
    const input = page.getByLabel('Gateway origin'); await input.fill('https://gateway.example.test/#bootstrap=synthetic');
    await page.getByRole('button', { name: 'Open / return to Workspace', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('WORKSPACE_ORIGIN_REQUIRED');
    await input.fill('https://gateway.example.test'); await page.getByRole('button', { name: 'Open / return to Workspace', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('normal Gateway login');
    await page.screenshot({ path: path.join(artifacts, 'workspace-launcher-960-dpi150.png') });
    await page.getByRole('button', { name: 'Agent Manager', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Gateway', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Workspace', exact: true }).click(); await expect(input).toHaveValue('https://gateway.example.test');
    await page.evaluate(() => { (window as any).failWorkspace = true; });
    await page.getByRole('button', { name: 'Open / return to Workspace', exact: true }).click(); await expect(page.getByRole('status')).toContainText('SYNTHETIC_WORKSPACE_UNAVAILABLE');
    await page.setViewportSize({ width: 640, height: 480 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(artifacts, 'workspace-launcher-640.png') });
    const calls = await page.evaluate(() => (window as any).desktopCalls) as { command: string; args?: { origin: string } }[];
    assert.deepEqual(calls.map(call => call.command), ['agent_status','agent_runtimes','autostart_enabled','open_workspace','open_workspace','open_workspace']);
    assert.equal(calls[4]!.args!.origin, 'https://gateway.example.test');
  } finally { await browser.close(); await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
