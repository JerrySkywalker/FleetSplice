import { createServer, type Socket } from 'node:net';
import { randomBytes } from 'node:crypto';
import { existsSync, openSync, closeSync, writeSync, fsyncSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat } from '../packages/contracts/index.ts';
import { classifyPredecessor, evidenceFromEdge, probeProcess, resolveProxy, type Guard, type ProxyResolution } from '../packages/local-operation/index.ts';
import { discoverInstalledCodex } from '../packages/native-adoption/discovery.ts';
import { launch } from './local.ts';
import { AGENT_IPC_MAX_BYTES, AGENT_IPC_VERSION, parseAgentIpcRequest, validateAgentConfiguration, type AgentConfiguration, type AgentIpcRequest, type AgentRuntimeProjection } from '../packages/agent-ipc/index.ts';
import { defaultRuntimeSharing, runtimeRegistry, updateSharing, validateRuntimeSharing, type RuntimeSharing } from '../packages/agent-runtime/index.ts';
import { generateHostEnrollmentKey, windowsCurrentUserDpapiCustody, type HostEnrollmentPrivateMaterial } from '../packages/remote-enrollment/index.ts';
import { DurableIdentityStore } from '../packages/durable-identity/index.ts';

export function supervisorHealthCode(health: { hub: string; edge: string; edgeAdmission: string } | undefined, nativeCodex: string): 'RUNNING' | 'RECOVERY_REQUIRED' {
  return health?.hub === 'RUNNING' && health.edge === 'RUNNING' && health.edgeAdmission === 'READY' && !['EXITED_OR_REUSED', 'UNPROVABLE'].includes(nativeCodex) ? 'RUNNING' : 'RECOVERY_REQUIRED';
}
export function supervisorProxy(environment: NodeJS.ProcessEnv = process.env): ProxyResolution {
  const resolved = resolveProxy(environment);
  const source = environment.FLEETSPLICE_PROXY_SOURCE;
  if (source === undefined) return resolved;
  requireThat(['explicit-env', 'fleetsplice-user-config', 'windows-user-proxy', 'windows-system-proxy', 'direct'].includes(source), 'SUPERVISOR_PROXY_METADATA_INVALID');
  requireThat(source === 'direct' ? resolved.proxy === null : resolved.proxy !== null, 'SUPERVISOR_PROXY_METADATA_INVALID');
  return { ...resolved, source: source as ProxyResolution['source'] };
}
const durable = (file: string, value: unknown) => { const fd = openSync(file, 'wx', 0o600); try { writeSync(fd, canonical(value)); fsyncSync(fd); } finally { closeSync(fd); } };
const reply = async (socket: Socket, value: unknown) => await new Promise<void>(resolve => { const done = () => resolve(); socket.once('error', done); socket.end(canonical(value), done); });
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function supervisorEntrypoint() {
  const args = process.argv.slice(2); const option = (name: string) => args[args.indexOf(name) + 1];
  const root = option('--workspace'); const executable = option('--codex');
  requireThat(typeof root === 'string' && typeof executable === 'string', 'SUPERVISOR_USAGE');
  const identity = await localIdentity(root!);
  const qualifiedCodex = discoverInstalledCodex(executable!);
  requireThat(qualifiedCodex.executablePath.toLowerCase() === path.resolve(executable!).toLowerCase(), 'NATIVE_SUPERVISED_EXECUTABLE_CHANGED');
  const base = path.join(process.env.LOCALAPPDATA!, 'FleetSplice', 'G05');
  const predecessor = classifyPredecessor(base);
  requireThat(['NO_PREDECESSOR', 'SAFE_NO_EFFECT', 'SAFE_TERMINAL', 'RETIRED_AMBIGUOUS', 'RETIRED_UNPROVABLE'].includes(predecessor.kind), 'RECOVERY_REQUIRED');
  const pipe = `\\\\.\\pipe\\fleetsplice-g05-${identity.sid}`;
  type PersistedPairing = { requestId: string | null; fleetId: string; hostId: string; environmentId: string; enrollmentGeneration: string; publicKeySpkiPem: string; publicFingerprint: string; protectedPrivateKey: string };
  const agentStore = new DurableIdentityStore(path.join(base, 'agent-identity.json'), value => {
    const item = value as { v?: unknown; configuration?: unknown; sharing?: unknown; pairing?: PersistedPairing | null }; requireThat(item?.v === 1, 'DURABLE_IDENTITY_STORE_INVALID');
    const pairing = item.pairing ?? null;
    if (pairing) requireThat(typeof pairing.requestId === 'string' || pairing.requestId === null && [pairing.fleetId, pairing.hostId, pairing.environmentId, pairing.enrollmentGeneration, pairing.publicKeySpkiPem, pairing.publicFingerprint, pairing.protectedPrivateKey].every(value => typeof value === 'string' && value.length > 0), 'DURABLE_IDENTITY_STORE_INVALID');
    return { v: 1 as const, configuration: validateAgentConfiguration(item.configuration), sharing: validateRuntimeSharing(item.sharing), pairing };
  });
  const restored = agentStore.read();
  const restoredPairing = restored?.pairing ? { fleetId: restored.pairing.fleetId, hostId: restored.pairing.hostId, environmentId: restored.pairing.environmentId, enrollmentGeneration: restored.pairing.enrollmentGeneration, publicKeySpkiPem: restored.pairing.publicKeySpkiPem, publicFingerprint: restored.pairing.publicFingerprint, privateKeyPkcs8Pem: windowsCurrentUserDpapiCustody.unprotect(Buffer.from(restored.pairing.protectedPrivateKey, 'base64')).toString('utf8') } satisfies HostEnrollmentPrivateMaterial : null;
  const token = randomBytes(32).toString('hex'); let run: Awaited<ReturnType<typeof launch>> | null = null; let stopping = false; const activeProxy = supervisorProxy(); let configuration: AgentConfiguration = restored?.configuration ?? { gatewayUrl: null }; let sharing: RuntimeSharing = restored?.sharing ?? defaultRuntimeSharing(); let pairing: HostEnrollmentPrivateMaterial | null = restoredPairing; let pairingRequestId: string | null = restored?.pairing?.requestId ?? null; let pairingTimer: NodeJS.Timeout | null = null;
  const persistAgent = () => agentStore.write({ v: 1 as const, configuration, sharing, pairing: pairing ? { requestId: pairingRequestId, fleetId: pairing.fleetId, hostId: pairing.hostId, environmentId: pairing.environmentId, enrollmentGeneration: pairing.enrollmentGeneration, publicKeySpkiPem: pairing.publicKeySpkiPem, publicFingerprint: pairing.publicFingerprint, protectedPrivateKey: windowsCurrentUserDpapiCustody.protect(Buffer.from(pairing.privateKeyPkcs8Pem, 'utf8')).toString('base64') } : null });
  const monitorPairing = () => {
    if (!pairing || !pairingRequestId || !run || stopping) return;
    pairingTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${run!.origin}/api/devices/${pairingRequestId}/status`, { headers: { Origin: run!.origin } });
        requireThat(response.status === 200, 'DEVICE_ENROLLMENT_STATUS_UNAVAILABLE');
        const status = await response.json() as { state: 'PENDING' | 'APPROVED' | 'REVOKED' };
        if (status.state === 'APPROVED') { await run!.replaceEdgeWithEnrollment(pairing!); pairingRequestId = null; persistAgent(); pairingTimer = null; return; }
        if (status.state === 'REVOKED') { pairing = null; pairingRequestId = null; persistAgent(); pairingTimer = null; return; }
      } catch { /* Approval is not inferred; retain the existing Edge and surface pending state until a later status read. */ }
      monitorPairing();
    }, 1000);
  };
  const runtimes = (): AgentRuntimeProjection[] => {
    const observation = run?.runtimeObservation() ?? { status: 'unavailable' as const, discoveredSessions: 0, evidence: 'Agent NativeAdoption carriage is not running.' };
    return runtimeRegistry({ sharing, codexInstalled: run?.productPath === 'NATIVE_ADOPTION', health: observation.status, discoveredSessions: observation.discoveredSessions, evidence: observation.evidence });
  };
  const server = createServer(socket => {
    let received = ''; let handled = false; socket.setTimeout(10000, () => socket.destroy()); socket.on('error', () => {});
    const handle = async () => {
      let request: AgentIpcRequest;
      try { request = parseAgentIpcRequest(JSON.parse(received)); } catch { await reply(socket, { code: 'AGENT_IPC_REQUEST_INVALID' }); return; }
      if (request.token !== token) { await reply(socket, { code: 'CONTROL_AUTH_REJECTED' }); return; }
      if (request.command === 'runtime.setSharing') socket.setTimeout(130000, () => socket.destroy());
      if (request.command === 'status') {
        const health = run?.health();
        let nativeCodex = 'NOT_STARTED';
        if (run?.productPath === 'NATIVE_ADOPTION') {
          const observation = run.runtimeObservation();
          nativeCodex = sharing.enabled && sharing.shared ? observation.status === 'healthy' ? 'NATIVE_ADOPTED' :
            observation.evidence === 'NATIVE_CONNECTION_LOST' ? 'EXITED_OR_REUSED' : 'UNPROVABLE' : 'NATIVE_UNSHARED';
        }
        else if (run) try { const native = evidenceFromEdge(path.join(run.directory, 'edge.sqlite')); if (native.process) { const observed = probeProcess(native.process.processId); nativeCodex = observed.exists && observed.identity?.creationTime === native.process.creationTime ? 'RUNNING' : 'EXITED_OR_REUSED'; } } catch { nativeCodex = 'UNPROVABLE'; }
        await reply(socket, { v: AGENT_IPC_VERSION, code: run ? supervisorHealthCode(health, nativeCodex) : 'STARTING', runId: run?.runId ?? null, supervisor: 'RUNNING', hub: health?.hub ?? 'STARTING', edge: health?.edge ?? 'STARTING', edgeAdmission: health?.edgeAdmission ?? 'STARTING', nativeCodex, runtimePath: process.execPath, nodeVersion: process.version, sqliteVersion: process.versions.sqlite, codexPath: qualifiedCodex.executablePath, codexSha256: qualifiedCodex.sha256, proxy: activeProxy.display ?? 'direct', proxySource: activeProxy.source, configuration, ...(run ? { url: run.url } : {}) }); return;
      }
      if (request.command === 'config.get') { await reply(socket, { v: AGENT_IPC_VERSION, code: 'OK', configuration }); return; }
      if (request.command === 'config.set') { try { configuration = validateAgentConfiguration(request.body); persistAgent(); await reply(socket, { v: AGENT_IPC_VERSION, code: 'OK', configuration }); } catch (error) { await reply(socket, { v: AGENT_IPC_VERSION, code: error instanceof Error ? error.message : 'AGENT_CONFIGURATION_INVALID' }); } return; }
      if (request.command === 'runtime.list') { await reply(socket, { v: AGENT_IPC_VERSION, code: 'OK', runtimes: runtimes() }); return; }
      if (request.command === 'runtime.setSharing') {
        try {
          const action = request.body?.action;
          requireThat(action === undefined || action === 'pause' || action === 'resume', 'RUNTIME_SHARING_INVALID');
          // The installed .cmd launcher cannot portably preserve JSON quoting
          // through every Windows shell.  These two narrow actions retain the
          // already-admitted scope instead of asking the user to retype it.
          const next = action === 'pause' ? { ...sharing, shared: false } : action === 'resume' ? { ...sharing, shared: true } : updateSharing(sharing, request.body); requireThat(!!run, 'RUNTIME_SHARING_UNAVAILABLE');
          await run.setRuntimeSharing(next); sharing = next; persistAgent();
          await reply(socket, { v: AGENT_IPC_VERSION, code: 'OK', sharing, runtimes: runtimes(), evidence: 'Sharing changed through the admitted Edge; discovery remains observation-only.' });
        } catch (error) { await reply(socket, { v: AGENT_IPC_VERSION, code: error instanceof Error ? error.message : 'RUNTIME_SHARING_INVALID' }); }
        return;
      }
      if (request.command === 'pairing.request') {
        try {
          requireThat(!!run && !!request.body && typeof request.body.hostName === 'string' && request.body.hostName.trim().length > 0 && request.body.hostName.length <= 80, 'DEVICE_ENROLLMENT_INVALID');
          requireThat(!pairingRequestId, 'DEVICE_ENROLLMENT_ALREADY_PENDING');
          pairing = generateHostEnrollmentKey({ fleetId: 'fleetsplice-local', hostId: run.target.hostId, environmentId: run.target.environmentId, enrollmentGeneration: '1' });
          const identity = { fleetId: pairing.fleetId, hostId: pairing.hostId, environmentId: pairing.environmentId, enrollmentGeneration: pairing.enrollmentGeneration, publicKeySpkiPem: pairing.publicKeySpkiPem, publicFingerprint: pairing.publicFingerprint };
          const response = await fetch(`${run.origin}/api/devices/enroll`, { method: 'POST', headers: { Origin: run.origin, 'Content-Type': 'application/json' }, body: canonical({ hostName: request.body.hostName.trim(), identity }) });
          requireThat(response.status === 202, 'DEVICE_ENROLLMENT_REQUEST_REJECTED'); const enrolled = await response.json() as { requestId: string; state: string; publicFingerprint: string }; pairingRequestId = enrolled.requestId; persistAgent(); monitorPairing();
          await reply(socket, { v: AGENT_IPC_VERSION, code: 'PENDING_OWNER_APPROVAL', ...enrolled, approvalUrl: run.url });
        } catch (error) { await reply(socket, { v: AGENT_IPC_VERSION, code: error instanceof Error ? error.message : 'DEVICE_ENROLLMENT_REQUEST_REJECTED' }); }
        return;
      }
      if (request.command === 'diagnostics') { const health = run?.health(); await reply(socket, { v: AGENT_IPC_VERSION, code: 'OK', diagnostics: { pipe: 'WINDOWS_NAMED_PIPE_SID_SCOPED', networkListener: false, runId: run?.runId ?? null, hub: health?.hub ?? 'STARTING', edge: health?.edge ?? 'STARTING', configuration, runtimes: runtimes() } }); return; }
      if (!run || stopping) { await reply(socket, { v: AGENT_IPC_VERSION, code: 'STOP_NOT_ADMITTED' }); return; }
      stopping = true; if (pairingTimer) clearTimeout(pairingTimer); const proven = await run.stop(); await reply(socket, { v: AGENT_IPC_VERSION, code: proven ? 'CLOSED' : 'UNKNOWN_CLOSURE', runId: run.runId, nativeExitObserved: proven });
      server.close(() => process.exit(proven ? 0 : 2));
    };
    socket.on('data', bytes => {
      if (handled) return; received += String(bytes); if (Buffer.byteLength(received, 'utf8') > AGENT_IPC_MAX_BYTES) { socket.destroy(); return; }
      const delimiter = received.indexOf('\n'); if (delimiter < 0) return;
      handled = true; received = received.slice(0, delimiter); void handle().catch(() => socket.destroy());
    });
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(pipe, resolve); });
  try {
    run = await launch(root!, executable!, 43155, { environment: { ...process.env, ...activeProxy.environment }, productPath: 'NATIVE_ADOPTION', nativeServerCustody: 'AGENT_SUPERVISED', runtimeSharing: sharing, ...(pairing ? { hostIdentity: { hostId: pairing.hostId, hostGeneration: '1', environmentId: pairing.environmentId, environmentGeneration: '1' } } : {}), ...(pairing && !pairingRequestId ? { enrollment: pairing } : {}), onGuardCommitted: guard => {
      durable(path.join(base, guard.runId, 'control.json'), { v: AGENT_IPC_VERSION, pipe, token, runId: guard.runId, identity: guard.identity });
    } });
  } catch (error) {
    server.close(); throw error;
  }
  if (pairingRequestId) monitorPairing();
  process.on('SIGTERM', async () => { if (run && !stopping) { stopping = true; if (pairingTimer) clearTimeout(pairingTimer); await run.stop(); } server.close(() => process.exit(2)); });
  // Detached supervisor stays alive; its stdio is ignored by the launcher.
  while (!stopping) await delay(60000);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) supervisorEntrypoint().catch(error => {
  // The launcher intentionally ignores stdio; this is retained only for a
  // bounded local diagnostic when the supervisor is launched directly.
  process.stderr.write(`SUPERVISOR_START_FAILED: ${error instanceof Error ? error.message : 'UNKNOWN'}\n`); process.exit(2);
});
