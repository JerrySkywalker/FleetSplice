import { createServer, type Socket } from 'node:net';
import { randomBytes } from 'node:crypto';
import { existsSync, openSync, closeSync, writeSync, fsyncSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localIdentity } from '../apps/edge/identity.ts';
import { canonical, requireThat } from '../packages/contracts/index.ts';
import { classifyPredecessor, discoverCodex, evidenceFromEdge, probeProcess, resolveProxy, type Guard, type ProxyResolution } from '../packages/local-operation/index.ts';
import { launch } from './local.ts';

type Control = { token: string; command: 'status' | 'stop' };
export function supervisorHealthCode(health: { hub: string; edge: string; edgeAdmission: string } | undefined, nativeCodex: string): 'RUNNING' | 'RECOVERY_REQUIRED' {
  return health?.hub === 'RUNNING' && health.edge === 'RUNNING' && health.edgeAdmission === 'READY' && !['EXITED_OR_REUSED', 'UNPROVABLE'].includes(nativeCodex) ? 'RUNNING' : 'RECOVERY_REQUIRED';
}
export function supervisorProxy(environment: NodeJS.ProcessEnv = process.env): ProxyResolution {
  const resolved = resolveProxy(environment);
  const source = environment.FLEETSPLICE_PROXY_SOURCE;
  if (source === undefined) return resolved;
  requireThat(['explicit-env', 'windows-user-proxy', 'windows-system-proxy', 'direct'].includes(source), 'SUPERVISOR_PROXY_METADATA_INVALID');
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
  const qualifiedCodex = discoverCodex([executable!]);
  const base = path.join(process.env.LOCALAPPDATA!, 'FleetSplice', 'G05');
  const predecessor = classifyPredecessor(base);
  requireThat(['NO_PREDECESSOR', 'SAFE_NO_EFFECT', 'SAFE_TERMINAL', 'RETIRED_AMBIGUOUS'].includes(predecessor.kind), 'RECOVERY_REQUIRED');
  const pipe = `\\\\.\\pipe\\fleetsplice-g05-${identity.sid}`;
  const token = randomBytes(32).toString('hex'); let run: Awaited<ReturnType<typeof launch>> | null = null; let stopping = false; const activeProxy = supervisorProxy();
  const server = createServer(socket => {
    let received = ''; let handled = false; socket.setTimeout(10000, () => socket.destroy()); socket.on('error', () => {});
    const handle = async () => {
      let request: Control;
      try { request = JSON.parse(received) as Control; } catch { await reply(socket, { code: 'CONTROL_REQUEST_INVALID' }); return; }
      if (request.token !== token || !['status', 'stop'].includes(request.command)) { await reply(socket, { code: 'CONTROL_AUTH_REJECTED' }); return; }
      if (request.command === 'status') {
        const health = run?.health();
        let nativeCodex = 'NOT_STARTED';
        if (run) try { const native = evidenceFromEdge(path.join(run.directory, 'edge.sqlite')); if (native.process) { const observed = probeProcess(native.process.processId); nativeCodex = observed.exists && observed.identity?.creationTime === native.process.creationTime ? 'RUNNING' : 'EXITED_OR_REUSED'; } } catch { nativeCodex = 'UNPROVABLE'; }
        await reply(socket, { code: run ? supervisorHealthCode(health, nativeCodex) : 'STARTING', runId: run?.runId ?? null, supervisor: 'RUNNING', hub: health?.hub ?? 'STARTING', edge: health?.edge ?? 'STARTING', edgeAdmission: health?.edgeAdmission ?? 'STARTING', nativeCodex, runtimePath: process.execPath, nodeVersion: process.version, sqliteVersion: process.versions.sqlite, codexPath: qualifiedCodex.path, codexSha256: qualifiedCodex.sha256, proxy: activeProxy.display ?? 'direct', proxySource: activeProxy.source, ...(run ? { url: run.url } : {}) }); return;
      }
      if (!run || stopping) { await reply(socket, { code: 'STOP_NOT_ADMITTED' }); return; }
      stopping = true; const proven = await run.stop(); await reply(socket, { code: proven ? 'CLOSED' : 'UNKNOWN_CLOSURE', runId: run.runId, nativeExitObserved: proven });
      server.close(() => process.exit(proven ? 0 : 2));
    };
    socket.on('data', bytes => {
      if (handled) return; received += String(bytes); if (received.length > 8192) { socket.destroy(); return; }
      const delimiter = received.indexOf('\n'); if (delimiter < 0) return;
      handled = true; received = received.slice(0, delimiter); void handle().catch(() => socket.destroy());
    });
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(pipe, resolve); });
  try {
    run = await launch(root!, executable!, 43155, { environment: { ...process.env, ...activeProxy.environment }, onGuardCommitted: guard => {
      durable(path.join(base, guard.runId, 'control.json'), { pipe, token, runId: guard.runId, identity: guard.identity });
    } });
  } catch (error) {
    server.close(); throw error;
  }
  process.on('SIGTERM', async () => { if (run && !stopping) { stopping = true; await run.stop(); } server.close(() => process.exit(2)); });
  // Detached supervisor stays alive; its stdio is ignored by the launcher.
  while (!stopping) await delay(60000);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) supervisorEntrypoint().catch(error => {
  // The launcher intentionally ignores stdio; this is retained only for a
  // bounded local diagnostic when the supervisor is launched directly.
  process.stderr.write(`SUPERVISOR_START_FAILED: ${error instanceof Error ? error.message : 'UNKNOWN'}\n`); process.exit(2);
});
