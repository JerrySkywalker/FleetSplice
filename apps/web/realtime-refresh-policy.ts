/** Classify Native SSE envelopes into live presentation vs authoritative reconcile. */

export type RealtimeEnvelopeClass = {
  stream: string;
  kind: string;
};

export type RefreshDecision =
  | { mode: 'live_only' }
  | { mode: 'schedule_reconcile'; reason: 'turn.final' | 'fleet.control' }
  | { mode: 'ignore' };

const AGENT_EXECUTION_LIVE_ONLY = new Set([
  'message.delta',
  'message.final',
  'tool.started',
  'tool.updated',
  'tool.completed',
  'tool.failed',
  'turn.started',
]);

const AGENT_EXECUTION_TURN_FINAL = new Set([
  'turn.completed',
  'turn.interrupted',
  'turn.failed',
]);

/** Agent Execution kinds that can change approvals / observed control surface projection. */
const AGENT_EXECUTION_AUTHORITY_ADJACENT = new Set([
  'approval.requested',
  'permission.observed',
  'model.observed',
  'session.observed',
]);

const FLEET_CONTROL_RECONCILE = new Set([
  'external-state-advanced',
  'attach',
  'release',
  'controller.changed',
  'fence.advanced',
  'review-state',
  'steer.admitted',
  'interrupt.admitted',
  'approval.decision',
  'receipt',
  'ambiguity',
  'residual',
  'identity.changed',
  'incarnation.changed',
  'reconnect',
  'recovery.required',
]);

/** Decide whether an SSE envelope should update live timeline only or schedule reconcile. */
export function classifyRealtimeRefresh(envelope: RealtimeEnvelopeClass): RefreshDecision {
  if (envelope.stream === 'agent.execution') {
    if (AGENT_EXECUTION_TURN_FINAL.has(envelope.kind)) {
      return { mode: 'schedule_reconcile', reason: 'turn.final' };
    }
    if (AGENT_EXECUTION_LIVE_ONLY.has(envelope.kind)) {
      return { mode: 'live_only' };
    }
    if (AGENT_EXECUTION_AUTHORITY_ADJACENT.has(envelope.kind)) {
      return { mode: 'schedule_reconcile', reason: 'fleet.control' };
    }
    return { mode: 'ignore' };
  }
  if (envelope.stream === 'fleet.control') {
    if (FLEET_CONTROL_RECONCILE.has(envelope.kind)) {
      return { mode: 'schedule_reconcile', reason: 'fleet.control' };
    }
    return { mode: 'ignore' };
  }
  return { mode: 'ignore' };
}

/** Whether live timeline folding should apply for this Agent Execution kind. */
export function shouldUpdateLiveTimeline(envelope: RealtimeEnvelopeClass): boolean {
  return envelope.stream === 'agent.execution'
    && envelope.kind !== 'unsupported'
    && classifyRealtimeRefresh(envelope).mode !== 'ignore';
}
