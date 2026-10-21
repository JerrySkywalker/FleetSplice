import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import './style.css';

type Runtime = { adapterId: string; kind: string; installed: boolean; enabled: boolean; shared: boolean; status: string; discoveredSessions: number; evidence: string };
type AgentStatus = { code: string; hub?: string; edge?: string; edgeAdmission?: string; nativeCodex?: string; runId?: string; workspaceRoot?: string };
const sections = ['Overview', 'Gateway', 'Agent Runtimes', 'Sharing', 'Startup', 'Security', 'Diagnostics', 'Advanced'] as const;

function Desktop() {
  const [mode, setMode] = useState<'Workspace' | 'Agent Manager'>('Agent Manager');
  const [workspaceOrigin, setWorkspaceOrigin] = useState('');
  const [workspaceMessage, setWorkspaceMessage] = useState('Open an authenticated Gateway in an isolated Workspace window.');
  const [openingWorkspace, setOpeningWorkspace] = useState(false);
  const [section, setSection] = useState<(typeof sections)[number]>('Overview');
  const [status, setStatus] = useState<AgentStatus>({ code: 'LOADING' });
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [autostart, setAutostart] = useState(false);
  const [workspace, setWorkspace] = useState('');
  const [message, setMessage] = useState('Connecting to the local FleetSplice Agent…');
  const refresh = async (failure?: string) => {
    try {
      const [nextStatus, nextRuntimes, nextAutostart] = await Promise.all([
        invoke<AgentStatus>('agent_status'), invoke<Runtime[]>('agent_runtimes'), invoke<boolean>('autostart_enabled'),
      ]);
      setStatus(nextStatus); setRuntimes(nextRuntimes); setAutostart(nextAutostart); setMessage(failure ?? 'Local Agent state refreshed.');
    } catch (error) { setStatus({ code: 'SUPERVISOR_UNAVAILABLE' }); setMessage(failure ?? String(error)); }
  };
  useEffect(() => { void refresh(); }, []);
  const setSharing = async (runtime: Runtime, shared: boolean) => {
    try {
      await invoke('set_runtime_sharing', { sharing: { adapterId: runtime.adapterId, enabled: shared, shared, scope: { kind: 'ALL_ELIGIBLE' } } });
      setMessage(shared ? 'Sharing resumed through the admitted Agent.' : 'Sharing paused. Existing native work was not terminated.'); await refresh();
    } catch (error) { setMessage(String(error)); }
  };
  return <div className="desktop-shell"><header className="desktop-mode-bar"><strong>FleetSplice</strong><nav aria-label="Desktop mode">
    {(['Workspace', 'Agent Manager'] as const).map(item => <button type="button" key={item} aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>)}
  </nav></header>
  <section className="workspace-launcher" hidden={mode !== 'Workspace'}>
    <h1>Workspace</h1><p>Use the same Web sessions, Attention and Composer. Your Gateway login and Controller grant remain authoritative.</p>
    <form onSubmit={async event => {
      event.preventDefault(); if (openingWorkspace) return;
      setOpeningWorkspace(true);
      try { await invoke('open_workspace', { origin: workspaceOrigin.trim() }); setWorkspaceMessage('Workspace opened. Sign in through the normal Gateway login. Return here using its Agent Manager menu.'); }
      catch (error) { setWorkspaceMessage(String(error)); }
      finally { setOpeningWorkspace(false); }
    }}>
      <label htmlFor="workspace-origin">Gateway origin</label><input id="workspace-origin" type="url" required placeholder="https://gateway.example.test" value={workspaceOrigin} onChange={event => setWorkspaceOrigin(event.target.value)} />
      <p className="muted">Enter an origin only, without credentials, path, query or bootstrap fragment. Local first-use bootstrap authentication is not available in this window.</p>
      <button type="submit" disabled={openingWorkspace || !workspaceOrigin.trim()}>{openingWorkspace ? 'Opening…' : 'Open / return to Workspace'}</button>
    </form>
    <p role="status">{workspaceMessage}</p><p className="muted">Desktop does not grant control automatically. Closing Workspace does not stop native work. A login or connection failure can be retried by returning to the same window; no native command is replayed.</p>
  </section>
  <main hidden={mode !== 'Agent Manager'}>
    <aside><h1>FleetSplice</h1><p className="muted">Windows Desktop</p>{sections.map(item => <button key={item} className={section === item ? 'selected' : ''} onClick={() => setSection(item)}>{item}</button>)}</aside>
    <section><header><div><h2>{section}</h2><p className="muted">{message}</p></div><button onClick={() => void refresh()}>Refresh</button></header>
      {section === 'Overview' && <div className="cards"><article><b>Agent</b><strong>{status.code}</strong></article><article><b>Gateway</b><strong>{status.hub ?? 'Unavailable'}</strong></article><article><b>Native Codex</b><strong>{status.nativeCodex ?? 'Not started'}</strong></article></div>}
      {section === 'Gateway' && <article><b>Connection state</b><p>Hub: {status.hub ?? 'Unavailable'} · Edge: {status.edge ?? 'Unavailable'} · Admission: {status.edgeAdmission ?? 'Unavailable'}</p><p>Active workspace: {status.workspaceRoot ?? 'None'}</p><label>Workspace for this Agent<input value={workspace} onChange={event => setWorkspace(event.target.value)} placeholder="C:\\src\\your-workspace" /></label><button onClick={async () => { try { const next = await invoke<AgentStatus>('onboard_agent', { workspace }); setStatus(next); setMessage('Workspace registered and local Agent started.'); } catch (error) { await refresh(String(error)); } }}>Start local Agent</button><button onClick={() => void invoke('open_dashboard')}>Open Dashboard</button><button onClick={async () => { try { const result = await invoke<{ approvalUrl: string; publicFingerprint: string }>('request_pairing'); setMessage(`Pairing request created for ${result.publicFingerprint}. Approve it in the Dashboard.`); await invoke('open_dashboard'); } catch (error) { setMessage(String(error)); } }}>Connect to Fleet</button></article>}
      {(section === 'Agent Runtimes' || section === 'Sharing') && <div className="stack">{runtimes.map(runtime => <article key={runtime.adapterId}><b>{runtime.kind}</b><p>{runtime.status} · discovered sessions: {runtime.discoveredSessions}</p><p className="muted">{runtime.evidence}</p>{runtime.installed ? <button onClick={() => void setSharing(runtime, !runtime.shared)}>{runtime.shared ? 'Pause sharing' : 'Resume sharing'}</button> : <span className="muted">Not available</span>}</article>)}</div>}
      {section === 'Startup' && <article><b>Start with Windows</b><p>User-controlled startup for this Desktop application.</p><button onClick={async () => { try { const next = await invoke<boolean>('set_autostart', { enabled: !autostart }); setAutostart(next); setMessage(next ? 'Start with Windows enabled.' : 'Start with Windows disabled.'); } catch (error) { setMessage(String(error)); } }}>{autostart ? 'Disable autostart' : 'Enable autostart'}</button></article>}
      {section === 'Diagnostics' && <article><b>Diagnostics</b><pre>{JSON.stringify(status, null, 2)}</pre><button onClick={() => void invoke('open_logs')}>Open local logs</button></article>}
      {['Security', 'Advanced'].includes(section) && <article><b>{section}</b><p>Configuration remains owned by the local Agent and is exposed through its authenticated local IPC.</p></article>}
    </section>
  </main></div>;
}
createRoot(document.getElementById('root')!).render(<Desktop />);
