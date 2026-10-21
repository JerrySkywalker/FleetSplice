import test from 'node:test';
import assert from 'node:assert/strict';
import * as vm from 'node:vm';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as json from '../packages/contracts/json.ts';

// Original synthetic Windows fixture. No PowerShell, process, daemon, real
// native home, endpoint or ACL is opened. OS/kernel security is NOT_MEASURED.
async function discover(layout: 'legacy' | 'daemon', changes: {
  missing?: boolean; malformed?: boolean; pid?: number; birth?: string;
  executable?: string; endpoint?: string; command?: string; ownerOrAclError?: boolean;
} = {}) {
  const home = 'C:\\synthetic-native-discovery';
  const executable = path.win32.join(home, layout === 'legacy' ? 'packages\\standalone\\current\\bin\\codex.exe' : 'packages\\daemon\\current\\bin\\codex.exe');
  const endpoint = path.win32.join(home, 'app-server-control', 'app-server-control.sock');
  const selected = layout === 'legacy' ? 'app-server.pid' : 'daemon.pid';
  const reads: string[] = [];
  const filesystem = {
    existsSync: () => true,
    lstatSync: () => ({ isFile: () => true, isSymbolicLink: () => false }),
    realpathSync: Object.assign((value: string) => value, { native: (value: string) => value }),
    readFileSync(file: string) {
      reads.push(file);
      if (file === executable) return Buffer.from('synthetic executable');
      if (file.endsWith(selected)) {
        if (changes.missing) throw Error('SYNTHETIC_SELECTED_FILE_ABSENT');
        return changes.malformed ? '{bad' : JSON.stringify({ pid: 202, processStartTime: '2020001' });
      }
      // The stale other namespace exists, but may never be used as fallback.
      return JSON.stringify({ pid: 999, processStartTime: '9990001' });
    },
  };
  const child = { execFileSync(file: string, args: string[]) {
    if (file.endsWith('powershell.exe')) {
      if (changes.ownerOrAclError) throw Error('SYNTHETIC_OWNER_OR_ACL_REJECTED');
      return JSON.stringify({ pid: changes.pid ?? 202, created: changes.birth ?? '2020001',
        executable: changes.executable ?? executable, command: changes.command ?? `codex.exe app-server --listen unix://${layout === 'daemon' ? ' --managed-daemon' : ''}`, endpointCreated: '123456' });
    }
    assert.equal(args.join(' '), 'app-server daemon version');
    return JSON.stringify({ status: 'running', backend: 'pid', socketPath: changes.endpoint ?? endpoint, managedCodexPath: executable, appServerVersion: 'fixture' });
  } };
  const context = vm.createContext({ process: { platform: 'win32', env: { CODEX_HOME: home } }, Buffer });
  const source = readFileSync(new URL('../packages/native-adoption/discovery.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  const imports: Record<string, object> = { 'node:child_process': child, 'node:fs': filesystem,
    'node:os': { homedir: () => home }, 'node:path': { default: path.win32 }, 'node:crypto': crypto,
    '../contracts/json.js': json, '../local-operation/index.js': { candidateCodexPaths: () => [executable] } };
  await module.link(async specifier => {
    const values = imports[specifier]! as Record<string, unknown>;
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  try { return { identity: (module.namespace as { discoverDaemon(): any }).discoverDaemon(), error: null, reads, selected }; }
  catch (error) { return { identity: null, error: (error as Error).message, reads, selected }; }
}

test('C01: official installation family selects only its namespace despite another stale record', async () => {
  for (const layout of ['legacy', 'daemon'] as const) {
    const result = await discover(layout);
    assert.equal(result.error, null);
    assert.equal(result.identity.processId, 202);
    assert.deepEqual(result.reads.filter(file => file.endsWith('.pid')).map(file => path.win32.basename(file)), [result.selected]);
  }
});
test('C01: selected missing/malformed record never falls back to stale alternate PID', async () => {
  for (const layout of ['legacy', 'daemon'] as const) for (const changes of [{ missing: true }, { malformed: true }]) {
    const result = await discover(layout, changes);
    assert.equal(result.error, 'NATIVE_DAEMON_PID_UNPROVABLE');
    assert.deepEqual(result.reads.filter(file => file.endsWith('.pid')).map(file => path.win32.basename(file)), [result.selected]);
  }
});
test('C02: PID, FILETIME, executable, endpoint, owner/ACL and command conflicts reject', async () => {
  for (const changes of [{ pid: 909 }, { birth: '999' }, { executable: 'C:\\other\\codex.exe' },
    { endpoint: 'C:\\other\\control.sock' }, { ownerOrAclError: true }, { command: 'codex.exe app-server --listen unix:// --unqualified' }]) {
    assert.notEqual((await discover('daemon', changes)).error, null);
  }
});
