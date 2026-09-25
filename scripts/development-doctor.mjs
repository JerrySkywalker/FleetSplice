/** Read-only local development prerequisites; no installation or product state. */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const run = (binary, args) => process.platform === 'win32' && binary === 'npm'
  ? spawnSync('cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], { encoding: 'utf8', windowsHide: true, timeout: 10000 })
  : spawnSync(binary, args, { encoding: 'utf8', windowsHide: true, timeout: 10000 });
const result = (code, ok, detail) => ({ code, status: ok ? 'PASS' : 'MISSING_OR_UNQUALIFIED', detail });
export function diagnoseOpenSsl(probe = run) {
  const checked = probe('openssl', ['version']);
  return result('OPENSSL_LOCAL_TEST_TLS', checked.status === 0,
    checked.status === 0 ? checked.stdout.trim() : 'OpenSSL on PATH is required for ephemeral localhost test TLS only; no production runtime dependency.');
}
export function diagnoseDevelopment(probe = run, present = existsSync, env = process.env) {
  const local = env.LOCALAPPDATA ?? '';
  const candidates = [
    path.join(local, 'FleetSplice', 'runtime', 'node-v24.20.0-win-x64', 'node.exe'),
    path.join(local, 'FleetSplice', 'toolcache', 'node-v24.20.0-win-x64', 'node.exe'),
    process.execPath,
  ];
  const qualified = candidates.map(binary => ({ binary, checked: present(binary) ? probe(binary, ['-p', "process.version + ' ' + process.versions.sqlite"]) : null }))
    .find(item => item.checked?.status === 0 && item.checked.stdout.trim() === 'v24.20.0 3.53.4');
  const npm = probe('npm', ['--version']);
  const rust = probe('rustc', ['--version']);
  const cargo = probe('cargo', ['--version']);
  const closure = probe('npm', ['ls', '--all', '--omit=optional', '--parseable']);
  const edgeCandidates = [env['PROGRAMFILES(X86)'], env.PROGRAMFILES, env.LOCALAPPDATA]
    .filter(Boolean).map(root => path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
  const browser = edgeCandidates.find(present);
  const lock = present('package-lock.json') ? JSON.parse(readFileSync('package-lock.json', 'utf8')) : null;
  return {
    kind: 'FLEETSPLICE_LOCAL_DEVELOPMENT_DOCTOR', offline: true,
    findings: [
      result('QUALIFIED_NODE_SQLITE', !!qualified, qualified ? 'Node v24.20.0 / SQLite 3.53.4 available' : 'Node v24.20.0 / SQLite 3.53.4 unavailable'),
      result('NPM_PACKAGE_CLOSURE', npm.status === 0 && !!lock?.packages && closure.status === 0 && present('node_modules/typescript/bin/tsc'),
        npm.status === 0 ? `npm ${npm.stdout.trim()}; lockfile=${!!lock?.packages}; npm ls=${closure.status}` : 'npm unavailable'),
      result('RUST_TAURI_TOOLCHAIN', rust.status === 0 && cargo.status === 0 && present('node_modules/@tauri-apps/cli/tauri.js'),
        `${rust.stdout?.trim() || 'rustc unavailable'}; ${cargo.stdout?.trim() || 'cargo unavailable'}; Tauri CLI=${present('node_modules/@tauri-apps/cli/tauri.js')}`),
      result('PLAYWRIGHT_EDGE_BROWSER', !!browser && present('node_modules/@playwright/test/package.json'),
        browser ? 'Microsoft Edge and Playwright package available' : 'Microsoft Edge executable unavailable for browser tests'),
      diagnoseOpenSsl(probe),
    ],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const report = diagnoseDevelopment();
  console.log(JSON.stringify(report, null, 2));
  for (const finding of report.findings) console.log(`${finding.status}: ${finding.code}: ${finding.detail}`);
  if (report.findings.some(f => f.status !== 'PASS')) process.exitCode = 1;
}
