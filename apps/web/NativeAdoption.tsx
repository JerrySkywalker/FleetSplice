import React, { useEffect, useRef, useState } from 'react';
import type { AdoptionCommand, AdoptionReceipt, AdoptionSnapshot, NativeTurn } from '../../packages/native-adoption/types.ts';
import type { TimelinePresentationItem } from '../../packages/contracts/realtime-timeline.ts';
import { foldTimeline } from '../../packages/contracts/realtime-timeline.ts';
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
  externalAdvanceSeverity,
  observationSeverity,
  permissionPresentation,
  residualSeverity,
} from './control-safety-ux.ts';
import { LocalLoopTimer } from '../../packages/contracts/local-loop-timing.ts';

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
  return <span className="native-turn-status" data-turn-id={turn.id} data-turn-state={turn.state}><span>{label}</span>{formatted ? ` · ${turn.state === 'RUNNING' ? '' : zh ? '工作用时 ' : 'Worked for '}${formatted}` : ` · ${zh ? '计时不可用' : 'Timing unavailable'}`}</span>;
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
  const refreshing = useRef(false);
  async function refresh(discover = false) {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const next = await request(discover ? '/api/native/snapshot?discover=1' : '/api/native/snapshot');
      setSnapshot(next);
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
    finally { refreshing.current = false; }
  }
  useEffect(() => {
    void refresh();
    let events: EventSource | undefined;
    const connect = () => {
      events?.close();
      events = new EventSource('/api/native/events');
      events.onmessage = (message) => {
        try {
          const envelope = JSON.parse(message.data) as {
            eventId: string; revision: string; stream: string; kind: string;
            threadId: string | null; turnId: string | null;
            semantic?: { role?: TimelinePresentationItem['role']; text?: string; toolId?: string; status?: string };
          };
          if (envelope.stream === 'agent.execution' && envelope.kind !== 'unsupported') {
            const item: TimelinePresentationItem = {
              eventId: envelope.eventId, revision: envelope.revision, kind: envelope.kind as TimelinePresentationItem['kind'],
              threadId: envelope.threadId, turnId: envelope.turnId, ephemeral: true,
              role: envelope.semantic?.role, text: envelope.semantic?.text, toolId: envelope.semantic?.toolId, status: envelope.semantic?.status,
            };
            setLiveTimeline(current => foldTimeline(current, item));
            timerRef.current.record('browser_receive_render', performance.now());
          }
        } catch { /* Invalidation-only payloads still trigger refresh below. */ }
        void refresh();
      };
      events.onerror = () => { /* Browser reconnects EventSource; retain slow fallback refresh. */ };
    };
    connect();
    const fallback = setInterval(() => void refresh(), 20_000);
    const onVisible = () => { if (document.visibilityState === 'visible') { connect(); void refresh(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { events?.close(); clearInterval(fallback); document.removeEventListener('visibilitychange', onVisible); };
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
      const receipt = await timerRef.current.measureAsync('command_send', () => request('/api/native/commands', value));
      timerRef.current.record('receipt', sendStarted, performance.now());
      receiptObserved(receipt);
      await timerRef.current.measureAsync('final_reconciliation', () => refresh());
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
    try { receiptObserved(await request(`/api/native/commands/${pending.commandId}`)); await refresh(); }
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
  return <div className="shell native-demo">
    <header><div className="brand"><span className="mark">F</span> FleetSplice <span className="edition">{t('NATIVE ADOPTION · LOCAL', '原生会话接入 · 本地')}</span></div>{preferences}</header>
    <aside className="navigation"><div className="eyebrow">{t('Running Native Agents', '正在运行的原生代理')}</div>
      <p className="muted">{t('Attach an existing native Codex session in this Workspace.', '接入此工作区中已有的原生 Codex 会话。')}</p>
      {!snapshot?.threads.length && <p>{t('Waiting for an existing native thread.', '等待已有原生会话。')}</p>}
      {snapshot?.threads.map(item => <button className={`session ${thread?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected(item.id)} key={item.id}>
        <strong>Codex</strong><span>{t('Native adopted', '原生接入')}</span><small>{item.workspace}</small><small>{item.status}{item.activeTurnId ? ` · ${t('active turn', '活动轮次')}` : ''}</small><small>{permissionPresentation(item.permission, locale === 'zh-CN').label}</small>
      </button>)}
      <button disabled={busy} onClick={() => void refresh(true)}>{t('Refresh discovery', '刷新发现')}</button>
      <div className="local-note">{t('Local browser only', '仅限本地浏览器')}<br/>{snapshot?.compatibility.profile ?? 'PROBING'}</div>
    </aside>
    <main className="native-main">
      <div className="session-heading"><div><div className="eyebrow">{t('Existing native conversation', '已有的原生对话')}</div><h1>{thread ? 'Codex · Native adopted' : t('Running Native Agents', '正在运行的原生代理')}</h1>
        <div className="subtitle">{thread?.workspace}</div>
        <div className="native-status-summary" data-testid="native-status-summary">
          <span>{thread?.model ?? 'UNOBSERVED'}</span>
          <span>{permission.label}</span>
          <span>{controlled ? t('Controller', '控制器') : t('Viewer', '查看者')}</span>
          <span>{snapshot?.state ?? 'CONNECTING'}</span>
        </div>
      </div><span className="status">{thread?.activeTurnId && thread.turns.find(turn => turn.id === thread.activeTurnId) ? <TurnStatus turn={thread.turns.find(turn => turn.id === thread.activeTurnId)!} locale={locale} live={snapshot?.state === 'READY'}/> : thread?.status ?? 'WAITING'}</span></div>
      <div className="native-cooperative severity-info" data-severity="info"><strong>{t('Cooperative control', '协作控制')}</strong><p>{t('Local Codex TUI remains connected and may still issue native input.', '本地 Codex TUI 仍保持连接，也可以继续输入。')}</p></div>
      {(error || (snapshot && snapshot.state !== 'READY')) && <div role="alert" className={`alert severity-${observationSeverity(snapshot?.state)}`} data-severity={observationSeverity(snapshot?.state)}>{error || snapshot?.state}</div>}
      {(pending || mode === 'receipt_lookup') && <div className="pending severity-attention" data-severity="attention">{t('Pending command receipt', '等待命令回执')} <code>{pending?.commandId ?? provisional?.commandId}</code><button disabled={busy || !pending} onClick={lookup}>{t('Check receipt', '查询回执')}</button></div>}
      {thread?.externalAdvance && <div className={`notice severity-${externalAdvanceSeverity()}`} data-severity={externalAdvanceSeverity()} data-testid="external-advance-notice">
        <strong>{t('Native state advanced outside this Web controller', '原生状态已在此网页控制器之外更新')}</strong>
        <p>{t('New conversation activity is shown below. Review it, then acknowledge before controlling.', '下方已显示新的对话活动。请先阅读，再确认后继续控制。')}</p>
        <button disabled={!available || !controlled} onClick={() => void command('native.reviewState')}>{t('I reviewed the current native state', '我已查看当前原生状态')}</button>
      </div>}
      {thread?.residualCommandState === 'MAY_STILL_BE_RUNNING' && <div className={`notice severity-${residualSeverity(thread.residualCommandState)}`} data-severity={residualSeverity(thread.residualCommandState)}>{t('A native command may still be finishing in the background. Interrupt does not terminate the daemon, TUI or command process.', '原生命令可能仍在后台收尾。中断轮次不代表守护进程、TUI 或命令进程已终止。')}</div>}
      {thread?.residualCommandState === 'OBSERVED_DRAINED' && <p className="muted" data-residual-state="OBSERVED_DRAINED">{t('Observed interrupted-turn commands have finished. The turn remains interrupted.', '已观察到的中断轮次命令已结束。轮次仍为已中断。')}</p>}
      {!thread?.attached && <div className="native-attach"><button className="primary" disabled={!available || !thread || (!!snapshot?.controller && !controlled)} onClick={() => void command('native.attach')}>{t('Attach', '接入')}</button></div>}
      <div className="timeline" role="log" aria-label={t('Native conversation', '原生对话')} ref={timelineRef}
        onScroll={event => { const node = event.currentTarget; followTail.current = node.scrollTop + node.clientHeight >= node.scrollHeight - 48; }}>
        {thread?.attached && thread.turns.map(turn => <React.Fragment key={turn.id}>
          {thread.history.filter(message => message.turnId === turn.id).map((message, index) => <article className={`message ${message.role}`} key={`${message.turnId}-${index}`}><div className="message-label">{message.role === 'user' ? t('Native user input', '原生用户输入') : 'Codex'}
            {message.role === 'user' && <small className="native-source-badge" data-source={message.source?.kind ?? 'NATIVE_EXTERNAL'} title={message.source?.kind === 'FLEETSPLICE_WEB' ? message.source.clientInstanceId : undefined}>{message.source?.kind === 'FLEETSPLICE_WEB' ? `Web${message.source.deviceLabel || message.source.clientDisplayLabel ? ` · ${message.source.deviceLabel || message.source.clientDisplayLabel}` : ''}` : t('Native external client', '原生外部客户端')}</small>}
          </div><div className="message-text">{message.text}</div></article>)}
          <div className="native-turn-marker"><TurnStatus turn={turn} locale={locale} live={snapshot?.state === 'READY'}/></div>
        </React.Fragment>)}
        {showProvisional && <article className="message user provisional" data-presentation-state={provisional.state} data-command-id={provisional.commandId}>
          <div className="message-label">{t('Web (provisional)', '网页（临时）')}<small data-testid="presentation-state">{presentationLabel(provisional.state, locale === 'zh-CN')}</small></div>
          <div className="message-text">{provisional.text}</div>
        </article>}
        {liveTimeline.filter(item => item.kind === 'message.delta' || item.kind.startsWith('tool.') || item.kind.startsWith('turn.')).map(item => (
          <article className={`message ${item.role === 'assistant' ? 'assistant' : item.role === 'tool' ? 'system' : 'system'} live`} data-live-kind={item.kind} data-ephemeral="true" key={item.eventId}>
            <div className="message-label">{item.kind.startsWith('tool.') ? t('Tool activity', '工具活动') : item.kind.startsWith('turn.') ? t('Turn', '轮次') : 'Codex'}<small>{item.status ?? item.kind}</small></div>
            {item.text ? <div className="message-text">{item.text}</div> : null}
          </article>
        ))}
        {thread?.historyLimited && <p className="muted">{t('Showing bounded recent history.', '仅显示最近的有限历史。')}</p>}
      </div>
      {thread?.attached && <section className="native-approvals" aria-label={t('Approvals', '审批')}>
        {!snapshot?.compatibility.capabilities.approvalResolve.available && <p className="muted" data-testid="approval-capability-note">{approvalResolveUnavailableLabel(thread.permission, locale === 'zh-CN')}</p>}
        {snapshot?.approvals?.filter(a => a.threadId === thread.id).slice(-8).map(a => <article key={`${typeof a.requestId}:${a.requestId}`}>
          <strong>{a.status === 'PENDING' ? t('Needs approval', '需要审批') : a.status === 'RESOLVED' ? t('Native request resolved', '原生请求已解决') : a.status === 'STALE' ? 'STALE_NATIVE_REQUEST' : a.status}</strong>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{a.summary}</p><small>{a.workspace} · {a.requestType} · {t('Turn', '轮次')} {a.turnId}</small>
          {!a.supported && <p className="muted">{approvalResolveUnavailableLabel(thread.permission, locale === 'zh-CN')}</p>}
          {a.supported && a.status === 'PENDING' && <div>
            {(['ALLOW_ONCE', 'DENY'] as const).map(decision => <button key={decision} disabled={!available || !controlled || !a.authority || !snapshot.compatibility.capabilities.approvalResolve.available}
              onClick={() => void command('native.approval', { requestId: a.requestId, threadId: a.threadId, turnId: a.turnId,
                itemId: a.itemId, requestType: a.requestType, digest: a.digest, authority: a.authority!, decision })}>{decision === 'ALLOW_ONCE' ? t('Allow once', '允许一次') : t('Deny', '拒绝')}</button>)}
          </div>}
        </article>)}
      </section>}
      <form className="composer sticky-composer" data-control-mode={mode} onSubmit={event => { event.preventDefault(); void command('native.submit'); }}>
        <label htmlFor="native-prompt">{t('Continue this native conversation', '继续此原生对话')}</label><textarea id="native-prompt" maxLength={16000} value={text} onChange={event => setText(event.target.value)} disabled={!canControl || mode === 'review' || mode === 'receipt_lookup'}/>
        <div className="native-controls">
          {mode === 'send' || mode === 'steer_interrupt' || mode === 'viewer' ? <button type="submit" className="primary" disabled={!canControl || thread?.status !== 'idle' || !text.trim() || mode === 'viewer'}>{t('Send continuation', '发送后续对话')}</button> : null}
          {mode === 'steer_interrupt' || (mode === 'viewer' && !!thread?.activeTurnId) ? <>
            <button type="button" disabled={!canControl || !steer || !thread?.activeTurnId || !text.trim() || mode === 'viewer'} onClick={() => void command('native.steer')}>{steer ? t('Steer', '引导当前轮次') : t('Steer unavailable', '引导不可用')}</button>
            <button type="button" disabled={!canControl || !interrupt || !thread?.activeTurnId || mode === 'viewer'} onClick={() => void command('native.interrupt')}>{interrupt ? t('Interrupt turn', '中断轮次') : t('Interrupt unavailable', '中断不可用')}</button>
          </> : null}
          {mode === 'review' ? <button type="button" disabled={!available || !controlled} onClick={() => void command('native.reviewState')}>{t('Review / continue', '确认并继续')}</button> : null}
          {mode === 'receipt_lookup' ? <button type="button" disabled={busy || !pending} onClick={lookup}>{t('Check receipt', '查询回执')}</button> : null}
        </div>
      </form>
    </main>
    <aside className="context"><div className="eyebrow">{t('Session', '会话')}</div>
      <p>{controlled ? t('This Web client is the FleetSplice controller.', '此网页客户端是 FleetSplice 控制器。') : t('Viewer', '查看者')}</p>
      {thread?.attached && <button disabled={!available || !!snapshot?.controller} onClick={() => void command('native.attach')}>{t('Acquire FleetSplice control', '获取 FleetSplice 控制权')}</button>}
      <button disabled={!available || !controlled || !thread?.attached} onClick={() => void command('native.release')}>{t('Release FleetSplice control', '释放 FleetSplice 控制权')}</button>
      <dl>
        <dt>{t('Model', '模型')}</dt><dd>{thread?.model ?? 'UNOBSERVED'}</dd>
        <dt>{t('Permission', '权限')}</dt><dd>{permission.label}</dd>
        <dt>{t('Connectivity', '连接')}</dt><dd>{snapshot?.state ?? 'CONNECTING'}</dd>
        <dt>Native thread ID</dt><dd className="id" data-testid="adopted-thread-id">{thread?.id ?? '—'}</dd>
        <dt>Active turn ID</dt><dd className="id" data-testid="adopted-turn-id">{thread?.activeTurnId ?? '—'}</dd>
      </dl>
      <h3>{t('Native activity', '原生活动')}</h3><p className="muted">{t('Recent activity only. Older command evidence is retained locally; omitted activity does not imply completion.', '仅显示最近活动。较早的命令证据保留在本机；未显示的活动不代表已完成。')}</p><ul className="activity">{thread?.activity.slice(-8).map(item => <li key={item.id}>{item.status} · {item.text}</li>)}</ul>
      <details className="inspector"><summary>{t('Inspector / developer details', '检查器 / 开发者详情')}</summary>
        <dl>
          <dt>Agent origin</dt><dd>NATIVE_ADOPTED</dd>
          <dt>Workspace</dt><dd>{thread?.workspace ?? snapshot?.workspace}</dd>
          <dt>Daemon PID</dt><dd>{snapshot?.daemon.processId}</dd>
          <dt>{t('Fleet controller fence', 'Fleet 控制栅栏')}</dt><dd>{snapshot?.fence}</dd>
          <dt>Incarnation</dt><dd className="id">{snapshot?.incarnation ?? '—'}</dd>
        </dl>
        <pre>{JSON.stringify({ daemon: snapshot?.daemon, compatibility: snapshot?.compatibility, observationFailure: snapshot?.observationFailure, createdNativeThread: false }, null, 2)}</pre>
        <pre>{JSON.stringify(snapshot?.receipts.at(-1) ?? null, null, 2)}</pre>
      </details>
    </aside>
    <footer><span>{snapshot?.state ?? 'CONNECTING'} · {snapshot?.compatibility.profile ?? 'PROBING'}</span><span className="footer-right">{t('The native TUI remains usable', '原生 TUI 仍可继续使用')}</span></footer>
  </div>;
}
