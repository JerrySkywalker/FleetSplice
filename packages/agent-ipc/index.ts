import { Fault, requireThat } from '../contracts/index.ts';

export const AGENT_IPC_VERSION = 1;
export const AGENT_IPC_MAX_BYTES = 8192;
export type AgentIpcCommand = 'status' | 'config.get' | 'config.set' | 'runtime.list' | 'runtime.setSharing' | 'diagnostics' | 'drain';
export type AgentIpcRequest = { v: typeof AGENT_IPC_VERSION; token: string; command: AgentIpcCommand; body?: Record<string, unknown> };
export type AgentConfiguration = { gatewayUrl: string | null };
export type AgentRuntimeProjection = { adapterId: string; kind: string; enabled: boolean; shared: boolean; status: 'unavailable' | 'healthy' | 'degraded'; discoveredSessions: number; evidence: string };

export function parseAgentIpcRequest(value: unknown): AgentIpcRequest {
  requireThat(!!value && typeof value === 'object' && !Array.isArray(value), 'AGENT_IPC_REQUEST_INVALID');
  const item = value as Record<string, unknown>; const allowed = ['v', 'token', 'command', 'body']; requireThat(Object.keys(item).every(key => allowed.includes(key)), 'AGENT_IPC_REQUEST_INVALID');
  requireThat(item.v === AGENT_IPC_VERSION && typeof item.token === 'string' && /^[0-9a-f]{64}$/.test(item.token) && typeof item.command === 'string' && ['status', 'config.get', 'config.set', 'runtime.list', 'runtime.setSharing', 'diagnostics', 'drain'].includes(item.command), 'AGENT_IPC_REQUEST_INVALID');
  requireThat(item.body === undefined || (!!item.body && typeof item.body === 'object' && !Array.isArray(item.body)), 'AGENT_IPC_REQUEST_INVALID');
  return item as AgentIpcRequest;
}

export function validateAgentConfiguration(value: unknown): AgentConfiguration {
  requireThat(!!value && typeof value === 'object' && !Array.isArray(value), 'AGENT_CONFIGURATION_INVALID'); const item = value as Record<string, unknown>;
  requireThat(Object.keys(item).length === 1 && Object.hasOwn(item, 'gatewayUrl') && (item.gatewayUrl === null || typeof item.gatewayUrl === 'string'), 'AGENT_CONFIGURATION_INVALID');
  if (typeof item.gatewayUrl === 'string') {
    try { const url = new URL(item.gatewayUrl); requireThat(['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash, 'AGENT_GATEWAY_URL_INVALID'); }
    catch (error) { if (error instanceof Fault) throw error; throw new Fault('AGENT_GATEWAY_URL_INVALID'); }
  }
  return { gatewayUrl: item.gatewayUrl as string | null };
}
