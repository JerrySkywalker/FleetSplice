import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBreakpoint } from './AppShell.tsx';
import { abbreviateModel, abbreviatePermission, abbreviateReasoning, compactConfigSummary } from '../compact-config.ts';

export type ConfigOption = { id: string; label: string; disabled?: boolean };

function ReadonlyChip({
  prefix, value, title, testId,
}: { prefix?: string; value: string; title?: string; testId: string }) {
  return <span className="config-readonly-chip" data-testid={testId} title={title ?? value} data-clipping-policy="ellipsis">
    {prefix ? <span className="config-readonly-prefix">{prefix}</span> : null}
    <span className="config-readonly-value text-ellipsis">{value}</span>
  </span>;
}

export function SessionConfigBar({
  modelLabel, reasoningLabel, permissionLabel, controllerLabel,
  model, reasoning, permission,
  models, reasonings, permissions,
  modelDisabled, reasoningDisabled, permissionDisabled,
  modelTitle, reasoningTitle, permissionTitle,
  onModel, onReasoning, onPermission,
  mutationSupported,
  mutationHint,
  effectiveModel,
  effectiveReasoning,
  effectivePermission,
  requestedModel,
  requestedReasoning,
  requestedPermission,
}: {
  modelLabel: string; reasoningLabel: string; permissionLabel: string; controllerLabel: string;
  model: string; reasoning: string; permission: string;
  models: ConfigOption[]; reasonings: ConfigOption[]; permissions: ConfigOption[];
  modelDisabled?: boolean; reasoningDisabled?: boolean; permissionDisabled?: boolean;
  modelTitle?: string; reasoningTitle?: string; permissionTitle?: string;
  onModel?: (value: string) => void; onReasoning?: (value: string) => void; onPermission?: (value: string) => void;
  mutationSupported: boolean;
  mutationHint?: string;
  effectiveModel?: string;
  effectiveReasoning?: string;
  effectivePermission?: string;
  requestedModel?: string;
  requestedReasoning?: string;
  requestedPermission?: string;
}) {
  const breakpoint = useBreakpoint();
  const mobile = breakpoint === 'mobile';
  const tablet = breakpoint === 'tablet';
  const desktop = breakpoint === 'desktop';
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const observedModel = effectiveModel ?? model;
  const observedReasoning = effectiveReasoning ?? reasoning;
  const observedPermission = effectivePermission ?? permission;
  const summary = compactConfigSummary({
    model: observedModel,
    reasoning: observedReasoning,
    permission: observedPermission,
  });
  const surfaceVariant = mobile ? 'sheet' : tablet ? 'side' : 'popover';

  useEffect(() => {
    if (!sheetOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useEffect(() => {
    if (sheetOpen) return;
    if (document.activeElement === document.body || document.activeElement === null) {
      triggerRef.current?.focus();
    }
  }, [sheetOpen]);

  const displayModel = abbreviateModel(observedModel);
  const displayReasoning = abbreviateReasoning(observedReasoning);
  const displayPermission = abbreviatePermission(observedPermission);
  const hasReasoning = !!(observedReasoning ?? '').trim();

  const interactiveSelects = <>
    <label className="config-chip">
      <span>{tablet ? 'M' : modelLabel}</span>
      <select data-testid="config-model" aria-label={modelLabel} title={modelTitle ?? model}
        value={model} disabled={modelDisabled || !models.length}
        onChange={event => onModel?.(event.target.value)}>
        {!models.length && <option value={model || ''}>{model || '—'}</option>}
        {models.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {tablet ? abbreviateModel(item.label) : item.label}
        </option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{tablet ? 'R' : reasoningLabel}</span>
      <select data-testid="config-reasoning" aria-label={reasoningLabel} title={reasoningTitle ?? reasoning}
        value={reasoning} disabled={reasoningDisabled || !reasonings.length}
        onChange={event => onReasoning?.(event.target.value)}>
        {!reasonings.length && <option value={reasoning || ''}>{reasoning || '—'}</option>}
        {reasonings.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {tablet ? abbreviateReasoning(item.label) : item.label}
        </option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{tablet ? 'P' : permissionLabel}</span>
      <select data-testid="config-permission" aria-label={permissionLabel} title={permissionTitle ?? permission}
        value={permission} disabled={permissionDisabled || !permissions.length}
        onChange={event => onPermission?.(event.target.value)}>
        {!permissions.length && <option value={permission || ''}>{permission || '—'}</option>}
        {permissions.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {tablet ? abbreviatePermission(item.label) : item.label}
        </option>)}
      </select>
    </label>
  </>;

  const observeChips = <>
    <ReadonlyChip prefix="M" value={displayModel} title={observedModel || undefined} testId="config-model-readonly" />
    {hasReasoning ? (
      <ReadonlyChip prefix="R" value={displayReasoning} title={observedReasoning || undefined} testId="config-reasoning-readonly" />
    ) : desktop ? (
      <ReadonlyChip prefix="R" value="—" title={reasoningLabel} testId="config-reasoning-readonly" />
    ) : null}
    <ReadonlyChip prefix="P" value={displayPermission} title={observedPermission || undefined} testId="config-permission-readonly" />
  </>;

  const controller = <div className="config-chip controller-chip status-chip" data-testid="config-controller" title={controllerLabel}>
    <span className={`status-dot ${controllerLabel.toLowerCase().includes('viewer') || controllerLabel.includes('查看') ? 'is-outline' : 'is-filled'}`} aria-hidden="true" />
    <span className="controller-label-full">
      {controllerLabel.toLowerCase().includes('viewer') || controllerLabel.includes('查看')
        ? (controllerLabel.includes('查看') ? '查看者' : 'Viewer')
        : (controllerLabel.includes('控制') ? '控制者' : 'Controller')}
    </span>
    <span className="controller-label-short" aria-hidden="true">
      {controllerLabel.toLowerCase().includes('viewer') || controllerLabel.includes('查看') ? 'Viewer' : 'Ctrl'}
    </span>
  </div>;

  const detailModel = observedModel || '—';
  const detailReasoning = observedReasoning || '—';
  const detailPermission = observedPermission || '—';
  const detailRows = (
    <dl className="config-detail-list" data-testid="config-detail-sheet">
      <dt>{modelLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-model">{detailModel}</dd>
      <dt>{reasoningLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-reasoning">{detailReasoning}</dd>
      <dt>{permissionLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-permission">{detailPermission}</dd>
      {(requestedModel || requestedReasoning || requestedPermission) && <>
        <dt>Requested</dt>
        <dd className="text-wrap-safe" data-testid="config-detail-requested">
          {[requestedModel, requestedReasoning, requestedPermission].filter(Boolean).join(' · ') || '—'}
        </dd>
        <dt>Effective</dt>
        <dd className="text-wrap-safe" data-testid="config-detail-effective">
          {[observedModel, observedReasoning, observedPermission].filter(Boolean).join(' · ') || '—'}
        </dd>
      </>}
      {!mutationSupported && mutationHint ? <dd className="config-detail-hint text-wrap-safe" data-testid="config-mutation-hint">{mutationHint}</dd> : null}
    </dl>
  );

  const useCapsule = mobile || (tablet && !mutationSupported);
  const showDetailsTrigger = !mutationSupported && !useCapsule;

  const closeSurface = () => {
    setSheetOpen(false);
    triggerRef.current?.focus();
  };

  return <div
    ref={barRef}
    className={`session-config-bar density-${breakpoint}`}
    data-testid="session-config-bar"
    data-mutation-supported={mutationSupported}
    data-config-rows={useCapsule || mobile ? '1' : 'full'}
    data-observe-chips={!mutationSupported ? 'true' : 'false'}
  >
    {useCapsule ? <>
      <button
        type="button"
        ref={triggerRef}
        className="config-capsule"
        data-testid="config-capsule"
        data-clipping-policy="ellipsis"
        aria-expanded={sheetOpen}
        aria-haspopup="dialog"
        title={summary}
        onClick={() => setSheetOpen(true)}
      >
        <span className="config-capsule-text text-ellipsis">{summary}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {controller}
    </> : <>
      {mutationSupported ? interactiveSelects : observeChips}
      {controller}
      {showDetailsTrigger && (
        <button type="button" ref={triggerRef} className="ghost-button config-detail-trigger" data-testid="config-detail-open"
          aria-expanded={sheetOpen} aria-haspopup="dialog"
          onClick={() => setSheetOpen(true)}>
          Details
        </button>
      )}
    </>}

    {sheetOpen && <>
      <div className="drawer-backdrop" data-testid="config-sheet-backdrop" onClick={closeSurface} />
      <div
        className={`drawer drawer-config config-surface config-surface-${surfaceVariant}${surfaceVariant === 'sheet' ? ' sheet' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="config-sheet"
        data-config-surface={surfaceVariant}
      >
        <div className="drawer-toolbar">
          <strong id={titleId}>Configuration</strong>
          <button type="button" ref={closeRef} data-testid="config-sheet-close" aria-label="Close configuration"
            onClick={closeSurface}>Close</button>
        </div>
        <div className="drawer-body">
          {detailRows}
          {mutationSupported ? <div className="config-sheet-controls">{interactiveSelects}</div> : null}
        </div>
      </div>
    </>}
  </div>;
}
