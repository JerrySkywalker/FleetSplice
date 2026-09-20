/**
 * Deterministic soak for local G05C performance audit.
 * PERF_SOAK_MINUTES=<N> (final evidence: >= 60).
 * No Tencent. No Owner thread mutation. Fixture traffic only.
 */
import { mkdirSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { chromium, expect, type Page, type CDPSession } from '@playwright/test';
import { startHub } from '../../apps/hub/server.ts';
import { target } from '../../tests/helpers.ts';
import { createPerfAdoptionFixture } from '../../tests/fixtures/perf-adoption-fixture.ts';
import { freePort } from './stats.ts';

const ARTIFACT_ROOT = path.resolve(
  process.env.FLEETSPLICE_PERF_ARTIFACT_ROOT
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001',
);
const WEB_DIR = path.resolve('dist/web');
const SOAK_MINUTES = Math.max(1, Number(process.env.PERF_SOAK_MINUTES ?? '60'));
const SAMPLE_EVERY_MS = Math.max(5_000, Number(process.env.PERF_SOAK_SAMPLE_MS ?? '30000'));

function requireBuiltWeb() {
  if (!existsSync(path.join(WEB_DIR, 'index.html'))) {
    throw new Error('PERF_AUDIT_BLOCKED_BY_DEFECT=dist/web missing; run npm run build first');
  }
}

function classifyMemory(samples: Array<number | null>): {
  classification: 'STABLE_OR_OSCILLATING' | 'BOUNDED_GROWTH' | 'MONOTONIC_UNEXPLAINED_GROWTH' | 'INSUFFICIENT_SAMPLES';
  detail: string;
} {
  const values = samples.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (values.length < 6) return { classification: 'INSUFFICIENT_SAMPLES', detail: `n=${values.length}` };
  const first = values.slice(0, Math.max(2, Math.floor(values.length * 0.2)));
  const last = values.slice(-Math.max(2, Math.floor(values.length * 0.2)));
  const firstMed = first.reduce((a, b) => a + b, 0) / first.length;
  const lastMed = last.reduce((a, b) => a + b, 0) / last.length;
  const growth = lastMed - firstMed;
  const growthPct = firstMed > 0 ? growth / firstMed : 0;
  // Monotonic check: majority of consecutive deltas positive and material.
  let up = 0;
  let down = 0;
  for (let i = 1; i < values.length; i++) {
    const d = values[i]! - values[i - 1]!;
    if (d > firstMed * 0.01) up++;
    else if (d < -firstMed * 0.01) down++;
  }
  if (growthPct > 0.35 && up > down * 2 && up >= values.length * 0.55) {
    return {
      classification: 'MONOTONIC_UNEXPLAINED_GROWTH',
      detail: `growthPct=${growthPct.toFixed(3)} up=${up} down=${down} firstMed=${Math.round(firstMed)} lastMed=${Math.round(lastMed)}`,
    };
  }
  if (growthPct > 0.15) {
    return {
      classification: 'BOUNDED_GROWTH',
      detail: `growthPct=${growthPct.toFixed(3)} up=${up} down=${down} firstMed=${Math.round(firstMed)} lastMed=${Math.round(lastMed)}`,
    };
  }
  return {
    classification: 'STABLE_OR_OSCILLATING',
    detail: `growthPct=${growthPct.toFixed(3)} up=${up} down=${down} firstMed=${Math.round(firstMed)} lastMed=${Math.round(lastMed)}`,
  };
}

async function sample(page: Page, cdp: CDPSession, hubRss: () => NodeJS.MemoryUsage) {
  const heap = await cdp.send('Runtime.getHeapUsage').catch(() => null) as { usedSize?: number } | null;
  const ui = await page.evaluate(() => {
    const longTasks = (performance as any).getEntriesByType?.('longtask') ?? [];
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    return {
      domNodes: document.getElementsByTagName('*').length,
      liveTimelineItems: document.querySelectorAll('[data-live-kind]').length,
      snapshotCount: audit?.networkSnapshots?.length ?? 0,
      sseEventCount: audit?.sseTriggers?.length ?? 0,
      longTaskCount: longTasks.length,
      longTaskTotalDurationMs: longTasks.reduce((sum: number, t: any) => sum + (t.duration ?? 0), 0),
    };
  });
  const mem = hubRss();
  return {
    at: new Date().toISOString(),
    jsHeapUsedBytes: heap?.usedSize ?? null,
    hubRssBytes: mem.rss,
    hubHeapUsedBytes: mem.heapUsed,
    ...ui,
  };
}

async function waitSchedulerIdle(page: Page) {
  await page.waitForFunction(() => {
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    const scheduler = audit?.scheduler?.();
    if (!scheduler) return true;
    return scheduler.executions.every((item: any) => item.completedAt !== null);
  }, { timeout: 8000 }).catch(() => {});
}

async function main() {
  requireBuiltWeb();
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  const durationMs = SOAK_MINUTES * 60_000;
  const startedAt = Date.now();
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 20_000 });
  fx.rpc.configureSingleThread({ turns: 4, messagesPerTurn: 2 });
  fx.rpc.afterTurnStart = (turnId) => {
    // Deterministic owned lifecycle; complete after a short stream so the Web
    // composer returns to an operable idle state between soak cycles.
    fx.rpc.emitOwnedTurnLifecycle(turnId, { complete: true, deltaCount: 6 });
  };

  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'fixture',
    principal: 'fixture',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-perf-soak-hub-')),
    webDirectory: WEB_DIR,
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fx.adoptionPort);

  const samples: Awaited<ReturnType<typeof sample>>[] = [];
  const logPath = path.join(ARTIFACT_ROOT, 'soak-samples.ndjson');
  writeFileSync(logPath, '');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let cycle = 0;

  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Runtime.enable').catch(() => {});
    await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByRole('button', { name: 'Connect session', exact: true })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await waitSchedulerIdle(page);

    let nextSampleAt = Date.now();
    let nextTrafficAt = Date.now();
    let nextIdleAt = Date.now() + 120_000;
    let nextReconnectAt = Date.now() + 300_000;

    console.log(JSON.stringify({
      phase: 'perf:soak',
      soakMinutes: SOAK_MINUTES,
      sampleEveryMs: SAMPLE_EVERY_MS,
      artifactRoot: ARTIFACT_ROOT,
    }));

    while (Date.now() - startedAt < durationMs) {
      const now = Date.now();
      if (now >= nextSampleAt) {
        const row = await sample(page, cdp, () => process.memoryUsage());
        samples.push(row);
        appendFileSync(logPath, `${JSON.stringify(row)}\n`);
        nextSampleAt = now + SAMPLE_EVERY_MS;
        if (samples.length % 5 === 0) {
          console.log(JSON.stringify({
            progressMin: Number(((now - startedAt) / 60000).toFixed(2)),
            samples: samples.length,
            heap: row.jsHeapUsedBytes,
            rss: row.hubRssBytes,
            live: row.liveTimelineItems,
            snapshots: row.snapshotCount,
            sse: row.sseEventCount,
          }));
        }
      }

      if (now >= nextTrafficAt) {
        cycle += 1;
        const mode = cycle % 5;
        const turn = fx.rpc.turns[0];
        const threadId = fx.rpc.primaryId;
        try {
          if (mode === 0) {
            // Prefer Web submit when composer is enabled; otherwise fixture stream.
            const enabled = await page.locator('#native-prompt:not([disabled])').count();
            if (enabled > 0) {
              await page.locator('#native-prompt').fill(`soak cycle ${cycle}`, { timeout: 2000 });
              await page.getByRole('button', { name: 'Send', exact: true }).click({ timeout: 2000 });
              await page.waitForTimeout(900);
              await waitSchedulerIdle(page);
            } else {
              const review = page.getByRole('button', { name: 'Review and continue', exact: true });
              if (await review.count()) await review.click({ timeout: 2000 }).catch(() => {});
              if (turn) {
                fx.rpc.emitDeltas(threadId, turn.id, `soak-live-${cycle}`, 12, 'soak');
                fx.rpc.emitToolBurst(threadId, turn.id, 2);
              }
              await page.waitForTimeout(400);
            }
          } else if (mode === 1) {
            if (turn) fx.rpc.emitToolBurst(threadId, turn.id, 4);
            await page.waitForTimeout(200);
          } else if (mode === 2) {
            if (turn) fx.rpc.emitDeltas(threadId, turn.id, `soak-delta-${cycle}`, 20, 'd');
            await page.waitForTimeout(300);
          } else if (mode === 3) {
            await page.waitForTimeout(1500);
          } else {
            await page.evaluate(() => {
              document.dispatchEvent(new Event('visibilitychange'));
            });
            await waitSchedulerIdle(page);
          }
        } catch (error) {
          // Soak must continue through transient UI disablement; record and proceed.
          appendFileSync(logPath, `${JSON.stringify({
            at: new Date().toISOString(),
            kind: 'traffic_error',
            cycle,
            message: error instanceof Error ? error.message : String(error),
          })}\n`);
        }
        nextTrafficAt = now + 8_000;
      }

      if (now >= nextIdleAt) {
        await page.waitForTimeout(10_000);
        nextIdleAt = now + 180_000;
      }

      if (now >= nextReconnectAt) {
        await page.evaluate(() => {
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await waitSchedulerIdle(page);
        nextReconnectAt = now + 300_000;
      }

      await page.waitForTimeout(500);
    }

    const finalSample = await sample(page, cdp, () => process.memoryUsage());
    samples.push(finalSample);
    appendFileSync(logPath, `${JSON.stringify(finalSample)}\n`);

    const heapClass = classifyMemory(samples.map(s => s.jsHeapUsedBytes));
    const rssClass = classifyMemory(samples.map(s => s.hubRssBytes));
    const unexplained = heapClass.classification === 'MONOTONIC_UNEXPLAINED_GROWTH'
      || rssClass.classification === 'MONOTONIC_UNEXPLAINED_GROWTH';

    const report = {
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date().toISOString(),
      soakMinutesConfigured: SOAK_MINUTES,
      soakMinutesActual: Number(((Date.now() - startedAt) / 60000).toFixed(2)),
      sampleEveryMs: SAMPLE_EVERY_MS,
      sampleCount: samples.length,
      samples,
      memory: {
        browserHeap: heapClass,
        hubRss: rssClass,
        UNEXPLAINED_MEMORY_GROWTH: unexplained,
      },
      trafficCycles: cycle,
      note: 'Audit observation arrays (networkSnapshots/sseTriggers) grow for the page lifetime; classify product rings separately.',
    };
    writeFileSync(path.join(ARTIFACT_ROOT, 'SOAK-METRICS.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({
      status: 'PERF_SOAK_COMPLETE',
      soakMinutesActual: report.soakMinutesActual,
      sampleCount: samples.length,
      browserHeap: heapClass.classification,
      hubRss: rssClass.classification,
      UNEXPLAINED_MEMORY_GROWTH: unexplained,
    }, null, 2));
  } finally {
    await browser?.close().catch(() => {});
    await hub.close();
    fx.journal.close();
  }
}

const code = await main().then(() => 0).catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  return 1;
});
process.exit(code);
