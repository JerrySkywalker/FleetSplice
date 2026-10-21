import React, { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { NativeThread } from '../../../packages/native-adoption/types.ts';
import type { Locale } from '../i18n.ts';
import { matchingSessions, sessionTitle } from '../layout/session-navigation.ts';
import { SessionItem } from './Presentation.tsx';

type Props = { threads: NativeThread[]; selected: string; onSelect: (id: string) => void; locale: Locale;
  controller: boolean; recent: string[]; state: string };

export function SessionNavigation({ threads, selected, onSelect, locale, controller, recent, state }: Props) {
  const [query, setQuery] = useState('');
  const zh = locale === 'zh-CN';
  const matches = matchingSessions(threads, query, recent);
  const workspaces = [...new Set(matches.map(thread => thread.workspace))];
  return <nav className="session-navigation" aria-label={zh ? 'Fleet 会话' : 'Fleet sessions'}>
    <div className="eyebrow">Fleet</div>
    <p className="navigation-scope muted">{zh ? 'Host / Environment：当前投影未提供' : 'Host / Environment: not reported by this projection'}</p>
    <label className="session-search"><Search size={14} aria-hidden="true" /><input type="search" value={query}
      aria-label={zh ? '搜索会话' : 'Search sessions'} placeholder={zh ? '搜索会话' : 'Search sessions'} onChange={event => setQuery(event.target.value)} /></label>
    <div className="navigation-observation" role="status">{state === 'READY' ? (zh ? '已收到观察快照' : 'Observed snapshot received') : state}</div>
    {!threads.length && <p className="muted">{state === 'CONNECTING' ? (zh ? '正在发现会话…' : 'Discovering sessions…') : (zh ? '未观察到已有会话。' : 'No existing sessions observed.')}</p>}
    {!!threads.length && !matches.length && <p className="muted">{zh ? '没有匹配的会话' : 'No matching sessions'}</p>}
    {workspaces.map(workspace => <section key={workspace} className="workspace-session-group">
      <h2 className="workspace-group-heading" title={workspace}>{zh ? '工作区' : 'Workspace'} <span>{workspace}</span></h2>
      {matches.filter(thread => thread.workspace === workspace).map(thread => <SessionItem key={thread.id}
        selected={selected === thread.id} title={sessionTitle(thread)} subtitle={`Codex · ${thread.id.slice(0, 12)} · NATIVE_ADOPTED`}
        workspace={thread.workspace} connected={thread.attached} onSelect={() => onSelect(thread.id)}
        status={`${thread.attached ? (controller ? 'Controller' : 'Viewer') : (zh ? '未连接' : 'Not connected')} · ${state === 'READY' ? thread.status : (zh ? '观察不可用' : 'Observation unavailable')}`} />)}
    </section>)}
  </nav>;
}

export function SessionQuickSwitcher({ threads, selected, onSelect, locale, recent }: Omit<Props, 'controller' | 'state'>) {
  const zh = locale === 'zh-CN';
  const dialog = useRef<HTMLDialogElement>(null); const trigger = useRef<HTMLButtonElement>(null); const search = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''); const [active, setActive] = useState(0);
  const listId = useId();
  const matches = matchingSessions(threads, query, recent);
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  const open = () => { setQuery(''); setActive(0); if (!dialog.current?.open) dialog.current?.showModal(); search.current?.focus(); };
  const choose = (id: string) => { onSelect(id); close(); };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.isComposing && event.keyCode !== 229) {
        event.preventDefault(); if (!event.repeat) open();
      }
    };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, []);
  return <>
    <button type="button" ref={trigger} className="ghost-button quick-switch-trigger" data-testid="quick-switch-trigger" aria-keyshortcuts="Control+k Meta+k"
      onClick={open}><Search size={16} aria-hidden="true" /><span>{zh ? '切换会话' : 'Switch session'}</span><kbd>⌘/Ctrl K</kbd></button>
    <dialog ref={dialog} className="session-switcher" aria-label={zh ? '切换会话' : 'Switch session'} onCancel={() => trigger.current?.focus()}>
      <div className="switcher-heading"><strong>{zh ? '切换会话' : 'Switch session'}</strong><button type="button" className="icon-button" onClick={close} aria-label={zh ? '关闭切换器' : 'Close switcher'}><X size={18} aria-hidden="true" /></button></div>
      <input ref={search} type="search" role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={matches[active] ? `${listId}-${active}` : undefined} aria-label={zh ? '搜索会话' : 'Search sessions'}
        placeholder={zh ? '按会话、工作区或 Thread ID 搜索' : 'Search session, workspace or Thread ID'} value={query}
        onChange={event => { setQuery(event.target.value); setActive(0); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(matches.length - 1, index + 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
          if (event.key === 'Enter' && matches[active]) { event.preventDefault(); choose(matches[active]!.id); }
        }} />
      <div role="listbox" id={listId} aria-label={zh ? '匹配的会话' : 'Matching sessions'}>
        {matches.map((thread, index) => <button type="button" role="option" id={`${listId}-${index}`} key={thread.id}
          aria-selected={thread.id === selected} className={`switcher-option ${active === index ? 'is-active' : ''}`}
          onMouseMove={() => setActive(index)} onClick={() => choose(thread.id)}>
          <strong>{sessionTitle(thread)}</strong><span>{thread.workspace}</span><small>{thread.id}</small>
        </button>)}
        {!matches.length && <p className="muted">{zh ? '没有匹配的会话' : 'No matching sessions'}</p>}
      </div>
    </dialog>
  </>;
}
