import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { canonical, digest, parseJson, validate, Fault, ClockFence, type EdgeCommand } from '../packages/contracts/index.ts';
import { Journal } from '../packages/journal/index.ts';
import { HubKernel, AdmissionRejected } from '../apps/hub/kernel.ts';
import { EdgeKernel } from '../apps/edge/kernel.ts';
import { FixtureNative, grant, rig } from './helpers.ts';

test('strict JSON rejects erased ambiguities, Unicode and lossy values before canonicalization', () => {
  for (const text of ['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '"\\ud800"', '9007199254740993', '1e400', '-0', '1.1', '{"a":true}\u00a0', '{"a":1,}', '['.repeat(45) + '0' + ']'.repeat(45)]) assert.throws(() => parseJson(text));
  assert.equal(canonical(parseJson('{"z":"你好😀","a":[null,true,4]}')), '{"a":[null,true,4],"z":"你好😀"}');
});
test('clock discontinuity latches closed and cannot revive an expired authority', () => {
  const clock = new ClockFence(100000, 1000); clock.check(101000, 2000);
  assert.throws(() => clock.check(91000, 3000), /CLOCK_CONTINUITY_UNKNOWN/);
  assert.throws(() => clock.check(103000, 4000), /CLOCK_CONTINUITY_UNKNOWN/);
});
test('closed schemas reject raw native escapes and unknown fields', async () => {
  const r = rig(); try {
    const command = await r.make('logicalSession.create', { title: 'x' });
    validate('command', command);
    for (const mutation of [ { ...command, nativeMethod: 'turn/start' }, { ...command, intent: { ...command.intent, family: 'native.any' } }, { ...command, intent: { ...command.intent, body: { title: 'x', cwd: 'C:\\' } } } ]) assert.throws(() => validate('command', mutation), /SCHEMA_INVALID/);
  } finally { r.close(); }
});
test('logical create and reads are native-free; private native continue preserves one thread', async () => {
  const r = rig(); try {
    const lane = await r.setup();
    r.hub.snapshot(); r.hub.lookup(r.hub.snapshot().commands[0]!.command.commandId);
    assert.equal(r.native.starts + r.native.creates + r.native.turns, 0);
    const first = await r.admit('sessionLane.continue', {}, lane);
    const second = await r.admit('sessionLane.continue', {}, lane);
    assert.equal(first.receipt!.nativeThreadId, second.receipt!.nativeThreadId);
    assert.equal(r.native.creates, 1);
    await r.admit('turn.submit', { text: 'one' }, lane); r.native.delta('one'); r.native.complete();
    await r.admit('turn.submit', { text: 'two' }, lane); r.native.delta('two'); r.native.complete();
    assert.equal(r.native.turns, 2); assert.equal(r.native.creates, 1);
    assert.equal(r.hub.snapshot().lanes[0]!.state, 'IDLE');
  } finally { r.close(); }
});
test('native responses can precede thread/turn started notifications without inventing external writers', async () => {
  const r = rig(); try {
    r.native.responseFirst = true;
    const lane = await r.setup(); await r.admit('sessionLane.continue', {}, lane);
    await new Promise<void>(resolve => setImmediate(resolve));
    for (const text of ['first', 'continued']) {
      await r.admit('turn.submit', { text }, lane);
      await new Promise<void>(resolve => setImmediate(resolve));
      r.native.delta(text); r.native.complete();
    }
    assert.equal(r.edge.blocked, null); assert.equal(r.hub.status, 'READY');
    assert.equal(r.native.creates, 1); assert.equal(r.native.turns, 2);
    assert.equal(r.hub.snapshot().lanes[0]!.transcript.filter(item => item.role === 'assistant').length, 2);
  } finally { r.close(); }
});
test('independent SQLite readers see Hub admission and FULL Edge attempt before every native write/spawn', async () => {
  const r = rig(); try {
    const lane = await r.setup();
    r.native.beforeWrite = () => {
      const delivery = r.delivered.at(-1)!;
      const h = new DatabaseSync(path.join(r.directory, 'hub.sqlite'), { readOnly: true });
      const e = new DatabaseSync(path.join(r.directory, 'edge.sqlite'), { readOnly: true });
      assert.equal(h.prepare('select count(*) as n from evidence where kind=? and key=?').get('ADMITTED_PLAN', delivery.command.commandId)!.n, 1);
      assert.equal(e.prepare('select count(*) as n from evidence where kind=? and key=?').get('DISPATCH_ATTEMPT', delivery.edgeCommandId)!.n, 1);
      assert.equal(r.edgeJournal.db.prepare('pragma synchronous').get()!.synchronous, 2); h.close(); e.close();
    };
    await r.admit('sessionLane.continue', {}, lane); await r.admit('turn.submit', { text: 'durable' }, lane); r.native.complete();
  } finally { r.close(); }
});
test('command IDs, scoped aliases and Edge tuples dedupe; changed intent conflicts', async () => {
  const r = rig(); try {
    const lane = await r.setup(); const command = await r.make('sessionLane.continue', {}, lane);
    const first = await r.hub.execute(command, r.client);
    assert.deepEqual(await r.hub.execute(command, r.client), first);
    assert.deepEqual(await r.hub.execute({ ...command, commandId: randomUUID() }, r.client), first);
    const delivery = r.delivered.at(-1)!; await r.edge.execute(delivery); assert.equal(r.native.creates, 1);
    const changed = structuredClone(command); changed.intent.expected!.revision = '500'; changed.intentDigest = await digest('intent', changed.intent);
    await assert.rejects(r.hub.execute(changed, r.client), /COMMAND_ID_REUSE_CONFLICT/);
    changed.commandId = randomUUID(); await assert.rejects(r.hub.execute(changed, r.client), /IDEMPOTENCY_CONFLICT/);
    const altered = structuredClone(delivery); altered.plan.decision.expiresAt--;
    const { stepDigest: _, ...payload } = altered; altered.stepDigest = await digest('step', payload);
    await assert.rejects(r.edge.execute(altered), /EDGE_COMMAND_ID_REUSE_CONFLICT/);
    assert.equal(r.native.creates, 1);
  } finally { r.close(); }
});
for (const failure of ['before', 'after'] as const) test(`native response loss ${failure} thread identity quarantines every new conflicting ID`, async () => {
  const r = rig(); try {
    const lane = await r.setup(); r.native.failure = failure;
    const command = await r.make('sessionLane.continue', {}, lane); const result = await r.hub.execute(command, r.client);
    assert.equal(result.status, 'AMBIGUOUS_EFFECT');
    assert.equal(!!result.receipt!.nativeThreadId, failure === 'after');
    assert.equal((await r.hub.execute(command, r.client)).status, 'AMBIGUOUS_EFFECT');
    await r.edge.execute(r.delivered.at(-1)!);
    await assert.rejects(r.admit('sessionLane.continue', {}, lane), /AMBIGUOUS_EFFECT/);
    assert.equal(r.native.creates, 1);
  } finally { r.close(); }
});
test('lost Hub receipt after native start never re-emits the Edge step', async () => {
  const r = rig(); try {
    const lane = await r.setup(); r.loss(true); const command = await r.make('sessionLane.continue', {}, lane);
    assert.equal((await r.hub.execute(command, r.client)).status, 'AMBIGUOUS_EFFECT');
    r.loss(false); assert.equal((await r.hub.execute(command, r.client)).status, 'AMBIGUOUS_EFFECT');
    assert.equal((await r.edge.execute(r.delivered.at(-1)!)).status, 'SUCCEEDED');
    assert.equal(r.native.creates, 1);
  } finally { r.close(); }
});
test('wrong target, stale generations, controller CAS and expired grants fail before dispatch', async () => {
  const r = rig(); try {
    const lane = await r.setup();
    for (const key of Object.keys(r.identity)) {
      const value = await r.make('sessionLane.continue', {}, lane);
      value.intent.target = { ...value.intent.target, [key]: key.endsWith('Generation') ? '2' : key === 'rootIdentity' ? 'b'.repeat(64) : randomUUID() };
      value.intentDigest = await digest('intent', value.intent);
      await assert.rejects(r.hub.execute(value, r.client), /STALE_TARGET/);
    }
    const stale = await r.make('sessionLane.continue', {}, lane);
    await r.admit('sessionLane.releaseControl', {}, lane);
    await assert.rejects(r.hub.execute(stale, r.client), /STALE_FENCE/);
    const candidate = await r.make('sessionLane.acquireControl', {}, lane);
    const another = structuredClone(candidate); another.commandId = randomUUID(); another.idempotencyKey = randomUUID();
    const race = await Promise.allSettled([r.hub.execute(candidate, r.client), r.hub.execute(another, r.client)]);
    assert.equal(race.filter(item => item.status === 'fulfilled').length, 1);
    const other = { ...grant(), actorId: r.client.actorId };
    await assert.rejects(r.hub.execute(await r.make('sessionLane.continue', {}, lane, other), other), /NOT_CONTROLLER/);
    await assert.rejects(r.hub.execute(await r.make('sessionLane.continue', {}, lane), { ...r.client, expiresAt: Date.now() - 1 }), /GRANT_EXPIRED/);
    assert.equal(r.native.creates, 0);
  } finally { r.close(); }
});
test('local wrong principal/elevation/root verification rejects before dispatch marker', async () => {
  for (const fault of ['WRONG_PRINCIPAL', 'PRIVILEGE_OR_SESSION_REJECTED', 'WORKSPACE_REPLACED']) {
    const r = rig(); try {
      const lane = await r.setup(); r.verification(async () => { throw new Fault(fault); });
      const command = await r.make('sessionLane.continue', {}, lane); await r.hub.execute(command, r.client);
      assert.equal(r.native.creates, 0);
      assert.equal(r.edgeJournal.db.prepare("select count(*) as n from evidence where kind='DISPATCH_ATTEMPT'").get()!.n, 0);
    } finally { r.close(); }
  }
});
test('Hub, Edge and combined cold restarts reject old authority and never replay attempts', async () => {
  const r = rig();
  const lane = await r.setup(); await r.admit('sessionLane.continue', {}, lane);
  const delivery = r.delivered.at(-1)!;
  r.close();
  const h = new Journal(path.join(r.directory, 'hub.sqlite')); const e = new Journal(path.join(r.directory, 'edge.sqlite'));
  try {
    const native = new FixtureNative();
    const edge = new EdgeKernel(e, r.identity, native, async () => {}, () => {}); edge.connected = true;
    const hub = new HubKernel(h, r.identity, 'V:\\disposable-fixture', value => edge.execute(value), () => {}); hub.ready(false);
    assert.equal(hub.status, 'RECOVERY_REQUIRED'); assert.equal(edge.blocked, 'RECOVERY_REQUIRED');
    assert.equal((await edge.execute(delivery)).status, 'SUCCEEDED'); assert.equal(native.creates, 0);
    const altered: EdgeCommand = structuredClone(delivery); altered.edgeCommandId = randomUUID(); altered.plan.steps[0]!.edgeCommandId = altered.edgeCommandId; altered.planDigest = await digest('plan', altered.plan);
    const { stepDigest: _, ...payload } = altered; altered.stepDigest = await digest('step', payload);
    await assert.rejects(edge.execute(altered), /RECOVERY_REQUIRED/); assert.equal(native.starts, 0);
  } finally { h.close(); e.close(); }
});
test('unsupported native approval and unexpected external turn close admission visibly', async () => {
  for (const external of [false, true]) {
    const r = rig(); try {
      const lane = await r.setup(); await r.admit('sessionLane.continue', {}, lane); await r.admit('turn.submit', { text: 'x' }, lane);
      r.native.signals.emit('signal', external ? { method: 'turn/started', params: { threadId: randomUUID(), turn: { id: randomUUID() } } } : { method: 'item/commandExecution/requestApproval', requestId: 1, params: {} });
      assert.ok(r.edge.blocked); assert.match(r.hub.snapshot().lanes[0]!.state, /AMBIGUOUS|BLOCKED/);
      await assert.rejects(r.admit('turn.submit', { text: 'new' }, lane)); assert.equal(r.native.turns, 1);
    } finally { r.close(); }
  }
});
test('a failed Edge journal closes admission before any native write', async () => {
  const r = rig(); try {
    const lane = await r.setup();
    r.edgeJournal.insert = () => { throw new Error('injected disk failure'); };
    await r.admit('sessionLane.continue', {}, lane);
    assert.equal(r.native.starts + r.native.creates, 0);
    assert.equal(r.edge.connected, false); assert.equal(r.edge.blocked, 'JOURNAL_OR_LOCAL_PROOF_FAILED');
  } finally { r.close(); }
});
test('pending command queues apply backpressure without dispatching more work', async () => {
  const r = rig(); try {
    const lane = await r.setup(); const deliveredBefore = r.delivered.length;
    const command = await r.make('sessionLane.continue', {}, lane);
    const work = Array.from({ length: 32 }, () => r.hub.execute(command, r.client));
    await assert.rejects(r.hub.execute(command, r.client), error => error instanceof Fault && !(error instanceof AdmissionRejected) && error.code === 'COMMAND_BACKPRESSURE');
    await Promise.all(work); assert.equal(r.delivered.length, deliveredBefore + 1); assert.equal(r.native.creates, 1);
  } finally { r.close(); }
});

test('Hub storage failures latch recovery even after storage returns and ready is repeated', async () => {
  for (const operation of ['insert', 'set', 'update'] as const) {
    const r = rig(); try {
      const lane = await r.setup(); const deliveredBefore = r.delivered.length;
      const original = r.hubJournal[operation];
      r.hubJournal[operation] = () => { throw new Error('injected Hub storage failure'); };
      await assert.rejects(r.admit('sessionLane.continue', {}, lane), /injected Hub storage failure/);
      Object.assign(r.hubJournal, { [operation]: original });
      const nativeExpected = operation === 'update' ? 1 : 0;
      assert.equal(r.native.creates, nativeExpected);
      assert.equal(r.delivered.length, deliveredBefore + nativeExpected);
      assert.equal(r.hub.status, 'RECOVERY_REQUIRED');
      r.hub.ready(false);
      assert.equal(r.hub.snapshot().lanes[0]!.state, 'RECOVERY_REQUIRED');
      await assert.rejects(r.admit('sessionLane.continue', {}, lane), /RECOVERY_REQUIRED/);
      assert.equal(r.native.creates, nativeExpected);
    } finally { r.close(); }
  }
});

test('control receipts preserve native completion and quarantine in either event order', async () => {
  for (const family of ['sessionLane.acquireControl', 'sessionLane.releaseControl'] as const) {
    for (const observation of ['completed', 'blocked'] as const) {
      for (const eventFirst of [true, false]) {
        const r = rig(); try {
          const lane = await r.setup(); await r.admit('sessionLane.continue', {}, lane);
          await r.admit('turn.submit', { text: 'in flight' }, lane);
          if (family === 'sessionLane.acquireControl') await r.admit('sessionLane.releaseControl', {}, lane);
          const observe = () => observation === 'completed' ? r.native.complete() : r.native.signals.emit('fault', 'NATIVE_EXITED');
          if (eventFirst) r.beforeReceipt(command => { if (command.command.intent.family === family) observe(); });
          const control = await r.admit(family, {}, lane);
          if (!eventFirst) observe();
          assert.equal(control.status, 'SUCCEEDED');
          assert.equal(r.hub.snapshot().lanes[0]!.state, observation === 'completed' ? 'IDLE' : 'AMBIGUOUS_EFFECT');
          if (observation === 'completed') {
            r.beforeReceipt(() => {});
            if (family === 'sessionLane.releaseControl') await r.admit('sessionLane.acquireControl', {}, lane);
            await r.admit('turn.submit', { text: 'still operable' }, lane); r.native.complete();
            assert.equal(r.native.turns, 2);
          } else await assert.rejects(r.admit('sessionLane.continue', {}, lane), /AMBIGUOUS_EFFECT/);
        } finally { r.close(); }
      }
    }
  }
});

test('idle native exit publishes durable recovery state before and after a completed turn', async () => {
  for (const afterTurn of [false, true]) {
    const r = rig(); try {
      const lane = await r.setup(); await r.admit('sessionLane.continue', {}, lane);
      if (afterTurn) { await r.admit('turn.submit', { text: 'done' }, lane); r.native.complete(); }
      r.native.signals.emit('fault', 'NATIVE_EXITED');
      assert.equal(r.edge.blocked, 'NATIVE_EXITED');
      assert.equal(r.hub.snapshot().status, 'RECOVERY_REQUIRED');
      assert.equal(r.hub.snapshot().lanes[0]!.state, 'RECOVERY_REQUIRED');
      const saved = r.edgeJournal.db.prepare("select value from evidence where kind='NATIVE_EVENT' order by seq desc limit 1").get()!;
      assert.equal(JSON.parse(String(saved.value)).status, 'RECOVERY_REQUIRED');
      await assert.rejects(r.admit('sessionLane.continue', {}, lane), /RECOVERY_REQUIRED/);
      await assert.rejects(r.admit('turn.submit', { text: 'new' }, lane), /RECOVERY_REQUIRED/);
      assert.equal(r.native.creates, 1); assert.equal(r.native.turns, afterTurn ? 1 : 0);
    } finally { r.close(); }
  }
});

test('the 24-lane creation limit leaves existing lanes operable', async () => {
  const r = rig(); try {
    const lane = await r.setup();
    for (let index = 1; index < 24; index++) await r.admit('logicalSession.create', { title: `lane ${index}` });
    await assert.rejects(r.admit('logicalSession.create', { title: 'over limit' }), /LOCAL_SESSION_LIMIT/);
    assert.equal(r.hub.snapshot().lanes.length, 24);
    await r.admit('sessionLane.continue', {}, lane);
    await r.admit('turn.submit', { text: 'at the boundary' }, lane); r.native.complete();
    await r.admit('sessionLane.releaseControl', {}, lane);
    assert.equal(r.hub.snapshot().lanes[0]!.fence.controller, null);
    assert.equal(r.native.turns, 1);
  } finally { r.close(); }
});

test('pre-admission rejection is identity-bound and never labels post-admission storage uncertainty', async () => {
  const r = rig(); try {
    const lane = await r.setup(); const stale = await r.make('sessionLane.continue', {}, lane);
    await r.admit('sessionLane.releaseControl', {}, lane);
    await assert.rejects(r.hub.execute(stale, r.client), error => error instanceof AdmissionRejected && error.code === 'STALE_FENCE' && error.commandId === stale.commandId && error.intentDigest === stale.intentDigest);
    assert.throws(() => r.hub.lookup(stale.commandId), error => error instanceof AdmissionRejected && error.code === 'STALE_FENCE'); assert.equal(r.native.creates, 0);
    await r.admit('sessionLane.acquireControl', {}, lane);
    r.hubJournal.update = () => { throw new Fault('MISSING_JOURNAL_RECORD'); };
    await assert.rejects(r.admit('sessionLane.continue', {}, lane), error => error instanceof Fault && !(error instanceof AdmissionRejected));
    assert.equal(r.native.creates, 1); assert.equal(r.hub.status, 'RECOVERY_REQUIRED');
  } finally { r.close(); }
});

test('a durable busy rejection survives changed conditions and exact or alias replay', async () => {
  const r = rig(); try {
    const first = await r.setup(); await r.admit('sessionLane.continue', {}, first);
    const firstThread = r.native.threadId;
    const second = (await r.admit('logicalSession.create', { title: 'second lane' })).plan.laneId!;
    await r.admit('sessionLane.acquireControl', {}, second);
    r.native.threadId = randomUUID(); const secondThread = r.native.threadId;
    await r.admit('sessionLane.continue', {}, second);
    r.native.threadId = firstThread; await r.admit('turn.submit', { text: 'running elsewhere' }, first);
    const refused = await r.make('turn.submit', { text: 'must remain rejected' }, second);
    const isRetained = (error: unknown) => error instanceof AdmissionRejected && error.code === 'WORKSPACE_BUSY_OR_UNKNOWN' && error.commandId === refused.commandId;
    await assert.rejects(r.hub.execute(refused, r.client), isRetained);
    const reader = new DatabaseSync(path.join(r.directory, 'hub.sqlite'), { readOnly: true });
    try {
      const row = reader.prepare('SELECT value FROM records WHERE id=?').get(refused.commandId)!;
      assert.equal(JSON.parse(String(row.value)).rejectionCode, 'WORKSPACE_BUSY_OR_UNKNOWN');
      assert.equal(reader.prepare('SELECT count(*) AS n FROM aliases WHERE id=?').get(refused.commandId)!.n, 1);
    } finally { reader.close(); }
    r.native.complete();
    await assert.rejects(r.hub.execute(refused, r.client), isRetained);
    await assert.rejects(r.hub.execute({ ...refused, commandId: randomUUID() }, r.client), isRetained);
    assert.equal(r.native.turns, 1);
    const changed = structuredClone(refused); changed.intent.expected!.revision = '900'; changed.intentDigest = await digest('intent', changed.intent);
    await assert.rejects(r.hub.execute(changed, r.client), error => error instanceof Fault && !(error instanceof AdmissionRejected) && error.code === 'COMMAND_ID_REUSE_CONFLICT');
    r.native.threadId = secondThread; await r.admit('turn.submit', { text: 'new explicit command' }, second); r.native.complete();
    assert.equal(r.native.turns, 2);
    assert.equal(r.hubJournal.db.prepare("SELECT count(*) AS n FROM evidence WHERE kind='REJECTED_BEFORE_ADMISSION' AND key=?").get(refused.commandId)!.n, 1);
  } finally { r.close(); }
});

test('rejection storage failure closes admission without a definitive acknowledgment', async () => {
  const r = rig(); try {
    const lane = await r.setup(); const stale = await r.make('sessionLane.continue', {}, lane);
    await r.admit('sessionLane.releaseControl', {}, lane);
    r.hubJournal.insert = () => { throw new Error('rejection storage unavailable'); };
    await assert.rejects(r.hub.execute(stale, r.client), error => error instanceof Error && !(error instanceof AdmissionRejected) && error.message === 'rejection storage unavailable');
    assert.equal(r.hub.status, 'RECOVERY_REQUIRED'); assert.equal(r.native.creates, 0);
  } finally { r.close(); }
});
