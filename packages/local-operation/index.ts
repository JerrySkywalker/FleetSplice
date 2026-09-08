import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, openSync, closeSync, writeSync, fsyncSync, readFileSync, readdirSync, statSync, chmodSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:net';
import path from 'node:path';
import { canonical, requireThat, type Target } from '../contracts/index.ts';
import { CODEX_SHA256 } from '../driver-codex/index.ts';

export const QUALIFIED_NODE = 'v24.20.0';
export const QUALIFIED_SQLITE = '3.53.4';
export const G05B_OWNER_RETIREMENT_RUN = '4c3beca4-d044-47ee-a8d0-915769e74bb2';
export type ProcessIdentity = { processId: number; creationTime: string; sid?: string; principal?: string; sessionId?: number; elevated?: boolean };
export type ProcessProbe = { exists: boolean; identity?: ProcessIdentity; name?: string; commandLine?: string };
export type Guard = { state: string; runId: string; target: Target; identity: { root: string; rootIdentity: string; sid: string; principal: string; sessionId: number; elevated: false }; nativeExitObserved: boolean; quiescent: boolean; [key: string]: unknown };
export type NativeEvidence = { process: ProcessIdentity | null; instanceId: string | null; threadId: string | null; turnId: string | null; sessionReady: boolean; turnAccepted: boolean; turnStarted: boolean; turnCompleted: boolean; hasEffectAttempt: boolean };
export type PredecessorKind = 'NO_PREDECESSOR' | 'SAFE_NO_EFFECT' | 'SAFE_TERMINAL' | 'AMBIGUOUS_TERMINAL' | 'LIVE_OR_CONFLICTING' | 'CORRUPT_OR_UNPROVABLE' | 'RETIRED_AMBIGUOUS';
export type Predecessor = { kind: PredecessorKind; guard: Guard | null; evidence: NativeEvidence; exactNativeExitProven: boolean; conflicts: ProcessProbe[]; reason: string; retirementReceipt?: string };
export type QualifiedNode = { path: string; version: string; sqlite: string };
export type QualifiedCodex = { path: string; sha256: string };
export type ProxyResolution = { source: 'explicit-env' | 'windows-user-proxy' | 'windows-system-proxy' | 'direct' | 'invalid'; proxy: string | null; display: string | null; environment: Record<string, string>; reason?: string };

const runtimeRoot = () => path.join(process.env.LOCALAPPDATA ?? '', 'FleetSplice', 'G05');
export const guardPath = (base = runtimeRoot()) => path.join(base, 'environment-guard.json');
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const redact = (value: string) => { try { const parsed = new URL(value); if (parsed.username || parsed.password) { parsed.username = ''; parsed.password = ''; } return parsed.toString().replace(/\/$/, ''); } catch { return '<invalid>'; } };
const safeJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const durable = (file: string, value: unknown, exclusive = false) => {
  const fd = openSync(file, exclusive ? 'wx' : 'w', 0o600);
  try { writeSync(fd, canonical(value)); fsyncSync(fd); } finally { closeSync(fd); }
};
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);

export function candidateNodePaths(env: NodeJS.ProcessEnv = process.env): string[] {
  const local = env.LOCALAPPDATA ?? '';
  const programFiles = env.ProgramFiles ?? 'C:\\Program Files';
  return [...new Set([
    process.execPath,
    path.join(local, 'FleetSplice', 'runtime', 'node-v24.20.0-win-x64', 'node.exe'),
    path.join(local, 'FleetSplice', 'toolcache', 'node-v24.20.0-win-x64', 'node.exe'),
    path.join(local, 'Programs', 'nodejs', 'node.exe'),
    path.join(programFiles, 'nodejs', 'node.exe')
  ])];
}

export function inspectNode(executable: string): QualifiedNode | null {
  if (!existsSync(executable) || path.extname(executable).toLowerCase() !== '.exe') return null;
  try {
    const parsed = JSON.parse(execFileSync(executable, ['-p', 'JSON.stringify({version:process.version,sqlite:process.versions.sqlite})'], { encoding: 'utf8', windowsHide: true, timeout: 7000 })) as { version?: string; sqlite?: string };
    return parsed.version === QUALIFIED_NODE && parsed.sqlite === QUALIFIED_SQLITE ? { path: path.resolve(executable), version: parsed.version, sqlite: parsed.sqlite } : null;
  } catch { return null; }
}
export function discoverNode(candidates = candidateNodePaths()): QualifiedNode {
  for (const candidate of candidates) { const qualified = inspectNode(candidate); if (qualified) return qualified; }
  throw new Error('NODE_RUNTIME_UNQUALIFIED: Node v24.20.0 with SQLite 3.53.4 was not found');
}

export function candidateCodexPaths(env: NodeJS.ProcessEnv = process.env): string[] {
  const root = path.join(env.APPDATA ?? '', 'npm', 'node_modules', '@openai', 'codex', 'node_modules', '@openai');
  if (!existsSync(root)) return [];
  const candidates: string[] = [];
  try {
    for (const pkg of readdirSync(root)) {
      if (!/^codex-win32-/i.test(pkg)) continue;
      const vendor = path.join(root, pkg, 'vendor');
      if (!existsSync(vendor)) continue;
      for (const target of readdirSync(vendor)) {
        const executable = path.join(vendor, target, 'bin', 'codex.exe');
        if (existsSync(executable) && statSync(executable).isFile()) candidates.push(executable);
      }
    }
  } catch { return []; }
  return candidates;
}
export function discoverCodex(candidates = candidateCodexPaths()): QualifiedCodex {
  for (const candidate of candidates) {
    if (path.basename(candidate).toLowerCase() !== 'codex.exe' || !existsSync(candidate)) continue;
    const sha256 = hash(candidate);
    if (sha256 === CODEX_SHA256) return { path: path.resolve(candidate), sha256 };
  }
  throw new Error('CODEX_ARTIFACT_UNQUALIFIED: pinned native codex.exe was not found or its SHA-256 differs');
}

function proxyUrl(value: string): string | null {
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
  try { const parsed = new URL(candidate); return ['http:', 'https:', 'socks:', 'socks5:'].includes(parsed.protocol) && !!parsed.hostname ? candidate : null; } catch { return null; }
}
export function parseWindowsProxy(server: string | null | undefined): string | null {
  if (!server) return null;
  const entries = server.split(';').map(value => value.trim()).filter(Boolean);
  const preferred = entries.find(value => /^https=/i.test(value))?.replace(/^[^=]+=*/, '') ?? entries.find(value => /^http=/i.test(value))?.replace(/^[^=]+=*/, '') ?? entries.find(value => !value.includes('='));
  return preferred ? proxyUrl(preferred) : null;
}
export function readWindowsUserProxy(): string | null {
  try {
    const output = execFileSync('reg.exe', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
    const enabled = /ProxyEnable\s+REG_DWORD\s+0x1/i.test(output);
    const value = output.match(/ProxyServer\s+REG_SZ\s+(.+)$/im)?.[1]?.trim();
    return enabled ? parseWindowsProxy(value) : null;
  } catch { return null; }
}
export function readWindowsSystemProxy(): string | null {
  try { const output = execFileSync('netsh.exe', ['winhttp', 'show', 'proxy'], { encoding: 'utf8', windowsHide: true, timeout: 5000 }); return parseWindowsProxy(output.match(/Proxy Server\(s\)\s*:\s*(.+)$/im)?.[1]?.trim()); } catch { return null; }
}
export function resolveProxy(env: NodeJS.ProcessEnv = process.env, windowsProxy = readWindowsUserProxy(), systemProxy = readWindowsSystemProxy()): ProxyResolution {
  const selected = env.HTTPS_PROXY ?? env.HTTP_PROXY ?? env.ALL_PROXY ?? env.https_proxy ?? env.http_proxy ?? env.all_proxy;
  if (selected !== undefined) {
    const proxy = proxyUrl(selected);
    if (!proxy) return { source: 'invalid', proxy: null, display: null, environment: {}, reason: 'PROXY_URL_INVALID' };
    return { source: 'explicit-env', proxy, display: redact(proxy), environment: { HTTP_PROXY: env.HTTP_PROXY ?? env.http_proxy ?? proxy, HTTPS_PROXY: env.HTTPS_PROXY ?? env.https_proxy ?? proxy, ALL_PROXY: env.ALL_PROXY ?? env.all_proxy ?? proxy } };
  }
  if (windowsProxy) return { source: 'windows-user-proxy', proxy: windowsProxy, display: redact(windowsProxy), environment: { HTTP_PROXY: windowsProxy, HTTPS_PROXY: windowsProxy, ALL_PROXY: windowsProxy } };
  if (systemProxy) return { source: 'windows-system-proxy', proxy: systemProxy, display: redact(systemProxy), environment: { HTTP_PROXY: systemProxy, HTTPS_PROXY: systemProxy, ALL_PROXY: systemProxy } };
  return { source: 'direct', proxy: null, display: null, environment: {} };
}

export async function networkPreflight(proxy: ProxyResolution, probe: (host: string, port: number) => Promise<boolean> = async (host, port) => {
  const net = await import('node:net');
  return await new Promise<boolean>(resolve => { const socket = net.createConnection({ host, port }); const done = (value: boolean) => { socket.destroy(); resolve(value); }; socket.setTimeout(5000, () => done(false)); socket.once('connect', () => done(true)); socket.once('error', () => done(false)); });
}): Promise<{ status: 'PASS' | 'FAIL'; networkReachable: boolean; provider: 'PROVIDER_NOT_YET_PROVEN'; reason?: string }> {
  if (proxy.source === 'invalid') return { status: 'FAIL', networkReachable: false, provider: 'PROVIDER_NOT_YET_PROVEN', reason: proxy.reason };
  let host = 'chatgpt.com', port = 443;
  if (proxy.proxy) { const parsed = new URL(proxy.proxy); host = parsed.hostname; port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80)); }
  const networkReachable = await probe(host, port);
  return { status: networkReachable ? 'PASS' : 'FAIL', networkReachable, provider: 'PROVIDER_NOT_YET_PROVEN', ...(networkReachable ? {} : { reason: 'NO_USABLE_NETWORK_ROUTE' }) };
}

export async function verifyLocalEndpointAvailability(sid: string, port = 43155): Promise<void> {
  const probe = (endpoint: string | number, host?: string) => new Promise<void>((resolve, reject) => {
    const server = createServer();
    const done = () => server.close(error => error ? reject(error) : resolve());
    server.once('error', reject); if (typeof endpoint === 'number') server.listen(endpoint, host, done); else server.listen(endpoint, done);
  });
  await probe(port, '127.0.0.1');
  await probe(`\\\\.\\pipe\\fleetsplice-g05-${sid}`);
}

export function probeProcess(processId: number): ProcessProbe {
  if (!Number.isInteger(processId) || processId <= 0) return { exists: false };
  const script = `$p=Get-CimInstance Win32_Process -Filter \"ProcessId=${processId}\"; if($null -eq $p){@{exists=$false}|ConvertTo-Json -Compress}else{$o=Invoke-CimMethod -InputObject $p -MethodName GetOwnerSid; $d=[Management.ManagementDateTimeConverter]::ToDateTime($p.CreationDate).ToUniversalTime().ToString('o'); @{exists=$true;identity=@{processId=$p.ProcessId;creationTime=$d;sid=if($o.ReturnValue -eq 0){$o.Sid}else{$null}};name=$p.Name;commandLine=$p.CommandLine}|ConvertTo-Json -Compress}`;
  try { return JSON.parse(execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 8000 })) as ProcessProbe; } catch { return { exists: true, name: 'PROCESS_PROBE_UNAVAILABLE' }; }
}
export function fleetSpliceProcesses(): ProcessProbe[] {
  const script = "$p=Get-CimInstance Win32_Process | Where-Object {$_.ProcessId -ne $PID -and $_.CommandLine -match 'dist\\\\apps\\\\(hub|edge)\\\\(server|main)\\.js'}; @($p | ForEach-Object {$d=[Management.ManagementDateTimeConverter]::ToDateTime($_.CreationDate).ToUniversalTime().ToString('o'); @{exists=$true;identity=@{processId=$_.ProcessId;creationTime=$d};name=$_.Name;commandLine=$_.CommandLine}}) | ConvertTo-Json -Compress";
  try { const raw = execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 8000 }).trim(); if (!raw) return []; const value = JSON.parse(raw); return Array.isArray(value) ? value as ProcessProbe[] : [value as ProcessProbe]; } catch { return [{ exists: true, name: 'PROCESS_INVENTORY_UNAVAILABLE' }]; }
}

const emptyEvidence = (): NativeEvidence => ({ process: null, instanceId: null, threadId: null, turnId: null, sessionReady: false, turnAccepted: false, turnStarted: false, turnCompleted: false, hasEffectAttempt: false });
const readEvidence = (file: string): { kind: string; key: string; value: unknown }[] => {
  const db = new DatabaseSync(file, { readOnly: true });
  try { return db.prepare('SELECT kind,key,value FROM evidence ORDER BY seq').all().map(row => ({ kind: String(row.kind), key: String(row.key), value: JSON.parse(String(row.value)) })); } finally { db.close(); }
};
export function evidenceFromEdge(file: string): NativeEvidence {
  const summary = emptyEvidence();
  for (const row of readEvidence(file)) {
    const value = row.value as any;
    if (row.kind === 'DISPATCH_ATTEMPT') summary.hasEffectAttempt = true;
    if (row.kind === 'NATIVE_PROCESS_IDENTITY' && value && Number.isInteger(value.processId) && typeof value.creationTime === 'string') { summary.process = value as ProcessIdentity; summary.instanceId = row.key; }
    if (row.kind === 'THREAD_OBSERVED' && typeof value?.threadId === 'string') summary.threadId = value.threadId;
    if (row.kind === 'NATIVE_BINDING' && typeof value?.threadId === 'string') { summary.threadId = value.threadId; summary.sessionReady = true; }
    if (row.kind === 'NATIVE_RESULT' && value?.code === 'NATIVE_SESSION_READY') { summary.sessionReady = true; if (typeof value.nativeThreadId === 'string') summary.threadId = value.nativeThreadId; }
    if (row.kind === 'NATIVE_RESULT' && value?.code === 'NATIVE_TURN_ACCEPTED') { summary.turnAccepted = true; summary.hasEffectAttempt = true; if (typeof value.nativeThreadId === 'string') summary.threadId = value.nativeThreadId; if (typeof value.nativeTurnId === 'string') summary.turnId = value.nativeTurnId; }
    if (row.kind === 'NATIVE_EVENT' && value?.kind === 'turnStarted') { summary.turnStarted = true; if (typeof value.turnId === 'string') summary.turnId = value.turnId; }
    if (row.kind === 'NATIVE_EVENT' && value?.kind === 'turnCompleted') { summary.turnCompleted = true; if (typeof value.turnId === 'string') summary.turnId = value.turnId; }
  }
  return summary;
}
function guardIsSound(guard: Guard, base: string): boolean {
  if (!guard || typeof guard.runId !== 'string' || !guard.target || !guard.identity || typeof guard.identity.root !== 'string') return false;
  const admission = path.join(base, guard.runId, 'admission.json');
  if (!existsSync(admission)) return false;
  try { const value = safeJson<{ runId: string; target: Target; identity: Guard['identity'] }>(admission); return value.runId === guard.runId && same(value.target, guard.target) && same(value.identity, guard.identity); } catch { return false; }
}
export function classifyPredecessor(base = runtimeRoot(), process = probeProcess, conflicts = fleetSpliceProcesses()): Predecessor {
  const file = guardPath(base);
  if (!existsSync(file)) return { kind: 'NO_PREDECESSOR', guard: null, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts: [], reason: 'NO_GUARD' };
  let guard: Guard;
  try { guard = safeJson<Guard>(file); } catch { return { kind: 'CORRUPT_OR_UNPROVABLE', guard: null, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'GUARD_UNREADABLE' }; }
  if (guard.state === 'RETIRED_AMBIGUOUS') return { kind: 'RETIRED_AMBIGUOUS', guard, evidence: emptyEvidence(), exactNativeExitProven: guard.nativeExitObserved === true, conflicts, reason: 'RETIRED_WITH_UNKNOWN_OUTCOME', retirementReceipt: typeof guard.retirementReceipt === 'string' ? guard.retirementReceipt : undefined };
  if (!guardIsSound(guard, base)) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'GUARD_OR_ADMISSION_MISMATCH' };
  let evidence: NativeEvidence;
  try { evidence = evidenceFromEdge(path.join(base, guard.runId, 'edge.sqlite')); } catch { return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'EDGE_EVIDENCE_UNREADABLE' }; }
  const matchingConflicts = conflicts.filter(item => item.exists);
  if (matchingConflicts.length) return { kind: 'LIVE_OR_CONFLICTING', guard, evidence, exactNativeExitProven: false, conflicts: matchingConflicts, reason: 'FLEETSPLICE_PROCESS_PRESENT' };
  let exactNativeExitProven = !evidence.process;
  if (evidence.process) {
    const observed = process(evidence.process.processId);
    if (observed.exists && observed.identity?.creationTime === evidence.process.creationTime) return { kind: 'LIVE_OR_CONFLICTING', guard, evidence, exactNativeExitProven: false, conflicts: [observed], reason: 'EXACT_NATIVE_PROCESS_PRESENT' };
    exactNativeExitProven = !observed.exists || observed.identity?.creationTime !== evidence.process.creationTime;
  }
  if (!exactNativeExitProven) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven: false, conflicts: [], reason: 'NATIVE_IDENTITY_UNPROVABLE' };
  if (!evidence.hasEffectAttempt) return { kind: 'SAFE_NO_EFFECT', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'NO_NATIVE_EFFECT_ATTEMPT' };
  if (evidence.turnAccepted && !evidence.turnCompleted) return { kind: 'AMBIGUOUS_TERMINAL', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'TURN_TERMINAL_EVIDENCE_MISSING' };
  if (evidence.turnCompleted || guard.state === 'CLOSED' && guard.nativeExitObserved && guard.quiescent) return { kind: 'SAFE_TERMINAL', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'TERMINAL_EVIDENCE_AND_EXIT_PROVEN' };
  return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'EFFECT_STATE_UNPROVABLE' };
}

export function retireOwnerAuthorizedUnknown(base = runtimeRoot(), runId = G05B_OWNER_RETIREMENT_RUN, process = probeProcess, conflicts = fleetSpliceProcesses()): { receipt: string; predecessor: Predecessor } {
  requireThat(runId === G05B_OWNER_RETIREMENT_RUN, 'OWNER_RETIREMENT_RUN_NOT_AUTHORIZED');
  const predecessor = classifyPredecessor(base, process, conflicts);
  requireThat(predecessor.guard?.runId === runId && predecessor.kind === 'AMBIGUOUS_TERMINAL', 'OWNER_RETIREMENT_ADMISSION_FAILED');
  requireThat(predecessor.evidence.turnAccepted && predecessor.evidence.turnStarted && !predecessor.evidence.turnCompleted && predecessor.exactNativeExitProven, 'OWNER_RETIREMENT_EVIDENCE_INSUFFICIENT');
  const archive = path.join(base, 'retirements', runId);
  requireThat(!existsSync(archive), 'OWNER_RETIREMENT_ALREADY_RECORDED'); mkdirSync(archive, { recursive: true });
  const source = [guardPath(base), path.join(base, runId, 'admission.json'), ...['hub.sqlite', 'hub.sqlite-wal', 'hub.sqlite-shm', 'edge.sqlite', 'edge.sqlite-wal', 'edge.sqlite-shm'].map(name => path.join(base, runId, name)).filter(existsSync)];
  const evidence = source.map(file => ({ name: path.basename(file), sha256: hash(file), bytes: statSync(file).size }));
  for (const file of source) { const destination = path.join(archive, path.basename(file)); copyFileSync(file, destination, 1); chmodSync(destination, 0o400); }
  const receipt = path.join(archive, 'retirement-receipt.json');
  const value = { kind: 'G05B_OWNER_AUTHORIZED_RETIREMENT', runId, retiredAt: new Date().toISOString(), oldState: predecessor.guard!.state, oldTarget: predecessor.guard!.target, native: predecessor.evidence, exactNativeExitProven: true, oldEffectOutcome: 'UNKNOWN', oldCommandReplayed: false, oldAuthorityRuntimeRetired: true, freshIncarnationRequired: true, evidence, archive };
  durable(receipt, value, true); chmodSync(receipt, 0o400);
  durable(guardPath(base), { ...predecessor.guard, state: 'RETIRED_AMBIGUOUS', nativeExitObserved: true, quiescent: false, oldEffectOutcome: 'UNKNOWN', retirementReceipt: receipt, retiredAt: value.retiredAt, retiredBy: 'G05B_OWNER_AUTHORIZATION', oldAuthorityRuntimeRetired: true, freshIncarnationRequired: true });
  return { receipt, predecessor };
}

export function closeSafePredecessor(base = runtimeRoot(), process = probeProcess, conflicts = fleetSpliceProcesses()): Predecessor {
  const predecessor = classifyPredecessor(base, process, conflicts);
  requireThat(predecessor.guard && ['SAFE_NO_EFFECT', 'SAFE_TERMINAL'].includes(predecessor.kind), 'SAFE_PREDECESSOR_CLOSURE_NOT_ADMITTED');
  preserveGuardForRun(base, predecessor.guard);
  durable(guardPath(base), { ...predecessor.guard, state: 'CLOSED', nativeExitObserved: true, quiescent: true, closure: predecessor.kind, closureReason: predecessor.reason, closureAt: new Date().toISOString() });
  return predecessor;
}

export function preserveGuardForRun(base: string, guard: Guard): string {
  const file = path.join(base, guard.runId, 'environment-guard.observed.json');
  if (!existsSync(file)) durable(file, guard, true);
  return file;
}

export function assertFreshIncarnation(previous: Target, next: Target): void {
  for (const field of ['authorityId', 'hubRuntimeId', 'edgeRuntimeId', 'connectionId', 'agentBindingId', 'executionBindingId', 'providerBindingId'] as const) requireThat(previous[field] !== next[field], 'PREDECESSOR_IDENTITY_REUSE');
}
