import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AgentSupervisedNativeServer, proveSupervisedEndpoint } from '../apps/edge/supervised-native-server.ts';

const executable = process.env.FLEETSPLICE_P02_CODEX_EXE;
const nativeHome = process.env.FLEETSPLICE_P02_NATIVE_HOME;
const enabled = process.platform === 'win32' && !!executable && !!nativeHome && !!process.env.LOCALAPPDATA;
const skipped = { skip: !enabled && 'requires the Owner-authorized local Codex executable and native home' };
const live = () => {
  assert.ok(executable && nativeHome && process.env.LOCALAPPDATA);
  const directory = path.join(process.env.LOCALAPPDATA, `FspP02-${randomUUID().slice(0, 8)}`);
  const workspace = mkdtempSync(path.join(tmpdir(), 'fleet-p02-'));
  const options = {
    executable, workspace, directory,
    environment: { ...process.env, CODEX_HOME: nativeHome, FLEETSPLICE_P02_TEST_SECRET: 'P02_PRIVATE_TEST_VALUE' },
  };
  const cleanup = () => {
    assert.equal(path.dirname(directory).toLowerCase(), path.resolve(process.env.LOCALAPPDATA!).toLowerCase());
    rmdirSync(directory); rmdirSync(workspace);
  };
  return { options, cleanup };
};
const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };

test('real start, readiness, exact identity, conflicting owner, fresh restart and clean Agent shutdown', skipped, async () => {
  const { options, cleanup } = live();
  const server = new AgentSupervisedNativeServer(options);
  const rival = new AgentSupervisedNativeServer(options);
  let firstPid = 0; let secondPid = 0;
  try {
    const first = await server.start(); firstPid = first.processId;
    assert.equal(server.assertCurrent(first).processId, firstPid);
    assert.match(first.processCreationTime, /^\d+$/);
    assert.match(first.endpointIdentity, /:\d+$/);
    assert.match(first.sha256!, /^[a-f0-9]{64}$/);
    assert.equal(path.resolve(first.executablePath!).toLowerCase(), path.resolve(executable!).toLowerCase());
    await assert.rejects(rival.start(), /NATIVE_SUPERVISED_OWNER_CONFLICT/);
    assert.equal(server.assertCurrent(first).processId, firstPid);
    const command = execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', `(Get-CimInstance Win32_Process -Filter 'ProcessId=${firstPid}').CommandLine`],
      { encoding: 'utf8', windowsHide: true });
    assert.match(command, /app-server --listen unix:\/\//);
    assert.doesNotMatch(command, /Bearer|capability-token|P02_PRIVATE_TEST_VALUE|sk-[A-Za-z0-9]/i);
    assert.doesNotMatch(JSON.stringify(first), /P02_PRIVATE_TEST_VALUE/);
    const second = await server.restart(); secondPid = second.processId;
    assert.notEqual(first.serverIncarnation, second.serverIncarnation);
    assert.notEqual(first.endpointIdentity, second.endpointIdentity);
    assert.throws(() => server.assertCurrent(first), /NATIVE_SUPERVISED_STALE_INCARCATION/);
    assert.equal(server.assertCurrent(second).processId, secondPid);
  } finally {
    assert.equal(await server.stop(), true);
    assert.equal(alive(firstPid), false); assert.equal(alive(secondPid), false);
    cleanup();
  }
});

test('crash before readiness cleans the exact child, endpoint and owner lock', skipped, async () => {
  const { options, cleanup } = live();
  let pid = 0;
  const server = new AgentSupervisedNativeServer({ ...options, ready: async identity => {
    pid = identity.processId; throw new Error('P02_INJECTED_READY_FAILURE');
  } });
  await assert.rejects(server.start(), /P02_INJECTED_READY_FAILURE/);
  assert.equal(server.current, null);
  assert.equal(alive(pid), false);
  assert.equal(existsSync(path.join(options.directory, 'owner.lock')), false);
  cleanup();
});

test('forced child exit is fenced and cleaned without an orphan', skipped, async () => {
  const { options, cleanup } = live();
  const server = new AgentSupervisedNativeServer(options);
  const identity = await server.start();
  try {
    process.kill(identity.processId);
    for (let attempt = 0; attempt < 40 && alive(identity.processId); attempt++)
      await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(alive(identity.processId), false);
    assert.throws(() => server.assertCurrent(identity), /NATIVE_SUPERVISED_NOT_RUNNING|NATIVE_SUPERVISED_IDENTITY_UNPROVABLE/);
  } finally {
    assert.equal(await server.stop(), true);
    cleanup();
  }
});

test('endpoint and owner substitution are rejected before use', skipped, async () => {
  const { options, cleanup } = live();
  let drift: 'endpoint' | 'owner' | null = null;
  const server = new AgentSupervisedNativeServer({ ...options, proof: (...args) => {
    const observed = proveSupervisedEndpoint(...args);
    return drift === 'endpoint' ? { ...observed, endpointCreationTime: String(BigInt(observed.endpointCreationTime) + 1n) }
      : drift === 'owner' ? { ...observed, ownerSid: 'S-1-5-21-0' } : observed;
  } });
  const identity = await server.start();
  try {
    drift = 'endpoint'; assert.throws(() => server.assertCurrent(identity), /NATIVE_SUPERVISED_IDENTITY_DRIFT/);
    drift = 'owner'; assert.throws(() => server.assertCurrent(identity), /NATIVE_SUPERVISED_IDENTITY_DRIFT/);
    drift = null; assert.equal(server.assertCurrent(identity).processId, identity.processId);
  } finally {
    assert.equal(await server.stop(), true);
    cleanup();
  }
});
