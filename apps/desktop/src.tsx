import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import './style.css';

type Runtime = { adapterId: string; kind: string; installed: boolean; enabled: boolean; shared: boolean; status: string; discoveredSessions: number; evidence: string };
type AgentStatus = { code: string; hub?: string; edge?: string; edgeAdmission?: string; nativeCodex?: string; runId?: string };
const sections = ['Overview', 'Gateway', 'Agent Runtimes', 'Sharing', 'Startup', 'Security', 'Diagnostics', 'Advanced'] as const;

function Desktop() {
  const [section, setSection] = useState<(typeof sections)[number]>('Overview');
  const [status, setStatus] = useState<AgentStatus>({ code: 'LOADING' });
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [autostart, setAutostart] = useState(false);
  const [message, setMessage] = useState('Connecting to the local FleetSplice Agent…');
  const refresh = async () => {
    try {
      const [nextStatus, nextRuntimes, nextAutostart] = await Promise.all([
        invoke<AgentStatus>('agent_status'), invoke<Runtime[]>('agent_runtimes'), invoke<boolean>('autostart_enabled'),
      ]);
      setStatus(nextStatus); setRuntimes(nextRuntimes); setAutostart(nextAutostart); setMessage('Local Agent state refreshed.');
    } catch (error) { setStatus({ code: 'SUPERVISOR_UNAVAILABLE' }); setMessage(String(error)); }
  };
  useEffect(() => { void refresh(); }, []);
  const setSharing = async (runtime: Runtime, shared: boolean) => {
    try {
      await invoke('set_runtime_sharing', { sharing: { adapterId: runtime.adapterId, enabled: shared, shared, scope: { kind: 'ALL_ELIGIBLE' } } });
      setMessage(shared ? 'Sharing resumed through the admitted Agent.' : 'Sharing paused. Existing native work was not terminated.'); await refresh();
    } catch (error) { setMessage(String(error)); }
  };
  return <main>
    <aside><h1>FleetSplice</h1><p className="muted">Windows Desktop</p>{sections.map(item => <button key={item} className={section === item ? 'selected' : ''} onClick={() => setSection(item)}>{item}</button>)}</aside>
    <section><header><div><h2>{section}</h2><p className="muted">{message}</p></div><button onClick={() => void refresh()}>Refresh</button></header>
      {section === 'Overview' && <div className="cards"><article><b>Agent</b><strong>{status.code}</strong></article><article><b>Gateway</b><strong>{status.hub ?? 'Unavailable'}</strong></article><article><b>Native Codex</b><strong>{status.nativeCodex ?? 'Not started'}</strong></article></div>}
      {section === 'Gateway' && <article><b>Connection state</b><p>Hub: {status.hub ?? 'Unavailable'} · Edge: {status.edge ?? 'Unavailable'} · Admission: {status.edgeAdmission ?? 'Unavailable'}</p><button onClick={() => void invoke('open_dashboard')}>Open Dashboard</button><button onClick={async () => { try { const result = await invoke<{ approvalUrl: string; publicFingerprint: string }>('request_pairing'); setMessage(`Pairing request created for ${result.publicFingerprint}. Approve it in the Dashboard.`); await invoke('open_dashboard'); } catch (error) { setMessage(String(error)); } }}>Connect to Fleet</button></article>}
      {(section === 'Agent Runtimes' || section === 'Sharing') && <div className="stack">{runtimes.map(runtime => <article key={runtime.adapterId}><b>{runtime.kind}</b><p>{runtime.status} · discovered sessions: {runtime.discoveredSessions}</p><p className="muted">{runtime.evidence}</p>{runtime.installed ? <button onClick={() => void setSharing(runtime, !runtime.shared)}>{runtime.shared ? 'Pause sharing' : 'Resume sharing'}</button> : <span className="muted">Not available</span>}</article>)}</div>}
      {section === 'Startup' && <article><b>Start with Windows</b><p>User-controlled startup for this Desktop application.</p><button onClick={async () => { try { const next = await invoke<boolean>('set_autostart', { enabled: !autostart }); setAutostart(next); setMessage(next ? 'Start with Windows enabled.' : 'Start with Windows disabled.'); } catch (error) { setMessage(String(error)); } }}>{autostart ? 'Disable autostart' : 'Enable autostart'}</button></article>}
      {section === 'Diagnostics' && <article><b>Diagnostics</b><pre>{JSON.stringify(status, null, 2)}</pre><button onClick={() => void invoke('open_logs')}>Open local logs</button></article>}
      {['Security', 'Advanced'].includes(section) && <article><b>{section}</b><p>Configuration remains owned by the local Agent and is exposed through its authenticated local IPC.</p></article>}
    </section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Desktop />);
