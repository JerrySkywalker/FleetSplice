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
export const QUALIFIED_CODEX_VERSION = '0.153.4';
export const G05B_OWNER_RETIREMENT_RUN = '4c3beca4-d044-47ee-a8d0-915769e74bb2';
export type ProcessIdentity = { processId: number; creationTime: string; sid?: string; principal?: string; sessionId?: number; elevated?: boolean };
export type ProcessProbe = { exists: boolean; identity?: ProcessIdentity; name?: string; commandLine?: string };
export type Guard = { state: string; runId: string; target: Target; identity: { root: string; rootIdentity: string; sid: string; principal: string; sessionId: number; elevated: false }; nativeExitObserved: boolean; quiescent: boolean; [key: string]: unknown };
export type TurnEvidence = { turnId: string; commandId: string | null; accepted: boolean; started: boolean; completed: boolean };
export type NativeEvidence = { process: ProcessIdentity | null; instanceId: string | null; threadId: string | null; turnId: string | null; sessionReady: boolean; turnAccepted: boolean; turnStarted: boolean; turnCompleted: boolean; hasEffectAttempt: boolean; hasNativeEvidence: boolean; turns: Record<string, TurnEvidence>; unresolvedEffectIds: string[]; unboundEvidence: boolean };
export type PredecessorKind = 'NO_PREDECESSOR' | 'SAFE_NO_EFFECT' | 'SAFE_TERMINAL' | 'AMBIGUOUS_TERMINAL' | 'LIVE_OR_CONFLICTING' | 'CORRUPT_OR_UNPROVABLE' | 'RETIRED_AMBIGUOUS';
export type Predecessor = { kind: PredecessorKind; guard: Guard | null; evidence: NativeEvidence; exactNativeExitProven: boolean; conflicts: ProcessProbe[]; reason: string; retirementReceipt?: string };
export type QualifiedNode = { path: string; version: string; sqlite: string };
export type QualifiedCodex = { path: string; version: string; sha256: string };
export type ProxyResolution = { source: 'explicit-env' | 'windows-user-proxy' | 'windows-system-proxy' | 'direct' | 'invalid'; proxy: string | null; display: string | null; environment: Record<string, string>; reason?: string };
export type EdgeAdmissionState = 'READY' | 'BLOCKED' | 'UNPROVABLE';

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
const creationTicks = (value: unknown): bigint | null => {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]), hour = Number(match[4]), minute = Number(match[5]), second = Number(match[6]);
  const fraction = match[7] ?? '', zone = match[8]!;
  const wall = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (wall.getUTCFullYear() !== year || wall.getUTCMonth() !== month - 1 || wall.getUTCDate() !== day || wall.getUTCHours() !== hour || wall.getUTCMinutes() !== minute || wall.getUTCSeconds() !== second) return null;
  const offsetHours = Number(zone.slice(1, 3)), offsetRemainder = Number(zone.slice(4, 6));
  if (zone !== 'Z' && (offsetHours > 23 || offsetRemainder > 59)) return null;
  const offsetMinutes = zone === 'Z' ? 0 : (zone[0] === '+' ? 1 : -1) * (offsetHours * 60 + offsetRemainder);
  const epochSeconds = BigInt((wall.getTime() - offsetMinutes * 60000) / 1000);
  return epochSeconds * 10000000n + BigInt(fraction.padEnd(7, '0'));
};
const sameCreation = (left: unknown, right: unknown) => { const a = creationTicks(left), b = creationTicks(right); return a !== null && b !== null && a === b; };

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
    if (sha256 !== CODEX_SHA256) continue;
    try {
      const version = execFileSync(candidate, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 7000 }).trim().match(/\b(\d+\.\d+\.\d+)\b/)?.[1];
      if (version === QUALIFIED_CODEX_VERSION) return { path: path.resolve(candidate), version, sha256 };
    } catch { /* A qualified artifact must also answer its non-effecting version query. */ }
  }
  throw new Error('CODEX_ARTIFACT_UNQUALIFIED: native codex.exe version/hash did not match the accepted pin');
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
  const script = `$p=Get-Process -Id ${processId} -ErrorAction SilentlyContinue; if($null -eq $p){@{exists=$false}|ConvertTo-Json -Compress}else{@{exists=$true;identity=@{processId=$p.Id;creationTime=$p.StartTime.ToUniversalTime().ToString('o')};name=$p.ProcessName}|ConvertTo-Json -Compress}`;
  try { return JSON.parse(execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 8000 })) as ProcessProbe; } catch { return { exists: true, name: 'PROCESS_PROBE_UNAVAILABLE' }; }
}
export function fleetSpliceProcesses(): ProcessProbe[] {
  const script = "$p=Get-CimInstance Win32_Process | Where-Object {$_.ProcessId -ne $PID -and $_.CommandLine -match 'dist\\\\apps\\\\(hub|edge)\\\\(server|main)\\.js'}; @($p | ForEach-Object {@{exists=$true;name=$_.Name;commandLine=$_.CommandLine}}) | ConvertTo-Json -Compress";
  try { const raw = execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 8000 }).trim(); if (!raw) return []; const value = JSON.parse(raw); return Array.isArray(value) ? value as ProcessProbe[] : [value as ProcessProbe]; } catch { return [{ exists: true, name: 'PROCESS_INVENTORY_UNAVAILABLE' }]; }
}

const emptyEvidence = (): NativeEvidence => ({ process: null, instanceId: null, threadId: null, turnId: null, sessionReady: false, turnAccepted: false, turnStarted: false, turnCompleted: false, hasEffectAttempt: false, hasNativeEvidence: false, turns: {}, unresolvedEffectIds: [], unboundEvidence: false });
const readEvidence = (file: string): { kind: string; key: string; value: unknown }[] => {
  const db = new DatabaseSync(file, { readOnly: true });
  try { return db.prepare('SELECT kind,key,value FROM evidence ORDER BY seq').all().map(row => ({ kind: String(row.kind), key: String(row.key), value: JSON.parse(String(row.value)) })); } finally { db.close(); }
};
export function evidenceFromEdge(file: string): NativeEvidence {
  const summary = emptyEvidence();
  const effects = new Map<string, { terminal: boolean; turnId: string | null; bindingThreadId: string | null; threadId: string | null }>();
  const turn = (turnId: string, commandId: string | null): TurnEvidence => summary.turns[turnId] ??= { turnId, commandId, accepted: false, started: false, completed: false };
  const events: { key: string; value: any }[] = [];
  const threads: { key: string; value: any }[] = [];
  const bindings: { key: string; value: any }[] = [];
  const results: { key: string; value: any }[] = [];
  const ambiguities: { key: string; value: any }[] = [];
  const exits: { key: string; value: any }[] = [];
  const validProcess = (value: any): value is ProcessIdentity => !!value && Number.isInteger(value.processId) && value.processId > 0 && creationTicks(value.creationTime) !== null;
  const sameRecordedProcess = (value: any) => validProcess(value) && !!summary.process && value.processId === summary.process.processId && sameCreation(value.creationTime, summary.process.creationTime);
  const sameNative = (processId: unknown, instanceId: unknown) => Number.isInteger(processId) && (processId as number) > 0 && !!summary.process && processId === summary.process.processId && typeof instanceId === 'string' && !!summary.instanceId && instanceId === summary.instanceId;
  const displayThread = (threadId: string) => { if (!summary.threadId) summary.threadId = threadId; };
  for (const row of readEvidence(file)) {
    const value = row.value as any;
    if (row.kind === 'DISPATCH_ATTEMPT') { summary.hasEffectAttempt = true; effects.set(row.key, { terminal: false, turnId: null, bindingThreadId: null, threadId: null }); }
    if (row.kind === 'NATIVE_PROCESS_IDENTITY') {
      summary.hasNativeEvidence = true;
      if (!validProcess(value) || typeof row.key !== 'string' || !row.key) { summary.unboundEvidence = true; continue; }
      if (summary.process && (!sameRecordedProcess(value) || summary.instanceId !== row.key)) { summary.unboundEvidence = true; continue; }
      summary.process = value as ProcessIdentity; summary.instanceId = row.key;
    }
    if (row.kind === 'THREAD_OBSERVED') { summary.hasNativeEvidence = true; threads.push({ key: row.key, value }); }
    if (row.kind === 'NATIVE_BINDING') { summary.hasNativeEvidence = true; bindings.push({ key: row.key, value }); }
    if (row.kind === 'NATIVE_RESULT') { summary.hasNativeEvidence = true; results.push({ key: row.key, value }); }
    if (row.kind === 'NATIVE_EVENT') { summary.hasNativeEvidence = true; events.push({ key: row.key, value }); }
    if (row.kind === 'AMBIGUOUS_EFFECT') { summary.hasNativeEvidence = true; ambiguities.push({ key: row.key, value }); }
    if (row.kind === 'NATIVE_PROCESS_EXIT_OBSERVED') { summary.hasNativeEvidence = true; exits.push({ key: row.key, value }); }
    if (row.kind === 'REJECTED_NATIVE_OBSERVATION') { summary.hasNativeEvidence = true; summary.unboundEvidence = true; }
  }
  // A retirement proof binds every observed native effect to precisely the
  // process identity whose PID/creation-time absence is checked below.  Never
  // infer that binding from a PID alone, and never treat a malformed identity
  // as an absent process.
  for (const { key, value } of bindings) {
    const effect = effects.get(key);
    if (!effect || !sameNative(value?.processId, value?.instanceId) || typeof value?.threadId !== 'string' || (effect.bindingThreadId && effect.bindingThreadId !== value.threadId)) { summary.unboundEvidence = true; continue; }
    effect.bindingThreadId = value.threadId; effect.threadId = value.threadId; displayThread(value.threadId); summary.sessionReady = true;
  }
  for (const { key, value } of threads) {
    const effect = effects.get(key);
    if (!effect || typeof value?.threadId !== 'string' || (effect.bindingThreadId && effect.bindingThreadId !== value.threadId) || (effect.threadId && effect.threadId !== value.threadId)) { summary.unboundEvidence = true; continue; }
    effect.threadId = value.threadId; displayThread(value.threadId);
  }
  const boundThreads = new Set([...effects.values()].flatMap(effect => effect.bindingThreadId ? [effect.bindingThreadId] : []));
  for (const { key, value } of exits) {
    if (!sameNative(value?.processId, key) || value?.exitObserved !== true) summary.unboundEvidence = true;
  }
  for (const { key, value } of results) {
      const effect = effects.get(key);
      if (!effect) { summary.unboundEvidence = true; continue; }
      if (!sameNative(value?.nativeProcessId, value?.nativeInstanceId)) { summary.unboundEvidence = true; continue; }
      if (typeof value?.nativeThreadId !== 'string' || (effect.bindingThreadId && effect.bindingThreadId !== value.nativeThreadId) || (effect.threadId && effect.threadId !== value.nativeThreadId)) { summary.unboundEvidence = true; continue; }
      effect.threadId = value.nativeThreadId; displayThread(value.nativeThreadId);
      if (value?.code === 'NATIVE_SESSION_READY') {
        if (!effect.bindingThreadId) { summary.unboundEvidence = true; continue; }
        summary.sessionReady = true; effect.terminal = true;
      }
      else if (value?.code === 'NATIVE_TURN_ACCEPTED' && typeof value.nativeTurnId === 'string') {
        if (!boundThreads.has(value.nativeThreadId)) { summary.unboundEvidence = true; continue; }
        const observed = turn(value.nativeTurnId, key); observed.accepted = true; effect.turnId = value.nativeTurnId;
      } else summary.unboundEvidence = true;
  }
  // Codex may signal turnStarted before the associated turn/start RPC reply is
  // journaled. Correlate events only after the whole durable journal has been
  // reduced, rather than treating this valid ordering as unbound evidence.
  for (const { key, value } of events) {
      const effect = effects.get(key);
      if (!effect || typeof value?.threadId !== 'string' || !effect.threadId || effect.threadId !== value.threadId || typeof value?.kind !== 'string') { summary.unboundEvidence = true; continue; }
      displayThread(value.threadId);
      if (value.kind === 'turnStarted' || value.kind === 'turnCompleted') {
        if (typeof value.turnId !== 'string') { summary.unboundEvidence = true; continue; }
        const observed = turn(value.turnId, key);
        if (effect.turnId !== value.turnId || !observed.accepted) { summary.unboundEvidence = true; continue; }
        if (value.kind === 'turnStarted') observed.started = true;
        else { observed.completed = true; effect.terminal = true; }
        if (!summary.turnId) summary.turnId = value.turnId;
      } else if (effect.turnId && value.turnId !== effect.turnId) summary.unboundEvidence = true;
  }
  for (const { key, value } of ambiguities) {
    const effect = effects.get(key);
    if (!effect) { summary.unboundEvidence = true; continue; }
    if ((value?.nativeProcessId !== null || value?.nativeInstanceId !== null) && !sameNative(value?.nativeProcessId, value?.nativeInstanceId)) { summary.unboundEvidence = true; continue; }
    // An explicitly ambiguous outcome wins over any damaged duplicate terminal
    // row. It must preserve recovery debt, never authorize automatic closure.
    effect.terminal = false;
  }
  const turns = Object.values(summary.turns);
  summary.turnAccepted = turns.some(value => value.accepted);
  summary.turnStarted = turns.some(value => value.started);
  // This is intentionally an all-turn claim: a completed earlier turn can
  // never mask a later admitted turn whose terminal outcome is unknown.
  summary.turnCompleted = turns.length > 0 && turns.every(value => value.accepted && value.started && value.completed);
  summary.unresolvedEffectIds = [...effects.entries()].filter(([, value]) => !value.terminal).map(([key]) => key);
  return summary;
}
export function edgeAdmissionState(file: string): EdgeAdmissionState {
  try {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
      const row = db.prepare("SELECT value FROM kv WHERE key='blocked'").get() as { value?: string } | undefined;
      if (!row) return 'READY';
      const blocked = JSON.parse(String(row.value));
      return typeof blocked === 'string' && blocked.length > 0 ? 'BLOCKED' : 'UNPROVABLE';
    } finally { db.close(); }
  } catch { return 'UNPROVABLE'; }
}
function guardIsSound(guard: Guard, base: string): boolean {
  if (!guard || typeof guard.runId !== 'string' || !guard.target || !guard.identity || typeof guard.identity.root !== 'string') return false;
  const admission = path.join(base, guard.runId, 'admission.json');
  if (!existsSync(admission)) return false;
  try { const value = safeJson<{ runId: string; target: Target; identity: Guard['identity'] }>(admission); return value.runId === guard.runId && same(value.target, guard.target) && same(value.identity, guard.identity); } catch { return false; }
}
function readableFleetSpliceJournal(file: string): boolean {
  if (!existsSync(file)) return false;
  try {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
      if (db.prepare('PRAGMA integrity_check').get()?.integrity_check !== 'ok') return false;
      const expected: Record<string, string[]> = { kv: ['key', 'value'], evidence: ['seq', 'kind', 'key', 'value'], records: ['id', 'digest', 'value'], aliases: ['alias', 'id', 'digest'] };
      return Object.entries(expected).every(([table, columns]) => {
        const actual = db.prepare(`PRAGMA table_info(${table})`).all().map(row => String(row.name));
        return columns.every(column => actual.includes(column));
      });
    } finally { db.close(); }
  } catch { return false; }
}
function classifyEvidence(guard: Guard, evidence: NativeEvidence, process: (processId: number) => ProcessProbe, conflicts: ProcessProbe[]): Predecessor {
  const matchingConflicts = conflicts.filter(item => item.exists);
  if (matchingConflicts.length) return { kind: 'LIVE_OR_CONFLICTING', guard, evidence, exactNativeExitProven: false, conflicts: matchingConflicts, reason: 'FLEETSPLICE_PROCESS_PRESENT' };
  let exactNativeExitProven = !evidence.process;
  if (evidence.process) {
    const observed = process(evidence.process.processId);
    if (observed.exists && (!observed.identity || !Number.isInteger(observed.identity.processId) || observed.identity.processId !== evidence.process.processId || creationTicks(observed.identity.creationTime) === null)) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven: false, conflicts: [observed], reason: 'NATIVE_PROCESS_IDENTITY_UNPROVABLE' };
    if (observed.exists && sameCreation(observed.identity!.creationTime, evidence.process.creationTime)) return { kind: 'LIVE_OR_CONFLICTING', guard, evidence, exactNativeExitProven: false, conflicts: [observed], reason: 'EXACT_NATIVE_PROCESS_PRESENT' };
    // A different creation time is explicit PID-reuse evidence, not evidence
    // that the old process remains live.
    exactNativeExitProven = !observed.exists || !sameCreation(observed.identity!.creationTime, evidence.process.creationTime);
  }
  if (evidence.unboundEvidence) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'EFFECT_EVIDENCE_UNBOUND' };
  if (!exactNativeExitProven) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven: false, conflicts: [], reason: 'NATIVE_IDENTITY_UNPROVABLE' };
  if (!evidence.hasEffectAttempt) {
    if (evidence.hasNativeEvidence || evidence.process || evidence.instanceId || evidence.threadId || evidence.turnId || evidence.sessionReady || evidence.turnAccepted || evidence.turnStarted || evidence.turnCompleted) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'NATIVE_EVIDENCE_WITHOUT_DISPATCH_ATTEMPT' };
    return { kind: 'SAFE_NO_EFFECT', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'NO_NATIVE_EFFECT_ATTEMPT' };
  }
  if (evidence.unresolvedEffectIds.length > 0) return { kind: 'AMBIGUOUS_TERMINAL', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'EFFECT_TERMINAL_EVIDENCE_MISSING' };
  return { kind: 'SAFE_TERMINAL', guard, evidence, exactNativeExitProven, conflicts: [], reason: 'ALL_EFFECT_TERMINAL_EVIDENCE_AND_EXIT_PROVEN' };
}
function retiredPredecessor(base: string, guard: Guard, process: (processId: number) => ProcessProbe, conflicts: ProcessProbe[]): Predecessor {
  const corrupt = (reason: string, evidence = emptyEvidence()): Predecessor => ({ kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence, exactNativeExitProven: false, conflicts: conflicts.filter(value => value.exists), reason });
  if (!guardIsSound(guard, base)) return corrupt('RETIRED_GUARD_OR_ADMISSION_MISMATCH');
  const archive = path.join(base, 'retirements', guard.runId);
  const receiptPath = path.join(archive, 'retirement-receipt.json');
  if (guard.retirementReceipt !== receiptPath || !existsSync(receiptPath)) return corrupt('RETIREMENT_RECEIPT_MISSING_OR_SUBSTITUTED');
  let receipt: any; let archivedGuard: Guard; let archivedAdmission: { runId: string; target: Target; identity: Guard['identity'] }; let evidence: NativeEvidence;
  try {
    receipt = safeJson<any>(receiptPath);
    archivedGuard = safeJson<Guard>(path.join(archive, 'environment-guard.json'));
    archivedAdmission = safeJson<{ runId: string; target: Target; identity: Guard['identity'] }>(path.join(archive, 'admission.json'));
    evidence = evidenceFromEdge(path.join(archive, 'edge.sqlite'));
  } catch { return corrupt('RETIREMENT_ARCHIVE_UNREADABLE'); }
  if (receipt?.kind !== 'G05B_OWNER_AUTHORIZED_RETIREMENT' || receipt.runId !== guard.runId || receipt.archive !== archive || receipt.oldEffectOutcome !== 'UNKNOWN' || receipt.oldCommandReplayed !== false || receipt.oldAuthorityRuntimeRetired !== true || receipt.freshIncarnationRequired !== true) return corrupt('RETIREMENT_RECEIPT_CONTRADICTORY', evidence);
  if (archivedGuard.state === 'RETIRED_AMBIGUOUS' || archivedGuard.runId !== guard.runId || !same(archivedGuard.target, guard.target) || !same(archivedGuard.identity, guard.identity) || archivedAdmission.runId !== guard.runId || !same(archivedAdmission.target, guard.target) || !same(archivedAdmission.identity, guard.identity) || !same(receipt.oldTarget, guard.target)) return corrupt('RETIREMENT_ARCHIVE_BINDING_MISMATCH', evidence);
  if (!readableFleetSpliceJournal(path.join(archive, 'hub.sqlite'))) return corrupt('RETIREMENT_HUB_JOURNAL_UNPROVABLE', evidence);
  if (!readableFleetSpliceJournal(path.join(archive, 'edge.sqlite'))) return corrupt('RETIREMENT_EDGE_JOURNAL_UNPROVABLE', evidence);
  if (!Array.isArray(receipt.evidence) || !receipt.evidence.some((item: any) => item?.name === 'environment-guard.json') || !receipt.evidence.some((item: any) => item?.name === 'admission.json') || !receipt.evidence.some((item: any) => item?.name === 'hub.sqlite') || !receipt.evidence.some((item: any) => item?.name === 'edge.sqlite')) return corrupt('RETIREMENT_EVIDENCE_MANIFEST_INCOMPLETE', evidence);
  for (const item of receipt.evidence) {
    if (!item || typeof item.name !== 'string' || path.basename(item.name) !== item.name || !/^[A-Za-z0-9._-]+$/.test(item.name)) return corrupt('RETIREMENT_EVIDENCE_MANIFEST_INVALID', evidence);
    const preserved = path.join(archive, item.name);
    try { if (!existsSync(preserved) || typeof item.sha256 !== 'string' || item.sha256 !== hash(preserved) || item.bytes !== statSync(preserved).size) return corrupt('RETIREMENT_EVIDENCE_HASH_MISMATCH', evidence); } catch { return corrupt('RETIREMENT_EVIDENCE_UNREADABLE', evidence); }
  }
  const original = classifyEvidence(archivedGuard, evidence, process, conflicts);
  if (original.kind === 'LIVE_OR_CONFLICTING') return original;
  if (original.kind !== 'AMBIGUOUS_TERMINAL' || !original.exactNativeExitProven) return corrupt('RETIREMENT_ORIGINAL_NOT_PROVEN_AMBIGUOUS', evidence);
  return { kind: 'RETIRED_AMBIGUOUS', guard, evidence, exactNativeExitProven: true, conflicts: [], reason: 'RETIRED_WITH_PRESERVED_UNKNOWN_OUTCOME', retirementReceipt: receiptPath };
}
export function classifyPredecessor(base = runtimeRoot(), process = probeProcess, conflicts = fleetSpliceProcesses()): Predecessor {
  const file = guardPath(base);
  const matchingConflicts = conflicts.filter(item => item.exists);
  if (!existsSync(file)) return matchingConflicts.length ? { kind: 'LIVE_OR_CONFLICTING', guard: null, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts: matchingConflicts, reason: 'FLEETSPLICE_PROCESS_PRESENT_WITHOUT_GUARD' } : { kind: 'NO_PREDECESSOR', guard: null, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts: [], reason: 'NO_GUARD' };
  let guard: Guard;
  try { guard = safeJson<Guard>(file); } catch { return { kind: 'CORRUPT_OR_UNPROVABLE', guard: null, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'GUARD_UNREADABLE' }; }
  if (matchingConflicts.length) return { kind: 'LIVE_OR_CONFLICTING', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts: matchingConflicts, reason: 'FLEETSPLICE_PROCESS_PRESENT' };
  if (guard.state === 'RETIRED_AMBIGUOUS') return retiredPredecessor(base, guard, process, conflicts);
  if (!guardIsSound(guard, base)) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'GUARD_OR_ADMISSION_MISMATCH' };
  if (!readableFleetSpliceJournal(path.join(base, guard.runId, 'hub.sqlite'))) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'HUB_JOURNAL_UNPROVABLE' };
  if (!readableFleetSpliceJournal(path.join(base, guard.runId, 'edge.sqlite'))) return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'EDGE_JOURNAL_UNPROVABLE' };
  let evidence: NativeEvidence;
  try { evidence = evidenceFromEdge(path.join(base, guard.runId, 'edge.sqlite')); } catch { return { kind: 'CORRUPT_OR_UNPROVABLE', guard, evidence: emptyEvidence(), exactNativeExitProven: false, conflicts, reason: 'EDGE_EVIDENCE_UNREADABLE' }; }
  return classifyEvidence(guard, evidence, process, conflicts);
}

export function retireOwnerAuthorizedUnknown(base = runtimeRoot(), runId = G05B_OWNER_RETIREMENT_RUN, process = probeProcess, conflicts = fleetSpliceProcesses()): { receipt: string; predecessor: Predecessor } {
  requireThat(runId === G05B_OWNER_RETIREMENT_RUN, 'OWNER_RETIREMENT_RUN_NOT_AUTHORIZED');
  const predecessor = classifyPredecessor(base, process, conflicts);
  requireThat(predecessor.guard?.runId === runId && predecessor.kind === 'AMBIGUOUS_TERMINAL', 'OWNER_RETIREMENT_ADMISSION_FAILED');
  requireThat(predecessor.evidence.turnAccepted && predecessor.evidence.turnStarted && !predecessor.evidence.turnCompleted && predecessor.exactNativeExitProven, 'OWNER_RETIREMENT_EVIDENCE_INSUFFICIENT');
  const archive = path.join(base, 'retirements', runId);
  const required = [guardPath(base), path.join(base, runId, 'admission.json'), path.join(base, runId, 'hub.sqlite'), path.join(base, runId, 'edge.sqlite')] as const;
  requireThat(required.every(existsSync) && readableFleetSpliceJournal(required[2]) && readableFleetSpliceJournal(required[3]), 'OWNER_RETIREMENT_EVIDENCE_INSUFFICIENT');
  requireThat(!existsSync(archive), 'OWNER_RETIREMENT_ALREADY_RECORDED');
  const source = [...required, ...['hub.sqlite-wal', 'hub.sqlite-shm', 'edge.sqlite-wal', 'edge.sqlite-shm'].map(name => path.join(base, runId, name)).filter(existsSync)];
  mkdirSync(archive, { recursive: true });
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
