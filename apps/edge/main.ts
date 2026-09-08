import { WebSocket } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, parseJson, requireThat, validate, Fault, type Hcp, type Receipt, type Target } from '../../packages/contracts/index.ts';
import { CodexDriver } from '../../packages/driver-codex/index.ts';
import { Journal } from '../../packages/journal/index.ts';
import { EdgeKernel } from './kernel.ts';
import { localIdentity, principalProof, rootProof, type LocalIdentity } from './identity.ts';

export type EdgeConfig = { port: number; target: Target; identity: LocalIdentity; stateDirectory: string; executable: string; hcpToken: string };
export async function startEdge(config: EdgeConfig) {
  const identity = await localIdentity(config.identity.root, config.identity.sid);
  requireThat(canonical(identity) === canonical(config.identity), 'EDGE_LOCAL_IDENTITY_CHANGED');
  const journal = new Journal(path.join(config.stateDirectory, 'edge.sqlite'));
  journal.set('root', identity.root);
  const native = new CodexDriver(config.executable, identity.root);
  const socket = new WebSocket(`ws://127.0.0.1:${config.port}/hcp/v1/connect`, 'fleetsplice.hcp.v1', {
    perMessageDeflate: false, maxPayload: 262144, origin: `http://127.0.0.1:${config.port}`, headers: { Authorization: `Bearer ${config.hcpToken}` }
  });
  const send = (message: Hcp) => {
    requireThat(socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 262144, 'HCP_BACKPRESSURE_OR_DISCONNECTED'); socket.send(canonical(message));
  };
  const envelope = { v: 1 as const, target: config.target, connectionId: config.target.connectionId };
  const kernel = new EdgeKernel(journal, config.target, native, async () => {
    const root = await rootProof(identity.root);
    requireThat(root.rootIdentity === identity.rootIdentity, 'WORKSPACE_REPLACED');
    // Parent/child token identity is immutable for these non-elevated processes.
    requireThat(process.env.COMPUTERNAME === 'SKYFORGE-01', 'WRONG_HOST');
  }, event => { try { send({ ...envelope, kind: 'event', event }); } catch { kernel.connected = false; } }, async () => {
    requireThat(native.pid, 'NATIVE_PROCESS_UNKNOWN'); const proof = principalProof(native.pid);
    requireThat(proof.sid === identity.sid && proof.sessionId === identity.sessionId && !proof.elevated, 'NATIVE_PRINCIPAL_REJECTED');
    journal.append('NATIVE_PROCESS_IDENTITY', native.instanceId, proof);
  });
  socket.on('open', () => send({ ...envelope, kind: 'hello', identity, recovered: journal.recovered }));
  socket.on('message', async (bytes, binary) => {
    try {
      requireThat(!binary, 'HCP_BINARY_REJECTED');
      const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes as Buffer)));
      requireThat(message.connectionId === config.target.connectionId && canonical(message.target) === canonical(config.target), 'STALE_CONNECTION');
      if (message.kind === 'ready' && !kernel.connected) {
        requireThat(!message.recoveryRequired && !journal.recovered, 'RECOVERY_REQUIRED'); kernel.connected = true; process.send?.({ kind: 'edgeReady' });
      } else if (message.kind === 'command') {
        let receipt: Receipt;
        try { receipt = await kernel.execute(message.command); }
        catch (error) {
          const record = journal.lookup<any>(message.command.edgeCommandId);
          receipt = { edgeCommandId: message.command.edgeCommandId, status: record ? 'AMBIGUOUS_EFFECT' : 'REJECTED', code: error instanceof Fault ? error.code : 'EDGE_ADMISSION_FAILED', nativeThreadId: null, nativeTurnId: null, nativeRequestId: null, nativeProcessId: native.pid, nativeInstanceId: native.pid ? native.instanceId : null };
          if (record) kernel.quarantine('AMBIGUOUS_EFFECT');
        }
        send({ ...envelope, kind: 'receipt', receipt });
      } else throw new Fault('HCP_UNEXPECTED_MESSAGE');
    } catch { kernel.connected = false; socket.close(); process.send?.({ kind: 'error', code: 'EDGE_ADMISSION_CLOSED' }); }
  });
  socket.on('close', () => { kernel.connected = false; process.send?.({ kind: 'edgeDisconnected' }); });
  socket.on('error', () => { kernel.connected = false; });
  return { kernel, close: async () => {
    const provenClosed = await kernel.close();
    if (provenClosed && native.pid) {
      const row = journal.db.prepare("SELECT value FROM evidence WHERE kind='NATIVE_PROCESS_IDENTITY' AND key=? ORDER BY seq DESC LIMIT 1").get(native.instanceId);
      if (row) journal.append('NATIVE_PROCESS_EXIT_OBSERVED', native.instanceId, { ...(JSON.parse(String(row.value)) as object), exitObserved: true, observedBy: 'managed-child-handle' });
    }
    socket.close(); journal.close(); return provenClosed;
  } };
}
if (process.send && process.argv[1] === fileURLToPath(import.meta.url)) process.once('message', async (config: EdgeConfig) => {
  try {
    const edge = await startEdge(config);
    process.on('message', async message => { if ((message as any).kind === 'stop') {
      const provenClosed = await edge.close(); process.send!({ kind: 'edgeClosed', provenClosed }); process.exit(provenClosed ? 0 : 2);
    } });
    process.on('disconnect', async () => {
      edge.kernel.connected = false; edge.kernel.quarantine('SUPERVISOR_LOST');
      // Do not orphan a managed native process. If closure is uncertain this Edge
      // remains quarantined and visible to the OS conflict scan rather than exiting.
      if (await edge.close()) process.exit(2);
    });
  } catch { process.send!({ kind: 'error', code: 'EDGE_START_FAILED' }); process.exitCode = 1; }
});
