import { createHash } from 'node:crypto';
import path from 'node:path';
import { canonical, requireThat } from '../contracts/json.ts';

// Native read-only command execution is intentionally left available for P1.
// Integrations that can expand the authority surface remain disabled.
export const DISABLED_FEATURES = ['hooks', 'plugins', 'multi_agent', 'code_mode', 'apps', 'image_generation', 'view_image'] as const;
export const NATIVE_POLICY_ARGS = ['-c', 'sandbox_mode="read-only"', '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', '-c', 'notify=[]', '-c', 'agents.enabled=false', '-c', 'features.multi_agent_v2.enabled=false', ...DISABLED_FEATURES.flatMap(name => ['-c', `features.${name}=false`])];
// Pinned 0.153.4 reads this marker before worker threads, selecting DisabledEphemeral.
// Stdio alone selects ResolvePersisted and can restore a separate remote transport.
export const NATIVE_POLICY_ENV = { CODEX_INTERNAL_APP_SERVER_REMOTE_CONTROL_DISABLED: '1' };

// config/read is handled inside native Codex. Never persist/project the response:
// integration transport settings may contain sensitive configuration values.
export type NativePolicy = { stamp: string; safetyStamp: string; trustStamp: string; activeTrust: string | null; overrides: { mcp_servers: Record<string, { enabled: false }> } };
const hash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');
const workspaceKey = (root: string) => path.win32.normalize(root).replace(/[\\/]+$/, '').toLowerCase();
export function integrationPolicy(response: any, root = ''): NativePolicy {
  const config = response?.config;
  requireThat(config && typeof config === 'object' && !Array.isArray(config) && response.origins && typeof response.origins === 'object', 'NATIVE_CONFIG_UNQUALIFIED');
  requireThat(config.web_search === 'disabled' && config.approval_policy === 'never' && config.sandbox_mode === 'read-only', 'NATIVE_POLICY_UNQUALIFIED');
  requireThat(DISABLED_FEATURES.every(name => config.features?.[name] === false), 'NATIVE_INTEGRATIONS_NOT_DISABLED');
  // The model catalog can select multi-agent v2 even when the legacy toggle is off.
  requireThat(config.agents?.enabled === false && config.features?.multi_agent_v2?.enabled === false, 'NATIVE_AGENTS_NOT_DISABLED');
  requireThat(Array.isArray(config.notify) && config.notify.length === 0, 'NATIVE_NOTIFY_NOT_DISABLED');
  const servers = config.mcp_servers;
  requireThat(servers && typeof servers === 'object' && !Array.isArray(servers) && Object.keys(servers).length <= 128, 'NATIVE_MCP_CONFIG_UNQUALIFIED');
  const disabled = Object.create(null) as Record<string, { enabled: false }>;
  for (const [name, value] of Object.entries(servers)) {
    requireThat(name.length > 0 && name.length <= 200 && value && typeof value === 'object' && !Array.isArray(value), 'NATIVE_MCP_CONFIG_UNQUALIFIED');
    disabled[name] = { enabled: false };
  }
  const projects = config.projects ?? {};
  requireThat(projects && typeof projects === 'object' && !Array.isArray(projects), 'NATIVE_TRUST_UNQUALIFIED');
  const active = Object.entries(projects).filter(([key]) => root && workspaceKey(key) === workspaceKey(root));
  requireThat(active.length <= 1, 'NATIVE_TRUST_UNQUALIFIED');
  const activeConfig = active[0]?.[1] as any;
  const activeTrust = activeConfig?.trust_level ?? null;
  requireThat(activeTrust === null || activeTrust === 'trusted' || activeTrust === 'untrusted', 'NATIVE_TRUST_UNQUALIFIED');
  // Only unrelated trust is excluded. Unknown project settings still participate
  // in safety drift detection; a new native field is never silently admitted.
  const otherProjectSettings = Object.fromEntries(Object.entries(projects).flatMap(([key, value]) => {
    requireThat(value && typeof value === 'object' && !Array.isArray(value), 'NATIVE_TRUST_UNQUALIFIED');
    const { trust_level: _trust, ...rest } = value as Record<string, unknown>;
    return Object.keys(rest).length ? [[key, rest]] : [];
  }));
  // Version identifies the entire source file, so an unrelated trust addition
  // changes it. Keep origin source identity, but compare values independently.
  const projectKeys = Object.keys(projects).sort((a, b) => b.length - a.length);
  const activePrefix = active[0] ? `projects.${active[0][0]}` : null;
  const trustOrigins: Record<string, unknown> = Object.create(null);
  const origins = Object.fromEntries(Object.entries(response.origins).filter(([key]) => {
    if (key === 'projects') return active.length > 0 || Object.keys(otherProjectSettings).length > 0;
    if (!key.startsWith('projects.')) return true;
    const projectKey = projectKeys.find(project => key === `projects.${project}` || key.startsWith(`projects.${project}.`));
    // Unknown origin-only deltas remain guarded. Only identified unrelated
    // trust leaves (or their otherwise empty table) are outside this identity.
    if (!projectKey || workspaceKey(projectKey) === workspaceKey(root)) return true;
    const suffix = key.slice(`projects.${projectKey}`.length);
    return suffix === '' ? Object.hasOwn(otherProjectSettings, projectKey) : suffix !== '.trust_level';
  }).map(([key, value]) => {
    requireThat(value && typeof value === 'object' && !Array.isArray(value), 'NATIVE_ORIGIN_UNQUALIFIED');
    const { version: _version, ...identity } = value as Record<string, unknown>;
    if (activePrefix && (key === 'projects' || key === activePrefix || key === `${activePrefix}.trust_level`)) trustOrigins[key] = identity;
    return [key, identity];
  }));
  const { projects: _projects, ...remaining } = config;
  const safetyStamp = hash({ config: remaining, otherProjectSettings, origins });
  const trustStamp = hash({ workspace: workspaceKey(root), activeTrust, trustOrigins });
  return { stamp: hash({ safetyStamp, trustStamp }), safetyStamp, trustStamp, activeTrust, overrides: { mcp_servers: disabled } };
}

export function assertPolicyUnchanged(previous: NativePolicy | null | undefined, current: NativePolicy): void {
  requireThat(!previous || previous.trustStamp === current.trustStamp, 'NATIVE_ACTIVE_WORKSPACE_TRUST_CHANGED');
  requireThat(!previous || previous.safetyStamp === current.safetyStamp, 'NATIVE_CONFIG_CHANGED');
}
