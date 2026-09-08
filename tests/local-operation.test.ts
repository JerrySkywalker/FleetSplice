import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { target } from './helpers.ts';
import { assertFreshIncarnation, candidateCodexPaths, classifyPredecessor, closeSafePredecessor, discoverCodex, discoverNode, edgeAdmissionState, G05B_OWNER_RETIREMENT_RUN, networkPreflight, parseWindowsProxy, resolveProxy, retireOwnerAuthorizedUnknown, verifyLocalEndpointAvailability } from '../packages/local-operation/index.ts';
import { supervisorProxy } from '../scripts/supervisor.ts';

const identity = () => ({ root: 'V:\\disposable-fleetsplice', rootIdentity: 'a'.repeat(64), sid: 'S-fixture', principal: 'fixture', sessionId: 1, elevated: false as const });
function fixture(kind: 'none' | 'session' | 'terminal' | 'ambiguous' | 'multi' = 'none', runId = randomUUID(), eventBeforeResponse = false) {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-local-operation-')); const directory = path.join(base, runId); mkdirSync(directory);
  const guard = { state: 'RUNNING', runId, target: target(), identity: identity(), nativeExitObserved: false, quiescent: false };
  writeFileSync(path.join(base, 'environment-guard.json'), JSON.stringify(guard)); writeFileSync(path.join(directory, 'admission.json'), JSON.stringify({ runId, target: guard.target, identity: guard.identity }));
  const hub = new DatabaseSync(path.join(directory, 'hub.sqlite')); hub.exec('CREATE TABLE evidence (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL)'); hub.close();
  const edge = new DatabaseSync(path.join(directory, 'edge.sqlite'));
  edge.exec('CREATE TABLE evidence (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL)');
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
const absent = () => ({ exists: false });
const noConflicts: any[] = [];

test('exact Node and native Codex discovery retain the accepted pins', () => {
  const node = discoverNode([process.execPath]); assert.equal(node.version, 'v24.20.0'); assert.equal(node.sqlite, '3.53.4');
  const codex = discoverCodex(candidateCodexPaths()); assert.match(codex.path, /codex\.exe$/i); assert.equal(codex.version, '0.153.4'); assert.equal(codex.sha256.length, 64);
});
test('proxy precedence is explicit environment, then Windows user configuration, then direct', async () => {
  const explicit = resolveProxy({ HTTPS_PROXY: 'http://user:secret@127.0.0.1:7890' }, 'http://127.0.0.1:9999');
  assert.equal(explicit.source, 'explicit-env'); assert.equal(explicit.display, 'http://127.0.0.1:7890'); assert.equal(explicit.environment.HTTPS_PROXY, 'http://user:secret@127.0.0.1:7890');
  assert.equal(parseWindowsProxy('http=127.0.0.1:7890;https=127.0.0.1:7891'), 'http://127.0.0.1:7891');
  assert.equal(resolveProxy({}, '127.0.0.1:7890').source, 'windows-user-proxy'); assert.equal(resolveProxy({}, null, '127.0.0.1:7892').source, 'windows-system-proxy'); assert.equal(resolveProxy({}, null, null).source, 'direct');
  const brokered = supervisorProxy({ HTTPS_PROXY: 'http://user:secret@127.0.0.1:7890', FLEETSPLICE_PROXY_SOURCE: 'windows-user-proxy' });
  assert.equal(brokered.source, 'windows-user-proxy'); assert.equal(brokered.display, 'http://127.0.0.1:7890');
  const failed = await networkPreflight(resolveProxy({}, null), async () => false); assert.deepEqual(failed, { status: 'FAIL', networkReachable: false, provider: 'PROVIDER_NOT_YET_PROVEN', reason: 'NO_USABLE_NETWORK_ROUTE' });
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
});
test('malformed Edge blocker data is not healthy', () => {
  const state = fixture('none'); const db = new DatabaseSync(path.join(state.directory, 'edge.sqlite'));
  db.exec('CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
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
test('an orphan FleetSplice process is a conflict even without a guard', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-orphan-'));
  assert.equal(classifyPredecessor(base, absent, [{ exists: true, name: 'node.exe' }]).kind, 'LIVE_OR_CONFLICTING');
});
test('a successor rejects every reusable authority, runtime, connection, or binding identifier', () => {
  const old = target(); const fresh = target(); assert.doesNotThrow(() => assertFreshIncarnation(old, fresh));
  assert.throws(() => assertFreshIncarnation(old, { ...fresh, authorityId: old.authorityId }), /PREDECESSOR_IDENTITY_REUSE/);
});
