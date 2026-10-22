import { Button } from '../../packages/ui/components/button.tsx';
import { InputGroup, InputGroupTextarea, InputGroupAddon } from '../../packages/ui/components/input-group.tsx';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AdoptionCommand, AdoptionReceipt, AdoptionSnapshot, NativeTurn } from '../../packages/native-adoption/types.ts';
import type { TimelinePresentationItem } from '../../packages/contracts/realtime-timeline.ts';
import { foldTimeline, retireLiveWhenAuthoritative } from '../../packages/contracts/realtime-timeline.ts';
import type { Locale } from './i18n.ts';
import {
  advancePresentation,
  correlateProvisional,
  createProvisional,
  markOutcomeUnknown,
  type PresentationCommandState,
  type ProvisionalMessage,
} from './optimistic-command.ts';
import {
  controlSurfaceMode,
  observationSeverity,
  permissionPresentation,
  residualSeverity,
} from './control-safety-ux.ts';
import { LocalLoopTimer } from '../../packages/contracts/local-loop-timing.ts';
import { AuthoritativeReconcileScheduler, type ReconcileReason } from './reconcile-scheduler.ts';
import { classifyRealtimeRefresh, shouldUpdateLiveTimeline } from './realtime-refresh-policy.ts';
import { AppShell } from './components/AppShell.tsx';
import { SessionConfigBar } from './components/SessionConfigBar.tsx';
import { SessionNavigation, SessionQuickSwitcher } from './components/SessionNavigation.tsx';
import { readNavigationPreference, saveNavigationPreference, sessionTitle } from './layout/session-navigation.ts';
import {
  ApprovalCard, OwnershipSurface, ReviewCard, SessionConnectPreview,
  ConversationMessage, ToolActivityCard,
} from './components/Presentation.tsx';
import { SemanticIcon } from './icons/semantic-icons.tsx';

type SnapshotCausalityRow = {
  snapshotSeq: number;
  reconcileReason: string;
  triggerEvent: string;
  commandId: string | null;
  turnId: string | null;
  controlRevision: string | null;
  coalescedOrExecuted: 'executed';
  notes: string;
  at: number;
  url: string;
};
type SessionProvisional = ProvisionalMessage & { threadId: string; incarnation: string; nativeTurnId: string | null; draftKey: string };
export function observedProvisional(provisional: SessionProvisional | null, thread: AdoptionSnapshot['threads'][number] | undefined, incarnation: string | undefined, clientId: string) {
  // A steer acknowledgment identifies an existing Turn, not the new input
  // item. Earlier identical input is not proof that this steer was observed.
  return !!provisional && provisional.family === 'native.submit' && !!thread && provisional.threadId === thread.id && provisional.incarnation === incarnation && !!provisional.nativeTurnId &&
    correlateProvisional(provisional, thread.history.filter(item => item.turnId === provisional.nativeTurnId), clientId);
}

type SnapshotAuditSurface = {
  networkSnapshots: SnapshotCausalityRow[];
  sseTriggers: Array<{ at: number; stream: string; kind: string; eventId: string; revision: string; turnId: string | null; decision: string }>;
  scheduler: () => ReturnType<AuthoritativeReconcileScheduler['audit']> | null;
};

declare global {
  interface Window {
    __FLEETSPLICE_SNAPSHOT_AUDIT__?: SnapshotAuditSurface;
  }
}

function TurnStatus({ turn, locale, live }: { turn: NativeTurn; locale: Locale; live: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (turn.state !== 'RUNNING' || !live) return; setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer);
  }, [turn.id, turn.state, live]);
  const zh = locale === 'zh-CN';
  const duration = turn.state === 'RUNNING' ? (turn.startedAt === null || !live ? null : Math.max(0, now - turn.startedAt * 1000)) : turn.durationMs;
  const seconds = duration === null ? null : Math.floor(duration / 1000);
  const formatted = seconds === null ? null : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const label = { RUNNING: zh ? '正在工作' : 'Working', COMPLETED: zh ? '完成' : 'Done', INTERRUPTED: zh ? '轮次已中断' : 'Turn interrupted', FAILED: zh ? '失败' : 'Failed' }[turn.state];
  return <span className="native-turn-status turn-status-chip" data-turn-id={turn.id} data-turn-state={turn.state}><span>{label}</span>{formatted ? ` · ${turn.state === 'RUNNING' ? '' : zh ? '工作用时 ' : 'Worked for '}${formatted}` : ` · ${zh ? '计时不可用' : 'Timing unavailable'}`}</span>;
}

const presentationLabel = (state: PresentationCommandState, zh: boolean) => ({
  LOCAL_PENDING: zh ? '本地待发送' : 'Local pending',
  NATIVE_ACCEPTED: zh ? '已接受（权威待观察）' : 'Accepted (awaiting observation)',
  OBSERVED: zh ? '已观察' : 'Observed',
  OUTCOME_UNKNOWN: zh ? '结果未知' : 'Outcome unknown',
  REJECTED: zh ? '已拒绝' : 'Rejected',
  AMBIGUOUS_EFFECT: zh ? '效果不明' : 'Ambiguous effect',
}[state]);

export function NativeAdoption({ client, request, locale, preferences, fleet }: {
  client: { clientInstanceId: string; expiresAt: number }; request: (url: string, body?: unknown) => Promise<any>;
  locale: Locale; preferences: React.ReactNode; fleet?: React.ReactNode;
}) {
  const t = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const [snapshot, setSnapshot] = useState<AdoptionSnapshot | null>(null);
  const [selected, setSelected] = useState('');
  const [recentSessions, setRecentSessions] = useState<string[]>([]);
  const [navigationRevision, setNavigationRevision] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try { return JSON.parse(sessionStorage.getItem('fleetsplice.native.drafts') ?? '{}'); } catch { return {}; }
  });
  const [error, setError] = useState('');
  const [commandErrorThread, setCommandErrorThread] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<AdoptionCommand | null>(() => { try { return JSON.parse(sessionStorage.getItem('fleetsplice.native.pending') ?? 'null'); } catch { return null; } });
  const [provisional, setProvisional] = useState<SessionProvisional | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('fleetsplice.native.provisional') ?? 'null'); } catch { return null; }
  });
  const [liveTimeline, setLiveTimeline] = useState<TimelinePresentationItem[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const attentionRef = useRef<HTMLElement>(null);
  const readingPositions = useRef(new Map<string, { top: number; following: boolean }>());
  const followTail = useRef(true);
  const [following, setFollowing] = useState(true);
  const timerRef = useRef(new LocalLoopTimer());
  const schedulerRef = useRef<AuthoritativeReconcileScheduler | null>(null);
  const auditRef = useRef<SnapshotAuditSurface>({
    networkSnapshots: [],
    sseTriggers: [],
    scheduler: () => schedulerRef.current?.audit() ?? null,
  });
  const lastTriggerRef = useRef<{ event: string; revision: string | null; turnId: string | null }>({
    event: 'bootstrap', revision: null, turnId: null,
  });
  const observationRequest = useRef(0);
  const navigationScope = snapshot ? `${snapshot.incarnation}:${snapshot.workspace}` : '';
  useEffect(() => {
    if (!navigationScope) return;
    const preference = readNavigationPreference(navigationScope);
    setSelected(preference.selected); setRecentSessions(preference.recent);
  }, [navigationScope]);
  function selectSession(threadId: string) {
    const node = timelineRef.current;
    if (node) readingPositions.current.set(conversationKey, { top: node.scrollTop, following: node.scrollTop + node.clientHeight >= node.scrollHeight - 48 });
    setSelected(threadId);
    setNavigationRevision(revision => revision + 1);
    setRecentSessions(saveNavigationPreference(navigationScope, threadId, recentSessions).recent);
  }
  async function applySnapshot(discover = false, reasons: readonly ReconcileReason[] = ['manual']) {
    const requestId = ++observationRequest.current;
    const reason = reasons[0] ?? (discover ? 'manual' : 'manual');
    const trigger = lastTriggerRef.current;
    const params = new URLSearchParams();
    if (discover) params.set('discover', '1');
    params.set('reconcileReason', reason);
    params.set('reconcileReasons', reasons.join(','));
    if (trigger.event) params.set('triggerEvent', trigger.event);
    const url = `/api/native/snapshot?${params.toString()}`;
    try {
      const next = await request(url);
      if (requestId !== observationRequest.current) return;
      const row: SnapshotCausalityRow = {
        snapshotSeq: auditRef.current.networkSnapshots.length + 1,
        reconcileReason: reasons.join('+') || reason,
        triggerEvent: trigger.event,
        commandId: null,
        turnId: trigger.turnId,
        controlRevision: trigger.revision,
        coalescedOrExecuted: 'executed',
        notes: discover ? 'discover=1 bypass' : `scheduler_reasons=${reasons.join(',')}`,
        at: Date.now(),
        url,
      };
      auditRef.current.networkSnapshots.push(row);
      setSnapshot(next);
      // A successful authoritative read retires only an observation outage.
      // Command uncertainty still needs explicit receipt lookup and must stay.
      setError(current => ['RUNTIME_UNSHARED', 'EDGE_DISCONNECTED', 'NATIVE_OBSERVATION_LOST'].includes(current) ? '' : current);
      const history = (next.threads ?? []).flatMap((item: any) => (item.history ?? []).map((message: any) => ({ ...message, threadId: item.id })));
      const activity = (next.threads ?? []).flatMap((item: any) => (item.activity ?? []).map((tool: any) => ({ ...tool, threadId: item.id })));
      setLiveTimeline(current => retireLiveWhenAuthoritative(current, history, activity));
      setProvisional(current => {
        if (!current || !['native.submit', 'native.steer'].includes(current.family)) return current;
        const observed = observedProvisional(current, next.threads.find((item: any) => item.id === current.threadId), next.incarnation, client.clientInstanceId);
        if (!observed) return current;
        const advanced = { ...current, state: advancePresentation(current.state, { status: 'SUCCEEDED' }, true) as PresentationCommandState };
        if (advanced.state === 'OBSERVED') {
          sessionStorage.removeItem('fleetsplice.native.provisional');
          return null;
        }
        sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(advanced));
        return advanced;
      });
    }
    catch (e) { if (requestId === observationRequest.current) { setCommandErrorThread(null); setError(e instanceof Error ? e.message : 'NATIVE_OBSERVATION_LOST'); setSnapshot(old => old ? { ...old, state: 'NATIVE_OBSERVATION_LOST' } : old); } }
  }
  function refresh(discover = false) {
    const scheduler = schedulerRef.current;
    if (!scheduler) { void applySnapshot(discover, discover ? ['manual'] : ['manual']); return; }
    if (discover) {
      lastTriggerRef.current = { event: 'manual.discovery', revision: null, turnId: null };
      void applySnapshot(true, ['manual']);
      return;
    }
    lastTriggerRef.current = { event: 'manual.refresh', revision: null, turnId: null };
    scheduler.schedule('manual');
  }
  useEffect(() => {
    const scheduler = new AuthoritativeReconcileScheduler(reasons => applySnapshot(false, reasons), { debounceMs: 48 });
    schedulerRef.current = scheduler;
    window.__FLEETSPLICE_SNAPSHOT_AUDIT__ = auditRef.current;
    lastTriggerRef.current = { event: 'scheduler.initial', revision: null, turnId: null };
    scheduler.schedule('initial');
    let events: EventSource | undefined;
    const connect = () => {
      events?.close();
      events = new EventSource('/api/native/events');
      events.onmessage = (message) => {
        try {
          const receiveAt = performance.now();
          const envelope = JSON.parse(message.data) as {
            eventId: string; revision: string; stream: string; kind: string;
            threadId: string | null; turnId: string | null;
            semantic?: { role?: TimelinePresentationItem['role']; text?: string; toolId?: string; status?: string; itemId?: string | null };
          };
          const decision = classifyRealtimeRefresh(envelope);
          auditRef.current.sseTriggers.push({
            at: Date.now(), stream: envelope.stream, kind: envelope.kind, eventId: envelope.eventId,
            revision: envelope.revision, turnId: envelope.turnId,
            decision: decision.mode === 'schedule_reconcile' ? decision.reason : decision.mode,
          });
          if (shouldUpdateLiveTimeline(envelope)) {
            const item: TimelinePresentationItem = {
              eventId: envelope.eventId, revision: envelope.revision, kind: envelope.kind as TimelinePresentationItem['kind'],
              threadId: envelope.threadId, turnId: envelope.turnId, ephemeral: true,
              itemId: envelope.semantic?.itemId ?? envelope.semantic?.toolId ?? null,
              role: envelope.semantic?.role, text: envelope.semantic?.text, toolId: envelope.semantic?.toolId, status: envelope.semantic?.status,
            };
            timerRef.current.record('browser_receive_queue', receiveAt, performance.now());
            timerRef.current.markUnmeasured('browser_receive_render');
            setLiveTimeline(current => foldTimeline(current, item));
          }
          if (decision.mode === 'schedule_reconcile') {
            lastTriggerRef.current = {
              event: `${envelope.stream}:${envelope.kind}`,
              revision: envelope.revision,
              turnId: envelope.turnId,
            };
            scheduler.schedule(decision.reason);
          }
        } catch { /* Malformed SSE payloads are ignored; recovery remains via fallback/visibility. */ }
      };
      events.onerror = () => { /* Browser reconnects EventSource; retain slow fallback refresh. */ };
    };
    connect();
    const fallback = setInterval(() => {
      lastTriggerRef.current = { event: 'fallback.20s', revision: null, turnId: null };
      scheduler.schedule('fallback');
    }, 20_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        connect();
        lastTriggerRef.current = { event: 'visibilitychange', revision: null, turnId: null };
        scheduler.schedule('visibility');
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      events?.close();
      clearInterval(fallback);
      document.removeEventListener('visibilitychange', onVisible);
      scheduler.dispose();
      schedulerRef.current = null;
      if (window.__FLEETSPLICE_SNAPSHOT_AUDIT__ === auditRef.current) delete window.__FLEETSPLICE_SNAPSHOT_AUDIT__;
    };
  }, []);
  const thread = snapshot?.threads.find(item => item.id === selected) ?? snapshot?.threads[0];
  const draftKey = thread ? `${snapshot!.incarnation}:${thread.workspaceIdentity}:${thread.id}` : '';
  const conversationKey = draftKey;
  const text = drafts[draftKey] ?? '';
  function setDraft(key: string, value: string) {
    setDrafts(current => {
      const next = { ...current, [key]: value };
      if (!value) delete next[key];
      try { sessionStorage.setItem('fleetsplice.native.drafts', JSON.stringify(next)); } catch { /* Draft remains usable for this page. */ }
      return next;
    });
  }
  const controlled = snapshot?.controller === client.clientInstanceId;
  const interrupt = snapshot?.compatibility.capabilities.interrupt.available;
  const steer = snapshot?.compatibility.capabilities.steer.available;
  function persistProvisional(value: SessionProvisional | null) {
    setProvisional(value);
    if (value) sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(value));
    else sessionStorage.removeItem('fleetsplice.native.provisional');
  }
  function receiptObserved(receipt: AdoptionReceipt, submittedDraftKey?: string) {
    if (receipt.status !== 'AMBIGUOUS_EFFECT') { sessionStorage.removeItem('fleetsplice.native.pending'); setPending(null); }
    setCommandErrorThread(receipt.threadId);
    setError(receipt.status === 'SUCCEEDED' ? '' : `${receipt.status}: ${receipt.code}`);
    setProvisional(current => {
      if (!current || current.commandId !== receipt.commandId) return current;
      const correlated = { ...current, nativeTurnId: receipt.status === 'SUCCEEDED' ? receipt.turnId : current.nativeTurnId };
      const observed = observedProvisional(correlated, snapshot?.threads.find(item => item.id === current.threadId), snapshot?.incarnation, client.clientInstanceId);
      const state = advancePresentation(current.state, receipt, observed);
      if (state === 'OBSERVED') { sessionStorage.removeItem('fleetsplice.native.provisional'); return null; }
      const next = { ...correlated, state };
      sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(next));
      return next;
    });
    const completedDraft = submittedDraftKey ?? (provisional?.commandId === receipt.commandId ? provisional.draftKey : null);
    if (completedDraft && receipt.status === 'SUCCEEDED' && ['native.submit', 'native.steer'].includes(receipt.family)) setDraft(completedDraft, '');
  }
  async function command(family: AdoptionCommand['family'], approval?: AdoptionCommand['approval']) {
    if (!available || !snapshot || !thread) return;
    const value: AdoptionCommand = { commandId: crypto.randomUUID(), runtimeId: snapshot.runtimeId,
      incarnation: snapshot.incarnation, clientInstanceId: client.clientInstanceId, expectedFence: snapshot.fence,
      threadId: thread.id, stateToken: thread.stateToken, activeTurnId: thread.activeTurnId, family, text: ['native.submit', 'native.steer'].includes(family) ? text : '' };
    if (approval) value.approval = approval;
    setBusy(true); setError(''); setCommandErrorThread(value.threadId);
    if (family === 'native.submit' || family === 'native.steer') {
      timerRef.current.measure('local_echo', () => persistProvisional({ ...createProvisional(value.commandId, family, value.text),
        threadId: value.threadId, incarnation: value.incarnation, nativeTurnId: null, draftKey }));
    }
    try {
      sessionStorage.setItem('fleetsplice.native.pending', JSON.stringify(value)); setPending(value);
      const sendStarted = performance.now();
      const commandWindowStart = Date.now();
      const receipt = await timerRef.current.measureAsync('command_send', () => request('/api/native/commands', value));
      timerRef.current.record('receipt', sendStarted, performance.now());
      receiptObserved(receipt, ['native.submit', 'native.steer'].includes(family) ? draftKey : undefined);
      await timerRef.current.measureAsync('final_reconciliation', async () => {
        const scheduler = schedulerRef.current;
        if (scheduler) {
          lastTriggerRef.current = {
            event: 'command.receipt',
            revision: null,
            turnId: thread?.activeTurnId ?? null,
          };
          scheduler.schedule('command');
          await scheduler.whenIdle();
          for (const row of auditRef.current.networkSnapshots) {
            if (row.at >= commandWindowStart && row.commandId === null) row.commandId = receipt.commandId;
          }
        } else {
          await applySnapshot(false, ['command']);
        }
      });
    } catch (e) {
      setProvisional(current => {
        if (!current || current.commandId !== value.commandId) return current;
        const next = { ...current, state: markOutcomeUnknown(current.state) };
        sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(next));
        return next;
      });
      setError(`${t('Outcome unknown. Check the receipt; do not resend.', '结果未知。请查询回执，不要重发。')} ${e instanceof Error ? e.message : ''}`);
    }
    finally { setBusy(false); }
  }
  async function lookup() {
    const target = pending ?? provisional;
    if (!target || busy) return; setBusy(true);
    try {
      receiptObserved(await request(`/api/native/commands/${encodeURIComponent(target.commandId)}`));
      const scheduler = schedulerRef.current;
      if (scheduler) {
        lastTriggerRef.current = { event: 'command.lookup', revision: null, turnId: thread?.activeTurnId ?? null };
        scheduler.schedule('command');
        await scheduler.whenIdle();
      } else await applySnapshot(false, ['command']);
    }
    catch (e) { setCommandErrorThread(target.threadId); setError(e instanceof Error ? e.message : 'COMMAND_UNKNOWN_NO_REPLAY'); }
    finally { setBusy(false); }
  }
  const provisionalHere = !!provisional && provisional.threadId === thread?.id && provisional.incarnation === snapshot?.incarnation;
  const pendingHere = !!pending && pending.threadId === thread?.id && pending.incarnation === snapshot?.incarnation;
  const showProvisional = provisionalHere && provisional && provisional.state !== 'OBSERVED'
    && !observedProvisional(provisional, thread, snapshot?.incarnation, client.clientInstanceId);
  const outcomeUnknown = (provisionalHere && (provisional?.state === 'OUTCOME_UNKNOWN' || provisional?.state === 'AMBIGUOUS_EFFECT')) || (pendingHere && !!error && /Outcome unknown|结果未知|AMBIGUOUS_EFFECT/.test(error));
  const mode = controlSurfaceMode({
    attached: !!thread?.attached,
    controlled,
    externalAdvance: !!thread?.externalAdvance,
    activeTurn: !!thread?.activeTurnId,
    outcomeUnknown,
    viewer: !controlled,
  });
  const unresolvedProvisional = provisional?.state === 'OUTCOME_UNKNOWN' || provisional?.state === 'AMBIGUOUS_EFFECT';
  const available = snapshot?.state === 'READY' && snapshot.compatibility.profile === 'ADOPT_FULL' && !busy && !pending && !unresolvedProvisional && client.expiresAt > Date.now();
  const canControl = available && controlled && thread?.attached && !thread.externalAdvance;
  const sessionApprovals = snapshot?.approvals?.filter(approval => approval.threadId === thread?.id) ?? [];
  const observationUnavailable = !!snapshot && snapshot.state !== 'READY';
  const receiptTarget = pending ?? (unresolvedProvisional ? provisional : null);
  const otherPendingThread = receiptTarget && receiptTarget.threadId !== thread?.id && receiptTarget.incarnation === snapshot?.incarnation && snapshot?.threads.some(item => item.id === receiptTarget.threadId);
  const attentionCount = Number(!!receiptTarget) + Number(observationUnavailable && !receiptTarget) + Number(!!thread?.externalAdvance) + sessionApprovals.filter(approval => approval.status === 'PENDING' || approval.status === 'UNKNOWN').length;
  const permission = permissionPresentation(thread?.permission, locale === 'zh-CN');
  const liveMessages = liveTimeline.filter(item => item.threadId === thread?.id && (item.kind === 'message.delta' || item.kind === 'message.final'));
  const liveTools = liveTimeline.filter(item => item.threadId === thread?.id && item.kind.startsWith('tool.'));
  const turnIds = [...new Set([...(thread?.turns.map(turn => turn.id) ?? []), ...liveMessages.map(item => item.turnId).filter((id): id is string => !!id),
    ...(thread?.activity.map(item => item.turnId) ?? []), ...liveTools.map(item => item.turnId).filter((id): id is string => !!id)])];
  function conversationMessages(turnId: string) {
    const history = thread?.history.filter(message => message.turnId === turnId) ?? [];
    return [
      ...history.map((message, index) => <ConversationMessage key={message.itemId ? `${conversationKey}:${turnId}:${message.itemId}` : `${conversationKey}:${turnId}:observed:${index}`}
        role={message.role} text={message.text} itemId={message.itemId ?? undefined} source={message.source}
        label={message.role === 'user' ? t('You', '你') : 'Codex'} streamingLabel={t('Streaming', '生成中')} locale={locale} />),
      ...liveMessages.filter(item => item.turnId === turnId && !history.some(message => !!item.itemId && message.itemId === item.itemId))
        .map(item => <ConversationMessage key={item.itemId ? `${conversationKey}:${turnId}:${item.itemId}` : `${conversationKey}:${turnId}:live:${item.eventId}`}
          role={item.role === 'user' ? 'user' : 'assistant'} text={item.text ?? ''} itemId={item.itemId ?? undefined}
          liveKind={item.kind === 'message.delta' ? 'message.delta' : 'message.final'} label={item.role === 'user' ? t('You', '你') : 'Codex'}
          turnEnded={thread?.turns.some(turn => turn.id === turnId && turn.state !== 'RUNNING')}
          streamingLabel={t('Streaming', '生成中')} locale={locale} />),
    ];
  }
  const observedTools = [
    ...(thread?.activity ?? []).map(item => ({ itemId: item.id, toolId: item.id, turnId: item.turnId, text: item.text, status: item.status, ephemeral: false,
      kind: item.status === 'completed' ? 'tool.completed' as const : ['failed', 'declined'].includes(item.status) ? 'tool.failed' as const : 'tool.updated' as const })),
  ];
  const tools = [...observedTools.filter(item => !liveTools.some(live => live.turnId === item.turnId && (live.toolId ?? live.itemId) === item.toolId && !['completed', 'failed', 'declined'].includes(item.status))),
    ...liveTools.filter(item => !observedTools.some(tool => tool.toolId === (item.toolId ?? item.itemId) && tool.turnId === item.turnId && ['completed', 'failed', 'declined'].includes(tool.status)))];
  useLayoutEffect(() => {
    const node = timelineRef.current; if (!node) return;
    const saved = readingPositions.current.get(conversationKey);
    followTail.current = saved?.following ?? true; setFollowing(followTail.current);
    node.scrollTo({ top: saved?.top ?? node.scrollHeight, behavior: 'auto' });
  }, [conversationKey]);
  const liveToolRevision = liveTools.map(item => item.revision).join(',');
  useEffect(() => {
    const node = timelineRef.current;
    if (!node || !followTail.current) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'auto' });
  }, [conversationKey, thread?.history.length, thread?.history.at(-1)?.text.length, thread?.activity, liveToolRevision, liveMessages.at(-1)?.revision, showProvisional, provisional?.state]);
  const mutationHint = t(
    'Native Adoption shows observed effective configuration only. This runtime does not provide a structured model/reasoning/permission mutation API.',
    '原生会话仅显示已观察的有效配置。此运行时未提供结构化的模型/推理/权限变更接口。',
  );
  const threadShort = thread?.id ? (thread.id.length > 16 ? `${thread.id.slice(0, 12)}…` : thread.id) : '—';
  const connectDisabled = !available || !thread || (!!snapshot?.controller && !controlled);

  const ownership = <OwnershipSurface connected={!!thread?.attached} notConnectedLabel={t('Not connected', '未连接')} controlled={controlled}
            controllerLabel={t('You control this session', '你控制此会话')} viewerLabel={t('Read-only viewer', '只读查看者')}
            releaseLabel={t('Release', '释放')} acquireLabel={t('Acquire control', '获取控制权')}
            canRelease={available && controlled && !!thread?.attached} canAcquire={available && !!thread?.attached && !snapshot?.controller}
            onRelease={() => void command('native.release')} onAcquire={() => void command('native.attach')} />;

  return <AppShell
    brand={<div className="brand session-brand"><span className="mark">F</span><div><h1 title={thread ? sessionTitle(thread) : 'FleetSplice'}>{thread ? sessionTitle(thread) : 'FleetSplice'}</h1><span className="session-target" title={thread?.id}>Codex · {threadShort}</span></div></div>}
    headerActions={<><SessionQuickSwitcher threads={snapshot?.threads ?? []} selected={thread?.id ?? ''} onSelect={selectSession} locale={locale} recent={recentSessions} />
      {attentionCount > 0 && <Button variant="outline" type="button" className="icon-button attention-trigger" aria-label={t('Current session attention', '当前会话待处理')}
        onClick={() => { attentionRef.current?.focus(); attentionRef.current?.scrollIntoView({ block: 'nearest' }); }}><SemanticIcon intent="warning" size={16} /><span>{attentionCount}</span></Button>}{preferences}</>}
    navTitle={t('Sessions', '会话')}
    navigationSelection={`${thread?.id}:${navigationRevision}`}
    contextTitle={t('Session details', '会话详情')}
    navigation={<>
      <SessionNavigation threads={snapshot?.threads ?? []} selected={thread?.id ?? ''} onSelect={selectSession} locale={locale}
        controller={controlled} recent={recentSessions} state={snapshot?.state ?? 'CONNECTING'} />
      <Button variant="outline" type="button" disabled={busy} onClick={() => void refresh(true)}>{t('Refresh discovery', '刷新发现')}</Button>
      <div className="local-note">{t('Local browser only', '仅限本地浏览器')}</div>
    </>}
    conversation={<>
      <section ref={attentionRef} tabIndex={-1} className="session-attention" aria-label={t('Current session attention', '当前会话待处理')} data-testid="session-attention">
        {!thread?.attached && <div className="attention-heading">{ownership}</div>}
        <div className="attention-cards">
          {otherPendingThread && <div className="notice" role="status" data-testid="other-thread-pending">
            <p>{t('A command for another thread awaits its receipt. Controls remain paused.', '另一个线程的命令正在等待回执，控制操作保持暂停。')}</p>
            <p>{t('This input will not be sent again automatically.', '此输入不会被自动重发。')}</p>
            {observationUnavailable && <p>{t('Native execution state is unverified.', '原生执行状态尚未验证。')}</p>}
            <Button variant="outline" type="button" onClick={() => selectSession(receiptTarget!.threadId)}>{t('View thread', '查看线程')} {receiptTarget!.threadId}</Button>
          </div>}
          {receiptTarget && !otherPendingThread && <div className="receipt-attention severity-attention" data-testid="receipt-attention" role="status">
            <strong>{outcomeUnknown ? t('Outcome unknown', '结果未知') : t('Awaiting command receipt', '等待命令回执')}</strong>
            <p>{t('Check the receipt. This input will not be sent again automatically.', '请查询回执。此输入不会被自动重发。')}</p>
            {observationUnavailable && <p>{t('Native execution state is unverified.', '原生执行状态尚未验证。')}</p>}
            <details><summary>{t('Command details', '命令详情')}</summary><small>{receiptTarget.threadId} · {receiptTarget.commandId}</small></details>
            <Button variant="outline" type="button" disabled={busy} onClick={lookup}>{t('Check receipt', '查询回执')}</Button>
          </div>}
          {observationUnavailable && !receiptTarget && <div className={`notice severity-${observationSeverity(snapshot?.state)}`} data-testid="observation-attention">
            <strong>{t('Observation unavailable', '观察不可用')}</strong><p>{t('Native execution state is unverified. Refresh observed state to check again.', '原生执行状态尚未验证，可刷新观察状态再次检查。')}</p>
            <small>{snapshot?.state}</small><Button variant="outline" type="button" disabled={busy} onClick={() => refresh()}>{t('Refresh observed state', '刷新观察状态')}</Button>
          </div>}
          {error && !receiptTarget && (!commandErrorThread || commandErrorThread === thread?.id) && <div role="alert" className="alert">{error}</div>}
          {thread?.externalAdvance && <ReviewCard title={t('Native session changed outside this Web controller.', '原生会话已在此网页控制器之外更新。')}
            body={t('Review the currently observed state before continuing.', '请先检查当前观察到的状态再继续。')}
            actionLabel={t('Review and continue', '查看并继续')} disabled={!available || !controlled} onReview={() => void command('native.reviewState')} />}
          {sessionApprovals.map(approval => <ApprovalCard key={`${typeof approval.requestId}:${approval.requestId}`}
            resolved={approval.status === 'RESOLVED'} resolvedDetailsLabel={t('Request details', '请求详情')}
            statusLabel={approval.status === 'PENDING' ? t('Needs approval', '需要审批') : approval.status === 'RESOLVED' ? t('Native request resolved', '原生请求已解决') : approval.status === 'STALE' ? t('Request expired or changed', '请求已失效或变更') : approval.status}
            summary={approval.summary}
            meta={`${approval.workspace} · ${approval.requestType}\nThread ${approval.threadId} · Turn ${approval.turnId}\nItem ${approval.itemId} · Request ${approval.requestId}`}
            unsupportedHint={approval.status === 'PENDING' && (!approval.supported || !snapshot?.compatibility.capabilities.approvalResolve.available)
              ? t('Complete action or supported responses are unavailable. Review this request in your native interface.', '缺少完整动作或受支持的响应，请在原生界面检查此请求。') : undefined}
            allowLabel={t('Allow once', '允许一次')} denyLabel={t('Deny', '拒绝')}
            canAllow={!!(thread?.attached && approval.supported && approval.status === 'PENDING' && available && controlled && approval.authority && snapshot?.compatibility.capabilities.approvalResolve.available)}
            canDeny={!!(thread?.attached && approval.supported && approval.status === 'PENDING' && available && controlled && approval.authority && snapshot?.compatibility.capabilities.approvalResolve.available)}
            onAllow={() => void command('native.approval', { requestId: approval.requestId, threadId: approval.threadId, turnId: approval.turnId, itemId: approval.itemId,
              requestType: approval.requestType, digest: approval.digest, authority: approval.authority!, decision: 'ALLOW_ONCE' })}
            onDeny={() => void command('native.approval', { requestId: approval.requestId, threadId: approval.threadId, turnId: approval.turnId, itemId: approval.itemId,
              requestType: approval.requestType, digest: approval.digest, authority: approval.authority!, decision: 'DENY' })} />)}
          {snapshot && snapshot.compatibility.profile !== 'ADOPT_FULL' && <div className="notice" data-testid="compatibility-attention" role="status"><strong>{t('Native control is not supported', '原生控制不受支持')}</strong><p>{t('Observed information remains read only. Refresh the observed state after the runtime compatibility issue is resolved. Capability evidence is available in Inspector.', '已观察信息保持只读。运行时兼容性问题解决后可刷新观察状态；能力证据可在检查器中查看。')}</p><code>{snapshot.compatibility.profile}</code><Button variant="outline" type="button" disabled={busy} onClick={() => refresh()}>{t('Refresh observed state', '刷新观察状态')}</Button></div>}
        </div>
      </section>
      {thread?.residualCommandState === 'MAY_STILL_BE_RUNNING' && <div className={`notice severity-${residualSeverity(thread.residualCommandState)}`} data-severity={residualSeverity(thread.residualCommandState)}>{t('A native command may still be finishing in the background. Interrupt does not terminate the daemon, TUI or command process.', '原生命令可能仍在后台收尾。中断轮次不代表守护进程、TUI 或命令进程已终止。')}</div>}
      {thread?.residualCommandState === 'OBSERVED_DRAINED' && <p className="muted" data-residual-state="OBSERVED_DRAINED">{t('Observed interrupted-turn commands have finished. The turn remains interrupted.', '已观察到的中断轮次命令已结束。轮次仍为已中断。')}</p>}
      {thread && !thread.attached && <SessionConnectPreview
        title={t('Native session', '原生会话')}
        workspaceLabel={t('Workspace', '工作区')}
        modelLabel={t('Model', '模型')}
        stateLabel={t('State', '状态')}
        threadLabel={t('Thread', '线程')}
        workspace={thread.workspace}
        model={thread.model ?? '—'}
        state={thread.status}
        threadShort={threadShort}
        body={t(
          'Connect to this observed native thread. Original TUI availability needs separate verification.',
          '连接当前观察到的原生线程。原始 TUI 可用性需另行验证。',
        )}
        actionLabel={t('Connect session', '连接此会话')}
        disabled={connectDisabled}
        onConnect={() => void command('native.attach')}
      />}
      <div className="timeline" role="log" aria-label={t('Native conversation', '原生对话')} ref={timelineRef} data-testid="conversation-timeline"
        onScroll={event => { const node = event.currentTarget; const atTail = node.scrollTop + node.clientHeight >= node.scrollHeight - 48; followTail.current = atTail; setFollowing(atTail); }}>
        {thread?.attached && turnIds.map(turnId => <React.Fragment key={`${conversationKey}:${turnId}`}>
          {conversationMessages(turnId)}
          {tools.filter(item => item.turnId === turnId).map(item => <ToolActivityCard key={`tool:${item.toolId ?? item.itemId}`} item={item}
            runningLabel={t('Running…', '运行中…')} completedLabel={t('Completed', '已完成')} failedLabel={t('Failed', '失败')}
            unknownLabel={t('Status unknown', '状态未知')} detailsLabel={t('Observed details', '已观察的详情')}
            detailsHint={t('Recent command summary; full tool output is not provided by this projection.', '此投影仅提供最近命令摘要，未提供完整工具输出。')} />)}
          {thread.turns.find(turn => turn.id === turnId) && <div className="native-turn-marker"><TurnStatus turn={thread.turns.find(turn => turn.id === turnId)!} locale={locale} live={snapshot?.state === 'READY'}/></div>}
        </React.Fragment>)}
        {showProvisional && <article className="message user provisional" data-presentation-state={provisional.state} data-command-id={provisional.commandId}>
          <div className="message-label">{t('Web (provisional)', '网页（临时）')}<small data-testid="presentation-state">{provisional.family === 'native.steer' && provisional.state === 'NATIVE_ACCEPTED'
            ? t('Steer accepted; exact item observation unavailable', '引导已接受；尚无法验证精确消息项') : presentationLabel(provisional.state, locale === 'zh-CN')}</small></div>
          <div className="message-text">{provisional.text}</div>
        </article>}
        {thread?.historyLimited && <p className="muted">{t('Showing bounded recent history.', '仅显示最近的有限历史。')}</p>}
      </div>
      {!following && <Button variant="outline" type="button" className="latest-activity" onClick={() => {
        followTail.current = true; setFollowing(true); const node = timelineRef.current; node?.scrollTo({ top: node.scrollHeight, behavior: 'auto' });
      }}>{t('Jump to latest activity', '返回最新活动')}</Button>}
      {thread?.attached && <form className="composer composer-surface" data-testid="composer-surface" data-control-mode={mode} onSubmit={event => { event.preventDefault(); void command('native.submit'); }}>
        <div className="composer-status">{ownership}<span className="session-state">{snapshot?.state !== 'READY' || !!receiptTarget || !!thread?.externalAdvance ? t('Controls paused', '控制已暂停') : thread.status === 'active' ? t('Working', '工作中') : thread.status === 'idle' ? t('Idle', '空闲') : thread.status}</span></div>
        <InputGroup className="composer-input-group rounded-xl">
        <InputGroupTextarea
          className="min-h-18 max-h-36 px-4 py-3 text-[15px] md:text-[15px] max-sm:min-h-16 max-sm:px-3 max-sm:py-2.5"
          id="native-prompt"
          data-testid="native-prompt"
          aria-label={t('Message Codex', '发送给 Codex')}
          placeholder={t('Message Codex…', '发送给 Codex…')}
          maxLength={16000}
          value={text}
          onChange={event => setDraft(draftKey, event.target.value)}
          disabled={busy || snapshot?.state !== 'READY' || mode === 'review' || mode === 'receipt_lookup'}
          rows={2}
          onKeyDown={event => {
            if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey) || event.nativeEvent.isComposing || event.keyCode === 229 || event.repeat) return;
            event.preventDefault();
            if (!canControl || !text.trim()) return;
            if (mode === 'send' && thread?.status === 'idle') void command('native.submit');
            else if (mode === 'steer_interrupt' && steer && thread?.activeTurnId) void command('native.steer');
          }}
        />
        <InputGroupAddon align="block-end" className="composer-toolbar flex-wrap justify-between gap-2 px-3 py-2 max-sm:px-2 max-sm:py-1.5">
        <SessionConfigBar locale={locale} showController={false}
          modelLabel={t('Model', '模型')} reasoningLabel={t('Reasoning', '推理')} permissionLabel={t('Permission', '权限')}
          controllerLabel={controlled ? t('You control this session', '你控制此会话') : t('Read-only viewer', '只读查看者')}
          model={thread?.model ?? ''} reasoning="" permission={permission.label}
          models={thread?.model ? [{ id: thread.model, label: thread.model }] : []}
          reasonings={[]} permissions={permission.label ? [{ id: permission.label, label: permission.label }] : []}
          mutationSupported={false} mutationHint={mutationHint}
          effectiveModel={thread?.model ?? ''}
          effectivePermission={permission.label}
        />
        <div className="native-controls composer-actions">
          {mode === 'send' || mode === 'steer_interrupt' || mode === 'viewer' ? <Button type="submit" variant="default" data-testid="composer-send" disabled={!canControl || thread?.status !== 'idle' || !text.trim() || mode === 'viewer'}>
            <SemanticIcon intent="send" size={14} /> {t('Send', '发送')} <span aria-hidden="true">↑</span>
          </Button> : null}
          {mode === 'steer_interrupt' || (mode === 'viewer' && !!thread?.activeTurnId) ? <>
            <Button variant="outline" type="button" disabled={!canControl || !steer || !thread?.activeTurnId || !text.trim() || mode === 'viewer'} onClick={() => void command('native.steer')}>
              <SemanticIcon intent="steer" size={16} /> {steer ? t('Steer', '引导') : t('Steer unavailable', '引导不可用')}
            </Button>
            <Button variant="outline" type="button" disabled={!canControl || !interrupt || !thread?.activeTurnId || mode === 'viewer'} onClick={() => void command('native.interrupt')}>
              <SemanticIcon intent="interrupt" size={14} /> {interrupt ? t('Interrupt', '中断') : t('Interrupt unavailable', '中断不可用')}
            </Button>
          </> : null}
        </div>
        </InputGroupAddon>
        </InputGroup>
      </form>}
    </>}
    context={<>
      <div className="eyebrow">{t('Session', '会话')}</div>
      <dl>
        <dt>{t('Model', '模型')}</dt><dd>{thread?.model ?? 'UNOBSERVED'}</dd>
        <dt>{t('Permission', '权限')}</dt><dd>{permission.label}</dd>
        <dt>{t('Connectivity', '连接')}</dt><dd>{snapshot?.state ?? 'CONNECTING'}</dd>
        <dt>Native thread ID</dt><dd className="id" data-testid="adopted-thread-id">{thread?.id ?? '—'}</dd>
        <dt>Active turn ID</dt><dd className="id" data-testid="adopted-turn-id">{thread?.activeTurnId ?? '—'}</dd>
      </dl>
<details className="inspector" data-testid="inspector"><summary>{t('Inspector', '检查器')}</summary>
        <dl>
          <dt>Agent origin</dt><dd>NATIVE_ADOPTED</dd>
          <dt>Workspace</dt><dd>{thread?.workspace ?? snapshot?.workspace}</dd>
          <dt>Daemon PID</dt><dd>{snapshot?.daemon.processId}</dd>
          <dt>Endpoint</dt><dd className="id">{snapshot?.daemon.endpoint ?? '—'}</dd>
          <dt>{t('Fleet controller fence', 'Fleet 控制栅栏')}</dt><dd>{snapshot?.fence}</dd>
          <dt>Incarnation</dt><dd className="id">{snapshot?.incarnation ?? '—'}</dd>
        </dl>
        <pre>{JSON.stringify({ daemon: snapshot?.daemon, compatibility: snapshot?.compatibility, observationFailure: snapshot?.observationFailure, createdNativeThread: false }, null, 2)}</pre>
        <pre>{JSON.stringify(snapshot?.receipts.at(-1) ?? null, null, 2)}</pre>
      </details>
      <p className="local-note">{t('Native TUI availability needs separate verification', '原生 TUI 可用性需另行验证')}</p>
      {fleet}
    </>}
    footer={<><span>{snapshot?.state ?? 'CONNECTING'}</span></>}
  />;
}
