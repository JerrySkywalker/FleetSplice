import { Button } from '../../../packages/ui/components/button.tsx';
import { Input } from '../../../packages/ui/components/input.tsx';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../../packages/ui/components/dialog.tsx';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '../../../packages/ui/components/command.tsx';
import React, { useEffect, useRef, useState } from 'react';
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
    <h2 className="session-nav-title mb-3 text-sm font-medium">{zh ? '会话' : 'Sessions'}</h2>
    <label className="relative block"><Search size={14} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="h-9 pl-9 max-sm:h-11" type="search" value={query}
      aria-label={zh ? '搜索会话' : 'Search sessions'} placeholder={zh ? '搜索会话' : 'Search sessions'} onChange={event => setQuery(event.target.value)}/></label>
    <div className="navigation-observation" role="status">{state === 'READY' ? (zh ? `${threads.length} 个本地会话` : `${threads.length} local sessions`) : state}</div>
    {!threads.length && <p className="muted">{state === 'CONNECTING' ? (zh ? '正在发现会话…' : 'Discovering sessions…') : (zh ? '未观察到已有会话。' : 'No existing sessions observed.')}</p>}
    {!!threads.length && !matches.length && <p className="muted">{zh ? '没有匹配的会话' : 'No matching sessions'}</p>}
    {workspaces.map(workspace => <section key={workspace} className="workspace-session-group">
      <h2 className="workspace-group-heading" title={workspace}>{zh ? '工作区' : 'Workspace'} <span>{workspace}</span></h2>
      {matches.filter(thread => thread.workspace === workspace).map(thread => <SessionItem key={thread.id}
        selected={selected === thread.id} title={sessionTitle(thread)} subtitle={`Codex · ${thread.id.slice(0, 12)} · NATIVE_ADOPTED`}
        workspace={thread.workspace} connected={thread.attached} onSelect={() => onSelect(thread.id)}
        status={`${thread.attached ? (controller ? (zh ? '控制者' : 'Controller') : (zh ? '只读观察' : 'Viewer')) : (zh ? '未连接' : 'Not connected')} · ${state === 'READY' ? (zh ? ({ idle: '空闲', active: '工作中' }[thread.status] ?? thread.status) : thread.status) : (zh ? '观察不可用' : 'Observation unavailable')}`} />)}
    </section>)}
  </nav>;
}

export function SessionQuickSwitcher({ threads, selected, onSelect, locale, recent }: Omit<Props, 'controller' | 'state'>) {
  const zh = locale === 'zh-CN';
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const matches = matchingSessions(threads, query, recent);
  const changeOpen = (value: boolean) => { if (value) { setQuery(''); setActive(matchingSessions(threads, '', recent)[0]?.id ?? ''); } setOpen(value); };
  const choose = (id: string) => { onSelect(id); setOpen(false); };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.isComposing && event.keyCode !== 229) {
        event.preventDefault();
        if (document.querySelector('[role="dialog"]:not([data-closed]), dialog[open]')) return;
        if (!event.repeat) changeOpen(true);
      }
    };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, [threads, recent]);
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger render={<Button type="button" variant="ghost" ref={trigger} className="quick-switch-trigger" data-testid="quick-switch-trigger" aria-keyshortcuts="Control+k Meta+k"/>}>
      <Search size={16} aria-hidden="true"/><span>{zh ? '切换会话' : 'Switch session'}</span><kbd>⌘/Ctrl K</kbd>
    </DialogTrigger>
    <DialogContent showCloseButton={false} finalFocus={trigger} className="top-1/3 max-w-[min(560px,calc(100vw-32px))]! translate-y-0 p-0">
      <DialogHeader className="sr-only"><DialogTitle>{zh ? '切换会话' : 'Switch session'}</DialogTitle><DialogDescription>{zh ? '搜索并选择已有会话。' : 'Search and choose an existing session.'}</DialogDescription></DialogHeader>
      <DialogClose render={<Button variant="ghost" size="icon" className="absolute right-2 top-1 z-10 max-sm:min-h-11 max-sm:min-w-11" aria-label={zh ? '关闭切换器' : 'Close switcher'}/>}><X size={16}/></DialogClose>
      <Command shouldFilter={false} value={active} onValueChange={setActive}>
        <CommandInput className="pr-10" aria-label={zh ? '搜索会话' : 'Search sessions'} placeholder={zh ? '搜索会话、工作区或 Thread ID' : 'Search session, workspace or Thread ID'} value={query}
          onValueChange={value => { setQuery(value); setActive(matchingSessions(threads, value, recent)[0]?.id ?? ''); }}
          onKeyDown={event => { if (event.nativeEvent.isComposing || event.keyCode === 229) event.stopPropagation(); }}/>
        <CommandList><CommandEmpty>{zh ? '没有匹配的会话' : 'No matching sessions'}</CommandEmpty>
          {matches.map(thread => <CommandItem key={thread.id} value={thread.id} className="min-h-11 sm:min-h-9" data-checked={thread.id === selected} onSelect={() => choose(thread.id)}>
            <div className="min-w-0 flex-1"><div className="truncate text-sm">{sessionTitle(thread)}</div><div className="truncate text-xs text-muted-foreground">{thread.workspace}</div></div>
          </CommandItem>)}
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>;
}
