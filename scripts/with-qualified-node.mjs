import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const local = process.env.LOCALAPPDATA ?? '';
const candidates = [...new Set([
  path.join(local, 'FleetSplice', 'runtime', 'node-v24.20.0-win-x64', 'node.exe'),
  path.join(local, 'FleetSplice', 'toolcache', 'node-v24.20.0-win-x64', 'node.exe'),
  process.execPath
])];
const qualified = candidates.find(candidate => {
  if (!existsSync(candidate)) return false;
  const inspected = spawnSync(candidate, ['-p', "process.version + ' ' + process.versions.sqlite"], { encoding: 'utf8', windowsHide: true, timeout: 7000 });
  return inspected.status === 0 && inspected.stdout.trim() === 'v24.20.0 3.53.4';
});
if (!qualified) {
  process.stderr.write('NODE_RUNTIME_UNQUALIFIED: Node v24.20.0 with SQLite 3.53.4 was not found\n');
  process.exit(2);
}
const result = spawnSync(qualified, process.argv.slice(2), { stdio: 'inherit', windowsHide: true, env: process.env });
process.exit(result.status ?? 2);
