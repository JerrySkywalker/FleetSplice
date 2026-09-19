import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Fault } from '../packages/contracts/json.ts';
import type { NativeArtifactIdentity } from '../packages/native-adoption/types.ts';
import {
  DISCOVERY_AUTHORITY,
  HARNESS_NOT_YET_BOUND_REASON,
  classifyNativeLiveDiscovery,
  productDiscoveryErrorCode,
  runNativeLivePreflight,
  toResultJson,
} from '../scripts/accept-native-live-preflight.ts';

const qualifiedIdentity = (): NativeArtifactIdentity => ({
  executablePath: 'V:\\codex\\packages\\standalone\\current\\bin\\codex.exe',
  reportedVersion: '0.99.0-test',
  sha256: 'a'.repeat(64),
  processId: 4242,
  processCreationTime: '133700000000000000',
  endpoint: 'C:\\Users\\owner\\.codex\\app-server-control\\app-server-control.sock',
  endpointIdentity: 'c:\\users\\owner\\.codex\\app-server-control\\app-server-control.sock:133700000000000001',
  serverIncarnation: null,
});

test('product discovery error codes preserve Fault.code and Error.message exactly', () => {
  assert.equal(productDiscoveryErrorCode(new Fault('NATIVE_DAEMON_NOT_RUNNING')), 'NATIVE_DAEMON_NOT_RUNNING');
  assert.equal(productDiscoveryErrorCode(new Error('OFFICIAL_CODEX_UNAVAILABLE')), 'OFFICIAL_CODEX_UNAVAILABLE');
  assert.equal(productDiscoveryErrorCode(new Fault('NATIVE_ENDPOINT_UNQUALIFIED')), 'NATIVE_ENDPOINT_UNQUALIFIED');
  assert.equal(productDiscoveryErrorCode(42), 'UNEXPECTED_DISCOVERY_FAILURE');
});

test('daemon unavailable defers with exact product discovery error as REAL_DAEMON_PRECHECK', () => {
  const result = classifyNativeLiveDiscovery({ ok: false, error: 'NATIVE_DAEMON_NOT_RUNNING' });
  assert.equal(result.status, 'DEFERRED');
  assert.equal(result.realDaemonPrecheck, 'NATIVE_DAEMON_NOT_RUNNING');
  assert.equal(result.realDaemonHarness, null);
  assert.equal(result.daemon, null);
  assert.equal(result.discoveryAuthority, DISCOVERY_AUTHORITY);
  assert.equal(result.exitCode, 0);
  assert.match(result.reason, /REAL_DAEMON_PRECHECK=NATIVE_DAEMON_NOT_RUNNING/);
});

test('qualified daemon passes precheck and defers harness without broadening scope', () => {
  const identity = qualifiedIdentity();
  const result = classifyNativeLiveDiscovery({ ok: true, identity });
  assert.equal(result.status, 'DEFERRED');
  assert.equal(result.realDaemonPrecheck, 'PASS');
  assert.equal(result.realDaemonHarness, `DEFERRED_WITH_REASON=${HARNESS_NOT_YET_BOUND_REASON}`);
  assert.deepEqual(result.daemon, {
    processId: identity.processId,
    processCreationTime: identity.processCreationTime,
    executablePath: identity.executablePath,
    reportedVersion: identity.reportedVersion,
    endpoint: identity.endpoint,
    endpointIdentity: identity.endpointIdentity,
  });
  assert.equal(result.exitCode, 0);
});

test('runNativeLivePreflight reuses the injected discoverDaemon-equivalent callable', () => {
  let calls = 0;
  const result = runNativeLivePreflight(() => {
    calls += 1;
    return qualifiedIdentity();
  });
  assert.equal(calls, 1);
  assert.equal(result.realDaemonPrecheck, 'PASS');
  assert.equal(result.daemon?.processId, 4242);
  assert.equal(result.discoveryAuthority, DISCOVERY_AUTHORITY);
});

test('runNativeLivePreflight maps product discovery throw to deferred precheck', () => {
  const result = runNativeLivePreflight(() => {
    throw new Fault('NATIVE_DAEMON_STATUS_UNPROVABLE');
  });
  assert.equal(result.status, 'DEFERRED');
  assert.equal(result.realDaemonPrecheck, 'NATIVE_DAEMON_STATUS_UNPROVABLE');
  assert.equal(result.exitCode, 0);
});

test('contradictory daemon identity fails closed with nonzero exit', () => {
  const broken = qualifiedIdentity();
  broken.processId = 0;
  const result = classifyNativeLiveDiscovery({ ok: true, identity: broken });
  assert.equal(result.status, 'FAIL');
  assert.equal(result.realDaemonPrecheck, 'CONTRADICTORY_DAEMON_IDENTITY');
  assert.equal(result.exitCode, 1);
});

test('toResultJson evidence payload distinguishes precheck from harness deferral', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fleet-native-live-'));
  mkdirSync(dir, { recursive: true });
  const result = classifyNativeLiveDiscovery({ ok: true, identity: qualifiedIdentity() });
  const payload = toResultJson(result, '2026-09-19T00:00:00.000Z');
  const evidencePath = path.join(dir, 'result.json');
  writeFileSync(evidencePath, JSON.stringify(payload, null, 2));
  const written = JSON.parse(readFileSync(evidencePath, 'utf8'));
  assert.equal(written.status, 'DEFERRED');
  assert.equal(written.realDaemonPrecheck, 'PASS');
  assert.equal(written.realDaemonHarness, `DEFERRED_WITH_REASON=${HARNESS_NOT_YET_BOUND_REASON}`);
  assert.equal(written.discoveryAuthority, DISCOVERY_AUTHORITY);
  assert.equal(written.daemon.processId, 4242);
  assert.equal(written.finishedAt, '2026-09-19T00:00:00.000Z');
  assert.ok(Array.isArray(written.constraints));
  assert.ok(written.constraints.includes('product-equivalent discoverDaemon only'));
});

test('accept-native-live script reuses product discovery and does not guess socket filenames', () => {
  const script = readFileSync(path.join(process.cwd(), 'scripts', 'accept-native-live.ts'), 'utf8');
  const preflight = readFileSync(path.join(process.cwd(), 'scripts', 'accept-native-live-preflight.ts'), 'utf8');
  assert.match(preflight, /from '\.\.\/packages\/native-adoption\/discovery\.ts'/);
  assert.match(preflight, /discoverDaemon/);
  assert.match(script, /accept-native-live-preflight/);
  assert.match(script, /runNativeLivePreflight/);
  for (const forbidden of ['codex-app-server.sock', 'app-server.sock', 'native.sock', 'findCodexSocket']) {
    assert.equal(script.includes(forbidden), false, `script must not contain ${forbidden}`);
    assert.equal(preflight.includes(forbidden), false, `preflight must not contain ${forbidden}`);
  }
});
