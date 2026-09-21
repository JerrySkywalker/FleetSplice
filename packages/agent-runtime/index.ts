import { Fault, requireThat } from '../contracts/index.ts';
import type { AgentRuntimeProjection } from '../agent-ipc/index.ts';

export type SharingScope = { kind: 'ALL_ELIGIBLE' } | { kind: 'ALLOWED_ROOTS'; roots: string[] };
export type RuntimeSharing = { adapterId: 'codex-native'; enabled: boolean; shared: boolean; scope: SharingScope };

const clone = <T>(value: T): T => structuredClone(value);
export function defaultRuntimeSharing(): RuntimeSharing { return { adapterId: 'codex-native', enabled: true, shared: true, scope: { kind: 'ALL_ELIGIBLE' } }; }
export function validateRuntimeSharing(value: unknown): RuntimeSharing {
  requireThat(!!value && typeof value === 'object' && !Array.isArray(value), 'RUNTIME_SHARING_INVALID'); const item = value as Record<string, unknown>;
  requireThat(Object.keys(item).sort().join(',') === 'adapterId,enabled,scope,shared' && item.adapterId === 'codex-native' && typeof item.enabled === 'boolean' && typeof item.shared === 'boolean' && !!item.scope && typeof item.scope === 'object', 'RUNTIME_SHARING_INVALID');
  const scope = item.scope as Record<string, unknown>;
  if (scope.kind === 'ALL_ELIGIBLE') { requireThat(Object.keys(scope).length === 1, 'RUNTIME_SHARING_SCOPE_INVALID'); return { adapterId: 'codex-native', enabled: item.enabled, shared: item.shared, scope: { kind: 'ALL_ELIGIBLE' } }; }
  requireThat(scope.kind === 'ALLOWED_ROOTS' && Array.isArray(scope.roots) && scope.roots.length > 0 && scope.roots.length <= 64 && scope.roots.every(root => typeof root === 'string' && /^[a-zA-Z]:\\/.test(root) && root.length <= 1024), 'RUNTIME_SHARING_SCOPE_INVALID');
  return { adapterId: 'codex-native', enabled: item.enabled, shared: item.shared, scope: { kind: 'ALLOWED_ROOTS', roots: [...new Set(scope.roots.map(root => String(root).toLowerCase()))] } };
}
export function runtimeRegistry(input: { sharing: RuntimeSharing; codexInstalled: boolean; discoveredSessions: number; health: 'healthy' | 'degraded' | 'unavailable'; evidence: string }): AgentRuntimeProjection[] {
  const codex = input.sharing;
  return [
    { adapterId: 'codex-native', kind: 'Codex', installed: input.codexInstalled, discoverable: input.codexInstalled && codex.enabled && codex.shared, enabled: codex.enabled && input.codexInstalled, shared: codex.enabled && codex.shared && input.codexInstalled, status: input.codexInstalled ? input.health : 'unavailable', discoveredSessions: input.discoveredSessions, evidence: input.evidence },
    { adapterId: 'agy', kind: 'AGY', installed: false, discoverable: false, enabled: false, shared: false, status: 'unavailable', discoveredSessions: 0, evidence: 'AGY native contract is not implemented; no control or discovery is claimed.' },
  ];
}
export function mayShareWorkspace(sharing: RuntimeSharing, root: string): boolean {
  if (!sharing.enabled || !sharing.shared) return false;
  return sharing.scope.kind === 'ALL_ELIGIBLE' || sharing.scope.roots.includes(root.toLowerCase());
}
export function updateSharing(current: RuntimeSharing, value: unknown): RuntimeSharing { const next = validateRuntimeSharing(value); requireThat(next.adapterId === current.adapterId, 'RUNTIME_ADAPTER_UNKNOWN'); return clone(next); }
