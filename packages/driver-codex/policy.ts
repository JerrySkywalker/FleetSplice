import { createHash } from 'node:crypto';
import { canonical, requireThat } from '../contracts/json.ts';

export const DISABLED_FEATURES = ['hooks', 'plugins', 'shell_tool', 'unified_exec', 'multi_agent', 'code_mode', 'apps', 'image_generation', 'view_image'] as const;
export const NATIVE_POLICY_ARGS = ['-c', 'sandbox_mode="read-only"', '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', '-c', 'notify=[]', '-c', 'agents.enabled=false', '-c', 'features.multi_agent_v2.enabled=false', ...DISABLED_FEATURES.flatMap(name => ['-c', `features.${name}=false`])];
// Pinned 0.153.4 reads this marker before worker threads, selecting DisabledEphemeral.
// Stdio alone selects ResolvePersisted and can restore a separate remote transport.
export const NATIVE_POLICY_ENV = { CODEX_INTERNAL_APP_SERVER_REMOTE_CONTROL_DISABLED: '1' };

// config/read is handled inside native Codex. Never persist/project the response:
// integration transport settings may contain sensitive configuration values.
export function integrationPolicy(response: any): { stamp: string; overrides: { mcp_servers: Record<string, { enabled: false }> } } {
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
  return { stamp: createHash('sha256').update(canonical({ config, origins: response.origins })).digest('hex'), overrides: { mcp_servers: disabled } };
}
