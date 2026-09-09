import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { target } from './helpers.ts';
import { assertFreshIncarnation, candidateCodexPaths, classifyPredecessor, clearUserProxyConfiguration, closeSafePredecessor, discoverCodex, discoverNode, edgeAdmissionState, G05B_OWNER_RETIREMENT_RUN, G05C_P1_OWNER_RETIREMENT_RUN, G05C_P1_PROTOCOL_REPAIR_RETIREMENT_RUN, networkPreflight, parseWindowsProxy, proxyConfigurationRequired, readUserProxyConfiguration, resolveProxy, retireOwnerAuthorizedUnknown, retireOwnerAuthorizedUnprovable, userProxyConfigPath, verifyLocalEndpointAvailability, writeUserProxyConfiguration } from '../packages/local-operation/index.ts';
import { supervisorProxy } from '../scripts/supervisor.ts';

const identity = () => ({ root: 'V:\\disposable-fleetsplice', rootIdentity: 'a'.repeat(64), sid: 'S-fixture', principal: 'fixture', sessionId: 1, elevated: false as const });
const journalSchema = 'CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE evidence (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL); CREATE TABLE records (id TEXT PRIMARY KEY, digest TEXT NOT NULL, value TEXT NOT NULL); CREATE TABLE aliases (alias TEXT PRIMARY KEY, id TEXT NOT NULL, digest TEXT NOT NULL)';
function fixture(kind: 'none' | 'session' | 'terminal' | 'ambiguous' | 'multi' = 'none', runId: string = randomUUID(), eventBeforeResponse = false) {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-local-operation-')); const directory = path.join(base, runId); mkdirSync(directory);
  const guard = { state: 'RUNNING', runId, target: target(), identity: identity(), nativeExitObserved: false, quiescent: false };
  writeFileSync(path.join(base, 'environment-guard.json'), JSON.stringify(guard)); writeFileSync(path.join(directory, 'admission.json'), JSON.stringify({ runId, target: guard.target, identity: guard.identity }));
  const hub = new DatabaseSync(path.join(directory, 'hub.sqlite')); hub.exec(journalSchema); hub.close();
  const edge = new DatabaseSync(path.join(directory, 'edge.sqlite'));
  edge.exec(journalSchema);
  const append = (kindName: string, key: string, value: unknown) => edge.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run(kindName, key, JSON.stringify(value));
  if (kind !== 'none') {
    const instanceId = randomUUID(), threadId = randomUUID();
    const sessionCommand = randomUUID(); append('DISPATCH_ATTEMPT', sessionCommand, { attempted: true });
    append('NATIVE_PROCESS_IDENTITY', instanceId, { processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z', sid: 'S-fixture' });
    append('NATIVE_BINDING', sessionCommand, { threadId, processId: 901, instanceId });
    append('NATIVE_RESULT', sessionCommand, { code: 'NATIVE_SESSION_READY', nativeThreadId: threadId, nativeProcessId: 901, nativeInstanceId: instanceId });
    const appendTurn = (complete: boolean) => {
      const commandId = randomUUID(), turnId = randomUUID();
      append('DISPATCH_ATTEMPT', commandId, { attempted: true });
      if (eventBeforeResponse) append('NATIVE_EVENT', commandId, { kind: 'turnStarted', threadId, turnId, status: 'RUNNING' });
      append('NATIVE_RESULT', commandId, { code: 'NATIVE_TURN_ACCEPTED', nativeThreadId: threadId, nativeTurnId: turnId, nativeProcessId: 901, nativeInstanceId: instanceId });
      if (!eventBeforeResponse) append('NATIVE_EVENT', commandId, { kind: 'turnStarted', threadId, turnId, status: 'RUNNING' });
      if (complete) append('NATIVE_EVENT', commandId, { kind: 'turnCompleted', threadId, turnId, status: 'completed' });
    };
    if (kind !== 'session') appendTurn(kind === 'terminal' || kind === 'multi');
    if (kind === 'multi') appendTurn(false);
  }
  edge.close();
  return { base, guard, directory };
}
function unprovableEffectFixture(runId = G05C_P1_OWNER_RETIREMENT_RUN) {
  const state = fixture('terminal', runId);
  const edge = new DatabaseSync(path.join(state.directory, 'edge.sqlite'));
  edge.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('REJECTED_NATIVE_OBSERVATION', randomUUID(), JSON.stringify({ code: 'NATIVE_TOOL_SCOPE_VIOLATION' }));
  edge.close();
  return state;
}
const absent = () => ({ exists: false });
const noConflicts: any[] = [];

test('exact Node and native Codex discovery retain the accepted pins', () => {
  const node = discoverNode([process.execPath]); assert.equal(node.version, 'v24.20.0'); assert.equal(node.sqlite, '3.53.4');
  const codex = discoverCodex(candidateCodexPaths()); assert.match(codex.path, /codex\.exe$/i); assert.equal(codex.version, '0.153.4'); assert.equal(codex.sha256.length, 64);
});
test('persistent proxy configuration is private, atomic, fail-closed, and has the required precedence', async () => {
  const localAppData = mkdtempSync(path.join(tmpdir(), 'fleetsplice-proxy-config-'));
  const env = { LOCALAPPDATA: localAppData }; const config = userProxyConfigPath(env);
  const aclCalls: { target: string; sid: string; directory: boolean }[] = [];
  const recordAcl = (target: string, sid: string, directory: boolean) => { aclCalls.push({ target, sid, directory }); };
  const configured = writeUserProxyConfiguration('http://127.0.0.1:7890', 'S-1-5-21-100-200-300-400', env, recordAcl);
  assert.equal(configured.proxy, 'http://127.0.0.1:7890'); assert.deepEqual(JSON.parse(readFileSync(config, 'utf8')), { proxy: 'http://127.0.0.1:7890', version: 1 });
  assert.equal(aclCalls[0]?.target, path.dirname(config)); assert.equal(aclCalls[0]?.directory, true); assert.equal(aclCalls.at(-1)?.target, config); assert.equal(aclCalls.at(-1)?.directory, false);
  const explicit = resolveProxy({ ...env, HTTPS_PROXY: 'http://user:secret@127.0.0.1:7890' }, 'http://127.0.0.1:9999', 'http://127.0.0.1:9998', configured);
  assert.equal(explicit.source, 'explicit-env'); assert.equal(explicit.display, 'http://127.0.0.1:7890'); assert.equal(explicit.environment.HTTPS_PROXY, 'http://user:secret@127.0.0.1:7890');
  assert.equal(parseWindowsProxy('http=127.0.0.1:7890;https=127.0.0.1:7891'), 'http://127.0.0.1:7891');
  assert.equal(resolveProxy(env, '127.0.0.1:7890', '127.0.0.1:7892', configured).source, 'fleetsplice-user-config');
  const absent = readUserProxyConfiguration({ LOCALAPPDATA: mkdtempSync(path.join(tmpdir(), 'fleetsplice-proxy-none-')) });
  assert.equal(resolveProxy({}, '127.0.0.1:7890', '127.0.0.1:7892', absent).source, 'windows-user-proxy'); assert.equal(resolveProxy({}, null, '127.0.0.1:7892', absent).source, 'windows-system-proxy'); assert.equal(resolveProxy({}, null, null, absent).source, 'direct');
  const brokered = supervisorProxy({ HTTPS_PROXY: 'http://user:secret@127.0.0.1:7890', FLEETSPLICE_PROXY_SOURCE: 'windows-user-proxy' });
  assert.equal(brokered.source, 'windows-user-proxy'); assert.equal(brokered.display, 'http://127.0.0.1:7890');
  const failed = await networkPreflight(resolveProxy({}, null, null, absent), async () => false); assert.deepEqual(failed, { status: 'FAIL', networkReachable: false, provider: 'PROVIDER_NOT_YET_PROVEN', reason: 'NO_USABLE_NETWORK_ROUTE' });
  assert.equal(proxyConfigurationRequired(resolveProxy({}, null, null, absent), absent, failed.reason), true);
  const old = readFileSync(config); assert.throws(() => writeUserProxyConfiguration('http://127.0.0.1:7891', 'S-1-5-21-100-200-300-400', env, (target, sid, directory) => { if (!directory && target.endsWith('.tmp')) throw new Error('ACL_TEST_FAILURE'); recordAcl(target, sid, directory); }), /ACL_TEST_FAILURE/); assert.deepEqual(readFileSync(config), old, 'a failed replacement retains the prior valid configuration');
  writeFileSync(config, '{not-json'); const malformed = readUserProxyConfiguration(env); assert.equal(malformed.present, true); assert.equal(malformed.valid, false); assert.equal(resolveProxy(env, '127.0.0.1:7890', '127.0.0.1:7892', malformed).source, 'invalid', 'malformed configuration cannot silently fall through');
  assert.throws(() => writeUserProxyConfiguration('http://user:secret@127.0.0.1:7890', 'S-1-5-21-100-200-300-400', env, recordAcl), /PROXY_CREDENTIALS_UNSUPPORTED_SECURE_STORAGE_REQUIRED/);
  const sentinel = path.join(localAppData, 'unrelated.txt'); writeFileSync(sentinel, 'preserve'); writeUserProxyConfiguration('http://127.0.0.1:7890', 'S-1-5-21-100-200-300-400', env, recordAcl); assert.equal(clearUserProxyConfiguration('S-1-5-21-100-200-300-400', env, recordAcl).present, false); assert.equal(existsSync(sentinel), true, 'clear removes only FleetSplice-owned proxy configuration');
});
test('configure proxy supports URL, current environment, show, clear, and read-only reporting', () => {
  const localAppData = mkdtempSync(path.join(tmpdir(), 'fleetsplice-configure-cli-')); const cli = path.join(process.cwd(), 'test-results', 'compiled', 'scripts', 'fleetsplice.js');
  const noProxyEnvironment: NodeJS.ProcessEnv = { ...process.env, LOCALAPPDATA: localAppData };
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) delete noProxyEnvironment[key];
  const run = (environment: NodeJS.ProcessEnv, ...args: string[]) => spawnSync(process.execPath, [cli, 'configure', 'proxy', ...args], { cwd: process.cwd(), env: environment, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  const configured = run(noProxyEnvironment, '--url', 'http://127.0.0.1:7890'); assert.equal(configured.status, 0); assert.match(configured.stdout, /FLEETSPLICE_PROXY_CONFIGURATION_SAVED/); assert.match(configured.stdout, /fleetsplice-user-config/);
  const show = run(noProxyEnvironment, '--show'); assert.equal(show.status, 0); assert.match(show.stdout, /Proxy: http:\/\/127\.0\.0\.1:7890/); assert.match(show.stdout, /Proxy source: fleetsplice-user-config/);
  const status = spawnSync(process.execPath, [cli, 'status'], { cwd: process.cwd(), env: noProxyEnvironment, encoding: 'utf8', windowsHide: true, timeout: 20000 }); assert.equal(status.status, 0); assert.match(status.stdout, /Proxy source: fleetsplice-user-config/);
  const config = userProxyConfigPath(noProxyEnvironment); const beforeDoctor = readFileSync(config); const doctor = spawnSync(process.execPath, [cli, 'doctor'], { cwd: process.cwd(), env: noProxyEnvironment, encoding: 'utf8', windowsHide: true, timeout: 20000 }); assert.equal(doctor.status, 0); assert.match(doctor.stdout, /FleetSplice Doctor \(read-only\)/); assert.match(doctor.stdout, /Persistent proxy config syntax: valid/); assert.deepEqual(readFileSync(config), beforeDoctor, 'doctor does not mutate persistent configuration'); assert.equal(existsSync(path.join(localAppData, 'FleetSplice', 'G05', 'environment-guard.json')), false, 'doctor creates no guard');
  const fromEnvironment = { ...noProxyEnvironment, HTTP_PROXY: 'http://127.0.0.1:7891' }; const imported = run(fromEnvironment, '--from-current-env'); assert.equal(imported.status, 0); assert.match(imported.stdout, /127\.0\.0\.1:7891/); const importedShow = run(noProxyEnvironment, '--show'); assert.match(importedShow.stdout, /127\.0\.0\.1:7891/);
  const cleared = run(noProxyEnvironment, '--clear'); assert.equal(cleared.status, 0); assert.match(cleared.stdout, /FLEETSPLICE_PROXY_CONFIGURATION_CLEARED/); assert.equal(existsSync(config), false);
  const rejected = run(noProxyEnvironment, '--url', 'http://user:secret@127.0.0.1:7890'); assert.notEqual(rejected.status, 0); assert.match(`${rejected.stdout}\n${rejected.stderr}`, /PROXY_CREDENTIALS_UNSUPPORTED_SECURE_STORAGE_REQUIRED/); assert.equal(existsSync(config), false);
});
test('failed qualification creates no runtime guard', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-preflight-'));
  assert.throws(() => discoverNode([]), /NODE_RUNTIME_UNQUALIFIED/); assert.equal(existsSync(path.join(base, 'environment-guard.json')), false);
});
test('the preflight endpoint probe leaves no local listener or runtime guard', async () => {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-endpoint-')); await verifyLocalEndpointAvailability(`fixture-${randomUUID()}`, 0);
  assert.equal(existsSync(path.join(base, 'environment-guard.json')), false);
});
test('predecessor classifier distinguishes safe, terminal, ambiguous, live and corrupt state without writes', () => {
  const noEffect = fixture('none'); assert.equal(classifyPredecessor(noEffect.base, absent, noConflicts).kind, 'SAFE_NO_EFFECT');
  const sessionOnly = fixture('session'); assert.equal(classifyPredecessor(sessionOnly.base, absent, noConflicts).kind, 'SAFE_TERMINAL');
  const terminal = fixture('terminal'); assert.equal(classifyPredecessor(terminal.base, absent, noConflicts).kind, 'SAFE_TERMINAL');
  const responseAfterEvent = fixture('terminal', randomUUID(), true); assert.equal(classifyPredecessor(responseAfterEvent.base, absent, noConflicts).kind, 'SAFE_TERMINAL');
  const ambiguous = fixture('ambiguous'); const edgePath = path.join(ambiguous.directory, 'edge.sqlite'); const before = createHash('sha256').update(readFileSync(edgePath)).digest('hex');
  const result = classifyPredecessor(ambiguous.base, absent, noConflicts); assert.equal(result.kind, 'AMBIGUOUS_TERMINAL'); assert.equal(result.evidence.turnStarted, true); assert.equal(result.evidence.turnCompleted, false); assert.equal(result.exactNativeExitProven, true);
  assert.equal(createHash('sha256').update(readFileSync(edgePath)).digest('hex'), before, 'doctor/status classifier is read-only');
  const live = classifyPredecessor(ambiguous.base, () => ({ exists: true, identity: { processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z' } }), noConflicts); assert.equal(live.kind, 'LIVE_OR_CONFLICTING');
  const equivalentOffset = classifyPredecessor(ambiguous.base, () => ({ exists: true, identity: { processId: 901, creationTime: '2026-09-08T23:07:19.8913688+08:00' } }), noConflicts); assert.equal(equivalentOffset.kind, 'LIVE_OR_CONFLICTING'); assert.equal(equivalentOffset.exactNativeExitProven, false);
  assert.equal(classifyPredecessor(ambiguous.base, () => ({ exists: true, identity: { processId: 901, creationTime: 'not-a-time' } }), noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  assert.equal(classifyPredecessor(ambiguous.base, () => ({ exists: true }), noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const corrupt = fixture('none'); writeFileSync(path.join(corrupt.directory, 'admission.json'), '{}'); assert.equal(classifyPredecessor(corrupt.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
});
test('a completed earlier turn cannot erase a later unknown turn or admit automatic closure', () => {
  const state = fixture('multi'); const before = readFileSync(path.join(state.base, 'environment-guard.json'));
  const predecessor = classifyPredecessor(state.base, absent, noConflicts);
  assert.equal(predecessor.kind, 'AMBIGUOUS_TERMINAL'); assert.equal(predecessor.evidence.turnAccepted, true); assert.equal(predecessor.evidence.turnCompleted, false);
  assert.equal(Object.values(predecessor.evidence.turns).filter(turn => turn.completed).length, 1);
  assert.throws(() => closeSafePredecessor(state.base, absent, noConflicts), /SAFE_PREDECESSOR_CLOSURE_NOT_ADMITTED/);
  assert.deepEqual(readFileSync(path.join(state.base, 'environment-guard.json')), before);
});
test('retirement binds every result to one positive native process identity and preserves Hub evidence', () => {
  const contradictoryBinding = fixture('ambiguous');
  const bindingDb = new DatabaseSync(path.join(contradictoryBinding.directory, 'edge.sqlite'));
  const binding = bindingDb.prepare("SELECT value FROM evidence WHERE kind='NATIVE_BINDING'").get() as { value: string };
  bindingDb.prepare("UPDATE evidence SET value=? WHERE kind='NATIVE_BINDING'").run(JSON.stringify({ ...JSON.parse(binding.value), processId: 902 })); bindingDb.close();
  assert.equal(classifyPredecessor(contradictoryBinding.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const contradictoryThread = fixture('ambiguous');
  const threadDb = new DatabaseSync(path.join(contradictoryThread.directory, 'edge.sqlite'));
  const threadBinding = threadDb.prepare("SELECT value FROM evidence WHERE kind='NATIVE_BINDING'").get() as { value: string };
  threadDb.prepare("UPDATE evidence SET value=? WHERE kind='NATIVE_BINDING'").run(JSON.stringify({ ...JSON.parse(threadBinding.value), threadId: randomUUID() })); threadDb.close();
  assert.equal(classifyPredecessor(contradictoryThread.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const contradictoryEvent = fixture('ambiguous');
  const eventDb = new DatabaseSync(path.join(contradictoryEvent.directory, 'edge.sqlite'));
  const event = eventDb.prepare("SELECT value FROM evidence WHERE kind='NATIVE_EVENT' LIMIT 1").get() as { value: string };
  eventDb.prepare("UPDATE evidence SET value=? WHERE kind='NATIVE_EVENT' AND value=?").run(JSON.stringify({ ...JSON.parse(event.value), threadId: randomUUID() }), event.value); eventDb.close();
  assert.equal(classifyPredecessor(contradictoryEvent.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const contradictoryResult = fixture('ambiguous');
  const resultDb = new DatabaseSync(path.join(contradictoryResult.directory, 'edge.sqlite'));
  const result = resultDb.prepare("SELECT value FROM evidence WHERE kind='NATIVE_RESULT' AND key != (SELECT key FROM evidence WHERE kind='NATIVE_RESULT' LIMIT 1) LIMIT 1").get() as { value: string } | undefined;
  if (result) resultDb.prepare("UPDATE evidence SET value=? WHERE kind='NATIVE_RESULT' AND value=?").run(JSON.stringify({ ...JSON.parse(result.value), nativeInstanceId: randomUUID() }), result.value);
  resultDb.close();
  assert.equal(classifyPredecessor(contradictoryResult.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const invalidIdentity = fixture('ambiguous');
  const identityDb = new DatabaseSync(path.join(invalidIdentity.directory, 'edge.sqlite'));
  identityDb.prepare("UPDATE evidence SET value=? WHERE kind='NATIVE_PROCESS_IDENTITY'").run(JSON.stringify({ processId: 0, creationTime: '2026-09-08T15:07:19.8913688Z' })); identityDb.close();
  assert.equal(classifyPredecessor(invalidIdentity.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const missingHub = fixture('ambiguous'); unlinkSync(path.join(missingHub.directory, 'hub.sqlite'));
  assert.equal(classifyPredecessor(missingHub.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const unrelatedHub = fixture('ambiguous'); const hubDb = new DatabaseSync(path.join(unrelatedHub.directory, 'hub.sqlite')); hubDb.exec('DROP TABLE aliases'); hubDb.close();
  assert.equal(classifyPredecessor(unrelatedHub.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const noEffectNative = fixture('none'); const noEffectDb = new DatabaseSync(path.join(noEffectNative.directory, 'edge.sqlite'));
  noEffectDb.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('NATIVE_PROCESS_IDENTITY', randomUUID(), JSON.stringify({ processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z' })); noEffectDb.close();
  assert.equal(classifyPredecessor(noEffectNative.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const unboundEvent = fixture('none'); const unboundEventDb = new DatabaseSync(path.join(unboundEvent.directory, 'edge.sqlite'));
  unboundEventDb.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('NATIVE_EVENT', randomUUID(), JSON.stringify({ kind: 'delta', threadId: randomUUID(), turnId: randomUUID(), text: 'unbound' })); unboundEventDb.close();
  assert.equal(classifyPredecessor(unboundEvent.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const orphanedAmbiguity = fixture('none'); const ambiguityDb = new DatabaseSync(path.join(orphanedAmbiguity.directory, 'edge.sqlite'));
  ambiguityDb.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('AMBIGUOUS_EFFECT', randomUUID(), JSON.stringify({ code: 'NATIVE_EFFECT_UNKNOWN', nativeProcessId: null, nativeInstanceId: null })); ambiguityDb.close();
  assert.equal(classifyPredecessor(orphanedAmbiguity.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  const explicitAmbiguity = fixture('terminal'); const explicitDb = new DatabaseSync(path.join(explicitAmbiguity.directory, 'edge.sqlite'));
  const process = explicitDb.prepare("SELECT key,value FROM evidence WHERE kind='NATIVE_PROCESS_IDENTITY'").get() as { key: string; value: string };
  const accepted = explicitDb.prepare("SELECT key FROM evidence WHERE kind='NATIVE_RESULT' AND value LIKE '%NATIVE_TURN_ACCEPTED%'").get() as { key: string };
  explicitDb.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('AMBIGUOUS_EFFECT', accepted.key, JSON.stringify({ code: 'NATIVE_EFFECT_UNKNOWN', nativeProcessId: (JSON.parse(process.value) as { processId: number }).processId, nativeInstanceId: process.key })); explicitDb.close();
  assert.equal(classifyPredecessor(explicitAmbiguity.base, absent, noConflicts).kind, 'AMBIGUOUS_TERMINAL');
});
test('multiple bound native threads remain independently correlated', () => {
  const state = fixture('terminal'); const db = new DatabaseSync(path.join(state.directory, 'edge.sqlite'));
  const process = db.prepare("SELECT key,value FROM evidence WHERE kind='NATIVE_PROCESS_IDENTITY'").get() as { key: string; value: string };
  const proof = JSON.parse(process.value) as { processId: number }; const session = randomUUID(), turn = randomUUID(), thread = randomUUID(), turnId = randomUUID();
  const append = (kind: string, key: string, value: unknown) => db.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run(kind, key, JSON.stringify(value));
  append('DISPATCH_ATTEMPT', session, { attempted: true });
  append('NATIVE_BINDING', session, { processId: proof.processId, instanceId: process.key, threadId: thread });
  append('NATIVE_RESULT', session, { code: 'NATIVE_SESSION_READY', nativeProcessId: proof.processId, nativeInstanceId: process.key, nativeThreadId: thread });
  append('DISPATCH_ATTEMPT', turn, { attempted: true });
  append('NATIVE_RESULT', turn, { code: 'NATIVE_TURN_ACCEPTED', nativeProcessId: proof.processId, nativeInstanceId: process.key, nativeThreadId: thread, nativeTurnId: turnId });
  append('NATIVE_EVENT', turn, { kind: 'turnStarted', threadId: thread, turnId, status: 'RUNNING' });
  append('NATIVE_EVENT', turn, { kind: 'turnCompleted', threadId: thread, turnId, status: 'completed' }); db.close();
  assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'SAFE_TERMINAL');
});
test('malformed Edge blocker data is not healthy', () => {
  const state = fixture('none'); const db = new DatabaseSync(path.join(state.directory, 'edge.sqlite'));
  assert.equal(edgeAdmissionState(path.join(state.directory, 'edge.sqlite')), 'READY');
  db.prepare('INSERT INTO kv(key,value) VALUES(?,?)').run('blocked', 'null'); db.close();
  assert.equal(edgeAdmissionState(path.join(state.directory, 'edge.sqlite')), 'UNPROVABLE');
});
test('unknown-effect retirement preserves evidence, records UNKNOWN, and cannot replay or reuse the old run', () => {
  const state = fixture('ambiguous', G05B_OWNER_RETIREMENT_RUN); const original = readFileSync(path.join(state.directory, 'edge.sqlite'));
  const result = retireOwnerAuthorizedUnknown(state.base, G05B_OWNER_RETIREMENT_RUN, absent, noConflicts);
  const receipt = JSON.parse(readFileSync(result.receipt, 'utf8'));
  assert.equal(receipt.oldEffectOutcome, 'UNKNOWN'); assert.equal(receipt.oldCommandReplayed, false); assert.equal(receipt.oldAuthorityRuntimeRetired, true); assert.equal(receipt.freshIncarnationRequired, true);
  assert.deepEqual(readFileSync(path.join(state.directory, 'edge.sqlite')), original); assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'RETIRED_AMBIGUOUS');
  assert.throws(() => retireOwnerAuthorizedUnknown(state.base, G05B_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED|OWNER_RETIREMENT_ALREADY_RECORDED/);
});
test('retired state requires an intact bound receipt and remains blocked by live conflicts', () => {
  const state = fixture('ambiguous', G05B_OWNER_RETIREMENT_RUN); const retired = retireOwnerAuthorizedUnknown(state.base, G05B_OWNER_RETIREMENT_RUN, absent, noConflicts);
  const receipt = JSON.parse(readFileSync(retired.receipt, 'utf8')); chmodSync(retired.receipt, 0o600); receipt.oldCommandReplayed = true; writeFileSync(retired.receipt, JSON.stringify(receipt));
  assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
  receipt.oldCommandReplayed = false; writeFileSync(retired.receipt, JSON.stringify(receipt));
  assert.equal(classifyPredecessor(state.base, absent, [{ exists: true, name: 'node.exe' }]).kind, 'LIVE_OR_CONFLICTING');
});
test('only the exact unbound-effect custody state can be explicitly retired with UNKNOWN preserved', () => {
  const state = unprovableEffectFixture(); const original = readFileSync(path.join(state.directory, 'edge.sqlite'));
  const before = classifyPredecessor(state.base, absent, noConflicts);
  assert.equal(before.kind, 'CORRUPT_OR_UNPROVABLE'); assert.equal(before.reason, 'EFFECT_EVIDENCE_UNBOUND'); assert.equal(before.exactNativeExitProven, true);
  assert.equal(existsSync(path.join(state.base, 'retirements', G05C_P1_OWNER_RETIREMENT_RUN)), false, 'unbound evidence is never automatically retired');
  const retired = retireOwnerAuthorizedUnprovable(state.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts);
  const receipt = JSON.parse(readFileSync(retired.receipt, 'utf8'));
  assert.equal(receipt.kind, 'G05C_P1_OWNER_AUTHORIZED_UNPROVABLE_RETIREMENT'); assert.equal(receipt.oldClassification, 'CORRUPT_OR_UNPROVABLE'); assert.equal(receipt.oldReason, 'EFFECT_EVIDENCE_UNBOUND'); assert.equal(receipt.oldEffectOutcome, 'UNKNOWN'); assert.equal(receipt.oldCommandReplayed, false); assert.equal(receipt.exactNativeExitProven, true); assert.equal(receipt.oldAuthorityRuntimeRetired, true); assert.equal(receipt.freshIncarnationRequired, true);
  for (const item of receipt.evidence) { const preserved = path.join(path.dirname(retired.receipt), item.name); assert.equal(createHash('sha256').update(readFileSync(preserved)).digest('hex'), item.sha256); assert.equal(statSync(preserved).size, item.bytes); }
  assert.deepEqual(readFileSync(path.join(state.directory, 'edge.sqlite')), original, 'active historical evidence is never rewritten'); assert.deepEqual(readFileSync(path.join(path.dirname(retired.receipt), 'edge.sqlite')), original, 'the archive preserves the rejected observation byte-for-byte');
  const archive = new DatabaseSync(path.join(path.dirname(retired.receipt), 'edge.sqlite'), { readOnly: true }); try { assert.equal(archive.prepare("SELECT COUNT(*) AS count FROM evidence WHERE kind='REJECTED_NATIVE_OBSERVATION'").get()?.count, 1); } finally { archive.close(); }
  const guard = JSON.parse(readFileSync(path.join(state.base, 'environment-guard.json'), 'utf8'));
  assert.equal(guard.state, 'RETIRED_UNPROVABLE'); assert.notEqual(guard.state, 'CLOSED'); assert.notEqual(guard.state, 'SAFE_TERMINAL'); assert.equal(guard.oldEffectOutcome, 'UNKNOWN'); assert.equal(guard.oldCommandReplayed, false); assert.equal(guard.oldAuthorityRuntimeRetired, true); assert.equal(guard.freshIncarnationRequired, true);
  assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'RETIRED_UNPROVABLE'); assert.doesNotThrow(() => assertFreshIncarnation(receipt.oldTarget, target()), 'only a fresh successor identity is eligible later');
});
test('the separately Owner-authorized protocol-repair run is an exact additional retirement binding', () => {
  const state = unprovableEffectFixture(G05C_P1_PROTOCOL_REPAIR_RETIREMENT_RUN);
  const retired = retireOwnerAuthorizedUnprovable(state.base, G05C_P1_PROTOCOL_REPAIR_RETIREMENT_RUN, absent, noConflicts);
  const guard = JSON.parse(readFileSync(path.join(state.base, 'environment-guard.json'), 'utf8'));
  assert.equal(guard.state, 'RETIRED_UNPROVABLE'); assert.equal(guard.retiredBy, 'FLEETSPLICE-G05C-P1-PROTOCOL-CONFORMANCE-REPAIR-004');
  assert.equal(JSON.parse(readFileSync(retired.receipt, 'utf8')).runId, G05C_P1_PROTOCOL_REPAIR_RETIREMENT_RUN);
});
test('unprovable retirement rejects missing acknowledgement, wrong identity, live evidence, conflicts, damaged journals, and generic corruption', () => {
  const cli = path.join(process.cwd(), 'test-results', 'compiled', 'scripts', 'fleetsplice.js');
  const missingAcknowledgement = spawnSync(process.execPath, [cli, 'retire-stale', '--run', G05C_P1_OWNER_RETIREMENT_RUN], { cwd: process.cwd(), env: process.env, encoding: 'utf8', windowsHide: true });
  assert.notEqual(missingAcknowledgement.status, 0); assert.match(`${missingAcknowledgement.stdout}\n${missingAcknowledgement.stderr}`, /OWNER_RETIREMENT_ACKNOWLEDGEMENT_REQUIRED/);
  const wrongRun = spawnSync(process.execPath, [cli, 'retire-stale', '--run', randomUUID(), '--ack-unknown-effect'], { cwd: process.cwd(), env: process.env, encoding: 'utf8', windowsHide: true });
  assert.notEqual(wrongRun.status, 0); assert.match(`${wrongRun.stdout}\n${wrongRun.stderr}`, /OWNER_RETIREMENT_RUN_NOT_AUTHORIZED/);
  const live = unprovableEffectFixture(); const exact = () => ({ exists: true, identity: { processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z' } });
  assert.equal(classifyPredecessor(live.base, exact, noConflicts).kind, 'LIVE_OR_CONFLICTING'); assert.throws(() => retireOwnerAuthorizedUnprovable(live.base, G05C_P1_OWNER_RETIREMENT_RUN, exact, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED/);
  const reused = unprovableEffectFixture(); const reusedPid = () => ({ exists: true, identity: { processId: 901, creationTime: '2026-09-08T15:07:20.8913688Z' } });
  const reuseClassification = classifyPredecessor(reused.base, reusedPid, noConflicts); assert.equal(reuseClassification.kind, 'CORRUPT_OR_UNPROVABLE'); assert.equal(reuseClassification.exactNativeExitProven, true, 'a same PID with a distinct creation time is reuse, not the old process'); assert.doesNotThrow(() => retireOwnerAuthorizedUnprovable(reused.base, G05C_P1_OWNER_RETIREMENT_RUN, reusedPid, noConflicts));
  const conflict = unprovableEffectFixture(); assert.equal(classifyPredecessor(conflict.base, absent, [{ exists: true, name: 'node.exe' }]).kind, 'LIVE_OR_CONFLICTING'); assert.throws(() => retireOwnerAuthorizedUnprovable(conflict.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, [{ exists: true, name: 'node.exe' }]), /OWNER_RETIREMENT_ADMISSION_FAILED/);
  const unreadableJournal = unprovableEffectFixture(); unlinkSync(path.join(unreadableJournal.directory, 'hub.sqlite')); assert.throws(() => retireOwnerAuthorizedUnprovable(unreadableJournal.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED/);
  const mismatch = unprovableEffectFixture(); writeFileSync(path.join(mismatch.directory, 'admission.json'), '{}'); assert.throws(() => retireOwnerAuthorizedUnprovable(mismatch.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED/);
  const unreadableGuard = unprovableEffectFixture(); writeFileSync(path.join(unreadableGuard.base, 'environment-guard.json'), '{not-json'); assert.throws(() => retireOwnerAuthorizedUnprovable(unreadableGuard.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED/);
  const generic = fixture('none', G05C_P1_OWNER_RETIREMENT_RUN); const genericDb = new DatabaseSync(path.join(generic.directory, 'edge.sqlite')); genericDb.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run('NATIVE_PROCESS_IDENTITY', randomUUID(), JSON.stringify({ processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z' })); genericDb.close();
  assert.equal(classifyPredecessor(generic.base, absent, noConflicts).reason, 'NATIVE_EVIDENCE_WITHOUT_DISPATCH_ATTEMPT'); assert.throws(() => retireOwnerAuthorizedUnprovable(generic.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED/);
});
test('an unprovable retirement archive is revalidated and fails closed if tampered', () => {
  const state = unprovableEffectFixture(); const retired = retireOwnerAuthorizedUnprovable(state.base, G05C_P1_OWNER_RETIREMENT_RUN, absent, noConflicts);
  const receipt = JSON.parse(readFileSync(retired.receipt, 'utf8')); chmodSync(retired.receipt, 0o600); receipt.oldCommandReplayed = true; writeFileSync(retired.receipt, JSON.stringify(receipt));
  assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
});
test('an orphan FleetSplice process is a conflict even without a guard', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-orphan-'));
  assert.equal(classifyPredecessor(base, absent, [{ exists: true, name: 'node.exe' }]).kind, 'LIVE_OR_CONFLICTING');
});
test('a successor rejects every reusable authority, runtime, connection, or binding identifier', () => {
  const old = target(); const fresh = target(); assert.doesNotThrow(() => assertFreshIncarnation(old, fresh));
  assert.throws(() => assertFreshIncarnation(old, { ...fresh, authorityId: old.authorityId }), /PREDECESSOR_IDENTITY_REUSE/);
});
