import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, MoreHorizontal, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import {
  LEFT_MAX, LEFT_MIN, RIGHT_MAX, RIGHT_MIN,
  persistShellLayout, readShellLayout, type ShellLayout,
} from '../layout-preferences.ts';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1280) return 'tablet';
    return 'desktop';
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? 'mobile' : w < 1280 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return bp;
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

export function AppShell({
  brand, headerActions, navigation, conversation, context,
  footer, navTitle, contextTitle,
}: {
  brand: ReactNode;
  headerActions: ReactNode;
  navigation: ReactNode;
  conversation: ReactNode;
  context: ReactNode;
  footer: ReactNode;
  navTitle: string;
  contextTitle: string;
}) {
  const breakpoint = useBreakpoint();
  const [layout, updateLayout] = useShellLayout();
  const [navOpen, setNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const navTriggerRef = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLButtonElement>(null);
  const navCloseRef = useRef<HTMLButtonElement>(null);
  const contextCloseRef = useRef<HTMLButtonElement>(null);
  const desktop = breakpoint === 'desktop';
  const showDrawers = !desktop;

  useEffect(() => {
    if (desktop) { setNavOpen(false); setContextOpen(false); }
  }, [desktop]);

  useEffect(() => {
    if (!navOpen && !contextOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (navOpen) { setNavOpen(false); navTriggerRef.current?.focus(); }
        if (contextOpen) { setContextOpen(false); contextTriggerRef.current?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen, contextOpen]);

  useEffect(() => {
    if (navOpen) navCloseRef.current?.focus();
  }, [navOpen]);
  useEffect(() => {
    if (contextOpen) contextCloseRef.current?.focus();
  }, [contextOpen]);

  return <div
    className={`shell product-shell breakpoint-${breakpoint}`}
    data-testid="app-shell"
    data-breakpoint={breakpoint}
    data-left-collapsed={layout.leftCollapsed}
    data-right-collapsed={layout.rightCollapsed}
    style={desktop ? {
      ['--left-panel' as string]: layout.leftCollapsed ? '0px' : `${layout.leftWidth}px`,
      ['--right-panel' as string]: layout.rightCollapsed ? '0px' : `${layout.rightWidth}px`,
    } : undefined}
  >
    <header className="product-header">
      <div className="header-leading">
        {showDrawers && <button type="button" ref={navTriggerRef} className="icon-button" data-testid="nav-menu" aria-label={navTitle}
          aria-expanded={navOpen} onClick={() => { setNavOpen(true); setContextOpen(false); }}>
          <Menu size={20} aria-hidden="true" />
        </button>}
        {brand}
      </div>
      <div className="header-trailing">
        {headerActions}
        {showDrawers && <button type="button" ref={contextTriggerRef} className="icon-button" data-testid="context-menu" aria-label={contextTitle}
          aria-expanded={contextOpen} onClick={() => { setContextOpen(true); setNavOpen(false); }}>
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>}
        {desktop && <>
          <button type="button" className="ghost-button icon-button" data-testid="toggle-left"
            aria-label={layout.leftCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={layout.leftCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-pressed={layout.leftCollapsed}
            onClick={() => updateLayout({ leftCollapsed: !layout.leftCollapsed })}>
            {layout.leftCollapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="ghost-button icon-button" data-testid="toggle-right"
            aria-label={layout.rightCollapsed ? 'Expand context' : 'Collapse context'}
            title={layout.rightCollapsed ? 'Expand context' : 'Collapse context'}
            aria-pressed={layout.rightCollapsed}
            onClick={() => updateLayout({ rightCollapsed: !layout.rightCollapsed })}>
            {layout.rightCollapsed ? <PanelRightOpen size={16} aria-hidden="true" /> : <PanelRightClose size={16} aria-hidden="true" />}
          </button>
        </>}
      </div>
    </header>

    <aside className={`navigation panel-surface ${layout.leftCollapsed && desktop ? 'is-collapsed' : ''}`}
      data-testid="navigation-panel" hidden={desktop && layout.leftCollapsed}>
      {navigation}
      {desktop && !layout.leftCollapsed && <ResizeHandle side="left" width={layout.leftWidth} min={LEFT_MIN} max={LEFT_MAX}
        label="Resize navigation" onWidth={value => updateLayout({ leftWidth: value })} />}
    </aside>

    <main className="conversation-pane" data-testid="conversation-pane">{conversation}</main>

    <aside className={`context panel-surface ${layout.rightCollapsed && desktop ? 'is-collapsed' : ''}`}
      data-testid="context-panel" hidden={desktop && layout.rightCollapsed}>
      {desktop && !layout.rightCollapsed && <ResizeHandle side="right" width={layout.rightWidth} min={RIGHT_MIN} max={RIGHT_MAX}
        label="Resize context" onWidth={value => updateLayout({ rightWidth: value })} />}
      {context}
    </aside>

    {showDrawers && navOpen && <>
      <div className="drawer-backdrop" data-testid="nav-backdrop" onClick={() => { setNavOpen(false); navTriggerRef.current?.focus(); }} />
      <div className="drawer drawer-nav" role="dialog" aria-modal="true" aria-label={navTitle} data-testid="nav-drawer">
        <div className="drawer-toolbar"><strong>{navTitle}</strong>
          <button type="button" ref={navCloseRef} aria-label="Close sessions" onClick={() => { setNavOpen(false); navTriggerRef.current?.focus(); }}>
            <X size={16} aria-hidden="true" /> Close
          </button></div>
        <div className="drawer-body">{navigation}</div>
      </div>
    </>}
    {showDrawers && contextOpen && <>
      <div className="drawer-backdrop" data-testid="context-backdrop" onClick={() => { setContextOpen(false); contextTriggerRef.current?.focus(); }} />
      <div className="drawer drawer-context" role="dialog" aria-modal="true" aria-label={contextTitle} data-testid="context-drawer">
        <div className="drawer-toolbar"><strong>{contextTitle}</strong>
          <button type="button" ref={contextCloseRef} aria-label="Close context" onClick={() => { setContextOpen(false); contextTriggerRef.current?.focus(); }}>
            <X size={16} aria-hidden="true" /> Close
          </button></div>
        <div className="drawer-body">{context}</div>
      </div>
    </>}

    <footer className="product-footer">{footer}</footer>
  </div>;
}
