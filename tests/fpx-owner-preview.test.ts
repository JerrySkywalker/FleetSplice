import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { startFpxOwnerPreview } from '../scripts/fpx-owner-preview.ts';
import { inspectContrast } from './ui-preferences.ts';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('FPX UX06 CLI starts synthetic preview and accepts graceful quit', async () => {
  const child = spawn(process.execPath, ['test-results/compiled/scripts/fpx-owner-preview.js'], { env: { ...process.env,
    FLEETSPLICE_FPX_PREVIEW_ROOT: 'C:/Dev/artifacts/fleetsplice/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/execution-200h-20261021/UX06/cli-smoke' }, windowsHide: true });
  let output = ''; let error = ''; let quitSent = false;
  child.stderr.on('data', data => { error += String(data); });
  child.stdout.on('data', data => { output += String(data); if (!quitSent && output.includes('Private launch URL:')) { quitSent = true; child.stdin.end('viewer\nquit\n'); } });
  try { const [code] = await once(child, 'exit', { signal: AbortSignal.timeout(10000) }); assert.equal(code, 0, error); assert.match(output, /SYNTHETIC H0 ONLY/); assert.match(output, /Synthetic scenario: viewer/); }
  finally { if (child.exitCode === null) child.kill(); }
});

test('FPX UX06 H0 pack: actual loopback Hub plus synthetic port, SSE, attention, theme and unknown receipt', async () => {
  const artifact = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/execution-200h-20261021/UX06'); mkdirSync(artifact, { recursive: true });
  const demo = await startFpxOwnerPreview(artifact);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(demo.url);
    const scenario = async (name: string) => {
      const fence = demo.setScenario(name);
      await expect(page.getByTestId('context-panel').locator('dt').filter({ hasText: 'Fleet controller fence' }).locator('xpath=following-sibling::dd[1]')).toHaveText(String(fence));
    };
    await expect(page.getByTestId('ownership-action')).toHaveText('Acquire control'); await page.getByTestId('ownership-action').click();
    await expect(page.getByTestId('ownership-surface')).toContainText('You control this session');
    const prompt = page.getByTestId('native-prompt'); await prompt.fill('Synthetic H0 input only'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('conversation-timeline')).toContainText('Synthetic response: preview input received. No native action was performed.');
    await expect(page.getByTestId('tool-activity-card')).toHaveAttribute('data-tool-status', 'completed');
    await expect(page.getByTestId('presentation-state')).toHaveCount(0);
    await page.keyboard.press('Control+k'); const switcher = page.getByRole('dialog', { name: 'Switch session', exact: true });
    await switcher.getByRole('combobox').fill('fixture-thread-approval'); await page.keyboard.press('Enter');
    await scenario('approval'); await expect(page.getByRole('button', { name: 'Deny', exact: true })).toBeEnabled();
    await page.screenshot({ path: path.join(artifact, 'h0-approval-390.png') });
    await page.getByRole('button', { name: 'Deny', exact: true }).click(); await expect(page.getByTestId('approval-card')).toContainText('resolved');
    await scenario('viewer'); await expect(page.getByTestId('ownership-surface')).toContainText('Read-only viewer');
    await prompt.fill('Viewer draft only'); await prompt.press('Control+Enter'); assert.equal(demo.counters().syntheticCommands, 3);
    await scenario('controller'); await scenario('external'); await expect(page.getByTestId('external-review-action')).toBeEnabled();
    await page.getByTestId('external-review-action').click(); await expect(page.getByTestId('external-review-action')).toHaveCount(0);
    await scenario('offline'); await expect(page.getByTestId('observation-attention')).toContainText('unverified');
    await scenario('normal'); await expect(page.getByTestId('observation-attention')).toHaveCount(0);
    await page.getByTestId('preferences').click(); await page.getByTestId('appearance-select').selectOption('dark'); await page.keyboard.press('Escape');
    const contrast = await inspectContrast(page); writeFileSync(path.join(artifact, 'H0-CONTRAST.json'), JSON.stringify(contrast, null, 2));
    await scenario('unknown'); await prompt.fill('Synthetic uncertain input only'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('receipt-attention')).toContainText('Outcome unknown');
    await page.getByRole('button', { name: 'Check receipt', exact: true }).click();
    await expect(page.getByTestId('presentation-state')).toHaveText('Ambiguous effect'); assert.equal(demo.counters().syntheticCommands, 5);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(artifact, 'h0-unknown-dark-390.png') });
    await page.setViewportSize({ width: 1440, height: 900 }); await page.screenshot({ path: path.join(artifact, 'h0-unknown-dark-1440.png') });
    writeFileSync(path.join(artifact, 'H0-SMOKE-COUNTERS.json'), JSON.stringify(demo.counters(), null, 2));
  } finally { await browser.close(); await demo.close(); }
});
