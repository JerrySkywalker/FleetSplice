import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../../packages/ui/components/button.tsx';
import { Badge } from '../../../packages/ui/components/badge.tsx';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../../packages/ui/components/collapsible.tsx';
import type { Locale } from '../../../packages/ui/i18n.ts';

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
const zhSections = { Fleet: 'Fleet', Sessions: '会话', Attention: '待处理', Hosts: '主机', Devices: '设备', 'Agent Runtimes': '代理运行时', Settings: '设置' };

export function GatewayDashboard({ request, ready, compact = false, locale = 'en-US' }: { request: (url: string, body?: unknown) => Promise<any>; ready: boolean; compact?: boolean; locale?: Locale }) {
  const [section, setSection] = useState<Section>('Fleet'); const [summary, setSummary] = useState<FleetSummary | null>(null); const [principal, setPrincipal] = useState<Principal | null>(null); const [error, setError] = useState<string | null>(null);
  const t = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  useEffect(() => { if (!ready) return; let live = true; void Promise.all([request('/api/fleet/summary'), request('/api/auth/principal')]).then(([next, identity]) => { if (live) { setSummary(next); setPrincipal(identity); } }).catch(error => live && setError(error instanceof Error ? error.message : 'REQUEST_FAILED')); return () => { live = false; }; }, [ready]);
  const unreported = t('Not reported', '未报告');
  const empty = (message: string, zh: string) => summary ? t(message, zh) : error ? t('Projection unavailable.', '投影不可用。') : t('Loading projection…', '正在加载投影…');
  const content = <>
    <nav className="gateway-nav" aria-label={t('Fleet navigation', 'Fleet 导航')}>{sections.map(item => <Button type="button" key={item} variant={section === item ? 'secondary' : 'ghost'} onClick={() => setSection(item)} aria-current={section === item ? 'page' : undefined}>{locale === 'zh-CN' ? zhSections[item] : item}</Button>)}</nav>
    {error && <div role="alert" className="alert">{t('Dashboard projection unavailable', '仪表板投影不可用')}: {error}</div>}
    {section === 'Fleet' && <dl className="gateway-summary-list" data-testid="fleet-summary">
      <dt>{t('Gateway', '网关')}</dt><dd><Badge variant="secondary">{summary?.gateway.status ?? unreported}</Badge></dd>
      <dt>{t('Profile', '部署配置')}</dt><dd>{summary?.gateway.deployment.profile ?? unreported}</dd>
      <dt>{t('Hosts', '主机')}</dt><dd>{summary ? summary.hosts.length : '—'}</dd>
      <dt>{t('Sessions', '会话')}</dt><dd>{summary ? `${summary.sessions.discovered} · ${summary.sessions.active} ${t('active', '活动')}` : '—'}</dd>
      <dt>{t('Attention', '待处理')}</dt><dd>{summary ? summary.attention.length : '—'}</dd>
    </dl>}
    {section === 'Sessions' && <p className="gateway-panel">{summary ? t(`${summary.sessions.discovered} discovered sessions · ${summary.sessions.active} active. Select sessions in the workspace navigation.`, `已发现 ${summary.sessions.discovered} 个会话，${summary.sessions.active} 个活动会话。请在工作区导航中选择会话。`) : empty('', '')}</p>}
    {section === 'Attention' && <p className="gateway-panel">{summary?.attention.length ? summary.attention.map(item => item.code).join(', ') : empty('No attention state is currently observed.', '当前未观察到待处理状态。')}</p>}
    {section === 'Hosts' && <ul className="gateway-rows">{summary?.hosts.length ? summary.hosts.map(host => <li key={host.hostId}><strong>{host.hostId}</strong><Badge variant="secondary">{host.status}</Badge><span className="muted">{host.lastSeen}</span></li>) : <li>{empty('No hosts are reported.', '未报告主机。')}</li>}</ul>}
    {section === 'Devices' && <div className="gateway-rows">{summary?.devices.length ? summary.devices.map(device => <article key={device.requestId}>
      <header><strong>{device.hostName}</strong><Badge variant="secondary">{device.state}</Badge></header>
      <p className="id">{device.publicFingerprint}</p><p>{t('Generation', '登记代次')}: {device.enrollmentGeneration} · {t('Last seen', '最近在线')}: {device.lastSeen ?? t('not connected', '未连接')} · {t('Sharing', '共享')}: {device.runtimeSharing}</p>
      {device.state === 'PENDING' && <Button type="button" onClick={() => void request(`/api/devices/${device.requestId}/approve`, {}).then(() => window.location.reload())}>{t('Approve', '批准')}</Button>}
      {device.state === 'APPROVED' && <Button type="button" variant="outline" onClick={() => void request(`/api/devices/${device.requestId}/revoke`, {}).then(() => window.location.reload())}>{t('Revoke', '撤销')}</Button>}
    </article>) : <p>{empty('No device enrollment requests are currently projected.', '当前未投影设备登记请求。')}</p>}</div>}
    {section === 'Agent Runtimes' && <ul className="gateway-rows">{summary?.runtimes.length ? summary.runtimes.map(runtime => <li key={runtime.adapterId}><strong>{runtime.adapterId}</strong><Badge variant="secondary">{runtime.status}</Badge><p>{runtime.shared ? t('Shared', '已共享') : t('Not shared', '未共享')} · {runtime.discoveredSessions} {t('sessions', '个会话')}</p>{runtime.observation && <p className="muted">{runtime.observation}</p>}</li>) : <li>{empty('No shared runtime projection is available.', '没有可用的共享运行时投影。')}</li>}</ul>}
    {section === 'Settings' && <div className="gateway-panel">
      <p><strong>{t('General', '常规')}</strong>: {t('Fleet Gateway projection is read-only here.', '此处只读展示 Fleet 网关投影。')}</p>
      <p><strong>{t('Authentication', '认证')}</strong>: {principal?.mode ?? unreported} · {principal?.principal.displayName ?? principal?.principal.subject ?? t('not signed in', '未登录')}</p>
      <p>{t('Issuer', '签发者')}: {principal?.principal.issuer ?? unreported}</p>
      <p><strong>{t('Gateway / deployment', '网关 / 部署')}</strong>: {summary?.gateway.deployment.apiBaseUrl ?? unreported}</p><p>HCP: {summary?.gateway.deployment.hcpUrl ?? unreported}</p>
      <p><strong>{t('Devices', '设备')}</strong>: {summary ? summary.devices.length : '—'}</p>
      <p><strong>{t('Appearance', '外观')}</strong>: {t('Use display preferences in the title bar.', '由标题栏的显示偏好设置管理。')}</p>
      <p><strong>{t('Diagnostics', '诊断')}</strong>: {summary?.gateway.status ?? unreported}</p>
    </div>}
  </>;
  return compact ? <Collapsible className="gateway-dashboard gateway-compact" aria-label={t('Fleet Gateway Dashboard', 'Fleet 网关仪表板')}>
    <CollapsibleTrigger render={<Button type="button" variant="ghost" className="w-full justify-between"/>} data-testid="fleet-overview-trigger">{t('Fleet overview', 'Fleet 概览')}<ChevronDown size={14}/></CollapsibleTrigger>
    <CollapsibleContent className="gateway-content">{content}</CollapsibleContent>
  </Collapsible> : <section className="gateway-dashboard" aria-label={t('Fleet Gateway Dashboard', 'Fleet 网关仪表板')}>{content}</section>;
}
