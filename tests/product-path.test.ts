import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { assertNativeAdoptionProductPath, gatewayAdoptionPort } from '../packages/product-path/index.ts';
import type { AdoptionPort } from '../packages/native-adoption/types.ts';
import type { Target } from '../packages/contracts/index.ts';

const target = (): Target => ({
  authorityId: randomUUID(), hubRuntimeId: randomUUID(), edgeRuntimeId: randomUUID(), connectionId: randomUUID(),
  hubRecoveryGeneration: '1', edgeRecoveryGeneration: '1', hostId: randomUUID(), hostGeneration: '1',
  environmentId: randomUUID(), environmentGeneration: '1', workspaceId: randomUUID(), workspaceGeneration: '1',
  rootIdentity: 'a'.repeat(64), agentBindingId: randomUUID(), executionBindingId: randomUUID(), providerBindingId: randomUUID(),
});

test('product path accepts only native adoption and never raw native transport', () => {
  const value = { kind: 'NATIVE_ADOPTION', target: target() };
  assert.doesNotThrow(() => assertNativeAdoptionProductPath(value));
  assert.throws(() => assertNativeAdoptionProductPath({ kind: 'FLEETSPLICE_MANAGED', target: value.target }), /MANAGED_PRIMARY_FORBIDDEN/);
  assert.throws(() => assertNativeAdoptionProductPath({ ...value, rawNativeTransport: true }), /RAW_NATIVE_REMOTE_FORBIDDEN/);
});

test('local Gateway carriage retains the exact local AdoptionPort', () => {
  const local = {} as AdoptionPort;
  assert.equal(gatewayAdoptionPort({ kind: 'LOCAL_ADOPTION', port: local }), local);
});

test('remote Gateway carriage emits typed HCP adoption requests', async () => {
  const sent: any[] = []; const value = target();
  const port = gatewayAdoptionPort({ kind: 'REMOTE_ADOPTION', target: value, send: message => sent.push(message) });
  const pending = port.lookup('receipt-1');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].kind, 'adoption.request');
  assert.equal(sent[0].op, 'lookup');
  (port as any).accept({ v: 1, kind: 'adoption.response', connectionId: value.connectionId, target: value, requestId: sent[0].requestId, ok: true, code: null, body: null });
  assert.equal(await pending, null);
});
