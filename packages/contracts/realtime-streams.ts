// Provider-neutral realtime stream contracts.
// Core never imports Codex. Adapters import these types and map native observations.
// AgentRuntime remains distinct from InferenceProvider.

/** Observation trust ladder. Terminal scraping is never control authority in this train. */
export type ObservationTrustLevel =
  | 'NATIVE_STRUCTURED_API'
  | 'OFFICIAL_HOOK_PLUGIN'
  | 'DURABLE_STRUCTURED_ARTIFACT'
  | 'TERMINAL_SCRAPING';

/** Features an AgentRuntimeAdapter may report as observable or controllable. */
export type AgentRuntimeFeature =
  | 'sessionObserve'
  | 'turnLifecycle'
  | 'messageDelta'
  | 'messageFinal'
  | 'toolActivity'
  | 'modelObserve'
  | 'permissionObserve'
  | 'approvalRequestObserve'
  | 'approvalResolve'
  | 'steer'
  | 'interrupt'
  | 'subagentObserve';

export type AgentRuntimeCapabilityEvidence = {
  feature: AgentRuntimeFeature;
  available: boolean;
  /** Free-form adapter evidence; must not be required to contain provider RPC names. */
  evidence: string;
  trustLevel: ObservationTrustLevel;
  /** Optional adapter-private extension bag. Core must ignore unknown keys. */
  extensions?: Record<string, unknown>;
};

/** Runtime control/observation surface. Not an inference/model-hosting placement. */
export type AgentRuntimeDescriptor = {
  runtimeKind: 'AgentRuntime';
  adapterId: string;
  capabilities: AgentRuntimeCapabilityEvidence[];
};

/** Future placement for model hosting. Kept distinct from AgentRuntime. */
export type InferenceProviderDescriptor = {
  providerKind: 'InferenceProvider';
  providerId: string;
};

export type StreamEnvelope = {
  eventId: string;
  revision: string;
  observedAt: string;
  sessionKey: string;
  threadId: string | null;
  turnId: string | null;
};

export type AgentExecutionKind =
  | 'session.observed'
  | 'turn.started'
  | 'turn.completed'
  | 'turn.interrupted'
  | 'turn.failed'
  | 'message.delta'
  | 'message.final'
  | 'tool.started'
  | 'tool.updated'
  | 'tool.completed'
  | 'tool.failed'
  | 'model.observed'
  | 'permission.observed'
  | 'approval.requested'
  | 'subagent.observed'
  | 'unsupported';

export type AgentExecutionEvent = StreamEnvelope & {
  stream: 'agent.execution';
  kind: AgentExecutionKind;
  /** Semantic payload only. No provider RPC method names or terminal presentation bytes. */
  payload: Record<string, unknown>;
  trustLevel: ObservationTrustLevel;
  /** Adapter-private evidence; Core treats as opaque. */
  adapterEvidence?: Record<string, unknown>;
};

export type FleetControlKind =
  | 'attach'
  | 'release'
  | 'controller.changed'
  | 'fence.advanced'
  | 'review-state'
  | 'steer.admitted'
  | 'interrupt.admitted'
  | 'approval.decision'
  | 'receipt'
  | 'ambiguity'
  | 'residual'
  | 'identity.changed'
  | 'incarnation.changed'
  | 'reconnect'
  | 'recovery.required'
  /** Native state advanced outside the current Web controller; does not clear the review gate. */
  | 'external-state-advanced';

export type FleetControlEvent = StreamEnvelope & {
  stream: 'fleet.control';
  kind: FleetControlKind;
  /** FleetSplice authority facts only. */
  payload: Record<string, unknown>;
};

export type RealtimeStreamEvent = AgentExecutionEvent | FleetControlEvent;

export function isAgentExecutionEvent(event: RealtimeStreamEvent): event is AgentExecutionEvent {
  return event.stream === 'agent.execution';
}

export function isFleetControlEvent(event: RealtimeStreamEvent): event is FleetControlEvent {
  return event.stream === 'fleet.control';
}

/** Terminal scraping may inform research, never effect admission. */
export function observationMayAuthorizeEffect(trustLevel: ObservationTrustLevel): boolean {
  return trustLevel !== 'TERMINAL_SCRAPING';
}
