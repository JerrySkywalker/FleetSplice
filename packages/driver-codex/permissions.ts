import { canonical, requireThat, type NativePermissionEvidence, type PermissionCapability, type PermissionPreset } from '../contracts/index.ts';

// Exact 0.153.4 schema + configuration-only native probe; IDs must also be
// present and allowed in the live permissionProfile/list response for this cwd.
const profiles: Record<PermissionPreset, string> = { READ_ONLY: ':read-only', WORKSPACE_AUTO: ':workspace', YOLO: ':danger-full-access' };
export function permissionCapabilities(data: unknown): PermissionCapability[] {
  requireThat(Array.isArray(data) && data.length <= 128, 'NATIVE_PERMISSION_CAPABILITIES_INVALID');
  const ids = new Set<string>();
  for (const item of data) {
    requireThat(item && typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 200 && typeof item.allowed === 'boolean' && !ids.has(item.id), 'NATIVE_PERMISSION_CAPABILITIES_INVALID');
    ids.add(item.id);
  }
  return (Object.keys(profiles) as PermissionPreset[]).map(preset => ({ preset, nativeProfileId: profiles[preset], allowed: data.some(item => item.id === profiles[preset] && item.allowed) }));
}
export function permissionRequest(preset: PermissionPreset) {
  requireThat(Object.hasOwn(profiles, preset), 'UNKNOWN_PERMISSION_PRESET');
  return { approvalPolicy: 'never' as const, sandbox: preset === 'READ_ONLY' ? 'read-only' : preset === 'WORKSPACE_AUTO' ? 'workspace-write' : 'danger-full-access', config: { sandbox_workspace_write: { writable_roots: [], network_access: false, exclude_tmpdir_env_var: true, exclude_slash_tmp: true } } };
}
export function observePermission(preset: PermissionPreset, response: any): NativePermissionEvidence {
  requireThat(response?.approvalPolicy === 'never', 'NATIVE_PERMISSION_UNOBSERVED');
  const sandbox = response.sandbox;
  const expected = preset === 'READ_ONLY' ? { type: 'readOnly', networkAccess: false } : preset === 'YOLO' ? { type: 'dangerFullAccess' } : { type: 'workspaceWrite', writableRoots: [], networkAccess: false, excludeTmpdirEnvVar: true, excludeSlashTmp: true };
  requireThat(canonical(sandbox) === canonical(expected), 'NATIVE_PERMISSION_UNOBSERVED');
  if (preset === 'READ_ONLY') requireThat(sandbox?.type === 'readOnly' && sandbox.networkAccess === false, 'NATIVE_PERMISSION_UNOBSERVED');
  else if (preset === 'WORKSPACE_AUTO') requireThat(sandbox?.type === 'workspaceWrite' && sandbox.networkAccess === false && Array.isArray(sandbox.writableRoots) && sandbox.writableRoots.length === 0 && sandbox.excludeTmpdirEnvVar === true && sandbox.excludeSlashTmp === true, 'NATIVE_PERMISSION_UNOBSERVED');
  else requireThat(preset === 'YOLO' && sandbox?.type === 'dangerFullAccess', 'NATIVE_PERMISSION_UNOBSERVED');
  return { preset, approvalPolicy: 'never', sandbox: sandbox.type, network: preset === 'YOLO' ? 'native-unrestricted' : 'denied', writableRoots: [], excludeTmpdirEnvVar: preset === 'WORKSPACE_AUTO', excludeSlashTmp: preset === 'WORKSPACE_AUTO' };
}
export function turnPermission(evidence: NativePermissionEvidence) {
  if (evidence.preset === 'YOLO') return { type: 'dangerFullAccess' };
  if (evidence.preset === 'READ_ONLY') return { type: 'readOnly', networkAccess: false };
  return { type: 'workspaceWrite', writableRoots: [], networkAccess: false, excludeTmpdirEnvVar: true, excludeSlashTmp: true };
}
