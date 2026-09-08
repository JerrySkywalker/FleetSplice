import { createHash } from 'node:crypto';
import { canonical, requireThat } from '../contracts/json.ts';

export const DISABLED_FEATURES = ['hooks', 'plugins', 'shell_tool', 'unified_exec', 'apply_patch_freeform', 'multi_agent', 'code_mode', 'apps'] as const;
export const NATIVE_POLICY_ARGS = ['-c', 'sandbox_mode="read-only"', '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', ...DISABLED_FEATURES.flatMap(name => ['-c', `features.${name}=false`])];

// config/read is handled inside native Codex. Never persist/project the response:
// integration transport settings may contain sensitive configuration values.
export function integrationPolicy(response: any): { stamp: string; overrides: { mcp_servers: Record<string, { enabled: false }> } } {
  const config = response?.config;
  requireThat(config && typeof config === 'object' && !Array.isArray(config) && response.origins && typeof response.origins === 'object', 'NATIVE_CONFIG_UNQUALIFIED');
  requireThat(DISABLED_FEATURES.every(name => config.features?.[name] === false), 'NATIVE_INTEGRATIONS_NOT_DISABLED');
  const servers = config.mcp_servers;
  requireThat(servers && typeof servers === 'object' && !Array.isArray(servers) && Object.keys(servers).length <= 128, 'NATIVE_MCP_CONFIG_UNQUALIFIED');
  const disabled = Object.create(null) as Record<string, { enabled: false }>;
  for (const [name, value] of Object.entries(servers)) {
    requireThat(name.length > 0 && name.length <= 200 && value && typeof value === 'object' && !Array.isArray(value), 'NATIVE_MCP_CONFIG_UNQUALIFIED');
    disabled[name] = { enabled: false };
  }
  return { stamp: createHash('sha256').update(canonical({ config, origins: response.origins })).digest('hex'), overrides: { mcp_servers: disabled } };
}
