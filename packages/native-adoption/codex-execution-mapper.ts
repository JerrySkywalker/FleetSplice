import { randomUUID } from 'node:crypto';
import type { AgentExecutionEvent, ObservationTrustLevel } from '../contracts/realtime-streams.ts';
import type { NativeMessage } from './transport.ts';

export const CODEX_AGENT_RUNTIME_ADAPTER_ID = 'codex-app-server';

const TRUST: ObservationTrustLevel = 'NATIVE_STRUCTURED_API';

export type CodexMapContext = {
  sessionKey: string;
  revision: string;
  observedAt?: string;
  eventId?: string;
};

function envelope(ctx: CodexMapContext, threadId: string | null, turnId: string | null) {
  return {
    eventId: ctx.eventId ?? randomUUID(),
    revision: ctx.revision,
    observedAt: ctx.observedAt ?? new Date().toISOString(),
    sessionKey: ctx.sessionKey,
    threadId,
    turnId,
  };
}

function ids(params: any): { threadId: string | null; turnId: string | null } {
  const threadId = typeof (params?.threadId ?? params?.thread?.id) === 'string' ? (params.threadId ?? params.thread.id) : null;
  const turnId = typeof (params?.turnId ?? params?.turn?.id) === 'string' ? (params.turnId ?? params.turn.id) : null;
  return { threadId, turnId };
}

function textFromAgentItem(item: any): string | null {
  if (typeof item?.text === 'string') return item.text.slice(0, 24000);
  if (Array.isArray(item?.content)) {
    const text = item.content.filter((part: any) => part?.type === 'text' && typeof part.text === 'string').map((part: any) => part.text).join('\n');
    return text ? text.slice(0, 24000) : null;
  }
  return null;
}

function toolStatus(status: unknown): 'started' | 'updated' | 'completed' | 'failed' | null {
  if (status === 'inProgress' || status === 'running') return 'updated';
  if (status === 'completed') return 'completed';
  if (status === 'failed' || status === 'declined') return 'failed';
  return null;
}

/**
 * Map one Codex app-server structured notification into a provider-neutral
 * AgentExecutionEvent. Provider RPC method names stay only in adapterEvidence.
 * Returns null when the notification is irrelevant to execution projection.
 * Never parses terminal stdout/ANSI.
 */
export function mapCodexNotification(message: NativeMessage, ctx: CodexMapContext): AgentExecutionEvent | null {
  const method = message.method;
  if (!method) return null;
  const params = message.params ?? {};
  const { threadId, turnId } = ids(params);
  const base = () => ({ ...envelope(ctx, threadId, turnId), stream: 'agent.execution' as const, trustLevel: TRUST,
    adapterEvidence: { provider: CODEX_AGENT_RUNTIME_ADAPTER_ID, method } });

  if (method === 'turn/started') {
    return { ...base(), kind: 'turn.started', payload: { status: 'RUNNING' } };
  }
  if (method === 'turn/completed') {
    const status = params.turn?.status;
    const kind = status === 'interrupted' ? 'turn.interrupted' : status === 'failed' ? 'turn.failed' : 'turn.completed';
    return { ...base(), kind, payload: { status: typeof status === 'string' ? status : 'completed' } };
  }
  if (method === 'item/agentMessage/delta' && typeof params.delta === 'string') {
    return { ...base(), kind: 'message.delta', payload: { role: 'assistant', text: params.delta.slice(0, 24000),
      itemId: typeof params.itemId === 'string' ? params.itemId : null } };
  }
  if (method === 'item/started' && params.item?.type === 'agentMessage') {
    const text = textFromAgentItem(params.item);
    return { ...base(), kind: 'message.delta', payload: { role: 'assistant', text: text ?? '', itemId: params.item.id ?? null, phase: 'started' } };
  }
  if (method === 'item/completed' && params.item?.type === 'agentMessage') {
    const text = textFromAgentItem(params.item);
    return { ...base(), kind: 'message.final', payload: { role: 'assistant', text: text ?? '', itemId: params.item.id ?? null } };
  }
  if (method === 'item/completed' && params.item?.type === 'userMessage') {
    const text = textFromAgentItem(params.item);
    return { ...base(), kind: 'message.final', payload: { role: 'user', text: text ?? '', itemId: params.item.id ?? null } };
  }
  if ((method === 'item/started' || method === 'item/completed') && params.item?.type === 'commandExecution' && typeof params.item.id === 'string') {
    const mapped = method === 'item/started' ? 'started' : toolStatus(params.item.status) ?? (method === 'item/completed' ? 'completed' : null);
    if (!mapped) return { ...base(), kind: 'unsupported', payload: { reason: 'commandExecution status unmapped' } };
    const kind = mapped === 'started' ? 'tool.started' : mapped === 'updated' ? 'tool.updated' : mapped === 'failed' ? 'tool.failed' : 'tool.completed';
    return { ...base(), kind, payload: {
      toolId: params.item.id,
      text: String(params.item.command ?? 'Native command').slice(0, 1000),
      status: String(params.item.status ?? mapped),
    } };
  }
  if (method === 'thread/settings/updated' || method === 'thread/status/changed') {
    const model = typeof params.thread?.model === 'string' ? params.thread.model
      : typeof params.model === 'string' ? params.model : null;
    const permission = typeof params.thread?.permission === 'string' ? params.thread.permission
      : typeof params.permission === 'string' ? params.permission : null;
    if (model !== null) return { ...base(), kind: 'model.observed', payload: { model } };
    if (permission !== null) return { ...base(), kind: 'permission.observed', payload: { permission } };
    return { ...base(), kind: 'session.observed', payload: { reason: method === 'thread/settings/updated' ? 'settings' : 'status' } };
  }
  if (method === 'item/commandExecution/requestApproval') {
    return { ...base(), kind: 'approval.requested', payload: {
      requestId: message.id ?? null,
      itemId: typeof params.itemId === 'string' ? params.itemId : null,
      summary: typeof params.command === 'string' ? params.command.slice(0, 1000) : 'approval requested',
    } };
  }
  if (typeof method === 'string' && (method.startsWith('turn/') || method.startsWith('item/') || method.startsWith('thread/'))) {
    return { ...base(), kind: 'unsupported', payload: { reason: 'provider event not mapped to semantic execution' } };
  }
  return null;
}
