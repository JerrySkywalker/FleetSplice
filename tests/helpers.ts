import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { digest, type FleetCommand, type Intent, type EdgeCommand, type Target } from '../packages/contracts/index.ts';
import { Journal } from '../packages/journal/index.ts';
import { HubKernel, type ClientGrant } from '../apps/hub/kernel.ts';
import { EdgeKernel } from '../apps/edge/kernel.ts';
import type { NativePort } from '../packages/driver-codex/index.ts';

export const target = (): Target => ({ authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(), hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1', environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1', rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID() });
export const grant = (): ClientGrant => ({ actorId: randomUUID(), clientInstanceId: randomUUID(), grantId: randomUUID(), grantRevision: '1', expiresAt: Date.now() + 20 * 60_000 });
// DISPOSABLE_INTEGRATION only. This port is never imported by product entrypoints.
export class FixtureNative implements NativePort {
  instanceId = randomUUID(); pid = 123; signals = new EventEmitter();
  creates = 0; turns = 0; starts = 0; capabilityReads = 0; threadId = randomUUID(); turnId = '';
  catalog = { models: [{ id: 'fixture-model', displayName: 'Fixture model', isDefault: true, supportedReasoningEfforts: [{ reasoningEffort: 'fixture-reasoning', description: 'Fixture reasoning' }, { reasoningEffort: 'fixture-deep', description: 'Fixture deep reasoning' }], defaultReasoningEffort: 'fixture-reasoning' }] };
  lastConfiguration: { model: string; reasoningEffort: string } | null = null;
  failure: 'before' | 'after' | null = null;
  responseFirst = false;
  beforeWrite: () => void = () => {};
  qualify: () => Promise<void> = async () => {};
  async start(beforeEffect: () => void) { beforeEffect(); this.beforeWrite(); this.starts++; }
  async capabilities(_requestId: string, beforeEffect: () => void) { beforeEffect(); this.capabilityReads++; return structuredClone(this.catalog); }
  async create(_requestId: string, _root: string, configuration: { model: string; reasoningEffort: string }, beforeEffect: () => void) {
    await this.qualify(); beforeEffect();
    this.beforeWrite(); this.creates++; this.lastConfiguration = structuredClone(configuration);
    if (this.failure === 'before') throw new Error('response lost before known start');
    const notify = () => this.signals.emit('signal', { method: 'thread/started', params: { thread: { id: this.threadId } } });
    if (this.responseFirst) setImmediate(notify); else notify();
    if (this.failure === 'after') throw new Error('response lost after known start');
    return { threadId: this.threadId, model: configuration.model, provider: 'fixture', reasoningEffort: configuration.reasoningEffort };
  }
  async turn(_requestId: string, _threadId: string, _root: string, _text: string, beforeEffect: () => void) {
    await this.qualify(); beforeEffect();
    this.beforeWrite(); this.turns++; this.turnId = randomUUID();
    const notify = () => this.signals.emit('signal', { method: 'turn/started', params: { threadId: this.threadId, turn: { id: this.turnId } } });
    if (this.responseFirst) setImmediate(notify); else notify();
    return this.turnId;
  }
  delta(text = 'fixture output') { this.signals.emit('signal', { method: 'item/agentMessage/delta', params: { threadId: this.threadId, turnId: this.turnId, delta: text } }); }
  complete() { this.signals.emit('signal', { method: 'turn/completed', params: { threadId: this.threadId, turn: { id: this.turnId, status: 'completed' } } }); }
  async close() { return true; }
}
export function rig() {
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-g05-test-'));
  const hubJournal = new Journal(path.join(directory, 'hub.sqlite')); const edgeJournal = new Journal(path.join(directory, 'edge.sqlite'));
  edgeJournal.set('root', 'V:\\disposable-fixture');
  const identity = target(); const client = grant(); const native = new FixtureNative();
  let verify: () => Promise<void> = async () => {};
  let loseReceipt = false;
  let beforeReceipt: (command: EdgeCommand) => void = () => {};
  const delivered: EdgeCommand[] = [];
  const edge = new EdgeKernel(edgeJournal, identity, native, () => verify(), event => hub.event(event));
  edge.connected = true;
  const hub = new HubKernel(hubJournal, identity, 'V:\\disposable-fixture', async command => { delivered.push(command); const result = await edge.execute(command); beforeReceipt(command); if (loseReceipt) throw new Error('receipt lost'); return result; }, () => {});
  hub.ready(false);
  async function make(family: Intent['family'], body: unknown = {}, laneId: string | null = null, actor = client): Promise<FleetCommand> {
    const lane = hub.snapshot().lanes.find(item => item.laneId === laneId);
    const effectiveBody = family === 'sessionLane.continue' && (!body || Object.keys(body as object).length === 0) ? { model: 'fixture-model', reasoningEffort: 'fixture-reasoning' } : body;
    const intent = { v: 1, actorId: actor.actorId, clientInstanceId: actor.clientInstanceId, grantId: actor.grantId, grantRevision: actor.grantRevision, target: identity, laneId, expected: lane?.fence ?? null, family, body } as Intent;
    intent.body = effectiveBody as Intent['body'];
    return { commandId: randomUUID(), idempotencyKey: randomUUID(), intentDigest: await digest('intent', intent), intent };
  }
  async function admit(family: Intent['family'], body: unknown = {}, laneId: string | null = null) { const value = await make(family, body, laneId); return hub.execute(value, client); }
  async function setup() {
    await admit('workspace.register', { root: 'V:\\disposable-fixture' });
    const created = await admit('logicalSession.create', { title: 'fixture only' });
    const laneId = created.plan.laneId!;
    await admit('sessionLane.acquireControl', {}, laneId); return laneId;
  }
  return { directory, hubJournal, edgeJournal, identity, client, native, delivered, hub, edge, make, admit, setup,
    verification: (fn: () => Promise<void>) => { verify = fn; }, loss: (value: boolean) => { loseReceipt = value; },
    beforeReceipt: (fn: (command: EdgeCommand) => void) => { beforeReceipt = fn; },
    close: () => { hubJournal.close(); edgeJournal.close(); } };
}
