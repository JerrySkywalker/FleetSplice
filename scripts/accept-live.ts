import { spawn, execFileSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { chromium, expect } from '@playwright/test';
import { requireThat, type Snapshot } from '../packages/contracts/index.ts';
import { CODEX_SHA256 } from '../packages/driver-codex/index.ts';

// Deliberately requires an attended, selected Workspace; no fixture or fallback driver.
const args = process.argv.slice(2);
const option = (name: string) => args[args.indexOf(name) + 1];
requireThat(args.includes('--workspace') && args.includes('--codex') && args.includes('--evidence'), 'LIVE_ACCEPTANCE_ARGUMENTS_REQUIRED');
const workspace = option('--workspace')!; const executable = option('--codex')!;
const evidence = path.resolve(option('--evidence')!); mkdirSync(evidence, { recursive: true });
requireThat(createHash('sha256').update(readFileSync(executable)).digest('hex') === CODEX_SHA256, 'NATIVE_ARTIFACT_CHANGED');
const git = (...arguments_: string[]) => execFileSync('git', arguments_, { encoding: 'utf8' }).trim();
const sha256 = (filename: string) => createHash('sha256').update(readFileSync(filename)).digest('hex');
const sourcePaths = git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(filename => /^(apps\/|packages\/|scripts\/|tests\/|tsconfig.*\.json$|package(?:-lock)?\.json$|AGENTS\.md$)/.test(filename));
const sourceFiles = Object.fromEntries(sourcePaths.sort().map(filename => [filename, sha256(filename)]));
const builtPaths = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(item => item.isDirectory() ? builtPaths(path.join(directory, item.name)) : [path.join(directory, item.name)]);
const buildFiles = Object.fromEntries(builtPaths('dist').sort().map(filename => [filename.replaceAll('\\', '/'), sha256(filename)]));
const source = { head: git('rev-parse', 'HEAD'), tree: git('rev-parse', 'HEAD^{tree}'), worktree: git('status', '--porcelain=v1'), sourceFiles, buildFiles };
const launcher = spawn(process.execPath, ['dist/scripts/local.js', '--workspace', workspace, '--codex', executable], { stdio: 'pipe', windowsHide: true });
let buffer = ''; let run: any; let launcherError = 'LOCAL_LAUNCH_FAILED';
launcher.stderr.on('data', bytes => { const text = String(bytes).trim(); if (/^[A-Z_]+$/.test(text)) launcherError = text; });
const ready = new Promise<any>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('LOCAL_LAUNCH_TIMEOUT')), 45000);
  launcher.stdout.on('data', bytes => { buffer += String(bytes); if (buffer.includes('\n')) {
    try { const message = JSON.parse(buffer.split('\n')[0]!); if (message.kind === 'ready') { clearTimeout(timer); buffer = ''; resolve(message); } } catch { /* Never echo a bootstrap capability. */ }
  } });
  launcher.once('exit', () => { clearTimeout(timer); reject(new Error(launcherError)); });
});
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
let success = false;
let stage = 'launch';
const observations: { at: string; cursor: string; state: string; assistantCharacters: number }[] = [];
const results: Record<string, unknown> = { evidenceClass: 'LIVE_SINGLE_HOST', browserOperation: 'AUTOMATED_REAL_BROWSER', mocksAllowed: false, source, startedAt: new Date().toISOString(), workspace, codexSha256: CODEX_SHA256 };
try {
  run = await ready; results.runId = run.runId; results.target = run.target; results.identity = run.identity; results.journalDirectory = run.directory;
  stage = 'browser';
  browser = await chromium.launch({ channel: 'msedge', headless: args.includes('--headless') });
  results.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1480, height: 960 } }); const page = await context.newPage();
  const browserErrors: string[] = []; page.on('pageerror', () => browserErrors.push('BROWSER_SCRIPT_ERROR'));
  page.on('response', async response => {
    if (response.url().endsWith('/api/snapshot') && response.status() === 200) {
      try {
        const value = await response.json() as Snapshot; const lane = value.lanes[0];
        observations.push({ at: new Date().toISOString(), cursor: value.cursor, state: lane?.state ?? 'EMPTY', assistantCharacters: lane?.transcript.filter(item => item.role === 'assistant').reduce((sum, item) => sum + item.text.length, 0) ?? 0 });
      } catch { /* Browser closing can abort an observation; never count it as proof. */ }
    }
  });
  await page.goto(run.url); run.url = undefined; await expect(page.getByTestId('connection-status')).toHaveText('READY');
  await page.getByRole('button', { name: 'Register selected Workspace' }).click();
  await expect(page.getByRole('button', { name: '＋ New session' })).toBeEnabled();
  await page.getByLabel('New session title').fill('G05 · SKYFORGE live Codex');
  await page.getByRole('button', { name: '＋ New session' }).click();
  await expect(page.getByTestId('lane-state')).toHaveText('EMPTY');
  await page.getByRole('button', { name: 'Acquire control' }).click();
  await expect(page.getByRole('button', { name: 'Continue session' })).toBeEnabled();
  stage = 'native-session-create'; await page.getByRole('button', { name: 'Continue session' }).click();
  await expect(page.getByTestId('lane-state')).toHaveText('IDLE', { timeout: 65000 });
  const marker = `FLEETSPLICE_${randomUUID().slice(0, 8)}`;
  stage = 'first-real-turn';
  await page.getByLabel('Message Codex').fill(`Remember the marker ${marker} in this conversation. Begin your reply with that marker, then write twelve short numbered sentences explaining why observing streamed output is useful. This is a harmless G05 acceptance conversation. Do not use tools, read files, write files, execute commands, or make network requests.`);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByTestId('assistant-text').first()).toContainText(marker, { timeout: 150000 });
  await expect(page.getByTestId('lane-state')).toHaveText('IDLE', { timeout: 150000 });
  await page.getByRole('button', { name: 'Continue session' }).click();
  await expect(page.getByRole('button', { name: 'Send message' })).toBeDisabled(); // Empty composer stays empty.
  await expect(page.getByRole('button', { name: 'Continue session' })).toBeEnabled();
  stage = 'continued-real-turn';
  await page.getByLabel('Message Codex').fill('What was the marker I supplied earlier in this same conversation? Begin with the exact marker, then write six brief sentences about continuing a session. Do not use tools, access files, execute commands, or make network requests.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByTestId('assistant-text').nth(1)).toContainText(marker, { timeout: 150000 });
  await expect(page.getByTestId('lane-state')).toHaveText('IDLE', { timeout: 150000 });
  stage = 'live-receipts';
  const database = new DatabaseSync(path.join(run.directory, 'edge.sqlite'), { readOnly: true });
  const rows = database.prepare('SELECT seq,kind,key,value FROM evidence ORDER BY seq').all().map(row => ({ seq: row.seq, kind: row.kind, key: row.key, value: JSON.parse(String(row.value)) }));
  const steps = database.prepare('SELECT value FROM records ORDER BY rowid').all().map(row => JSON.parse(String(row.value)));
  const nativeEvents = rows.filter(row => row.kind === 'NATIVE_EVENT');
  requireThat(rows.filter(row => row.kind === 'NATIVE_BINDING').length === 1, 'NATIVE_DUPLICATION');
  requireThat(rows.filter(row => row.kind === 'DISPATCH_ATTEMPT').length === 3, 'UNEXPECTED_DISPATCH_COUNT');
  const turns = nativeEvents.filter(row => row.value.kind === 'turnCompleted');
  requireThat(turns.length === 2 && turns.every(row => row.value.status === 'completed'), 'REAL_TURNS_NOT_COMPLETED');
  requireThat(new Set(turns.map(row => row.value.turnId)).size === 2 && new Set(turns.map(row => row.value.threadId)).size === 1, 'NATIVE_CONTINUITY_INVALID');
  requireThat(nativeEvents.filter(row => row.value.kind === 'delta').length > 2, 'REAL_STREAM_NOT_OBSERVED');
  requireThat(observations.some(item => item.state === 'RUNNING' && item.assistantCharacters > 0), 'BROWSER_STREAM_NOT_OBSERVED');
  requireThat(browserErrors.length === 0, 'BROWSER_SCRIPT_ERROR');
  results.marker = marker; results.nativeBinding = rows.find(row => row.kind === 'NATIVE_BINDING')!.value;
  results.processIdentity = rows.find(row => row.kind === 'NATIVE_PROCESS_IDENTITY')!.value;
  results.nativeInstance = steps.find(step => step.receipt.nativeInstanceId)?.receipt.nativeInstanceId;
  results.turns = turns.map(row => row.value); results.deltaCount = nativeEvents.filter(row => row.value.kind === 'delta').length;
  results.commandReceipts = steps.map(step => ({ commandId: step.command.command.commandId, planId: step.command.plan.planId, edgeCommandId: step.command.edgeCommandId, intentDigest: step.command.command.intentDigest, planDigest: step.command.planDigest, stepDigest: step.command.stepDigest, receipt: step.receipt }));
  results.transcript = await page.getByRole('log').innerText();
  await page.screenshot({ path: path.join(evidence, 'skyforge-browser.png'), fullPage: true });
  await page.getByRole('button', { name: 'Release control' }).click(); await expect(page.getByRole('button', { name: 'Acquire control' })).toBeEnabled();
  database.close(); success = true;
} catch { results.failedStage = stage; results.failure = stage === 'launch' ? launcherError : 'LIVE_ACCEPTANCE_FAILED'; }
finally {
  if (browser) await browser.close();
  const exit = new Promise<number | null>(resolve => { if (launcher.exitCode !== null) resolve(launcher.exitCode); else launcher.once('exit', resolve); });
  if (launcher.stdin.writable) launcher.stdin.write('stop\n');
  const closed = await Promise.race([exit, new Promise<null>(resolve => setTimeout(() => resolve(null), 30000))]);
  results.localClosureExitCode = closed; results.completedAt = new Date().toISOString();
  const unchanged = Object.entries(sourceFiles).every(([filename, hash]) => sha256(filename) === hash) && Object.entries(buildFiles).every(([filename, hash]) => sha256(filename) === hash);
  results.sourceUnchangedDuringRun = unchanged;
  results.result = success && closed === 0 && unchanged ? 'PASS' : 'FAIL';
  writeFileSync(path.join(evidence, 'live-result.json'), JSON.stringify(results, null, 2));
  writeFileSync(path.join(evidence, 'browser-observations.json'), JSON.stringify(observations, null, 2));
  process.stdout.write(JSON.stringify({ result: results.result, stage, evidence, nativeDeltaCount: results.deltaCount ?? 0, closure: closed }) + '\n');
  process.exitCode = results.result === 'PASS' ? 0 : 1;
}
