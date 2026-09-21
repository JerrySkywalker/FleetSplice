import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultRuntimeSharing, mayShareWorkspace, runtimeRegistry, updateSharing, validateRuntimeSharing } from '../packages/agent-runtime/index.ts';

test('Codex is a real shared runtime by default while AGY is explicitly unavailable', () => {
  const runtimes = runtimeRegistry({ sharing: defaultRuntimeSharing(), codexInstalled: true, health: 'healthy', discoveredSessions: 3, evidence: 'native inventory observed' });
  assert.deepEqual(runtimes[0], { adapterId: 'codex-native', kind: 'Codex', installed: true, discoverable: true, enabled: true, shared: true, status: 'healthy', discoveredSessions: 3, evidence: 'native inventory observed' });
  assert.deepEqual(runtimes[1], { adapterId: 'agy', kind: 'AGY', installed: false, discoverable: false, enabled: false, shared: false, status: 'unavailable', discoveredSessions: 0, evidence: 'AGY native contract is not implemented; no control or discovery is claimed.' });
});

test('allowed roots preserve exact sharing boundaries and can leave Codex installed but unshared', () => {
  const sharing = validateRuntimeSharing({ adapterId: 'codex-native', enabled: true, shared: true, scope: { kind: 'ALLOWED_ROOTS', roots: ['V:\\src\\FleetSplice'] } });
  assert.equal(mayShareWorkspace(sharing, 'v:\\src\\fleetsplice'), true);
  assert.equal(mayShareWorkspace(sharing, 'V:\\src\\other'), false);
  const unshared = updateSharing(sharing, { adapterId: 'codex-native', enabled: true, shared: false, scope: { kind: 'ALL_ELIGIBLE' } });
  assert.equal(mayShareWorkspace(unshared, 'V:\\src\\FleetSplice'), false);
  assert.throws(() => validateRuntimeSharing({ adapterId: 'codex-native', enabled: true, shared: true, scope: { kind: 'ALLOWED_ROOTS', roots: [] } }), /RUNTIME_SHARING_SCOPE_INVALID/);
});
