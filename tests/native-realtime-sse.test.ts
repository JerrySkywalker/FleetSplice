import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { RealtimeEventBus, sanitizeRealtimeEvent } from '../packages/contracts/realtime-bus.ts';
import type { AgentExecutionEvent } from '../packages/contracts/realtime-streams.ts';
import { startHub } from '../apps/hub/server.ts';
import { target } from './helpers.ts';

test('realtime bus orders revisions, dedupes event ids, and sanitizes payloads', () => {
  const bus = new RealtimeEventBus();
  const seen: string[] = [];
  bus.subscribe(envelope => seen.push(envelope.eventId));
  const base = {
    eventId: 'same',
    revision: '0',
    observedAt: '2026-09-17T00:00:00.000Z',
    sessionKey: 's',
    threadId: 't',
    turnId: 'u',
    stream: 'agent.execution' as const,
    kind: 'message.delta' as const,
    payload: { text: 'secret-should-not-appear', token: 'cred' },
    trustLevel: 'NATIVE_STRUCTURED_API' as const,
  };
  const first = bus.publish(base);
  const duplicate = bus.publish({ ...base, kind: 'message.final' });
  assert.equal(first.revision, '1');
  assert.equal(duplicate.revision, '1');
  assert.equal(seen.length, 1);
  assert.equal('payload' in first, false);
  assert.equal(first.semantic?.text, 'secret-should-not-appear');
  assert.doesNotMatch(JSON.stringify(first), /"token"|"credential"|rawDaemon/);
  const page = bus.since('1');
  assert.equal(page.events.length, 0);
  const withId = bus.publish({
    ...base, eventId: 'with-id', kind: 'message.final',
    payload: { role: 'assistant', text: 'ok', itemId: 'native-item-9' },
  });
  assert.equal(withId.semantic?.itemId, 'native-item-9');
  bus.publish({ ...base, eventId: 'next', kind: 'turn.started' });
  assert.deepEqual(bus.since('1').events.map(item => item.eventId), ['with-id', 'next']);
  const sanitized = sanitizeRealtimeEvent(base satisfies AgentExecutionEvent);
  assert.equal(sanitized.kind, 'message.delta');
  assert.equal('payload' in sanitized, false);
});

test('native SSE requires same-origin session, enforces observer limit, and emits sanitized envelopes via direct subscription', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const bootstrapToken = randomUUID();
  const bus = new RealtimeEventBus();
  const hub = await startHub({
    port, target: target(), root: 'V:\\test', sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-native-sse-')), webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(), bootstrapToken,
  }, {
    snapshot: async () => ({ state: 'READY' } as any),
    execute: async () => ({ status: 'SUCCEEDED' } as any),
    renewClient: async () => ({ controller: null, fence: 0 }),
    lookup: async () => null,
    subscribeRealtime: listener => bus.subscribe(listener),
    pollRealtime: async since => bus.since(since),
  });
  try {
    assert.equal((await fetch(`${origin}/api/native/events`)).status, 403);
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: bootstrapToken }) });
    const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    assert.equal((await fetch(`${origin}/api/native/events`, { headers: { Cookie: cookie, Origin: 'https://evil.invalid' } })).status, 403);

    const openStream = async () => {
      const response = await fetch(`${origin}/api/native/events`, { headers: { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' } });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') ?? '', /text\/event-stream/);
      return response;
    };

    const streams: Response[] = [];
    for (let i = 0; i < 16; i++) streams.push(await openStream());
    assert.equal((await fetch(`${origin}/api/native/events`, { headers: { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' } })).status, 403);

    bus.publish({
      eventId: randomUUID(), revision: '0', observedAt: '2026-09-17T00:00:00.000Z', sessionKey: 's',
      threadId: 'thread-1', turnId: 'turn-1', stream: 'agent.execution', kind: 'turn.started',
      payload: { rawDaemon: 'should-not-leak', credential: 'x' }, trustLevel: 'NATIVE_STRUCTURED_API',
    });
    const reader = streams[0]!.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline && !buffer.includes('turn.started')) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    assert.match(buffer, /turn\.started/);
    assert.doesNotMatch(buffer, /should-not-leak|"credential"/);
    await reader.cancel().catch(() => {});
    for (const stream of streams.slice(1)) await stream.body?.cancel().catch(() => {});
  } finally { await hub.close(); }
});

test('direct subscription delivers agent message itemId without 250ms poll', async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const bootstrapToken = randomUUID();
  const bus = new RealtimeEventBus();
  let subscribed = false;
  const hub = await startHub({
    port, target: target(), root: 'V:\\test', sid: 'fixture', principal: 'fixture', sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-native-sse-sub-')), webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(), bootstrapToken,
  }, {
    snapshot: async () => ({ state: 'READY' } as any),
    execute: async () => ({ status: 'SUCCEEDED' } as any),
    renewClient: async () => ({ controller: null, fence: 0 }),
    lookup: async () => null,
    subscribeRealtime: listener => { subscribed = true; return bus.subscribe(listener); },
    pollRealtime: async since => bus.since(since),
  });
  try {
    const boot = await fetch(`${origin}/api/bootstrap`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: bootstrapToken }) });
    const cookie = boot.headers.get('set-cookie')!.split(';')[0]!;
    const response = await fetch(`${origin}/api/native/events`, { headers: { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' } });
    assert.equal(subscribed, true);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    bus.publish({
      eventId: randomUUID(), revision: '0', observedAt: '2026-09-17T00:00:00.000Z', sessionKey: 's',
      threadId: 'thread-1', turnId: 'turn-1', stream: 'agent.execution', kind: 'message.final',
      payload: { role: 'assistant', text: 'push', itemId: 'item-42' }, trustLevel: 'NATIVE_STRUCTURED_API',
    });
    const started = Date.now();
    while (Date.now() - started < 500 && !buffer.includes('item-42')) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    assert.ok(Date.now() - started < 250, 'push subscription must not wait for the old 250ms poll');
    assert.match(buffer, /"itemId":"item-42"/);
    assert.match(buffer, /message\.final/);
    await reader.cancel().catch(() => {});
  } finally { await hub.close(); }
});
