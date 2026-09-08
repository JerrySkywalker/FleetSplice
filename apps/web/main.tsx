import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { digest } from '../../packages/contracts/json.ts';
import type { FleetCommand, Intent, Snapshot, CommandRecord } from '../../packages/contracts/index.ts';
import './style.css';

type Client = { actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number; csrf: string };
const short = (id: string | null | undefined) => id ? id.slice(0, 8) : '—';
class RequestError extends Error {
  constructor(readonly status: number, readonly result: Record<string, unknown>) { super(typeof result.error === 'string' ? result.error : 'REQUEST_FAILED'); }
}
function App() {
  const [client, setClient] = useState<Client | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('Local Codex session');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<FleetCommand | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('fleetsplice.pending') ?? 'null'); } catch { return null; }
  });
  const clientRef = useRef<Client | null>(null);
  const refreshing = useRef(false);
  const dirty = useRef(false);
  const timeline = useRef<HTMLDivElement>(null);
  const headers = () => ({ 'Content-Type': 'application/json', 'X-Fleet-Client': clientRef.current?.clientInstanceId ?? '', 'X-Fleet-Csrf': clientRef.current?.csrf ?? '' });
  async function request(url: string, body?: unknown) {
    const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', headers: headers(), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const result = await response.json(); if (!response.ok) throw new RequestError(response.status, result); return result;
  }
  async function refresh() {
    if (refreshing.current) { dirty.current = true; return; }
    refreshing.current = true;
    try {
      do { dirty.current = false; const next: Snapshot = await request('/api/snapshot'); setSnapshot(next); }
      while (dirty.current);
    } catch (e) { setError((e as Error).message); }
    finally { refreshing.current = false; }
  }
  useEffect(() => {
    let events: EventSource | undefined;
    (async () => {
      const token = new URLSearchParams(location.hash.slice(1)).get('bootstrap');
      history.replaceState(null, '', location.pathname);
      if (token) await request('/api/bootstrap', { token });
      const identity: Client = await request('/api/client', {});
      clientRef.current = identity; setClient(identity); await refresh();
      events = new EventSource('/api/events'); events.onmessage = () => void refresh();
      events.onerror = () => { setError('Observation connection lost. Refresh evidence before any new action.'); setSnapshot(old => old ? { ...old, status: 'OBSERVATION_UNKNOWN' } : old); };
    })().catch(e => setError(e.message));
    return () => events?.close();
  }, []);
  useEffect(() => { timeline.current?.scrollTo({ top: timeline.current.scrollHeight }); }, [snapshot?.cursor]);
  useEffect(() => {
    if (!client) return;
    const timer = setTimeout(() => setError('GRANT_EXPIRED: this browser has no new mutation authority. Start a fresh attended local run after closing this one.'), Math.max(0, client.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [client]);
  const lane = snapshot?.lanes.find(item => item.laneId === selected);
  const controlled = !!lane && lane.fence.controller === client?.clientInstanceId;
  const available = snapshot?.status === 'READY' && !!client && client.expiresAt > Date.now() && !busy && !pending;
  const receipt = snapshot?.commands.at(-1);
  function acknowledgeRejection(e: unknown, value: FleetCommand): boolean {
    if (!(e instanceof RequestError) || e.status !== 409 || e.result.admission !== 'REJECTED_BEFORE_ADMISSION' || e.result.commandId !== value.commandId || e.result.intentDigest !== value.intentDigest) return false;
    sessionStorage.removeItem('fleetsplice.pending'); setPending(null);
    setError(`${e.message}: command rejected before admission.`); return true;
  }
  async function lookupPending() {
    if (!pending) return;
    setBusy(true);
    try {
      const record: CommandRecord = await request(`/api/commands/${pending.commandId}`);
      if (record.status === 'ADMITTED' || record.status === 'DISPATCHED') throw new Error('Command remains pending. No new native request was sent.');
      sessionStorage.removeItem('fleetsplice.pending'); setPending(null); setError(record.status === 'SUCCEEDED' ? '' : `${record.status}: ${record.receipt?.code ?? 'effect unknown'}`); await refresh();
    } catch (e) { if (acknowledgeRejection(e, pending)) await refresh(); else setError((e as Error).message); } finally { setBusy(false); }
  }
  async function command(family: Intent['family'], body: unknown = {}) {
    if (!available || !client || !snapshot) return;
    setBusy(true); setError('');
    const intent = { v: 1, actorId: client.actorId, clientInstanceId: client.clientInstanceId, grantId: client.grantId, grantRevision: client.grantRevision,
      target: snapshot.target, laneId: ['workspace.register', 'logicalSession.create'].includes(family) ? null : lane?.laneId ?? null,
      expected: ['workspace.register', 'logicalSession.create'].includes(family) ? null : lane?.fence ?? null, family, body } as Intent;
    const value: FleetCommand = { commandId: crypto.randomUUID(), idempotencyKey: crypto.randomUUID(), intentDigest: await digest('intent', intent), intent };
    // Storage failure prevents sending. Response loss keeps the exact intent available for lookup.
    try {
      sessionStorage.setItem('fleetsplice.pending', JSON.stringify(value)); setPending(value);
      const record: CommandRecord = await request('/api/commands', value);
      sessionStorage.removeItem('fleetsplice.pending'); setPending(null);
      if (record.status !== 'SUCCEEDED') setError(`${record.status}: ${record.receipt?.code ?? 'effect unknown'}`);
      if (family === 'logicalSession.create') setSelected(record.plan.laneId);
      if (family === 'turn.submit' && record.status === 'SUCCEEDED') setPrompt('');
      await refresh();
    } catch (e) {
      if (acknowledgeRejection(e, value)) await refresh();
      else setError(`${(e as Error).message}. Use Check command receipt; no automatic retry.`);
    }
    finally { setBusy(false); }
  }
  return <div className="shell">
    <header><div className="brand"><span className="mark">F</span> FleetSplice <span className="edition">LOCAL / M0</span></div><div className="owner">Jerry <span className="avatar">J</span></div></header>
    <aside className="navigation">
      <div className="eyebrow">YOUR FLEET</div><div className="host"><span className={`dot ${snapshot?.status === 'READY' ? 'online' : ''}`}/><strong>SKYFORGE-01</strong></div><div className="environment">└ &nbsp; windows-user</div>
      <div className="section-title">Workspace</div><div className="workspace"><span>▣</span><div><strong>{snapshot?.root.split('\\').at(-1) ?? 'Local Workspace'}</strong><small>{snapshot?.root ?? 'Connect using the local bootstrap link'}</small></div></div>
      {!snapshot?.registered && <button disabled={!available} onClick={() => command('workspace.register', { root: snapshot?.root })}>Register selected Workspace</button>}
      <div className="section-title">Sessions <span>{snapshot?.lanes.length ?? 0}</span></div>
      <nav aria-label="Sessions">{snapshot?.lanes.map(item => <button className={`session ${selected === item.laneId ? 'selected' : ''}`} key={item.laneId} onClick={() => setSelected(item.laneId)}><span>{item.title}</span><small>{item.state}</small></button>)}</nav>
      <form className="new-session" onSubmit={e => { e.preventDefault(); void command('logicalSession.create', { title }); }}><label htmlFor="title">New session title</label><input id="title" maxLength={80} value={title} onChange={e => setTitle(e.target.value)}/><button disabled={!available || !snapshot?.registered || snapshot.lanes.length >= 24 || !title.trim()}>＋ New session</button></form>
      <div className="local-note">On this machine<br/><span>Native Codex · Read-only</span></div>
    </aside>
    <main>
      <div className="session-heading"><div><div className="eyebrow">SESSION / MAIN LANE</div><h1>{lane?.title ?? 'Your local coding companion'}</h1><div className="subtitle">{lane ? `Logical session ${short(lane.sessionId)} · ${controlled ? 'You have control' : 'Viewer'}` : 'Choose a Workspace, open a session, and start a conversation.'}</div></div><span className="status" data-testid="lane-state">{lane?.state ?? 'NO SESSION'}</span></div>
      {(error || (snapshot && snapshot.status !== 'READY')) && <div role="alert" className="alert">{error || snapshot?.status}</div>}
      {pending && <div className="pending">Command {short(pending.commandId)} needs a receipt.<button disabled={busy} onClick={lookupPending}>Check command receipt</button></div>}
      <div ref={timeline} className="timeline" aria-label="Conversation" role="log" aria-live="polite" aria-relevant="additions text">
        {!lane?.transcript.length && <div className="empty"><div className="empty-symbol">↗</div><h2>A real session. A local starting point.</h2><p>{lane ? 'Acquire control, continue the session, then send a prompt. Responses stream here directly from native Codex.' : 'Create a session from the sidebar to begin.'}</p><div className="path">Browser <span>→</span> Hub <span>→</span> SKYFORGE Edge <span>→</span> Codex</div></div>}
        {lane?.transcript.map((item, index) => <article className={`message ${item.role}`} key={index}><div className="message-label">{item.role === 'user' ? 'YOU' : item.role === 'assistant' ? 'CODEX' : 'SESSION'}</div><div className="message-text" data-testid={item.role === 'assistant' ? 'assistant-text' : undefined}>{item.text || (lane.state === 'RUNNING' ? '…' : '')}</div></article>)}
      </div>
      <form className="composer" onSubmit={e => { e.preventDefault(); void command('turn.submit', { text: prompt }); }}><label htmlFor="prompt">Message Codex</label><textarea id="prompt" placeholder="Ask a question about your work…" maxLength={16000} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={!controlled || lane?.state !== 'IDLE'}/><div><span>Read-only session · No tools or approval auto-allow</span><button className="primary" disabled={!available || !controlled || lane?.state !== 'IDLE' || !prompt.trim()}>Send message <span>↑</span></button></div></form>
    </main>
    <aside className="context"><div className="eyebrow">CONTROL & CONTEXT</div><h3>Session control</h3><p className="muted">{controlled ? 'This browser controls the lane.' : 'Opening a session gives you a view. Acquire control explicitly.'}</p>
      <button disabled={!available || !lane || lane.fence.controller !== null} onClick={() => command('sessionLane.acquireControl')}>Acquire control</button>
      <button disabled={!available || !controlled || !['EMPTY', 'IDLE'].includes(lane?.state ?? '')} onClick={() => command('sessionLane.continue')}>Continue session</button>
      <button disabled={!available || !controlled} onClick={() => command('sessionLane.releaseControl')}>Release control</button>
      <h3>Execution</h3><dl><dt>Host</dt><dd>SKYFORGE-01</dd><dt>Environment</dt><dd>windows-user</dd><dt>Agent</dt><dd>Native Codex app-server</dd><dt>Continuity</dt><dd>{lane?.nativeThreadId ? (snapshot?.status === 'READY' ? 'Same live native session' : 'Native continuity unavailable') : 'Native session not started'}</dd><dt>Control epoch / revision</dt><dd>{lane ? `${lane.fence.epoch} / ${lane.fence.revision}` : '—'}</dd><dt>Native thread</dt><dd className="id">{lane?.nativeThreadId ?? '—'}</dd><dt>Native turn</dt><dd className="id">{lane?.nativeTurnId ?? '—'}</dd></dl>
      <details><summary>Command receipt</summary><pre data-testid="receipt">{receipt ? JSON.stringify({ commandId: receipt.command.commandId, planId: receipt.plan.planId, status: receipt.status, receipt: receipt.receipt }, null, 2) : 'No commands yet'}</pre></details>
    </aside><footer><span className={`dot ${snapshot?.status === 'READY' ? 'online' : ''}`}/><span data-testid="connection-status">{snapshot?.status ?? 'CONNECTING'}</span><span className="footer-right">Local loop · FleetSplice 0.1 / G05</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
