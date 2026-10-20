// SPDX-License-Identifier: MIT
import type { PluginServerContribution } from '@getpaseo/plugin/server';
import { PROVIDER_PROTOCOL_VERSION, negotiateProviderCapabilities, ProviderInputSchema, ProviderEventSchema, type ProviderRegistration, type ProviderConnection, type ProviderEvent, type ProviderInput } from '@getpaseo/plugin/server/provider';
import { MockNative, workspace } from './native.js';
export const providerId = 'fs-external-native-mock';
export function createProvider(native: MockNative): ProviderRegistration {
    return { id: providerId, label: 'FS contract pilot (MOCK ONLY)', async connect(request) {
            if (!request.versions.includes(PROVIDER_PROTOCOL_VERSION))
                throw Error('PROVIDER_VERSION_UNSUPPORTED');
            const listeners = new Set<(event: ProviderEvent) => void>();
            const sessions = new Set<string>();
            const results = new Map<string, ProviderEvent>();
            const digests = new Map<string, string>();
            const seenEvents = new Set<string>();
            let unknown = false, closed = false;
            const capabilities = negotiateProviderCapabilities(request.capabilities, ['session.list', 'session.persistence', 'prompt.message']);
            const emit = (event: ProviderEvent) => { ProviderEventSchema.parse(event); for (const listener of listeners)
                listener(event); };
            const unsubscribe = native.subscribe(event => {
                const key = event.eventId as string | undefined;
                if (key && seenEvents.has(key))
                    return;
                if (key)
                    seenEvents.add(key);
                if (event.params?.threadId !== native.thread.id)
                    return;
                if (event.method === 'item/agentMessage/delta')
                    for (const sessionId of sessions)
                        emit({ type: 'timeline.item', sessionId, item: { id: event.params.itemId, type: 'assistant_message', text: event.params.delta } });
            });
            const failure = (input: ProviderInput, error: unknown) => {
                const detail = { code: String(error instanceof Error ? error.message : error), message: String(error instanceof Error ? error.message : error) };
                if (input.type === 'session.prompt')
                    emit({ type: 'session.prompt_result', sessionId: input.sessionId, clientMessageId: input.prompt.clientMessageId, result: { type: 'failed', error: detail } });
                else if ('requestId' in input)
                    emit({ type: 'request.failed', requestId: input.requestId, error: detail });
            };
            const connection: ProviderConnection = { version: PROVIDER_PROTOCOL_VERSION, capabilities, onEvent(listener) { listeners.add(listener); return () => listeners.delete(listener); }, async close() { closed = true; sessions.clear(); unsubscribe(); listeners.clear(); }, async send(raw) {
                    const input = ProviderInputSchema.parse(raw);
                    try {
                        if (closed)
                            throw Error('OBSERVER_CLOSED');
                        native.assertIdentity();
                        if (input.type === 'catalog') {
                            emit({ type: 'catalog', requestId: input.requestId, catalog: { models: [{ id: 'fixture-model', label: 'Mock model' }], modes: [], thinkingOptions: [] } });
                            return;
                        }
                        if (input.type === 'sessions') {
                            emit({ type: 'sessions', requestId: input.requestId, sessions: native.loaded ? [{ persistence: { version: 1, data: { nativeThread: native.thread.id } }, cwd: native.thread.cwd, title: 'Synthetic existing TUI' }] : [] });
                            return;
                        }
                        if (input.type === 'session.open') {
                            const p = input.persistence?.data as {
                                nativeThread?: string;
                            } | undefined;
                            if (!native.loaded || p?.nativeThread !== native.thread.id || input.config.cwd !== workspace || native.thread.cwd !== workspace)
                                throw Error('EXACT_LOADED_THREAD_REQUIRED');
                            if (Object.keys(input.config.env).length || Object.keys(input.config.mcpServers).length || Object.keys(input.config.settings).length || input.config.model || input.config.mode || input.config.thinkingOption || input.config.systemPrompt || input.config.toolPolicy || input.config.providerOptions)
                                throw Error('ADOPTED_CONFIG_INJECTION');
                            await native.call('thread/read', { threadId: native.thread.id, includeTurns: false });
                            sessions.add(input.sessionId);
                            emit({ type: 'session.opened', requestId: input.requestId, sessionId: input.sessionId, cwd: workspace, restoration: 'core', capabilities, persistence: input.persistence });
                            emit({ type: 'session.ready', requestId: input.requestId, sessionId: input.sessionId });
                            return;
                        }
                        if (input.type === 'session.close') {
                            sessions.delete(input.sessionId);
                            emit({ type: 'session.closed', sessionId: input.sessionId });
                            return;
                        }
                        if (input.type === 'session.interrupt' || input.type === 'session.permission' || input.type === 'session.configure')
                            throw Error('EXACT_TARGET_OR_CONFIG_UNSUPPORTED');
                        if (input.type !== 'session.prompt')
                            throw Error('CAPABILITY_UNSUPPORTED');
                        if (!sessions.has(input.sessionId))
                            throw Error('SESSION_NOT_OPEN');
                        const key = input.prompt.clientMessageId;
                        const digest = JSON.stringify(input);
                        const previous = results.get(key);
                        if (previous) {
                            if (digests.get(key) !== digest)
                                throw Error('COMMAND_ID_CONFLICT');
                            emit(previous);
                            return;
                        }
                        if (unknown)
                            throw Error('AMBIGUOUS_NO_REPLAY');
                        if (!native.loaded || native.thread.cwd !== workspace)
                            throw Error('EXACT_LOADED_THREAD_REQUIRED');
                        if (input.prompt.delivery === 'steer')
                            throw Error('EXPECTED_TURN_NOT_IN_PUBLIC_INPUT');
                        if (input.prompt.outputSchema || input.prompt.clearPendingPermissions)
                            throw Error('ADOPTED_CONFIG_INJECTION');
                        if (native.thread.status.type !== 'idle' || !native.thread.canAcceptDirectInput)
                            throw Error('NATIVE_NOT_IDLE_DIRECT_INPUT');
                        if (input.prompt.input.type !== 'message' || input.prompt.input.content.some(x => x.type !== 'text'))
                            throw Error('UNSUPPORTED_INPUT');
                        const text = input.prompt.input.content.map(x => 'text' in x ? x.text : '').join('\n');
                        // Research-only in-memory attempt ledger. NOT a durable production dedupe claim.
                        const pending: ProviderEvent = { type: 'session.prompt_result', sessionId: input.sessionId, clientMessageId: key, result: { type: 'failed', error: { code: 'DELIVERY_UNKNOWN', message: 'Mock delivery unresolved' } } };
                        results.set(key, pending);
                        digests.set(key, digest);
                        let response: any;
                        try {
                            response = await native.call('turn/start', { threadId: native.thread.id, clientUserMessageId: key, input: [{ type: 'text', text }] });
                        }
                        catch (error) {
                            unknown = true;
                            emit(pending);
                            return;
                        }
                        const turnId = response.turn?.id;
                        let page: any;
                        try {
                            if (typeof turnId !== 'string')
                                throw Error('NATIVE_TURN_ID_UNPROVABLE');
                            page = await native.call('thread/items/list', { threadId: native.thread.id, turnId });
                            if (page.nextCursor || page.data.filter((x: any) => x.type === 'userMessage').length !== 1)
                                throw Error('EXACT_TURN_ITEMS_UNPROVABLE');
                        }
                        catch {
                            unknown = true;
                            emit(pending);
                            return;
                        }
                        const result: ProviderEvent = { type: 'session.prompt_result', sessionId: input.sessionId, clientMessageId: key, result: { type: 'turn', turnId } };
                        results.set(key, result);
                        // Client ID is a local submission association, never an alleged native echoed item ID.
                        emit({ type: 'timeline.item', sessionId: input.sessionId, item: { type: 'user_message', id: page.data[0].id, text, clientMessageId: key } });
                        emit(result);
                        emit({ type: 'session.turn', sessionId: input.sessionId, turnId, state: 'started' });
                        if (response.turn.status === 'completed')
                            emit({ type: 'session.turn', sessionId: input.sessionId, turnId, state: 'completed' });
                    }
                    catch (error) {
                        failure(input, error);
                    }
                } };
            return connection;
        } };
}
export function contribution(native: MockNative): PluginServerContribution {
    return server => { server.registerProvider(createProvider(native)); return () => { }; };
}
