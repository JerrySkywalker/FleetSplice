// SPDX-License-Identifier: MIT
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const pilot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(pilot, '../../..');
if (process.version !== 'v24.20.0' || process.versions.sqlite !== '3.53.4') {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/with-qualified-node.mjs'), fileURLToPath(import.meta.url)], { stdio: 'inherit', windowsHide: true });
    process.exit(result.status ?? 2);
}
const artifact = path.resolve(process.env.PILOT_ARTIFACT_DIR ?? path.join(pilot, 'results'));
mkdirSync(artifact, { recursive: true });
process.env.PILOT_ARTIFACT_DIR = artifact;
process.chdir(pilot);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const steps = [];
function step(name, args, cwd = pilot) { const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', windowsHide: true, env: process.env, timeout: 120000 }); const log = `${result.stdout ?? ''}${result.stderr ?? ''}`; writeFileSync(path.join(artifact, `${stamp}-${name}.log`), log); steps.push({ name, args, cwd, status: result.status, error: result.error?.message }); console.log(`${name}: ${result.status === 0 ? 'PASS' : 'FAIL'}`); if (result.status !== 0) {
    console.error(log);
    throw Error(name + ' failed');
} }
try {
    step('sdk-compile', ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
    step('fs-compile', ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'], root);
    step('official-loader-prepare', ['scripts/prepare-loader.mjs', path.join(artifact, 'scratch')]);
    step('official-loader', ['scripts/loader.mjs']);
    step('parity', ['--experimental-vm-modules', '--test', 'tests/parity.test.mjs']);
}
catch (error) {
    console.error(String(error));
    process.exitCode = 1;
}
writeFileSync(path.join(artifact, `${stamp}-runner.json`), JSON.stringify({ started: stamp, node: process.version, sqlite: process.versions.sqlite, native_connections: 0, native_effects: 0, steps }, null, 2) + '\n');
