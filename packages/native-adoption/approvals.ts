import { createHash } from 'node:crypto';
import { canonical, requireThat } from '../contracts/json.ts';
import type { NativeMessage } from './transport.ts';

export type ApprovalIdentity = { requestId: string | number; threadId: string; turnId: string; itemId: string; requestType: string; digest: string };
export type ApprovalView = ApprovalIdentity & { summary: string; workspace: string; status: 'PENDING' | 'SENDING' | 'RESOLVED' | 'STALE' | 'UNKNOWN'; supported: boolean };
type Entry = { view: ApprovalView; allow: unknown; deny: unknown; settled?: () => void };
const requestId = (x: unknown): x is string | number => typeof x === 'string' ? x.length > 0 && x.length <= 200 : Number.isSafeInteger(x);
const nativeId = (x: unknown): x is string => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,200}$/.test(x);
const key = (x: string | number) => canonical(x);

/** Connection-local requests only. Never restore pending authority from a journal. */
export class NativeApprovals {
  private entries = new Map<string, Entry>();
  observe(message: NativeMessage, workspace: string): boolean {
    if (message.id === undefined) return false;
    const p = message.params;
    requireThat(requestId(message.id) && nativeId(p?.threadId) && nativeId(p?.turnId) && nativeId(p?.itemId), 'NATIVE_REQUEST_IDENTITY_UNPROVABLE');
    let allow: unknown = null, deny: unknown = null;
    if (message.method === 'item/commandExecution/requestApproval' && (p.kind === undefined || p.kind === 'command') &&
      !p.networkApprovalContext && (p.cwd == null || p.cwd.toLowerCase() === workspace.toLowerCase())) {
      // A supplied native decision list is authoritative, including absence of decline.
      const decisions = p.availableDecisions ?? ['accept', 'decline', 'cancel'];
      if (Array.isArray(decisions) && decisions.includes('accept')) allow = { decision: 'accept' };
      if (Array.isArray(decisions) && decisions.includes('decline')) deny = { decision: 'decline' };
      else if (Array.isArray(decisions) && decisions.includes('cancel')) deny = { decision: 'cancel' };
    } else if (message.method === 'item/fileChange/requestApproval' && !p.grantRoot) {
      allow = { decision: 'accept' }; deny = { decision: 'decline' };
    }
    // Permission grants are turn/session scoped, not Allow Once. Unknown request
    // classes, managed-network prompts and persistent grants stay unavailable.
    const digest = createHash('sha256').update(canonical({ id: message.id, method: message.method, params: p })).digest('hex');
    const previous = this.entries.get(key(message.id));
    if (previous) { requireThat(previous.view.digest === digest, 'NATIVE_REQUEST_ID_REUSED'); return previous.view.supported; }
    requireThat(this.entries.size < 128, 'NATIVE_APPROVAL_BOUND_EXCEEDED');
    const supported = allow !== null && deny !== null;
    this.entries.set(key(message.id), { view: { requestId: message.id, threadId: p.threadId, turnId: p.turnId, itemId: p.itemId,
      requestType: message.method!, digest, summary: String(p.command ?? p.reason ?? 'Native request').slice(0, 1000), workspace,
      status: 'PENDING', supported }, allow, deny });
    return supported;
  }
  resolved(threadId: string, id: unknown): void {
    if (!requestId(id)) return;
    const entry = this.entries.get(key(id));
    if (!entry || entry.view.threadId !== threadId) return;
    entry.view.status = 'RESOLVED'; entry.settled?.();
  }
  invalidate(threadId: string, turnId?: string): void {
    for (const entry of this.entries.values()) if (entry.view.threadId === threadId && (!turnId || entry.view.turnId === turnId) &&
      ['PENDING', 'SENDING'].includes(entry.view.status)) { entry.view.status = 'STALE'; entry.settled?.(); }
  }
  views(): ApprovalView[] { return [...this.entries.values()].map(e => structuredClone(e.view)); }
  exact(identity: ApprovalIdentity): Entry {
    requireThat(identity && requestId(identity.requestId), 'STALE_NATIVE_REQUEST');
    const entry = this.entries.get(key(identity.requestId));
    requireThat(entry && ['requestId','threadId','turnId','itemId','requestType','digest'].every(k =>
      (entry.view as any)[k] === (identity as any)[k]), 'STALE_NATIVE_REQUEST');
    requireThat(entry.view.status !== 'RESOLVED', 'NATIVE_APPROVAL_ALREADY_RESOLVED');
    requireThat(entry.view.status === 'PENDING', 'STALE_NATIVE_REQUEST');
    requireThat(entry.view.supported, 'APPROVAL_UNAVAILABLE');
    return entry;
  }
  async respond(identity: ApprovalIdentity, decision: 'ALLOW_ONCE' | 'DENY', send: (id: string | number, result: unknown) => Promise<void>): Promise<void> {
    const entry = this.exact(identity);
    requireThat(decision === 'ALLOW_ONCE' || decision === 'DENY', 'NATIVE_APPROVAL_DECISION_INVALID');
    entry.view.status = 'SENDING';
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settled = new Promise<void>(resolve => { entry.settled = resolve; timer = setTimeout(resolve, 12000); });
    try {
      await send(identity.requestId, decision === 'ALLOW_ONCE' ? entry.allow : entry.deny);
      await settled;
      requireThat(entry.view.status as string === 'RESOLVED', 'NATIVE_APPROVAL_OUTCOME_UNKNOWN');
    } catch (error) { entry.view.status = 'UNKNOWN'; throw error; }
    finally { clearTimeout(timer); delete entry.settled; }
  }
}
