// Separate process: isolated fixture home, no credentials; loopback provider only.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { CodexDriver } from '../packages/driver-codex/index.ts';
import { NATIVE_POLICY_ARGS } from '../packages/driver-codex/policy.ts';

const [executable, root, scenario] = process.argv.slice(2) as [string, string, string];
assert.equal(process.env.FLEETSPLICE_NATIVE_POLICY_FIXTURE, root);
assert.equal(process.env.CODEX_HOME, path.join(root, 'native-home'));
assert.ok(existsSync(path.join(root, '.fleetsplice-native-policy-fixture')));
const fixtureHome = process.env.CODEX_HOME!;
const marker = path.join(root, 'integration-starts.jsonl');
const notifyMarker = path.join(root, 'notify-starts.jsonl');
const notifyScript = path.join(root, 'inert-notify.cjs');
writeFileSync(notifyScript, `require('node:fs').appendFileSync(process.argv[2], 'notified\\n');`);
const toolsSeen: string[][] = [];
const provider = createServer((request, response) => {
  let body = ''; request.on('data', bytes => { body += String(bytes); });
  request.on('end', () => {
    const payload = JSON.parse(body);
    const names = (tools: any[]): string[] => tools.flatMap(tool => tool.tools ? names(tool.tools) : [tool.name ?? tool.type]);
    toolsSeen.push(names(payload.tools ?? []));
    const message = { id: 'msg_inert', type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'Inert local provider completed.', annotations: [] }] };
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    const emit = (type: string, data: unknown) => response.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data as object })}\n\n`);
    emit('response.created', { response: { id: 'resp_inert', status: 'in_progress', output: [] } });
    emit('response.output_item.added', { output_index: 0, item: { ...message, status: 'in_progress', content: [] } });
    emit('response.output_text.delta', { item_id: 'msg_inert', output_index: 0, content_index: 0, delta: 'Inert local provider completed.' });
    emit('response.output_item.done', { output_index: 0, item: message });
    emit('response.completed', { response: { id: 'resp_inert', status: 'completed', output: [message], usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 } } });
    response.end();
  });
});
await new Promise<void>(resolve => provider.listen(0, '127.0.0.1', resolve));
const providerPort = (provider.address() as { port: number }).port;
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
notify=${JSON.stringify([process.execPath, notifyScript, notifyMarker])}
model_provider="inert"
model="inert"
[model_providers.inert]
name="Inert fixture, loopback response only"
base_url="http://127.0.0.1:${providerPort}/v1"
wire_api="responses"
requires_openai_auth=false
supports_websockets=false
request_max_retries=0
stream_max_retries=0
[agents]
enabled=true
[features]
plugins=true
remote_plugin=false
hooks=true
image_generation=true
view_image=true
[features.multi_agent_v2]
enabled=true
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
if (scenario === 'control') NATIVE_POLICY_ARGS.push('-c', 'features.plugins=true', '-c', `notify=${JSON.stringify([process.execPath, notifyScript, notifyMarker])}`, '-c', 'features.view_image=true', '-c', 'features.image_generation=true');
const driver = new CodexDriver(executable, root);
driver.signals.on('fault', () => {});
const remoteStates: string[] = []; let startedThreads = 0; let startedTurns = 0;
driver.signals.on('signal', signal => {
  if (signal.method === 'remoteControl/status/changed') remoteStates.push(signal.params.status);
  if (signal.method === 'thread/started') startedThreads++;
  if (signal.method === 'turn/started') startedTurns++;
});
const completed = () => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('INERT_TURN_TIMEOUT')), 15000);
  driver.signals.on('signal', signal => { if (signal.method === 'turn/completed') { clearTimeout(timer); signal.params.turn.status === 'completed' ? resolve() : reject(new Error('INERT_TURN_FAILED')); } });
});
try {
  if (scenario === 'control') {
    await assert.rejects(driver.start(() => {}), /NATIVE_INTEGRATIONS_NOT_DISABLED/);
    const result = await (driver as any).rpc(randomUUID(), 'thread/start', { cwd: root, ephemeral: true, approvalPolicy: 'never', sandbox: 'read-only' });
    assert.ok(result.thread.id);
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline && (!existsSync(marker) || readFileSync(marker, 'utf8').split('\n').filter(Boolean).length < 4)) await new Promise(resolve => setTimeout(resolve, 50));
    const rows = readFileSync(marker, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    for (const name of ['mcp', 'plugin']) for (const kind of ['start', 'tools']) assert.ok(rows.some(row => row.name === name && row.kind === kind), `${name}:${kind}`);
    const done = completed();
    await (driver as any).rpc(randomUUID(), 'turn/start', { threadId: result.thread.id, input: [{ type: 'text', text: 'Inert local response; do not call any tools.' }] });
    await done;
    const notifyDeadline = Date.now() + 10000;
    while (!existsSync(notifyMarker) && Date.now() < notifyDeadline) await new Promise(resolve => setTimeout(resolve, 50));
    assert.ok(existsSync(notifyMarker));
    assert.ok(toolsSeen.flat().includes('view_image'));
    writeFileSync(path.join(root, 'result.json'), JSON.stringify({ scenario, result: 'PASS', rows, notifyStarted: true, toolsSeen, remoteStates }));
  } else {
    await driver.start(() => {});
    const thread = await driver.create(randomUUID(), root, () => {});
    assert.ok(thread.threadId);
    const done = completed();
    await driver.turn(randomUUID(), thread.threadId, root, 'Inert local response; do not call any tools.', () => {});
    await done;
    await new Promise(resolve => setTimeout(resolve, 1000));
    assert.equal(existsSync(marker), false);
    assert.equal(existsSync(notifyMarker), false);
    assert.ok(toolsSeen.length > 0);
    assert.ok(toolsSeen.flat().every(name => name === 'request_user_input'), JSON.stringify(toolsSeen));
    // Close admission after the real async config response, before the effect RPC.
    const originalRpc = (driver as any).rpc.bind(driver); let admitted = true;
    (driver as any).rpc = async (...args: any[]) => { const value = await originalRpc(...args); if (args[1] === 'config/read') admitted = false; return value; };
    const gate = () => { assert.ok(admitted, 'TEST_ADMISSION_CLOSED'); };
    const threadCount = startedThreads; const turnCount = startedTurns;
    await assert.rejects(driver.create(randomUUID(), root, gate), /TEST_ADMISSION_CLOSED/);
    admitted = true;
    await assert.rejects(driver.turn(randomUUID(), thread.threadId, root, 'Must not be sent', gate), /TEST_ADMISSION_CLOSED/);
    assert.equal(startedThreads, threadCount); assert.equal(startedTurns, turnCount); assert.equal(toolsSeen.length, 1);
    (driver as any).rpc = originalRpc;
    writeFileSync(configPath, toml + '\n[mcp_servers.later]\ncommand="inert-never-start"\nenabled=true\n');
    await assert.rejects(driver.create(randomUUID(), root, () => {}), /NATIVE_CONFIG_CHANGED/);
    assert.equal(existsSync(marker), false);
    writeFileSync(path.join(root, 'result.json'), JSON.stringify({ scenario, result: 'PASS', nativeThreadCreated: true, integrationStarts: 0, toolsListed: 0, notifyStarted: false, configDriftRejected: true, finalAdmissionGateRejected: true, toolsSeen, remoteStates }));
  }
} catch (error) {
  console.log(error instanceof Error ? error.message : 'FIXTURE_FAILED'); process.exitCode = 1;
} finally {
  assert.equal(await driver.close(), true);
  if (scenario === 'suppressed') { assert.equal(existsSync(marker), false); assert.equal(existsSync(notifyMarker), false); }
  assert.equal(existsSync(path.join(fixtureHome, 'auth.json')), false);
  assert.ok(remoteStates.length > 0 && remoteStates.every(state => state === 'disabled'));
  assert.equal(process.env.CODEX_INTERNAL_APP_SERVER_REMOTE_CONTROL_DISABLED, '0');
  await new Promise<void>(resolve => provider.close(() => resolve()));
}
