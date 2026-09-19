/**
 * Local real-daemon Native Adoption acceptance preflight.
 * Bound: reuse product discoverDaemon(); never install/update/restart Owner Codex.
 * If a fully isolated harness cannot be completed without broad product changes, exit with deferred reason.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { runNativeLivePreflight, toResultJson } from './accept-native-live-preflight.ts';

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const evidenceRoot = path.resolve(
  option('--evidence')
    ?? process.env.FLEETSPLICE_ACCEPT_EVIDENCE
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-A6-NATIVE-LIVE-PREFLIGHT-001\\accept-native-live',
);
mkdirSync(evidenceRoot, { recursive: true });

const result = runNativeLivePreflight();
const payload = toResultJson(result);
writeFileSync(path.join(evidenceRoot, 'result.json'), JSON.stringify(payload, null, 2));
console.log(result.reason);
process.exit(result.exitCode);
