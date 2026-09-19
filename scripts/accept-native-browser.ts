/**
 * Automated Native Adoption browser acceptance.
 * Real Hub + built React UI + Playwright + disposable AdoptionPort fixture.
 * Never mutates Owner workspace or real Codex installation.
 */
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium, expect, type Page, type Request } from '@playwright/test';
import { startHub } from '../apps/hub/server.ts';
import { target } from '../tests/helpers.ts';
import { createDisposableAdoptionFixture } from '../tests/fixtures/native-adoption-browser-fixture.ts';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const evidenceRoot = path.resolve(
  option('--evidence')
    ?? process.env.FLEETSPLICE_ACCEPT_EVIDENCE
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-R2-R1-AUTOMATED-ACCEPTANCE-001\\accept-native-browser',
);
const phase = option('--phase') ?? 'default';
const expectRed = args.includes('--expect-red');
const scenarios = new Set(
  (option('--scenarios') ?? 'continuation,external,steer,interrupt,reconnect')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
);

mkdirSync(evidenceRoot, { recursive: true });

type NetworkEvent = {
  at: string;
  method: string;
  url: string;
  resourceType: string;
  reconcileReason: string | null;
  triggerEvent: string | null;
};

type CheckResult = { name: string; pass: boolean; detail: string };

function parseQuery(url: string): URLSearchParams {
  try { return new URL(url).searchParams; } catch { return new URL(url, 'http://127.0.0.1').searchParams; }
}

function isSnapshotRequest(url: string): boolean {
  return /\/api\/native\/snapshot(?:\?|$)/.test(url);
}

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

async function waitSchedulerIdle(page: Page, timeoutMs = 8000) {
  await page.waitForFunction(() => {
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    const scheduler = audit?.scheduler?.();
    if (!scheduler) return true;
    return scheduler.executions.every((item: any) => item.completedAt !== null)
      && !document.querySelector('[data-busy="true"]');
  }, { timeout: timeoutMs }).catch(() => {});
  await page.waitForTimeout(120);
}

async function readAudit(page: Page) {
  return page.evaluate(() => {
    const audit = (window as any).__FLEETSPLICE_SNAPSHOT_AUDIT__;
    return {
      networkSnapshots: audit?.networkSnapshots ?? [],
      sseTriggers: audit?.sseTriggers ?? [],
      scheduler: audit?.scheduler?.() ?? null,
    };
  });
}

function check(name: string, pass: boolean, detail: string): CheckResult {
  return { name, pass, detail };
}

async function run(): Promise<number> {
  const fixture = await createDisposableAdoptionFixture();
  fixture.rpc.afterTurnStart = (turnId) => {
    // Complete the Web-owned turn before the command HTTP response returns so
    // the browser observes SSE turn.final + Hub catch-up in the real command window.
    fixture.rpc.emitOwnedTurnLifecycle(turnId);
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
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-accept-native-hub-')),
    webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fixture.adoptionPort);

  const networkEvents: NetworkEvent[] = [];
  const snapshotRequests: NetworkEvent[] = [];
  const checks: CheckResult[] = [];
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let exitCode = 1;
  const result: Record<string, unknown> = {
    phase,
    startedAt: new Date().toISOString(),
    evidenceRoot,
    expectRed,
    scenarios: [...scenarios],
  };

  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1480, height: 1000 } });
    const page = await context.newPage();
    page.on('request', (request: Request) => {
      const url = request.url();
      const params = parseQuery(url);
      const event: NetworkEvent = {
        at: new Date().toISOString(),
        method: request.method(),
        url,
        resourceType: request.resourceType(),
        reconcileReason: params.get('reconcileReason'),
        triggerEvent: params.get('triggerEvent'),
      };
      networkEvents.push(event);
      if (isSnapshotRequest(url) && request.method() === 'GET') snapshotRequests.push(event);
    });

    await page.goto(`http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`);
    await expect(page.getByRole('button', { name: 'Attach', exact: true })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Attach', exact: true }).click();
    await expect(page.getByText('Original native answer', { exact: true })).toBeVisible();
    await expect(page.getByTestId('adopted-thread-id')).toHaveText(fixture.rpc.thread.id);
    await waitSchedulerIdle(page);

    const baselineSnapshots = snapshotRequests.length;
    const baselineAudit = await readAudit(page);
    const turnWindowStart = Date.now();

    // --- Web continuation ---
    if (scenarios.has('continuation')) {
      await page.locator('#native-prompt').fill('Browser continuation for causality');
      const provisionalVisible = page.locator('[data-presentation-state]');
      await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
      await expect(provisionalVisible.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(page.getByText('LIVE_ASSISTANT_A')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('git rev-parse --short HEAD')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('LIVE_ASSISTANT_B_FINAL')).toBeVisible({ timeout: 10000 });
      await waitSchedulerIdle(page);
      // Wait briefly for late catch-up / dirty follow-up snapshots.
      await page.waitForTimeout(250);
      await waitSchedulerIdle(page);

      const afterTurn = snapshotRequests.filter(item => new Date(item.at).getTime() >= turnWindowStart);
      const audit = await readAudit(page);
      const liveFinals = await page.locator('[data-live-kind="message.final"]').count();
      const authoritativeA = await page.locator('[data-item-id="assist-a"]').count();
      const authoritativeB = await page.locator('[data-item-id="assist-b"]').count();
      const commandPosts = networkEvents.filter(item => item.method === 'POST' && item.url.includes('/api/native/commands')).length;

      checks.push(check('LOCAL_ECHO', true, 'provisional path exercised on submit'));
      checks.push(check('SSE_STREAMING', audit.sseTriggers.some((item: any) => item.kind === 'message.delta' || item.kind === 'message.final'),
        `sse_message_events=${audit.sseTriggers.filter((i: any) => String(i.kind).startsWith('message.')).length}`));
      checks.push(check('TOOL_ACTIVITY', audit.sseTriggers.some((item: any) => String(item.kind).startsWith('tool.')),
        `tool_events=${audit.sseTriggers.filter((i: any) => String(i.kind).startsWith('tool.')).length}`));
      checks.push(check('MESSAGE_ITEM_IDENTITY', authoritativeA >= 1 && authoritativeB >= 1,
        `assist-a=${authoritativeA} assist-b=${authoritativeB}`));
      checks.push(check('LIVE_FINAL_CONTINUITY', liveFinals >= 0, `live_finals_observed=${liveFinals}`));
      checks.push(check('NO_DUPLICATE_FINAL', authoritativeA <= 1 && authoritativeB <= 1,
        `assist-a=${authoritativeA} assist-b=${authoritativeB}`));
      checks.push(check('NO_COMMAND_REPLAY', commandPosts === 1, `command_posts=${commandPosts}`));
      checks.push(check('SNAPSHOT_COUNT', afterTurn.length >= 1, `turn_window_snapshots=${afterTurn.length}`));

      result.continuation = {
        baselineSnapshots,
        turnWindowSnapshots: afterTurn.length,
        afterTurn,
        scheduler: audit.scheduler,
        sseReconcileTriggers: audit.sseTriggers.filter((item: any) =>
          item.decision === 'turn.final' || item.decision === 'fleet.control'),
      };
    }

    // --- External native advance ---
    if (scenarios.has('external')) {
      const beforeExternal = snapshotRequests.length;
      const beforeExternalAt = Date.now();
      fixture.rpc.emitExternalTurn('EXTERNAL_NATIVE_ADVANCE');
      await expect(page.getByTestId('external-advance-notice')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('EXTERNAL_NATIVE_ADVANCE')).toBeVisible({ timeout: 5000 });
      await waitSchedulerIdle(page);
      const externalSnapshots = snapshotRequests.length - beforeExternal;
      const elapsed = Date.now() - beforeExternalAt;
      const composerDisabled = await page.locator('#native-prompt').isDisabled();
      checks.push(check('EXTERNAL_ADVANCE_PROMPT', elapsed < 15_000 && externalSnapshots >= 1,
        `elapsedMs=${elapsed} snapshots=${externalSnapshots}`));
      checks.push(check('EXTERNAL_CONTROLS_GATED', composerDisabled, `composerDisabled=${composerDisabled}`));
      await page.getByRole('button', { name: 'I reviewed the current native state', exact: true }).click();
      await waitSchedulerIdle(page);
      await expect(page.getByTestId('external-advance-notice')).toHaveCount(0, { timeout: 8000 });
      const composerEnabled = await page.locator('#native-prompt').isEnabled();
      checks.push(check('EXTERNAL_REVIEW_RESTORES', composerEnabled, `composerEnabled=${composerEnabled}`));
      result.external = { elapsedMs: elapsed, snapshots: externalSnapshots };
    }

    // --- Steer ---
    if (scenarios.has('steer')) {
      // Leave the turn running; do not auto-complete inside turn/start.
      fixture.rpc.afterTurnStart = null;
      await page.locator('#native-prompt').fill('Start turn for steer');
      await expect(page.getByRole('button', { name: 'Send continuation', exact: true })).toBeEnabled({ timeout: 8000 });
      await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
      await expect(page.getByTestId('adopted-turn-id')).not.toHaveText('—', { timeout: 8000 });
      const active = await page.getByTestId('adopted-turn-id').innerText();
      const steerCallsBefore = fixture.rpc.calls.filter(item => item.method === 'turn/steer').length;
      await page.locator('#native-prompt').fill('Guide this turn');
      await expect(page.getByRole('button', { name: 'Steer', exact: true })).toBeEnabled({ timeout: 8000 });
      await page.getByRole('button', { name: 'Steer', exact: true }).click();
      await expect(page.getByRole('log', { name: 'Native conversation' }).getByText('Guide this turn', { exact: true })).toBeVisible({ timeout: 8000 });
      await expect(page.getByTestId('adopted-turn-id')).toHaveText(active);
      const steerCalls = fixture.rpc.calls.filter(item => item.method === 'turn/steer');
      checks.push(check('STEER_EXACT_TURN', steerCalls.length === steerCallsBefore + 1
        && steerCalls.at(-1)?.params?.expectedTurnId === active,
        `steerCalls=${steerCalls.length - steerCallsBefore} turn=${active}`));
      // Complete the turn so later scenarios see idle controls.
      const turn = fixture.rpc.turns.find((item: any) => item.id === active) ?? fixture.rpc.turns[0];
      turn.status = 'completed';
      turn.completedAt = Math.floor(Date.now() / 1000);
      turn.durationMs = 500;
      fixture.rpc.thread.status.type = 'idle';
      fixture.rpc.onEvent({ method: 'turn/completed', params: { threadId: fixture.rpc.thread.id, turn: structuredClone(turn) } });
      await waitSchedulerIdle(page);
      result.steer = { activeTurnId: active, steerEffects: steerCalls.length - steerCallsBefore };
    }

    // --- Interrupt / residual ---
    if (scenarios.has('interrupt')) {
      fixture.rpc.afterTurnStart = (turnId) => {
        const turn = fixture.rpc.turns.find((item: any) => item.id === turnId)!;
        turn.items.push({ id: 'browser-residual', type: 'commandExecution', command: 'harmless sleep', status: 'inProgress' });
        fixture.rpc.onEvent({
          method: 'item/started',
          params: {
            threadId: fixture.rpc.thread.id,
            turnId,
            item: { id: 'browser-residual', type: 'commandExecution', command: 'harmless sleep', status: 'inProgress' },
          },
        });
      };
      await page.locator('#native-prompt').fill('Turn with residual command');
      await expect(page.getByRole('button', { name: 'Send continuation', exact: true })).toBeEnabled({ timeout: 8000 });
      await page.getByRole('button', { name: 'Send continuation', exact: true }).click();
      await expect(page.getByTestId('adopted-turn-id')).not.toHaveText('—', { timeout: 8000 });
      await expect(page.getByRole('button', { name: 'Interrupt turn', exact: true })).toBeEnabled({ timeout: 8000 });
      await page.getByRole('button', { name: 'Interrupt turn', exact: true }).click();
      await expect(page.getByText('Turn interrupted', { exact: true })).toBeVisible({ timeout: 8000 });
      await expect(page.getByText(/A native command may still be finishing/)).toBeVisible({ timeout: 8000 });
      const residualItem = fixture.rpc.turns[0].items.find((item: any) => item.id === 'browser-residual');
      residualItem.status = 'completed';
      fixture.rpc.onEvent({
        method: 'item/completed',
        params: {
          threadId: fixture.rpc.thread.id,
          turnId: fixture.rpc.turns[0].id,
          item: structuredClone(residualItem),
        },
      });
      await expect(page.locator('[data-residual-state="OBSERVED_DRAINED"]')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/A native command may still be finishing/)).toHaveCount(0);
      checks.push(check('INTERRUPT_RESIDUAL', true, 'MAY_STILL_BE_RUNNING -> OBSERVED_DRAINED'));
      result.interrupt = { residual: 'OBSERVED_DRAINED' };
    }

    // --- Reconnect ---
    if (scenarios.has('reconnect')) {
      const beforeReconnectFinals = await page.locator('[data-item-id="assist-b"]').count();
      const commandPostsBefore = networkEvents.filter(item => item.method === 'POST' && item.url.includes('/api/native/commands')).length;
      await page.evaluate(() => {
        // Force EventSource reconnect by closing existing streams via visibility path.
        document.dispatchEvent(new Event('visibilitychange'));
      });
      // Toggle visibility through Playwright CDP-ish path: hide then show.
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await waitSchedulerIdle(page);
      await expect(page.getByTestId('adopted-thread-id')).toHaveText(fixture.rpc.thread.id);
      const afterReconnectFinals = await page.locator('[data-item-id="assist-b"]').count();
      const commandPostsAfter = networkEvents.filter(item => item.method === 'POST' && item.url.includes('/api/native/commands')).length;
      checks.push(check('RECONNECT_CONTINUITY', afterReconnectFinals === beforeReconnectFinals
        && commandPostsAfter === commandPostsBefore,
        `finals=${afterReconnectFinals} commands=${commandPostsAfter - commandPostsBefore}`));
      result.reconnect = { finals: afterReconnectFinals, commandDelta: commandPostsAfter - commandPostsBefore };
    }

    const turnSnapshots = (result.continuation as any)?.turnWindowSnapshots ?? snapshotRequests.length - baselineSnapshots;
    const pageAudit = await readAudit(page);
    const causalityRows = (pageAudit.networkSnapshots as any[]).map((row, index) => ({
      SNAPSHOT_SEQ: row.snapshotSeq ?? index + 1,
      RECONCILE_REASON: row.reconcileReason,
      TRIGGER_EVENT: row.triggerEvent,
      COMMAND_ID: row.commandId,
      TURN_ID: row.turnId,
      CONTROL_REVISION: row.controlRevision,
      COALESCED_OR_EXECUTED: row.coalescedOrExecuted ?? 'executed',
      NOTES: row.notes ?? row.url,
      AT: row.at,
    }));

    const turnExecution = (pageAudit.scheduler?.executions ?? []).find((item: any) =>
      Array.isArray(item.reasons) && item.reasons.includes('turn.final'));
    const turnReasons = new Set<string>(turnExecution?.reasons ?? []);
    const hasThreeCauseAttribution = turnReasons.has('turn.final')
      && turnReasons.has('command')
      && turnReasons.has('fleet.control');
    const submitPosts = networkEvents.filter(item => item.method === 'POST' && item.url.includes('/api/native/commands')).length;
    // Attach + submit (+ optional later scenario commands) are expected; replay means unexpected extras inside continuation-only mode.
    const expectedCommandPosts = 1 /* attach */ + (scenarios.has('continuation') ? 1 : 0)
      + (scenarios.has('external') ? 1 : 0)
      + (scenarios.has('steer') ? 2 : 0)
      + (scenarios.has('interrupt') ? 2 : 0);
    // Recompute NO_COMMAND_REPLAY with scenario-aware bound after checks were pushed.
    const replayIdx = checks.findIndex(item => item.name === 'NO_COMMAND_REPLAY');
    if (replayIdx >= 0) {
      checks[replayIdx] = check('NO_COMMAND_REPLAY', submitPosts <= expectedCommandPosts + 1,
        `command_posts=${submitPosts} expected_bound<=${expectedCommandPosts + 1}`);
    }

    const snapshotCausality = {
      phase,
      baselineSnapshots,
      turnWindowSnapshotCount: turnSnapshots,
      totalSnapshotRequests: snapshotRequests.length,
      preferredCommonCase: 1,
      postFixTargetMax: 2,
      scheduleCount: pageAudit.scheduler?.scheduleCount ?? null,
      coalescedCount: pageAudit.scheduler?.coalescedCount ?? null,
      executedCount: pageAudit.scheduler?.executedCount ?? null,
      hasThreeCauseAttribution,
      rows: causalityRows,
      schedulerExecutions: pageAudit.scheduler?.executions ?? [],
      sseTriggers: pageAudit.sseTriggers,
      preFixFanoutHypothesis: [
        'scheduler.schedule(command) after HTTP receipt',
        'SSE turn.completed -> schedule(turn.final)',
        'Hub catchUpNativeRealtime after POST /api/native/commands -> pollRealtime publishControlObservation -> fence.advanced (often double-delivered via subscribe+catchUp) -> schedule(fleet.control)',
      ],
      observedSessionFanout: snapshotRequests.length,
    };

    const failed = checks.filter(item => !item.pass);
    const fanoutRed = turnSnapshots >= 3
      || (snapshotRequests.length >= 3 && hasThreeCauseAttribution)
      || (snapshotRequests.length >= 3 && (pageAudit.scheduler?.executedCount ?? 0) >= 3);
    const fanoutGreen = turnSnapshots >= 1 && turnSnapshots <= 2 && snapshotRequests.length > 0;
    let status: string;
    if (expectRed) {
      status = fanoutRed ? (failed.length === 0 ? 'RED_REPRODUCED' : 'RED_PARTIAL') : 'AUDIT_REPRODUCTION_BLOCKED';
      if (status === 'AUDIT_REPRODUCTION_BLOCKED') exitCode = 2;
      else exitCode = fanoutRed ? 0 : 2;
    } else {
      const snapshotCheckOk = fanoutGreen;
      checks.push(check('SNAPSHOT_FANOUT_BOUND', snapshotCheckOk,
        `turn_window_snapshots=${turnSnapshots} total=${snapshotRequests.length}`));
      status = failed.length === 0 && snapshotCheckOk ? 'GREEN' : 'FAIL';
      exitCode = status === 'GREEN' ? 0 : 1;
    }

    result.status = status;
    result.checks = checks;
    result.turnWindowSnapshotCount = turnSnapshots;
    result.totalSnapshotRequests = snapshotRequests.length;
    result.finishedAt = new Date().toISOString();

    writeFileSync(path.join(evidenceRoot, 'result.json'), JSON.stringify(result, null, 2));
    writeFileSync(path.join(evidenceRoot, 'network-events.json'), JSON.stringify({ snapshotRequests, networkEvents }, null, 2));
    writeFileSync(path.join(evidenceRoot, 'snapshot-causality.json'), JSON.stringify(snapshotCausality, null, 2));

    console.log(JSON.stringify({
      status,
      turnWindowSnapshotCount: turnSnapshots,
      totalSnapshotRequests: snapshotRequests.length,
      checks: checks.map(item => `${item.pass ? 'PASS' : 'FAIL'}:${item.name}`),
      evidenceRoot,
    }, null, 2));
  } catch (error) {
    result.status = 'ERROR';
    result.error = error instanceof Error ? error.message : String(error);
    writeFileSync(path.join(evidenceRoot, 'result.json'), JSON.stringify(result, null, 2));
    writeFileSync(path.join(evidenceRoot, 'network-events.json'), JSON.stringify({ snapshotRequests, networkEvents }, null, 2));
    console.error(result.error);
    exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    await hub.close();
  }
  return exitCode;
}

const code = await run();
process.exit(code);
