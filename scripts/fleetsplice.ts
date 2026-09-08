import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat } from '../packages/contracts/index.ts';
import { candidateCodexPaths, classifyPredecessor, closeSafePredecessor, discoverCodex, discoverNode, G05B_OWNER_RETIREMENT_RUN, guardPath, networkPreflight, resolveProxy, retireOwnerAuthorizedUnknown, verifyLocalEndpointAvailability, type Guard, type Predecessor } from '../packages/local-operation/index.ts';

const base = () => path.join(process.env.LOCALAPPDATA ?? '', 'FleetSplice', 'G05');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const output = (value: string) => process.stdout.write(`${value}\n`);
const error = (value: string) => { process.stderr.write(`${value}\n`); process.exitCode = 2; };
const code = (value: unknown) => canonical(value);
type ControlFile = { pipe: string; token: string; runId: string };

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
    socket.on('connect', () => socket.end(code({ token: detail.token, command })));
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
  return [`Machine code: ${predecessor.kind}`, `Reason: ${predecessor.reason}`, `Exact native exit proven: ${predecessor.exactNativeExitProven}`];
}
async function preflight(root: string) {
  const identity = await localIdentity(root);
  const node = discoverNode([process.execPath]);
  const codex = discoverCodex(candidateCodexPaths());
  requireThat(existsSync(path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'apps', 'hub', 'server.js')), 'FLEETSPLICE_BUILD_UNAVAILABLE');
  const proxy = resolveProxy(); const network = await networkPreflight(proxy); const predecessor = classifyPredecessor(base());
  if (predecessor.kind !== 'LIVE_OR_CONFLICTING' && predecessor.guard?.state !== 'RUNNING') await verifyLocalEndpointAvailability(identity.sid);
  return { identity, node, codex, proxy, network, predecessor };
}
async function start(root: string) {
  let qualified: Awaited<ReturnType<typeof preflight>>;
  try { qualified = await preflight(root); } catch (reason) { error(`PRECHECK_FAILED\n${reason instanceof Error ? reason.message : 'PRECHECK_UNKNOWN'}\nNO_RUNTIME_STATE_MUTATED=true`); return; }
  if (qualified.network.status !== 'PASS') { error(`PRECHECK_FAILED\n${qualified.network.reason}\nNO_RUNTIME_STATE_MUTATED=true`); return; }
  if (currentGuard()?.state === 'RUNNING') {
    try { const state = await control('status'); output(`ALREADY_RUNNING\n${code({ runId: state.runId, supervisor: state.supervisor })}`); return; } catch { /* A stale RUNNING guard remains a recovery boundary. */ }
  }
  if (qualified.predecessor.kind === 'AMBIGUOUS_TERMINAL' || qualified.predecessor.kind === 'LIVE_OR_CONFLICTING' || qualified.predecessor.kind === 'CORRUPT_OR_UNPROVABLE') { describePredecessor(qualified.predecessor).forEach(output); error('RECOVERY_REQUIRED\nNO_RUNTIME_STATE_MUTATED=true'); return; }
  if (qualified.predecessor.kind === 'SAFE_NO_EFFECT' || qualified.predecessor.kind === 'SAFE_TERMINAL') {
    try { closeSafePredecessor(base()); } catch { error('RECOVERY_REQUIRED\nNO_RUNTIME_STATE_MUTATED=true'); return; }
  }
  const supervisor = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'scripts', 'supervisor.js');
  const child = spawn(process.execPath, [supervisor, '--workspace', qualified.identity.root, '--codex', qualified.codex.path], { detached: true, stdio: 'ignore', windowsHide: true, env: { ...process.env, ...qualified.proxy.environment } }); child.unref();
  for (let attempt = 0; attempt < 80; attempt++) {
    await sleep(250);
    try {
      const state = await control('status');
      if (state.code === 'RUNNING') { output(`FleetSplice 已启动\nMachine code: RUNNING\nRun: ${state.runId}\nBrowser bootstrap: ${state.url}\nProxy: ${qualified.proxy.display ?? 'direct'}\nSource: ${qualified.proxy.source}\nNetwork preflight: PASS\nProvider: PROVIDER_NOT_YET_PROVEN`); return; }
    } catch { /* The detached supervisor may still be acquiring the single writer. */ }
  }
  error('START_FAILED\nSUPERVISOR_UNAVAILABLE\nNO_NATIVE_EFFECT_STARTED=true');
}
async function status(readOnly = true) {
  const predecessor = classifyPredecessor(base());
  const proxy = resolveProxy();
  if (predecessor.guard?.state === 'RUNNING') {
    try { const state = await control('status'); const guard = currentGuard()!; output(`FleetSplice: ${state.code}\nHost: SKYFORGE-01\nPrincipal: ${guard.identity.principal}\nElevated: ${guard.identity.elevated}\nWorkspace: ${guard.identity.root}\nSupervisor: ${state.supervisor}\nHub: ${state.hub}\nEdge: ${state.edge}\nNative Codex: ${state.nativeCodex}\nGuard: ${guard.state}\nRun: ${state.runId}\nProxy: ${proxy.display ?? 'direct'}\nProxy source: ${proxy.source}`); return; } catch { /* Stale RUNNING is handled below. */ }
  }
  const identity = predecessor.guard?.identity; output(`FleetSplice: ${predecessor.kind === 'NO_PREDECESSOR' || predecessor.kind === 'SAFE_TERMINAL' || predecessor.kind === 'RETIRED_AMBIGUOUS' ? 'STOPPED' : 'RECOVERY_REQUIRED'}\nHost: SKYFORGE-01\nPrincipal: ${identity?.principal ?? 'unknown'}\nElevated: ${identity?.elevated ?? 'unknown'}\nWorkspace: ${identity?.root ?? 'unknown'}\nSupervisor: STOPPED\nHub: STOPPED\nEdge: STOPPED\nNative Codex: STOPPED\nGuard: ${predecessor.guard?.state ?? 'NONE'}\nProxy source: ${proxy.source}`);
  describePredecessor(predecessor).forEach(output);
  if (!readOnly) output('Machine code: STATUS_NOT_READ_ONLY');
}
async function doctor(root: string) {
  let node = 'UNQUALIFIED', codex = 'UNQUALIFIED'; try { node = `${discoverNode([process.execPath]).version} / SQLite ${process.versions.sqlite}`; } catch { /* shown below */ }
  try { const qualified = discoverCodex(candidateCodexPaths()); codex = `${qualified.version} / ${qualified.path}`; } catch { /* shown below */ }
  const proxy = resolveProxy(); const predecessor = classifyPredecessor(base());
  output(`FleetSplice Doctor (read-only)\nRuntime: ${node}\nCodex: ${codex}\nWorkspace: ${root}\nProxy: ${proxy.display ?? 'direct'}\nProxy source: ${proxy.source}\nNetwork preflight: NOT_RUN_READ_ONLY\nCurrent guard: ${predecessor.guard?.state ?? 'NONE'}\nProcess conflicts: ${predecessor.conflicts.length}\nSafe automatic closure: ${['SAFE_NO_EFFECT', 'SAFE_TERMINAL'].includes(predecessor.kind)}\nExplicit Owner retirement required: ${predecessor.kind === 'AMBIGUOUS_TERMINAL'}`);
  describePredecessor(predecessor).forEach(output);
}
function retire(args: string[]) {
  const requested = args[args.indexOf('--run') + 1];
  if (requested !== G05B_OWNER_RETIREMENT_RUN) { error('OWNER_RETIREMENT_RUN_NOT_AUTHORIZED'); return; }
  try { const result = retireOwnerAuthorizedUnknown(base(), requested); output(`RETIRED_AMBIGUOUS\nMachine code: RETIRED_AMBIGUOUS\nOld effect outcome: UNKNOWN\nOld command replayed: false\nReceipt: ${result.receipt}\nFresh incarnation: required`); } catch (reason) { error(`OWNER_RETIREMENT_ADMISSION_FAILED\n${reason instanceof Error ? reason.message : 'UNKNOWN'}`); }
}
async function main() {
  const args = process.argv.slice(2); const command = args[0]; const workspace = args[args.indexOf('--workspace') + 1] ?? process.cwd();
  if (command === 'start') return await start(workspace);
  if (command === 'stop') { try { const result = await control('stop'); output(`FleetSplice stop: ${result.code}\nRun: ${result.runId ?? 'none'}\nNative exit observed: ${result.nativeExitObserved === true}`); if (result.code !== 'CLOSED') process.exitCode = 2; } catch { error('RECOVERY_REQUIRED\nSUPERVISOR_UNAVAILABLE'); } return; }
  if (command === 'status') return await status();
  if (command === 'doctor') return await doctor(workspace);
  if (command === 'retire-stale') return retire(args);
  error('USAGE: fleetsplice start|stop|status|doctor [--workspace ABSOLUTE_ROOT]');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(reason => error(`PRECHECK_FAILED\n${reason instanceof Error ? reason.message : 'UNKNOWN'}\nNO_RUNTIME_STATE_MUTATED=true`));
