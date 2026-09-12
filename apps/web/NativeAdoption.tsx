import React, { useEffect, useRef, useState } from 'react';
import type { AdoptionCommand, AdoptionReceipt, AdoptionSnapshot, NativeTurn } from '../../packages/native-adoption/types.ts';
import type { Locale } from './i18n.ts';

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
  const refreshing = useRef(false);
  async function refresh() {
    if (refreshing.current) return;
    refreshing.current = true;
    try { setSnapshot(await request('/api/native/snapshot')); }
    catch (e) { setError(e instanceof Error ? e.message : 'NATIVE_OBSERVATION_LOST'); setSnapshot(old => old ? { ...old, state: 'NATIVE_OBSERVATION_LOST' } : old); }
    finally { refreshing.current = false; }
  }
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 3000); return () => clearInterval(timer); }, []);
  const thread = snapshot?.threads.find(item => item.id === selected) ?? snapshot?.threads[0];
  const controlled = snapshot?.controller === client.clientInstanceId;
  const available = snapshot?.state === 'READY' && snapshot.compatibility.profile === 'ADOPT_FULL' && !busy && !pending && client.expiresAt > Date.now();
  const canControl = available && controlled && thread?.attached && !thread.externalAdvance;
  const interrupt = snapshot?.compatibility.capabilities.interrupt.available;
  const steer = snapshot?.compatibility.capabilities.steer.available;
  function receiptObserved(receipt: AdoptionReceipt) {
    sessionStorage.removeItem('fleetsplice.native.pending'); setPending(null);
    setError(receipt.status === 'SUCCEEDED' ? '' : `${receipt.status}: ${receipt.code}`);
    if (receipt.status === 'SUCCEEDED' && ['native.submit', 'native.steer'].includes(receipt.family)) setText('');
  }
  async function command(family: AdoptionCommand['family'], approval?: AdoptionCommand['approval']) {
    if (!available || !snapshot || !thread) return;
    const value: AdoptionCommand = { commandId: crypto.randomUUID(), runtimeId: snapshot.runtimeId,
      incarnation: snapshot.incarnation, clientInstanceId: client.clientInstanceId, expectedFence: snapshot.fence,
      threadId: thread.id, stateToken: thread.stateToken, activeTurnId: thread.activeTurnId, family, text: ['native.submit', 'native.steer'].includes(family) ? text : '' };
    if (approval) value.approval = approval;
    setBusy(true); setError('');
    try {
      sessionStorage.setItem('fleetsplice.native.pending', JSON.stringify(value)); setPending(value);
      receiptObserved(await request('/api/native/commands', value)); await refresh();
    } catch (e) { setError(`${t('Outcome unknown. Check the receipt; do not resend.', '结果未知。请查询回执，不要重发。')} ${e instanceof Error ? e.message : ''}`); }
    finally { setBusy(false); }
  }
  async function lookup() {
    if (!pending) return; setBusy(true);
    try { receiptObserved(await request(`/api/native/commands/${pending.commandId}`)); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'COMMAND_UNKNOWN_NO_REPLAY'); }
    finally { setBusy(false); }
  }
  return <div className="shell native-demo">
    <header><div className="brand"><span className="mark">F</span> FleetSplice <span className="edition">{t('NATIVE ADOPTION · LOCAL DEMO', '原生会话接入 · 本地演示')}</span></div>{preferences}</header>
    <aside className="navigation"><div className="eyebrow">{t('Running Native Agents', '正在运行的原生代理')}</div>
      <p className="muted">{t('Start Codex in Windows Terminal, then attach here.', '在 Windows Terminal 中启动 Codex，然后在此接入。')}</p>
      <code>codex --sandbox read-only --ask-for-approval on-request</code>
      {!snapshot?.threads.length && <p>{t('Waiting for an existing native thread.', '等待已有原生会话。')}</p>}
      {snapshot?.threads.map(item => <button className={`session ${thread?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected(item.id)} key={item.id}>
        <strong>Codex</strong><span>{t('Native adopted', '原生接入')}</span><small>{item.workspace}</small><small>{item.status}{item.activeTurnId ? ` · ${t('active turn', '活动轮次')}` : ''}</small><small>{item.permission ?? t('Permission not yet observed', '权限尚未观察')}</small>
      </button>)}
      <button disabled={busy} onClick={() => void refresh()}>{t('Refresh discovery', '刷新发现')}</button>
      <div className="local-note">{t('Local browser only', '仅限本地浏览器')}<br/>{snapshot?.compatibility.profile ?? 'PROBING'}</div>
    </aside>
    <main>
      <div className="session-heading"><div><div className="eyebrow">{t('Existing native conversation', '已有的原生对话')}</div><h1>{thread ? 'Codex · Native adopted' : t('Running Native Agents', '正在运行的原生代理')}</h1>
        <div className="subtitle">{thread?.workspace}</div></div><span className="status">{thread?.activeTurnId && thread.turns.find(turn => turn.id === thread.activeTurnId) ? <TurnStatus turn={thread.turns.find(turn => turn.id === thread.activeTurnId)!} locale={locale} live={snapshot?.state === 'READY'}/> : thread?.status ?? 'WAITING'}</span></div>
      <div className="native-cooperative"><strong>CONTROL_MODE=COOPERATIVE</strong><p>{t('Local Codex TUI remains connected and may still issue native input.', '本地 Codex TUI 仍保持连接，也可以继续输入。')}</p></div>
      {(error || (snapshot && snapshot.state !== 'READY')) && <div role="alert" className="alert">{error || snapshot?.state}</div>}
      {pending && <div className="pending">{t('Pending command receipt', '等待命令回执')} <code>{pending.commandId}</code><button disabled={busy} onClick={lookup}>{t('Check receipt', '查询回执')}</button></div>}
      {thread?.externalAdvance && <div className="alert">NATIVE_STATE_ADVANCED_EXTERNALLY<p>{t('Native state changed outside this Web controller. Read the updated conversation, then acknowledge it before controlling.', '原生状态已由此网页控制器之外的输入改变。请阅读更新后的对话，再确认当前状态以继续控制。')}</p>
        <button disabled={!available || !controlled} onClick={() => void command('native.reviewState')}>{t('I reviewed the current native state', '我已查看当前原生状态')}</button></div>}
      {thread?.residualCommandState === 'MAY_STILL_BE_RUNNING' && <div className="alert">{t('A native command may still be finishing in the background. Interrupt does not terminate the daemon, TUI or command process.', '原生命令可能仍在后台收尾。中断轮次不代表守护进程、TUI 或命令进程已终止。')}</div>}
      {thread?.residualCommandState === 'OBSERVED_DRAINED' && <p className="muted" data-residual-state="OBSERVED_DRAINED">{t('Observed interrupted-turn commands have finished. The turn remains interrupted.', '已观察到的中断轮次命令已结束。轮次仍为已中断。')}</p>}
      {!thread?.attached && <div className="native-attach"><button className="primary" disabled={!available || !thread || (!!snapshot?.controller && !controlled)} onClick={() => void command('native.attach')}>{t('Attach', '接入')}</button></div>}
      <div className="timeline" role="log" aria-label={t('Native conversation', '原生对话')}>
        {thread?.attached && thread.turns.map(turn => <React.Fragment key={turn.id}>
          {thread.history.filter(message => message.turnId === turn.id).map((message, index) => <article className={`message ${message.role}`} key={`${message.turnId}-${index}`}><div className="message-label">{message.role === 'user' ? t('Native user input', '原生用户输入') : 'Codex'}
            {message.role === 'user' && <small className="native-source-badge" data-source={message.source?.kind ?? 'NATIVE_EXTERNAL'} title={message.source?.kind === 'FLEETSPLICE_WEB' ? message.source.clientInstanceId : undefined}>{message.source?.kind === 'FLEETSPLICE_WEB' ? `Web${message.source.deviceLabel || message.source.clientDisplayLabel ? ` · ${message.source.deviceLabel || message.source.clientDisplayLabel}` : ''}` : t('Native external client', '原生外部客户端')}</small>}
          </div><div className="message-text">{message.text}</div></article>)}
          <div className="native-turn-marker"><TurnStatus turn={turn} locale={locale} live={snapshot?.state === 'READY'}/></div>
        </React.Fragment>)}
        {thread?.historyLimited && <p className="muted">{t('Showing bounded recent history.', '仅显示最近的有限历史。')}</p>}
      </div>
      {thread?.attached && <section className="native-approvals" aria-label={t('Approvals', '审批')}>
        {!snapshot?.compatibility.capabilities.approvalResolve.available && <p>APPROVAL_UNAVAILABLE</p>}
        {snapshot?.approvals?.filter(a => a.threadId === thread.id).slice(-8).map(a => <article key={`${typeof a.requestId}:${a.requestId}`}>
          <strong>{a.status === 'PENDING' ? t('Needs approval', '需要审批') : a.status === 'RESOLVED' ? t('Native request resolved', '原生请求已解决') : a.status === 'STALE' ? 'STALE_NATIVE_REQUEST' : a.status}</strong>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{a.summary}</p><small>{a.workspace} · {a.requestType} · {t('Turn', '轮次')} {a.turnId}</small>
          {!a.supported && <p>APPROVAL_UNAVAILABLE</p>}
          {a.supported && a.status === 'PENDING' && <div>
            {(['ALLOW_ONCE', 'DENY'] as const).map(decision => <button key={decision} disabled={!available || !controlled || !a.authority || !snapshot.compatibility.capabilities.approvalResolve.available}
              onClick={() => void command('native.approval', { requestId: a.requestId, threadId: a.threadId, turnId: a.turnId,
                itemId: a.itemId, requestType: a.requestType, digest: a.digest, authority: a.authority!, decision })}>{decision === 'ALLOW_ONCE' ? t('Allow once', '允许一次') : t('Deny', '拒绝')}</button>)}
          </div>}
        </article>)}
      </section>}
      <form className="composer" onSubmit={event => { event.preventDefault(); void command('native.submit'); }}>
        <label htmlFor="native-prompt">{t('Continue this native conversation', '继续此原生对话')}</label><textarea id="native-prompt" maxLength={16000} value={text} onChange={event => setText(event.target.value)} disabled={!canControl}/>
        <div className="native-controls"><button type="submit" className="primary" disabled={!canControl || thread?.status !== 'idle' || !text.trim()}>{t('Send continuation', '发送后续对话')}</button>
          <button type="button" disabled={!canControl || !steer || !thread?.activeTurnId || !text.trim()} onClick={() => void command('native.steer')}>{steer ? t('Steer', '引导当前轮次') : t('Steer unavailable', '引导不可用')}</button>
          <button type="button" disabled={!canControl || !interrupt || !thread?.activeTurnId} onClick={() => void command('native.interrupt')}>{interrupt ? t('Interrupt turn', '中断轮次') : t('Interrupt unavailable', '中断不可用')}</button></div>
      </form>
    </main>
    <aside className="context"><div className="eyebrow">{t('Native identity', '原生身份')}</div>
      <p>{controlled ? t('This Web client is the FleetSplice controller.', '此网页客户端是 FleetSplice 控制器。') : t('Viewer', '查看者')}</p>
      {thread?.attached && <button disabled={!available || !!snapshot?.controller} onClick={() => void command('native.attach')}>{t('Acquire FleetSplice control', '获取 FleetSplice 控制权')}</button>}
      <button disabled={!available || !controlled || !thread?.attached} onClick={() => void command('native.release')}>{t('Release FleetSplice control', '释放 FleetSplice 控制权')}</button>
      <dl><dt>Agent origin</dt><dd>NATIVE_ADOPTED</dd><dt>Native thread ID</dt><dd className="id" data-testid="adopted-thread-id">{thread?.id ?? '—'}</dd><dt>Active turn ID</dt><dd className="id" data-testid="adopted-turn-id">{thread?.activeTurnId ?? '—'}</dd>
        <dt>Workspace</dt><dd>{thread?.workspace ?? snapshot?.workspace}</dd><dt>{t('Observed model', '观察到的模型')}</dt><dd>{thread?.model ?? 'UNOBSERVED'}</dd><dt>{t('Observed permission', '观察到的权限')}</dt><dd>{thread?.permission ?? 'UNOBSERVED'}</dd><dt>Daemon PID</dt><dd>{snapshot?.daemon.processId}</dd><dt>{t('Fleet controller fence', 'Fleet 控制栅栏')}</dt><dd>{snapshot?.fence}</dd></dl>
      <h3>{t('Native activity', '原生活动')}</h3><p className="muted">{t('Recent activity only. Older command evidence is retained locally; omitted activity does not imply completion.', '仅显示最近活动。较早的命令证据保留在本机；未显示的活动不代表已完成。')}</p><ul className="activity">{thread?.activity.slice(-8).map(item => <li key={item.id}>{item.status} · {item.text}</li>)}</ul>
      <details><summary>{t('Daemon and capabilities', '守护进程与能力')}</summary><pre>{JSON.stringify({ daemon: snapshot?.daemon, compatibility: snapshot?.compatibility, incarnation: snapshot?.incarnation, observationFailure: snapshot?.observationFailure, createdNativeThread: false }, null, 2)}</pre></details>
      <details><summary>{t('Latest receipt', '最新回执')}</summary><pre>{JSON.stringify(snapshot?.receipts.at(-1) ?? null, null, 2)}</pre></details>
    </aside>
    <footer><span>{snapshot?.state ?? 'CONNECTING'} · {snapshot?.compatibility.profile ?? 'PROBING'}</span><span className="footer-right">{t('The native TUI remains usable', '原生 TUI 仍可继续使用')}</span></footer>
  </div>;
}
