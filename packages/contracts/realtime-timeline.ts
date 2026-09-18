import type { AgentExecutionEvent, RealtimeStreamEvent } from './realtime-streams.ts';

/**
 * Exact provider-neutral execution-item identity when the runtime supplies it.
 * Never fabricate an itemId. Providers without identity use degraded turn/role
 * folding only when both sides lack itemId.
 */
export type TimelinePresentationItem = {
  eventId: string;
  revision: string;
  kind: AgentExecutionEvent['kind'];
  threadId: string | null;
  turnId: string | null;
  /** Exact native/runtime message or tool item identity when available. */
  itemId?: string | null;
  role?: 'user' | 'assistant' | 'tool' | 'system';
  text?: string;
  toolId?: string;
  status?: string;
  ephemeral: true;
};

export type AuthoritativeHistoryMessage = {
  role: 'user' | 'assistant';
  text: string;
  turnId: string;
  /** Exact native item identity when retained by the projection. */
  itemId?: string | null;
};

function exactItemId(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= 200 ? value : null;
}

function sameMessageIdentity(a: Pick<TimelinePresentationItem, 'threadId' | 'turnId' | 'itemId' | 'role'>, b: Pick<TimelinePresentationItem, 'threadId' | 'turnId' | 'itemId' | 'role'>): boolean {
  if (a.turnId && b.turnId && a.turnId !== b.turnId) return false;
  if (a.threadId && b.threadId && a.threadId !== b.threadId) return false;
  const left = exactItemId(a.itemId);
  const right = exactItemId(b.itemId);
  if (left && right) return left === right;
  // Degraded fallback: only when neither side has exact identity.
  if (!left && !right) return a.role === b.role && !!a.turnId && a.turnId === b.turnId;
  return false;
}

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
    item.itemId = exactItemId(event.payload.itemId);
  } else if (event.kind.startsWith('tool.')) {
    item.role = 'tool';
    item.toolId = typeof event.payload.toolId === 'string' ? event.payload.toolId : undefined;
    item.itemId = exactItemId(event.payload.toolId) ?? exactItemId(event.payload.itemId);
    item.text = typeof event.payload.text === 'string' ? event.payload.text.slice(0, 1000) : undefined;
    item.status = typeof event.payload.status === 'string' ? event.payload.status : event.kind;
  } else if (event.kind.startsWith('turn.')) {
    item.role = 'system';
    item.status = typeof event.payload.status === 'string' ? event.payload.status : event.kind;
  } else if (event.kind === 'approval.requested') {
    item.role = 'system';
    item.itemId = exactItemId(event.payload.itemId);
    item.text = typeof event.payload.summary === 'string' ? event.payload.summary.slice(0, 1000) : 'approval requested';
  } else {
    item.role = 'system';
  }
  return item;
}

export function foldTimeline(items: TimelinePresentationItem[], next: TimelinePresentationItem, limit = 48): TimelinePresentationItem[] {
  const without = items.filter(item => item.eventId !== next.eventId);
  if (next.kind === 'message.delta' && next.turnId) {
    const priorDelta = without.findIndex(item => item.kind === 'message.delta' && sameMessageIdentity(item, next));
    if (priorDelta >= 0) {
      const prior = without[priorDelta]!;
      without[priorDelta] = {
        ...prior, ...next,
        itemId: exactItemId(next.itemId) ?? exactItemId(prior.itemId),
        text: `${prior.text ?? ''}${next.text ?? ''}`.slice(0, 24000),
      };
      return without.slice(-limit);
    }
  }
  if (next.kind === 'message.final' && next.turnId) {
    return [...without.filter(item => !(item.kind === 'message.delta' && sameMessageIdentity(item, next))), next].slice(-limit);
  }
  if (next.toolId && next.kind.startsWith('tool.')) {
    const index = without.findIndex(item => item.toolId === next.toolId || (exactItemId(item.itemId) && exactItemId(item.itemId) === exactItemId(next.itemId)));
    if (index >= 0) {
      without[index] = { ...without[index]!, ...next };
      return without.slice(-limit);
    }
  }
  return [...without, next].slice(-limit);
}

/**
 * Retire ephemeral live items once authoritative history contains the same exact
 * native item identity. Never dedupe by text equality.
 */
export function retireLiveWhenAuthoritative(
  live: TimelinePresentationItem[],
  history: AuthoritativeHistoryMessage[],
  activity: { id: string; turnId: string }[] = [],
): TimelinePresentationItem[] {
  return live.filter(item => {
    if (item.kind === 'message.delta' || item.kind === 'message.final') {
      const id = exactItemId(item.itemId);
      if (!id || !item.turnId) return true;
      return !history.some(message => message.turnId === item.turnId && exactItemId(message.itemId) === id);
    }
    if (item.kind.startsWith('tool.')) {
      const id = exactItemId(item.itemId) ?? exactItemId(item.toolId);
      if (!id) return true;
      return !activity.some(entry => entry.id === id && (!item.turnId || entry.turnId === item.turnId));
    }
    return true;
  });
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
