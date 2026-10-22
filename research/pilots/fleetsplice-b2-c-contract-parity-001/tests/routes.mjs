// SPDX-License-Identifier: MIT
import { randomUUID } from 'node:crypto';
import { NativeAdoptionAdapter } from '../../../../dist/packages/native-adoption/adapter.js';
import { NativeRpcError } from '../../../../dist/packages/native-adoption/transport.js';
import { NativeActivityJournal } from '../../../../dist/packages/native-adoption/activity-journal.js';
import { Journal } from '../../../../dist/packages/journal/index.js';
import { createProvider } from '../dist/provider.js';
import { MockNative, workspace } from '../dist/native.js';
export const openInput = (changes = {}) => ({ type: 'session.open', requestId: 'open', sessionId: 'fixture-session', history: 'skip', persistence: { version: 1, data: { nativeThread: 'fixture-thread-1' } }, config: { cwd: workspace, env: {}, mcpServers: {}, settings: {}, persist: true }, ...changes });
export async function route(name, configure = () => { }, native = new MockNative()) {
    // Reopening this flag is an in-memory observer operation; no server/process exists.
    native.closed = false;
    configure(native);
    const events = [];
    if (name === 'B2') {
        const registration = createProvider(native);
        const connection = await registration.connect({ versions: [1], capabilities: ['prompt.message', 'prompt.steer', 'session.persistence', 'session.list', 'session.configure', 'permission'] });
        connection.onEvent(e => events.push(e));
        return { name, native, events, connection, registration, async open(changes) { const start = events.length; await connection.send(openInput(changes)); return events.slice(start); }, async submit(id = 'fixture-command', text = 'Synthetic ACK', delivery = 'auto') { const start = events.length; await connection.send({ type: 'session.prompt', sessionId: 'fixture-session', prompt: { clientMessageId: id, delivery, input: { type: 'message', content: [{ type: 'text', text }] } } }); return events.slice(start); }, close: () => connection.close() };
    }
    native.rpcError = (code, message) => new NativeRpcError(code, message);
    const identity = () => ({ executablePath: native.proof.executable, reportedVersion: 'codex-cli 0.163.0 (fixture)', sha256: native.proof.hash, processId: native.proof.serverPid, processCreationTime: native.proof.serverBirth, endpoint: native.proof.endpoint, endpointIdentity: 'fixture-endpoint-birth', serverIncarnation: null, custody: 'CODEX_MANAGED_DAEMON' });
    const journal = new Journal(':memory:');
    const evidence = [];
    let root = workspace;
    const adapter = new NativeAdoptionAdapter(identity(), native, workspace, 'fixture-root', () => { if (!native.proof.available)
        throw Error('NO_SHARED_DAEMON'); return identity(); }, () => ({ root, rootIdentity: 'fixture-root' }), { append: (kind, key, value) => evidence.push({ kind, key, value }) }, new NativeActivityJournal(journal));
    await adapter.qualify();
    adapter.subscribeRealtime(e => events.push(e));
    const client = { clientInstanceId: 'fixture-client', sessionBinding: 'fixture-binding', grantId: 'fixture-grant', grantRevision: '1', expiresAt: Date.now() + 600000 };
    const command = async (family, changes = {}) => { const s = await adapter.snapshot(); const t = s.threads[0]; return { commandId: randomUUID(), runtimeId: s.runtimeId, clientInstanceId: client.clientInstanceId, expectedFence: s.fence, incarnation: s.incarnation, threadId: native.thread.id, stateToken: t?.stateToken ?? '', activeTurnId: t?.activeTurnId ?? null, family, text: 'Synthetic ACK', ...changes }; };
    const execute = c => adapter.execute(c, client);
    return { name, native, events, evidence, adapter, journal, command, execute, setRoot: value => root = value, async open(changes = {}) { return execute(await command('native.attach', changes)); }, async submit(id = 'fixture-command', text = 'Synthetic ACK') { return execute(await command('native.submit', { commandId: id, text })); }, async close() { adapter.close(); journal.close(); } };
}
export const accepted = value => Array.isArray(value) ? value.some(e => e.type === 'session.ready') : value.status === 'SUCCEEDED';
export const submitted = value => Array.isArray(value) ? value.some(e => e.type === 'session.prompt_result' && e.result.type === 'turn') : value.status === 'SUCCEEDED';
export const code = value => Array.isArray(value) ? value.findLast(e => e.type === 'request.failed' || e.type === 'session.prompt_result')?.error?.code ?? value.findLast(e => e.type === 'session.prompt_result')?.result?.error?.code : value.code;
