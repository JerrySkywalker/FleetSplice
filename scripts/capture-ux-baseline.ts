/**
 * UX00 baseline screenshot capture for the 24h hardening train.
 * Uses the disposable Native Adoption fixture + built Web UI.
 */
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { chromium, expect } from '@playwright/test';
import { startHub } from '../apps/hub/server.ts';
import { target } from '../tests/helpers.ts';
import { createDisposableAdoptionFixture } from '../tests/fixtures/native-adoption-browser-fixture.ts';
import { setPresentation } from '../tests/ui-preferences.ts';

const evidenceRoot = path.resolve(
  process.env.FLEETSPLICE_UX_BASELINE
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001\\BASELINE-R2',
);

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '412x915', width: 412, height: 915 },
  { name: '390x844', width: 390, height: 844 },
] as const;

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

async function run(): Promise<number> {
  mkdirSync(evidenceRoot, { recursive: true });
  const fixture = await createDisposableAdoptionFixture();
  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'fixture',
    principal: 'fixture',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-ux-baseline-hub-')),
    webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fixture.adoptionPort);

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByRole('button', { name: 'Connect session', exact: true })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(evidenceRoot, `baseline-${viewport.name}.png`),
        fullPage: true,
      });
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    for (const theme of ['light', 'dark', 'oled-black'] as const) {
      await setPresentation(page, 'en-US', theme);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(evidenceRoot, `baseline-theme-${theme}.png`),
        fullPage: true,
      });
    }

    const inventory = {
      capturedAt: new Date().toISOString(),
      head: process.env.FLEETSPLICE_BASELINE_HEAD ?? 'bf7184f8f9403c0bcdedd476e8831b530830a248',
      viewports: viewports.map(v => v.name),
      themes: ['light', 'dark', 'oled-black'],
      observations: [
        'Desktop uses fixed three-column grid (nav | conversation | context) with no resize/collapse.',
        'Model/permission appear only as status summary and context dl; no composer control bar.',
        'Live streaming uses flat debug-like message rows for deltas/tools/turns.',
        'Acquire and Release controls both visible; Acquire disabled when controller present.',
        'External advance notice duplicates review action also available in composer mode=review.',
        'Narrow breakpoints stack columns but still render miniature side panels instead of drawers.',
        'Themes: system/light/dark/oled-black only; midnight/graphite/warm missing.',
        'Repeated information: model/permission/controller shown in header summary and context panel.',
        'Inspector dumps raw JSON prominently in context panel.',
        'Composer has Send/Steer/Interrupt but configuration lives in sidebar (managed) or is observe-only (native).',
      ],
      componentInventory: [
        'apps/web/main.tsx — managed shell + preferences wiring',
        'apps/web/NativeAdoption.tsx — native adoption controller + monolithic presentation',
        'apps/web/PreferencesControl.tsx — locale/appearance dialog',
        'apps/web/style.css — tokenized light/dark/oled themes + fixed shell grid',
        'apps/web/control-safety-ux.ts — presentation severity helpers',
        'apps/web/optimistic-command.ts — provisional message state machine',
        'apps/web/reconcile-scheduler.ts — authoritative snapshot coalesce',
        'apps/web/realtime-refresh-policy.ts — SSE refresh classification',
      ],
    };
    writeFileSync(path.join(evidenceRoot, 'BASELINE-INVENTORY.json'), JSON.stringify(inventory, null, 2));
    writeFileSync(path.join(evidenceRoot, 'BASELINE-NOTES.md'), `# UX00 baseline notes

Captured against Goal start HEAD and the disposable Native Adoption fixture.

## Desktop composition
Three fixed columns. Conversation is usable but context panel duplicates session facts already in the header summary. No panel resize or collapse.

## Tablet behavior
At 1024/768 widths the grid merely shrinks columns. Information density becomes cramped; touch targets remain desktop-sized.

## Mobile behavior
Below 800px columns stack vertically. Navigation and context still occupy vertical space above/below conversation rather than drawers. Horizontal overflow risk remains from long IDs and fixed composer chrome.

## Composer
Prompt + Send/Steer/Interrupt only. No model/reasoning/permission control bar near the prompt.

## Conversation timeline
History + provisional + flat live rows. Tool activity appears as system-like debug rows.

## Context panel
Ownership buttons (Acquire+Release simultaneous), model/permission dl, activity list, Inspector with raw JSON.

## Theme presentation
Four appearances (system/light/dark/oled-black). OLED uses true black canvas. Missing product themes: midnight, graphite, warm.

## Streaming presentation
Live deltas/finals/tools render as separate flat articles keyed by eventId; semantic tool cards and in-place growth indicators are absent.
`);
    console.log(`UX00 baseline written to ${evidenceRoot}`);
    return 0;
  } finally {
    await browser?.close();
    await hub.close();
    fixture.rpc.close();
  }
}

run().then(code => process.exit(code), error => {
  console.error(error);
  process.exit(1);
});
