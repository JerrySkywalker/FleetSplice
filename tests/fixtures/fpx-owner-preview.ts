/** UI-only H0 fixture. No native adapter/transport, filesystem tools or OS effects. */
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { AdoptionClient, AdoptionCommand, AdoptionPort, AdoptionReceipt, AdoptionSnapshot } from '../../packages/native-adoption/types.ts';
import type { RealtimeInvalidateEnvelope } from '../../packages/contracts/realtime-bus.ts';

export function createFpxOwnerFixture() {
  const data = JSON.parse(readFileSync('docs/ux/fixtures/fpx-cockpit-scenarios.json', 'utf8'));
  const listeners = new Set<(event: RealtimeInvalidateEnvelope) => void>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const receipts = new Map<string, AdoptionReceipt>();
  let revision = 0; let ownerClient: string | null = null; let scenario = 'normal';
  const snapshot: AdoptionSnapshot = { runtimeId: 'SYNTHETIC-H0-NO-NATIVE', state: 'READY', incarnation: `fixture-${randomUUID()}`,
    daemon: { executablePath: null, reportedVersion: 'SYNTHETIC_ONLY', sha256: null, processId: 0, processCreationTime: 'SYNTHETIC_NOT_OS_IDENTITY', endpoint: 'NONE_NO_NATIVE_TRANSPORT', endpointIdentity: 'fixture', serverIncarnation: null },
    compatibility: { profile: 'ADOPT_FULL', observedAt: new Date().toISOString(), capabilities: Object.fromEntries(['sharedDaemon','threadList','threadRead','resume','events','turnStart','activeTurn','interrupt','steer','approvalObserve','approvalResolve','models','effectiveState'].map(key => [key, { available: !['resume','steer','interrupt'].includes(key), evidence: 'SYNTHETIC_UI_ONLY_NOT_NATIVE_QUALIFICATION' }])) as AdoptionSnapshot['compatibility']['capabilities'] },
    workspace: data.workspace, controller: null, fence: 0, controlMode: 'COOPERATIVE', observationFailure: null, receipts: [], approvals: [],
    threads: data.scenarios.map((item: any) => ({ id: item.thread_id, workspace: data.workspace, workspaceIdentity: 'synthetic-h0-root', origin: 'NATIVE_ADOPTED',
      status: item.tool ? 'active' : 'idle', activeTurnId: item.tool ? item.tool.turn_id : null, lastTurnStatus: item.tool ? null : 'completed', model: 'SYNTHETIC · NO NATIVE CONNECTION', permission: 'Synthetic UI fixture only', attached: true,
      stateToken: 'fixture-state-0', externalAdvance: false,
      history: [{ role: 'user', text: `MOCK · ${item.title}`, turnId: `seed-${item.id}`, itemId: `label-${item.id}` },
        { role: 'assistant', text: 'All content and actions in this preview are simulated. No native connection or command is executed.', turnId: `seed-${item.id}`, itemId: `disclaimer-${item.id}` },
        ...(item.messages ?? []).map((message: any) => ({ role: message.role, text: message.text, turnId: `seed-${item.id}`, itemId: message.id }))],
      turns: [{ id: `seed-${item.id}`, state: 'COMPLETED', startedAt: null, completedAt: null, durationMs: null }, ...(item.tool ? [{ id: item.tool.turn_id, state: 'RUNNING', startedAt: null, completedAt: null, durationMs: null }] : [])],
      activity: item.tool ? [{ id: item.tool.id, turnId: item.tool.turn_id, text: item.tool.detail, status: item.tool.status }] : [], historyLimited: true, residualCommandState: 'NONE_OBSERVED' })),
  };
  function emit(stream: RealtimeInvalidateEnvelope['stream'], kind: string, threadId: string | null = null, turnId: string | null = null, semantic?: RealtimeInvalidateEnvelope['semantic']) {
    const event = { stream, kind, threadId, turnId, semantic, revision: String(++revision), eventId: `fixture-event-${revision}` };
    for (const listener of listeners) listener(event);
  }
  function later(ms: number, task: () => void) { const timer = setTimeout(() => { timers.delete(timer); task(); }, ms); timers.add(timer); }
  const port: AdoptionPort = {
    async snapshot() { return structuredClone(snapshot); },
    async execute(value: unknown, client: AdoptionClient) {
      const command = value as AdoptionCommand;
      const previous = receipts.get(command.commandId); if (previous) return previous;
      const thread = snapshot.threads.find(item => item.id === command.threadId)!;
      const receipt: AdoptionReceipt = { commandId: command.commandId, family: command.family, status: 'SUCCEEDED', code: 'SYNTHETIC_UI_RECEIPT', daemon: snapshot.daemon,
        threadId: command.threadId, turnId: command.activeTurnId, origin: 'NATIVE_ADOPTED', createdNativeThread: false, processTerminationClaim: false };
      if (!thread || command.expectedFence !== snapshot.fence || snapshot.state !== 'READY' || (command.family !== 'native.attach' && snapshot.controller !== client.clientInstanceId)) {
        receipt.status = 'REJECTED'; receipt.code = 'SYNTHETIC_STALE_OR_VIEWER';
      } else if (command.family === 'native.attach') { ownerClient = client.clientInstanceId; snapshot.controller = ownerClient; snapshot.fence++; }
      else if (command.family === 'native.release') { snapshot.controller = null; snapshot.fence++; }
      else if (command.family === 'native.reviewState') thread.externalAdvance = false;
      else if (command.family === 'native.approval') snapshot.approvals = snapshot.approvals!.map(item => ({ ...item, status: 'RESOLVED', authority: null }));
      else if (command.family === 'native.submit' && scenario === 'unknown') { receipt.status = 'AMBIGUOUS_EFFECT'; receipt.code = 'SYNTHETIC_UNKNOWN_NO_REPLAY'; snapshot.state = 'NATIVE_EFFECT_UNKNOWN_NO_REPLAY'; }
      else if (command.family === 'native.submit') {
        const turnId = `fixture-turn-${randomUUID()}`; const itemId = `fixture-answer-${turnId}`; receipt.turnId = turnId;
        thread.status = 'active'; thread.activeTurnId = turnId;
        thread.turns.push({ id: turnId, state: 'RUNNING', startedAt: null, completedAt: null, durationMs: null });
        thread.history.push({ role: 'user', text: command.text, turnId, itemId: `fixture-user-${turnId}`, source: { kind: 'FLEETSPLICE_WEB', clientInstanceId: client.clientInstanceId } });
        later(160, () => emit('agent.execution', 'message.delta', thread.id, turnId, { role: 'assistant', itemId, text: 'Synthetic response: ' }));
        later(320, () => emit('agent.execution', 'tool.started', thread.id, turnId, { role: 'tool', toolId: `tool-${turnId}`, itemId: `tool-${turnId}`, status: 'inProgress', text: 'Synthetic test runner. No command is executed.' }));
        later(640, () => {
          const text = 'Synthetic response: preview input received. No native action was performed.';
          emit('agent.execution', 'message.final', thread.id, turnId, { role: 'assistant', itemId, text });
          emit('agent.execution', 'tool.completed', thread.id, turnId, { role: 'tool', toolId: `tool-${turnId}`, itemId: `tool-${turnId}`, status: 'completed', text: 'Synthetic test runner. No command is executed.' });
          thread.history.push({ role: 'assistant', text, turnId, itemId });
          thread.activity.push({ id: `tool-${turnId}`, turnId, text: 'Synthetic test runner. No command is executed.', status: 'completed' });
          thread.turns.at(-1)!.state = 'COMPLETED'; thread.status = 'idle'; thread.activeTurnId = null;
          emit('agent.execution', 'turn.completed', thread.id, turnId);
        });
      } else { receipt.status = 'REJECTED'; receipt.code = 'SYNTHETIC_ACTION_NOT_OFFERED'; }
      receipts.set(command.commandId, receipt); emit('fleet.control', 'receipt', command.threadId, receipt.turnId); return structuredClone(receipt);
    },
    async lookup(commandId) { return structuredClone(receipts.get(commandId) ?? null); },
    async renewClient(previous, next) { if (snapshot.controller === previous.clientInstanceId) { snapshot.controller = next.clientInstanceId; ownerClient = next.clientInstanceId; snapshot.fence++; } return { controller: snapshot.controller, fence: snapshot.fence }; },
    subscribeRealtime(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
  return { port, setScenario(name: string) {
    if (!['normal','viewer','controller','approval','external','unknown','offline'].includes(name)) throw Error('Choose normal/viewer/controller/approval/external/unknown/offline');
    scenario = name; snapshot.state = name === 'offline' ? 'NATIVE_OBSERVATION_LOST' : 'READY'; snapshot.controller = name === 'viewer' ? 'synthetic-other-client' : ownerClient;
    snapshot.fence++; for (const thread of snapshot.threads) { thread.externalAdvance = name === 'external'; thread.stateToken = `fixture-state-${snapshot.fence}`; }
    snapshot.approvals = name === 'approval' ? [{ requestId: 0, threadId: 'fixture-thread-approval', turnId: 'seed-approval', itemId: 'fixture-approval-item', requestType: 'synthetic', digest: 'fixture-only',
      summary: 'MOCK approval. Allow/Deny changes fixture memory only. No native action or command.', workspace: data.workspace, status: 'PENDING', supported: true, authority: 'SYNTHETIC_NOT_A_NATIVE_TOKEN' }] : [];
    emit('fleet.control', 'reconnect');
    return snapshot.fence;
  }, counters() { return { syntheticCommands: receipts.size, realNativeConnections: 0, realNativeEffects: 0 }; }, close() { for (const timer of timers) clearTimeout(timer); timers.clear(); listeners.clear(); } };
}
