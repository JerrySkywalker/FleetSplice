import { fork, execFileSync, type ChildProcess } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, openSync, closeSync, writeSync, fsyncSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat, type Target } from '../packages/contracts/index.ts';
import { assertFreshIncarnation, classifyPredecessor, edgeAdmissionState, guardPath, preserveGuardForRun, type Guard } from '../packages/local-operation/index.ts';
import type { EdgeConfig } from '../apps/edge/main.ts';
import type { NativeServerCustody } from '../packages/native-adoption/types.ts';
import type { HubConfig } from '../apps/hub/server.ts';
import { workspaceBindings } from '../packages/workspaces/index.ts';
import { defaultRuntimeSharing, type RuntimeSharing } from '../packages/agent-runtime/index.ts';

const durableWrite = (file: string, value: unknown) => {
  const fd = openSync(file, 'w', 0o600); try { writeSync(fd, canonical(value)); fsyncSync(fd); } finally { closeSync(fd); }
};
const onceExit = (child: ChildProcess, timeout: number) => new Promise<boolean>(resolve => {
  if (child.exitCode !== null) { resolve(true); return; }
  const timer = setTimeout(() => resolve(false), timeout);
  child.once('exit', () => { clearTimeout(timer); resolve(true); });
  child.once('error', () => { clearTimeout(timer); resolve(false); });
});
export type LaunchOptions = { environment?: NodeJS.ProcessEnv; onGuardCommitted?: (guard: Guard) => Promise<void> | void; productPath?: 'NATIVE_ADOPTION' | 'LEGACY_MANAGED_LOCAL_ONLY'; nativeServerCustody?: NativeServerCustody; runtimeSharing?: RuntimeSharing; hostIdentity?: Pick<Target, 'hostId' | 'hostGeneration' | 'environmentId' | 'environmentGeneration'>; enrollment?: EdgeConfig['enrollment']; /** Deployment carriage is explicit: listener bind never becomes public identity. */ transport?: Pick<HubConfig, 'deployment' | 'listener'> & Pick<EdgeConfig, 'hcpUrl' | 'testTlsCaPem'> };

// Internal lifecycle primitive. G05B starts it only from the detached local
// supervisor after all no-effect qualification has passed.
export async function launch(root: string, executable: string, port = 43155, options: LaunchOptions = {}) {
  const productPath = options.productPath ?? 'NATIVE_ADOPTION';
  const runtimeSharing = options.runtimeSharing ?? defaultRuntimeSharing();
  const environment = { ...(options.environment ?? process.env) };
  requireThat(process.version === 'v24.20.0' && process.versions.sqlite === '3.53.4', 'NODE_RUNTIME_UNQUALIFIED');
  requireThat(Number.isInteger(port) && port > 1024 && port < 65536, 'INVALID_PORT');
  const identity = await localIdentity(root);
  const target: Target = { authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: options.hostIdentity?.hostId ?? randomUUID(), hostGeneration: options.hostIdentity?.hostGeneration ?? '1', environmentId: options.hostIdentity?.environmentId ?? randomUUID(), environmentGeneration: options.hostIdentity?.environmentGeneration ?? '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: identity.rootIdentity, agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() };
  const workspaces = await workspaceBindings(identity.root, { principal: identity.principal, sid: identity.sid }, target, environment);
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const base = path.join(environment.LOCALAPPDATA!, 'FleetSplice', 'G05');
  mkdirSync(base, { recursive: true });
  // User-only evidence boundary. Control tokens never cross argv, logs, journals, or browser URLs.
  execFileSync('icacls.exe', [base, '/inheritance:r', '/grant:r', `*${identity.sid}:(OI)(CI)F`, '*S-1-5-18:(OI)(CI)F'], { windowsHide: true, stdio: 'ignore' });
  const currentGuard = guardPath(base);
  let predecessorTarget: Target | null = null;
  if (existsSync(currentGuard)) {
    const old = JSON.parse(readFileSync(currentGuard, 'utf8')) as Guard;
    // Re-validate a retirement at the lifecycle commit boundary.  A mere
    // receipt path is never successor authority.
    const retired = ['RETIRED_AMBIGUOUS', 'RETIRED_UNPROVABLE'].includes(old.state) && classifyPredecessor(base).kind === old.state;
    requireThat(retired || old.state === 'CLOSED' && old.nativeExitObserved === true && old.quiescent === true, 'RECOVERY_REQUIRED');
    if (retired) predecessorTarget = old.target;
    preserveGuardForRun(base, old);
  }
  const runId = randomUUID(); const directory = path.join(base, runId); mkdirSync(directory);
  if (predecessorTarget) assertFreshIncarnation(predecessorTarget, target);
  const guard: Guard = { state: 'RUNNING', runId, target, identity, workspaces, nativeExitObserved: false, quiescent: false };
  // Runtime commit point: no native process exists before this durable guard.
  durableWrite(currentGuard, guard);
  durableWrite(path.join(directory, 'admission.json'), { runId, target, identity, workspaces, policy: 'windows-user.read-only', productPath,
    nativeContinuity: productPath === 'NATIVE_ADOPTION' ? 'shared-native-server-adopted' : 'ephemeral-private-stdio',
    nativeServerCustody: productPath === 'NATIVE_ADOPTION' ? options.nativeServerCustody ?? 'CODEX_MANAGED_DAEMON' : undefined,
    node: process.version, sqlite: process.versions.sqlite });
  await options.onGuardCommitted?.(guard);
  const hcpToken = randomBytes(32).toString('hex'); const bootstrapToken = randomBytes(32).toString('hex');
  const env = environment;
  for (const key of Object.keys(env)) if (/FLEETSPLICE|BOOTSTRAP|HCP_TOKEN/i.test(key)) delete env[key];
  const hubEnv = Object.fromEntries(Object.entries(env).filter(([key]) => ['SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'PATHEXT', 'COMSPEC', 'LOCALAPPDATA', 'USERPROFILE', 'APPDATA', 'COMPUTERNAME', 'USERNAME'].includes(key.toUpperCase())));
  const start = (file: string, childEnv: NodeJS.ProcessEnv): ChildProcess => fork(file, [], { cwd: installation, env: childEnv, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  const wait = (child: ChildProcess, kind: string, timeout = 30000): Promise<any> => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${kind.toUpperCase()}_TIMEOUT`)), timeout);
    const handler = (message: any) => { if (message.kind === kind) { clearTimeout(timer); child.off('message', handler); resolve(message); }
      else if (message.kind === 'error') { clearTimeout(timer); child.off('message', handler); reject(new Error(message.code)); } };
    child.on('message', handler); child.once('error', reject);
  });
  let hub: ChildProcess | null = null; let edge: ChildProcess | null = null; let closing = false;
  let runtimeObservation: { status: 'healthy' | 'degraded' | 'unavailable'; discoveredSessions: number; evidence: string } = { status: 'unavailable', discoveredSessions: 0, evidence: 'Runtime discovery has not been observed.' };
  const observeEdge = (child: ChildProcess) => child.on('message', (message: unknown) => {
    const observation = message as { kind?: string; status?: 'healthy' | 'degraded' | 'unavailable'; discoveredSessions?: number; evidence?: string };
    if (observation.kind === 'runtimeObservation' && typeof observation.status === 'string' && Number.isInteger(observation.discoveredSessions) && typeof observation.evidence === 'string') runtimeObservation = { status: observation.status, discoveredSessions: Number(observation.discoveredSessions), evidence: observation.evidence };
  });
  const startEdge = async (enrollment?: EdgeConfig['enrollment']) => {
    const child = start(path.join(installation, 'apps/edge/main.js'), env); observeEdge(child);
    const edgeReady = wait(child, 'edgeReady');
    child.send({ port, target, identity, stateDirectory: directory, executable, hcpToken, enrollment, workspaces, productPath, runtimeSharing,
      nativeServerCustody: options.nativeServerCustody,
      hcpUrl: options.transport?.hcpUrl, testTlsCaPem: options.transport?.testTlsCaPem } satisfies EdgeConfig);
    await edgeReady; return child;
  };
  const awaitHubDetach = () => {
    const detached = wait(hub!, 'edgeDetached', 25000); hub!.send({ kind: 'waitEdgeDetach' }); return detached;
  };
  const closeEdge = async (child: ChildProcess, waitForHubDetach: Promise<unknown>): Promise<void> => {
    const edgeClosed = wait(child, 'edgeClosed', 25000); const edgeExit = onceExit(child, 26000);
    child.send({ kind: 'stop' });
    const closed = await edgeClosed;
    requireThat(closed.provenClosed === true && await edgeExit, 'EDGE_REPLACEMENT_CLOSURE_UNPROVEN');
    await waitForHubDetach;
  };
  try {
    hub = start(path.join(installation, 'apps/hub/server.js'), hubEnv);
    const hubReady = wait(hub, 'hubListening');
    hub.send({ port, target, root: identity.root, sid: identity.sid, principal: identity.principal, sessionId: identity.sessionId, stateDirectory: directory, durableStateDirectory: path.join(base, 'hub-state'), webDirectory: path.join(installation, 'web'), hcpToken, bootstrapToken, workspaces, deployment: options.transport?.deployment, listener: options.transport?.listener,
      ...(productPath === 'NATIVE_ADOPTION' ? { adoptionCarriage: { kind: 'REMOTE_ADOPTION' as const, target, send: () => { throw new Error('HCP_NOT_CONNECTED'); } } } : {}) } satisfies HubConfig);
    await hubReady;
    edge = await startEdge(options.enrollment);
  } catch (error) {
    // Browser command admission has not been exposed: there can be no native effect.
    if (edge?.connected) edge.send({ kind: 'stop' }); if (hub?.connected) hub.send({ kind: 'stop' });
    const stopped = await Promise.all([edge ? onceExit(edge, 5000) : true, hub ? onceExit(hub, 5000) : true]);
    if (stopped.every(Boolean)) durableWrite(currentGuard, { ...guard, state: 'CLOSED', nativeExitObserved: true, quiescent: true, closure: 'STARTUP_NO_EFFECT' });
    throw error;
  }
  const stop = async (): Promise<boolean> => {
    if (closing) return false; closing = true;
    let proven = false;
    try { await closeEdge(edge!, awaitHubDetach()); proven = true; } catch { /* Keep RUNNING when closure is uncertain. */ }
    const hubExit = onceExit(hub!, 10000); if (hub!.connected) hub!.send({ kind: 'stop' });
    const hubStopped = await hubExit;
    if (proven && hubStopped) durableWrite(currentGuard, { ...guard, state: 'CLOSED', nativeExitObserved: true, quiescent: true, closure: 'NATIVE_EXIT_AND_COMPONENT_CLOSURE_PROVEN' });
    return proven && hubStopped;
  };
  hub.on('exit', () => { if (!closing && edge?.connected) edge.disconnect(); });
  const health = () => {
    const hubState = hub?.exitCode === null ? 'RUNNING' : 'STOPPED'; const edgeState = edge?.exitCode === null ? 'RUNNING' : 'STOPPED';
    const journal = productPath === 'NATIVE_ADOPTION' ? 'native-edge.sqlite' : 'edge.sqlite';
    return { hub: hubState, edge: edgeState, edgeAdmission: edgeState === 'RUNNING' ? edgeAdmissionState(path.join(directory, journal)) : 'UNPROVABLE' as const };
  };
  const setRuntimeSharing = async (sharing: RuntimeSharing) => await new Promise<{ status: 'healthy' | 'degraded' | 'unavailable'; discoveredSessions: number; evidence: string }>((resolve, reject) => {
    if (!edge?.connected) { reject(new Error('RUNTIME_SHARING_UNAVAILABLE')); return; }
    const id = randomUUID(); const timer = setTimeout(() => { edge?.off('message', handler); reject(new Error('RUNTIME_SHARING_TIMEOUT')); }, 10000);
    const handler = (message: unknown) => {
      const response = message as { id?: string; result?: { status: 'healthy' | 'degraded' | 'unavailable'; discoveredSessions: number; evidence: string }; error?: string };
      if (response.id !== id) return;
      clearTimeout(timer); edge?.off('message', handler);
      if (response.error) reject(new Error(response.error)); else if (response.result) resolve(response.result); else reject(new Error('RUNTIME_SHARING_UNAVAILABLE'));
    };
    edge.on('message', handler); edge.send({ kind: 'runtimeSharing', id, sharing });
  });
  const replaceEdgeWithEnrollment = async (enrollment: NonNullable<EdgeConfig['enrollment']>) => {
    requireThat(!closing && hub?.exitCode === null && edge?.exitCode === null, 'EDGE_REPLACEMENT_NOT_ADMITTED');
    const prior = edge; const detached = awaitHubDetach();
    await closeEdge(prior, detached);
    edge = await startEdge(enrollment);
  };
  const origin = options.transport?.deployment?.publicBaseUrl ?? `http://127.0.0.1:${port}`;
  return { url: `${origin}/#bootstrap=${bootstrapToken}`, origin, directory, runId, target, identity, productPath, runtimeObservation: () => runtimeObservation, setRuntimeSharing, replaceEdgeWithEnrollment, stop, health };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const option = (name: string) => args[args.indexOf(name) + 1];
  requireThat(args.includes('--workspace') && args.includes('--codex'), 'USAGE: --workspace ABSOLUTE_ROOT --codex PINNED_NATIVE_EXE');
  launch(option('--workspace')!, option('--codex')!).then(run => {
    // Compatibility-only path for the immutable G05 live harness. G05B normal use is fleetsplice.ps1.
    process.stdout.write(JSON.stringify({ kind: 'ready', ...run, stop: undefined }) + '\n');
    const close = () => { run.stop().then(proven => process.exit(proven ? 0 : 2)); };
    process.on('SIGINT', close); process.on('SIGTERM', close); process.stdin.setEncoding('utf8'); process.stdin.on('data', value => { if (String(value).trim() === 'stop') close(); });
  }).catch(error => { process.stderr.write(`${error instanceof Error ? error.message : 'START_FAILED'}\n`); process.exit(1); });
}
