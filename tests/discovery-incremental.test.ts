import assert from 'node:assert/strict';
import test from 'node:test';
import { createPerfAdoptionFixture } from './fixtures/perf-adoption-fixture.ts';

test('unchanged second discovery cuts metadata thread/read fanout without changing candidates', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureDiscoveryFanout({ loaded: 64, eligible: 8 });

  fx.rpc.resetCalls();
  const first = await fx.adapter.snapshot({ discover: true });
  assert.equal(first.threads.length, 8);
  const firstReads = fx.rpc.calls.filter(c => c.method === 'thread/read');
  const firstTurns = fx.rpc.calls.filter(c => c.method === 'thread/turns/list');
  const firstMetadata = firstReads.length - firstTurns.length;
  // Listing already classifies ineligible threads; cold pass should not fan out metadata.
  assert.equal(firstMetadata, 0);
  assert.equal(firstReads.length, 8);

  fx.rpc.resetCalls();
  const second = await fx.adapter.snapshot({ discover: true });
  assert.deepEqual(second.threads.map(t => t.id).sort(), first.threads.map(t => t.id).sort());
  const secondReads = fx.rpc.calls.filter(c => c.method === 'thread/read');
  const secondTurns = fx.rpc.calls.filter(c => c.method === 'thread/turns/list');
  const secondMetadata = secondReads.length - secondTurns.length;
  assert.equal(secondMetadata, 0);
  assert.equal(secondReads.length, 8);
  const auditBaselineMetadata = 56;
  const reduction = (auditBaselineMetadata - secondMetadata) / auditBaselineMetadata;
  assert.ok(reduction >= 0.8, `expected >=80% metadata reduction, got ${reduction}`);
  fx.journal.close();
});

test('new eligible thread is discovered and removed thread is retired', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureDiscoveryFanout({ loaded: 8, eligible: 4 });
  const first = await fx.adapter.snapshot({ discover: true });
  assert.equal(first.threads.length, 4);

  // Promote a previously ineligible loaded thread to attachable.
  const promoted = fx.rpc.threads.get('perf-thread-4')!;
  promoted.ephemeral = false;
  promoted.canAcceptDirectInput = true;
  promoted.threadSource = 'user';
  promoted.parentThreadId = undefined;
  fx.rpc.turnsByThread.set('perf-thread-4', [{
    id: 'promoted-turn',
    status: 'completed',
    items: [
      { id: 'u', type: 'userMessage', content: [{ type: 'text', text: 'promoted' }] },
      { id: 'a', type: 'agentMessage', text: 'ok' },
    ],
  }]);

  const second = await fx.adapter.snapshot({ discover: true });
  assert.ok(second.threads.some(t => t.id === 'perf-thread-4'));

  // Remove an eligible thread from loaded inventory.
  fx.rpc.loadedIds = fx.rpc.loadedIds.filter(id => id !== 'perf-thread-0');
  fx.rpc.threads.delete('perf-thread-0');
  const third = await fx.adapter.snapshot({ discover: true });
  assert.equal(third.threads.some(t => t.id === 'perf-thread-0'), false);
  fx.journal.close();
});

test('workspace cwd mismatch still rejects attachable candidacy', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureDiscoveryFanout({ loaded: 4, eligible: 2 });
  const foreign = fx.rpc.threads.get('perf-thread-0')!;
  foreign.cwd = 'V:\\other-workspace';
  const snap = await fx.adapter.snapshot({ discover: true });
  assert.equal(snap.threads.some(t => t.id === 'perf-thread-0'), false);
  assert.equal(snap.threads.length, 1);
  fx.journal.close();
});

test('listing-absent loaded thread still probes metadata so unavailable is not hidden', async () => {
  const fx = await createPerfAdoptionFixture({ discoveryIntervalMs: 60_000 });
  fx.rpc.configureDiscoveryFanout({ loaded: 4, eligible: 2 });
  // Remove one ineligible thread from listing visibility by foreign-filtering cwd in list,
  // but keep it loaded — forces a live metadata probe each discovery.
  const hidden = fx.rpc.threads.get('perf-thread-3')!;
  const originalList = fx.rpc.call.bind(fx.rpc);
  fx.rpc.call = async (method: string, params: any) => {
    if (method === 'thread/list') {
      const listing = await originalList(method, params);
      listing.data = listing.data.filter((t: any) => t.id !== 'perf-thread-3');
      return listing;
    }
    return originalList(method, params);
  };
  fx.rpc.resetCalls();
  await fx.adapter.snapshot({ discover: true });
  assert.ok(fx.rpc.calls.some(c => c.method === 'thread/read' && c.params.threadId === 'perf-thread-3'));
  assert.equal(hidden.ephemeral, true);
  fx.journal.close();
});
