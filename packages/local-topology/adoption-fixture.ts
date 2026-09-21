import { randomUUID } from 'node:crypto';
import { Fault, requireThat } from '../contracts/json.ts';
import type {
  AdoptionClient,
  AdoptionContinuity,
  AdoptionReceipt,
  AdoptionSnapshot,
  NativeArtifactIdentity,
} from '../native-adoption/types.ts';
import type { RealtimeInvalidateEnvelope } from '../contracts/realtime-bus.ts';

const daemon: NativeArtifactIdentity = {
  executablePath: null,
  reportedVersion: 'topology-fixture',
  sha256: null,
  processId: 0,
  processCreationTime: '1970-01-01T00:00:00.0000000Z',
  endpoint: 'disposable-topology',
  endpointIdentity: 'topology',
  serverIncarnation: '1',
};

function receipt(partial: {
  commandId: string;
  family: AdoptionReceipt['family'];
  turnId?: string | null;
  code?: string;
}): AdoptionReceipt {
  return {
    commandId: partial.commandId,
    family: partial.family,
    status: 'SUCCEEDED',
    code: partial.code ?? 'OK',
    daemon,
    threadId: 'thread-local-topology',
    turnId: partial.turnId ?? null,
    origin: 'NATIVE_ADOPTED',
    createdNativeThread: false,
    processTerminationClaim: false,
  };
}

/** Safe disposable AdoptionPort surface for local multi-process G06 topology. */
export class DisposableTopologyAdoption {
  private state: 'READY' | 'EDGE_STALE_OR_UNKNOWN' = 'READY';
  private fence = 0;
  private controller: string | null = null;
  private receipts = new Map<string, AdoptionReceipt>();
  private approvals = new Map<string, { digest: string; decision: 'pending' | 'ALLOW_ONCE' | 'DENY' }>();
  private revision = 0n;
  private listeners = new Set<(e: RealtimeInvalidateEnvelope) => void>();
  private activeTurn: string | null = null;
  readonly workspace = 'ws-local-topology';
  readonly threadId = 'thread-local-topology';
  readonly runtimeId = 'runtime-topology';
  readonly incarnation = 'inc-1';

  markStale() { this.state = 'EDGE_STALE_OR_UNKNOWN'; this.controller = null; this.fence++; }
  markReady() { this.state = 'READY'; }

  async snapshot(_options?: { discover?: boolean }): Promise<AdoptionSnapshot> {
    return {
      runtimeId: this.runtimeId,
      state: this.state,
      incarnation: this.incarnation,
      daemon,
      compatibility: {
        profile: 'ADOPT_FULL',
        observedAt: new Date().toISOString(),
        capabilities: {} as AdoptionSnapshot['compatibility']['capabilities'],
      },
      workspace: this.workspace,
      controller: this.controller,
      fence: this.fence,
      threads: [{
        id: this.threadId,
        workspace: this.workspace,
        workspaceIdentity: this.workspace,
        origin: 'NATIVE_ADOPTED',
        status: this.activeTurn ? 'active' : 'idle',
        activeTurnId: this.activeTurn,
        lastTurnStatus: null,
        model: 'topology-fixture',
        permission: null,
        attached: true,
        stateToken: `tok-${this.fence}`,
        externalAdvance: false,
        history: [],
        turns: [],
        activity: [],
        historyLimited: false,
        residualCommandState: 'NONE_OBSERVED',
      }],
      receipts: [...this.receipts.values()],
      controlMode: 'COOPERATIVE',
      observationFailure: null,
      approvals: [],
    };
  }

  async execute(command: any, client: AdoptionClient): Promise<AdoptionReceipt> {
    requireThat(this.state === 'READY', 'EDGE_STALE_OR_UNKNOWN');
    requireThat(client?.clientInstanceId, 'CLIENT_REQUIRED');
    const family = String(command?.family ?? command?.kind ?? '');
    const commandId = String(command?.commandId ?? randomUUID());
    if (this.receipts.has(commandId)) return this.receipts.get(commandId)!;

    if (family === 'native.claim' || family === 'claim') {
      requireThat(this.controller === null || this.controller === client.clientInstanceId, 'CONTROLLER_OWNED_TAKEOVER_IS_G07');
      this.controller = client.clientInstanceId;
      this.fence++;
      const r = receipt({ commandId, family: 'native.attach', code: 'CONTROLLER_CLAIMED' });
      this.receipts.set(commandId, r);
      return r;
    }

    if (family === 'native.submit') {
      requireThat(this.controller === client.clientInstanceId, 'CONTROLLER_REQUIRED');
      this.activeTurn = randomUUID();
      this.pushRealtime('turn');
      const r = receipt({ commandId, family: 'native.submit', turnId: this.activeTurn });
      this.receipts.set(commandId, r);
      return r;
    }

    if (family === 'native.interrupt') {
      requireThat(this.controller === client.clientInstanceId, 'CONTROLLER_REQUIRED');
      requireThat(this.activeTurn, 'NO_ACTIVE_TURN');
      const turnId = this.activeTurn;
      this.activeTurn = null;
      this.pushRealtime('interrupt');
      const r = receipt({ commandId, family: 'native.interrupt', turnId });
      this.receipts.set(commandId, r);
      return r;
    }

    if (family === 'native.approval') {
      requireThat(this.controller === client.clientInstanceId, 'CONTROLLER_REQUIRED');
      const digest = String(command?.approval?.digest ?? command?.digest ?? '');
      const decision = String(command?.approval?.decision ?? command?.decision ?? '');
      requireThat(digest, 'APPROVAL_DIGEST_REQUIRED');
      requireThat(decision === 'ALLOW_ONCE' || decision === 'DENY', 'APPROVAL_DECISION_INVALID');
      this.approvals.set(digest, { digest, decision: decision as 'ALLOW_ONCE' | 'DENY' });
      this.pushRealtime('approval');
      const r = receipt({ commandId, family: 'native.approval' });
      this.receipts.set(commandId, r);
      return r;
    }

    if (family === 'native.seedApproval') {
      const digest = String(command?.digest ?? randomUUID());
      this.approvals.set(digest, { digest, decision: 'pending' });
      const r = receipt({ commandId, family: 'native.reviewState', code: digest });
      this.receipts.set(commandId, r);
      return r;
    }

    throw new Fault('UNSUPPORTED_TOPOLOGY_COMMAND');
  }

  async renewClient(previous: AdoptionClient, next: AdoptionClient, _continuity: AdoptionContinuity | null) {
    if (this.controller === previous.clientInstanceId) this.controller = next.clientInstanceId;
    return { controller: this.controller, fence: this.fence };
  }

  async lookup(commandId: string) {
    return this.receipts.get(commandId) ?? null;
  }

  subscribeRealtime(listener: (envelope: RealtimeInvalidateEnvelope) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  pollRealtime(sinceRevision: string) {
    const since = BigInt(sinceRevision || '0');
    if (this.revision > since + 1n) throw new Fault('RESYNC_REQUIRED');
    return { revision: String(this.revision), events: [] as RealtimeInvalidateEnvelope[] };
  }

  private pushRealtime(reason: string) {
    this.revision += 1n;
    const envelope = {
      revision: String(this.revision),
      reason,
      at: Date.now(),
    } as unknown as RealtimeInvalidateEnvelope;
    for (const listener of this.listeners) listener(envelope);
  }
}
