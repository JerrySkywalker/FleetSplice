// SPDX-License-Identifier: MIT
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PROVIDER_PROTOCOL_VERSION, ProviderInputSchema } from '@getpaseo/plugin/server/provider';
import { route, accepted, submitted, code, openInput } from './routes.mjs';
import { discover } from './discovery.mjs';
const fixture = JSON.parse(await readFile(new URL('../fixtures/contract.json', import.meta.url), 'utf8'));
const artifact = path.resolve(process.env.PILOT_ARTIFACT_DIR ?? 'results');
const records = [];
const loader = JSON.parse(await readFile(path.join(artifact, 'P02-loader.json'), 'utf8'));
const record = (id, r, result, observations, gap = null, level = 'SYNTHETIC_NATIVE_PORT') => records.push({ case_id: id, source_commit: r === 'C' ? 'ee98a6282c7733ca1658547022ab55c3b61c0e1f' : 'cafe4b01c8522ff39560241c5deb01427dc8dc5b', package_version: r === 'B2' ? '@getpaseo/plugin@0.12.0' : 'FS unchanged source at base', route: r, test_command: 'npm test', execution_scope: level === 'SOURCE_REVIEWED' ? 'pinned source inspection' : 'in-memory native / isolated sandbox', result, grade: result === 'pass' ? 'PASS_MOCK_ONLY' : result === 'blocked' ? 'CONTRACT_BLOCKED' : result.toUpperCase(), hard_gap: gap, evidence_level: level, artifact_ref: 'P04-parity.json#' + id + '-' + r, observations });
const both = fn => async () => { for (const name of ['B2', 'C']) {
    const r = await route(name);
    try {
        await fn(r);
    }
    finally {
        await r.close();
    }
} };
test('CP01 genuine SDK runtime schemas and compiled provider', () => { assert.equal(PROVIDER_PROTOCOL_VERSION, 1); record('CP01', 'B2', 'pass', 'Actual published SDK imports; strict original TS compiled.', '', 'REAL_SDK_COMPILED'); record('CP01', 'C', 'not_run', 'Not an SDK plugin; FS tsc build passed.', null, 'SOURCE_REVIEWED'); });
test('CP02 official loader plus matched capability boundaries', both(async (r) => { if (r.name === 'B2') {
    assert.equal(loader.result, 'pass');
    assert.equal(r.registration.id, 'fs-external-native-mock');
    assert(!r.connection.capabilities.includes('prompt.steer'));
    await assert.rejects(r.registration.connect({ versions: [999], capabilities: [] }), /VERSION_UNSUPPORTED/);
    await r.connection.send({ type: 'catalog', requestId: 'catalog' });
    await r.connection.send({ type: 'sessions', requestId: 'sessions' });
    assert(r.events.some(e => e.type === 'sessions'));
    record('CP02', r.name, 'pass', 'Official loader lifecycle, protocol 1; incompatible version rejected.', null, 'REAL_SDK_LOADED_SANDBOX');
}
else {
    assert.equal(r.adapter.compatibility.profile, 'ADOPT_FULL');
    record('CP02', r.name, 'pass', 'Unchanged qualify classified the shared fixture ADOPT_FULL; mock missing-target probes only.');
} }));
test('CP03 no process/thread creation and mock Writer conservation', both(async (r) => { assert(accepted(await r.open())); assert.equal(r.native.processStarts, 0); assert.equal(r.native.writerCount, 1); assert(!r.native.calls.some(c => c.method === 'thread/start')); record('CP03', r.name, 'blocked', { processStarts: 0, writerCount: 1, tuiPid: r.native.proof.tuiPid, serverPid: r.native.proof.serverPid }, 'Fixture conservation only; real original-TUI binding and Writer custody NOT_MEASURED.'); }));
test('CP04 unmodified discovery in synthetic Windows', async () => { const legacy = await discover('legacy'); const modern = await discover('daemon'); assert.equal(legacy.result, 'pass'); assert.equal(modern.result, 'blocked'); assert(modern.reads.some(p => p.endsWith('app-server.pid'))); record('CP04', 'C', 'blocked', { legacy: legacy.result, daemon: modern.result, error: modern.error }, 'Product reads only legacy app-server.pid; modern daemon.pid not supported.'); record('CP04', 'B2', 'blocked', 'Provider receives an already supplied synthetic port.', 'No B2 Windows discovery implementation; layout not qualified.'); });
test('CP05 security evidence ceiling', both(async (r) => { assert(accepted(await r.open())); assert.equal(r.native.proof.serverBirth, r.native.expected.serverBirth); record('CP05', r.name, 'blocked', { incarnation: 'synthetic', principal: 'fixture-owner', acl: 'NOT_MEASURED', kernelPeer: 'NOT_MEASURED', TUI: 'NOT_MEASURED' }, 'No real Windows principal/ACL/kernel peer/PID measurement permitted in this run.'); }));
test('CP06 PID reuse, generation and workspace rejected before mock effect', async () => { for (const name of ['B2', 'C']) {
    const outcomes = [];
    for (const variation of ['serverPid', 'serverBirth', 'workspace']) {
        const r = await route(name);
        try {
            assert(accepted(await r.open()));
            if (variation === 'workspace') {
                r.native.thread.cwd += '-wrong';
                if (name === 'C')
                    r.setRoot(r.native.thread.cwd);
            }
            else
                r.native.proof[variation] = variation === 'serverPid' ? 909 : '999999';
            const receipt = await r.submit();
            assert(!submitted(receipt));
            assert.equal(r.native.attempts, 0);
            outcomes.push({ variation, code: code(receipt), attempts: 0 });
        }
        finally {
            await r.close();
        }
    }
    const stale = await discover('legacy', true);
    assert.equal(stale.result, 'blocked');
    record('CP06', name, 'pass', outcomes, 'ACL/owner mutation is SOURCE_ONLY; C metadata comparator also does not compare binary hash.');
} });
test('CP07 exact loaded binding and resume difference', async () => { for (const name of ['B2', 'C']) {
    const r = await route(name);
    try {
        assert(accepted(await r.open()));
        assert.equal(r.native.resumeCalls, name === 'C' ? 1 : 0);
        record('CP07', name, name === 'C' ? 'blocked' : 'pass', { exactThread: r.native.thread.id, resumeCalls: r.native.resumeCalls }, name === 'C' ? 'Attach calls thread/resume even for a loaded thread; fails the no-resume contract.' : null);
    }
    finally {
        await r.close();
    }
    const missing = await route(name, n => n.loaded = false);
    try {
        assert(!accepted(await missing.open()));
        assert.equal(missing.native.attempts, 0);
    }
    finally {
        await missing.close();
    }
} });
test('CP08 duplicate notification and cursor guarantees', both(async (r) => { await r.open(); const event = { eventId: fixture.shared.duplicate_event_id, method: 'item/agentMessage/delta', params: { threadId: r.native.thread.id, turnId: 'fixture-turn-original', itemId: 'fixture-delta-item', delta: 'fixture fragment' } }; r.native.emit(event); r.native.emit(event); const observed = r.events.filter(e => r.name === 'B2' ? e.type === 'timeline.item' : e.kind === 'message.delta').length; assert.equal(observed, r.name === 'B2' ? 1 : 2); record('CP08', r.name, 'blocked', { duplicateInputFrames: 2, projectedDeltas: observed, nativeCursor: 'not supplied' }, r.name === 'B2' ? 'Fixture-only event-ID dedupe, no replay cursor/order recovery; SDK item lacks native turn field.' : 'Mapper generates local event IDs; identical native frames project twice; local bus revision is not a native cursor.'); }));
test('CP09 injected model/env/MCP/permissions not accepted', both(async (r) => { if (r.name === 'B2') {
    const receipt = await r.open({ config: { ...openInput().config, model: 'injected-model', env: { SYNTHETIC: 'injected' }, mcpServers: { injected: { type: 'stdio', command: 'never-run' } }, settings: { approval: 'injected' } } });
    assert(!accepted(receipt));
}
else {
    await r.open();
    await assert.rejects(r.execute({ ...await r.command('native.submit'), model: 'injected-model', env: { SYNTHETIC: 'injected' } }), /NATIVE_COMMAND_INVALID/);
} assert.equal(r.native.attempts, 0); record('CP09', r.name, 'pass', 'Configuration injection refused before any mocked dispatch.'); }));
test('CP10 echoed-ID baseline completes exact native Turn ID', both(async (r) => { await r.open(); const receipt = await r.submit('fixture-command', fixture.shared.prompt); assert(submitted(receipt), JSON.stringify(receipt)); assert.equal(r.native.attempts, 1); assert.equal(r.native.turns[0].id, fixture.shared.turn_id); assert.equal(r.native.turns[0].status, 'completed'); if (r.name === 'B2')
    assert(receipt.some(e => e.type === 'session.turn' && e.state === 'completed' && e.turnId === fixture.shared.turn_id));
else {
    assert.equal(receipt.turnId, fixture.shared.turn_id);
    assert.equal((await r.adapter.snapshot()).threads[0].lastTurnStatus, 'completed');
} record('CP10', r.name, 'pass', { attempts: 1, nativeTurnId: fixture.shared.turn_id, status: 'completed', nativeEffects: 0 }); }));
test('CP11 same response without caller ID echo', async () => { for (const name of ['B2', 'C']) {
    const r = await route(name, n => n.echoClientId = false);
    try {
        await r.open();
        const receipt = await r.submit();
        assert.equal(r.native.attempts, 1);
        if (name === 'B2')
            assert(submitted(receipt));
        else
            assert.equal(receipt.status, 'AMBIGUOUS_EFFECT');
        record('CP11', name, name === 'B2' ? 'pass' : 'blocked', { receipt, attempts: 1, nativeCompleted: r.native.turns[0].status }, name === 'C' ? 'Own user item is classified external when caller ID is absent; completed turn becomes ambiguous and control closes.' : null);
    }
    finally {
        await r.close();
    }
} });
test('CP12 exact duplicate, changed payload and lost reply', async () => { for (const name of ['B2', 'C']) {
    const r = await route(name);
    try {
        await r.open();
        if (name === 'B2') {
            await r.submit('fixture-duplicate');
            await r.submit('fixture-duplicate');
            const conflict = await r.submit('fixture-duplicate', 'Different content');
            assert.equal(code(conflict), 'COMMAND_ID_CONFLICT');
        }
        else {
            const command = await r.command('native.submit', { commandId: 'fixture-duplicate' });
            await r.execute(command);
            await r.execute(command);
            await assert.rejects(r.execute({ ...command, text: 'Different content' }), /NATIVE_COMMAND_ID_CONFLICT/);
        }
        assert.equal(r.native.attempts, 1);
    }
    finally {
        await r.close();
    }
    const lost = await route(name, n => n.loseReply = true);
    try {
        await lost.open();
        let first, again;
        if (name === 'C') {
            const command = await lost.command('native.submit', { commandId: 'fixture-lost' });
            first = await lost.execute(command);
            again = await lost.execute(command);
        }
        else {
            first = await lost.submit('fixture-lost');
            again = await lost.submit('fixture-lost');
        }
        const fresh = await lost.submit('fixture-new');
        assert(!submitted(first));
        assert(!submitted(again));
        assert(!submitted(fresh));
        assert.equal(lost.native.attempts, 1);
        record('CP12', name, 'pass', { attempts: 1, duplicate: 'cached', changedPayload: 'rejected', lostReply: code(first), newID: code(fresh) }, 'Connection/runtime-scoped safety only; no production restart or cross-client durable dispatch ledger proved.');
    }
    finally {
        await lost.close();
    }
} });
test('CP13 stale expected turn disabled or rejected before send', both(async (r) => { await r.open(); r.native.thread.status.type = 'active'; r.native.turns[0].status = 'inProgress'; if (r.name === 'B2') {
    const receipt = await r.submit('fixture-stale', 'Synthetic ACK', 'steer');
    assert(!submitted(receipt));
    record('CP13', r.name, 'pass', { attempts: 0, advertised: false }, 'Public ProviderPrompt has no expected native Turn ID; pilot disables steer.');
}
else {
    const receipt = await r.execute(await r.command('native.steer', { activeTurnId: fixture.shared.expected_stale_turn }));
    assert.equal(receipt.status, 'REJECTED');
    record('CP13', r.name, 'pass', { attempts: 0, code: receipt.code });
} assert.equal(r.native.attempts, 0); }));
test('CP14 generic interrupt/approval cannot bypass exact target', both(async (r) => { await r.open(); if (r.name === 'B2') {
    await r.connection.send({ type: 'session.interrupt', requestId: 'interrupt', sessionId: 'fixture-session' });
    await r.connection.send({ type: 'session.permission', sessionId: 'fixture-session', permissionId: 'fixture-permission', response: { behavior: 'deny' } });
    assert(!r.connection.capabilities.includes('permission'));
}
else {
    const receipt = await r.execute(await r.command('native.interrupt'));
    assert.equal(receipt.status, 'REJECTED');
    const approval = await r.execute(await r.command('native.approval'));
    assert.equal(approval.status, 'REJECTED');
} assert.equal(r.native.attempts, 0); record('CP14', r.name, 'pass', 'Targetless controls rejected; zero mock effects.', r.name === 'B2' ? 'Generic interrupt has no expected native turn; permission disabled, no full exact-target UX.' : null); }));
test('CP15 observer close preserves fixture original processes', async () => { for (const name of ['B2', 'C']) {
    const r = await route(name);
    await r.open();
    const before = { ...r.native.proof };
    if (name === 'B2') {
        await r.connection.send({ type: 'session.close', requestId: 'close', sessionId: 'fixture-session' });
        await r.connection.close();
        const observer = await r.registration.connect({ versions: [1], capabilities: ['session.list'] });
        await observer.send({ type: 'sessions', requestId: 'reconnect' });
        await observer.close();
    }
    assert.equal(r.native.writerCount, 1);
    assert.deepEqual(r.native.proof, before);
    await r.close();
    assert.equal(r.native.processStarts, 0);
    const lost = await route(name, n => n.loseReply = true);
    await lost.open();
    assert(!submitted(await lost.submit('fixture-reconnect-command')));
    const backend = lost.native;
    await lost.close();
    // Simulate acceptance completing while its observer is disconnected.
    // The same in-memory backend survives; no TUI/server is started or resumed here.
    backend.loseReply = false;
    backend.thread.status.type = 'idle';
    backend.turns[0].status = 'completed';
    const fresh = await route(name, () => {}, backend);
    try {
        await fresh.open();
        const replay = await fresh.submit('fixture-reconnect-command');
        if (name === 'B2') assert(submitted(replay));
        assert.equal(backend.attempts, 2);
        record('CP15', name, 'blocked', { writerCount: 1, processStarts: 0, reconnectAfterUnknownAttempts: backend.attempts, replayReceipt: replay, officialB2Refresh: name === 'B2' ? loader.refresh : 'not applicable' }, 'Fresh provider connection / bare FS adapter forgets uncertain delivery and dispatches again. C detects correlation conflict only after that dispatch. Outer Hub durable admission is outside this adapter-only test; no native recovery cursor proved.');
    } finally { await fresh.close(); }
} });
test('CP16 unavailable endpoint and missing protocol method', async () => { for (const name of ['B2', 'C']) {
    const r = await route(name);
    try {
        r.native.proof.available = false;
        assert(!accepted(await r.open()));
        assert.equal(r.native.processStarts, 0);
        assert.equal(r.native.attempts, 0);
    }
    finally {
        await r.close();
    }
    const missing = await route(name, n => n.missing.add('turn/start'));
    try {
        const opened = await missing.open();
        if (name === 'C') {
            assert.notEqual(missing.adapter.compatibility.profile, 'ADOPT_FULL');
            assert(!accepted(opened));
        }
        else {
            await missing.submit();
            assert(!submitted(await missing.submit('fixture-second')));
        }
        assert.equal(missing.native.attempts, 0);
        record('CP16', name, 'pass', 'No daemon refused; missing turn/start never dispatches. No managed substitution.', name === 'B2' ? 'B2 discovers missing method on attempted mock submit and conservatively holds unknown; no preflight compatibility profile.' : null);
    }
    finally {
        await missing.close();
    }
} });
test('CP17 history explicitly deferred', () => { for (const name of ['B2', 'C'])
    record('CP17', name, 'not_run', 'G08 NOT_IMPLEMENTED / DEFERRED.', 'Neither plugin timeline nor 12-turn/48-message cache is complete durable history.', 'SOURCE_REVIEWED'); });
test('CP18 actual public control schema boundary', () => { const parsed = ProviderInputSchema.safeParse({ type: 'session.prompt', sessionId: 'fixture-session', prompt: { clientMessageId: 'fixture-id', delivery: 'steer', expectedTurnId: 'fixture-turn', input: { type: 'message', content: [{ type: 'text', text: 'Synthetic' }] } } }); assert.equal(parsed.success, false); for (const name of ['B2', 'C'])
    record('CP18', name, name === 'B2' ? 'blocked' : 'pass', name === 'B2' ? 'PUBLIC_B2: narrow message/list/persistence works. CUSTOM_RPC_B2 or UPSTREAM_B3 needed for full targeted controls.' : 'FS_C already carries activeTurnId/fence; native compatibility corrections still required.', name === 'B2' ? 'Unsupported extra expectedTurnId rejected by actual strict schema; cannot repair core callers with provider alone.' : null, 'SOURCE_REVIEWED'); });
after(async () => { await mkdir(artifact, { recursive: true }); assert.equal(records.length, fixture.cases.length * 2); const report = { schema: 'fleetsplice.parity.results.v1', fixtureSHA256: createHash('sha256').update(JSON.stringify(fixture)).digest('hex'), native_connections: 0, native_effects: 0, product_route: 'NOT_SELECTED', records }; await writeFile(path.join(artifact, 'P04-parity.json'), JSON.stringify(report, null, 2) + '\n'); });
