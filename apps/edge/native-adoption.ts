import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { NativeAdoptionAdapter } from '../../packages/native-adoption/adapter.ts';
import { discoverDaemon, nativeHome } from '../../packages/native-adoption/discovery.ts';
import { OfficialNativeRpc } from '../../packages/native-adoption/transport.ts';
import { assertSameIncarnation } from '../../packages/native-adoption/compatibility.ts';
import { rootProofNow } from './identity.ts';
import { Journal } from '../../packages/journal/index.ts';
import { Fault, requireThat } from '../../packages/contracts/json.ts';

export async function nativeAdoptionEdge(workspace: string, stateDirectory: string) {
  const root = rootProofNow(workspace);
  const journal = new Journal(path.join(stateDirectory, 'native-edge.sqlite'));
  // Cold restart does not replay or forget any possibly dispatched operation.
  const attempts = journal.db.prepare("SELECT key FROM evidence WHERE kind='NATIVE_EFFECT_ATTEMPT'").all();
  for (const attempt of attempts) {
    const receipt = journal.db.prepare("SELECT value FROM evidence WHERE kind='NATIVE_ADOPTION_RECEIPT' AND key=? ORDER BY seq DESC LIMIT 1").get(attempt.key!);
    requireThat(receipt && JSON.parse(String(receipt.value)).status === 'SUCCEEDED', 'NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY');
  }
  const identity = discoverDaemon(); const rpc = await OfficialNativeRpc.connect(identity);
  const adapter = new NativeAdoptionAdapter(identity, rpc, root.root, root.rootIdentity, discoverDaemon, () => rootProofNow(root.root), journal);
  try {
    const initialized = await rpc.call('initialize', { clientInfo: { name: 'fleetsplice_native_adoption', version: '0.1.0' }, capabilities: { experimentalApi: true } });
    requireThat(typeof initialized.codexHome === 'string' && initialized.codexHome.toLowerCase() === nativeHome().toLowerCase(), 'NATIVE_SERVER_HOME_MISMATCH');
    rpc.initialized(); assertSameIncarnation(identity, discoverDaemon());
    await adapter.qualify();
    return { adapter, close: () => { adapter.close(); journal.close(); } };
  } catch (error) { adapter.close(); journal.close(); throw error; }
}
if (process.send && process.argv[1] === fileURLToPath(import.meta.url)) process.once('message', async (config: { workspace: string; stateDirectory: string }) => {
  try {
    const edge = await nativeAdoptionEdge(config.workspace, config.stateDirectory);
    process.send!({ kind: 'nativeReady' });
    process.on('message', async (message: any) => {
      if (message.kind === 'stop') { edge.close(); process.exit(0); }
      try {
        const result = message.kind === 'snapshot' ? await edge.adapter.snapshot() : message.kind === 'execute' ?
          await edge.adapter.execute(message.command, message.clientInstanceId, message.expiresAt) : message.kind === 'lookup' ? edge.adapter.lookup(message.commandId) : null;
        process.send!({ id: message.id, result });
      } catch (error) { process.send!({ id: message.id, error: error instanceof Fault ? error.code : 'NATIVE_EDGE_REQUEST_FAILED' }); }
    });
    process.on('disconnect', () => { edge.close(); process.exit(0); });
  } catch (error) { process.send!({ kind: 'error', code: error instanceof Error ? error.message : 'NATIVE_ADOPTION_START_FAILED' }); process.exitCode = 1; }
});
