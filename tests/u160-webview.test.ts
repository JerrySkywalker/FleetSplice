/** Opt-in actual Windows WebView2 test. No production Desktop/Agent entry is launched. */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { createWriteStream, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { authFixture } from './fixtures/u160-auth.ts';

const program = 'C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022';
const binary = process.env.FLEETSPLICE_U160_WEBVIEW_BINARY;
const driverPath = process.env.FLEETSPLICE_U160_WEBVIEW_DRIVER;

test('U04/U06 actual WebView: OIDC, bound-window reuse, reopen, origin separation and remote IPC denial', { skip: !binary || !driverPath, timeout: 120000 }, async () => {
  assert.equal(path.basename(binary!), 'u160-workspace.exe');
  assert.ok(path.resolve(binary!).startsWith(path.resolve(program) + path.sep));
  assert.equal(path.basename(driverPath!), 'msedgedriver.exe');
  assert.ok(path.resolve(driverPath!).startsWith(path.resolve(program) + path.sep));
  const directory = path.join(program, 'U06', `webview-${Date.now()}`); mkdirSync(directory, { recursive: true });
  const fixture = await authFixture(path.join(directory, 'gateway-a')); const other = await authFixture(path.join(directory, 'gateway-b'));
  const profile = path.join(directory, 'profile'); mkdirSync(profile);
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const log = createWriteStream(path.join(directory, 'driver.log'));
  const driver = spawn(driverPath!, [`--port=${port}`, '--allowed-ips=127.0.0.1'], { env: { ...process.env, TAURI_WEBVIEW_AUTOMATION: 'true' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  driver.stdout!.pipe(log); driver.stderr!.pipe(log);
  const endpoint = `http://127.0.0.1:${port}`; let session = ''; const steps: string[] = [];
  const call = async (method: string, route: string, body?: unknown, timeout = 15000) => {
    const response = await fetch(endpoint + route, { method, headers: { 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeout) });
    const value = await response.json() as any;
    if (!response.ok) throw Error(`WEBDRIVER_${value.value?.error}: ${value.value?.message}`); return value.value;
  };
  const cmd = (method: string, route: string, body?: unknown) => call(method, `/session/${session}${route}`, body);
  const execute = (script: string, args: unknown[] = []) => cmd('POST', '/execute/sync', { script, args });
  const wait = async (check: () => Promise<any>, label: string, timeout = 15000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw Error(`WEBVIEW_WAIT_${label}`);
  };
  const element = async (using: string, value: string) => (await cmd('POST', '/element', { using, value }))['element-6066-11e4-a52e-4f735466cecf'];
  const click = async (using: string, value: string) => cmd('POST', `/element/${await element(using, value)}/click`, {});
  const open = async (origin: string) => {
    const input = await element('css selector', '#workspace-origin'); await cmd('POST', `/element/${input}/clear`, {}); await cmd('POST', `/element/${input}/value`, { text: origin });
    await click('xpath', "//button[contains(.,'Open / return to Workspace')]");
  };
  const switchTo = (handle: string) => cmd('POST', '/window', { handle });
  const capture = async (name: string) => writeFileSync(path.join(directory, `${name}.png`), Buffer.from(await cmd('GET', '/screenshot'), 'base64'));
  try {
    await wait(async () => { try { return (await call('GET', '/status')).ready; } catch { return false; } }, 'driver-ready');
    const started = await call('POST', '/session', { capabilities: { alwaysMatch: {
      browserName: 'webview2', 'ms:edgeChromium': true,
      'ms:edgeOptions': { binary, args: [`--profile=${profile}`], webviewOptions: { userDataFolder: profile, additionalBrowserArguments: ['ignore-certificate-errors', 'lang=en-US'] } },
    } } }, 60000);
    session = started.sessionId; const main = await cmd('GET', '/window');
    await wait(() => execute("return document.body.innerText.includes('SYNTHETIC_PREVIEW')"), 'manager');
    await click('xpath', "//button[normalize-space()='Workspace']"); await open(fixture.origin);
    await wait(async () => (await cmd('GET', '/window/handles')).length === 2, 'workspace-created');
    let workspace = (await cmd('GET', '/window/handles')).find((handle: string) => handle !== main);
    await switchTo(workspace);
    await wait(() => execute("return !!document.querySelector('[data-testid=auth-gate]')"), 'signed-out');
    await execute("localStorage.setItem('fleetsplice.locale','en-US'); location.reload();");
    await wait(() => execute("return !!document.querySelector('.auth-login')"), 'login-link');
    await capture('workspace-signed-out');
    await fixture.control('holdLogin'); await click('css selector', '.auth-login');
    await wait(() => execute("return !!document.querySelector('#fixture-continue')"), 'idp');
    assert.equal(new URL(await cmd('GET', '/url')).hostname, 'localhost');
    await switchTo(main); await open(fixture.origin);
    await wait(() => execute("return [...document.querySelectorAll('[role=status]')].some(node => node.textContent.includes('Workspace opened'))"), 'return-during-idp');
    assert.equal((await cmd('GET', '/window/handles')).length, 2); steps.push('same Gateway focuses original window during IdP navigation');
    await switchTo(workspace); await click('css selector', '#fixture-continue');
    await wait(() => execute("return !!document.querySelector('[data-testid=native-prompt]')"), 'authenticated');
    const identity = await cmd('POST', '/execute/async', { script: "const done=arguments[arguments.length-1]; fetch('/api/auth/principal').then(r=>r.json()).then(done);", args: [] });
    assert.equal(identity.principal.subject, 'synthetic-owner');
    const denied = await cmd('POST', '/execute/async', { script: "const done=arguments[arguments.length-1]; window.__TAURI__.core.invoke('agent_status').then(()=>done({denied:false}),error=>done({denied:true,error:String(error)}));", args: [] });
    assert.equal(denied.denied, true); assert.match(denied.error, /agent_status not allowed on window "workspace"/);
    steps.push('real WebView OIDC exchange and remote Manager IPC rejection');
    await capture('workspace-authenticated');
    await switchTo(main); await open(other.origin);
    await wait(() => execute("return [...document.querySelectorAll('[role=status]')].some(node => node.textContent.includes('WORKSPACE_OPEN_AT_ANOTHER_ORIGIN_CLOSE_IT_FIRST'))"), 'different-gateway-rejected');
    assert.equal((await cmd('GET', '/window/handles')).length, 2);
    await click('xpath', "//button[normalize-space()='Close Workspace window']");
    await wait(async () => (await cmd('GET', '/window/handles')).length === 1, 'native-window-closed'); await open(fixture.origin);
    await wait(async () => (await cmd('GET', '/window/handles')).length === 2, 'reopened');
    workspace = (await cmd('GET', '/window/handles')).find((handle: string) => handle !== main); await switchTo(workspace);
    await wait(() => execute("return !!document.querySelector('[data-testid=native-prompt]')"), 'same-origin-cookie');
    steps.push('close/reopen preserves the application profile session without granting control');
    await switchTo(main); await click('xpath', "//button[normalize-space()='Close Workspace window']");
    await wait(async () => (await cmd('GET', '/window/handles')).length === 1, 'native-window-closed-again'); await open(other.origin);
    await wait(async () => (await cmd('GET', '/window/handles')).length === 2, 'other-opened');
    workspace = (await cmd('GET', '/window/handles')).find((handle: string) => handle !== main); await switchTo(workspace);
    await wait(() => execute("return !!document.querySelector('[data-testid=auth-gate]')"), 'other-signed-out');
    steps.push('different Gateway requires its own admitted session and starts without old projections');
    const counters = [await fixture.control('counters'), await other.control('counters')];
    for (const value of counters) { assert.equal(value.syntheticCommands, 0); assert.equal(value.realNativeConnections, 0); assert.equal(value.realNativeEffects, 0); }
    writeFileSync(path.join(directory, 'RESULT.json'), JSON.stringify({ status: 'PASS', evidence: 'ACTUAL_TAURI_WEBVIEW_SYNTHETIC_IDP_NATIVE', binarySha256: createHash('sha256').update(readFileSync(binary!)).digest('hex'), capabilities: started.capabilities, remoteIpc: denied, steps, counters, nativeMenuClick: 'NOT_RUN_WEBVIEW_DRIVER_CANNOT_CLICK_NATIVE_MENUS' }, null, 2));
  } catch (error) {
    writeFileSync(path.join(directory, 'RESULT.json'), JSON.stringify({ status: 'FAIL', steps, error: String(error) }, null, 2)); throw error;
  } finally {
    if (session) await call('DELETE', `/session/${session}`).catch(() => {});
    // Only this spawned driver's tree, including its disposable test app.
    if (driver.exitCode === null) { try { execFileSync('taskkill', ['/PID', String(driver.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); } catch { /* It may already have exited after session deletion. */ } }
    log.end(); await fixture.close(); await other.close();
  }
});
