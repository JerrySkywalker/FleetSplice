import type { AgentExecutionEvent, RealtimeStreamEvent } from './realtime-streams.ts';

/** Live timeline presentation item. Ephemeral; not Fleet authority. */
export type TimelinePresentationItem = {
  eventId: string;
  revision: string;
  kind: AgentExecutionEvent['kind'];
  threadId: string | null;
  turnId: string | null;
  role?: 'user' | 'assistant' | 'tool' | 'system';
  text?: string;
  toolId?: string;
  status?: string;
  ephemeral: true;
};

export function projectExecutionToTimeline(event: AgentExecutionEvent): TimelinePresentationItem | null {
  if (event.kind === 'unsupported') return null;
  const item: TimelinePresentationItem = {
    eventId: event.eventId,
    revision: event.revision,
    kind: event.kind,
    threadId: event.threadId,
    turnId: event.turnId,
    ephemeral: true,
  };
  if (event.kind === 'message.delta' || event.kind === 'message.final') {
    item.role = event.payload.role === 'user' ? 'user' : 'assistant';
    item.text = typeof event.payload.text === 'string' ? event.payload.text.slice(0, 24000) : '';
  } else if (event.kind.startsWith('tool.')) {
    item.role = 'tool';
    item.toolId = typeof event.payload.toolId === 'string' ? event.payload.toolId : undefined;
    item.text = typeof event.payload.text === 'string' ? event.payload.text.slice(0, 1000) : undefined;
    item.status = typeof event.payload.status === 'string' ? event.payload.status : event.kind;
  } else if (event.kind.startsWith('turn.')) {
    item.role = 'system';
    item.status = typeof event.payload.status === 'string' ? event.payload.status : event.kind;
  } else if (event.kind === 'approval.requested') {
    item.role = 'system';
    item.text = typeof event.payload.summary === 'string' ? event.payload.summary.slice(0, 1000) : 'approval requested';
  } else {
    item.role = 'system';
  }
  return item;
}

export function foldTimeline(items: TimelinePresentationItem[], next: TimelinePresentationItem, limit = 48): TimelinePresentationItem[] {
  const without = items.filter(item => item.eventId !== next.eventId);
  if (next.kind === 'message.delta' && next.turnId) {
    const priorDelta = without.findIndex(item => item.kind === 'message.delta' && item.turnId === next.turnId && item.role === next.role);
    if (priorDelta >= 0) {
      const prior = without[priorDelta]!;
      without[priorDelta] = { ...prior, ...next, text: `${prior.text ?? ''}${next.text ?? ''}`.slice(0, 24000) };
      return without.slice(-limit);
    }
  }
  if (next.kind === 'message.final' && next.turnId) {
    return [...without.filter(item => !(item.kind === 'message.delta' && item.turnId === next.turnId && item.role === next.role)), next].slice(-limit);
  }
  if (next.toolId && next.kind.startsWith('tool.')) {
    const index = without.findIndex(item => item.toolId === next.toolId);
    if (index >= 0) {
      without[index] = { ...without[index]!, ...next };
      return without.slice(-limit);
    }
  }
  return [...without, next].slice(-limit);
}

export function timelineFromEvents(events: RealtimeStreamEvent[], limit = 48): TimelinePresentationItem[] {
  let items: TimelinePresentationItem[] = [];
  for (const event of events) {
    if (event.stream !== 'agent.execution') continue;
    const projected = projectExecutionToTimeline(event);
    if (projected) items = foldTimeline(items, projected, limit);
  }
  return items;
}
