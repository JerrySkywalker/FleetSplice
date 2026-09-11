import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertPolicyUnchanged, DISABLED_FEATURES, integrationPolicy } from '../packages/driver-codex/policy.ts';
import { observePermission, permissionRequest } from '../packages/driver-codex/permissions.ts';

const root = 'V:\\fixture';
function response(): any {
  return { config: { notify: [], agents: { enabled: false }, web_search: 'disabled', approval_policy: 'never', sandbox_mode: 'read-only', features: { ...Object.fromEntries(DISABLED_FEATURES.map(key => [key, false])), multi_agent_v2: { enabled: false } }, mcp_servers: { disabled: { command: 'inert' } }, projects: { [root.toLowerCase()]: { trust_level: 'trusted' } } }, origins: { sandbox_mode: { name: { type: 'sessionFlags' }, version: 'v1' }, model: { name: { type: 'user', file: 'C:\\fixture-home\\config.toml' }, version: 'v1' }, projects: { name: { type: 'user', file: 'C:\\fixture-home\\config.toml' }, version: 'v1' } } };
}
test('unrelated trust and whole-file origin version do not define the active security identity', () => {
  const before = response(), after = structuredClone(before);
  after.config.projects['V:\\unrelated'] = { trust_level: 'trusted' };
  after.origins.model.version = 'v2'; after.origins.projects.version = 'v2';
  assert.notDeepEqual(before, after);
  assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(after, root));
  delete after.config.projects['V:\\unrelated'];
  assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(after, root));
});
test('active exact Workspace trust drift and ambiguous aliases fail closed', () => {
  for (const state of ['untrusted', null]) {
    const before = response(), after = structuredClone(before);
    if (state) after.config.projects[root.toLowerCase()].trust_level = state;
    else delete after.config.projects[root.toLowerCase()];
    assert.throws(() => assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(after, root)), /ACTIVE_WORKSPACE_TRUST_CHANGED/);
  }
  const value = response(); value.config.projects['v:/fixture'] = { trust_level: 'trusted' };
  assert.throws(() => integrationPolicy(value, root), /TRUST_UNQUALIFIED/);
});

test('active trust origin relocation fails closed for aggregate and leaf origins', () => {
  for (const key of ['projects', `projects.${root.toLowerCase()}`, `projects.${root.toLowerCase()}.trust_level`]) {
    const before = response(); before.origins[key] = { name: { type: 'user', file: 'C:\\fixture-home\\config.toml' }, version: 'v1' };
    const after = structuredClone(before); after.origins[key].name = { type: 'project', dotCodexFolder: 'V:\\fixture\\.codex' };
    assert.throws(() => assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(after, root)), /ACTIVE_WORKSPACE_TRUST_CHANGED/);
  }
});
test('non-trust project origins stay guarded while unrelated trust leaf origins are ignored', () => {
  const before = response();
  before.config.projects['V:\\other'] = { trust_level: 'trusted', additional_setting: false };
  before.origins['projects.V:\\other.additional_setting'] = { name: { type: 'user', file: 'C:\\fixture-home\\config.toml' }, version: 'v1' };
  const moved = structuredClone(before); moved.origins['projects.V:\\other.additional_setting'].name.file = 'C:\\managed\\config.toml';
  assert.throws(() => assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(moved, root)), /NATIVE_CONFIG_CHANGED/);
  const unrelated = structuredClone(before); unrelated.origins['projects.V:\\other.trust_level'] = { name: { type: 'user', file: 'C:\\other\\config.toml' }, version: 'v2' };
  unrelated.config.projects['V:\\other'].trust_level = 'untrusted';
  assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(unrelated, root));
});
test('safety integrations, MCP transport, origin identity and unexpected native deltas fail closed', () => {
  for (const change of [
    (x: any) => { x.config.features.hooks = true; },
    (x: any) => { x.config.notify = ['unexpected']; },
    (x: any) => { x.config.mcp_servers.disabled.command = 'new-transport'; },
    (x: any) => { x.origins.model.name.file = 'C:\\other\\config.toml'; },
    (x: any) => { x.config.unknown_native_authority = true; },
    (x: any) => { x.config.projects['V:\\other'] = { unknown_authority: true }; }
  ]) {
    const before = response(), after = structuredClone(before); change(after);
    assert.throws(() => assertPolicyUnchanged(integrationPolicy(before, root), integrationPolicy(after, root)), /NATIVE_/);
  }
});
test('admitted session permission settings stay separate from safety and reject additional sandbox deltas', () => {
  const baseline = integrationPolicy(response(), root);
  for (const preset of ['READ_ONLY', 'WORKSPACE_AUTO', 'YOLO'] as const) {
    const requested = permissionRequest(preset);
    assert.equal(requested.approvalPolicy, 'never');
    const sandbox = preset === 'READ_ONLY' ? { type: 'readOnly', networkAccess: false } : preset === 'YOLO' ? { type: 'dangerFullAccess' } : { type: 'workspaceWrite', networkAccess: false, writableRoots: [], excludeTmpdirEnvVar: true, excludeSlashTmp: true };
    assert.equal(observePermission(preset, { approvalPolicy: 'never', sandbox }).preset, preset);
    assertPolicyUnchanged(baseline, integrationPolicy(response(), root));
    assert.throws(() => observePermission(preset, { approvalPolicy: 'never', sandbox: { ...sandbox, extraAuthority: true } }), /UNOBSERVED/);
  }
});
test('P2B native permission adapter has no persistent config write API or filesystem writer', () => {
  for (const file of ['packages/driver-codex/index.ts', 'packages/driver-codex/permissions.ts', 'packages/driver-codex/policy.ts']) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /config\/(value\/write|batchWrite)|\b(?:writeFile\w*|appendFile\w*|writeSync|createWriteStream)\b/);
  }
});
