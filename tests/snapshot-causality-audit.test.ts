/**
 * A0/A2 causality: full Web-owned command lifecycle through Hub + SSE.
 * Pre-fix ingredients were command + turn.final + post-command catch-up fence.
 * Post-fix healthy subscription must not re-introduce catch-up double delivery.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { startHub } from '../apps/hub/server.ts';
import { target } from './helpers.ts';
import { createDisposableAdoptionFixture } from './fixtures/native-adoption-browser-fixture.ts';
import { AuthoritativeReconcileScheduler } from '../apps/web/reconcile-scheduler.ts';
import { classifyRealtimeRefresh } from '../apps/web/realtime-refresh-policy.ts';

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

test('A2 healthy subscription Web-owned turn keeps authoritative fanout <= 2 with command+turn.final', async () => {
  const fixture = await createDisposableAdoptionFixture();
  fixture.rpc.afterTurnStart = (turnId) => fixture.rpc.emitOwnedTurnLifecycle(turnId);
  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'fixture',
    principal: 'fixture',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-a2-causality-')),
    webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fixture.adoptionPort);

  const origin = `http://127.0.0.1:${port}`;
  let snapshots = 0;
  const scheduler = new AuthoritativeReconcileScheduler(async () => {
    snapshots += 1;
    await new Promise(resolve => setTimeout(resolve, 20));
  }, { debounceMs: 10 });

  try {
    const boot = await fetch(`${origin}/api/bootstrap`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: bootstrapToken }),
    });
    const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const client = await (await fetch(`${origin}/api/client`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie },
      body: '{}',
    })).json() as { clientInstanceId: string; csrf: string };

    const headers = {
      Origin: origin,
      Cookie: cookie,
      'Content-Type': 'application/json',
      'X-Fleet-Client': client.clientInstanceId,
      'X-Fleet-Csrf': client.csrf,
      'Sec-Fetch-Site': 'same-origin',
    };

    const sse = await fetch(`${origin}/api/native/events`, { headers: { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' } });
    assert.equal(sse.status, 200);
    const reader = sse.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const seenKinds: string[] = [];
    const seenEventIds: string[] = [];

    const pump = (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const line = chunk.split('\n').find(item => item.startsWith('data: '));
          if (!line) continue;
          const envelope = JSON.parse(line.slice(6)) as { stream: string; kind: string; revision: string; eventId: string; turnId: string | null };
          seenKinds.push(`${envelope.stream}:${envelope.kind}`);
          seenEventIds.push(envelope.eventId);
          const decision = classifyRealtimeRefresh(envelope);
          if (decision.mode === 'schedule_reconcile') scheduler.schedule(decision.reason);
        }
      }
    })();

    let snapshot = await (await fetch(`${origin}/api/native/snapshot`, { headers })).json();
    const attach = {
      commandId: randomUUID(),
      runtimeId: snapshot.runtimeId,
      incarnation: snapshot.incarnation,
      clientInstanceId: client.clientInstanceId,
      expectedFence: snapshot.fence,
      threadId: snapshot.threads[0].id,
      stateToken: snapshot.threads[0].stateToken,
      activeTurnId: snapshot.threads[0].activeTurnId,
      family: 'native.attach',
      text: '',
    };
    assert.equal((await (await fetch(`${origin}/api/native/commands`, { method: 'POST', headers, body: JSON.stringify(attach) })).json()).status, 'SUCCEEDED');
    scheduler.schedule('command');
    await new Promise(resolve => setTimeout(resolve, 80));
    await scheduler.whenIdle();
    const afterAttach = snapshots;

    snapshot = await (await fetch(`${origin}/api/native/snapshot`, { headers })).json();
    const submit = {
      commandId: randomUUID(),
      runtimeId: snapshot.runtimeId,
      incarnation: snapshot.incarnation,
      clientInstanceId: client.clientInstanceId,
      expectedFence: snapshot.fence,
      threadId: snapshot.threads[0].id,
      stateToken: snapshot.threads[0].stateToken,
      activeTurnId: snapshot.threads[0].activeTurnId,
      family: 'native.submit',
      text: 'Browser continuation for causality',
    };
    const receipt = await (await fetch(`${origin}/api/native/commands`, { method: 'POST', headers, body: JSON.stringify(submit) })).json();
    assert.equal(receipt.status, 'SUCCEEDED');
    scheduler.schedule('command');
    await scheduler.whenIdle();
    await new Promise(resolve => setTimeout(resolve, 150));
    await scheduler.whenIdle();

    const turnWindow = snapshots - afterAttach;
    const audit = scheduler.audit();
    assert.ok(seenKinds.some(item => item.includes('turn.completed')), `expected turn.completed in SSE, saw ${seenKinds.join(',')}`);
    assert.ok(audit.schedules.some(item => item.reason === 'command'), 'command reconcile required');
    assert.ok(audit.schedules.some(item => item.reason === 'turn.final'), 'turn.final reconcile required');
    assert.ok(turnWindow >= 1 && turnWindow <= 2, `post-fix turn fanout must be 1..2, got ${turnWindow}`);
    // No duplicate SSE event ids from subscribe+catchUp double write.
    const duplicates = seenEventIds.filter((id, index) => seenEventIds.indexOf(id) !== index);
    assert.equal(duplicates.length, 0, `SSE double-delivered event ids: ${duplicates.join(',')}`);

    await reader.cancel().catch(() => {});
    await pump.catch(() => {});
  } finally {
    scheduler.dispose();
    await hub.close();
  }
});
