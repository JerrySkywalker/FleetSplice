import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Fault } from '../packages/contracts/index.ts';
import {
  DEMO_WORKSPACE,
  proveNativeAdoptionWorkspace,
  resolveNativeAdoptionWorkspace,
  startNativeDemo,
} from '../scripts/native-demo.ts';

test('default historical native-demo remains compatible with the disposable fixture', () => {
  assert.equal(resolveNativeAdoptionWorkspace('native-demo', ['native-demo']), DEMO_WORKSPACE);
  assert.equal(DEMO_WORKSPACE, 'V:\\artifacts\\FleetSplice\\demo-native-adoption\\workspace');
});

test('explicit --workspace reaches the exact requested root and is never replaced by the demo fixture', async () => {
  const requested = mkdtempSync(path.join(tmpdir(), 'fleetsplice-adopt-ws-'));
  assert.equal(resolveNativeAdoptionWorkspace('native-demo', ['native-demo', '--workspace', requested]), requested);
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
  assert.match(fleetsplice, /startNativeDemo/);
  assert.doesNotMatch(nativeDemo, /\bdiscoverCodex\b/);
  assert.doesNotMatch(nativeDemo, /\bcandidateCodexPaths\b/);
});
