import { Fault, requireThat } from '../contracts/json.ts';

export const RECONNECT_GRACE_MS = 60_000;

export type ControllerLane = {
  laneId: string;
  controllerClientId: string | null;
  fence: number;
  edgeFenceAck: number;
};

export type ReconnectClient = {
  clientInstanceId: string;
  sessionBinding: string;
  authenticatedAt: number;
  lastSeenAt: number;
  role: 'controller' | 'viewer';
};

/**
 * G06 basic authenticated reconnect / resume / no-replay helpers.
 * Rich takeover remains G07. Full durable Hub/Edge recovery remains G08.
 */
export class ReconnectNoReplayCoordinator {
  private readonly clients = new Map<string, ReconnectClient>();
  private readonly commandReceipts = new Map<string, unknown>();
  private readonly realtimeCursor = { revision: '0' };
  // edgeFenceAck starts behind fence so first lane acquire requires an explicit Edge ack.
  private lane: ControllerLane = { laneId: 'default', controllerClientId: null, fence: 0, edgeFenceAck: -1 };
  private edgeConnected = true;
  private coldStartBlocked = false;

  constructor(private readonly now: () => number = Date.now) {}

  markColdStart() { this.coldStartBlocked = true; this.edgeConnected = false; }
  clearColdStartAfterReAdmission() { this.coldStartBlocked = false; }

  setEdgeConnected(connected: boolean) {
    this.edgeConnected = connected;
    if (!connected) this.lane.controllerClientId = null;
  }

  registerClient(client: Omit<ReconnectClient, 'role' | 'lastSeenAt'> & { role?: 'controller' | 'viewer' }) {
    requireThat(!this.coldStartBlocked, 'RECOVERY_REQUIRED');
    const existing = this.clients.get(client.clientInstanceId);
    const withinGrace = existing && (this.now() - existing.lastSeenAt) <= RECONNECT_GRACE_MS
      && existing.sessionBinding === client.sessionBinding;
    const role = withinGrace ? existing.role : (client.role ?? 'viewer');
    const next: ReconnectClient = {
      clientInstanceId: client.clientInstanceId,
      sessionBinding: client.sessionBinding,
      authenticatedAt: client.authenticatedAt,
      lastSeenAt: this.now(),
      role,
    };
    this.clients.set(client.clientInstanceId, next);
    return next;
  }

  touch(clientInstanceId: string) {
    const client = this.clients.get(clientInstanceId);
    requireThat(client, 'CLIENT_UNKNOWN');
    client.lastSeenAt = this.now();
    return client;
  }

  acquireUnownedLane(clientInstanceId: string) {
    requireThat(this.edgeConnected, 'EDGE_DISCONNECTED');
    requireThat(!this.coldStartBlocked, 'RECOVERY_REQUIRED');
    const client = this.touch(clientInstanceId);
    requireThat(client.role === 'viewer' || this.lane.controllerClientId === clientInstanceId, 'CLIENT_ROLE_INVALID');
    requireThat(this.lane.controllerClientId === null, 'CONTROLLER_OWNED_TAKEOVER_IS_G07');
    requireThat(this.lane.edgeFenceAck === this.lane.fence, 'EDGE_FENCE_ACK_REQUIRED');
    this.lane.controllerClientId = clientInstanceId;
    this.lane.fence += 1;
    client.role = 'controller';
    return { ...this.lane };
  }

  acknowledgeEdgeFence(fence: number) {
    requireThat(fence === this.lane.fence, 'STALE_EDGE_FENCE');
    this.lane.edgeFenceAck = fence;
  }

  rememberReceipt(commandId: string, receipt: unknown) {
    const prior = this.commandReceipts.get(commandId);
    if (prior) {
      requireThat(JSON.stringify(prior) === JSON.stringify(receipt), 'NATIVE_COMMAND_ID_CONFLICT');
      return prior;
    }
    this.commandReceipts.set(commandId, receipt);
    return receipt;
  }

  lookupReceipt(commandId: string) {
    return this.commandReceipts.get(commandId) ?? null;
  }

  /** Never resend prompt as fallback after response loss — lookup only. */
  recoverLostResponse(commandId: string) {
    const receipt = this.lookupReceipt(commandId);
    requireThat(receipt, 'COMMAND_UNKNOWN_NO_REPLAY');
    return receipt;
  }

  advanceRealtime(revision: string) {
    requireThat(/^\d+$/.test(revision), 'REALTIME_REVISION_INVALID');
    if (BigInt(revision) > BigInt(this.realtimeCursor.revision) + 1n) {
      throw new Fault('RESYNC_REQUIRED');
    }
    if (BigInt(revision) >= BigInt(this.realtimeCursor.revision)) {
      this.realtimeCursor.revision = revision;
    }
    return this.realtimeCursor.revision;
  }

  projectionHonesty() {
    if (this.coldStartBlocked) return { state: 'RECOVERY_REQUIRED', guessStopped: false };
    if (!this.edgeConnected) return { state: 'EDGE_STALE_OR_UNKNOWN', guessStopped: false };
    return { state: 'READY', guessStopped: false };
  }
}
