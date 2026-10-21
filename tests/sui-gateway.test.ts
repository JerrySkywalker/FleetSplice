import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { startFpxOwnerPreview } from '../scripts/fpx-owner-preview.ts';

test('SUI S06: Gateway details use the shared theme and preserve read-only projection', async () => {
  const artifacts = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S06/gateway');
  mkdirSync(artifacts, { recursive: true });
  const demo = await startFpxOwnerPreview(artifacts);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US', reducedMotion: 'reduce' });
    await page.goto(demo.url); await page.getByTestId('toggle-right').click(); await page.getByTestId('fleet-overview-trigger').click();
    await expect(page.getByTestId('fleet-summary')).toBeVisible();
    await page.getByRole('navigation', { name: 'Fleet navigation', exact: true }).getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByText(/Authentication: LOOPBACK_BOOTSTRAP/)).toBeVisible();
    await page.getByTestId('preferences').click(); await page.getByTestId('appearance-select').selectOption('dark'); await page.getByTestId('locale-select').selectOption('zh-CN'); await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('navigation', { name: 'Fleet 导航', exact: true }).getByRole('button', { name: '设置', exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(artifacts, 'gateway-settings-dark-zh-1440.png') });
    assert.deepEqual(demo.counters(), { syntheticCommands: 0, realNativeConnections: 0, realNativeEffects: 0 });
  } finally { await browser.close(); await demo.close(); }
});
