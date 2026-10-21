/** Local synthetic H0 server. Reuses the real Hub/Web build; never native RPC. */
import { createServer } from 'node:net';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createInterface } from 'node:readline';
import { startHub } from '../apps/hub/server.ts';
import { target } from '../tests/helpers.ts';
import { createFpxOwnerFixture } from '../tests/fixtures/fpx-owner-preview.ts';

export async function startFpxOwnerPreview(artifactRoot: string) {
  mkdirSync(artifactRoot, { recursive: true });
  const runDirectory = mkdtempSync(path.join(artifactRoot, 'h0-'));
  const fixture = createFpxOwnerFixture();
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  const bootstrapToken = randomUUID();
  const hub = await startHub({ port, target: target(), root: 'C:\\synthetic-fpx\\workspace', sid: 'fixture', principal: 'H0 synthetic preview', sessionId: 1,
    stateDirectory: runDirectory, webDirectory: path.resolve('dist/web'), hcpToken: randomUUID(), bootstrapToken }, fixture.port);
  const url = `http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`;
  writeFileSync(path.join(runDirectory, 'LAUNCH-URL.txt'), `${url}\n`);
  writeFileSync(path.join(artifactRoot, 'latest-preview.json'), JSON.stringify({ evidence: 'SYNTHETIC_UI_ONLY', pid: process.pid, runDirectory, launchFile: path.join(runDirectory, 'LAUNCH-URL.txt'), realNativeEffects: 0 }, null, 2));
  return { url, runDirectory, setScenario: fixture.setScenario, counters: fixture.counters, async close() { fixture.close(); await hub.close(); } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const artifactRoot = process.env.FLEETSPLICE_FPX_PREVIEW_ROOT ?? 'C:/Dev/artifacts/fleetsplice/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/execution-200h-20261021/UX06';
  const demo = await startFpxOwnerPreview(artifactRoot);
  console.log(`SYNTHETIC H0 ONLY. No native connection/effect. Private launch URL: ${path.join(demo.runDirectory, 'LAUNCH-URL.txt')}`);
  console.log('Open that URL in a fresh browser tab; acquire mock control first. Type normal/viewer/controller/approval/external/offline. Run unknown last, then stop. Type quit or Ctrl+C to stop this preview only.');
  const input = createInterface({ input: process.stdin });
  const stop = async () => { input.close(); await demo.close(); process.exit(0); };
  input.on('line', line => { if (line.trim() === 'quit') { void stop(); return; } try { demo.setScenario(line.trim()); console.log(`Synthetic scenario: ${line.trim()}`); } catch (error) { console.log(String(error)); } });
  process.once('SIGINT', () => { void stop(); }); process.once('SIGTERM', () => { void stop(); });
}
