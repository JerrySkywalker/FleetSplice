// SPDX-License-Identifier: MIT
// In-memory only. No process, filesystem, socket or model execution capability.
export type Proof = {
    serverPid: number;
    serverBirth: string;
    tuiPid: number;
    tuiBirth: string;
    executable: string;
    hash: string;
    principal: string;
    owner: string;
    peerPid: number;
    aclPrivate: boolean;
    endpoint: string;
    layout: 'legacy' | 'daemon';
    available: boolean;
};
export const workspace = 'C:\\synthetic-fleetsplice-pilot\\workspace';
export const proof: Proof = { serverPid: 202, serverBirth: '2020001', tuiPid: 101, tuiBirth: '1010001', executable: 'C:\\synthetic-fleetsplice-pilot\\codex.exe', hash: 'b'.repeat(64), principal: 'fixture-owner', owner: 'fixture-owner', peerPid: 202, aclPrivate: true, endpoint: 'C:\\synthetic-fleetsplice-pilot\\control.sock', layout: 'legacy', available: true };
export class MockNative {
    proof = { ...proof };
    expected = { ...proof };
    calls: {
        method: string;
        params: any;
    }[] = [];
    attempts = 0;
    resumeCalls = 0;
    writerCount = 1;
    processStarts = 0;
    closed = false;
    echoClientId = true;
    loseReply = false;
    loaded = true;
    missing = new Set<string>();
    thread: any = { id: 'fixture-thread-1', cwd: workspace, status: { type: 'idle' }, model: 'fixture-model', canAcceptDirectInput: true, ephemeral: false, threadSource: 'user' };
    turns: any[] = [{ id: 'fixture-turn-original', status: 'completed', startedAt: 123, completedAt: 124, items: [{ id: 'fixture-user-original', type: 'userMessage', content: [{ type: 'text', text: 'Synthetic original input' }] }, { id: 'fixture-answer-original', type: 'agentMessage', text: 'Synthetic original answer' }] }];
    onEvent: (event: any) => void = () => { };
    onClose: () => void = () => { };
    listeners = new Set<(event: any) => void>();
    rpcError: (code: number, message: string) => Error = (code, message) => Object.assign(new Error(message), { code });
    assertIdentity() {
        if (!this.proof.available)
            throw Error('NO_SHARED_DAEMON');
        for (const key of ['serverPid', 'serverBirth', 'tuiPid', 'tuiBirth', 'executable', 'hash', 'principal', 'owner', 'peerPid', 'endpoint'] as const)
            if (this.proof[key] !== this.expected[key])
                throw Error('IDENTITY_' + key);
        if (!this.proof.aclPrivate)
            throw Error('IDENTITY_ACL');
    }
    subscribe(listener: (event: any) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
    emit(event: any) { this.onEvent(structuredClone(event)); for (const listener of this.listeners)
        listener(structuredClone(event)); }
    close() { this.closed = true; this.onClose(); }
    async call(method: string, params: any): Promise<any> {
        this.calls.push({ method, params: structuredClone(params) });
        if (this.missing.has(method))
            throw this.rpcError(-32601, 'Method not found');
        if (method === 'thread/list')
            return { data: [structuredClone(this.thread)], nextCursor: null };
        if (method === 'thread/loaded/list')
            return { data: this.loaded ? [this.thread.id] : [], nextCursor: null };
        if (method === 'model/list') {
            this.emit({ method: 'remoteControl/status/changed', params: { status: 'disabled' } });
            return { data: [] };
        }
        if (params.threadId !== this.thread.id)
            throw this.rpcError(-32600, 'thread not found');
        if (method === 'thread/read')
            return { thread: structuredClone(this.thread) };
        if (method === 'thread/turns/list')
            return { data: structuredClone(this.turns.slice(0, params.limit ?? 12)), nextCursor: null };
        if (method === 'thread/items/list')
            return { data: structuredClone(this.turns.find(t => t.id === params.turnId)?.items ?? []), nextCursor: null };
        if (method === 'thread/resume') {
            this.resumeCalls++;
            return { thread: structuredClone(this.thread), approvalPolicy: 'never', sandbox: { type: 'dangerFullAccess' } };
        }
        if (method === 'turn/start') {
            this.attempts++;
            const turn = { id: `fixture-native-turn-${this.attempts}`, status: 'inProgress', startedAt: 125, completedAt: null as number | null, items: [{ id: `fixture-native-item-${this.attempts}`, type: 'userMessage', content: params.input, ...(this.echoClientId ? { clientId: params.clientUserMessageId } : {}) }] as any[] };
            this.turns.unshift(turn);
            this.thread.status.type = 'active';
            this.emit({ method: 'turn/started', params: { threadId: this.thread.id, turn: structuredClone(turn) } });
            if (this.loseReply)
                throw Error('MOCK_RESPONSE_LOST_AFTER_ACCEPTANCE');
            turn.items.push({ id: `fixture-native-answer-${this.attempts}`, type: 'agentMessage', text: 'MOCK_ACK' });
            turn.status = 'completed';
            turn.completedAt = 126;
            this.thread.status.type = 'idle';
            this.emit({ method: 'turn/completed', params: { threadId: this.thread.id, turn: structuredClone(turn) } });
            return { turn: structuredClone(turn) };
        }
        if (method === 'turn/steer') {
            if (params.expectedTurnId !== this.turns[0]?.id)
                throw this.rpcError(-32600, 'stale turn');
            this.attempts++;
            return { turnId: this.turns[0].id };
        }
        if (method === 'turn/interrupt') {
            if (params.turnId !== this.turns[0]?.id)
                throw this.rpcError(-32600, 'stale turn');
            this.attempts++;
            return {};
        }
        throw this.rpcError(-32601, 'Method not found');
    }
}
