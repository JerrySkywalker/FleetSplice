// SPDX-License-Identifier: MIT
// Execute unchanged FS discovery in a VM with a wholly synthetic Windows OS.
// PowerShell text is NOT executed; ACL/owner/peer security remains NOT_MEASURED.
import vm from 'node:vm';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import * as json from '../../../../dist/packages/contracts/json.js';
export async function discover(layout = 'legacy', stale = false) {
    const home = 'C:\\synthetic-fleetsplice-pilot';
    const exe = home + '\\codex.exe';
    const endpoint = home + '\\app-server-control\\app-server-control.sock';
    const reads = [];
    const fs = { existsSync: () => true, lstatSync: () => ({ isFile: () => true, isSymbolicLink: () => false }), realpathSync: Object.assign(x => x, { native: x => x }), readFileSync(file) { reads.push(file); if (file === exe)
            return Buffer.from('synthetic binary'); if (file.endsWith('app-server.pid') && layout === 'legacy')
            return JSON.stringify({ pid: 202, processStartTime: '2020001' }); throw Object.assign(Error('ENOENT synthetic PID layout'), { code: 'ENOENT' }); } };
    const child = { execFileSync(file, args) { if (file.endsWith('powershell.exe'))
            return JSON.stringify({ pid: 202, created: stale ? '999' : '2020001', executable: exe, command: 'codex.exe app-server --listen unix://', endpointCreated: '123456' }); if (args.join(' ') === 'app-server daemon version')
            return JSON.stringify({ status: 'running', backend: 'pid', socketPath: endpoint, managedCodexPath: exe, appServerVersion: '0.163.0' }); throw Error('Unexpected virtual process request'); } };
    const context = vm.createContext({ process: { platform: 'win32', env: { CODEX_HOME: home } }, Buffer });
    const source = await readFile(new URL('../../../../dist/packages/native-adoption/discovery.js', import.meta.url), 'utf8');
    const module = new vm.SourceTextModule(source, { context });
    const imports = { 'node:child_process': child, 'node:fs': fs, 'node:os': { homedir: () => home }, 'node:path': { default: path.win32 }, 'node:crypto': crypto, '../contracts/json.js': json, '../local-operation/index.js': { candidateCodexPaths: () => [exe] } };
    await module.link(specifier => { const values = imports[specifier]; if (!values)
        throw Error('Unexpected discovery import ' + specifier); return new vm.SyntheticModule(Object.keys(values), function () { for (const [k, v] of Object.entries(values))
        this.setExport(k, v); }, { context }); });
    await module.evaluate();
    try {
        return { result: 'pass', identity: module.namespace.discoverDaemon(), reads };
    }
    catch (error) {
        return { result: 'blocked', error: String(error), reads };
    }
}
