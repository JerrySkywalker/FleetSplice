import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createConnection } from 'node:net';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, writeSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat } from '../packages/contracts/index.ts';
import { candidateCodexPaths, classifyPredecessor, clearUserProxyConfiguration, closeSafePredecessor, discoverCodex, discoverNode, G05B_OWNER_RETIREMENT_RUN, G05C_P1_OWNER_RETIREMENT_RUNS, guardPath, networkPreflight, proxyConfigurationRequired, readUserProxyConfiguration, resolveExplicitProxy, resolveProxy, retireOwnerAuthorizedUnknown, retireOwnerAuthorizedUnprovable, userProxyConfigPath, verifyLocalEndpointAvailability, writeUserProxyConfiguration, type Guard, type Predecessor, type UserProxyConfiguration } from '../packages/local-operation/index.ts';

const base = () => path.join(process.env.LOCALAPPDATA ?? '', 'FleetSplice', 'G05');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const output = (value: string) => process.stdout.write(`${value}\n`);
const error = (value: string) => { process.stderr.write(`${value}\n`); process.exitCode = 2; };
const code = (value: unknown) => canonical(value);
type ControlFile = { pipe: string; token: string; runId: string };
type SupervisorBootstrap = { taskName: string; node: string; supervisor: string; workspace: string; codex: string; localAppData: string; environment: Record<string, string>; proxySource: string };
const durable = (file: string, value: unknown) => { const handle = openSync(file, 'wx', 0o600); try { writeSync(handle, canonical(value)); fsyncSync(handle); } finally { closeSync(handle); } };

function currentGuard(): Guard | null {
  const file = guardPath(base());
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) as Guard : null; } catch { return null; }
}
async function control(command: 'status' | 'stop'): Promise<any> {
  const guard = currentGuard(); requireThat(guard?.state === 'RUNNING' && typeof guard.runId === 'string', 'SUPERVISOR_UNAVAILABLE');
  const file = path.join(base(), guard.runId, 'control.json'); requireThat(existsSync(file), 'SUPERVISOR_UNAVAILABLE');
  const detail = JSON.parse(readFileSync(file, 'utf8')) as ControlFile;
  return await new Promise((resolve, reject) => {
    const socket = createConnection(detail.pipe); let received = ''; const timer = setTimeout(() => { socket.destroy(); reject(new Error('SUPERVISOR_TIMEOUT')); }, 12000);
    socket.setEncoding('utf8'); socket.once('error', reject); socket.on('data', value => { received += value; if (received.length > 16384) socket.destroy(); });
    socket.on('end', () => { clearTimeout(timer); try { resolve(JSON.parse(received)); } catch { reject(new Error('SUPERVISOR_RESPONSE_INVALID')); } });
    socket.on('connect', () => socket.write(`${code({ token: detail.token, command })}\n`));
  });
}
function describePredecessor(predecessor: Predecessor): string[] {
  const e = predecessor.evidence;
  if (predecessor.kind === 'AMBIGUOUS_TERMINAL') return [
    '上一次 FleetSplice 未正常关闭',
    `Machine code: ${predecessor.kind}`,
    `✓ Native Codex 会话已创建: ${e.sessionReady ? '是' : '未证明'}`,
    `✓ Turn 已被接受: ${e.turnAccepted ? '是' : '否'}`,
    `✓ Turn 开始已被观察: ${e.turnStarted ? '是' : '否'}`,
    `? 未观察到 Turn 完成事件: ${e.turnCompleted ? '否' : '是'}`,
    `✓ 对应 native 进程现已结束: ${predecessor.exactNativeExitProven ? '是' : '否'}`,
    '结论：上一轮结果未知。FleetSplice 不会自动重试该请求。'
  ];
  if (predecessor.kind === 'RETIRED_UNPROVABLE') return [
    'Machine code: RETIRED_UNPROVABLE',
    'Old effect outcome: UNKNOWN',
    'Old command replayed: false',
    'Fresh incarnation required: true'
  ];
  return [`Machine code: ${predecessor.kind}`, `Reason: ${predecessor.reason}`, `Exact native exit proven: ${predecessor.exactNativeExitProven}`];
}
function describeProxyConfiguration(configuration: UserProxyConfiguration): string[] {
  return [
    `Persistent proxy config: ${configuration.present ? 'present' : 'absent'}`,
    `Persistent proxy config syntax: ${configuration.valid ? 'valid' : 'invalid'}`,
    `Persistent proxy config path: ${configuration.path ?? 'UNAVAILABLE'}`
  ];
}
async function preflight(root: string) {
  const identity = await localIdentity(root);
  const node = discoverNode([process.execPath]);
  const codex = discoverCodex(candidateCodexPaths());
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const supervisorLauncher = path.resolve(installation, '..', 'scripts', 'start-supervisor.ps1');
  const requiredBuild = [
    path.join(installation, 'apps', 'hub', 'server.js'),
    path.join(installation, 'apps', 'edge', 'main.js'),
    path.join(installation, 'scripts', 'supervisor.js'),
    path.join(installation, 'scripts', 'local.js'),
    path.join(installation, 'web', 'index.html'),
    supervisorLauncher
  ];
  requireThat(requiredBuild.every(existsSync) && readdirSync(path.join(installation, 'web', 'assets')).some(file => /\.js$/i.test(file)), 'FLEETSPLICE_BUILD_UNAVAILABLE');
  const configuration = readUserProxyConfiguration(); const proxy = resolveProxy(process.env, undefined, undefined, configuration); const network = await networkPreflight(proxy); const predecessor = classifyPredecessor(base());
  if (predecessor.kind !== 'LIVE_OR_CONFLICTING' && predecessor.guard?.state !== 'RUNNING') await verifyLocalEndpointAvailability(identity.sid);
  return { identity, node, codex, configuration, proxy, network, predecessor };
}
async function start(root: string) {
  let qualified: Awaited<ReturnType<typeof preflight>>;
  try { qualified = await preflight(root); } catch (reason) { error(`PRECHECK_FAILED\n${reason instanceof Error ? reason.message : 'PRECHECK_UNKNOWN'}\nNO_RUNTIME_STATE_MUTATED=true`); return; }
  if (qualified.network.status !== 'PASS') {
    if (proxyConfigurationRequired(qualified.proxy, qualified.configuration, qualified.network.reason)) {
      error('PRECHECK_FAILED\nPROXY_CONFIGURATION_REQUIRED\nDirect connectivity is unavailable.\nConfigure a per-user FleetSplice proxy, for example:\nfleetsplice configure proxy --url <proxy-url>\nNO_RUNTIME_STATE_MUTATED=true');
      return;
    }
    error(`PRECHECK_FAILED\n${qualified.network.reason}\nNO_RUNTIME_STATE_MUTATED=true`); return;
  }
  if (currentGuard()?.state === 'RUNNING') {
    try { const state = await control('status'); output(`ALREADY_RUNNING\n${code({ runId: state.runId, supervisor: state.supervisor })}`); return; } catch { /* A stale RUNNING guard remains a recovery boundary. */ }
  }
  if (qualified.predecessor.kind === 'AMBIGUOUS_TERMINAL' || qualified.predecessor.kind === 'LIVE_OR_CONFLICTING' || qualified.predecessor.kind === 'CORRUPT_OR_UNPROVABLE') { describePredecessor(qualified.predecessor).forEach(output); error('RECOVERY_REQUIRED\nNO_RUNTIME_STATE_MUTATED=true'); return; }
  if (qualified.predecessor.kind === 'SAFE_NO_EFFECT' || qualified.predecessor.kind === 'SAFE_TERMINAL') {
    try { closeSafePredecessor(base()); } catch { error('RECOVERY_REQUIRED\nNO_RUNTIME_STATE_MUTATED=true'); return; }
  }
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const supervisor = path.join(installation, 'scripts', 'supervisor.js');
  const supervisorLauncher = path.resolve(installation, '..', 'scripts', 'start-supervisor.ps1');
  const runtime = base(); const taskName = `FleetSplice-G05-${randomUUID()}`; const bootstrap = path.join(runtime, `supervisor-bootstrap-${randomUUID()}.json`);
  try {
    // This is private, per-run handoff material for a manually started
    // current-user task. It is created after all no-effect preflight passed,
    // contains no browser token, and the task broker deletes it on exit.
    mkdirSync(runtime, { recursive: true });
    execFileSync('icacls.exe', [runtime, '/inheritance:r', '/grant:r', `*${qualified.identity.sid}:(OI)(CI)F`, '*S-1-5-18:(OI)(CI)F'], { windowsHide: true, stdio: 'ignore' });
    durable(bootstrap, { taskName, node: qualified.node.path, supervisor, workspace: qualified.identity.root, codex: qualified.codex.path, localAppData: process.env.LOCALAPPDATA!, environment: qualified.proxy.environment, proxySource: qualified.proxy.source } satisfies SupervisorBootstrap);
    // The task has no trigger and is removed with the supervisor. It is a
    // launch broker, not an installed service or a network-facing daemon.
    spawn('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', supervisorLauncher, '-Bootstrap', bootstrap], { stdio: 'ignore', windowsHide: true, env: { ...process.env, ...qualified.proxy.environment } });
  } catch (reason) { error(`START_FAILED\n${reason instanceof Error ? reason.message : 'SUPERVISOR_BOOTSTRAP_FAILED'}\nNO_NATIVE_EFFECT_STARTED=true`); return; }
  for (let attempt = 0; attempt < 80; attempt++) {
    await sleep(250);
    try {
      const state = await control('status');
      if (state.code === 'RUNNING') { output(`FleetSplice 已启动\nMachine code: RUNNING\nRun: ${state.runId}\nBrowser bootstrap: ${state.url}\nProxy: ${qualified.proxy.display ?? 'direct'}\nProxy source: ${qualified.proxy.source}\nNetwork preflight: PASS\nProvider: PROVIDER_NOT_YET_PROVEN`); return; }
    } catch { /* The detached supervisor may still be acquiring the single writer. */ }
  }
  const afterTimeout = classifyPredecessor(base());
  describePredecessor(afterTimeout).forEach(output);
  // The detached task may have consumed its handoff while still acquiring the
  // writer.  Its effect state is therefore unknown, never "no effect".
  error('START_UNKNOWN\nSUPERVISOR_UNAVAILABLE\nRECOVERY_REQUIRED');
}
async function status(readOnly = true) {
  const predecessor = classifyPredecessor(base());
  const configuration = readUserProxyConfiguration(); const proxy = resolveProxy(process.env, undefined, undefined, configuration);
  let runtime = 'UNQUALIFIED', runtimePath = 'UNQUALIFIED', codex = 'UNQUALIFIED', codexHash = 'UNQUALIFIED';
  try { const qualified = discoverNode([process.execPath]); runtime = `${qualified.version} / SQLite ${qualified.sqlite}`; runtimePath = qualified.path; } catch { /* shown in status */ }
  try { const qualified = discoverCodex(candidateCodexPaths()); codex = `${qualified.version} / ${qualified.path}`; codexHash = qualified.sha256; } catch { /* shown in status */ }
  if (predecessor.guard?.state === 'RUNNING') {
    try { const state = await control('status'); const guard = currentGuard()!; output(`FleetSplice: ${state.code}\nHost: SKYFORGE-01\nPrincipal: ${guard.identity.principal}\nElevated: ${guard.identity.elevated}\nWorkspace: ${guard.identity.root}\nSupervisor: ${state.supervisor}\nHub: ${state.hub}\nEdge: ${state.edge}\nEdge admission: ${state.edgeAdmission}\nNative Codex: ${state.nativeCodex}\nGuard: ${guard.state}\nRun: ${state.runId}\nNode: ${state.nodeVersion} / SQLite ${state.sqliteVersion}\nNode path: ${state.runtimePath}\nCodex: ${state.codexPath}\nCodex SHA-256: ${state.codexSha256}\nProxy: ${state.proxy}\nProxy source: ${state.proxySource}\nNetwork preflight: PASS\n${describeProxyConfiguration(configuration).join('\n')}`); return; } catch { /* Stale RUNNING is handled below. */ }
  }
  const identity = predecessor.guard?.identity; output(`FleetSplice: ${['NO_PREDECESSOR', 'SAFE_NO_EFFECT', 'SAFE_TERMINAL', 'RETIRED_AMBIGUOUS', 'RETIRED_UNPROVABLE'].includes(predecessor.kind) ? 'STOPPED' : 'RECOVERY_REQUIRED'}\nHost: SKYFORGE-01\nPrincipal: ${identity?.principal ?? 'unknown'}\nElevated: ${identity?.elevated ?? 'unknown'}\nWorkspace: ${identity?.root ?? 'unknown'}\nSupervisor: STOPPED\nHub: STOPPED\nEdge: STOPPED\nNative Codex: STOPPED\nGuard: ${predecessor.guard?.state ?? 'NONE'}\nNode: ${runtime}\nNode path: ${runtimePath}\nCodex: ${codex}\nCodex SHA-256: ${codexHash}\nProxy: ${proxy.display ?? 'direct'}\nProxy source: ${proxy.source}\nNetwork preflight: NOT_RUN_STATUS_READ_ONLY\n${describeProxyConfiguration(configuration).join('\n')}`);
  describePredecessor(predecessor).forEach(output);
  if (!readOnly) output('Machine code: STATUS_NOT_READ_ONLY');
}
async function doctor(root: string) {
  let node = 'UNQUALIFIED', nodePath = 'UNQUALIFIED', codex = 'UNQUALIFIED', codexHash = 'UNQUALIFIED'; try { const qualified = discoverNode([process.execPath]); node = `${qualified.version} / SQLite ${qualified.sqlite}`; nodePath = qualified.path; } catch { /* shown below */ }
  try { const qualified = discoverCodex(candidateCodexPaths()); codex = `${qualified.version} / ${qualified.path}`; codexHash = qualified.sha256; } catch { /* shown below */ }
  const configuration = readUserProxyConfiguration(); const proxy = resolveProxy(process.env, undefined, undefined, configuration); const predecessor = classifyPredecessor(base());
  output(`FleetSplice Doctor (read-only)\nRuntime: ${node}\nRuntime path: ${nodePath}\nCodex: ${codex}\nCodex SHA-256: ${codexHash}\nWorkspace: ${root}\nProxy: ${proxy.display ?? 'direct'}\nProxy source: ${proxy.source}\nNetwork preflight: NOT_RUN_READ_ONLY\n${describeProxyConfiguration(configuration).join('\n')}\nCurrent guard: ${predecessor.guard?.state ?? 'NONE'}\nProcess conflicts: ${predecessor.conflicts.length}\nSafe automatic closure: ${['SAFE_NO_EFFECT', 'SAFE_TERMINAL'].includes(predecessor.kind)}\nExplicit Owner retirement required: ${predecessor.kind === 'AMBIGUOUS_TERMINAL'}`);
  describePredecessor(predecessor).forEach(output);
}
function retire(args: string[]) {
  const requested = args[2];
  if (args.length === 3 && args[1] === '--run' && requested === G05B_OWNER_RETIREMENT_RUN) {
    try { const result = retireOwnerAuthorizedUnknown(base(), requested); output(`RETIRED_AMBIGUOUS\nMachine code: RETIRED_AMBIGUOUS\nOld effect outcome: UNKNOWN\nOld command replayed: false\nReceipt: ${result.receipt}\nFresh incarnation: required`); } catch (reason) { error(`OWNER_RETIREMENT_ADMISSION_FAILED\n${reason instanceof Error ? reason.message : 'UNKNOWN'}`); }
    return;
  }
  if (args.length !== 4 || args[1] !== '--run' || args[3] !== '--ack-unknown-effect') { error('OWNER_RETIREMENT_ACKNOWLEDGEMENT_REQUIRED'); return; }
  if (!requested || !(G05C_P1_OWNER_RETIREMENT_RUNS as readonly string[]).includes(requested)) { error('OWNER_RETIREMENT_RUN_NOT_AUTHORIZED'); return; }
  try { const result = retireOwnerAuthorizedUnprovable(base(), requested); output(`RETIRED_UNPROVABLE\nMachine code: RETIRED_UNPROVABLE\nOld effect outcome: UNKNOWN\nOld command replayed: false\nReceipt: ${result.receipt}\nFresh incarnation: required`); } catch (reason) { error(`OWNER_RETIREMENT_ADMISSION_FAILED\n${reason instanceof Error ? reason.message : 'UNKNOWN'}`); }
}
async function configure(args: string[]) {
  if (args[0] !== 'proxy') { error('USAGE: fleetsplice configure proxy --url <proxy-url>|--from-current-env|--show|--clear'); return; }
  const mode = args[1];
  if (mode === '--show') {
    if (args.length !== 2) { error('USAGE: fleetsplice configure proxy --show'); return; }
    const configuration = readUserProxyConfiguration();
    output(`FleetSplice proxy configuration\nConfig path: ${configuration.path ?? 'UNAVAILABLE'}\nPersistent proxy config: ${configuration.present ? 'present' : 'absent'}\nConfiguration syntax: ${configuration.valid ? 'valid' : 'invalid'}\nProxy: ${configuration.display ?? 'none'}\nProxy source: ${configuration.proxy ? 'fleetsplice-user-config' : 'none'}`);
    if (!configuration.valid) error(configuration.reason ?? 'FLEETSPLICE_PROXY_CONFIGURATION_INVALID');
    return;
  }
  try {
    const identity = await localIdentity(process.cwd());
    if (mode === '--clear') {
      if (args.length !== 2) { error('USAGE: fleetsplice configure proxy --clear'); return; }
      const configuration = clearUserProxyConfiguration(identity.sid);
      output(`FLEETSPLICE_PROXY_CONFIGURATION_CLEARED\nConfig path: ${userProxyConfigPath()}\nPersistent proxy config: ${configuration.present ? 'present' : 'absent'}`);
      return;
    }
    let value: string | undefined;
    if (mode === '--url' && args.length === 3) value = args[2];
    if (mode === '--from-current-env' && args.length === 2) {
      const explicit = resolveExplicitProxy();
      requireThat(!!explicit, 'PROXY_CONFIGURATION_FROM_ENV_UNAVAILABLE');
      requireThat(!!explicit.proxy, explicit.reason ?? 'PROXY_URL_INVALID');
      value = explicit.proxy;
    }
    if (value === undefined) { error('USAGE: fleetsplice configure proxy --url <proxy-url>|--from-current-env|--show|--clear'); return; }
    const configuration = writeUserProxyConfiguration(value, identity.sid);
    output(`FLEETSPLICE_PROXY_CONFIGURATION_SAVED\nConfig path: ${userProxyConfigPath()}\nProxy: ${configuration.display}\nProxy source: fleetsplice-user-config`);
  } catch (reason) { error(reason instanceof Error ? reason.message : 'FLEETSPLICE_PROXY_CONFIGURATION_FAILED'); }
}
export async function fleetspliceEntrypoint() {
  const args = process.argv.slice(2); const command = args[0]; const workspaceIndex = args.indexOf('--workspace'); const workspace = workspaceIndex >= 0 ? args[workspaceIndex + 1] ?? process.cwd() : process.cwd();
  if (command === 'start') return await start(workspace);
  if (command === 'stop') { try { const result = await control('stop'); output(`FleetSplice stop: ${result.code}\nRun: ${result.runId ?? 'none'}\nNative exit observed: ${result.nativeExitObserved === true}`); if (result.code !== 'CLOSED') process.exitCode = 2; } catch { error('RECOVERY_REQUIRED\nSUPERVISOR_UNAVAILABLE'); } return; }
  if (command === 'status') return await status();
  if (command === 'doctor') return await doctor(workspace);
  if (command === 'retire-stale') return retire(args);
  if (command === 'configure') return await configure(args.slice(1));
  error('USAGE: fleetsplice start|stop|status|doctor|configure [--workspace ABSOLUTE_ROOT]');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) fleetspliceEntrypoint().catch(reason => error(`PRECHECK_FAILED\n${reason instanceof Error ? reason.message : 'UNKNOWN'}\nNO_RUNTIME_STATE_MUTATED=true`));
