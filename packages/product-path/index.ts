import { Fault, canonical, requireThat, type Hcp, type Target } from '../contracts/index.ts';
import { EdgeNativeAdoptionEndpoint, RemoteAdoptionPortProxy, type AdoptionHcpSender, type LocalAdoptionSurface } from '../remote-adoption/index.ts';
import type { AdoptionPort } from '../native-adoption/types.ts';

/**
 * The only product carriage selection point.  Local adoption is an Edge-local
 * adapter passed directly to the Gateway; remote adoption is the same adapter
 * projected over typed HCP.  It deliberately has no managed-Codex option.
 */
export type GatewayAdoptionCarriage =
  | { kind: 'LOCAL_ADOPTION'; port: AdoptionPort }
  | { kind: 'REMOTE_ADOPTION'; target: Target; send: AdoptionHcpSender };

export type AgentAdoptionCarriage = {
  kind: 'NATIVE_ADOPTION';
  target: Target;
  port: LocalAdoptionSurface;
  send: AdoptionHcpSender;
};

export function gatewayAdoptionPort(carriage: GatewayAdoptionCarriage): AdoptionPort {
  if (carriage.kind === 'LOCAL_ADOPTION') return carriage.port;
  return new RemoteAdoptionPortProxy(carriage.target, carriage.send);
}

export function agentAdoptionEndpoint(carriage: AgentAdoptionCarriage): EdgeNativeAdoptionEndpoint {
  requireThat(carriage.kind === 'NATIVE_ADOPTION', 'AGENT_ADOPTION_CARRIAGE_INVALID');
  return new EdgeNativeAdoptionEndpoint(carriage.port, carriage.target, carriage.send);
}

/** Reject raw/native or former managed product modes at the product seam. */
export function assertNativeAdoptionProductPath(value: unknown): asserts value is { target: Target; kind: 'NATIVE_ADOPTION' } {
  requireThat(!!value && typeof value === 'object', 'PRODUCT_PATH_INVALID');
  const item = value as { target?: Target; kind?: string; rawNativeTransport?: unknown };
  requireThat(item.kind === 'NATIVE_ADOPTION', 'MANAGED_PRIMARY_FORBIDDEN');
  requireThat(item.rawNativeTransport !== true, 'RAW_NATIVE_REMOTE_FORBIDDEN');
  requireThat(!!item.target && typeof item.target.connectionId === 'string', 'PRODUCT_PATH_TARGET_INVALID');
}

/** A narrow HCP receiver shared by production Agent startup and tests. */
export async function acceptAgentAdoptionHcp(endpoint: EdgeNativeAdoptionEndpoint, target: Target, message: Hcp): Promise<void> {
  requireThat(message.connectionId === target.connectionId && canonical(message.target) === canonical(target), 'STALE_CONNECTION');
  if (message.kind !== 'adoption.request') throw new Fault('HCP_UNEXPECTED_MESSAGE');
  await endpoint.accept(message);
}
