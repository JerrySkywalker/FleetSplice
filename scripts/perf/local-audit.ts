/**
 * Deterministic local performance audit harness.
 * Real built Hub/Web + disposable fixture. No Tencent. No Owner Codex mutation.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { chromium, expect, type Page, type CDPSession } from '@playwright/test';
import { startHub } from '../../apps/hub/server.ts';
import { target } from '../../tests/helpers.ts';
import { createPerfAdoptionFixture } from '../../tests/fixtures/perf-adoption-fixture.ts';
import { foldTimeline, retireLiveWhenAuthoritative, projectExecutionToTimeline, type TimelinePresentationItem, type AuthoritativeHistoryMessage } from '../../packages/contracts/realtime-timeline.ts';
import { classifyRealtimeRefresh } from '../../apps/web/realtime-refresh-policy.ts';
import { freePort, hrMs, summarize } from './stats.ts';

const ARTIFACT_ROOT = path.resolve(
  process.env.FLEETSPLICE_PERF_ARTIFACT_ROOT
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001',
);
const WEB_DIR = path.resolve('dist/web');
const WARMUP = 2;
const SAMPLES = 12;

type ScenarioResult = Record<string, unknown>;

function requireBuiltWeb() {
  if (!existsSync(path.join(WEB_DIR, 'index.html'))) {
    throw new Error('PERF_AUDIT_BLOCKED_BY_DEFECT=dist/web missing; run npm run build first');
  }
}

async function browserMetrics(page: Page, cdp: CDPSession) {
  const heap = await cdp.send('Runtime.getHeapUsage').catch(() => null) as { usedSize?: number; totalSize?: number } | null;
  const perf = await page.evaluate(() => {
    const longTasks = (performance as any).getEntriesByType?.('longtask') ?? [];
    return {
      domNodes: document.getElementsByTagName('*').length,
      liveTimeline: (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__?.sseTriggers?.length ?? null,
      networkSnapshots: (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__?.networkSnapshots?.length ?? null,
      sseTriggers: (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__?.sseTriggers?.length ?? null,
      longTaskCount: longTasks.length,
      longTaskTotalDurationMs: longTasks.reduce((sum: number, t: any) => sum + (t.duration ?? 0), 0),
      liveItemCount: document.querySelectorAll('[data-live-kind]').length,
      messageArticles: document.querySelectorAll('article.message').length,
      turnMarkers: document.querySelectorAll('.native-turn-marker').length,
      runningTurnTimers: document.querySelectorAll('[data-turn-state="RUNNING"]').length,
    };
  });
  return {
    jsHeapUsedBytes: heap?.usedSize ?? null,
    jsHeapTotalBytes: heap?.totalSize ?? null,
    ...perf,
  };
}

async function waitSchedulerIdle(page: Page, timeoutMs = 8000) {
  await page.waitForFunction(() => {
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    const scheduler = audit?.scheduler?.();
    if (!scheduler) return true;
    return scheduler.executions.every((item: any) => item.completedAt !== null)
      && !document.querySelector('[data-busy="true"]');
  }, { timeout: timeoutMs }).catch(() => {});
  await page.waitForTimeout(80);
}

async function measureTypingLatency(page: Page, keys = 16): Promise<number[]> {
  const samples: number[] = [];
  const prompt = page.locator('#native-prompt');
  await prompt.click();
  for (let i = 0; i < keys; i++) {
    const started = performance.now();
    await page.keyboard.type('a', { delay: 0 });
    await page.waitForTimeout(0);
    samples.push(performance.now() - started);
  }
  return samples;
}

function futureScaleSimulation(itemCount: number) {
  const history: AuthoritativeHistoryMessage[] = [];
  const turns = Math.ceil(itemCount / 4);
  for (let t = 0; t < turns; t++) {
    for (let m = 0; m < 4 && history.length < itemCount; m++) {
      history.push({
        role: m % 2 === 0 ? 'user' : 'assistant',
        text: `msg-${t}-${m}`,
        turnId: `turn-${t}`,
        itemId: `item-${t}-${m}`,
      });
    }
  }
  const turnIds = [...new Set(history.map(h => h.turnId))];
  // Simulate NativeAdoption turns.map + history.filter
  const filterStarted = process.hrtime.bigint();
  let mounted = 0;
  for (const turnId of turnIds) {
    mounted += history.filter(message => message.turnId === turnId).length;
  }
  const filterMs = hrMs(filterStarted);

  let live: TimelinePresentationItem[] = [];
  const foldStarted = process.hrtime.bigint();
  for (let i = 0; i < Math.min(itemCount, 500); i++) {
    const event = {
      eventId: `e-${i}`,
      revision: String(i),
      stream: 'agent.execution' as const,
      kind: 'message.delta' as const,
      threadId: 't',
      turnId: 'live-turn',
      sessionKey: 's',
      observedAt: new Date().toISOString(),
      trustLevel: 'NATIVE_STRUCTURED_API' as const,
      payload: { role: 'assistant' as const, text: 'x', itemId: 'live-item' },
    };
    const projected = projectExecutionToTimeline(event);
    if (projected) live = foldTimeline(live, projected, 48);
  }
  const foldMs = hrMs(foldStarted);

  const retireStarted = process.hrtime.bigint();
  live = retireLiveWhenAuthoritative(live, history.slice(-48), []);
  const retireMs = hrMs(retireStarted);

  return {
    label: 'FUTURE_SCALE_SIMULATION',
    itemCount,
    turnCount: turnIds.length,
    mountedMessagesViaFilter: mounted,
    filterScanMs: filterMs,
    fold500DeltasMs: foldMs,
    retireMs,
    liveAfterFold: live.length,
    note: 'Isolated algorithm cost only; does not change production bounds.',
  };
}

async function runAdapterBenchmarks(): Promise<ScenarioResult> {
  const results: ScenarioResult = { kind: 'NATIVE_ADAPTER_PERF_AUDIT' };

  // Bounds verification via adapter snapshot
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureBoundedMax();
    fx.rpc.resetCalls();
    const snap = await fx.adapter.snapshot({ discover: true });
    const thread = snap.threads[0]!;
    results.CURRENT_BOUNDED_MAX_ADAPTER = {
      turns: thread.turns.length,
      history: thread.history.length,
      activity: thread.activity.length,
      receipts: snap.receipts.length,
      bounds: {
        turnsOk: thread.turns.length <= 12,
        historyOk: thread.history.length <= 48,
        activityOk: thread.activity.length <= 16,
        receiptsOk: snap.receipts.length <= 20,
      },
      rpcCounts: fx.rpc.methodCounts(),
      snapshotBytes: Buffer.byteLength(JSON.stringify(snap), 'utf8'),
    };
    const cloneSamples: number[] = [];
    for (let i = 0; i < WARMUP + SAMPLES; i++) {
      fx.rpc.resetCalls();
      const s0 = process.hrtime.bigint();
      await fx.adapter.snapshot({});
      const ms = hrMs(s0);
      if (i >= WARMUP) cloneSamples.push(ms);
    }
    results.snapshotRoundtripMs = summarize(cloneSamples);
    fx.journal.close();
  }

  // DISCOVERY_FANOUT (+ unchanged second discovery for T01)
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureDiscoveryFanout({ loaded: 64, eligible: 8 });
    fx.rpc.resetCalls();
    const t0 = process.hrtime.bigint();
    const snap = await fx.adapter.snapshot({ discover: true });
    const wallMs = hrMs(t0);
    const firstCounts = fx.rpc.methodCounts();
    const firstTotal = fx.rpc.calls.length;
    const firstThreadRead = firstCounts['thread/read'] ?? 0;
    const firstTurnsList = firstCounts['thread/turns/list'] ?? 0;
    const firstMetadataReads = Math.max(0, firstThreadRead - firstTurnsList);
    const firstCandidateIds = snap.threads.map(t => t.id).sort();

    fx.rpc.resetCalls();
    const t1 = process.hrtime.bigint();
    const snap2 = await fx.adapter.snapshot({ discover: true });
    const secondWallMs = hrMs(t1);
    const secondCounts = fx.rpc.methodCounts();
    const secondTotal = fx.rpc.calls.length;
    const secondThreadRead = secondCounts['thread/read'] ?? 0;
    const secondTurnsList = secondCounts['thread/turns/list'] ?? 0;
    const secondMetadataReads = Math.max(0, secondThreadRead - secondTurnsList);
    const auditBaselineMetadataReads = 56; // frozen from G05C PERFORMANCE-METRICS DISCOVERY_FANOUT (64 read - 8 turns)
    const metadataReduction = (auditBaselineMetadataReads - secondMetadataReads) / auditBaselineMetadataReads;

    results.DISCOVERY_FANOUT = {
      wallMs,
      threadCount: snap.threads.length,
      candidatesBoundOk: snap.threads.length <= 8,
      rpcCounts: firstCounts,
      rpcTotal: firstTotal,
      snapshotBytes: Buffer.byteLength(JSON.stringify(snap), 'utf8'),
      metadataReads: firstMetadataReads,
      unchangedSecond: {
        wallMs: secondWallMs,
        rpcCounts: secondCounts,
        rpcTotal: secondTotal,
        metadataReads: secondMetadataReads,
        threadIdsEqual: JSON.stringify(snap2.threads.map(t => t.id).sort()) === JSON.stringify(firstCandidateIds),
        auditBaselineMetadataReads,
        metadataReadReduction: metadataReduction,
        metadataReadReductionPct: Math.round(metadataReduction * 1000) / 10,
      },
    };
  }

  // MULTI_THREAD_PROJECTION
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureMultiThread(4);
    fx.rpc.resetCalls();
    const t0 = process.hrtime.bigint();
    const snap = await fx.adapter.snapshot({ discover: true });
    results.MULTI_THREAD_PROJECTION = {
      wallMs: hrMs(t0),
      threads: snap.threads.length,
      rpcCounts: fx.rpc.methodCounts(),
      snapshotBytes: Buffer.byteLength(JSON.stringify(snap), 'utf8'),
      historyTotal: snap.threads.reduce((n, t) => n + t.history.length, 0),
    };
  }

  // Dirty-thread reconcile vs full discovery
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureSingleThread({ turns: 3, messagesPerTurn: 2 });
    await fx.attach();
    fx.rpc.resetCalls();
    // Mark dirty via event then snapshot without forcing discover
    const turnId = fx.rpc.turns[0]?.id ?? 'x';
    fx.rpc.emitDeltas(fx.rpc.primaryId, turnId, 'assist-live', 5);
    const t0 = process.hrtime.bigint();
    const snap = await fx.adapter.snapshot({});
    results.DIRTY_THREAD_RECONCILE = {
      wallMs: hrMs(t0),
      rpcCounts: fx.rpc.methodCounts(),
      threads: snap.threads.length,
    };
  }

  // Web-submit pre/post observation RPC sequence
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureSingleThread({ turns: 2, messagesPerTurn: 2 });
    await fx.attach();
    fx.rpc.afterTurnStart = (turnId) => fx.rpc.emitOwnedTurnLifecycle(turnId, { deltaCount: 3 });
    const before = await fx.adapter.snapshot({});
    fx.rpc.resetCalls();
    const cmd = fx.command(before, 'native.submit', { text: 'perf submit sequence' });
    const t0 = process.hrtime.bigint();
    const receipt = await fx.execute(cmd);
    const wallMs = hrMs(t0);
    const methods = fx.rpc.calls.map(c => c.method);
    const startIdx = methods.indexOf('turn/start');
    const preEffect = startIdx >= 0 ? methods.slice(0, startIdx) : methods;
    const postEffect = startIdx >= 0 ? methods.slice(startIdx + 1) : [];
    const preEffectReadThread = preEffect.filter(m => m === 'thread/read').length;
    const postEffectReadThread = postEffect.filter(m => m === 'thread/read').length;
    results.WEB_SUBMIT_OBSERVATION_SEQUENCE = {
      wallMs,
      receiptStatus: receipt.status,
      receiptCode: receipt.code,
      methods,
      preEffect,
      effect: startIdx >= 0 ? methods[startIdx] : null,
      postEffect,
      preEffectReadThread,
      postEffectReadThread,
      methodCounts: fx.rpc.methodCounts(),
      note: 'T02: single final pre-effect readThread; post-effect observation retained; no TTL freshness.',
      auditBaselinePreEffectReadThread: 2,
      consolidated: preEffectReadThread === 1 && postEffectReadThread === 1,
    };
  }

  // Projection serialization microbench at bounded max
  {
    const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
    fx.rpc.configureBoundedMax();
    await fx.adapter.snapshot({ discover: true });
    const samples: number[] = [];
    const sizes: number[] = [];
    for (let i = 0; i < WARMUP + SAMPLES; i++) {
      const t0 = process.hrtime.bigint();
      const snap = await fx.adapter.snapshot({});
      const ms = hrMs(t0);
      const bytes = Buffer.byteLength(JSON.stringify(snap), 'utf8');
      if (i >= WARMUP) { samples.push(ms); sizes.push(bytes); }
    }
    results.PROJECTION_SERIALIZATION = {
      snapshotMs: summarize(samples),
      snapshotBytes: summarize(sizes),
    };
  }

  // Realtime live-only policy check (static+runtime)
  {
    const liveOnly = ['message.delta', 'message.final', 'tool.started', 'tool.updated', 'tool.completed', 'tool.failed', 'turn.started'];
    const decisions = Object.fromEntries(liveOnly.map(kind => [kind, classifyRealtimeRefresh({ stream: 'agent.execution', kind })]));
    results.COMMON_TURN_SNAPSHOT_FANOUT_POLICY = {
      liveOnlyDecisions: decisions,
      allLiveOnly: liveOnly.every(kind => decisions[kind]?.mode === 'live_only'),
    };
  }

  results.FUTURE_SCALE_SIMULATION = [100, 500, 2000].map(futureScaleSimulation);
  return results;
}

async function runBrowserScenario(
  name: string,
  setup: (fx: Awaited<ReturnType<typeof createPerfAdoptionFixture>>) => Promise<void> | void,
  exercise: (ctx: {
    page: Page;
    cdp: CDPSession;
    fx: Awaited<ReturnType<typeof createPerfAdoptionFixture>>;
    port: number;
  }) => Promise<ScenarioResult>,
): Promise<ScenarioResult> {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  await setup(fx);
  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'fixture',
    principal: 'fixture',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-perf-hub-')),
    webDirectory: WEB_DIR,
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fx.adoptionPort);

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1480, height: 1000 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Runtime.enable').catch(() => {});
    await cdp.send('Performance.enable').catch(() => {});
    await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByRole('button', { name: 'Connect session', exact: true })).toBeVisible({ timeout: 20000 });
    const result = await exercise({ page, cdp, fx, port });
    return { scenario: name, ...result };
  } finally {
    await browser?.close().catch(() => {});
    await hub.close();
  }
}

async function runBrowserScenarios(): Promise<ScenarioResult[]> {
  const out: ScenarioResult[] = [];

  out.push(await runBrowserScenario('SHORT_SESSION', async fx => {
    fx.rpc.configureSingleThread({ turns: 2, messagesPerTurn: 2 });
  }, async ({ page, cdp, fx }) => {
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await expect(page.getByText('Assistant message', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    await waitSchedulerIdle(page);
    const metrics = await browserMetrics(page, cdp);
    return { metrics, rpcAfterConnect: fx.rpc.methodCounts() };
  }));

  out.push(await runBrowserScenario('CURRENT_BOUNDED_MAX', async fx => {
    fx.rpc.configureBoundedMax();
  }, async ({ page, cdp }) => {
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await waitSchedulerIdle(page);
    await page.waitForTimeout(200);
    const metrics = await browserMetrics(page, cdp);
    const snapshotBytesSamples: number[] = [];
    page.on('response', async response => {
      if (/\/api\/native\/snapshot/.test(response.url())) {
        try {
          const buf = await response.body();
          snapshotBytesSamples.push(buf.byteLength);
        } catch { /* ignore */ }
      }
    });
    await page.getByRole('button', { name: 'Refresh discovery', exact: true }).click();
    await waitSchedulerIdle(page);
    const after = await browserMetrics(page, cdp);
    return {
      metrics,
      afterRefresh: after,
      snapshotBytes: summarize(snapshotBytesSamples),
      boundsPresentation: {
        messageArticles: after.messageArticles,
        turnMarkers: after.turnMarkers,
        liveItemCount: after.liveItemCount,
      },
    };
  }));

  // STREAMING_DELTA_BURST lanes
  for (const lane of [
    { name: 'STREAMING_DELTA_BURST_LOW', ratePerSec: 10, durationMs: 1500 },
    { name: 'STREAMING_DELTA_BURST_MEDIUM', ratePerSec: 40, durationMs: 1500 },
    { name: 'STREAMING_DELTA_BURST_STRESS', ratePerSec: 120, durationMs: 2000 },
  ] as const) {
    out.push(await runBrowserScenario(lane.name, async fx => {
      fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
      fx.rpc.afterTurnStart = (turnId) => {
        // Keep turn in progress for streaming.
        fx.rpc.emitOwnedTurnLifecycle(turnId, { complete: false, deltaCount: 1 });
      };
    }, async ({ page, cdp, fx }) => {
      await page.getByRole('button', { name: 'Connect session', exact: true }).click();
      await waitSchedulerIdle(page);
      await page.locator('#native-prompt').fill('stream burst');
      const snapshotRequests: string[] = [];
      page.on('request', req => {
        if (/\/api\/native\/snapshot/.test(req.url()) && req.method() === 'GET') snapshotRequests.push(req.url());
      });
      const beforeSnapshots = snapshotRequests.length;
      await page.getByRole('button', { name: 'Send', exact: true }).click();
      await page.waitForTimeout(200);
      // Additional delta burst while turn active
      const turn = fx.rpc.turns.find(t => t.status === 'inProgress') ?? fx.rpc.turns[0];
      const intervalMs = Math.max(1, Math.floor(1000 / lane.ratePerSec));
      const burstStart = performance.now();
      let emitted = 0;
      while (performance.now() - burstStart < lane.durationMs) {
        if (turn) fx.rpc.emitDeltas(fx.rpc.primaryId, turn.id, 'assist-a', 1, 'Δ');
        emitted += 1;
        await page.waitForTimeout(intervalMs);
      }
      await page.waitForTimeout(100);
      const metrics = await browserMetrics(page, cdp);
      const typing = await measureTypingLatency(page, 20);
      const audit = await page.evaluate(() => (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__);
      const deltaTriggers = (audit?.sseTriggers ?? []).filter((t: any) => t.kind === 'message.delta');
      const snapshotDuring = snapshotRequests.length - beforeSnapshots;
      return {
        lane: { ratePerSec: lane.ratePerSec, durationMs: lane.durationMs, emitted },
        metrics,
        typingLatencyMs: summarize(typing, { minSamplesForP95: 10 }),
        sseDeltaCount: deltaTriggers.length,
        snapshotRequestsDuringBurst: snapshotDuring,
        browser_receive_render: 'UNMEASURED',
        note: 'browser_receive_render remains UNMEASURED without a shared monotonic clock across Hub emit and DOM paint.',
      };
    }));
  }

  out.push(await runBrowserScenario('TOOL_ACTIVITY_BURST', async fx => {
    fx.rpc.configureSingleThread({ turns: 1, messagesPerTurn: 2 });
    fx.rpc.afterTurnStart = (turnId) => fx.rpc.emitOwnedTurnLifecycle(turnId, { complete: false, deltaCount: 1 });
  }, async ({ page, cdp, fx }) => {
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await waitSchedulerIdle(page);
    await page.locator('#native-prompt').fill('tool burst');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForTimeout(150);
    const turn = fx.rpc.turns.find(t => t.status === 'inProgress') ?? fx.rpc.turns[0];
    if (turn) fx.rpc.emitToolBurst(fx.rpc.primaryId, turn.id, 12);
    await page.waitForTimeout(300);
    const metrics = await browserMetrics(page, cdp);
    const liveTools = await page.locator('[data-testid="tool-activity"], .tool-card, [data-live-kind^="tool"]').count().catch(async () =>
      page.locator('[data-live-kind]').count());
    return { metrics, liveToolDomApprox: liveTools };
  }));

  out.push(await runBrowserScenario('IDLE_LONG_SESSION', async fx => {
    fx.rpc.configureSingleThread({ turns: 2, messagesPerTurn: 2 });
  }, async ({ page, cdp }) => {
    await page.getByRole('button', { name: 'Connect session', exact: true }).click();
    await waitSchedulerIdle(page);
    const samples = [];
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(2500);
      samples.push(await browserMetrics(page, cdp));
    }
    // Visibility-style reconcile
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitSchedulerIdle(page);
    samples.push(await browserMetrics(page, cdp));
    return {
      samples,
      heapTrend: samples.map(s => s.jsHeapUsedBytes),
      snapshotTrend: samples.map(s => s.networkSnapshots),
    };
  }));

  return out;
}

async function main() {
  requireBuiltWeb();
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  const startedAt = new Date().toISOString();
  console.log(JSON.stringify({ phase: 'perf:local-audit', startedAt, artifactRoot: ARTIFACT_ROOT }));

  const adapter = await runAdapterBenchmarks();
  const browser = await runBrowserScenarios();

  const scenarios = {
    startedAt,
    finishedAt: new Date().toISOString(),
    adapterScenarios: Object.keys(adapter).filter(k => k === k.toUpperCase() || k.includes('_')),
    browserScenarios: browser.map(b => b.scenario),
    FUTURE_SCALE_SIMULATION: adapter.FUTURE_SCALE_SIMULATION,
  };

  const metrics = {
    startedAt,
    finishedAt: new Date().toISOString(),
    adapter,
    browser,
    claims: {
      browser_receive_render: 'UNMEASURED',
      timingClaimPolicy: 'median/p95 only from real wall-clock samples with adequate count',
    },
  };

  writeFileSync(path.join(ARTIFACT_ROOT, 'PERFORMANCE-SCENARIOS.json'), JSON.stringify(scenarios, null, 2));
  writeFileSync(path.join(ARTIFACT_ROOT, 'PERFORMANCE-METRICS.json'), JSON.stringify(metrics, null, 2));
  writeFileSync(path.join(ARTIFACT_ROOT, 'perf-local-audit-raw.json'), JSON.stringify({ adapter, browser }, null, 2));

  console.log(JSON.stringify({
    status: 'PERF_LOCAL_AUDIT_COMPLETE',
    browserScenarioCount: browser.length,
    discoveryRpcTotal: (adapter.DISCOVERY_FANOUT as any)?.rpcTotal,
    discoverySecondMetadataReads: (adapter.DISCOVERY_FANOUT as any)?.unchangedSecond?.metadataReads,
    discoveryMetadataReductionPct: (adapter.DISCOVERY_FANOUT as any)?.unchangedSecond?.metadataReadReductionPct,
    boundedHistoryOk: (adapter.CURRENT_BOUNDED_MAX_ADAPTER as any)?.bounds?.historyOk,
    liveOnlyPolicy: (adapter.COMMON_TURN_SNAPSHOT_FANOUT_POLICY as any)?.allLiveOnly,
    artifactRoot: ARTIFACT_ROOT,
  }, null, 2));
}

const code = await main().then(() => 0).catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  return 1;
});
process.exit(code);
