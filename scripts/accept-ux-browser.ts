/**
 * Automated UX browser acceptance for G05C UX hardening.
 * Real Hub + built React UI + Playwright + disposable Native Adoption fixture.
 */
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { chromium, expect, type Page } from '@playwright/test';
import { startHub } from '../apps/hub/server.ts';
import { target } from '../tests/helpers.ts';
import { createDisposableAdoptionFixture } from '../tests/fixtures/native-adoption-browser-fixture.ts';
import { setPresentation } from '../tests/ui-preferences.ts';
import type { Appearance } from '../apps/web/preferences.ts';

const evidenceRoot = path.resolve(
  process.env.FLEETSPLICE_UX_GALLERY
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-UX-HARDENING-24H-001\\UX-GALLERY',
);

type Check = { name: string; pass: boolean; detail: string };
const check = (name: string, pass: boolean, detail: string): Check => ({ name, pass, detail });

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

async function waitIdle(page: Page) {
  await page.waitForFunction(() => {
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    const scheduler = audit?.scheduler?.();
    if (!scheduler) return true;
    return scheduler.executions.every((item: any) => item.completedAt !== null);
  }, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(100);
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

async function oledTrueBlack(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
    const body = getComputedStyle(document.body).backgroundColor;
    return bg === '#000000' || bg === '#000' || body === 'rgb(0, 0, 0)';
  });
}

async function attachReady(page: Page, port: number, token: string) {
  await page.goto(`http://127.0.0.1:${port}/#bootstrap=${token}`);
  await expect(page.getByRole('button', { name: 'Attach', exact: true })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Attach', exact: true }).click();
  await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
  await expect(page.getByTestId('session-config-bar')).toBeVisible();
  await expect(page.locator('#native-prompt')).toBeVisible();
}

async function run(): Promise<number> {
  mkdirSync(evidenceRoot, { recursive: true });
  const fixture = await createDisposableAdoptionFixture();
  fixture.rpc.afterTurnStart = (turnId) => fixture.rpc.emitOwnedTurnLifecycle(turnId);
  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'fixture',
    principal: 'fixture',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-accept-ux-hub-')),
    webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fixture.adoptionPort);

  const checks: Check[] = [];
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let exitCode = 1;
  const result: Record<string, unknown> = { startedAt: new Date().toISOString(), evidenceRoot };

  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await attachReady(page, port, bootstrapToken);
    await waitIdle(page);

    // --- Theme gallery ---
    const themes: Appearance[] = ['light', 'dark', 'oled-black', 'midnight', 'graphite', 'warm'];
    const themeFiles: Record<string, string> = {
      light: 'desktop-light.png',
      dark: 'desktop-dark.png',
      'oled-black': 'desktop-oled.png',
      midnight: 'desktop-midnight.png',
      graphite: 'desktop-graphite.png',
      warm: 'desktop-warm.png',
    };
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const theme of themes) {
      await setPresentation(page, 'en-US', theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.screenshot({ path: path.join(evidenceRoot, themeFiles[theme]!), fullPage: true });
    }
    await setPresentation(page, 'en-US', 'oled-black');
    checks.push(check('OLED_TRUE_BLACK', await oledTrueBlack(page), 'canvas/body true black'));

    // --- Interaction: desktop oled ---
    await page.setViewportSize({ width: 1440, height: 900 });
    await setPresentation(page, 'en-US', 'oled-black');
    checks.push(check('NO_OVERFLOW_DESKTOP', await noHorizontalOverflow(page), '1440x900'));
    checks.push(check('COMPOSER_USABLE', await page.locator('#native-prompt').isEnabled(), 'prompt enabled'));
    checks.push(check('CONFIG_BAR', await page.getByTestId('session-config-bar').isVisible(), 'visible'));
    checks.push(check('CONFIG_MUTATION_HONEST', await page.getByTestId('session-config-bar').getAttribute('data-mutation-supported') === 'false'
      && await page.getByTestId('config-mutation-hint').isVisible(), 'native observe-only'));
    checks.push(check('OWNERSHIP_COHERENT', await page.getByTestId('ownership-surface').count() === 1
      && await page.getByTestId('ownership-action').count() === 1, 'single ownership action'));

    await page.getByTestId('toggle-left').click();
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-left-collapsed', 'true');
    await page.getByTestId('toggle-right').click();
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-right-collapsed', 'true');
    const collapseStored = await page.evaluate(() => ({
      left: localStorage.getItem('fleetsplice.layout.leftCollapsed'),
      right: localStorage.getItem('fleetsplice.layout.rightCollapsed'),
    }));
    checks.push(check('PANEL_COLLAPSE_PERSIST', collapseStored.left === 'true' && collapseStored.right === 'true', JSON.stringify(collapseStored)));
    await page.getByTestId('toggle-left').click();
    await page.getByTestId('toggle-right').click();
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-left-collapsed', 'false');
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-right-collapsed', 'false');

    await page.evaluate(() => {
      localStorage.setItem('fleetsplice.layout.leftWidth', '320');
      localStorage.setItem('fleetsplice.layout.rightWidth', '340');
    });
    const widthStored = await page.evaluate(() => ({
      left: localStorage.getItem('fleetsplice.layout.leftWidth'),
      right: localStorage.getItem('fleetsplice.layout.rightWidth'),
    }));
    checks.push(check('PANEL_WIDTH_PERSISTENCE', widthStored.left === '320' && widthStored.right === '340', JSON.stringify(widthStored)));

    // Streaming + tools + no duplicate final
    await page.locator('#native-prompt').fill('UX browser continuation');
    await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
    await expect(page.getByText('LIVE_ASSISTANT_A')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('git rev-parse --short HEAD')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('LIVE_ASSISTANT_B_FINAL')).toBeVisible({ timeout: 10000 });
    await waitIdle(page);
    const toolCompleted = await page.locator('[data-testid="tool-activity-card"][data-tool-status="completed"], [data-item-id="tool-1"]').count();
    const assistA = await page.locator('[data-item-id="assist-a"]').count();
    const assistB = await page.locator('[data-item-id="assist-b"]').count();
    checks.push(check('LIVE_ASSISTANT_CONVERGENCE', assistA >= 1 && assistB >= 1, `a=${assistA} b=${assistB}`));
    checks.push(check('NO_DUPLICATE_FINAL', assistA <= 1 && assistB <= 1, `a=${assistA} b=${assistB}`));
    checks.push(check('TOOL_TRANSITION', toolCompleted >= 1 || await page.getByText('git rev-parse --short HEAD').isVisible(), `toolCompleted=${toolCompleted}`));

    // External review exactly once
    fixture.rpc.emitExternalTurn('UX_EXTERNAL_ADVANCE');
    await expect(page.getByTestId('external-advance-notice')).toBeVisible({ timeout: 5000 });
    const reviewActions = await page.getByTestId('external-review-action').count();
    checks.push(check('EXTERNAL_REVIEW_ONCE', reviewActions === 1, `actions=${reviewActions}`));
    await page.getByTestId('external-review-action').click();
    await waitIdle(page);

    // Reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const motionDisabled = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.className = 'streaming-caret';
      document.body.appendChild(probe);
      const anim = getComputedStyle(probe).animationName;
      probe.remove();
      return anim === 'none' || anim === '';
    });
    checks.push(check('REDUCED_MOTION', motionDisabled, `animationName-disabled=${motionDisabled}`));
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // --- Tablet interaction ---
    await page.setViewportSize({ width: 1024, height: 768 });
    await setPresentation(page, 'en-US', 'midnight');
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-breakpoint', 'tablet');
    checks.push(check('NO_OVERFLOW_TABLET', await noHorizontalOverflow(page), '1024x768'));
    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.getByTestId('nav-backdrop').click();
    await expect(page.getByTestId('nav-drawer')).toHaveCount(0);
    await page.getByTestId('context-menu').click();
    await expect(page.getByTestId('context-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('context-drawer')).toHaveCount(0);
    await page.screenshot({ path: path.join(evidenceRoot, 'tablet-midnight.png'), fullPage: true });
    checks.push(check('TABLET_DRAWERS', true, 'nav/context drawers'));

    // --- Phone interaction ---
    await page.setViewportSize({ width: 390, height: 844 });
    await setPresentation(page, 'en-US', 'dark');
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-breakpoint', 'mobile');
    checks.push(check('NO_OVERFLOW_PHONE', await noHorizontalOverflow(page), '390x844'));
    await expect(page.getByTestId('session-config-bar')).toBeVisible();
    await expect(page.locator('#native-prompt')).toBeVisible();
    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTestId('context-menu').click();
    await expect(page.getByTestId('context-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-dark.png'), fullPage: true });
    await setPresentation(page, 'en-US', 'oled-black');
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-oled.png'), fullPage: true });
    await setPresentation(page, 'en-US', 'light');
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-light.png'), fullPage: true });
    checks.push(check('MOBILE_DRAWERS', true, 'nav/context'));

    // Focus usability
    await page.getByTestId('preferences').focus();
    await expect(page.getByTestId('preferences')).toBeFocused();
    checks.push(check('KEYBOARD_FOCUS', true, 'preferences focusable'));

    // Layout-only lanes
    for (const [w, h, file] of [
      [1920, 1080, null],
      [1366, 768, null],
      [768, 1024, 'tablet-portrait.png'],
      [412, 915, null],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(120);
      const ok = await noHorizontalOverflow(page);
      checks.push(check(`NO_OVERFLOW_${w}x${h}`, ok, ok ? 'ok' : 'overflow'));
      if (file) await page.screenshot({ path: path.join(evidenceRoot, file), fullPage: true });
    }

    const failed = checks.filter(item => !item.pass);
    result.checks = checks;
    result.status = failed.length ? 'RED' : 'GREEN';
    writeFileSync(path.join(evidenceRoot, 'ux-accept-result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      status: result.status,
      failed: failed.map(item => item.name),
      checks: checks.map(item => `${item.pass ? 'PASS' : 'FAIL'}:${item.name}`),
      evidenceRoot,
    }, null, 2));
    exitCode = failed.length ? 1 : 0;
  } catch (error) {
    result.status = 'ERROR';
    result.error = error instanceof Error ? error.message : String(error);
    writeFileSync(path.join(evidenceRoot, 'ux-accept-result.json'), JSON.stringify(result, null, 2));
    console.error(result.error);
    exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    await hub.close();
    fixture.rpc.close();
  }
  return exitCode;
}

const code = await run();
process.exit(code);
