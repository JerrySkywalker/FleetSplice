// Codex AgentRuntimeAdapter boundary.
// Core contracts stay provider-neutral. This package maps Codex app-server
// structured observations into AgentExecutionEvent values. Transport, discovery
// and effect-admission remain in NativeAdoptionAdapter; this module clarifies
// the adapter identity and capability projection only.

import type { AgentRuntimeCapabilityEvidence, AgentRuntimeDescriptor } from '../contracts/realtime-streams.ts';
import { CODEX_AGENT_RUNTIME_ADAPTER_ID } from './codex-execution-mapper.ts';
import type { Compatibility } from './types.ts';

export { CODEX_AGENT_RUNTIME_ADAPTER_ID, mapCodexNotification } from './codex-execution-mapper.ts';
export type { CodexMapContext } from './codex-execution-mapper.ts';

export function codexRuntimeDescriptor(compatibility: Compatibility): AgentRuntimeDescriptor {
  const cap = compatibility.capabilities;
  const evidence = (feature: AgentRuntimeCapabilityEvidence['feature'], available: boolean, text: string): AgentRuntimeCapabilityEvidence => ({
    feature, available, evidence: text, trustLevel: 'NATIVE_STRUCTURED_API',
  });
  return {
    runtimeKind: 'AgentRuntime',
    adapterId: CODEX_AGENT_RUNTIME_ADAPTER_ID,
    capabilities: [
      evidence('sessionObserve', cap.threadList.available || cap.threadRead.available, cap.threadList.evidence),
      evidence('turnLifecycle', cap.turnStart.available || cap.activeTurn.available, cap.turnStart.evidence),
      evidence('messageDelta', cap.events.available, 'Structured item/agentMessage deltas when native events are observed'),
      evidence('messageFinal', cap.threadRead.available || cap.activeTurn.available, cap.threadRead.evidence),
      evidence('toolActivity', cap.events.available || cap.activeTurn.available, 'Structured commandExecution item lifecycle'),
      evidence('modelObserve', cap.models.available || cap.effectiveState.available, cap.models.evidence),
      evidence('permissionObserve', cap.effectiveState.available, cap.effectiveState.evidence),
      evidence('approvalRequestObserve', cap.approvalObserve.available, cap.approvalObserve.evidence),
      evidence('approvalResolve', cap.approvalResolve.available, cap.approvalResolve.evidence),
      evidence('steer', cap.steer.available, cap.steer.evidence),
      evidence('interrupt', cap.interrupt.available, cap.interrupt.evidence),
      evidence('subagentObserve', false, 'Subagent observation not implemented in this train'),
    ],
  };
}
