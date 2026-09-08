import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createConnection } from 'node:net';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { candidateCodexPaths, discoverCodex } from '../packages/local-operation/index.ts';
import { fleetspliceEntrypoint } from '../scripts/fleetsplice.ts';
import { supervisorEntrypoint } from '../scripts/supervisor.ts';

type ControlFile = { pipe: string; token: string; runId: string };
const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
async function eventually<T>(work: () => T | Promise<T>, description: string): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { return await work(); } catch (error) { last = error; await delay(100); }
  }
  throw new Error(`TIMED_OUT: ${description}: ${last instanceof Error ? last.message : 'unknown'}`);
}
const exits = (child: ReturnType<typeof spawn>) => new Promise<number | null>((resolve, reject) => { child.once('error', reject); child.once('exit', code => resolve(code)); });
async function control(detail: ControlFile, command: 'status' | 'stop'): Promise<any> {
  return await new Promise((resolve, reject) => {
    const socket = createConnection(detail.pipe); let response = ''; const timer = setTimeout(() => { socket.destroy(); reject(new Error('CONTROL_TIMEOUT')); }, 10000);
    socket.setEncoding('utf8'); socket.once('error', error => { clearTimeout(timer); reject(error); }); socket.on('data', value => { response += value; });
    socket.on('end', () => { clearTimeout(timer); try { resolve(JSON.parse(response)); } catch { reject(new Error('CONTROL_RESPONSE_INVALID')); } });
    socket.on('connect', () => socket.write(`${JSON.stringify({ token: detail.token, command })}\n`));
  });
}

test('actual start preflight failure creates no guard before runtime commit', () => {
  assert.equal(typeof fleetspliceEntrypoint, 'function');
  const localAppData = mkdtempSync(path.join(tmpdir(), 'fleetsplice-cli-preflight-'));
  const cli = path.join(process.cwd(), 'test-results', 'compiled', 'scripts', 'fleetsplice.js');
  const child = spawnSync(process.execPath, [cli, 'start'], { cwd: process.cwd(), env: { ...process.env, LOCALAPPDATA: localAppData, HTTPS_PROXY: 'http://127.0.0.1:1', HTTP_PROXY: 'http://127.0.0.1:1', ALL_PROXY: 'http://127.0.0.1:1' }, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  assert.notEqual(child.status, 0); assert.match(`${child.stdout}\n${child.stderr}`, /PRECHECK_FAILED/);
  assert.equal(existsSync(path.join(localAppData, 'FleetSplice', 'G05', 'environment-guard.json')), false);
});

test('detached supervisor keeps one local writer, serves a second terminal, and only closes after proven shutdown', async () => {
  assert.equal(typeof supervisorEntrypoint, 'function');
  const localAppData = mkdtempSync(path.join(tmpdir(), 'fleetsplice-supervisor-appdata-'));
  const workspace = mkdtempSync(path.join(tmpdir(), 'fleetsplice-supervisor-workspace-'));
  const executable = discoverCodex(candidateCodexPaths()).path;
  const supervisor = path.join(process.cwd(), 'test-results', 'compiled', 'scripts', 'supervisor.js');
  const supervisorLauncher = path.join(process.cwd(), 'scripts', 'start-supervisor.ps1');
  const env = { ...process.env, LOCALAPPDATA: localAppData };
  const bootstrapDirectory = path.join(localAppData, 'FleetSplice', 'G05'); mkdirSync(bootstrapDirectory, { recursive: true });
  const bootstrap = path.join(bootstrapDirectory, 'supervisor-bootstrap.json'); writeFileSync(bootstrap, JSON.stringify({ taskName: `FleetSplice-G05-${randomUUID()}`, node: process.execPath, supervisor, workspace, codex: executable, localAppData, environment: {}, diagnosticPath: path.join(bootstrapDirectory, 'task-debug.txt') }));
  const detachedLauncher = spawn('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', supervisorLauncher, '-Bootstrap', bootstrap], { cwd: process.cwd(), env, stdio: 'ignore', windowsHide: true });
  const guardPath = path.join(localAppData, 'FleetSplice', 'G05', 'environment-guard.json');
  let detail: ControlFile | null = null;
  try {
    assert.equal(await exits(detachedLauncher), 0, 'launcher exited while its detached supervisor remained available');
    detail = await eventually(() => {
      const guard = JSON.parse(readFileSync(guardPath, 'utf8')) as { runId: string };
      return JSON.parse(readFileSync(path.join(localAppData, 'FleetSplice', 'G05', guard.runId, 'control.json'), 'utf8')) as ControlFile;
    }, 'supervisor control publication');
    const first = await eventually(async () => { const state = await control(detail!, 'status'); assert.equal(state.code, 'RUNNING'); return state; }, 'first healthy control status');
    assert.equal(first.code, 'RUNNING'); assert.equal(first.hub, 'RUNNING'); assert.equal(first.edge, 'RUNNING'); assert.equal(first.nativeCodex, 'NOT_STARTED');
    const before = readFileSync(guardPath);
    const duplicate = spawn(process.execPath, [supervisor, '--workspace', workspace, '--codex', executable], { cwd: process.cwd(), env, stdio: 'ignore', windowsHide: true });
    assert.notEqual(await exits(duplicate), 0, 'second supervisor cannot acquire the user-local control writer');
    assert.deepEqual(readFileSync(guardPath), before, 'duplicate start did not create a second run');
    const edgePath = path.join(localAppData, 'FleetSplice', 'G05', detail.runId, 'edge.sqlite'); const statusBefore = readFileSync(edgePath); const guardBefore = readFileSync(guardPath);
    const cli = path.join(process.cwd(), 'test-results', 'compiled', 'scripts', 'fleetsplice.js');
    for (const command of ['status', 'doctor']) {
      const result = spawnSync(process.execPath, [cli, command, '--workspace', workspace], { cwd: process.cwd(), env, encoding: 'utf8', windowsHide: true, timeout: 20000 });
      assert.equal(result.status, 0); assert.match(result.stdout, /FleetSplice/);
    }
    assert.deepEqual(readFileSync(guardPath), guardBefore, 'status and doctor are read-only'); assert.deepEqual(readFileSync(edgePath), statusBefore, 'status and doctor never mutate Edge evidence');
    const secondTerminal = await control(detail, 'status'); assert.equal(secondTerminal.code, 'RUNNING');
    const stopped = await control(detail, 'stop'); assert.equal(stopped.code, 'CLOSED'); assert.equal(stopped.nativeExitObserved, true);
    await eventually(() => {
      const guard = JSON.parse(readFileSync(guardPath, 'utf8')) as { state: string; nativeExitObserved: boolean; quiescent: boolean };
      assert.equal(guard.state, 'CLOSED'); assert.equal(guard.nativeExitObserved, true); assert.equal(guard.quiescent, true); return guard;
    }, 'proven closed guard');
    const postStop = spawnSync(process.execPath, [cli, 'status', '--workspace', workspace], { cwd: process.cwd(), env, encoding: 'utf8', windowsHide: true, timeout: 20000 });
    assert.equal(postStop.status, 0); assert.match(postStop.stdout, /FleetSplice: STOPPED/); assert.doesNotMatch(postStop.stdout, /RECOVERY_REQUIRED/);
  } finally {
    if (detail) { try { await control(detail, 'stop'); } catch { /* The normal assertion path has already stopped it. */ } }
  }
});
