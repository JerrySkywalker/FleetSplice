import { Button } from '../../../packages/ui/components/button.tsx';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '../../../packages/ui/components/sheet.tsx';
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { SemanticIcon } from '../icons/semantic-icons.tsx';
import {
  layoutIntentFromWebBreakpoint,
  webBreakpointThresholds,
  type LayoutIntent,
} from '../layout/adaptive-intents.ts';
import {
  LEFT_MAX, LEFT_MIN, RIGHT_MAX, RIGHT_MIN,
  persistShellLayout, readShellLayout, type ShellLayout,
} from '../layout-preferences.ts';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < webBreakpointThresholds.compactMaxExclusive) return 'mobile';
    if (w < webBreakpointThresholds.mediumMaxExclusive) return 'tablet';
    return 'desktop';
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(
        w < webBreakpointThresholds.compactMaxExclusive
          ? 'mobile'
          : w < webBreakpointThresholds.mediumMaxExclusive
            ? 'tablet'
            : 'desktop',
      );
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return bp;
}

export function useLayoutIntent(): LayoutIntent {
  return layoutIntentFromWebBreakpoint(useBreakpoint());
}

function useShellLayout() {
  const [layout, setLayout] = useState<ShellLayout>(() => readShellLayout());
  const update = (partial: Partial<ShellLayout>) => {
    setLayout(current => {
      const next = { ...current, ...partial };
      persistShellLayout(partial);
      return next;
    });
  };
  return [layout, update] as const;
}

function ResizeHandle({ side, width, min, max, onWidth, label }: {
  side: 'left' | 'right'; width: number; min: number; max: number;
  onWidth: (value: number) => void; label: string;
}) {
  const dragging = useRef(false);
  const origin = useRef({ x: 0, width: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const delta = event.clientX - origin.current.x;
      const next = side === 'left'
        ? origin.current.width + delta
        : origin.current.width - delta;
      onWidth(Math.min(max, Math.max(min, next)));
    };
    const onUp = () => { dragging.current = false; document.body.classList.remove('is-resizing'); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [max, min, onWidth, side]);
  return <button
    type="button"
    className={`resize-handle resize-handle-${side}`}
    aria-label={label}
    data-testid={`resize-${side}`}
    onPointerDown={event => {
      dragging.current = true;
      origin.current = { x: event.clientX, width };
      document.body.classList.add('is-resizing');
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
  />;
}

export function AppShell({ brand, headerActions, navigation, conversation, context, footer, navTitle, contextTitle, navigationSelection }: {
  brand: ReactNode; headerActions: ReactNode; navigation: ReactNode; conversation: ReactNode; context: ReactNode;
  footer: ReactNode; navTitle: string; contextTitle: string; navigationSelection?: string;
}) {
  const breakpoint = useBreakpoint();
  const layoutIntent = layoutIntentFromWebBreakpoint(breakpoint);
  const [layout, updateLayout] = useShellLayout();
  const [navOpen, setNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const navTriggerRef = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const desktop = breakpoint === 'desktop';
  const zh = navTitle === '会话';

  useEffect(() => {
    const workspace = shellRef.current?.closest<HTMLElement>('.native-workspace');
    const viewport = window.visualViewport;
    if (!workspace || !viewport) return;
    const update = () => {
      if (viewport.scale !== 1) { workspace.style.removeProperty('--workspace-height'); workspace.style.removeProperty('--workspace-top'); return; }
      workspace.style.setProperty('--workspace-height', `${viewport.height}px`);
      workspace.style.setProperty('--workspace-top', `${viewport.offsetTop}px`);
    };
    update(); viewport.addEventListener('resize', update); viewport.addEventListener('scroll', update);
    return () => { viewport.removeEventListener('resize', update); viewport.removeEventListener('scroll', update); workspace.style.removeProperty('--workspace-height'); workspace.style.removeProperty('--workspace-top'); };
  }, []);
  useEffect(() => { setNavOpen(false); }, [navigationSelection]);
  useEffect(() => { if (desktop) { setNavOpen(false); setContextOpen(false); } }, [desktop]);

  return <div ref={shellRef} className={`shell product-shell breakpoint-${breakpoint}`} data-testid="app-shell"
    data-breakpoint={breakpoint} data-layout-intent={layoutIntent} data-left-collapsed={layout.leftCollapsed} data-right-collapsed={layout.rightCollapsed}
    style={desktop ? { ['--left-panel' as string]: layout.leftCollapsed ? '0px' : `${layout.leftWidth}px`, ['--right-panel' as string]: layout.rightCollapsed ? '0px' : `${layout.rightWidth}px` } : undefined}>
    <header className="product-header">
      <div className="header-leading">
        {!desktop && <Sheet open={navOpen} onOpenChange={open => { setNavOpen(open); if (open) setContextOpen(false); }}>
          <SheetTrigger render={<Button type="button" variant="ghost" size="icon" ref={navTriggerRef} className="icon-button" data-testid="nav-menu" aria-label={navTitle}/> }><SemanticIcon intent="sessions" size={20}/></SheetTrigger>
          <SheetContent side="left" showCloseButton={false} finalFocus={navTriggerRef} data-testid="nav-drawer" className="w-[min(340px,90vw)]!">
            <SheetHeader className="flex-row items-center justify-between border-b p-3"><SheetTitle>{navTitle}</SheetTitle><SheetClose render={<Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={zh ? '关闭会话' : 'Close sessions'}/> }><X size={18}/></SheetClose></SheetHeader>
            <SheetDescription className="sr-only">{zh ? '选择已有会话；选择不会获取控制权。' : 'Choose an existing session. Selection does not acquire control.'}</SheetDescription>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">{navigation}</div>
          </SheetContent>
        </Sheet>}
        {brand}
      </div>
      <div className="header-trailing">{headerActions}
        {!desktop && <Sheet open={contextOpen} onOpenChange={open => { setContextOpen(open); if (open) setNavOpen(false); }}>
          <SheetTrigger render={<Button type="button" variant="ghost" size="icon" ref={contextTriggerRef} className="icon-button" data-testid="context-menu" aria-label={contextTitle}/> }><SemanticIcon intent="context" size={20}/></SheetTrigger>
          <SheetContent side="right" showCloseButton={false} finalFocus={contextTriggerRef} data-testid="context-drawer" className="w-[min(420px,100vw)]!">
            <SheetHeader className="flex-row items-center justify-between border-b p-3"><SheetTitle>{contextTitle}</SheetTitle><SheetClose render={<Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={zh ? '关闭详情' : 'Close context'}/> }><X size={18}/></SheetClose></SheetHeader>
            <SheetDescription className="sr-only">{zh ? '已观察的会话身份和配置。' : 'Observed session identity and configuration.'}</SheetDescription>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{context}</div>
          </SheetContent>
        </Sheet>}
        {desktop && <>
          <Button type="button" variant="ghost" size="icon" data-testid="toggle-left" aria-label={layout.leftCollapsed ? (zh ? '展开导航' : 'Expand navigation') : (zh ? '收起导航' : 'Collapse navigation')}
            aria-pressed={layout.leftCollapsed} onClick={() => updateLayout({ leftCollapsed: !layout.leftCollapsed })}>{layout.leftCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}</Button>
          <Button type="button" variant="ghost" size="icon" data-testid="toggle-right" aria-label={layout.rightCollapsed ? (zh ? '展开详情' : 'Expand context') : (zh ? '收起详情' : 'Collapse context')}
            aria-pressed={layout.rightCollapsed} onClick={() => updateLayout({ rightCollapsed: !layout.rightCollapsed })}>{layout.rightCollapsed ? <PanelRightOpen size={16}/> : <PanelRightClose size={16}/>}</Button>
        </>}
      </div>
    </header>
    <aside className={`navigation panel-surface ${layout.leftCollapsed && desktop ? 'is-collapsed' : ''}`} data-testid="navigation-panel" hidden={desktop && layout.leftCollapsed}>
      {navigation}{desktop && !layout.leftCollapsed && <ResizeHandle side="left" width={layout.leftWidth} min={LEFT_MIN} max={LEFT_MAX} label={zh ? '调整导航宽度' : 'Resize navigation'} onWidth={value => updateLayout({ leftWidth: value })}/>}
    </aside>
    <main className="conversation-pane" data-testid="conversation-pane">{conversation}</main>
    <aside className={`context panel-surface ${layout.rightCollapsed && desktop ? 'is-collapsed' : ''}`} data-testid="context-panel" hidden={desktop && layout.rightCollapsed}>
      {desktop && !layout.rightCollapsed && <ResizeHandle side="right" width={layout.rightWidth} min={RIGHT_MIN} max={RIGHT_MAX} label={zh ? '调整详情宽度' : 'Resize context'} onWidth={value => updateLayout({ rightWidth: value })}/>}{context}
    </aside>
    <footer className="product-footer">{footer}</footer>
  </div>;
}
