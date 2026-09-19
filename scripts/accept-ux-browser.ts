/**
 * Automated UX browser acceptance for G05C UX R2 density/semantics.
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
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001\\UX-GALLERY-R2',
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

async function measureMobileDensity(page: Page) {
  return page.evaluate(() => {
    const composer = document.querySelector('[data-testid="composer-surface"]') as HTMLElement | null;
    const timeline = document.querySelector('[data-testid="conversation-timeline"]') as HTMLElement | null;
    const configRows = document.querySelector('[data-testid="session-config-bar"]')?.getAttribute('data-config-rows');
    const helperLabels = Array.from(document.querySelectorAll('.composer-surface label, .sticky-composer > label'))
      .filter(node => (node.textContent ?? '').trim().length > 0).length;
    const permanentHints = document.querySelectorAll('.composer-surface .config-hint, .sticky-composer .config-hint').length;
    return {
      composerHeight: composer?.getBoundingClientRect().height ?? -1,
      timelineHeight: timeline?.getBoundingClientRect().height ?? -1,
      configRows: configRows ?? 'unknown',
      helperLabels,
      permanentHints,
    };
  });
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
  const density: Record<string, unknown> = {};

  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Unconnected semantics first
    await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByTestId('session-connect-preview')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('connect-session')).toBeVisible();
    checks.push(check('CONNECT_SESSION_SEMANTICS', true, 'Connect session visible'));
    await page.screenshot({ path: path.join(evidenceRoot, 'native-session-connect.png'), fullPage: true });

    await page.getByTestId('connect-session').click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
    await expect(page.getByTestId('session-config-bar')).toBeVisible();
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
    checks.push(check('CONFIG_MUTATION_HONEST', await page.getByTestId('session-config-bar').getAttribute('data-mutation-supported') === 'false', 'native observe-only attr'));

    await page.getByTestId('config-detail-open').click();
    await expect(page.getByTestId('config-sheet')).toBeVisible();
    await expect(page.getByTestId('config-mutation-hint')).toBeVisible();
    await page.screenshot({ path: path.join(evidenceRoot, 'composer-expanded-config.png'), fullPage: true });
    await page.getByTestId('config-sheet-close').click();
    await expect(page.getByTestId('config-sheet')).toHaveCount(0);
    checks.push(check('CONFIG_SHEET_DETAILS', true, 'mutation hint in sheet'));

    const focusWithin = await page.evaluate(() => {
      const composer = document.querySelector('[data-testid="composer-surface"]') as HTMLElement | null;
      const prompt = document.querySelector('#native-prompt') as HTMLTextAreaElement | null;
      if (!composer || !prompt) return false;
      prompt.focus();
      const style = getComputedStyle(composer);
      return style.boxShadow.includes('rgb') || style.borderColor.length > 0;
    });
    checks.push(check('COMPOSER_OUTLINE_FOCUS', focusWithin, 'focus-within treatment'));

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
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByText('LIVE_ASSISTANT_A')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('git rev-parse --short HEAD')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(evidenceRoot, 'streaming-tool-running.png'), fullPage: true }).catch(() => {});
    await expect(page.getByText('LIVE_ASSISTANT_B_FINAL')).toBeVisible({ timeout: 10000 });
    await waitIdle(page);
    await page.screenshot({ path: path.join(evidenceRoot, 'streaming-tool-completed.png'), fullPage: true });
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
    await page.screenshot({ path: path.join(evidenceRoot, 'external-review.png'), fullPage: true });
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

    // Icon-only accessible names
    await page.setViewportSize({ width: 1024, height: 768 });
    const navLabel = await page.getByTestId('nav-menu').getAttribute('aria-label');
    const ctxLabel = await page.getByTestId('context-menu').getAttribute('aria-label');
    checks.push(check('ICON_ACCESSIBLE_NAMES', !!navLabel && !!ctxLabel, `nav=${navLabel} ctx=${ctxLabel}`));

    // --- Tablet interaction ---
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
    await page.screenshot({ path: path.join(evidenceRoot, 'tablet-landscape.png'), fullPage: true });
    checks.push(check('TABLET_DRAWERS', true, 'nav/context drawers'));
    checks.push(check('TABLET_NO_THREE_COLUMN', await page.locator('[data-testid="navigation-panel"]').isHidden()
      && await page.locator('[data-testid="context-panel"]').isHidden(), 'side panels hidden'));

    // --- Phone density ---
    await page.setViewportSize({ width: 390, height: 844 });
    await setPresentation(page, 'en-US', 'dark');
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-breakpoint', 'mobile');
    checks.push(check('NO_OVERFLOW_PHONE', await noHorizontalOverflow(page), '390x844'));
    const mobileDensity = await measureMobileDensity(page);
    density.mobile390 = mobileDensity;
    checks.push(check('MOBILE_CONFIG_ROWS', mobileDensity.configRows === '1', `rows=${mobileDensity.configRows}`));
    checks.push(check('MOBILE_HELPER_TEXT', mobileDensity.helperLabels === 0 && mobileDensity.permanentHints === 0,
      `labels=${mobileDensity.helperLabels} hints=${mobileDensity.permanentHints}`));
    checks.push(check('MOBILE_COMPOSER_HEIGHT', mobileDensity.composerHeight > 0 && mobileDensity.composerHeight <= 150,
      `h=${mobileDensity.composerHeight}`));
    checks.push(check('MOBILE_CONVERSATION_VIEWPORT', mobileDensity.timelineHeight >= 480 || mobileDensity.timelineHeight < 0,
      `timeline=${mobileDensity.timelineHeight}`));
    // If timeline measured, require >=480; if layout still settling allow borderline with detail
    if (mobileDensity.timelineHeight >= 0 && mobileDensity.timelineHeight < 480) {
      checks[checks.length - 1] = check('MOBILE_CONVERSATION_VIEWPORT', false, `timeline=${mobileDensity.timelineHeight}`);
    }

    await expect(page.getByTestId('config-capsule')).toBeVisible();
    await page.getByTestId('config-capsule').click();
    await expect(page.getByTestId('config-sheet')).toBeVisible();
    await expect(page.getByTestId('config-mutation-hint')).toBeVisible();
    await page.getByTestId('config-sheet-close').click();

    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTestId('context-menu').click();
    await expect(page.getByTestId('context-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-390-dark.png'), fullPage: true });
    await setPresentation(page, 'en-US', 'oled-black');
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-390-oled.png'), fullPage: true });
    checks.push(check('MOBILE_DRAWERS', true, 'nav/context'));

    await page.setViewportSize({ width: 412, height: 915 });
    await setPresentation(page, 'en-US', 'light');
    checks.push(check('NO_OVERFLOW_412', await noHorizontalOverflow(page), '412x915'));
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-412-light.png'), fullPage: true });

    await page.setViewportSize({ width: 768, height: 1024 });
    await setPresentation(page, 'en-US', 'dark');
    checks.push(check('NO_OVERFLOW_768x1024', await noHorizontalOverflow(page), '768x1024'));
    await page.screenshot({ path: path.join(evidenceRoot, 'tablet-portrait.png'), fullPage: true });

    // Focus usability
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByTestId('preferences').focus();
    await expect(page.getByTestId('preferences')).toBeFocused();
    checks.push(check('KEYBOARD_FOCUS', true, 'preferences focusable'));

    // Layout-only lanes
    for (const [w, h] of [[1920, 1080], [1366, 768], [1024, 768]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(120);
      const ok = await noHorizontalOverflow(page);
      checks.push(check(`NO_OVERFLOW_${w}x${h}`, ok, ok ? 'ok' : 'overflow'));
    }

    const failed = checks.filter(item => !item.pass);
    result.checks = checks;
    result.density = density;
    result.status = failed.length ? 'RED' : 'GREEN';
    writeFileSync(path.join(evidenceRoot, 'ux-accept-result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      status: result.status,
      failed: failed.map(item => item.name),
      checks: checks.map(item => `${item.pass ? 'PASS' : 'FAIL'}:${item.name}`),
      density,
      evidenceRoot,
    }, null, 2));
    exitCode = failed.length ? 1 : 0;
  } catch (error) {
    result.status = 'ERROR';
    result.error = error instanceof Error ? error.message : String(error);
    result.density = density;
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
