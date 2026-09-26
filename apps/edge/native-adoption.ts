import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { NativeActivityJournal } from '../../packages/native-adoption/activity-journal.ts';
import { NativeAdoptionAdapter } from '../../packages/native-adoption/adapter.ts';
import { discoverDaemon, nativeHome } from '../../packages/native-adoption/discovery.ts';
import { OfficialNativeRpc } from '../../packages/native-adoption/transport.ts';
import { assertSameIncarnation } from '../../packages/native-adoption/compatibility.ts';
import { rootProofNow } from './identity.ts';
import { Journal } from '../../packages/journal/index.ts';
import { Fault, requireThat } from '../../packages/contracts/json.ts';
import type { NativeServerCustody } from '../../packages/native-adoption/types.ts';
import { AgentSupervisedNativeServer } from './supervised-native-server.ts';

export type NativeEdgeCustodyOptions = { custody?: NativeServerCustody; executable?: string; environment?: NodeJS.ProcessEnv; onNativeClose?: () => void };
export async function nativeAdoptionEdge(workspace: string, stateDirectory: string, options: NativeEdgeCustodyOptions = {}) {
  const root = rootProofNow(workspace);
  const journal = new Journal(path.join(stateDirectory, 'native-edge.sqlite'));
  // Cold restart does not replay or forget any possibly dispatched operation.
  const attempts = journal.db.prepare("SELECT key,value FROM evidence WHERE kind='NATIVE_EFFECT_ATTEMPT'").all();
  const provenance: { command: any; receipt: any }[] = [];
  for (const attempt of attempts) {
    const receipt = journal.db.prepare("SELECT value FROM evidence WHERE kind='NATIVE_ADOPTION_RECEIPT' AND key=? ORDER BY seq DESC LIMIT 1").get(attempt.key!);
    requireThat(receipt && JSON.parse(String(receipt.value)).status === 'SUCCEEDED', 'NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY');
    const command = JSON.parse(String(attempt.value)).command;
    if (['native.submit', 'native.steer'].includes(command?.family)) provenance.push({ command, receipt: JSON.parse(String(receipt.value)) });
  }
  const custody = options.custody ?? 'CODEX_MANAGED_DAEMON';
  requireThat(custody === 'CODEX_MANAGED_DAEMON' || custody === 'AGENT_SUPERVISED', 'NATIVE_SERVER_CUSTODY_INVALID');
  if (custody === 'AGENT_SUPERVISED') requireThat(!!options.executable, 'NATIVE_SUPERVISED_EXECUTABLE_REQUIRED');
  const supervisor = custody === 'AGENT_SUPERVISED' ? new AgentSupervisedNativeServer({
    executable: options.executable!, workspace: root.root, environment: options.environment,
    runId: path.basename(stateDirectory), onExit: options.onNativeClose,
  }) : null;
  let identity;
  try { identity = supervisor ? await supervisor.start() : discoverDaemon(); }
  catch (error) { journal.close(); throw error; }
  let rpc;
  try { rpc = await OfficialNativeRpc.connect(identity); }
  catch (error) { await supervisor?.stop(); journal.close(); throw error; }
  const identityNow = supervisor ? () => supervisor.assertCurrent(identity) : discoverDaemon;
  let adapter: NativeAdoptionAdapter;
  try {
    adapter = new NativeAdoptionAdapter(identity, rpc, root.root, root.rootIdentity, identityNow, () => rootProofNow(root.root), journal, new NativeActivityJournal(journal), Date.now, 20_000, options.onNativeClose);
  } catch (error) { rpc.close(); await supervisor?.stop(); journal.close(); throw error; }
  try {
    for (const input of provenance) adapter.restoreInput(input.command, input.receipt);
    const initialized = await rpc.call('initialize', { clientInfo: { name: 'fleetsplice_native_adoption', version: '0.1.0' }, capabilities: { experimentalApi: true } });
    requireThat(typeof initialized.codexHome === 'string' && initialized.codexHome.toLowerCase() ===
      (options.environment?.CODEX_HOME ? path.resolve(options.environment.CODEX_HOME) : nativeHome()).toLowerCase(), 'NATIVE_SERVER_HOME_MISMATCH');
    rpc.initialized(); assertSameIncarnation(identity, identityNow());
    await adapter.qualify();
    return { adapter, close: async () => { adapter.close(); await supervisor?.stop(); journal.close(); } };
  } catch (error) { adapter.close(); await supervisor?.stop(); journal.close(); throw error; }
}
if (process.send && process.argv[1] === fileURLToPath(import.meta.url)) process.once('message', async (config: { workspace: string; stateDirectory: string } & NativeEdgeCustodyOptions) => {
  try {
    const edge = await nativeAdoptionEdge(config.workspace, config.stateDirectory, config);
    let pushUnsubscribe: (() => void) | null = null;
    process.send!({ kind: 'nativeReady' });
    process.on('message', async (message: any) => {
      try {
        if (message.kind === 'stop') { pushUnsubscribe?.(); await edge.close(); process.exit(0); }
        if (message.kind === 'subscribeRealtimePush') {
          pushUnsubscribe?.();
          pushUnsubscribe = edge.adapter.subscribeRealtime(envelope => {
            try { process.send!({ kind: 'realtimePush', envelope }); } catch { /* Parent may have disconnected. */ }
          });
          process.send!({ id: message.id, result: { subscribed: true } });
          return;
        }
        if (message.kind === 'unsubscribeRealtimePush') {
          pushUnsubscribe?.(); pushUnsubscribe = null;
          process.send!({ id: message.id, result: { subscribed: false } });
          return;
        }
        const result = message.kind === 'snapshot' ? await edge.adapter.snapshot(message.options ?? {}) : message.kind === 'execute' ?
          await edge.adapter.execute(message.command, message.client) : message.kind === 'renewClient' ? await edge.adapter.renewClient(message.previous, message.next, message.continuity) : message.kind === 'lookup' ? edge.adapter.lookup(message.commandId) : message.kind === 'pollRealtime' ? edge.adapter.pollRealtime(String(message.sinceRevision ?? '0')) : null;
        process.send!({ id: message.id, result });
      } catch (error) { process.send!({ id: message.id, error: error instanceof Fault ? error.code : 'NATIVE_EDGE_REQUEST_FAILED' }); }
    });
    process.on('disconnect', () => { pushUnsubscribe?.(); void edge.close().then(() => process.exit(0), () => { process.exitCode = 2; }); });
  } catch (error) { process.send!({ kind: 'error', code: error instanceof Error ? error.message : 'NATIVE_ADOPTION_START_FAILED' }); process.exitCode = 1; }
});
