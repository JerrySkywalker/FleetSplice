import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, lstatSync, mkdirSync, openSync, closeSync, writeSync, fsyncSync, renameSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { canonical, parseJson, requireThat, type Target, type WorkspaceBinding } from '../contracts/index.ts';
import { rootProof, rootProofNow } from '../../apps/edge/identity.ts';
import { applyPrivateUserAcl } from '../local-operation/index.ts';

export type WorkspaceHost = { principal: string; sid: string };
export type WorkspaceEntry = { id: string; displayName: string; root: string; rootIdentity: string; lastObservedAt: string; lastObservedValidity: 'VALID' };
export type WorkspaceRegistry = { version: 1; host: WorkspaceHost; selectedId: string | null; entries: WorkspaceEntry[] };
export function registryPath(env: NodeJS.ProcessEnv = process.env): string {
  requireThat(typeof env.LOCALAPPDATA === 'string' && path.isAbsolute(env.LOCALAPPDATA), 'LOCALAPPDATA_REQUIRED');
  return path.join(env.LOCALAPPDATA, 'FleetSplice', 'workspaces.json');
}
const keys = (value: object, expected: string[]) => canonical(Object.keys(value).sort()) === canonical(expected.sort());
export function readRegistry(host: WorkspaceHost, env: NodeJS.ProcessEnv = process.env): WorkspaceRegistry | null {
  const file = registryPath(env); if (!existsSync(file)) return null;
  const info = lstatSync(file);
  requireThat(info.isFile() && !info.isSymbolicLink() && info.size <= 65536 && !lstatSync(path.dirname(file)).isSymbolicLink(), 'WORKSPACE_REGISTRY_INVALID');
  const value = parseJson(readFileSync(file, 'utf8')) as WorkspaceRegistry;
  requireThat(!!value && typeof value === 'object' && keys(value, ['version', 'host', 'selectedId', 'entries']) && value.version === 1 && canonical(value.host) === canonical(host) && Array.isArray(value.entries) && value.entries.length <= 16, 'WORKSPACE_REGISTRY_HOST_OR_SCHEMA_INVALID');
  const ids = new Set<string>(), roots = new Set<string>();
  for (const e of value.entries) {
    requireThat(!!e && keys(e, ['id', 'displayName', 'root', 'rootIdentity', 'lastObservedAt', 'lastObservedValidity']) && typeof e.id === 'string' && /^[0-9a-f-]{36}$/.test(e.id) && !ids.has(e.id) && typeof e.displayName === 'string' && e.displayName.trim().length > 0 && e.displayName.length <= 80 && typeof e.root === 'string' && /^[A-Za-z]:\\/.test(e.root) && e.root.length <= 1024 && !roots.has(e.root.toLowerCase()) && /^[0-9a-f]{64}$/.test(e.rootIdentity) && typeof e.lastObservedAt === 'string' && Number.isFinite(Date.parse(e.lastObservedAt)) && e.lastObservedValidity === 'VALID', 'WORKSPACE_REGISTRY_INVALID');
    ids.add(e.id); roots.add(e.root.toLowerCase());
  }
  requireThat(value.selectedId === null || ids.has(value.selectedId), 'WORKSPACE_REGISTRY_SELECTION_INVALID'); return value;
}
export async function workspaceValidity(entry: Pick<WorkspaceEntry, 'root' | 'rootIdentity'>): Promise<boolean> {
  try { const proof = await rootProof(entry.root); return proof.root === entry.root && proof.rootIdentity === entry.rootIdentity; } catch { return false; }
}
export async function changeRegistry(host: WorkspaceHost, operation: 'add' | 'remove' | 'select', value: string, displayName?: string, env: NodeJS.ProcessEnv = process.env, acl = applyPrivateUserAcl): Promise<WorkspaceRegistry> {
  const file = registryPath(env), directory = path.dirname(file); mkdirSync(directory, { recursive: true });
  requireThat(!lstatSync(directory).isSymbolicLink(), 'WORKSPACE_REGISTRY_INVALID'); acl(directory, host.sid, true);
  const lock = `${file}.lock`; const fd = openSync(lock, 'wx');
  const temporary = path.join(directory, `.workspaces-${randomUUID()}.tmp`);
  try {
    const existing = readRegistry(host, env);
    const registry = existing ?? { version: 1, host, selectedId: null, entries: [] };
    if (operation === 'add') {
      requireThat(typeof displayName === 'string' && displayName.trim().length > 0 && displayName.length <= 80 && registry.entries.length < 16, 'WORKSPACE_NAME_OR_LIMIT_INVALID');
      const proof = await rootProof(value);
      requireThat(proof.root.length <= 1024, 'WORKSPACE_ROOT_TOO_LONG');
      requireThat(!registry.entries.some(e => e.root.toLowerCase() === proof.root.toLowerCase()), 'WORKSPACE_ALREADY_REGISTERED');
      const entry: WorkspaceEntry = { id: randomUUID(), displayName, ...proof, lastObservedAt: new Date().toISOString(), lastObservedValidity: 'VALID' };
      registry.entries.push(entry); if (existing === null) registry.selectedId = entry.id;
    } else {
      const entry = registry.entries.find(e => e.id === value); requireThat(entry, 'WORKSPACE_UNKNOWN');
      if (operation === 'select') { requireThat(await workspaceValidity(entry), 'WORKSPACE_MISSING_OR_REPLACED'); registry.selectedId = entry.id; }
      else { registry.entries = registry.entries.filter(e => e.id !== entry.id); if (registry.selectedId === entry.id) registry.selectedId = null; }
    }
    const out = openSync(temporary, 'wx', 0o600); try { writeSync(out, canonical(registry)); fsyncSync(out); } finally { closeSync(out); }
    acl(temporary, host.sid, false); renameSync(temporary, file); return registry;
  } finally { closeSync(fd); unlinkSync(lock); if (existsSync(temporary)) unlinkSync(temporary); }
}
export async function workspaceBindings(root: string, host: WorkspaceHost, target: Target): Promise<WorkspaceBinding[]> {
  const registry = readRegistry(host);
  if (!registry) return [{ registryId: target.workspaceId, displayName: path.basename(root), root, rootIdentity: target.rootIdentity, target, valid: true }];
  const current = registry.entries.find(e => e.root === root && e.rootIdentity === target.rootIdentity);
  requireThat(current && await workspaceValidity(current), 'WORKSPACE_NOT_REGISTERED_OR_REPLACED');
  return Promise.all(registry.entries.map(async e => ({ registryId: e.id, registryManaged: true, displayName: e.displayName, root: e.root, rootIdentity: e.rootIdentity, target: e.id === current.id ? target : { ...target, workspaceId: randomUUID(), rootIdentity: e.rootIdentity }, valid: await workspaceValidity(e) })));
}
export function verifyWorkspaceNow(binding: WorkspaceBinding, host: WorkspaceHost): void {
  const registry = readRegistry(host);
  requireThat(!binding.registryManaged || registry !== null, 'WORKSPACE_REGISTRATION_CHANGED');
  if (registry) requireThat(registry.entries.some(e => e.id === binding.registryId && e.root === binding.root && e.rootIdentity === binding.rootIdentity), 'WORKSPACE_REGISTRATION_CHANGED');
  const current = rootProofNow(binding.root);
  requireThat(binding.valid && current.root === binding.root && current.rootIdentity === binding.rootIdentity, 'WORKSPACE_MISSING_OR_REPLACED');
}
export async function verifyWorkspace(binding: WorkspaceBinding, host: WorkspaceHost): Promise<void> { verifyWorkspaceNow(binding, host); }
