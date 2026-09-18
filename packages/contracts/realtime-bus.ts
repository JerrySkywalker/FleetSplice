import type { FleetControlEvent, RealtimeStreamEvent } from './realtime-streams.ts';
import { projectExecutionToTimeline } from './realtime-timeline.ts';

/** Sanitized SSE/bus envelope. Never carries credentials, raw daemon payloads, or global diagnostics. */
export type RealtimeInvalidateEnvelope = {
  revision: string;
  eventId: string;
  stream: 'agent.execution' | 'fleet.control';
  kind: string;
  threadId: string | null;
  turnId: string | null;
  /** Optional provider-neutral semantic fields for live timeline presentation. */
  semantic?: {
    role?: 'user' | 'assistant' | 'tool' | 'system';
    text?: string;
    toolId?: string;
    status?: string;
    /** Exact execution-item identity when the runtime provided one. Never fabricated. */
    itemId?: string | null;
  };
};

export function sanitizeRealtimeEvent(event: RealtimeStreamEvent): RealtimeInvalidateEnvelope {
  const envelope: RealtimeInvalidateEnvelope = {
    revision: event.revision,
    eventId: event.eventId,
    stream: event.stream,
    kind: event.kind,
    threadId: event.threadId,
    turnId: event.turnId,
  };
  if (event.stream === 'agent.execution') {
    const projected = projectExecutionToTimeline(event);
    if (projected && (projected.text || projected.toolId || projected.status || projected.role || projected.itemId)) {
      envelope.semantic = {
        ...(projected.role ? { role: projected.role } : {}),
        ...(projected.text !== undefined ? { text: projected.text } : {}),
        ...(projected.toolId ? { toolId: projected.toolId } : {}),
        ...(projected.status ? { status: projected.status } : {}),
        ...(projected.itemId !== undefined ? { itemId: projected.itemId } : {}),
      };
    }
  }
  return envelope;
}

export type RealtimeBusListener = (envelope: RealtimeInvalidateEnvelope) => void;

/** Provider-neutral in-process bus for Agent Execution and Fleet Control notifications. */
export class RealtimeEventBus {
  private revision = 0n;
  private listeners = new Set<RealtimeBusListener>();
  private recent: RealtimeInvalidateEnvelope[] = [];
  private seen = new Set<string>();

  currentRevision(): string { return this.revision.toString(); }

  subscribe(listener: RealtimeBusListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  publish(event: RealtimeStreamEvent): RealtimeInvalidateEnvelope {
    if (this.seen.has(event.eventId)) {
      const existing = this.recent.find(item => item.eventId === event.eventId);
      return existing ?? sanitizeRealtimeEvent({ ...event, revision: this.currentRevision() });
    }
    this.revision += 1n;
    const envelope = sanitizeRealtimeEvent({ ...event, revision: this.revision.toString() });
    this.seen.add(envelope.eventId);
    this.recent.push(envelope);
    if (this.recent.length > 256) {
      const removed = this.recent.splice(0, this.recent.length - 256);
      for (const item of removed) this.seen.delete(item.eventId);
    }
    for (const listener of this.listeners) listener(envelope);
    return envelope;
  }

  publishFleet(partial: Omit<FleetControlEvent, 'stream' | 'revision'> & { revision?: string }): RealtimeInvalidateEnvelope {
    return this.publish({ ...partial, stream: 'fleet.control', revision: partial.revision ?? '0' });
  }

  since(revision: string): { revision: string; events: RealtimeInvalidateEnvelope[] } {
    const cursor = BigInt(revision || '0');
    const events = this.recent.filter(item => {
      try { return BigInt(item.revision) > cursor; } catch { return false; }
    });
    return { revision: this.currentRevision(), events };
  }

  listenerCount(): number { return this.listeners.size; }
}
