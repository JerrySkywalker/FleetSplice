import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DISABLED_FEATURES, integrationPolicy } from '../packages/driver-codex/policy.ts';

test('native policy disables every inherited MCP name and rejects unqualified integration switches', () => {
  const response = { config: { notify: [], agents: { enabled: false }, web_search: 'disabled', approval_policy: 'never', sandbox_mode: 'read-only', features: { ...Object.fromEntries(DISABLED_FEATURES.map(name => [name, false])), multi_agent_v2: { enabled: false } }, mcp_servers: JSON.parse('{"a.b":{"enabled":true},"__proto__":{"enabled":true}}') }, origins: {} };
  const policy = integrationPolicy(response);
  assert.deepEqual(Object.keys(policy.overrides.mcp_servers), ['a.b', '__proto__']);
  assert.ok(Object.values(policy.overrides.mcp_servers).every(value => value.enabled === false));
  assert.equal(policy.stamp, integrationPolicy(structuredClone(response)).stamp);
  for (const name of DISABLED_FEATURES) {
    assert.throws(() => integrationPolicy({ ...response, config: { ...response.config, features: { ...response.config.features, [name]: true } } }), /NATIVE_INTEGRATIONS_NOT_DISABLED/);
  }
  assert.throws(() => integrationPolicy({ ...response, config: { ...response.config, mcp_servers: [] } }), /NATIVE_MCP_CONFIG_UNQUALIFIED/);
  assert.throws(() => integrationPolicy({ ...response, config: { ...response.config, notify: ['inert'] } }), /NATIVE_NOTIFY_NOT_DISABLED/);
  assert.throws(() => integrationPolicy({ ...response, config: { ...response.config, web_search: 'live' } }), /NATIVE_POLICY_UNQUALIFIED/);
  assert.throws(() => integrationPolicy({ ...response, config: { ...response.config, agents: { enabled: true } } }), /NATIVE_AGENTS_NOT_DISABLED/);
});

test('pinned native binary suppresses inherited integrations, notify and image tools, with a final effect gate', { timeout: 90000 }, async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-native-policy-'));
  const executable = path.join(process.env.APPDATA!, 'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe');
  const worker = fileURLToPath(new URL('./native-policy-worker.js', import.meta.url));
  const results: Record<string, unknown> = {};
  for (const scenario of ['suppressed', 'control']) {
    const root = path.join(directory, scenario); const fixtureHome = path.join(root, 'native-home');
    mkdirSync(fixtureHome, { recursive: true });
    writeFileSync(path.join(root, '.fleetsplice-native-policy-fixture'), 'inert; no credentials; loopback provider fixture only');
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => ['SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'PROGRAMDATA', 'HOMEDRIVE', 'HOMEPATH'].includes(key.toUpperCase())));
    env.CODEX_HOME = fixtureHome; env.FLEETSPLICE_NATIVE_POLICY_FIXTURE = root;
    env.CODEX_INTERNAL_APP_SERVER_REMOTE_CONTROL_DISABLED = '0';
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [worker, executable, root, scenario], { env, cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      let output = ''; child.stdout.on('data', bytes => { output += String(bytes); });
      child.stderr.on('data', () => {});
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`NATIVE_FIXTURE_FAILED:${scenario}:${code}:${output.slice(0, 200)}`)));
    });
    results[scenario] = JSON.parse(readFileSync(path.join(root, 'result.json'), 'utf8'));
  }
  console.log(JSON.stringify({ qualification: 'INERT_NATIVE_INTEGRATION_FIXTURE', directory, results }));
});
