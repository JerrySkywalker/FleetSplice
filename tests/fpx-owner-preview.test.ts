import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium, expect } from '@playwright/test';
import { startFpxOwnerPreview } from '../scripts/fpx-owner-preview.ts';
import { inspectContrast, setPresentation } from './ui-preferences.ts';

const artifact = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/execution-60h-20261022/S08');

test('SUI S08 CLI starts synthetic preview and accepts graceful quit', async () => {
  const child = spawn(process.execPath, ['test-results/compiled/scripts/fpx-owner-preview.js'], { env: { ...process.env,
    FLEETSPLICE_FPX_PREVIEW_ROOT: path.join(artifact,'cli-smoke') }, windowsHide: true });
  let output = ''; let error = ''; let quitSent = false;
  child.stderr.on('data', data => { error += String(data); });
  child.stdout.on('data', data => { output += String(data); if (!quitSent && output.includes('Private launch URL:')) { quitSent = true; child.stdin.end('viewer\nquit\n'); } });
  try { const [code] = await once(child, 'exit', { signal: AbortSignal.timeout(10000) }); assert.equal(code, 0, error); assert.match(output, /SYNTHETIC H0 ONLY/); assert.match(output, /Synthetic scenario: viewer/); }
  finally { if (child.exitCode === null) child.kill(); }
});

test('SUI S08 final pack: one integrated synthetic flow and minimal visual matrix', async () => {
  mkdirSync(artifact, { recursive: true }); const demo = await startFpxOwnerPreview(artifact);
  const candidate = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', reducedMotion: 'reduce' });
  await context.addInitScript(() => { localStorage.setItem('fleetsplice.appearance','dark'); });
  const page = await context.newPage(); const screenshots: unknown[] = []; const errors: string[]=[];
  page.on('pageerror', error => errors.push(error.message));
  const capture = async (name: string, fixture: string) => {
    const file = `${name}.png`; await page.screenshot({ path: path.join(artifact,file), animations:'disabled' });
    screenshots.push({ file, fixture, viewport:page.viewportSize(), theme:await page.locator('html').getAttribute('data-theme'), candidate,
      evidence:'SYNTHETIC_BROWSER', sha256:createHash('sha256').update(readFileSync(path.join(artifact,file))).digest('hex') });
  };
  try {
    await page.goto(demo.url);
    const scenario = async (name: string) => {
      const fence = demo.setScenario(name);
      await expect(page.getByTestId('context-panel').locator('dt').filter({ hasText: 'Fleet controller fence' }).locator('xpath=following-sibling::dd[1]')).toHaveText(String(fence));
    };
    await expect(page.getByTestId('ownership-action')).toHaveText('Acquire control'); await page.getByTestId('ownership-action').click();
    await expect(page.getByTestId('ownership-surface')).toContainText('You control this session');
    const prompt=page.getByTestId('native-prompt'); await prompt.fill('Synthetic H0 input only'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('conversation-timeline')).toContainText('Synthetic response: preview input received. No native action was performed.');
    await expect(page.getByTestId('tool-activity-card')).toHaveAttribute('data-tool-status','completed');
    await expect(page.getByTestId('presentation-state')).toHaveCount(0);
    await capture('normal-dark-1440','normal after one synthetic turn');
    const contrast=[{theme:'dark',rows:await inspectContrast(page)}];
    for (const [width,height] of [[1024,768],[360,740]]) {
      await page.setViewportSize({width:width!,height:height!}); await expect(page.getByTestId('composer-surface')).toBeInViewport();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await capture(`normal-dark-${width}`,'normal');
    }
    await setPresentation(page,'en-US','light'); await page.setViewportSize({width:390,height:844});
    await capture('input-light-390','normal');
    await page.getByTestId('nav-menu').click(); await expect(page.getByTestId('nav-drawer')).toBeVisible(); await capture('navigation-light-390','normal navigation');
    await page.keyboard.press('Escape'); await expect(page.getByTestId('nav-menu')).toBeFocused();
    await page.setViewportSize({width:900,height:700}); await page.getByTestId('context-menu').click(); await expect(page.getByTestId('context-drawer')).toBeVisible();
    await capture('details-light-900','normal observed details'); await page.keyboard.press('Escape'); await expect(page.getByTestId('context-menu')).toBeFocused();
    await page.setViewportSize({width:1440,height:900});
    await page.keyboard.press('Control+k'); const switcher=page.getByRole('dialog',{name:'Switch session',exact:true});
    await switcher.getByRole('combobox').fill('fixture-thread-approval'); await page.keyboard.press('Enter'); await expect(switcher).toBeHidden();
    await scenario('approval'); await expect(page.getByRole('button',{name:'Deny',exact:true})).toBeEnabled();
    await capture('approval-light-1440','approval'); contrast.push({theme:'light',rows:await inspectContrast(page)});
    await page.getByRole('button',{name:'Deny',exact:true}).click(); await expect(page.getByTestId('approval-card')).toContainText('resolved');
    await scenario('viewer'); await expect(page.getByTestId('ownership-surface')).toContainText('Read-only viewer');
    await prompt.fill('Viewer draft only'); await prompt.press('Control+Enter'); assert.equal(demo.counters().syntheticCommands,3);
    await scenario('controller'); await scenario('external'); await expect(page.getByTestId('external-review-action')).toBeEnabled();
    await page.getByTestId('external-review-action').click(); await expect(page.getByTestId('external-review-action')).toHaveCount(0);
    await scenario('offline'); await expect(page.getByTestId('observation-attention')).toContainText('unverified');
    await scenario('normal'); await expect(page.getByTestId('observation-attention')).toHaveCount(0);
    await setPresentation(page,'en-US','dark'); await page.setViewportSize({width:390,height:844});
    await scenario('unknown'); await prompt.fill('Synthetic uncertain input only'); await page.getByTestId('composer-send').click();
    await expect(page.getByTestId('receipt-attention')).toContainText('Outcome unknown');
    await page.getByRole('button',{name:'Check receipt',exact:true}).click(); await expect(page.getByTestId('presentation-state')).toHaveText('Ambiguous effect');
    assert.equal(demo.counters().syntheticCommands,5); await capture('unknown-dark-390','unknown after explicit receipt lookup');
    assert.ok(await page.getByTestId('composer-surface').evaluate(node=>node.getBoundingClientRect().bottom<=innerHeight+1));
    assert.deepEqual(errors,[]);
    writeFileSync(path.join(artifact,'SCREENSHOTS.json'),JSON.stringify(screenshots,null,2));
    writeFileSync(path.join(artifact,'CONTRAST.json'),JSON.stringify(contrast,null,2));
    writeFileSync(path.join(artifact,'COUNTERS.json'),JSON.stringify(demo.counters(),null,2));
  } finally { await browser.close(); await demo.close(); }
});
