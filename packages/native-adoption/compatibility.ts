import { canonical, requireThat } from '../contracts/json.ts';
import { createHash } from 'node:crypto';
import type { Compatibility, NativeArtifactIdentity } from './types.ts';

export function classifyCapabilities(capabilities: Compatibility['capabilities']): Compatibility['profile'] {
  const has = (...names: (keyof typeof capabilities)[]) => names.every(name => capabilities[name].available);
  if (has('sharedDaemon', 'threadList', 'threadRead', 'resume', 'turnStart')) {
    // Steer, interrupt and approvals are independent optional controls.
    return has('events', 'activeTurn') ? 'ADOPT_FULL' : 'ADOPT_RESUME';
  }
  return has('turnStart', 'events') ? 'MANAGED_ONLY' : 'UNSUPPORTED';
}
export function incarnationOf(identity: NativeArtifactIdentity): string {
  return createHash('sha256').update(canonical({ pid: identity.processId,
    executable: identity.executablePath?.toLowerCase() ?? null,
    created: identity.processCreationTime, endpoint: identity.endpoint,
    endpointIdentity: identity.endpointIdentity, server: identity.serverIncarnation })).digest('hex');
}
export function assertSameIncarnation(before: NativeArtifactIdentity, now: NativeArtifactIdentity): void {
  requireThat(incarnationOf(before) === incarnationOf(now), 'NATIVE_SERVER_INCARCATION_CHANGED');
}
