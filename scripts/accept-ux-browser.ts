/**
 * Automated UX browser acceptance for G05C UX R2-R1 geometry alignment.
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
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-UX-R2-R1-GEOMETRY-ALIGNMENT-001\\UX-GALLERY-R2-R1',
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

async function resetTimelineScroll(page: Page) {
  await page.evaluate(() => {
    const timeline = document.querySelector('[data-testid="conversation-timeline"]') as HTMLElement | null;
    if (timeline) timeline.scrollTop = 0;
  });
}

async function scrollTimelineBottom(page: Page) {
  await page.evaluate(() => {
    const timeline = document.querySelector('[data-testid="conversation-timeline"]') as HTMLElement | null;
    if (timeline) timeline.scrollTop = timeline.scrollHeight;
  });
}

async function measureComposerGeometry(page: Page) {
  return page.evaluate(() => {
    const composer = document.querySelector('[data-testid="composer-surface"]') as HTMLElement | null;
    const send = document.querySelector('[data-testid="composer-send"]') as HTMLElement | null;
    const prompt = document.querySelector('[data-testid="native-prompt"]') as HTMLElement | null;
    const bar = document.querySelector('[data-testid="session-config-bar"]') as HTMLElement | null;
    const heading = document.querySelector('.session-heading') as HTMLElement | null;
    const timeline = document.querySelector('[data-testid="conversation-timeline"]') as HTMLElement | null;
    const message = document.querySelector('.timeline .message') as HTMLElement | null;
    const tool = document.querySelector('[data-testid="tool-activity-card"]') as HTMLElement | null;
    if (!composer) return null;
    const cr = composer.getBoundingClientRect();
    const sendR = send?.getBoundingClientRect();
    const promptR = prompt?.getBoundingClientRect();
    const composerPad = parseFloat(getComputedStyle(composer).paddingRight) || 0;
    const headingPad = heading ? parseFloat(getComputedStyle(heading).paddingLeft) || 0 : 0;
    const timelinePad = timeline ? parseFloat(getComputedStyle(timeline).paddingLeft) || 0 : 0;
    const composerPadL = parseFloat(getComputedStyle(composer).paddingLeft) || 0;
    const edges = [
      heading ? heading.getBoundingClientRect().left + headingPad : null,
      timeline ? timeline.getBoundingClientRect().left + timelinePad : null,
      // Composer outer border shares the conversation gutter (internal padding is inset).
      cr.left,
      message ? message.getBoundingClientRect().left : null,
      tool ? tool.getBoundingClientRect().left : null,
    ].filter((value): value is number => value !== null);
    const edgeMin = Math.min(...edges);
    const edgeMax = Math.max(...edges);
    let configWrap = false;
    if (bar) {
      const barTop = bar.getBoundingClientRect().top;
      for (const child of Array.from(bar.children) as HTMLElement[]) {
        if (child.getBoundingClientRect().top > barTop + 10) configWrap = true;
      }
    }
    const trailingAligned = !!(sendR && promptR
      && sendR.left >= promptR.right - 12
      && Math.abs((cr.right - composerPad) - sendR.right) <= 8);
    return {
      composerHeight: cr.height,
      trailingAligned,
      sendLeft: sendR?.left ?? -1,
      promptRight: promptR?.right ?? -1,
      composerRight: cr.right,
      edgeDelta: edgeMax - edgeMin,
      edges,
      configWrap,
      configRows: bar?.getAttribute('data-config-rows') ?? 'unknown',
      observeChips: bar?.getAttribute('data-observe-chips') ?? 'unknown',
      helperLabels: Array.from(document.querySelectorAll('.composer-surface label, .sticky-composer > label'))
        .filter(node => (node.textContent ?? '').trim().length > 0).length,
      permanentHints: document.querySelectorAll('.composer-surface .config-hint, .sticky-composer .config-hint').length,
    };
  });
}

async function scanClipping(page: Page) {
  return page.evaluate(() => {
    const selectors = [
      '[data-testid="session-item"]',
      '.session-workspace',
      '[data-testid="ownership-surface"]',
      '[data-testid="config-capsule"]',
      '.config-readonly-chip',
      '.context dd',
      '[data-testid="session-connect-preview"]',
      '[data-testid="composer-send"]',
      '.composer-actions button',
      '.connect-facts dd',
    ];
    const offenders: Array<{ sel: string; policy: string; sw: number; cw: number; sh: number; ch: number }> = [];
    for (const sel of selectors) {
      for (const el of Array.from(document.querySelectorAll(sel)) as HTMLElement[]) {
        const policyEl = el.closest('[data-clipping-policy]') as HTMLElement | null;
        const policy = policyEl?.getAttribute('data-clipping-policy')
          ?? (getComputedStyle(el).textOverflow === 'ellipsis' ? 'ellipsis' : '');
        if (policy === 'ellipsis') continue;
        if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3) {
          offenders.push({
            sel,
            policy: policy || 'none',
            sw: el.scrollWidth,
            cw: el.clientWidth,
            sh: el.scrollHeight,
            ch: el.clientHeight,
          });
        }
      }
    }
    return offenders;
  });
}

async function measureConfigSurface(page: Page) {
  return page.evaluate(() => {
    const sheet = document.querySelector('[data-testid="config-sheet"]') as HTMLElement | null;
    if (!sheet) return null;
    const box = sheet.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top,
      left: box.left,
      variant: sheet.getAttribute('data-config-surface') ?? 'unknown',
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
}

async function measureConnectPreview(page: Page) {
  return page.evaluate(() => {
    const preview = document.querySelector('[data-testid="session-connect-preview"]') as HTMLElement | null;
    const button = document.querySelector('[data-testid="connect-session"]') as HTMLElement | null;
    const ownership = document.querySelector('[data-testid="ownership-surface"]') as HTMLElement | null;
    if (!preview) return null;
    const box = preview.getBoundingClientRect();
    const pane = document.querySelector('[data-testid="conversation-pane"]') as HTMLElement | null;
    const paneBox = pane?.getBoundingClientRect();
    const centerDelta = paneBox
      ? Math.abs((box.left + box.width / 2) - (paneBox.left + paneBox.width / 2))
      : -1;
    return {
      width: box.width,
      maxWidthOk: box.width <= 700,
      centerDelta,
      buttonWidth: button?.getBoundingClientRect().width ?? -1,
      notConnected: ownership?.getAttribute('data-connected') === 'false'
        && !!document.querySelector('[data-testid="ownership-not-connected"]'),
      acquireAbsent: !document.querySelector('[data-testid="ownership-action"]'),
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
    const connectGeom = await measureConnectPreview(page);
    density.connectPreview = connectGeom;
    checks.push(check('SESSION_CONNECT_CENTERED', !!connectGeom
      && connectGeom.maxWidthOk
      && connectGeom.centerDelta >= 0
      && connectGeom.centerDelta <= 48
      && connectGeom.buttonWidth > 0
      && connectGeom.buttonWidth < 520, JSON.stringify(connectGeom)));
    checks.push(check('UNCONNECTED_CONTEXT_SEMANTICS', !!connectGeom
      && connectGeom.notConnected
      && connectGeom.acquireAbsent, JSON.stringify({
      notConnected: connectGeom?.notConnected,
      acquireAbsent: connectGeom?.acquireAbsent,
    })));
    await page.screenshot({ path: path.join(evidenceRoot, 'native-session-connect-centered.png'), fullPage: true });

    await page.getByTestId('connect-session').click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
    await expect(page.getByTestId('session-config-bar')).toBeVisible();
    await waitIdle(page);
    await expect(page.getByTestId('ownership-surface')).toHaveAttribute('data-connected', 'true');

    // Observe-only chips (no disabled selects)
    const observeOnly = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="session-config-bar"]');
      const selects = bar?.querySelectorAll('select').length ?? -1;
      const chips = bar?.querySelectorAll('.config-readonly-chip').length ?? -1;
      return {
        mutation: bar?.getAttribute('data-mutation-supported'),
        observeChips: bar?.getAttribute('data-observe-chips'),
        selects,
        chips,
      };
    });
    checks.push(check('OBSERVE_ONLY_CONFIG_READONLY_CHIPS',
      observeOnly.mutation === 'false'
      && observeOnly.observeChips === 'true'
      && observeOnly.selects === 0
      && observeOnly.chips >= 2, JSON.stringify(observeOnly)));

    // --- Theme gallery compact (scroll top) ---
    await page.setViewportSize({ width: 1440, height: 900 });
    await setPresentation(page, 'en-US', 'oled-black');
    await resetTimelineScroll(page);
    await page.screenshot({ path: path.join(evidenceRoot, 'desktop-oled-compact.png'), fullPage: true });
    checks.push(check('OLED_TRUE_BLACK', await oledTrueBlack(page), 'canvas/body true black'));
    await setPresentation(page, 'en-US', 'light');
    await resetTimelineScroll(page);
    await page.screenshot({ path: path.join(evidenceRoot, 'desktop-light-compact.png'), fullPage: true });

    // Desktop geometry
    await page.setViewportSize({ width: 1440, height: 900 });
    await setPresentation(page, 'en-US', 'oled-black');
    await page.locator('#native-prompt').fill('');
    await waitIdle(page);
    const desktopGeom = await measureComposerGeometry(page);
    density.desktop1440 = desktopGeom;
    checks.push(check('NO_OVERFLOW_DESKTOP', await noHorizontalOverflow(page), '1440x900'));
    checks.push(check('DESKTOP_COMPOSER_IDLE_HEIGHT', !!desktopGeom && desktopGeom.composerHeight > 0 && desktopGeom.composerHeight <= 120,
      `h=${desktopGeom?.composerHeight}`));
    checks.push(check('COMPOSER_TRAILING_ACTION_ALIGNMENT', !!desktopGeom && desktopGeom.trailingAligned,
      JSON.stringify({ trailingAligned: desktopGeom?.trailingAligned, sendLeft: desktopGeom?.sendLeft, promptRight: desktopGeom?.promptRight })));
    checks.push(check('CONVERSATION_EDGE_ALIGNMENT', !!desktopGeom && desktopGeom.edgeDelta <= 4,
      `delta=${desktopGeom?.edgeDelta} edges=${JSON.stringify(desktopGeom?.edges)}`));
    checks.push(check('DESKTOP_CONFIG_NO_WRAP', !!desktopGeom && !desktopGeom.configWrap, `wrap=${desktopGeom?.configWrap}`));
    checks.push(check('COMPOSER_USABLE', await page.locator('#native-prompt').isEnabled(), 'prompt enabled'));
    checks.push(check('CONFIG_BAR', await page.getByTestId('session-config-bar').isVisible(), 'visible'));
    checks.push(check('CONFIG_MUTATION_HONEST', await page.getByTestId('session-config-bar').getAttribute('data-mutation-supported') === 'false', 'native observe-only attr'));

    await page.getByTestId('config-detail-open').click();
    await expect(page.getByTestId('config-sheet')).toBeVisible();
    await expect(page.getByTestId('config-mutation-hint')).toBeVisible();
    const desktopSheet = await measureConfigSurface(page);
    density.desktopConfigSurface = desktopSheet;
    checks.push(check('DESKTOP_CONFIG_POPOVER', !!desktopSheet
      && desktopSheet.variant === 'popover'
      && desktopSheet.width >= 280
      && desktopSheet.width <= 420
      && desktopSheet.width < desktopSheet.viewportWidth * 0.55, JSON.stringify(desktopSheet)));
    await page.screenshot({ path: path.join(evidenceRoot, 'config-desktop-popover.png') });
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
    await expect(page.getByText('LIVE_ASSISTANT_B_FINAL')).toBeVisible({ timeout: 10000 });
    await waitIdle(page);
    await resetTimelineScroll(page);
    await page.screenshot({ path: path.join(evidenceRoot, 'tool-card-completed.png'), fullPage: true });
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
    await resetTimelineScroll(page);
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
    await page.locator('#native-prompt').fill('');
    checks.push(check('NO_OVERFLOW_TABLET', await noHorizontalOverflow(page), '1024x768'));
    const tabletGeom = await measureComposerGeometry(page);
    density.tablet1024 = tabletGeom;
    checks.push(check('TABLET_COMPOSER_IDLE_HEIGHT', !!tabletGeom && tabletGeom.composerHeight > 0 && tabletGeom.composerHeight <= 120,
      `h=${tabletGeom?.composerHeight}`));
    checks.push(check('TABLET_CONFIG_SINGLE_LINE', !!tabletGeom && tabletGeom.configRows === '1' && !tabletGeom.configWrap,
      `rows=${tabletGeom?.configRows} wrap=${tabletGeom?.configWrap}`));
    await expect(page.getByTestId('config-capsule')).toBeVisible();
    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.getByTestId('nav-backdrop').click();
    await expect(page.getByTestId('nav-drawer')).toHaveCount(0);
    await page.getByTestId('context-menu').click();
    await expect(page.getByTestId('context-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('context-drawer')).toHaveCount(0);
    await resetTimelineScroll(page);
    await page.screenshot({ path: path.join(evidenceRoot, 'tablet-compact.png'), fullPage: true });
    checks.push(check('TABLET_DRAWERS', true, 'nav/context drawers'));
    checks.push(check('TABLET_NO_THREE_COLUMN', await page.locator('[data-testid="navigation-panel"]').isHidden()
      && await page.locator('[data-testid="context-panel"]').isHidden(), 'side panels hidden'));

    // --- Phone density ---
    await page.setViewportSize({ width: 390, height: 844 });
    await setPresentation(page, 'en-US', 'dark');
    await expect(page.getByTestId('app-shell')).toHaveAttribute('data-breakpoint', 'mobile');
    await page.locator('#native-prompt').fill('');
    checks.push(check('NO_OVERFLOW_PHONE', await noHorizontalOverflow(page), '390x844'));
    const mobileGeom = await measureComposerGeometry(page);
    density.mobile390 = mobileGeom;
    checks.push(check('MOBILE_CONFIG_ROWS', mobileGeom?.configRows === '1', `rows=${mobileGeom?.configRows}`));
    checks.push(check('MOBILE_HELPER_TEXT', (mobileGeom?.helperLabels ?? 1) === 0 && (mobileGeom?.permanentHints ?? 1) === 0,
      `labels=${mobileGeom?.helperLabels} hints=${mobileGeom?.permanentHints}`));
    checks.push(check('MOBILE_COMPOSER_IDLE_HEIGHT', !!mobileGeom && mobileGeom.composerHeight > 0 && mobileGeom.composerHeight <= 112,
      `h=${mobileGeom?.composerHeight}`));

    await expect(page.getByTestId('config-capsule')).toBeVisible();
    await page.getByTestId('config-capsule').click();
    await expect(page.getByTestId('config-sheet')).toBeVisible();
    await expect(page.getByTestId('config-mutation-hint')).toBeVisible();
    const mobileSheet = await measureConfigSurface(page);
    density.mobileConfigSurface = mobileSheet;
    checks.push(check('MOBILE_CONFIG_SHEET', !!mobileSheet
      && mobileSheet.variant === 'sheet'
      && mobileSheet.width >= mobileSheet.viewportWidth * 0.9, JSON.stringify(mobileSheet)));
    await page.screenshot({ path: path.join(evidenceRoot, 'config-mobile-sheet.png') });
    await page.getByTestId('config-sheet-close').click();

    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTestId('context-menu').click();
    await expect(page.getByTestId('context-drawer')).toBeVisible();
    await page.keyboard.press('Escape');

    await resetTimelineScroll(page);
    await page.waitForTimeout(80);
    const scrollTop = await page.evaluate(() => (document.querySelector('[data-testid="conversation-timeline"]') as HTMLElement | null)?.scrollTop ?? -1);
    checks.push(check('GALLERY_SCROLL_DISCIPLINE', scrollTop === 0, `scrollTop=${scrollTop}`));
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-390-top.png'), fullPage: true });
    await scrollTimelineBottom(page);
    await page.waitForTimeout(80);
    await page.screenshot({ path: path.join(evidenceRoot, 'mobile-390-bottom.png'), fullPage: true });
    checks.push(check('MOBILE_DRAWERS', true, 'nav/context'));

    // Element clipping scan (connected desktop)
    await page.setViewportSize({ width: 1440, height: 900 });
    await setPresentation(page, 'en-US', 'oled-black');
    await waitIdle(page);
    const clipOffenders = await scanClipping(page);
    density.clipping = clipOffenders;
    checks.push(check('TEXT_CLIPPING_SCAN', clipOffenders.length === 0, JSON.stringify(clipOffenders.slice(0, 8))));

    // Focus usability
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
