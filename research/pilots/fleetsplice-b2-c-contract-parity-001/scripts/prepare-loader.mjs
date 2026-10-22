// SPDX-License-Identifier: MIT
// Fetch an integrity-pinned official package into private artifacts; never install a daemon.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const serverArtifact = { version: '0.12.0', url: 'https://registry.npmjs.org/@getpaseo/server/-/server-0.12.0.tgz', integrity: 'sha512-tURu5huZFJCk4rjWLO3ipRXO9AQmV1XJETzf286xbEapAzmwmjRMM+F8daGsxTaKRHD+jWZpeBcxPCcI/+WxNA==' };
export async function prepareLoader(artifacts) {
    const target = path.resolve(artifacts, 'official-server-0.12.0');
    await mkdir(target, { recursive: true });
    const tarball = path.join(target, 'server.tgz');
    if (!existsSync(tarball)) {
        const response = await fetch(serverArtifact.url);
        if (!response.ok)
            throw Error(`Official package HTTP ${response.status}`);
        await writeFile(tarball, Buffer.from(await response.arrayBuffer()));
    }
    const bytes = await readFile(tarball);
    const sri = 'sha512-' + createHash('sha512').update(bytes).digest('base64');
    if (sri !== serverArtifact.integrity)
        throw Error('Official loader artifact integrity mismatch');
    const entries = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/);
    for (const item of entries) {
        const resolved = path.resolve(target, item);
        if (!resolved.startsWith(target + path.sep) || !item.startsWith('package/') || item.includes('..'))
            throw Error('Archive path outside private target');
    }
    const source = path.join(target, 'package/dist/server/server/plugins/runtime.js');
    if (!existsSync(source))
        execFileSync('tar', ['-xzf', tarball, '-C', target], { windowsHide: true });
    const runtimeDir = path.join(root, '.runtime');
    await mkdir(runtimeDir, { recursive: true });
    const output = path.join(runtimeDir, 'official-plugin-runtime.mjs');
    await build({ entryPoints: [source], outfile: output, bundle: true, platform: 'node', format: 'esm', target: 'node24', packages: 'external', nodePaths: [path.join(root, 'node_modules')], logLevel: 'warning' });
    const record = { ...serverArtifact, tarballSHA256: createHash('sha256').update(bytes).digest('hex'), runtimeSHA256: createHash('sha256').update(await readFile(source)).digest('hex'), bundleSHA256: createHash('sha256').update(await readFile(output)).digest('hex'), output };
    await writeFile(path.join(artifacts, 'P02-official-loader-artifact.json'), JSON.stringify(record, null, 2));
    return record;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
    console.log(JSON.stringify(await prepareLoader(process.argv[2]), null, 2));
