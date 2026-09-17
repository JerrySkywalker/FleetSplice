import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Fault } from '../packages/contracts/index.ts';
import {
  DEMO_WORKSPACE,
  LEGACY_NATIVE_ADOPTION_DEMO_STATE,
  NATIVE_ADOPTION_STATE_NAMESPACE,
  isHistoricalNativeDemoRoute,
  proveNativeAdoptionWorkspace,
  resolveNativeAdoptionStateDirectory,
  resolveNativeAdoptionWorkspace,
  startNativeDemo,
} from '../scripts/native-demo.ts';

const fixtureAppData = () => mkdtempSync(path.join(tmpdir(), 'fleetsplice-native-state-'));
const identityA = 'a'.repeat(64);
const identityB = 'b'.repeat(64);

test('default historical native-demo remains compatible with the disposable fixture', () => {
  assert.equal(resolveNativeAdoptionWorkspace('native-demo', ['native-demo']), DEMO_WORKSPACE);
  assert.equal(DEMO_WORKSPACE, 'V:\\artifacts\\FleetSplice\\demo-native-adoption\\workspace');
  assert.equal(isHistoricalNativeDemoRoute('native-demo', ['native-demo']), true);
});

test('explicit --workspace reaches the exact requested root and is never replaced by the demo fixture', async () => {
  const requested = mkdtempSync(path.join(tmpdir(), 'fleetsplice-adopt-ws-'));
  assert.equal(resolveNativeAdoptionWorkspace('native-demo', ['native-demo', '--workspace', requested]), requested);
  assert.equal(isHistoricalNativeDemoRoute('native-demo', ['native-demo', '--workspace', requested]), false);
  assert.equal(isHistoricalNativeDemoRoute('adopt', ['adopt', '--workspace', requested]), false);
  assert.notEqual(requested.toLowerCase(), DEMO_WORKSPACE.toLowerCase());
  const identity = await proveNativeAdoptionWorkspace(requested);
  assert.equal(identity.root.toLowerCase(), path.resolve(requested).toLowerCase());
  assert.notEqual(identity.root.toLowerCase(), DEMO_WORKSPACE.toLowerCase());
});

test('adopt --workspace uses the same workspace resolution implementation as native-demo', () => {
  const requested = 'V:\\some\\existing\\project';
  assert.equal(
    resolveNativeAdoptionWorkspace('adopt', ['adopt', '--workspace', requested]),
    resolveNativeAdoptionWorkspace('native-demo', ['native-demo', '--workspace', requested]),
  );
  assert.equal(typeof startNativeDemo, 'function');
});

test('missing workspace argument for adopt fails closed', () => {
  assert.throws(() => resolveNativeAdoptionWorkspace('adopt', ['adopt']), (error: unknown) => {
    assert.ok(error instanceof Fault);
    assert.equal(error.code, 'USAGE_FLEETSPLICE_ADOPT_WORKSPACE');
    return true;
  });
  assert.throws(() => resolveNativeAdoptionWorkspace('adopt', ['adopt', '--workspace']), (error: unknown) => {
    assert.ok(error instanceof Fault);
    assert.equal(error.code, 'USAGE_FLEETSPLICE_ADOPT_WORKSPACE');
    return true;
  });
});

test('relative or nonexistent paths fail closed before native adoption starts', async () => {
  assert.equal(resolveNativeAdoptionWorkspace('adopt', ['adopt', '--workspace', 'relative\\path']), 'relative\\path');
  await assert.rejects(proveNativeAdoptionWorkspace('relative\\path'), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
  await assert.rejects(proveNativeAdoptionWorkspace('relative'), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
  const missing = path.join('V:\\', `fleetsplice-missing-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  assert.equal(existsSync(missing), false);
  await assert.rejects(proveNativeAdoptionWorkspace(missing), /WORKSPACE_ROOT_MISSING/);
});

test('A: no-argument native-demo keeps the legacy state namespace', () => {
  const localAppData = fixtureAppData();
  const legacy = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: true,
    rootIdentity: identityA,
    localAppData,
  });
  assert.equal(legacy, path.join(localAppData, 'FleetSplice', LEGACY_NATIVE_ADOPTION_DEMO_STATE));
  assert.match(legacy, new RegExp(`${LEGACY_NATIVE_ADOPTION_DEMO_STATE}$`));
  assert.doesNotMatch(legacy, new RegExp(`${NATIVE_ADOPTION_STATE_NAMESPACE}\\\\${identityA}$`));
});

test('B/C/D/E/F: explicit Workspace state is rootIdentity-scoped and stable', () => {
  const localAppData = fixtureAppData();
  const stateA = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false,
    rootIdentity: identityA,
    localAppData,
  });
  const stateB = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false,
    rootIdentity: identityB,
    localAppData,
  });
  const stateAAgain = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false,
    rootIdentity: identityA,
    localAppData,
  });
  const replacedIdentity = 'c'.repeat(64);
  const stateReplaced = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false,
    rootIdentity: replacedIdentity,
    localAppData,
  });
  const legacy = path.join(localAppData, 'FleetSplice', LEGACY_NATIVE_ADOPTION_DEMO_STATE);

  // B: Workspace A resolves under native-adoption\<rootIdentity-A>
  assert.equal(stateA, path.join(localAppData, 'FleetSplice', NATIVE_ADOPTION_STATE_NAMESPACE, identityA));
  // C: Workspace B with another root identity resolves elsewhere
  assert.equal(stateB, path.join(localAppData, 'FleetSplice', NATIVE_ADOPTION_STATE_NAMESPACE, identityB));
  assert.notEqual(stateA, stateB);
  // D: repeated resolution for A is stable
  assert.equal(stateAAgain, stateA);
  // E: explicit routes do not resolve to native-adoption-demo
  assert.notEqual(stateA, legacy);
  assert.notEqual(stateB, legacy);
  assert.doesNotMatch(stateA, new RegExp(`${LEGACY_NATIVE_ADOPTION_DEMO_STATE}$`));
  assert.doesNotMatch(stateB, new RegExp(`${LEGACY_NATIVE_ADOPTION_DEMO_STATE}$`));
  // F: replacing/changing root identity produces a new namespace
  assert.notEqual(stateReplaced, stateA);
  assert.equal(stateReplaced, path.join(localAppData, 'FleetSplice', NATIVE_ADOPTION_STATE_NAMESPACE, replacedIdentity));
});

test('explicit demo path still uses scoped journal, never the legacy demo namespace', () => {
  const localAppData = fixtureAppData();
  assert.equal(isHistoricalNativeDemoRoute('native-demo', ['native-demo', '--workspace', DEMO_WORKSPACE]), false);
  const scoped = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false,
    rootIdentity: identityA,
    localAppData,
  });
  assert.equal(scoped, path.join(localAppData, 'FleetSplice', NATIVE_ADOPTION_STATE_NAMESPACE, identityA));
  assert.notEqual(scoped, path.join(localAppData, 'FleetSplice', LEGACY_NATIVE_ADOPTION_DEMO_STATE));
});

test('state isolation is by directory construction so restoreInput cannot inherit another Workspace journal', () => {
  // nativeAdoptionEdge opens <stateDirectory>\\native-edge.sqlite and restores
  // only from that journal. Distinct rootIdentity directories make cross-Workspace
  // restoreInput inheritance impossible without path filtering.
  const localAppData = fixtureAppData();
  const journalA = path.join(resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false, rootIdentity: identityA, localAppData,
  }), 'native-edge.sqlite');
  const journalB = path.join(resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: false, rootIdentity: identityB, localAppData,
  }), 'native-edge.sqlite');
  const legacyJournal = path.join(resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: true, rootIdentity: identityA, localAppData,
  }), 'native-edge.sqlite');
  assert.notEqual(journalA, journalB);
  assert.notEqual(journalA, legacyJournal);
  assert.notEqual(journalB, legacyJournal);
});

test('native-adoption entrypoint does not consult managed Codex version or SHA pins', () => {
  const nativeDemo = readFileSync(path.join(process.cwd(), 'scripts', 'native-demo.ts'), 'utf8');
  const fleetsplice = readFileSync(path.join(process.cwd(), 'scripts', 'fleetsplice.ts'), 'utf8');
  for (const source of [nativeDemo, fleetsplice]) {
    assert.doesNotMatch(source, /\bQUALIFIED_CODEX_VERSION\b/);
    assert.doesNotMatch(source, /\bCODEX_SHA256\b/);
    assert.doesNotMatch(source, /driver-codex/);
  }
  // fleetsplice still imports discoverCodex for managed start/status; the shared
  // native-adoption command path must not invoke those symbols.
  assert.match(fleetsplice, /command === 'native-demo' \|\| command === 'adopt'/);
  assert.match(fleetsplice, /resolveNativeAdoptionWorkspace/);
  assert.match(fleetsplice, /isHistoricalNativeDemoRoute/);
  assert.match(fleetsplice, /historicalCompatibilityRoute/);
  assert.match(fleetsplice, /startNativeDemo/);
  assert.match(nativeDemo, /resolveNativeAdoptionStateDirectory/);
  assert.doesNotMatch(nativeDemo, /\bdiscoverCodex\b/);
  assert.doesNotMatch(nativeDemo, /\bcandidateCodexPaths\b/);
});
