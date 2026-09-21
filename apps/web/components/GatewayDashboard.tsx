import React, { useEffect, useState } from 'react';

export type FleetSummary = {
  gateway: { status: string; deployment: { profile: string; apiBaseUrl: string; hcpUrl: string; loginUrl: string } };
  hosts: { hostId: string; status: string; lastSeen: string }[];
  runtimes: { adapterId: string; enabled: boolean; shared: boolean; status: string; discoveredSessions: number; observation: string | null }[];
  sessions: { discovered: number; active: number };
  attention: { code: string }[];
  devices: { requestId: string; hostName: string; publicFingerprint: string; enrollmentGeneration: string; state: string; lastSeen: string | null; runtimeSharing: string }[];
};
type Principal = { principal: { issuer: string; subject: string; displayName: string | null; email: string | null }; mode: string };
const sections = ['Fleet', 'Sessions', 'Attention', 'Hosts', 'Devices', 'Agent Runtimes', 'Settings'] as const;
type Section = typeof sections[number];

export function GatewayDashboard({ request, ready }: { request: (url: string, body?: unknown) => Promise<any>; ready: boolean }) {
  const [section, setSection] = useState<Section>('Fleet'); const [summary, setSummary] = useState<FleetSummary | null>(null); const [principal, setPrincipal] = useState<Principal | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!ready) return; let live = true; void Promise.all([request('/api/fleet/summary'), request('/api/auth/principal')]).then(([next, identity]) => { if (live) { setSummary(next); setPrincipal(identity); } }).catch(error => live && setError(error instanceof Error ? error.message : 'REQUEST_FAILED')); return () => { live = false; }; }, [ready]);
  return <section className="gateway-dashboard" aria-label="Fleet Gateway Dashboard">
    <nav className="gateway-nav" aria-label="Fleet navigation">{sections.map(item => <button key={item} className={section === item ? 'selected' : ''} onClick={() => setSection(item)}>{item}</button>)}</nav>
    {error && <div role="alert" className="alert">Dashboard projection unavailable: {error}</div>}
    {section === 'Fleet' && <div className="fleet-summary" data-testid="fleet-summary">
      <div><small>Gateway</small><strong>{summary?.gateway.status ?? 'unknown'}</strong><span>{summary?.gateway.deployment.profile ?? 'unavailable'}</span></div>
      <div><small>Hosts</small><strong>{summary?.hosts.length ?? 0}</strong><span>{summary?.hosts[0]?.status ?? 'unknown'}</span></div>
      <div><small>Sessions</small><strong>{summary?.sessions.discovered ?? 0}</strong><span>{summary ? `${summary.sessions.active} active` : 'unknown'}</span></div>
      <div><small>Attention</small><strong>{summary?.attention.length ?? 0}</strong><span>{summary?.attention.map(item => item.code).join(', ') || 'none observed'}</span></div>
    </div>}
    {section === 'Attention' && <p className="gateway-panel">{summary?.attention.length ? summary.attention.map(item => item.code).join(', ') : 'No attention state is currently observed.'}</p>}
    {section === 'Hosts' && <p className="gateway-panel">{summary?.hosts.map(item => `${item.hostId}: ${item.status}`).join(', ') ?? 'Host projection unavailable.'}</p>}
    {section === 'Devices' && <div className="gateway-panel">{summary?.devices.length ? summary.devices.map(device => <p key={device.requestId}><strong>{device.hostName}</strong> · {device.state} · {device.publicFingerprint} · generation {device.enrollmentGeneration} · last seen {device.lastSeen ?? 'not connected'} · sharing {device.runtimeSharing} {device.state === 'PENDING' && <button onClick={() => void request(`/api/devices/${device.requestId}/approve`, {}).then(() => window.location.reload())}>Approve</button>} {device.state === 'APPROVED' && <button onClick={() => void request(`/api/devices/${device.requestId}/revoke`, {}).then(() => window.location.reload())}>Revoke</button>}</p>) : 'No device enrollment requests are currently projected.'}</div>}
    {section === 'Agent Runtimes' && <p className="gateway-panel">{summary?.runtimes.length ? summary.runtimes.map(item => `${item.adapterId}: ${item.status}, shared=${item.shared}, sessions=${item.discoveredSessions}`).join('; ') : 'No shared runtime projection is available.'}</p>}
    {section === 'Settings' && <div className="gateway-panel"><p><strong>General</strong>: Fleet Gateway projection is read-only here.</p><p><strong>Authentication</strong>: {principal?.mode ?? 'unknown'} · {principal?.principal.displayName ?? principal?.principal.subject ?? 'not signed in'}</p><p>Issuer: {principal?.principal.issuer ?? 'unknown'}</p><p><strong>Gateway / deployment</strong>: {summary?.gateway.deployment.apiBaseUrl ?? 'unknown'}</p><p>HCP endpoint: {summary?.gateway.deployment.hcpUrl ?? 'unknown'}</p><p><strong>Devices</strong>: {summary?.devices.length ?? 0} projected.</p><p><strong>Appearance</strong>: controlled by the FleetSplice display preferences above.</p><p><strong>Diagnostics</strong>: host status {summary?.gateway.status ?? 'unknown'}.</p></div>}
  </section>;
}
