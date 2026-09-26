import { WebSocket, type ClientOptions } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, parseJson, requireThat, validate, Fault, type Hcp, type Receipt, type Target } from '../../packages/contracts/index.ts';
import { CodexDriver } from '../../packages/driver-codex/index.ts';
import { Journal } from '../../packages/journal/index.ts';
import { EdgeKernel } from './kernel.ts';
import { localIdentity, principalProof, rootProof, type LocalIdentity } from './identity.ts';
import { verifyWorkspace, verifyWorkspaceNow } from '../../packages/workspaces/index.ts';
import type { WorkspaceBinding } from '../../packages/contracts/index.ts';
import { permits, readCeiling } from '../../packages/permissions/index.ts';
import { nativeAdoptionEdge } from './native-adoption.ts';
import type { NativeServerCustody } from '../../packages/native-adoption/types.ts';
import { agentAdoptionEndpoint, acceptAgentAdoptionHcp } from '../../packages/product-path/index.ts';
import { mayShareWorkspace, type RuntimeSharing } from '../../packages/agent-runtime/index.ts';
import { signEnrollmentChallenge, type HostEnrollmentPrivateMaterial } from '../../packages/remote-enrollment/index.ts';

export type EdgeConfig = { port: number; target: Target; identity: LocalIdentity; stateDirectory: string; executable: string; hcpToken: string; hcpUrl?: string; /** Explicit S10-only trust injection; production relies on normal OS trust. */ testTlsCaPem?: string; enrollment?: HostEnrollmentPrivateMaterial; workspaces?: WorkspaceBinding[]; productPath?: 'NATIVE_ADOPTION' | 'LEGACY_MANAGED_LOCAL_ONLY'; runtimeSharing?: RuntimeSharing; nativeServerCustody?: NativeServerCustody };

export function resolveEdgeHcpEndpoint(config: Pick<EdgeConfig, 'port' | 'hcpUrl' | 'testTlsCaPem'>) {
  // The product Hub's default loopback origin is 127.0.0.1. Keep the Edge
  // default byte-for-byte aligned; explicit public HTTPS/WSS endpoints retain
  // their configured host and origin.
  const value = config.hcpUrl ?? `ws://127.0.0.1:${config.port}/hcp/v1/connect`;
  let url: URL;
  try { url = new URL(value); } catch { throw new Fault('EDGE_HCP_ENDPOINT_INVALID'); }
  const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  requireThat(!url.username && !url.password && !url.hash && !url.search && url.pathname === '/hcp/v1/connect', 'EDGE_HCP_ENDPOINT_INVALID');
  requireThat(url.protocol === 'wss:' || (url.protocol === 'ws:' && loopback), 'EDGE_HCP_ENDPOINT_MUST_BE_WSS');
  requireThat(!config.testTlsCaPem || url.protocol === 'wss:', 'EDGE_TEST_TLS_CA_REQUIRES_WSS');
  const origin = new URL(url.toString()); origin.protocol = url.protocol === 'wss:' ? 'https:' : 'http:'; origin.pathname = ''; origin.search = ''; origin.hash = '';
  const options: ClientOptions = { perMessageDeflate: false, maxPayload: 262144, origin: origin.toString().replace(/\/$/, ''), rejectUnauthorized: true,
    ...(config.testTlsCaPem ? { ca: config.testTlsCaPem } : {}) };
  return { url: url.toString(), options };
}

/**
 * Native adoption has an HCP endpoint in the product Edge itself.  The former
 * disposable topology is therefore not required to carry an AdoptionPort over
 * the wire.  LEGACY_MANAGED_LOCAL_ONLY remains below only for historical local
 * lifecycle compatibility; it is never a remote product mode.
 */
async function startNativeAdoptionHcpEdge(config: EdgeConfig) {
  const identity = await localIdentity(config.identity.root, config.identity.sid);
  requireThat(canonical(identity) === canonical(config.identity), 'EDGE_LOCAL_IDENTITY_CHANGED');
  requireThat((config.workspaces ?? []).some(binding => binding.valid && binding.root.toLowerCase() === identity.root.toLowerCase() && binding.rootIdentity === identity.rootIdentity && canonical(binding.target) === canonical(config.target)), 'WORKSPACE_BINDING_UNPROVABLE');
  const hcp = resolveEdgeHcpEndpoint(config);
  let local: Awaited<ReturnType<typeof nativeAdoptionEdge>> | null = null;
  const enrollment = config.enrollment;
  let socket: WebSocket;
  const kernel = { connected: false, quarantine: () => { kernel.connected = false; } };
  const send = (message: Hcp) => {
    requireThat(socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 262144, 'HCP_BACKPRESSURE_OR_DISCONNECTED');
    socket.send(canonical(message));
  };
  const envelope = { v: 1 as const, target: config.target, connectionId: config.target.connectionId };
  let endpoint: ReturnType<typeof agentAdoptionEndpoint> | null = null;
  let sharing = config.runtimeSharing;
  const startLocal = async () => {
    if (local) return;
    const started = await nativeAdoptionEdge(identity.root, config.stateDirectory,
      { custody: config.nativeServerCustody, executable: config.executable, environment: process.env,
        onNativeClose: () => process.send?.({ kind: 'runtimeObservation', status: 'unavailable', discoveredSessions: 0, evidence: 'NATIVE_CONNECTION_LOST' }) });
    local = started;
    endpoint = agentAdoptionEndpoint({ kind: 'NATIVE_ADOPTION', target: config.target, port: started.adapter, send });
  };
  if (sharing && mayShareWorkspace(sharing, identity.root)) await startLocal();
  else {
    // Keep an inspectable Edge admission journal while native sharing is off.
    // No Codex process or endpoint is created until the Owner resumes sharing.
    const journal = new Journal(path.join(config.stateDirectory, 'native-edge.sqlite'));
    journal.append('NATIVE_STARTUP_DEFERRED', config.target.edgeRuntimeId,
      { custody: config.nativeServerCustody, reason: 'SHARING_DISABLED' });
    journal.close();
  }
  // Register every HCP listener in the same turn that creates the socket.
  // Native qualification above can yield long enough for a loopback handshake
  // to finish; constructing the socket before it loses the `open` event.
  socket = new WebSocket(hcp.url, 'fleetsplice.hcp.v1', {
    ...hcp.options,
    headers: enrollment ? {} : { Authorization: `Bearer ${config.hcpToken}` },
  });
  const observeRuntime = async () => {
    if (!sharing || !mayShareWorkspace(sharing, identity.root)) return { status: 'unavailable' as const, discoveredSessions: 0, evidence: 'Codex is installed but unshared by Agent policy.' };
    if (!local) return { status: 'unavailable' as const, discoveredSessions: 0, evidence: 'Native server has not been started.' };
    try {
      const snapshot = await local.adapter.snapshot({ discover: true });
      return { status: snapshot.observationFailure ? 'degraded' as const : 'healthy' as const, discoveredSessions: snapshot.threads.length, evidence: snapshot.observationFailure?.code ?? 'Native inventory, thread cwd, exact root proof and Workspace binding observed.' };
    } catch (error) { return { status: 'unavailable' as const, discoveredSessions: 0, evidence: error instanceof Fault ? error.code : 'RUNTIME_OBSERVATION_UNAVAILABLE' }; }
  };
  socket.on('open', () => send({ ...envelope, kind: 'hello', identity, recovered: false, ...(enrollment ? { enrollment: { fleetId: enrollment.fleetId, hostId: enrollment.hostId, environmentId: enrollment.environmentId, enrollmentGeneration: enrollment.enrollmentGeneration, publicKeySpkiPem: enrollment.publicKeySpkiPem, publicFingerprint: enrollment.publicFingerprint } } : {}) }));
  socket.on('message', async (bytes, binary) => {
    try {
      requireThat(!binary, 'HCP_BINARY_REJECTED');
      const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes as Buffer)));
      if (message.kind === 'enrollment.challenge' && !kernel.connected) {
        requireThat(!!enrollment && canonical(message.challenge.expected) === canonical({ fleetId: enrollment.fleetId, hostId: enrollment.hostId, environmentId: enrollment.environmentId, enrollmentGeneration: enrollment.enrollmentGeneration, publicKeySpkiPem: enrollment.publicKeySpkiPem, publicFingerprint: enrollment.publicFingerprint }), 'ENROLLMENT_IDENTITY_MISMATCH');
        send({ ...envelope, kind: 'enrollment.proof', hostId: enrollment.hostId, proof: signEnrollmentChallenge(enrollment, message.challenge) });
      } else if (message.kind === 'ready' && !kernel.connected) {
        requireThat(!message.recoveryRequired, 'RECOVERY_REQUIRED');
        kernel.connected = true;
        const observation = await observeRuntime();
        process.send?.({ kind: 'runtimeObservation', ...observation });
        if (sharing && mayShareWorkspace(sharing, identity.root)) endpoint?.startRealtimePush();
        process.send?.({ kind: 'edgeReady' });
      } else {
        // A paused sharing policy rejects this typed request without tearing
        // down HCP. Closing the socket here strands the existing browser after
        // resume and turns a policy pause into an Edge transport failure.
        if (!sharing || !mayShareWorkspace(sharing, identity.root)) {
          requireThat(message.kind === 'adoption.request', 'HCP_UNEXPECTED_MESSAGE');
          send({ ...envelope, kind: 'adoption.response', requestId: message.requestId,
            ok: false, code: 'RUNTIME_UNSHARED', body: null });
          return;
        }
        requireThat(!!endpoint, 'NATIVE_SERVER_NOT_STARTED');
        await acceptAgentAdoptionHcp(endpoint, config.target, message);
      }
    } catch (error) {
      kernel.connected = false; socket.close(); process.send?.({ kind: 'error', code: error instanceof Fault ? error.code : 'EDGE_ADMISSION_CLOSED' });
    }
  });
  socket.on('close', () => { kernel.connected = false; endpoint?.stop(); process.send?.({ kind: 'edgeDisconnected' }); });
  socket.on('error', () => { kernel.connected = false; });
  return {
    kernel,
    setRuntimeSharing: async (next: RuntimeSharing) => {
      const wasShared = !!sharing && mayShareWorkspace(sharing, identity.root);
      const isShared = mayShareWorkspace(next, identity.root);
      if (!wasShared && isShared) await startLocal();
      requireThat(kernel.connected, 'EDGE_DISCONNECTED');
      sharing = next;
      if (wasShared && !isShared) endpoint?.stop();
      if (!wasShared && isShared) endpoint?.startRealtimePush();
      const observation = await observeRuntime(); process.send?.({ kind: 'runtimeObservation', ...observation }); return observation;
    },
    close: async () => { endpoint?.stop(); socket.close(); await local?.close(); return true; },
  };
}

export async function startEdge(config: EdgeConfig) {
  if (config.productPath === 'NATIVE_ADOPTION') return await startNativeAdoptionHcpEdge(config);
  const identity = await localIdentity(config.identity.root, config.identity.sid);
  requireThat(canonical(identity) === canonical(config.identity), 'EDGE_LOCAL_IDENTITY_CHANGED');
  const journal = new Journal(path.join(config.stateDirectory, 'edge.sqlite'));
  journal.set('root', identity.root);
  const native = new CodexDriver(config.executable, identity.root);
  const hcp = resolveEdgeHcpEndpoint(config);
  const socket = new WebSocket(hcp.url, 'fleetsplice.hcp.v1', {
    ...hcp.options, headers: { Authorization: `Bearer ${config.hcpToken}` }
  });
  const send = (message: Hcp) => {
    requireThat(socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 262144, 'HCP_BACKPRESSURE_OR_DISCONNECTED'); socket.send(canonical(message));
  };
  const envelope = { v: 1 as const, target: config.target, connectionId: config.target.connectionId };
  const kernel = new EdgeKernel(journal, config.target, native, async () => {
    const root = await rootProof(identity.root);
    requireThat(root.rootIdentity === identity.rootIdentity, 'WORKSPACE_REPLACED');
    // Parent/child token identity was proved at admission and is immutable for
    // these non-elevated processes; hostname labels are not authority.
  }, event => { try { send({ ...envelope, kind: 'event', event }); } catch { kernel.connected = false; } }, async () => {
    requireThat(native.pid, 'NATIVE_PROCESS_UNKNOWN'); const proof = principalProof(native.pid);
    requireThat(proof.sid === identity.sid && proof.sessionId === identity.sessionId && !proof.elevated, 'NATIVE_PRINCIPAL_REJECTED');
    journal.append('NATIVE_PROCESS_IDENTITY', native.instanceId, proof);
  }, config.workspaces, workspace => verifyWorkspace(workspace, { principal: identity.principal, sid: identity.sid }), workspace => verifyWorkspaceNow(workspace, { principal: identity.principal, sid: identity.sid }), preset => permits(readCeiling({ principal: identity.principal, sid: identity.sid }), preset));
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
          receipt = { edgeCommandId: message.command.edgeCommandId, status: record ? 'AMBIGUOUS_EFFECT' : 'REJECTED', code: error instanceof Fault ? error.code : 'EDGE_ADMISSION_FAILED', nativeThreadId: null, nativeTurnId: null, nativeRequestId: null, nativeProcessId: native.pid, nativeInstanceId: native.pid ? native.instanceId : null, nativeCapabilities: null, nativeConfiguration: null };
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
    process.on('message', async message => {
      if ((message as any).kind === 'stop') {
        const provenClosed = await edge.close(); process.send!({ kind: 'edgeClosed', provenClosed }); process.exit(provenClosed ? 0 : 2);
      }
      if ((message as any).kind === 'runtimeSharing') {
        try {
          const update = (edge as { setRuntimeSharing?: (value: RuntimeSharing) => Promise<unknown> }).setRuntimeSharing;
          requireThat(!!update, 'RUNTIME_SHARING_UNAVAILABLE');
          process.send!({ id: (message as any).id, result: await update((message as any).sharing) });
        } catch (error) { process.send!({ id: (message as any).id, error: error instanceof Fault ? error.code : 'RUNTIME_SHARING_UNAVAILABLE' }); }
      }
    });
    process.on('disconnect', async () => {
      edge.kernel.connected = false; edge.kernel.quarantine('SUPERVISOR_LOST');
      // Do not orphan a managed native process. If closure is uncertain this Edge
      // remains quarantined and visible to the OS conflict scan rather than exiting.
      if (await edge.close()) process.exit(2);
    });
  } catch { process.send!({ kind: 'error', code: 'EDGE_START_FAILED' }); process.exitCode = 1; }
});
