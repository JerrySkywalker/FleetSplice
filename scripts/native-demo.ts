import { fork } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHub } from '../apps/hub/server.ts';
import { localIdentity, type LocalIdentity } from '../apps/edge/identity.ts';
import { requireThat, Fault, type Target } from '../packages/contracts/index.ts';
import type { AdoptionPort } from '../packages/native-adoption/types.ts';
import { applyPrivateUserAcl } from '../packages/local-operation/index.ts';

/** Historical disposable demo Workspace. CLI no-argument native-demo only. */
export const DEMO_WORKSPACE = 'V:\\artifacts\\FleetSplice\\demo-native-adoption\\workspace';

/** Legacy single-demo journal namespace. Historical no-argument native-demo only. */
export const LEGACY_NATIVE_ADOPTION_DEMO_STATE = 'native-adoption-demo';

/** Explicit Workspace journal parent namespace under %LOCALAPPDATA%\\FleetSplice. */
export const NATIVE_ADOPTION_STATE_NAMESPACE = 'native-adoption';

export type NativeAdoptionCliCommand = 'native-demo' | 'adopt';

/**
 * CLI compatibility boundary: historical demo default lives here only.
 * Runtime never substitutes DEMO_WORKSPACE for an explicit request.
 */
export function resolveNativeAdoptionWorkspace(command: NativeAdoptionCliCommand, args: string[]): string {
  const workspaceIndex = args.indexOf('--workspace');
  if (command === 'adopt') {
    requireThat(workspaceIndex === 1 && args.length === 3 && typeof args[2] === 'string' && args[2]!.length > 0, 'USAGE_FLEETSPLICE_ADOPT_WORKSPACE');
    return args[2]!;
  }
  if (args.length === 1) return DEMO_WORKSPACE;
  requireThat(workspaceIndex === 1 && args.length === 3 && typeof args[2] === 'string' && args[2]!.length > 0, 'USAGE_FLEETSPLICE_NATIVE_DEMO');
  return args[2]!;
}

/** True only for `fleetsplice native-demo` with no further arguments. */
export function isHistoricalNativeDemoRoute(command: NativeAdoptionCliCommand, args: string[]): boolean {
  return command === 'native-demo' && args.length === 1;
}

/**
 * State isolation for native adoption journals.
 * Historical no-argument demo keeps the legacy directory; explicit Workspace
 * routes use rootIdentity so separate Workspaces never share one sqlite journal.
 * Isolation is by stateDirectory construction; restoreInput is not filtered by path.
 */
export function resolveNativeAdoptionStateDirectory(input: {
  historicalCompatibilityRoute: boolean;
  rootIdentity: string;
  localAppData?: string;
}): string {
  const localAppData = input.localAppData ?? process.env.LOCALAPPDATA;
  requireThat(typeof localAppData === 'string' && localAppData.length > 0, 'LOCALAPPDATA_REQUIRED');
  if (input.historicalCompatibilityRoute) {
    return path.join(localAppData, 'FleetSplice', LEGACY_NATIVE_ADOPTION_DEMO_STATE);
  }
  requireThat(/^[0-9a-f]{64}$/.test(input.rootIdentity), 'ROOT_IDENTITY_INVALID');
  return path.join(localAppData, 'FleetSplice', NATIVE_ADOPTION_STATE_NAMESPACE, input.rootIdentity);
}

/** Same local identity/root proof used by native adoption; never replaces the requested root. */
export async function proveNativeAdoptionWorkspace(workspace: string): Promise<LocalIdentity> {
  requireThat(typeof workspace === 'string' && /^[a-zA-Z]:\\/.test(workspace) && !workspace.includes('\0'), 'LOCAL_ABSOLUTE_ROOT_REQUIRED');
  requireThat(existsSync(workspace), 'WORKSPACE_ROOT_MISSING');
  return await localIdentity(workspace);
}

export async function startNativeDemo(
  workspace: string,
  onReady: (url: string) => void,
  options: { historicalCompatibilityRoute?: boolean } = {},
) {
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const identity = await proveNativeAdoptionWorkspace(workspace);
  const stateDirectory = resolveNativeAdoptionStateDirectory({
    historicalCompatibilityRoute: options.historicalCompatibilityRoute === true,
    rootIdentity: identity.rootIdentity,
  });
  mkdirSync(stateDirectory, { recursive: true });
  applyPrivateUserAcl(stateDirectory, identity.sid, true);
  requireThat(existsSync(path.join(installation, 'web', 'index.html')), 'FLEETSPLICE_BUILD_UNAVAILABLE');
  const target: Target = { authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(),
    hubRecoveryGeneration: '0', edgeRecoveryGeneration: '0', hostId: randomUUID(), hostGeneration: '0', environmentId: randomUUID(), environmentGeneration: '0',
    workspaceId: randomUUID(), workspaceGeneration: '0', rootIdentity: identity.rootIdentity, agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() };
  let edge: ReturnType<typeof fork> | null = null;
  const pending = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();
  const call = (kind: string, fields: object = {}): Promise<any> => new Promise((resolve, reject) => {
    requireThat(edge?.connected, 'NATIVE_EDGE_UNAVAILABLE');
    const id = randomUUID(); const timer = setTimeout(() => { pending.delete(id); reject(new Fault('NATIVE_EDGE_RESPONSE_UNKNOWN_NO_REPLAY')); }, 55000);
    pending.set(id, { resolve, reject, timer }); edge.send({ id, kind, ...fields });
  });
  const port: AdoptionPort = {
    snapshot: (options) => call('snapshot', { options: options ?? {} }),
    execute: (command, client) => call('execute', { command, client }),
    renewClient: (previous, next, continuity) => call('renewClient', { previous, next, continuity }),
    lookup: commandId => call('lookup', { commandId }),
    pollRealtime: sinceRevision => call('pollRealtime', { sinceRevision }),
  };
  const bootstrapToken = randomBytes(32).toString('hex');
  // A fixed loopback endpoint admits only one D0 Hub before any native attach.
  const hub = await startHub({ port: 4319, target, ...identity, stateDirectory,
    webDirectory: path.join(installation, 'web'), bootstrapToken, hcpToken: randomBytes(32).toString('hex') }, port);
  try {
    edge = fork(path.join(installation, 'apps', 'edge', 'native-adoption.js'), [], { cwd: installation, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
    edge.on('message', (message: any) => {
      const request = pending.get(message.id); if (!request) return;
      clearTimeout(request.timer); pending.delete(message.id);
      if (message.error) request.reject(new Fault(message.error)); else request.resolve(message.result);
    });
    edge.on('exit', () => { for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Fault('NATIVE_EDGE_UNAVAILABLE')); } pending.clear(); });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Fault('NATIVE_ADOPTION_START_TIMEOUT')), 50000);
      edge!.on('message', (message: any) => { if (message.kind === 'nativeReady') { clearTimeout(timer); resolve(); } if (message.kind === 'error') { clearTimeout(timer); reject(new Error(message.code)); } });
      edge!.once('error', reject); edge!.send({ workspace: identity.root, stateDirectory });
    });
    onReady(`http://127.0.0.1:4319/#bootstrap=${bootstrapToken}`);
    const stop = async () => { if (edge?.connected) edge.send({ kind: 'stop' }); await hub.close(); };
    return { stop, stateDirectory, port, workspace: identity.root, rootIdentity: identity.rootIdentity };
  } catch (error) { if (edge?.connected) edge.disconnect(); await hub.close(); throw error; }
}
