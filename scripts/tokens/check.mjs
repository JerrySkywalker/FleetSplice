/**
 * Reproducibility check: regenerate to a temp buffer and compare with checked-in outputs.
 */
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const generateScript = path.join(root, 'scripts/tokens/generate.mjs');

const outputs = [
  'packages/design-tokens/generated/web/tokens.css',
  'packages/design-tokens/generated/web/skin-probe.css',
  'packages/design-tokens/generated/flutter/fleetsplice_tokens.dart',
];

function sha(content) {
  return createHash('sha256').update(content).digest('hex');
}

function main() {
  const before = Object.fromEntries(outputs.map(rel => {
    const full = path.join(root, rel);
    return [rel, sha(readFileSync(full))];
  }));

  const result = spawnSync(process.execPath, [generateScript], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || 'tokens:generate failed\n');
    process.exit(result.status ?? 2);
  }

  let ok = true;
  for (const rel of outputs) {
    const full = path.join(root, rel);
    const after = sha(readFileSync(full));
    if (after !== before[rel]) {
      process.stderr.write(`tokens:check DRIFT ${rel}\n  before=${before[rel]}\n  after=${after}\n`);
      ok = false;
    } else {
      process.stdout.write(`tokens:check OK ${rel} ${after.slice(0, 12)}\n`);
    }
  }

  // Second pass: generate again and ensure byte-identical (determinism).
  const mid = Object.fromEntries(outputs.map(rel => [rel, sha(readFileSync(path.join(root, rel)))]));
  const again = spawnSync(process.execPath, [generateScript], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (again.status !== 0) {
    process.stderr.write('tokens:check second generate failed\n');
    process.exit(again.status ?? 2);
  }
  for (const rel of outputs) {
    const after2 = sha(readFileSync(path.join(root, rel)));
    if (after2 !== mid[rel]) {
      process.stderr.write(`tokens:check NON_DETERMINISTIC ${rel}\n`);
      ok = false;
    }
  }

  if (!ok) process.exit(1);
  process.stdout.write('tokens:check PASS\n');
}

main();
