import { fork } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHub } from '../apps/hub/server.ts';
import { localIdentity } from '../apps/edge/identity.ts';
import { requireThat, Fault, type Target } from '../packages/contracts/index.ts';
import type { AdoptionPort } from '../packages/native-adoption/types.ts';
import { applyPrivateUserAcl } from '../packages/local-operation/index.ts';

export const DEMO_WORKSPACE = 'V:\\artifacts\\FleetSplice\\demo-native-adoption\\workspace';
export async function startNativeDemo(onReady: (url: string) => void) {
  const installation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const identity = await localIdentity(DEMO_WORKSPACE);
  const stateDirectory = path.join(process.env.LOCALAPPDATA!, 'FleetSplice', 'native-adoption-demo');
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
  const port: AdoptionPort = { snapshot: () => call('snapshot'), execute: (command, clientInstanceId, expiresAt) => call('execute', { command, clientInstanceId, expiresAt }), lookup: commandId => call('lookup', { commandId }) };
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
    return { stop, stateDirectory, port };
  } catch (error) { if (edge?.connected) edge.disconnect(); await hub.close(); throw error; }
}
