import React, { useEffect, useRef, useState } from 'react';
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
  approvalResolveUnavailableLabel,
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
import {
  ApprovalCard, OwnershipSurface, ReviewCard, SessionConnectPreview, SessionItem,
  StreamingMessage, ToolActivityCard,
} from './components/Presentation.tsx';
import { SendHorizontal, Square, Waypoints } from 'lucide-react';

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

export function NativeAdoption({ client, request, locale, preferences }: {
  client: { clientInstanceId: string; expiresAt: number }; request: (url: string, body?: unknown) => Promise<any>;
  locale: Locale; preferences: React.ReactNode;
}) {
  const t = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const [snapshot, setSnapshot] = useState<AdoptionSnapshot | null>(null);
  const [selected, setSelected] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<AdoptionCommand | null>(() => { try { return JSON.parse(sessionStorage.getItem('fleetsplice.native.pending') ?? 'null'); } catch { return null; } });
  const [provisional, setProvisional] = useState<ProvisionalMessage | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('fleetsplice.native.provisional') ?? 'null'); } catch { return null; }
  });
  const [liveTimeline, setLiveTimeline] = useState<TimelinePresentationItem[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const followTail = useRef(true);
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
  async function applySnapshot(discover = false, reasons: readonly ReconcileReason[] = ['manual']) {
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
      const history = (next.threads ?? []).flatMap((item: any) => item.history ?? []);
      const activity = (next.threads ?? []).flatMap((item: any) => item.activity ?? []);
      setLiveTimeline(current => retireLiveWhenAuthoritative(current, history, activity));
      setProvisional(current => {
        if (!current || !['native.submit', 'native.steer'].includes(current.family)) return current;
        const observed = (next.threads ?? []).some((item: any) => correlateProvisional(current, item.history ?? [], client.clientInstanceId));
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
    catch (e) { setError(e instanceof Error ? e.message : 'NATIVE_OBSERVATION_LOST'); setSnapshot(old => old ? { ...old, state: 'NATIVE_OBSERVATION_LOST' } : old); }
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
  const controlled = snapshot?.controller === client.clientInstanceId;
  const available = snapshot?.state === 'READY' && snapshot.compatibility.profile === 'ADOPT_FULL' && !busy && !pending && client.expiresAt > Date.now();
  const canControl = available && controlled && thread?.attached && !thread.externalAdvance;
  const interrupt = snapshot?.compatibility.capabilities.interrupt.available;
  const steer = snapshot?.compatibility.capabilities.steer.available;
  function persistProvisional(value: ProvisionalMessage | null) {
    setProvisional(value);
    if (value) sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(value));
    else sessionStorage.removeItem('fleetsplice.native.provisional');
  }
  function receiptObserved(receipt: AdoptionReceipt) {
    sessionStorage.removeItem('fleetsplice.native.pending'); setPending(null);
    setError(receipt.status === 'SUCCEEDED' ? '' : `${receipt.status}: ${receipt.code}`);
    setProvisional(current => {
      if (!current || current.commandId !== receipt.commandId) return current;
      const observed = correlateProvisional(current, thread?.history ?? [], client.clientInstanceId);
      const state = advancePresentation(current.state, receipt, observed);
      if (state === 'OBSERVED') { sessionStorage.removeItem('fleetsplice.native.provisional'); return null; }
      const next = { ...current, state };
      sessionStorage.setItem('fleetsplice.native.provisional', JSON.stringify(next));
      return next;
    });
    if (receipt.status === 'SUCCEEDED' && ['native.submit', 'native.steer'].includes(receipt.family)) setText('');
  }
  async function command(family: AdoptionCommand['family'], approval?: AdoptionCommand['approval']) {
    if (!available || !snapshot || !thread) return;
    const value: AdoptionCommand = { commandId: crypto.randomUUID(), runtimeId: snapshot.runtimeId,
      incarnation: snapshot.incarnation, clientInstanceId: client.clientInstanceId, expectedFence: snapshot.fence,
      threadId: thread.id, stateToken: thread.stateToken, activeTurnId: thread.activeTurnId, family, text: ['native.submit', 'native.steer'].includes(family) ? text : '' };
    if (approval) value.approval = approval;
    setBusy(true); setError('');
    if (family === 'native.submit' || family === 'native.steer') {
      timerRef.current.measure('local_echo', () => persistProvisional(createProvisional(value.commandId, family, value.text)));
    }
    try {
      sessionStorage.setItem('fleetsplice.native.pending', JSON.stringify(value)); setPending(value);
      const sendStarted = performance.now();
      const commandWindowStart = Date.now();
      const receipt = await timerRef.current.measureAsync('command_send', () => request('/api/native/commands', value));
      timerRef.current.record('receipt', sendStarted, performance.now());
      receiptObserved(receipt);
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
    if (!pending) return; setBusy(true);
    try {
      receiptObserved(await request(`/api/native/commands/${pending.commandId}`));
      const scheduler = schedulerRef.current;
      if (scheduler) {
        lastTriggerRef.current = { event: 'command.lookup', revision: null, turnId: thread?.activeTurnId ?? null };
        scheduler.schedule('command');
        await scheduler.whenIdle();
      } else await applySnapshot(false, ['command']);
    }
    catch (e) { setError(e instanceof Error ? e.message : 'COMMAND_UNKNOWN_NO_REPLAY'); }
    finally { setBusy(false); }
  }
  const showProvisional = provisional && provisional.state !== 'OBSERVED'
    && !correlateProvisional(provisional, thread?.history ?? [], client.clientInstanceId);
  const outcomeUnknown = provisional?.state === 'OUTCOME_UNKNOWN' || provisional?.state === 'AMBIGUOUS_EFFECT' || (!!pending && !!error && /Outcome unknown|结果未知/.test(error));
  const mode = controlSurfaceMode({
    attached: !!thread?.attached,
    controlled,
    externalAdvance: !!thread?.externalAdvance,
    activeTurn: !!thread?.activeTurnId,
    outcomeUnknown,
    viewer: !controlled,
  });
  const permission = permissionPresentation(thread?.permission, locale === 'zh-CN');
  useEffect(() => {
    const node = timelineRef.current;
    if (!node || !followTail.current) return;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ top: node.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [thread?.history.length, liveTimeline.length, showProvisional, provisional?.state]);

  const liveMessages = liveTimeline.filter(item => item.kind === 'message.delta' || item.kind === 'message.final');
  const liveTools = liveTimeline.filter(item => item.kind.startsWith('tool.'));
  const mutationHint = t(
    'Native Adoption shows observed effective configuration only. This runtime does not provide a structured model/reasoning/permission mutation API.',
    '原生会话仅显示已观察的有效配置。此运行时未提供结构化的模型/推理/权限变更接口。',
  );
  const threadShort = thread?.id ? (thread.id.length > 16 ? `${thread.id.slice(0, 12)}…` : thread.id) : '—';
  const connectDisabled = !available || !thread || (!!snapshot?.controller && !controlled);

  return <AppShell
    brand={<div className="brand"><span className="mark">F</span> FleetSplice <span className="edition">{t('NATIVE SESSION · LOCAL', '原生会话 · 本地')}</span></div>}
    headerActions={preferences}
    navTitle={t('Sessions', '会话')}
    contextTitle={t('Context', '上下文')}
    navigation={<>
      <div className="eyebrow">{t('Native sessions', '原生会话')}</div>
      {!snapshot?.threads.length && <p className="muted">{t('Waiting for an existing native session.', '等待已有原生会话。')}</p>}
      {snapshot?.threads.map(item => <SessionItem
        key={item.id}
        selected={thread?.id === item.id}
        title="Codex"
        subtitle={t('Native session', '原生会话')}
        workspace={item.workspace}
        status={`${item.attached ? t('Connected', '已连接') : t('Available', '可连接')} · ${item.status}${item.activeTurnId ? ` · ${t('active turn', '活动轮次')}` : ''}`}
        connected={!!item.attached}
        onSelect={() => setSelected(item.id)}
      />)}
      <button type="button" disabled={busy} onClick={() => void refresh(true)}>{t('Refresh discovery', '刷新发现')}</button>
      <div className="local-note">{t('Local browser only', '仅限本地浏览器')}<br/>{snapshot?.compatibility.profile ?? 'PROBING'}</div>
    </>}
    conversation={<>
      <div className="session-heading"><div><div className="eyebrow">{t('Native session', '原生会话')}</div>
        <h1>{thread ? t('Codex · Native session', 'Codex · 原生会话') : t('Native sessions', '原生会话')}</h1>
        <div className="subtitle">{thread?.workspace}</div>
      </div><span className="status">{thread?.activeTurnId && thread.turns.find(turn => turn.id === thread.activeTurnId) ? <TurnStatus turn={thread.turns.find(turn => turn.id === thread.activeTurnId)!} locale={locale} live={snapshot?.state === 'READY'}/> : thread?.status ?? 'WAITING'}</span></div>
      {(error || (snapshot && snapshot.state !== 'READY')) && <div role="alert" className={`alert severity-${observationSeverity(snapshot?.state)}`} data-severity={observationSeverity(snapshot?.state)}>{error || snapshot?.state}</div>}
      {(pending || mode === 'receipt_lookup') && <div className="pending severity-attention" data-severity="attention">{t('Pending command receipt', '等待命令回执')} <code>{pending?.commandId ?? provisional?.commandId}</code><button disabled={busy || !pending} onClick={lookup}>{t('Check receipt', '查询回执')}</button></div>}
      {thread?.externalAdvance && <ReviewCard
        title={t('Native session changed outside this Web controller.', '原生会话已在此网页控制器之外更新。')}
        body={t('New conversation activity is already shown below.', '下方已显示新的对话活动。')}
        actionLabel={t('Review and continue', '查看并继续')}
        disabled={!available || !controlled}
        onReview={() => void command('native.reviewState')}
      />}
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
          'Connecting this session lets FleetSplice continue the same native conversation. The original Codex TUI remains usable.',
          '连接此会话后，FleetSplice 可继续同一原生对话。原有 Codex TUI 仍可使用。',
        )}
        actionLabel={t('Connect session', '连接此会话')}
        disabled={connectDisabled}
        onConnect={() => void command('native.attach')}
      />}
      <div className="timeline" role="log" aria-label={t('Native conversation', '原生对话')} ref={timelineRef} data-testid="conversation-timeline"
        onScroll={event => { const node = event.currentTarget; followTail.current = node.scrollTop + node.clientHeight >= node.scrollHeight - 48; }}>
        {thread?.attached && thread.turns.map(turn => <React.Fragment key={turn.id}>
          {thread.history.filter(message => message.turnId === turn.id).map((message, index) => <article className={`message ${message.role}`} key={message.itemId ? `${message.turnId}-${message.itemId}` : `${message.turnId}-${index}`} data-item-id={message.itemId ?? undefined}><div className="message-label">{message.role === 'user' ? t('You', '你') : 'Codex'}
            {message.role === 'user' && <small className="native-source-badge" data-source={message.source?.kind ?? 'NATIVE_EXTERNAL'} title={message.source?.kind === 'FLEETSPLICE_WEB' ? message.source.clientInstanceId : undefined}>{message.source?.kind === 'FLEETSPLICE_WEB' ? `Web${message.source.deviceLabel || message.source.clientDisplayLabel ? ` · ${message.source.deviceLabel || message.source.clientDisplayLabel}` : ''}` : t('Native', '原生')}</small>}
          </div><div className="message-text">{message.text}</div></article>)}
          <div className="native-turn-marker"><TurnStatus turn={turn} locale={locale} live={snapshot?.state === 'READY'}/></div>
        </React.Fragment>)}
        {showProvisional && <article className="message user provisional" data-presentation-state={provisional.state} data-command-id={provisional.commandId}>
          <div className="message-label">{t('Web (provisional)', '网页（临时）')}<small data-testid="presentation-state">{presentationLabel(provisional.state, locale === 'zh-CN')}</small></div>
          <div className="message-text">{provisional.text}</div>
        </article>}
        {liveTools.map(item => <ToolActivityCard key={item.toolId ?? item.itemId ?? item.eventId} item={item}
          runningLabel={t('Running…', '运行中…')} completedLabel={t('Completed', '已完成')} failedLabel={t('Failed', '失败')}
          detailsLabel={t('Details', '详情')} />)}
        {liveMessages.map(item => <StreamingMessage key={item.itemId ?? item.eventId} item={item} streamingLabel={t('Streaming', '生成中')} />)}
        {thread?.historyLimited && <p className="muted">{t('Showing bounded recent history.', '仅显示最近的有限历史。')}</p>}
      </div>
      {thread?.attached && <section className="native-approvals" aria-label={t('Approvals', '审批')}>
        {snapshot?.approvals?.filter(a => a.threadId === thread.id).slice(-8).map(a => <ApprovalCard
          key={`${typeof a.requestId}:${a.requestId}`}
          statusLabel={a.status === 'PENDING' ? t('Needs approval', '需要审批') : a.status === 'RESOLVED' ? t('Native request resolved', '原生请求已解决') : a.status === 'STALE' ? 'STALE_NATIVE_REQUEST' : a.status}
          summary={a.summary}
          meta={`${a.workspace} · ${a.requestType} · ${t('Turn', '轮次')} ${a.turnId}`}
          unsupportedHint={!a.supported ? approvalResolveUnavailableLabel(thread.permission, locale === 'zh-CN') : undefined}
          allowLabel={t('Allow once', '允许一次')}
          denyLabel={t('Deny', '拒绝')}
          canAllow={!!(a.supported && a.status === 'PENDING' && available && controlled && a.authority && snapshot.compatibility.capabilities.approvalResolve.available)}
          canDeny={!!(a.supported && a.status === 'PENDING' && available && controlled && a.authority && snapshot.compatibility.capabilities.approvalResolve.available)}
          onAllow={() => void command('native.approval', { requestId: a.requestId, threadId: a.threadId, turnId: a.turnId,
            itemId: a.itemId, requestType: a.requestType, digest: a.digest, authority: a.authority!, decision: 'ALLOW_ONCE' })}
          onDeny={() => void command('native.approval', { requestId: a.requestId, threadId: a.threadId, turnId: a.turnId,
            itemId: a.itemId, requestType: a.requestType, digest: a.digest, authority: a.authority!, decision: 'DENY' })}
        />)}
        {!snapshot?.compatibility.capabilities.approvalResolve.available && (snapshot?.approvals?.some(a => a.threadId === thread.id && a.status === 'PENDING') ?? false) && <p className="muted" data-testid="approval-capability-note">{approvalResolveUnavailableLabel(thread.permission, locale === 'zh-CN')}</p>}
      </section>}
      {thread?.attached && <form className="composer sticky-composer composer-surface" data-testid="composer-surface" data-control-mode={mode} onSubmit={event => { event.preventDefault(); void command('native.submit'); }}>
        <SessionConfigBar
          modelLabel={t('Model', '模型')} reasoningLabel={t('Reasoning', '推理')} permissionLabel={t('Permission', '权限')}
          controllerLabel={controlled ? t('You control this session', '你控制此会话') : t('Read-only viewer', '只读查看者')}
          model={thread?.model ?? ''} reasoning="" permission={permission.label}
          models={thread?.model ? [{ id: thread.model, label: thread.model }] : []}
          reasonings={[]} permissions={permission.label ? [{ id: permission.label, label: permission.label }] : []}
          mutationSupported={false} mutationHint={mutationHint}
          effectiveModel={thread?.model ?? ''}
          effectivePermission={permission.label}
        />
        <textarea id="native-prompt" data-testid="native-prompt" aria-label={t('Message', '消息')} maxLength={16000} value={text} onChange={event => setText(event.target.value)} disabled={!canControl || mode === 'review' || mode === 'receipt_lookup'} rows={2}/>
        <div className="native-controls composer-actions">
          {mode === 'send' || mode === 'steer_interrupt' || mode === 'viewer' ? <button type="submit" className="primary" data-testid="composer-send" disabled={!canControl || thread?.status !== 'idle' || !text.trim() || mode === 'viewer'}>
            <SendHorizontal size={16} aria-hidden="true" /> {t('Send', '发送')}
          </button> : null}
          {mode === 'steer_interrupt' || (mode === 'viewer' && !!thread?.activeTurnId) ? <>
            <button type="button" disabled={!canControl || !steer || !thread?.activeTurnId || !text.trim() || mode === 'viewer'} onClick={() => void command('native.steer')}>
              <Waypoints size={16} aria-hidden="true" /> {steer ? t('Steer', '引导') : t('Steer unavailable', '引导不可用')}
            </button>
            <button type="button" disabled={!canControl || !interrupt || !thread?.activeTurnId || mode === 'viewer'} onClick={() => void command('native.interrupt')}>
              <Square size={14} aria-hidden="true" /> {interrupt ? t('Interrupt', '中断') : t('Interrupt unavailable', '中断不可用')}
            </button>
          </> : null}
          {mode === 'receipt_lookup' ? <button type="button" disabled={busy || !pending} onClick={lookup}>{t('Check receipt', '查询回执')}</button> : null}
        </div>
      </form>}
    </>}
    context={<>
      <div className="eyebrow">{t('Session', '会话')}</div>
      <OwnershipSurface
        controlled={controlled}
        controllerLabel={t('You control this session', '你控制此会话')}
        viewerLabel={t('Read-only viewer', '只读查看者')}
        releaseLabel={t('Release', '释放')}
        acquireLabel={t('Acquire control', '获取控制权')}
        canRelease={available && controlled && !!thread?.attached}
        canAcquire={available && !!thread?.attached && !snapshot?.controller}
        onRelease={() => void command('native.release')}
        onAcquire={() => void command('native.attach')}
      />
      <dl>
        <dt>{t('Model', '模型')}</dt><dd>{thread?.model ?? 'UNOBSERVED'}</dd>
        <dt>{t('Permission', '权限')}</dt><dd>{permission.label}</dd>
        <dt>{t('Connectivity', '连接')}</dt><dd>{snapshot?.state ?? 'CONNECTING'}</dd>
        <dt>Native thread ID</dt><dd className="id" data-testid="adopted-thread-id">{thread?.id ?? '—'}</dd>
        <dt>Active turn ID</dt><dd className="id" data-testid="adopted-turn-id">{thread?.activeTurnId ?? '—'}</dd>
      </dl>
      <h3>{t('Recent activity', '最近活动')}</h3>
      <ul className="activity">{thread?.activity.slice(-8).map(item => <li key={item.id}>{item.status} · {item.text}</li>) ?? <li>{t('No activity yet', '尚无活动')}</li>}</ul>
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
    </>}
    footer={<><span>{snapshot?.state ?? 'CONNECTING'} · {snapshot?.compatibility.profile ?? 'PROBING'}</span><span className="footer-right">{t('Native TUI remains usable', '原生 TUI 仍可继续使用')}</span></>}
  />;
}
