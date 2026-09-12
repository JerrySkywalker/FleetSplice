export type BrowserClient = { actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number; csrf: string };
/** A rotation barrier drains in-flight requests before changing credentials.
 * A failed/ambiguous renewal permanently closes this instance; no auto-login/replay. */
export class BrowserClientSession {
  private queue: Promise<unknown> = Promise.resolve();
  private active = new Set<Promise<any>>();
  private failed = false;
  client: BrowserClient | null = null;
  native = false;
  constructor(private readonly changed: (client: BrowserClient) => void,
    private readonly now: () => number = Date.now, private readonly transport: typeof fetch = fetch) {}
  private async raw(url: string, body?: unknown): Promise<any> {
    const transport = this.transport;
    const response = await transport(url, { method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Fleet-Client': this.client?.clientInstanceId ?? '', 'X-Fleet-Csrf': this.client?.csrf ?? '' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error ?? 'REQUEST_FAILED'), { status: response.status, result });
    return result;
  }
  setClient(client: BrowserClient) { this.client = client; this.changed(client); }
  private async renewIfDue() {
    if (!this.client || this.now() < this.client.expiresAt - 5 * 60_000) return;
    try {
      if (this.now() >= this.client.expiresAt) throw new Error('CLIENT_AUTH_REQUIRED');
      const previous = this.client;
      const snapshot = this.native ? await this.raw('/api/native/snapshot') : null;
      const continuity = snapshot?.controller === previous.clientInstanceId ? {
        runtimeId: snapshot.runtimeId, incarnation: snapshot.incarnation, controller: snapshot.controller, fence: snapshot.fence } : null;
      const next: BrowserClient = await this.raw('/api/client/renew', { grantId: previous.grantId, grantRevision: previous.grantRevision, continuity });
      if (next.clientInstanceId !== previous.clientInstanceId || next.actorId !== previous.actorId || next.grantId !== previous.grantId ||
        BigInt(next.grantRevision) !== BigInt(previous.grantRevision) + 1n || next.csrf === previous.csrf || next.expiresAt <= previous.expiresAt)
        throw new Error('CLIENT_RENEWAL_UNPROVABLE');
      this.setClient(next);
    } catch (error) { this.failed = true; throw error; }
  }
  request(url?: string, body?: unknown): Promise<any> {
    const start = this.queue.then(async () => {
      if (this.failed) throw new Error('CLIENT_RENEWAL_FAILED_CLOSED');
      if (this.client && this.now() >= this.client.expiresAt - 5 * 60_000) await Promise.allSettled([...this.active]);
      await this.renewIfDue();
      const pending = url ? this.raw(url, body) : Promise.resolve(undefined);
      this.active.add(pending);
      void pending.then(() => this.active.delete(pending), () => this.active.delete(pending));
      return { pending };
    });
    // Requests can observe a running command; only admission/rotation is serial.
    this.queue = start.then(() => {}, () => {});
    return start.then(({ pending }) => pending);
  }
}
