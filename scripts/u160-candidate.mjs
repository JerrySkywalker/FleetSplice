/** Development preview only: real Gateway/Edge HCP, synthetic IdP/Native. */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { authFixture } from '../test-results/compiled/tests/fixtures/u160-auth.js';

if (process.version !== 'v24.20.0' || process.versions.sqlite !== '3.53.4') throw Error('NODE_RUNTIME_UNQUALIFIED');
const args = process.argv.slice(2);
const option = (name, fallback) => { const at = args.indexOf(name); return at < 0 ? fallback : args[at + 1]; };
const artifactRoot = path.resolve(option('--artifact-root', 'C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U08/preview'));
const directory = path.join(artifactRoot, `run-${Date.now()}-${process.pid}`); mkdirSync(directory, { recursive: true });
const fixture = await authFixture(directory, 'remote', path.resolve(option('--web-directory', 'dist/web')));
writeFileSync(path.join(directory, 'LAUNCH-URL.txt'), fixture.origin + '\n');
writeFileSync(path.join(artifactRoot, 'ACTIVE-RUN.json'), JSON.stringify({ directory, pid: process.pid }, null, 2));
const input = createInterface({ input: process.stdin }); let stopped = false;
async function stop() {
  if (stopped) return; stopped = true; clearInterval(watcher); clearTimeout(lifetime); input.close();
  const counters = await fixture.control('counters'); await fixture.close();
  writeFileSync(path.join(directory, 'CLOSED.json'), JSON.stringify({ status: 'CLOSED', counters }, null, 2));
}
const watcher = setInterval(() => { if (existsSync(path.join(directory, 'STOP'))) void stop(); }, 250);
const lifetime = setTimeout(() => void stop(), 30 * 60_000);
input.on('line', line => {
  const command = line.trim();
  if (command === 'quit') void stop();
  else if (['status', 'disconnect', 'reconnect', 'expire', 'unknown'].includes(command)) void fixture.control(command === 'status' ? 'counters' : command).then(value => console.log(JSON.stringify(value)));
  else console.log('Commands: status, disconnect, reconnect, expire, unknown, quit');
});
input.on('close', () => { if (!stopped) void stop(); }); process.once('SIGINT', () => void stop()); process.once('SIGTERM', () => void stop());
console.log('U160_SYNTHETIC_CANDIDATE_READY · No real Native or daily Agent. Expires in30min.');
console.log(`Private preview: ${fixture.origin}`); console.log(`Private artifacts: ${directory}`);
