// SPDX-License-Identifier: MIT
// Official PluginRuntime/worker/context; synthetic app-session wire, never a daemon.
import { mkdir, copyFile, writeFile, symlink } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import pino from 'pino';
import { PluginRuntime } from '../.runtime/official-plugin-runtime.mjs';
import { WSOutboundMessageSchema } from '@getpaseo/protocol/messages';
import { workspace } from '../dist/native.js';
const artifact = path.resolve(process.env.PILOT_ARTIFACT_DIR ?? 'results');
const stage = path.join(artifact, 'loader-plugin');
await mkdir(path.join(stage, 'server'), { recursive: true });
await symlink(path.resolve('node_modules'), path.join(stage, 'node_modules'), 'junction').catch(e => { if (e.code !== 'EEXIST')
    throw e; });
for (const file of ['provider.ts', 'native.ts'])
    await copyFile(path.resolve('src', file), path.join(stage, 'server', file));
await copyFile('paseo-plugin.json', path.join(stage, 'paseo-plugin.json'));
await writeFile(path.join(stage, 'index.server.ts'), "import {contribution} from './server/provider'; import {MockNative} from './server/native'; export default function setup(server) { return contribution(new MockNative())(server); }\n");
const frames = [];
const sockets = new Set();
const host = { async attachPluginSocket(id, socket) {
        sockets.add(socket);
        let resolve;
        const closed = new Promise(r => resolve = r);
        socket.on('close', () => { sockets.delete(socket); resolve(); });
        socket.on('message', data => {
            const frame = JSON.parse(String(data));
            frames.push(frame.type);
            if (frame.type === 'hello') {
                const response = { type: 'session', message: { type: 'status', payload: { status: 'server_info', serverId: 'fixture-paseo-host', protocolVersion: 1 } } };
                WSOutboundMessageSchema.parse(response);
                socket.send(JSON.stringify(response));
            }
            else if (frame.type === 'ping')
                socket.send(JSON.stringify({ type: 'pong' }));
        });
        return { closed };
    } };
const runtime = new PluginRuntime(pino({ level: 'silent' }), '0.12.0', { sessionHost: host, settingsDirectory: path.join(artifact, 'settings') });
const id = 'fs-contract-parity-pilot';
const events = [];
let result;
try {
    await runtime.startBuiltinPlugin({ id, directory: stage });
    assert.equal(runtime.getProviderRegistrations(id)[0].id, 'fs-external-native-mock');
    const connect = () => runtime.connectProvider(id, 'fs-external-native-mock', { versions: [1], capabilities: ['prompt.message', 'session.list', 'session.persistence', 'prompt.steer'] });
    const c = await connect();
    c.onEvent(event => events.push(event));
    await c.send({ type: 'catalog', requestId: 'catalog' });
    await c.send({ type: 'sessions', requestId: 'list' });
    await c.send({ type: 'session.open', requestId: 'open', sessionId: 'fixture-session', history: 'skip', persistence: { version: 1, data: { nativeThread: 'fixture-thread-1' } }, config: { cwd: workspace, env: {}, mcpServers: {}, settings: {}, persist: true } });
    await c.send({ type: 'session.prompt', sessionId: 'fixture-session', prompt: { clientMessageId: 'fixture-command-1', delivery: 'auto', input: { type: 'message', content: [{ type: 'text', text: 'Synthetic ACK only' }] } } });
    await c.send({ type: 'session.close', requestId: 'close', sessionId: 'fixture-session' });
    await c.close();
    const c2 = await connect();
    await c2.close();
    assert(events.some(e => e.type === 'session.turn' && e.state === 'completed' && e.turnId === 'fixture-native-turn-1'));
    await runtime.stopPluginById(id);
    await runtime.startBuiltinPlugin({ id, directory: stage });
    await runtime.stopPluginById(id);
    result = { result: 'pass', evidence_level: 'REAL_SDK_LOADED_SANDBOX', loader: 'official PluginRuntime.startBuiltinPlugin; official InternalPluginChild/createPluginWorker/PluginServerContext', app_session_host: 'synthetic validated in-memory wire', directory_subprocess_install: 'NOT_RUN', native_transport: 'in-memory MockNative', native_connections: 0, native_effects: 0, events, frames, refresh: true };
}
catch (error) {
    result = { result: 'blocked', evidence_level: 'REAL_SDK_COMPILED', error: String(error), logs: runtime.getLogs(id) };
    process.exitCode = 1;
}
finally {
    await runtime.stopAll();
    for (const socket of sockets)
        socket.close();
}
await mkdir(artifact, { recursive: true });
await writeFile(path.join(artifact, 'P02-loader.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, events: result.events?.map(e => e.type) }, null, 2));
