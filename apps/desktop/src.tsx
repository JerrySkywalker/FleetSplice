import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import { RefreshCw, ArrowUpRight, Monitor, LayoutGrid } from 'lucide-react';
import { Button } from '../../packages/ui/components/button.tsx';
import { Input } from '../../packages/ui/components/input.tsx';
import { Badge } from '../../packages/ui/components/badge.tsx';
import { PreferencesControl } from '../../packages/ui/PreferencesControl.tsx';
import { browserStorage, readPreferences, persistPreference, resolveTheme, type Appearance } from '../../packages/ui/preferences.ts';
import type { Locale } from '../../packages/ui/i18n.ts';
import './style.css';

type Runtime = { adapterId: string; kind: string; installed: boolean; enabled: boolean; shared: boolean; status: string; discoveredSessions: number; evidence: string };
type AgentStatus = { code: string; hub?: string; edge?: string; edgeAdmission?: string; nativeCodex?: string; runId?: string; workspaceRoot?: string };
const sections = ['Overview', 'Gateway', 'Agent Runtimes', 'Sharing', 'Startup', 'Security', 'Diagnostics', 'Advanced'] as const;
const zhSections = { Overview: '概览', Gateway: '网关', 'Agent Runtimes': '代理运行时', Sharing: '共享', Startup: '启动', Security: '安全', Diagnostics: '诊断', Advanced: '高级' };
const initialPreferences = readPreferences(browserStorage(), navigator.languages.length ? navigator.languages : [navigator.language]);

function Desktop() {
  const [locale, setLocale] = useState(initialPreferences.locale);
  const [appearance, setAppearance] = useState(initialPreferences.appearance);
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const [saves, setSaves] = useState({ locale: true, appearance: true });
  const t = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const [mode, setMode] = useState<'Workspace' | 'Agent Manager'>('Agent Manager');
  const [workspaceOrigin, setWorkspaceOrigin] = useState('');
  const [workspaceMessage, setWorkspaceMessage] = useState(() => t('Open an authenticated Gateway in an isolated Workspace window.', '在独立工作区窗口中打开已认证的网关。'));
  const [openingWorkspace, setOpeningWorkspace] = useState(false);
  const [section, setSection] = useState<(typeof sections)[number]>('Overview');
  const [status, setStatus] = useState<AgentStatus>({ code: 'LOADING' });
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [autostart, setAutostart] = useState(false);
  const [workspace, setWorkspace] = useState('');
  const [message, setMessage] = useState(() => t('Connecting to the local FleetSplice Agent…', '正在连接本机 FleetSplice 代理…'));
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const update = () => setSystemDark(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useLayoutEffect(() => { document.documentElement.lang = locale; document.documentElement.dataset.appearance = appearance; document.documentElement.dataset.theme = resolveTheme(appearance, systemDark); document.title = t('FleetSplice · Agent Manager', 'FleetSplice · 代理管理'); }, [locale, appearance, systemDark]);
  const changeLocale = (value: Locale) => { setLocale(value); const saved = persistPreference(browserStorage(), 'locale', value); setSaves(previous => ({ ...previous, locale: saved })); };
  const changeAppearance = (value: Appearance) => { setAppearance(value); const saved = persistPreference(browserStorage(), 'appearance', value); setSaves(previous => ({ ...previous, appearance: saved })); };
  const refresh = async (failure?: string) => {
    try {
      const [nextStatus, nextRuntimes, nextAutostart] = await Promise.all([
        invoke<AgentStatus>('agent_status'), invoke<Runtime[]>('agent_runtimes'), invoke<boolean>('autostart_enabled'),
      ]);
      setStatus(nextStatus); setRuntimes(nextRuntimes); setAutostart(nextAutostart); setMessage(failure ?? t('Local Agent state refreshed.', '本机代理状态已刷新。'));
    } catch (error) { setStatus({ code: 'SUPERVISOR_UNAVAILABLE' }); setMessage(failure ?? String(error)); }
  };
  useEffect(() => { void refresh(); }, []);
  const setSharing = async (runtime: Runtime, shared: boolean) => {
    try {
      await invoke('set_runtime_sharing', { sharing: { adapterId: runtime.adapterId, enabled: shared, shared, scope: { kind: 'ALL_ELIGIBLE' } } });
      setMessage(shared ? t('Sharing resumed through the admitted Agent.', '已通过获准代理恢复共享。') : t('Sharing paused. Existing native work was not terminated.', '共享已暂停，已有原生任务未被终止。')); await refresh();
    } catch (error) { setMessage(String(error)); }
  };
  const unreported = t('Not reported', '未报告');
  return <div className="desktop-shell"><header className="desktop-mode-bar"><strong><span className="desktop-mark">F</span>FleetSplice</strong>
    <nav aria-label={t('Desktop mode', '桌面模式')}>{(['Workspace', 'Agent Manager'] as const).map(item => <Button type="button" key={item} variant={mode === item ? 'secondary' : 'ghost'} aria-pressed={mode === item} onClick={() => setMode(item)}>{item === 'Workspace' ? <Monitor size={14}/> : <LayoutGrid size={14}/>}{item === 'Workspace' ? t('Workspace', '工作区') : t('Agent Manager', '代理管理')}</Button>)}</nav>
    <PreferencesControl locale={locale} appearance={appearance} saved={saves.locale && saves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/>
  </header>
  <section className="workspace-launcher" hidden={mode !== 'Workspace'}>
    <h1>{t('Workspace', '工作区')}</h1><p>{t('Use the same Web sessions, Attention and Composer. Your Gateway login and Controller grant remain authoritative.', '使用同一套网页会话、待处理动作和输入区。网关登录与控制授权继续生效。')}</p>
    <form onSubmit={async event => {
      event.preventDefault(); if (openingWorkspace) return;
      setOpeningWorkspace(true);
      try { await invoke('open_workspace', { origin: workspaceOrigin.trim() }); setWorkspaceMessage(t('Workspace opened. Sign in through the normal Gateway login. Return here using its Agent Manager menu.', '工作区已打开，请通过正常网关登录。可由其代理管理菜单返回此处。')); }
      catch (error) { setWorkspaceMessage(String(error)); }
      finally { setOpeningWorkspace(false); }
    }}>
      <label htmlFor="workspace-origin">{t('Gateway origin', '网关 origin')}</label><Input id="workspace-origin" type="url" required className="h-10 text-sm md:text-sm" placeholder="https://gateway.example.test" value={workspaceOrigin} onChange={event => setWorkspaceOrigin(event.target.value)}/>
      <p className="muted">{t('Enter an origin only, without credentials, path, query or bootstrap fragment. Local first-use bootstrap authentication is not available in this window.', '仅填写 origin，不含凭据、路径、查询或 bootstrap 片段。此窗口尚不支持本地首次引导认证。')}</p>
      <Button type="submit" disabled={openingWorkspace || !workspaceOrigin.trim()}><ArrowUpRight size={14}/>{openingWorkspace ? t('Opening…', '正在打开…') : t('Open / return to Workspace', '打开或返回工作区')}</Button>
    </form>
    <p role="status" className="manager-notice">{workspaceMessage}</p><p className="muted">{t('Desktop does not grant control automatically. Closing Workspace does not stop native work. A login or connection failure can be retried by returning to the same window; no native command is replayed.', '桌面端不会自动授予控制权。关闭工作区不会停止原生任务。登录或连接失败时可返回同一窗口重试，不会重放原生命令。')}</p>
  </section>
  <main hidden={mode !== 'Agent Manager'} className="manager-layout">
    <aside className="manager-navigation"><p className="manager-nav-label">{t('Agent Manager', '代理管理')}</p>{sections.map(item => <Button type="button" key={item} className="w-full justify-start max-[700px]:w-auto" variant={section === item ? 'secondary' : 'ghost'} aria-current={section === item ? 'page' : undefined} onClick={() => setSection(item)}>{locale === 'zh-CN' ? zhSections[item] : item}</Button>)}</aside>
    <section className="manager-content"><header className="manager-content-heading"><div><h1>{locale === 'zh-CN' ? zhSections[section] : section}</h1><p className="muted" role="status">{message}</p></div><Button type="button" variant="outline" onClick={() => void refresh()}><RefreshCw size={14}/>{t('Refresh', '刷新')}</Button></header>
      {section === 'Overview' && <dl className="manager-facts"><dt>{t('Agent', '代理')}</dt><dd><Badge variant="secondary">{status.code}</Badge></dd><dt>{t('Gateway', '网关')}</dt><dd>{status.hub ?? unreported}</dd><dt>{t('Native Codex', '原生 Codex')}</dt><dd>{status.nativeCodex ?? unreported}</dd></dl>}
      {section === 'Gateway' && <div className="manager-group"><h2>{t('Connection state', '连接状态')}</h2><dl className="manager-facts"><dt>Hub / Edge</dt><dd>{status.hub ?? unreported} / {status.edge ?? unreported}</dd><dt>{t('Admission', '准入')}</dt><dd>{status.edgeAdmission ?? unreported}</dd><dt>{t('Active workspace', '当前工作区')}</dt><dd>{status.workspaceRoot ?? t('None', '无')}</dd></dl>
        <label htmlFor="agent-workspace">{t('Workspace for this Agent', '此代理的工作区')}</label><Input id="agent-workspace" className="h-10 text-sm md:text-sm" value={workspace} onChange={event => setWorkspace(event.target.value)} placeholder={'C:\\src\\your-workspace'}/>
        <div className="manager-actions"><Button type="button" onClick={async () => { try { const next = await invoke<AgentStatus>('onboard_agent', { workspace }); setStatus(next); setMessage(t('Workspace registered and local Agent started.', '工作区已登记，本机代理已启动。')); } catch (error) { await refresh(String(error)); } }}>{t('Start local Agent', '启动本机代理')}</Button><Button type="button" variant="outline" onClick={() => void invoke('open_dashboard')}>{t('Open Dashboard', '打开仪表板')}</Button><Button type="button" variant="outline" onClick={async () => { try { const result = await invoke<{ approvalUrl: string; publicFingerprint: string }>('request_pairing'); setMessage(t(`Pairing request created for ${result.publicFingerprint}. Approve it in the Dashboard.`, `已为 ${result.publicFingerprint} 创建配对请求，请在仪表板批准。`)); await invoke('open_dashboard'); } catch (error) { setMessage(String(error)); } }}>{t('Connect to Fleet', '连接 Fleet')}</Button></div>
      </div>}
      {(section === 'Agent Runtimes' || section === 'Sharing') && <div className="manager-group">{!runtimes.length && <p className="muted">{t('No Agent runtimes are reported.', '尚未报告代理运行时。')}</p>}{runtimes.map(runtime => <article className="manager-runtime-row" key={runtime.adapterId}><header><strong>{runtime.kind}</strong><Badge variant="secondary">{runtime.status}</Badge></header><p>{t('Discovered sessions', '已发现会话')}: {runtime.discoveredSessions}</p><p className="muted">{runtime.evidence}</p>{runtime.installed ? <Button type="button" variant="outline" onClick={() => void setSharing(runtime, !runtime.shared)}>{runtime.shared ? t('Pause sharing', '暂停共享') : t('Resume sharing', '恢复共享')}</Button> : <span className="muted">{t('Not available', '不可用')}</span>}</article>)}</div>}
      {section === 'Startup' && <div className="manager-group"><h2>{t('Start with Windows', '随 Windows 启动')}</h2><p>{t('User-controlled startup for this Desktop application.', '由用户决定此桌面应用是否随系统启动。')}</p><Button type="button" variant="outline" onClick={async () => { try { const next = await invoke<boolean>('set_autostart', { enabled: !autostart }); setAutostart(next); setMessage(next ? t('Start with Windows enabled.', '已启用随系统启动。') : t('Start with Windows disabled.', '已禁用随系统启动。')); } catch (error) { setMessage(String(error)); } }}>{autostart ? t('Disable autostart', '禁用自动启动') : t('Enable autostart', '启用自动启动')}</Button></div>}
      {section === 'Diagnostics' && <div className="manager-group"><h2>{t('Diagnostics', '诊断')}</h2><pre>{JSON.stringify(status, null, 2)}</pre><Button type="button" variant="outline" onClick={() => void invoke('open_logs')}>{t('Open local logs', '打开本机日志')}</Button></div>}
      {['Security', 'Advanced'].includes(section) && <div className="manager-group"><p>{t('Configuration remains owned by the local Agent and is exposed through its authenticated local IPC.', '配置仍由本机代理管理，通过已认证的本机 IPC 提供。')}</p></div>}
    </section>
  </main></div>;
}
createRoot(document.getElementById('root')!).render(<Desktop/>);
