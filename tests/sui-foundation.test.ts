import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';

test('SUI S01: shared preset renders light/dark portals and keyboard controls', async () => {
  const artifacts = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S01');
  mkdirSync(artifacts, { recursive: true });
  const server = await createServer({ configFile: path.resolve('apps/web/vite.config.ts'), server: { host: '127.0.0.1', port: 0, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 850 }, reducedMotion: 'reduce' });
    const failures: string[] = []; page.on('pageerror', error => failures.push(error.message));
    await page.goto(`http://127.0.0.1:${(server.httpServer!.address() as { port: number }).port}/ui-gallery.html`);
    await expect(page.getByRole('button', { name: 'Disabled', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Primary', exact: true }).click(); await expect(page.getByRole('status')).toHaveText('Primary selected');
    const light = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor);
    await page.screenshot({ path: path.join(artifacts, 'light.png') });
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    assert.notEqual(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), light);
    await page.getByRole('button', { name: 'Open dialog' }).click(); await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Dialog draft' })).toBeFocused();
    assert.ok(await page.getByRole('dialog').evaluate(node => getComputedStyle(node).fontFamily.includes('Inter')));
    await page.screenshot({ path: path.join(artifacts, 'dark-dialog.png') });
    await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Open dialog' })).toBeFocused();
    await page.getByRole('button', { name: 'More actions' }).click(); await page.getByRole('menuitem', { name: 'Select sample' }).click(); await expect(page.getByRole('status')).toHaveText('Menu selected');
    assert.deepEqual(failures, []);
  } finally { await browser.close(); await server.close(); }
});
