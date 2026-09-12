import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { Duplex } from 'node:stream';
import WebSocket from 'ws';
import { Fault, requireThat } from '../contracts/json.ts';
import type { NativeArtifactIdentity } from './types.ts';

export type NativeMessage = { id?: string | number; method?: string; params?: any; result?: any; error?: { code: number; message: string } };
export interface NativeRpc { call(method: string, params: unknown): Promise<any>; respond?(id: string | number, result: unknown): Promise<void>; onEvent: (message: NativeMessage) => void; onClose: () => void; close(): void; }
export class NativeRpcError extends Error { constructor(readonly code: number, message: string) { super(message); } }

// Codex's official proxy owns AF_UNIX portability. These bytes are the native
// WebSocket protocol, with no Fleet listener, relay framing or TUI launch.
class ProxySocket extends Duplex {
  connecting = false;
  constructor(private readonly proxy: ChildProcessWithoutNullStreams) {
    super();
    proxy.stdout.on('data', chunk => { if (!this.push(chunk)) proxy.stdout.pause(); });
    proxy.stdout.on('end', () => this.push(null));
    proxy.stdin.on('error', error => this.destroy(error));
    proxy.on('error', error => this.destroy(error));
  }
  override _read() { this.proxy.stdout.resume(); }
  override _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) { this.proxy.stdin.write(chunk, encoding, callback); }
  override _final(callback: (error?: Error | null) => void) { this.proxy.stdin.end(callback); }
  override _destroy(error: Error | null, callback: (error: Error | null) => void) { this.proxy.stdin.end(); callback(error); }
  setTimeout() { return this; } setNoDelay() { return this; } setKeepAlive() { return this; }
}
export class OfficialNativeRpc implements NativeRpc {
  onEvent: NativeRpc['onEvent'] = () => {};
  onClose = () => {};
  private sequence = 0;
  private pending = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();
  private constructor(private readonly ws: WebSocket, private readonly transport: ProxySocket) {
    ws.on('message', (bytes, binary) => {
      try {
        requireThat(!binary, 'NATIVE_BINARY_MESSAGE_REJECTED');
        const message = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes as Buffer)) as NativeMessage;
        if (message.method) this.onEvent(message);
        else if (typeof message.id === 'string') {
          const pending = this.pending.get(message.id); if (!pending) return;
          clearTimeout(pending.timer); this.pending.delete(message.id);
          if (message.error) pending.reject(new NativeRpcError(message.error.code, message.error.message)); else pending.resolve(message.result);
        } else throw new Fault('NATIVE_MESSAGE_INVALID');
      } catch { this.close(); }
    });
    const lost = () => { for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Fault('NATIVE_RESPONSE_UNKNOWN')); } this.pending.clear(); this.onClose(); };
    ws.on('close', lost); ws.on('error', lost); transport.on('error', lost);
  }
  static async connect(identity: NativeArtifactIdentity): Promise<OfficialNativeRpc> {
    requireThat(identity.executablePath, 'NATIVE_EXECUTABLE_UNOBSERVABLE');
    const proxy = spawn(identity.executablePath, ['app-server', 'proxy', '--sock', identity.endpoint], { stdio: 'pipe', windowsHide: true });
    proxy.stderr.resume(); // Do not persist native global diagnostics or credentials.
    const transport = new ProxySocket(proxy);
    const ws = new WebSocket('ws://localhost/', { createConnection: () => transport as any,
      perMessageDeflate: false, maxPayload: 4 * 1024 * 1024, handshakeTimeout: 8000,
      finishRequest: request => { request.on('socket', socket => setImmediate(() => socket.emit('connect'))); request.end(); } });
    const rpc = new OfficialNativeRpc(ws, transport);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { rpc.close(); reject(new Fault('NATIVE_CONNECT_TIMEOUT')); }, 8500);
      ws.once('open', () => { clearTimeout(timer); resolve(); });
      ws.once('error', () => { clearTimeout(timer); reject(new Fault('NATIVE_CONNECT_FAILED')); });
    });
    return rpc;
  }
  call(method: string, params: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState !== WebSocket.OPEN) { reject(new Fault('NATIVE_DISCONNECTED')); return; }
      const id = `fleet-adoption-${++this.sequence}`;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Fault('NATIVE_RESPONSE_UNKNOWN')); this.close(); }, 12000);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }), error => { if (error) { clearTimeout(timer); this.pending.delete(id); reject(new Fault('NATIVE_RESPONSE_UNKNOWN')); this.close(); } });
    });
  }
  initialized() { this.ws.send(JSON.stringify({ method: 'initialized' })); }
  respond(id: string | number, result: unknown): Promise<void> {
    requireThat(this.ws.readyState === WebSocket.OPEN, 'NATIVE_DISCONNECTED');
    return new Promise((resolve, reject) => this.ws.send(JSON.stringify({ id, result }), error => {
      if (error) reject(new Fault('NATIVE_APPROVAL_OUTCOME_UNKNOWN')); else resolve();
    }));
  }
  close() { this.ws.terminate(); this.transport.destroy(); } // Only the client connection closes.
}
