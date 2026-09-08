// Separate process: only an isolated fixture home, no credentials or real model request.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { CodexDriver } from '../packages/driver-codex/index.ts';
import { NATIVE_POLICY_ARGS } from '../packages/driver-codex/policy.ts';

const [executable, root, scenario] = process.argv.slice(2) as [string, string, string];
assert.equal(process.env.FLEETSPLICE_NATIVE_POLICY_FIXTURE, root);
assert.equal(process.env.CODEX_HOME, path.join(root, 'native-home'));
assert.ok(existsSync(path.join(root, '.fleetsplice-native-policy-fixture')));
const fixtureHome = process.env.CODEX_HOME!;
const marker = path.join(root, 'integration-starts.jsonl');
const server = path.join(root, 'inert-server.cjs');
writeFileSync(server, `const fs=require('node:fs'),readline=require('node:readline');
fs.appendFileSync(process.argv[2],JSON.stringify({kind:'start',name:process.argv[3]})+'\\n');
readline.createInterface({input:process.stdin}).on('line',line=>{const m=JSON.parse(line);if(m.id===undefined)return;let result={};
if(m.method==='initialize')result={protocolVersion:m.params.protocolVersion,capabilities:{tools:{}},serverInfo:{name:'inert',version:'1'}};
if(m.method==='tools/list'){fs.appendFileSync(process.argv[2],JSON.stringify({kind:'tools',name:process.argv[3]})+'\\n');result={tools:[{name:'inert',description:'inert fixture',inputSchema:{type:'object'}}]};}
process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\\n');});`);
const pluginRoot = path.join(fixtureHome, 'plugins/cache/fixture/inert/local');
mkdirSync(path.join(pluginRoot, '.codex-plugin'), { recursive: true });
writeFileSync(path.join(pluginRoot, '.codex-plugin/plugin.json'), JSON.stringify({ name: 'inert', version: 'local', description: 'Inert startup qualification' }));
writeFileSync(path.join(pluginRoot, '.mcp.json'), JSON.stringify({ mcpServers: { plugin_inert: { command: process.execPath, args: [server, marker, 'plugin'] } } }));
const configPath = path.join(fixtureHome, 'config.toml');
const toml = `cli_auth_credentials_store="file"
model_provider="inert"
model="inert"
[model_providers.inert]
name="Inert fixture, no inference"
base_url="http://127.0.0.1:1/v1"
wire_api="responses"
requires_openai_auth=false
[features]
plugins=true
remote_plugin=false
hooks=true
[plugins."inert@fixture"]
enabled=true
[mcp_servers.inherited]
command=${JSON.stringify(process.execPath)}
args=${JSON.stringify([server, marker, 'mcp'])}
enabled=true
`;
writeFileSync(configPath, toml);
// Positive control proves this exact fixture is executable/loaded by the pin.
// These changes exist only in this isolated test process, never the product.
if (scenario === 'control') NATIVE_POLICY_ARGS.push('-c', 'features.plugins=true');
const driver = new CodexDriver(executable, root);
driver.signals.on('fault', () => {});
try {
  if (scenario === 'control') {
    await assert.rejects(driver.start(), /NATIVE_INTEGRATIONS_NOT_DISABLED/);
    const result = await (driver as any).rpc(randomUUID(), 'thread/start', { cwd: root, ephemeral: true, approvalPolicy: 'never', sandbox: 'read-only' });
    assert.ok(result.thread.id);
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline && (!existsSync(marker) || readFileSync(marker, 'utf8').split('\n').filter(Boolean).length < 4)) await new Promise(resolve => setTimeout(resolve, 50));
    const rows = readFileSync(marker, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    for (const name of ['mcp', 'plugin']) for (const kind of ['start', 'tools']) assert.ok(rows.some(row => row.name === name && row.kind === kind), `${name}:${kind}`);
    writeFileSync(path.join(root, 'result.json'), JSON.stringify({ scenario, result: 'PASS', rows }));
  } else {
    await driver.start();
    const thread = await driver.create(randomUUID(), root);
    assert.ok(thread.threadId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    assert.equal(existsSync(marker), false);
    writeFileSync(configPath, toml + '\n[mcp_servers.later]\ncommand="inert-never-start"\nenabled=true\n');
    await assert.rejects(driver.create(randomUUID(), root), /NATIVE_CONFIG_CHANGED/);
    assert.equal(existsSync(marker), false);
    writeFileSync(path.join(root, 'result.json'), JSON.stringify({ scenario, result: 'PASS', nativeThreadCreated: true, integrationStarts: 0, toolsListed: 0, configDriftRejected: true }));
  }
} catch (error) {
  console.log(error instanceof Error ? error.message : 'FIXTURE_FAILED'); process.exitCode = 1;
} finally {
  assert.equal(await driver.close(), true);
  if (scenario === 'suppressed') assert.equal(existsSync(marker), false);
  assert.equal(existsSync(path.join(fixtureHome, 'auth.json')), false);
}
