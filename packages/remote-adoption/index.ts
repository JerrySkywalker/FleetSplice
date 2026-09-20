import { randomUUID } from 'node:crypto';
import { Fault, canonical, requireThat, type Hcp, type Target } from '../contracts/index.ts';
import type { AdoptionClient, AdoptionContinuity, AdoptionPort, AdoptionReceipt, AdoptionSnapshot } from '../native-adoption/types.ts';
import type { RealtimeInvalidateEnvelope } from '../contracts/realtime-bus.ts';

export type AdoptionHcpSender = (message: Hcp) => void;

type LocalAdoptionSurface = {
  snapshot: AdoptionPort['snapshot'];
  execute: AdoptionPort['execute'];
  renewClient: AdoptionPort['renewClient'];
  lookup: (commandId: string) => AdoptionReceipt | null | Promise<AdoptionReceipt | null>;
  subscribeRealtime?: AdoptionPort['subscribeRealtime'];
  pollRealtime?: (sinceRevision: string) => { revision: string; events: RealtimeInvalidateEnvelope[] } | Promise<{ revision: string; events: RealtimeInvalidateEnvelope[] }>;
};

/** Hub-side AdoptionPort that projects semantics over typed HCP adoption messages. */
export class RemoteAdoptionPortProxy implements AdoptionPort {
  private readonly pending = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Fault) => void;
    timer: NodeJS.Timeout;
  }>();
  private readonly realtimeListeners = new Set<(envelope: RealtimeInvalidateEnvelope) => void>();
  private generation = 0;
  private closed = false;

  constructor(
    private readonly target: Target,
    private send: AdoptionHcpSender,
    private readonly timeoutMs = 15_000,
  ) {}

  setSender(send: AdoptionHcpSender) { this.send = send; }

  /** Hub connection generation; stale responses for older generations are ignored. */
  bumpGeneration() { this.generation++; this.failPending('STALE_CONNECTION'); }

  close(code = 'EDGE_DISCONNECTED') {
    this.closed = true;
    this.failPending(code);
    this.realtimeListeners.clear();
  }

  private failPending(code: string) {
    for (const [id, item] of this.pending) {
      clearTimeout(item.timer);
      item.reject(new Fault(code));
      this.pending.delete(id);
    }
  }

  /** Ingest an HCP message from Edge. */
  accept(message: Hcp) {
    requireThat(!this.closed, 'EDGE_DISCONNECTED');
    requireThat(message.connectionId === this.target.connectionId, 'STALE_CONNECTION');
    if (message.kind === 'adoption.response') {
      const item = this.pending.get(message.requestId);
      if (!item) return; // late / duplicate response — observe only
      clearTimeout(item.timer);
      this.pending.delete(message.requestId);
      if (!message.ok) item.reject(new Fault(message.code ?? 'ADOPTION_REMOTE_FAILED'));
      else item.resolve(message.body);
      return;
    }
    if (message.kind === 'adoption.realtime') {
      const envelope = message.envelope as unknown as RealtimeInvalidateEnvelope;
      for (const listener of this.realtimeListeners) listener(envelope);
      return;
    }
  }

  private request(op: 'snapshot' | 'execute' | 'renewClient' | 'lookup' | 'pollRealtime', body: Record<string, unknown>): Promise<unknown> {
    requireThat(!this.closed, 'EDGE_DISCONNECTED');
    const requestId = randomUUID();
    const generation = this.generation;
    const message: Hcp = {
      v: 1,
      kind: 'adoption.request',
      connectionId: this.target.connectionId,
      target: this.target,
      requestId,
      op,
      body,
    };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Fault('ADOPTION_REMOTE_TIMEOUT'));
      }, this.timeoutMs);
      this.pending.set(requestId, {
        resolve: value => {
          if (generation !== this.generation) reject(new Fault('STALE_CONNECTION'));
          else resolve(value);
        },
        reject,
        timer,
      });
      try { this.send(message); }
      catch (error) {
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(error instanceof Fault ? error : new Fault('EDGE_DISCONNECTED'));
      }
    });
  }

  async snapshot(options?: { discover?: boolean }): Promise<AdoptionSnapshot> {
    const body = await this.request('snapshot', { options: options ?? {} });
    requireThat(body && typeof body === 'object', 'ADOPTION_SNAPSHOT_UNPROVABLE');
    return body as AdoptionSnapshot;
  }

  async execute(command: unknown, client: AdoptionClient): Promise<AdoptionReceipt> {
    const body = await this.request('execute', { command: command as Record<string, unknown>, client: client as unknown as Record<string, unknown> });
    requireThat(body && typeof body === 'object', 'ADOPTION_RECEIPT_UNPROVABLE');
    return body as AdoptionReceipt;
  }

  async renewClient(previous: AdoptionClient, next: AdoptionClient, continuity: AdoptionContinuity | null) {
    const body = await this.request('renewClient', {
      previous: previous as unknown as Record<string, unknown>,
      next: next as unknown as Record<string, unknown>,
      continuity: continuity as unknown as Record<string, unknown> | null,
    });
    requireThat(body && typeof body === 'object', 'ADOPTION_RENEWAL_UNPROVABLE');
    return body as { controller: string | null; fence: number };
  }

  async lookup(commandId: string): Promise<AdoptionReceipt | null> {
    const body = await this.request('lookup', { commandId });
    if (body === null) return null;
    requireThat(body && typeof body === 'object', 'ADOPTION_LOOKUP_UNPROVABLE');
    return body as AdoptionReceipt;
  }

  subscribeRealtime(listener: (envelope: RealtimeInvalidateEnvelope) => void): () => void {
    this.realtimeListeners.add(listener);
    return () => { this.realtimeListeners.delete(listener); };
  }

  async pollRealtime(sinceRevision: string) {
    const body = await this.request('pollRealtime', { sinceRevision });
    requireThat(body && typeof body === 'object', 'ADOPTION_REALTIME_UNPROVABLE');
    return body as { revision: string; events: RealtimeInvalidateEnvelope[] };
  }
}

/** Edge-side handler: Local AdoptionPort -> typed HCP adoption responses/pushes. */
export class EdgeNativeAdoptionEndpoint {
  private unsubscribe: (() => void) | null = null;
  private readonly seenRequests = new Map<string, Hcp>();
  private readonly maxSeen = 256;

  constructor(
    private readonly port: LocalAdoptionSurface,
    private readonly target: Target,
    private readonly send: AdoptionHcpSender,
  ) {}

  startRealtimePush() {
    this.unsubscribe?.();
    if (!this.port.subscribeRealtime) return;
    this.unsubscribe = this.port.subscribeRealtime(envelope => {
      try {
        this.send({
          v: 1,
          kind: 'adoption.realtime',
          connectionId: this.target.connectionId,
          target: this.target,
          envelope: envelope as unknown as Record<string, unknown>,
        });
      } catch { /* backpressure / disconnect — caller observes socket state */ }
    });
  }

  stop() { this.unsubscribe?.(); this.unsubscribe = null; this.seenRequests.clear(); }

  async accept(message: Hcp): Promise<void> {
    requireThat(message.kind === 'adoption.request', 'HCP_UNEXPECTED_MESSAGE');
    requireThat(message.connectionId === this.target.connectionId && canonical(message.target) === canonical(this.target), 'STALE_CONNECTION');
    const prior = this.seenRequests.get(message.requestId);
    if (prior) {
      this.send(prior);
      return;
    }
    let response: Hcp;
    try {
      const result = await this.dispatch(message.op, message.body);
      response = {
        v: 1,
        kind: 'adoption.response',
        connectionId: this.target.connectionId,
        target: this.target,
        requestId: message.requestId,
        ok: true,
        code: null,
        body: result as Record<string, unknown> | null,
      };
    } catch (error) {
      response = {
        v: 1,
        kind: 'adoption.response',
        connectionId: this.target.connectionId,
        target: this.target,
        requestId: message.requestId,
        ok: false,
        code: error instanceof Fault ? error.code : 'ADOPTION_EDGE_FAILED',
        body: null,
      };
    }
    if (this.seenRequests.size >= this.maxSeen) {
      const first = this.seenRequests.keys().next().value;
      if (first) this.seenRequests.delete(first);
    }
    this.seenRequests.set(message.requestId, response);
    this.send(response);
  }

  private async dispatch(op: string, body: Record<string, unknown>): Promise<unknown> {
    if (op === 'snapshot') return this.port.snapshot((body.options as { discover?: boolean } | undefined) ?? {});
    if (op === 'execute') return this.port.execute(body.command, body.client as AdoptionClient);
    if (op === 'renewClient') {
      return this.port.renewClient(
        body.previous as AdoptionClient,
        body.next as AdoptionClient,
        (body.continuity ?? null) as AdoptionContinuity | null,
      );
    }
    if (op === 'lookup') return await Promise.resolve(this.port.lookup(String(body.commandId)));
    if (op === 'pollRealtime') {
      requireThat(this.port.pollRealtime, 'ADOPTION_REALTIME_UNAVAILABLE');
      return await Promise.resolve(this.port.pollRealtime(String(body.sinceRevision ?? '0')));
    }
    throw new Fault('HCP_UNEXPECTED_MESSAGE');
  }
}
