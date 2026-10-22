// SPDX-License-Identifier: MIT
// npm run reproduce: only project-scoped restore, scripts disabled. No global install.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const pilot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(pilot, '../../..');
const npmCli = process.env.npm_execpath;
if (!npmCli || !npmCli.endsWith('.js'))
    throw Error('Run through npm run reproduce so the existing npm CLI path is explicit.');
const qualified = (args, cwd) => { const result = spawnSync(process.execPath, [path.join(root, 'scripts/with-qualified-node.mjs'), ...args], { cwd, stdio: 'inherit', windowsHide: true }); if (result.status !== 0)
    process.exit(result.status ?? 2); };
for (const cwd of [root, pilot])
    qualified([npmCli, 'ci', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', path.join(pilot, '.runtime', 'npm-cache')], cwd);
qualified([path.join(pilot, 'scripts/run.mjs')], pilot);
