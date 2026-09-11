import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { Fault, requireThat, type NativeCapabilityCatalog, type NativeSessionConfiguration } from '../contracts/index.ts';
import { assertPolicyUnchanged, integrationPolicy, NATIVE_POLICY_ARGS, NATIVE_POLICY_ENV } from './policy.ts';
import type { NativePermissionEvidence, PermissionPreset } from '../contracts/index.ts';
import { observePermission, permissionCapabilities, permissionRequest, turnPermission } from './permissions.ts';
export type SessionRequest = { model: string; reasoningEffort: string; permission?: PermissionPreset };
export type SessionResult = { threadId: string; model: string; provider: string; reasoningEffort: string; permission: NativePermissionEvidence };

export const CODEX_SHA256 = '444a3f0008050605cae73cd9b7a2dcac61294062dfaab56dd20430fd6498518b';
export type NativeSignal = { method: string; params: Record<string, any>; requestId?: string | number };
export interface NativePort {
  instanceId: string; pid: number | null; signals: EventEmitter;
  start(beforeEffect: () => void): Promise<void>;
  capabilities(requestId: string, beforeEffect: () => void, root?: string): Promise<NativeCapabilityCatalog>;
  create(requestId: string, root: string, configuration: SessionRequest, beforeEffect: () => void): Promise<SessionResult>;
  turn(requestId: string, threadId: string, root: string, text: string, beforeEffect: () => void): Promise<string>;
  close(): Promise<boolean>;
}

// `model/list` is the native catalog authority. Deliberately project only the
// fields P1 needs; no model IDs or reasoning values live in FleetSplice source.
export function capabilityCatalog(response: any): NativeCapabilityCatalog {
  const data = response?.data;
  requireThat(Array.isArray(data) && data.length <= 128, 'NATIVE_CAPABILITIES_UNQUALIFIED');
  const seen = new Set<string>();
  const models = data.map((item: any) => {
    requireThat(item && typeof item === 'object' && !Array.isArray(item), 'NATIVE_CAPABILITIES_UNQUALIFIED');
    requireThat(typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 200 && !seen.has(item.id), 'NATIVE_CAPABILITIES_UNQUALIFIED');
    seen.add(item.id);
    requireThat(typeof item.displayName === 'string' && item.displayName.length > 0 && item.displayName.length <= 300 && typeof item.isDefault === 'boolean', 'NATIVE_CAPABILITIES_UNQUALIFIED');
    requireThat(typeof item.defaultReasoningEffort === 'string' && item.defaultReasoningEffort.length > 0 && item.defaultReasoningEffort.length <= 64 && Array.isArray(item.supportedReasoningEfforts) && item.supportedReasoningEfforts.length <= 32, 'NATIVE_CAPABILITIES_UNQUALIFIED');
    const reasoningSeen = new Set<string>();
    const supportedReasoningEfforts = item.supportedReasoningEfforts.map((choice: any) => {
      requireThat(choice && typeof choice === 'object' && !Array.isArray(choice) && typeof choice.reasoningEffort === 'string' && choice.reasoningEffort.length > 0 && choice.reasoningEffort.length <= 64 && !reasoningSeen.has(choice.reasoningEffort) && typeof choice.description === 'string' && choice.description.length <= 500, 'NATIVE_CAPABILITIES_UNQUALIFIED');
      reasoningSeen.add(choice.reasoningEffort);
      return { reasoningEffort: choice.reasoningEffort, description: choice.description };
    });
    requireThat(reasoningSeen.has(item.defaultReasoningEffort), 'NATIVE_CAPABILITIES_UNQUALIFIED');
    return { id: item.id, displayName: item.displayName, isDefault: item.isDefault, supportedReasoningEfforts, defaultReasoningEffort: item.defaultReasoningEffort };
  });
  return { models };
}
export async function completeCapabilityCatalog(readPage: (cursor?: string) => Promise<any>): Promise<NativeCapabilityCatalog> {
  const data: any[] = []; const seen = new Set<string>(); let cursor: string | undefined;
  for (let pageNumber = 0; pageNumber < 128; pageNumber++) {
    const page = await readPage(cursor);
    capabilityCatalog(page);
    data.push(...page.data);
    requireThat(data.length <= 128, 'NATIVE_CAPABILITIES_UNQUALIFIED');
    if (page.nextCursor === null) return capabilityCatalog({ data });
    requireThat(typeof page.nextCursor === 'string' && page.nextCursor.length > 0 && page.nextCursor.length <= 4096 && !seen.has(page.nextCursor), 'NATIVE_CAPABILITIES_INCOMPLETE');
    seen.add(page.nextCursor); cursor = page.nextCursor;
  }
  throw new Fault('NATIVE_CAPABILITIES_INCOMPLETE');
}
export class CodexDriver implements NativePort {
  readonly instanceId = randomUUID();
  readonly signals = new EventEmitter();
  pid: number | null = null;
  private process: ChildProcessWithoutNullStreams | null = null;
  private pending = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();
  private buffer = '';
  private closed = false;
  private failed = false;
  private policy: ReturnType<typeof integrationPolicy> | null = null;
  private workspacePolicies = new Map<string, ReturnType<typeof integrationPolicy>>();
  private threadRoots = new Map<string, string>();
  private threadPermissions = new Map<string, NativePermissionEvidence>();
  constructor(private executable: string, private root: string) {}
  async start(beforeEffect: () => void): Promise<void> {
    requireThat(typeof beforeEffect === 'function', 'NATIVE_EFFECT_GATE_REQUIRED');
    requireThat(!this.process, 'NATIVE_ALREADY_STARTED');
    requireThat(createHash('sha256').update(readFileSync(this.executable)).digest('hex') === CODEX_SHA256, 'NATIVE_ARTIFACT_CHANGED');
    // Plugin/hooks switches apply before app-server startup. MCP starts at thread
    // creation; explicit per-server disables are supplied there after config/read.
    // Empty TOML tables merge and do NOT erase inherited entries in this pin.
    beforeEffect();
    const child = spawn(this.executable, [...NATIVE_POLICY_ARGS, 'app-server', '--stdio'], { cwd: this.root, env: { ...process.env, ...NATIVE_POLICY_ENV }, stdio: 'pipe', windowsHide: true });
    this.process = child; this.pid = child.pid ?? null;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      if (this.failed) return;
      this.buffer += chunk;
      if (Buffer.byteLength(this.buffer) > 1048576) { this.fail('NATIVE_OUTPUT_OVERFLOW'); return; }
      while (this.buffer.includes('\n')) {
        const split = this.buffer.indexOf('\n'); const line = this.buffer.slice(0, split); this.buffer = this.buffer.slice(split + 1);
        try { this.receive(JSON.parse(line)); } catch { this.fail('NATIVE_PROTOCOL_INVALID'); }
      }
    });
    child.stderr.on('data', () => { /* Native stderr can contain local configuration: never project or log it. */ });
    child.on('error', () => this.fail('NATIVE_PROCESS_ERROR'));
    child.on('exit', () => { this.closed = true; this.fail('NATIVE_EXIT'); });
    await this.rpc(randomUUID(), 'initialize', { clientInfo: { name: 'fleetsplice', title: 'FleetSplice G05', version: '0.1.0' }, capabilities: { experimentalApi: false } });
    this.write({ method: 'initialized', params: {} });
    this.policy = await this.readPolicy();
  }
  private async readPolicy(root = this.root): Promise<ReturnType<typeof integrationPolicy>> {
    const policy = integrationPolicy(await this.rpc(randomUUID(), 'config/read', { cwd: root, includeLayers: false }), root);
    const previous = root === this.root ? this.policy : this.workspacePolicies.get(root);
    assertPolicyUnchanged(previous, policy);
    this.workspacePolicies.set(root, policy);
    return policy;
  }
  private fail(code: string): void {
    this.failed = true; this.buffer = '';
    for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Fault(code)); }
    this.pending.clear(); this.signals.emit('fault', code);
  }
  private receive(message: any): void {
    if (message.method) {
      if (message.method === 'remoteControl/status/changed' && message.params?.status !== 'disabled') { this.fail('NATIVE_REMOTE_CONTROL_ENABLED'); return; }
      // Unsupported requests remain pending. Never send an approval or tool result.
      this.signals.emit('signal', { method: message.method, params: message.params ?? {}, ...(message.id !== undefined ? { requestId: message.id } : {}) } satisfies NativeSignal);
    } else if (message.id !== undefined) {
      const item = this.pending.get(String(message.id));
      if (!item) { this.fail('UNEXPECTED_NATIVE_RESPONSE'); return; }
      clearTimeout(item.timer); this.pending.delete(String(message.id));
      if (message.error) item.reject(new Fault('NATIVE_REQUEST_REJECTED'));
      else item.resolve(message.result);
    }
  }
  private write(value: unknown): void {
    requireThat(this.process?.stdin.writable && !this.closed && !this.failed, 'NATIVE_DISCONNECTED');
    requireThat(this.process.stdin.writableLength < 262144, 'NATIVE_BACKPRESSURE');
    this.process.stdin.write(JSON.stringify(value) + '\n');
  }
  private rpc(id: string, method: string, params: unknown, beforeEffect?: () => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Fault('NATIVE_RESPONSE_UNKNOWN')); }, 45000);
      this.pending.set(id, { resolve, reject, timer });
      try { beforeEffect?.(); this.write({ id, method, params }); } catch (error) { clearTimeout(timer); this.pending.delete(id); reject(error); }
    });
  }
  private async permissions(root: string, beforeEffect: () => void) {
    const data: any[] = []; const seen = new Set<string>(); let cursor: string | undefined;
    for (let page = 0; page < 128; page++) {
      const result = await this.rpc(randomUUID(), 'permissionProfile/list', { cwd: root, ...(cursor ? { cursor } : {}) }, beforeEffect);
      requireThat(Array.isArray(result?.data) && data.length + result.data.length <= 128, 'NATIVE_PERMISSION_CAPABILITIES_INVALID');
      data.push(...result.data);
      if (result.nextCursor === null || result.nextCursor === undefined) return permissionCapabilities(data);
      requireThat(typeof result.nextCursor === 'string' && result.nextCursor.length > 0 && result.nextCursor.length <= 4096 && !seen.has(result.nextCursor), 'NATIVE_PERMISSION_CAPABILITIES_INVALID');
      seen.add(result.nextCursor); cursor = result.nextCursor;
    }
    throw new Fault('NATIVE_PERMISSION_CAPABILITIES_INVALID');
  }
  async capabilities(requestId: string, beforeEffect: () => void, root = this.root): Promise<NativeCapabilityCatalog> {
    requireThat(typeof beforeEffect === 'function', 'NATIVE_EFFECT_GATE_REQUIRED');
    await this.readPolicy(root);
    let first = true;
    const catalog = await completeCapabilityCatalog(async cursor => {
      const id = first ? requestId : randomUUID(); first = false;
      return this.rpc(id, 'model/list', cursor ? { cursor } : {}, beforeEffect);
    });
    return { ...catalog, permissions: await this.permissions(root, beforeEffect) };
  }
  async create(requestId: string, root: string, configuration: SessionRequest, beforeEffect: () => void): Promise<SessionResult> {
    requireThat(typeof beforeEffect === 'function', 'NATIVE_EFFECT_GATE_REQUIRED');
    requireThat(typeof configuration?.model === 'string' && configuration.model.length > 0 && configuration.model.length <= 200 && typeof configuration.reasoningEffort === 'string' && configuration.reasoningEffort.length > 0 && configuration.reasoningEffort.length <= 64, 'NATIVE_CONFIGURATION_INVALID');
    const policy = await this.readPolicy(root);
    const preset = configuration.permission ?? 'READ_ONLY';
    requireThat(preset === 'READ_ONLY' || policy.activeTrust === 'trusted', 'NATIVE_WORKSPACE_TRUST_REQUIRED');
    requireThat((await this.permissions(root, beforeEffect)).some(item => item.preset === preset && item.allowed), 'STALE_PERMISSION_SELECTION');
    const permission = permissionRequest(preset);
    // The installed app-server schema exposes `thread/start.model` and the
    // typed config key `model_reasoning_effort`; the response supplies the
    // observed model/reasoning pair used below as effective evidence.
    const result = await this.rpc(requestId, 'thread/start', { cwd: root, model: configuration.model, config: { ...policy.overrides, ...permission.config, model_reasoning_effort: configuration.reasoningEffort }, ephemeral: true, approvalPolicy: permission.approvalPolicy, approvalsReviewer: 'user', sandbox: permission.sandbox, serviceName: 'fleetsplice-g05c-p2b', developerInstructions: preset === 'READ_ONLY' ? 'Inspect the explicit workspace using native read-only tools. Do not modify files, run write-capable commands, change configuration, browse the network, request approval, or use paths outside the native read-only sandbox.' : 'Use native coding tools only for the explicit Owner task. Do not access secrets, change system security or services, use network, or modify unrelated files. No subagents, remote transport or external integrations. This instruction limits task intent; actual effective sandbox authority is shown separately.' }, beforeEffect);
    requireThat(result.thread?.ephemeral === true && result.cwd?.toLowerCase() === root.toLowerCase(), 'NATIVE_POLICY_UNQUALIFIED');
    const observedPermission = observePermission(preset, result);
    requireThat(result.approvalsReviewer === 'user', 'NATIVE_PERMISSION_UNOBSERVED');
    await this.readPolicy(root);
    requireThat(typeof result.thread.id === 'string' && result.thread.id.length < 200, 'NATIVE_ID_UNKNOWN');
    requireThat(result.model === configuration.model && result.reasoningEffort === configuration.reasoningEffort && typeof result.modelProvider === 'string' && result.modelProvider.length > 0, 'NATIVE_CONFIGURATION_UNOBSERVED');
    requireThat(!this.threadRoots.has(result.thread.id), 'NATIVE_THREAD_CONFLICT');
    this.threadRoots.set(result.thread.id, root);
    this.threadPermissions.set(result.thread.id, observedPermission);
    return { threadId: result.thread.id, model: result.model, provider: result.modelProvider, reasoningEffort: result.reasoningEffort, permission: observedPermission };
  }
  async turn(requestId: string, threadId: string, root: string, text: string, beforeEffect: () => void): Promise<string> {
    requireThat(typeof beforeEffect === 'function', 'NATIVE_EFFECT_GATE_REQUIRED');
    requireThat(this.threadRoots.get(threadId) === root, 'NATIVE_ROOT_CHANGED');
    await this.readPolicy(root);
    const permission = this.threadPermissions.get(threadId); requireThat(permission, 'NATIVE_PERMISSION_UNOBSERVED');
    requireThat((await this.permissions(root, beforeEffect)).some(item => item.preset === permission.preset && item.allowed), 'STALE_PERMISSION_SELECTION');
    const result = await this.rpc(requestId, 'turn/start', { threadId, cwd: root, input: [{ type: 'text', text }], approvalPolicy: permission.approvalPolicy, sandboxPolicy: turnPermission(permission) }, beforeEffect);
    requireThat(typeof result.turn?.id === 'string' && result.turn.id.length < 200, 'NATIVE_ID_UNKNOWN');
    return result.turn.id;
  }
  async close(): Promise<boolean> {
    if (!this.process) return true;
    if (this.closed) return false;
    const child = this.process;
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(false), 15000);
      child.once('exit', code => { clearTimeout(timer); resolve(code === 0); });
      child.stdin.end();
    });
  }
}
