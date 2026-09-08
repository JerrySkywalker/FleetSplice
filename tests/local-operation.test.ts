import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { target } from './helpers.ts';
import { candidateCodexPaths, classifyPredecessor, discoverCodex, discoverNode, G05B_OWNER_RETIREMENT_RUN, networkPreflight, parseWindowsProxy, resolveProxy, retireOwnerAuthorizedUnknown, verifyLocalEndpointAvailability } from '../packages/local-operation/index.ts';

const identity = () => ({ root: 'V:\\disposable-fleetsplice', rootIdentity: 'a'.repeat(64), sid: 'S-fixture', principal: 'fixture', sessionId: 1, elevated: false as const });
function fixture(kind: 'none' | 'terminal' | 'ambiguous' = 'none', runId = randomUUID()) {
  const base = mkdtempSync(path.join(tmpdir(), 'fleetsplice-local-operation-')); const directory = path.join(base, runId); mkdirSync(directory);
  const guard = { state: 'RUNNING', runId, target: target(), identity: identity(), nativeExitObserved: false, quiescent: false };
  writeFileSync(path.join(base, 'environment-guard.json'), JSON.stringify(guard)); writeFileSync(path.join(directory, 'admission.json'), JSON.stringify({ runId, target: guard.target, identity: guard.identity }));
  const edge = new DatabaseSync(path.join(directory, 'edge.sqlite'));
  edge.exec('CREATE TABLE evidence (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL)');
  const append = (kindName: string, key: string, value: unknown) => edge.prepare('INSERT INTO evidence(kind,key,value) VALUES(?,?,?)').run(kindName, key, JSON.stringify(value));
  if (kind !== 'none') {
    const instanceId = randomUUID(), threadId = randomUUID(), turnId = randomUUID();
    append('DISPATCH_ATTEMPT', randomUUID(), { attempted: true });
    append('NATIVE_PROCESS_IDENTITY', instanceId, { processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z', sid: 'S-fixture' });
    append('NATIVE_BINDING', randomUUID(), { threadId, processId: 901, instanceId });
    append('NATIVE_RESULT', randomUUID(), { code: 'NATIVE_SESSION_READY', nativeThreadId: threadId });
    append('NATIVE_RESULT', randomUUID(), { code: 'NATIVE_TURN_ACCEPTED', nativeThreadId: threadId, nativeTurnId: turnId });
    append('NATIVE_EVENT', randomUUID(), { kind: 'turnStarted', threadId, turnId, status: 'RUNNING' });
    if (kind === 'terminal') append('NATIVE_EVENT', randomUUID(), { kind: 'turnCompleted', threadId, turnId, status: 'completed' });
  }
  edge.close();
  return { base, guard, directory };
}
const absent = () => ({ exists: false });
const noConflicts: any[] = [];

test('exact Node and native Codex discovery retain the accepted pins', () => {
  const node = discoverNode([process.execPath]); assert.equal(node.version, 'v24.20.0'); assert.equal(node.sqlite, '3.53.4');
  const codex = discoverCodex(candidateCodexPaths()); assert.match(codex.path, /codex\.exe$/i); assert.equal(codex.sha256.length, 64);
});
test('proxy precedence is explicit environment, then Windows user configuration, then direct', async () => {
  const explicit = resolveProxy({ HTTPS_PROXY: 'http://user:secret@127.0.0.1:7890' }, 'http://127.0.0.1:9999');
  assert.equal(explicit.source, 'explicit-env'); assert.equal(explicit.display, 'http://127.0.0.1:7890'); assert.equal(explicit.environment.HTTPS_PROXY, 'http://user:secret@127.0.0.1:7890');
  assert.equal(parseWindowsProxy('http=127.0.0.1:7890;https=127.0.0.1:7891'), 'http://127.0.0.1:7891');
  assert.equal(resolveProxy({}, '127.0.0.1:7890').source, 'windows-user-proxy'); assert.equal(resolveProxy({}, null, '127.0.0.1:7892').source, 'windows-system-proxy'); assert.equal(resolveProxy({}, null, null).source, 'direct');
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
  const terminal = fixture('terminal'); assert.equal(classifyPredecessor(terminal.base, absent, noConflicts).kind, 'SAFE_TERMINAL');
  const ambiguous = fixture('ambiguous'); const edgePath = path.join(ambiguous.directory, 'edge.sqlite'); const before = createHash('sha256').update(readFileSync(edgePath)).digest('hex');
  const result = classifyPredecessor(ambiguous.base, absent, noConflicts); assert.equal(result.kind, 'AMBIGUOUS_TERMINAL'); assert.equal(result.evidence.turnStarted, true); assert.equal(result.evidence.turnCompleted, false); assert.equal(result.exactNativeExitProven, true);
  assert.equal(createHash('sha256').update(readFileSync(edgePath)).digest('hex'), before, 'doctor/status classifier is read-only');
  const live = classifyPredecessor(ambiguous.base, () => ({ exists: true, identity: { processId: 901, creationTime: '2026-09-08T15:07:19.8913688Z' } }), noConflicts); assert.equal(live.kind, 'LIVE_OR_CONFLICTING');
  const corrupt = fixture('none'); writeFileSync(path.join(corrupt.directory, 'admission.json'), '{}'); assert.equal(classifyPredecessor(corrupt.base, absent, noConflicts).kind, 'CORRUPT_OR_UNPROVABLE');
});
test('unknown-effect retirement preserves evidence, records UNKNOWN, and cannot replay or reuse the old run', () => {
  const state = fixture('ambiguous', G05B_OWNER_RETIREMENT_RUN); const original = readFileSync(path.join(state.directory, 'edge.sqlite'));
  const result = retireOwnerAuthorizedUnknown(state.base, G05B_OWNER_RETIREMENT_RUN, absent, noConflicts);
  const receipt = JSON.parse(readFileSync(result.receipt, 'utf8'));
  assert.equal(receipt.oldEffectOutcome, 'UNKNOWN'); assert.equal(receipt.oldCommandReplayed, false); assert.equal(receipt.oldAuthorityRuntimeRetired, true); assert.equal(receipt.freshIncarnationRequired, true);
  assert.deepEqual(readFileSync(path.join(state.directory, 'edge.sqlite')), original); assert.equal(classifyPredecessor(state.base, absent, noConflicts).kind, 'RETIRED_AMBIGUOUS');
  assert.throws(() => retireOwnerAuthorizedUnknown(state.base, G05B_OWNER_RETIREMENT_RUN, absent, noConflicts), /OWNER_RETIREMENT_ADMISSION_FAILED|OWNER_RETIREMENT_ALREADY_RECORDED/);
});
