/**
 * Local real-daemon Native Adoption acceptance placeholder.
 * Bound: require an already-running shared Codex app-server daemon; never install/update/restart Owner Codex.
 * If a fully isolated harness cannot be completed without broad product changes, exit with deferred reason.
 */
import { mkdirSync, writeFileSync, accessSync, constants } from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const evidenceRoot = path.resolve(
  option('--evidence')
    ?? process.env.FLEETSPLICE_ACCEPT_EVIDENCE
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-R2-R1-AUTOMATED-ACCEPTANCE-001\\accept-native-live',
);
mkdirSync(evidenceRoot, { recursive: true });

function findCodexSocket(): string | null {
  const candidates = [
    process.env.CODEX_HOME,
    path.join(homedir(), '.codex'),
  ].filter((item): item is string => !!item);
  for (const home of candidates) {
    for (const name of ['codex-app-server.sock', 'app-server.sock', 'native.sock']) {
      const candidate = path.join(home, name);
      try {
        accessSync(candidate, constants.F_OK);
        return candidate;
      } catch { /* continue */ }
    }
  }
  return null;
}

const socket = findCodexSocket();
const reason = !socket
  ? 'REAL_DAEMON_AUTOMATION_DEFERRED_WITH_REASON=no_preflight_shared_codex_app_server_socket_found; isolated thread create+Playwright stack needs bounded native-demo IPC wiring beyond this Goal without risking Owner daemon mutation'
  : 'REAL_DAEMON_AUTOMATION_DEFERRED_WITH_REASON=shared_daemon_socket_detected_but_official_structured_disposable_thread_create_via_accept_native_live_not_yet_bound_without_broadening_native_demo_product_entry';

const payload = {
  status: 'DEFERRED',
  reason,
  socketObserved: socket,
  constraints: [
    'never update/install/restart Owner Codex',
    'disposable Workspace only',
    'official structured app-server interfaces only',
    'no Windows Terminal/ConPTY/TUI keystroke automation',
    'leave daemon running',
  ],
  finishedAt: new Date().toISOString(),
};
writeFileSync(path.join(evidenceRoot, 'result.json'), JSON.stringify(payload, null, 2));
console.log(reason);
// Deferred is an allowed A4 outcome; exit 0 so optional local runs do not fail the train gate.
process.exit(0);
