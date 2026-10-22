import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

test('U08 candidate CLI starts its synthetic HCP preview and stops through its own marker', { timeout: 20000 }, async () => {
  const directory = path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U08', `cli-${Date.now()}`); mkdirSync(directory, { recursive: true });
  const child = spawn(process.execPath, ['scripts/u160-candidate.mjs', '--artifact-root', directory], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  let output = ''; let error = ''; let stopped = false;
  child.stderr.on('data', data => { error += String(data); });
  child.stdout.on('data', data => {
    output += String(data);
    if (!stopped && output.includes('U160_SYNTHETIC_CANDIDATE_READY')) {
      stopped = true; const active = JSON.parse(readFileSync(path.join(directory, 'ACTIVE-RUN.json'), 'utf8'));
      assert.ok(active.directory.startsWith(directory + path.sep)); writeFileSync(path.join(active.directory, 'STOP'), '');
    }
  });
  try {
    const [code] = await once(child, 'exit'); assert.equal(code, 0, error);
    const active = JSON.parse(readFileSync(path.join(directory, 'ACTIVE-RUN.json'), 'utf8'));
    const closed = JSON.parse(readFileSync(path.join(active.directory, 'CLOSED.json'), 'utf8'));
    assert.equal(closed.status, 'CLOSED'); assert.equal(closed.counters.hcpConnections, 1); assert.equal(closed.counters.syntheticCommands, 0); assert.equal(closed.counters.realNativeConnections, 0); assert.equal(closed.counters.realNativeEffects, 0);
  } finally { writeFileSync(path.join(directory, 'CLI.log'), output + '\n' + error); if (child.exitCode === null) child.stdin.end('quit\n'); }
});
