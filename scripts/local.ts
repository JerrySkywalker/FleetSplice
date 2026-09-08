import { fork, execFileSync, type ChildProcess } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { existsSync, mkdirSync, openSync, closeSync, writeSync, fsyncSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat, type Target } from '../packages/contracts/index.ts';
import type { EdgeConfig } from '../apps/edge/main.ts';
import type { HubConfig } from '../apps/hub/server.ts';

const durableWrite = (file: string, value: unknown) => {
  const fd = openSync(file, 'w', 0o600); try { writeSync(fd, canonical(value)); fsyncSync(fd); } finally { closeSync(fd); }
};
export async function launch(root: string, executable: string, port = 43155) {
  requireThat(process.version === 'v24.20.0', 'NODE_RUNTIME_UNQUALIFIED');
  requireThat(Number.isInteger(port) && port > 1024 && port < 65536, 'INVALID_PORT');
  const identity = await localIdentity(root);
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const base = path.join(process.env.LOCALAPPDATA!, 'FleetSplice', 'G05');
  mkdirSync(base, { recursive: true });
  // A protected local directory and one OS-owned Environment writer across ALL run directories.
  execFileSync('icacls.exe', [base, '/inheritance:r', '/grant:r', `*${identity.sid}:(OI)(CI)F`, '*S-1-5-18:(OI)(CI)F'], { windowsHide: true, stdio: 'ignore' });
  const lock = createServer();
  await new Promise<void>((resolve, reject) => { lock.once('error', reject); lock.listen(`\\\\.\\pipe\\fleetsplice-g05-${identity.sid}`, resolve); });
  const guardPath = path.join(base, 'environment-guard.json');
  if (existsSync(guardPath)) {
    const old = JSON.parse(readFileSync(guardPath, 'utf8'));
    requireThat(old.state === 'CLOSED' && old.nativeExitObserved === true && old.quiescent === true, 'RECOVERY_REQUIRED');
  }
  const runId = randomUUID(); const directory = path.join(base, runId); mkdirSync(directory);
  const target: Target = { authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: identity.rootIdentity, agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() };
  durableWrite(guardPath, { state: 'RUNNING', runId, target, identity, nativeExitObserved: false, quiescent: false });
  durableWrite(path.join(directory, 'admission.json'), { runId, target, identity, policy: 'windows-user.read-only', nativeContinuity: 'ephemeral-private-stdio', node: process.version });
  const hcpToken = randomBytes(32).toString('hex'); const bootstrapToken = randomBytes(32).toString('hex');
  // Capabilities are handed through private parent/child IPC, never argv, journals or native env.
  const env = { ...process.env }; for (const key of Object.keys(env)) if (/FLEETSPLICE|BOOTSTRAP|HCP_TOKEN/i.test(key)) delete env[key];
  const hubEnv = Object.fromEntries(Object.entries(env).filter(([key]) => ['SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'PATHEXT', 'COMSPEC', 'LOCALAPPDATA', 'USERPROFILE', 'APPDATA', 'COMPUTERNAME', 'USERNAME'].includes(key.toUpperCase())));
  const start = (file: string, childEnv: NodeJS.ProcessEnv): ChildProcess => fork(file, [], { cwd: installation, env: childEnv, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  const hub = start(path.join(installation, 'apps/hub/server.js'), hubEnv);
  let edge: ChildProcess | null = null;
  let closing = false;
  const wait = (child: ChildProcess, kind: string, timeout = 30000): Promise<any> => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${kind.toUpperCase()}_TIMEOUT`)), timeout);
    const handler = (message: any) => { if (message.kind === kind) { clearTimeout(timer); child.off('message', handler); resolve(message); }
      else if (message.kind === 'error') { clearTimeout(timer); child.off('message', handler); reject(new Error(message.code)); } };
    child.on('message', handler); child.once('error', reject);
  });
  const hubReady = wait(hub, 'hubListening');
  hub.send({ port, target, root: identity.root, sid: identity.sid, principal: identity.principal, sessionId: identity.sessionId, stateDirectory: directory, webDirectory: path.join(installation, 'web'), hcpToken, bootstrapToken } satisfies HubConfig);
  await hubReady;
  edge = start(path.join(installation, 'apps/edge/main.js'), env);
  const edgeReady = wait(edge, 'edgeReady'); edge.send({ port, target, identity, stateDirectory: directory, executable, hcpToken } satisfies EdgeConfig);
  await edgeReady;
  const stop = async (): Promise<boolean> => {
    if (closing) return false; closing = true;
    const closed = wait(edge!, 'edgeClosed', 25000); edge!.send({ kind: 'stop' });
    let proven = false;
    try { proven = (await closed).provenClosed === true; } catch { /* Preserve RUNNING guard on uncertain closure. */ }
    if (hub.connected) hub.send({ kind: 'stop' });
    if (proven) durableWrite(guardPath, { state: 'CLOSED', runId, target, identity, nativeExitObserved: true, quiescent: true });
    lock.close(); return proven;
  };
  hub.on('exit', () => { if (!closing && edge?.connected) edge.disconnect(); });
  return { url: `http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`, origin: `http://127.0.0.1:${port}`, directory, runId, target, identity, stop };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = (name: string) => args[args.indexOf(name) + 1];
  requireThat(args.includes('--workspace') && args.includes('--codex'), 'USAGE: --workspace ABSOLUTE_ROOT --codex PINNED_NATIVE_EXE');
  launch(option('--workspace')!, option('--codex')!).then(run => {
    // Interactive launcher output is the attended, one-use local bootstrap link.
    process.stdout.write(JSON.stringify({ kind: 'ready', ...run, stop: undefined }) + '\n');
    const close = () => { run.stop().then(proven => process.exit(proven ? 0 : 2)); };
    process.on('SIGINT', close); process.on('SIGTERM', close);
    process.stdin.setEncoding('utf8'); process.stdin.on('data', value => { if (String(value).trim() === 'stop') close(); });
  }).catch(error => { process.stderr.write(`${error instanceof Error ? error.message : 'START_FAILED'}\n`); process.exit(1); });
}
