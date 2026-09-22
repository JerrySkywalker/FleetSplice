/**
 * Produces the only mutable input to the Tauri bundle.  It is intentionally
 * generated, ignored by Git, and contains no user configuration, Codex state,
 * credentials, or runtime journals.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'apps', 'desktop', 'package-resources');
const runtime = path.join(output, 'runtime');
const required = [
  ['dist', 'dist'],
  ['fleetsplice.ps1', 'fleetsplice.ps1'],
  ['fleetsplice.cmd', 'fleetsplice.cmd'],
  ['scripts/start-supervisor.ps1', 'scripts/start-supervisor.ps1'],
];
const runtimeRoots = ['ajv', 'json-canonicalize', 'ws'];

if (process.version !== 'v24.20.0' || process.versions.sqlite !== '3.53.4') {
  throw new Error('NODE_RUNTIME_UNQUALIFIED');
}
for (const [source] of required) {
  if (!existsSync(path.join(root, source))) throw new Error(`PACKAGE_INPUT_MISSING:${source}`);
}
rmSync(output, { recursive: true, force: true });
mkdirSync(runtime, { recursive: true });
for (const [source, destination] of required) {
  cpSync(path.join(root, source), path.join(output, destination), { recursive: true });
}
cpSync(process.execPath, path.join(runtime, 'node.exe'));
writeFileSync(path.join(output, 'package.json'), JSON.stringify({ private: true, type: 'module' }) + '\n', { encoding: 'utf8', mode: 0o600 });

const copiedPackages = new Set();
const copyRuntimePackage = name => {
  if (copiedPackages.has(name)) return;
  const source = path.join(root, 'node_modules', ...name.split('/'));
  const manifest = path.join(source, 'package.json');
  if (!existsSync(manifest)) throw new Error(`RUNTIME_DEPENDENCY_MISSING:${name}`);
  copiedPackages.add(name);
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  for (const dependency of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.optionalDependencies ?? {}) })) copyRuntimePackage(dependency);
  cpSync(source, path.join(output, 'node_modules', ...name.split('/')), { recursive: true });
};
for (const name of runtimeRoots) copyRuntimePackage(name);

const inventory = [];
const collect = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(full);
    else inventory.push({ path: path.relative(output, full).replaceAll('\\', '/'), sha256: createHash('sha256').update(readFileSync(full)).digest('hex') });
  }
};
collect(output);
inventory.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(path.join(output, 'package-manifest.json'), JSON.stringify({
  version: 1,
  node: { version: process.version, sqlite: process.versions.sqlite, sha256: createHash('sha256').update(readFileSync(process.execPath)).digest('hex') },
  files: inventory,
  runtimeDependencies: [...copiedPackages].sort(),
  aggregateSha256: createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),
}, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
console.log(JSON.stringify({ status: 'DESKTOP_PACKAGE_STAGED', output, files: inventory.length }));
