import { randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeSync } from 'node:fs';
import path from 'node:path';
import { canonical, parseJson, requireThat, type PermissionPreset } from '../contracts/index.ts';
import { applyPrivateUserAcl } from '../local-operation/index.ts';

export const PRESETS: PermissionPreset[] = ['READ_ONLY', 'WORKSPACE_AUTO', 'YOLO'];
export const PROFILE_IDS: Record<PermissionPreset, string> = { READ_ONLY: ':read-only', WORKSPACE_AUTO: ':workspace', YOLO: ':danger-full-access' };
type Host = { principal: string; sid: string };
export function ceilingPath(env: NodeJS.ProcessEnv = process.env): string {
  requireThat(typeof env.LOCALAPPDATA === 'string' && path.isAbsolute(env.LOCALAPPDATA), 'LOCALAPPDATA_REQUIRED');
  return path.join(env.LOCALAPPDATA, 'FleetSplice', 'permissions.json');
}
export function readCeiling(host: Host, env: NodeJS.ProcessEnv = process.env): PermissionPreset {
  const file = ceilingPath(env); if (!existsSync(file)) return 'READ_ONLY';
  const stat = lstatSync(file);
  requireThat(stat.isFile() && !stat.isSymbolicLink() && stat.size <= 4096 && !lstatSync(path.dirname(file)).isSymbolicLink(), 'HOST_PERMISSION_CEILING_INVALID');
  const value = parseJson(readFileSync(file, 'utf8')) as any;
  requireThat(value && canonical(Object.keys(value).sort()) === canonical(['host', 'maximum', 'version']) && value.version === 1 && canonical(value.host) === canonical(host) && PRESETS.includes(value.maximum), 'HOST_PERMISSION_CEILING_INVALID');
  return value.maximum;
}
export function permits(maximum: PermissionPreset, requested: PermissionPreset): boolean {
  return PRESETS.includes(maximum) && PRESETS.includes(requested) && PRESETS.indexOf(requested) <= PRESETS.indexOf(maximum);
}
export function writeCeiling(host: Host, maximum: PermissionPreset, env: NodeJS.ProcessEnv = process.env, acl = applyPrivateUserAcl): void {
  requireThat(PRESETS.includes(maximum), 'UNKNOWN_PERMISSION_PRESET');
  const file = ceilingPath(env), parent = path.dirname(file); mkdirSync(parent, { recursive: true });
  requireThat(!lstatSync(parent).isSymbolicLink(), 'HOST_PERMISSION_CEILING_INVALID'); acl(parent, host.sid, true);
  const lock = `${file}.lock`, fd = openSync(lock, 'wx'), temporary = path.join(parent, `.permissions-${randomUUID()}.tmp`);
  try {
    readCeiling(host, env);
    const output = openSync(temporary, 'wx', 0o600);
    try { writeSync(output, canonical({ version: 1, host, maximum })); fsyncSync(output); } finally { closeSync(output); }
    acl(temporary, host.sid, false); renameSync(temporary, file);
  } finally { closeSync(fd); unlinkSync(lock); if (existsSync(temporary)) unlinkSync(temporary); }
}
