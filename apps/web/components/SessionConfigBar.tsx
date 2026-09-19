import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBreakpoint } from './AppShell.tsx';
import { abbreviateModel, abbreviatePermission, abbreviateReasoning, compactConfigSummary } from '../compact-config.ts';

export type ConfigOption = { id: string; label: string; disabled?: boolean };

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const summary = compactConfigSummary({
    model: effectiveModel ?? model,
    reasoning: effectiveReasoning ?? reasoning,
    permission: effectivePermission ?? permission,
  });

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

  const displayModel = mutationSupported ? model : abbreviateModel(effectiveModel ?? model);
  const displayReasoning = mutationSupported ? reasoning : abbreviateReasoning(effectiveReasoning ?? reasoning);
  const displayPermission = mutationSupported ? permission : abbreviatePermission(effectivePermission ?? permission);

  const selects = <>
    <label className="config-chip">
      <span>{tablet ? 'M' : modelLabel}</span>
      <select data-testid="config-model" aria-label={modelLabel} title={modelTitle ?? model}
        value={model} disabled={modelDisabled || !mutationSupported || !models.length}
        onChange={event => onModel?.(event.target.value)}>
        {!models.length && <option value={model || ''}>{displayModel || '—'}</option>}
        {models.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {mutationSupported ? (tablet ? abbreviateModel(item.label) : item.label) : abbreviateModel(item.label)}
        </option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{tablet ? 'R' : reasoningLabel}</span>
      <select data-testid="config-reasoning" aria-label={reasoningLabel} title={reasoningTitle ?? reasoning}
        value={reasoning} disabled={reasoningDisabled || !mutationSupported || !reasonings.length}
        onChange={event => onReasoning?.(event.target.value)}>
        {!reasonings.length && <option value={reasoning || ''}>{displayReasoning || '—'}</option>}
        {reasonings.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {mutationSupported ? (tablet ? abbreviateReasoning(item.label) : item.label) : abbreviateReasoning(item.label)}
        </option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{tablet ? 'P' : permissionLabel}</span>
      <select data-testid="config-permission" aria-label={permissionLabel} title={permissionTitle ?? permission}
        value={permission} disabled={permissionDisabled || !mutationSupported || !permissions.length}
        onChange={event => onPermission?.(event.target.value)}>
        {!permissions.length && <option value={permission || ''}>{displayPermission || '—'}</option>}
        {permissions.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>
          {mutationSupported ? (tablet ? abbreviatePermission(item.label) : item.label) : abbreviatePermission(item.label)}
        </option>)}
      </select>
    </label>
  </>;

  const controller = <div className="config-chip controller-chip status-chip" data-testid="config-controller" title={controllerLabel}>
    <span className={`status-dot ${controllerLabel.toLowerCase().includes('viewer') || controllerLabel.includes('查看') ? 'is-outline' : 'is-filled'}`} aria-hidden="true" />
    <span className="controller-label-full">{controllerLabel}</span>
    <span className="controller-label-short" aria-hidden="true">
      {controllerLabel.toLowerCase().includes('viewer') || controllerLabel.includes('查看') ? 'Viewer' : 'Ctrl'}
    </span>
  </div>;

  const detailModel = (effectiveModel ?? model) || '—';
  const detailReasoning = (effectiveReasoning ?? reasoning) || '—';
  const detailPermission = (effectivePermission ?? permission) || '—';
  const detailRows = (
    <dl className="config-detail-list" data-testid="config-detail-sheet">
      <dt>{modelLabel}</dt><dd data-testid="config-detail-model">{detailModel}</dd>
      <dt>{reasoningLabel}</dt><dd data-testid="config-detail-reasoning">{detailReasoning}</dd>
      <dt>{permissionLabel}</dt><dd data-testid="config-detail-permission">{detailPermission}</dd>
      {(requestedModel || requestedReasoning || requestedPermission) && <>
        <dt>Requested</dt>
        <dd data-testid="config-detail-requested">
          {[requestedModel, requestedReasoning, requestedPermission].filter(Boolean).join(' · ') || '—'}
        </dd>
        <dt>Effective</dt>
        <dd data-testid="config-detail-effective">
          {[effectiveModel ?? model, effectiveReasoning ?? reasoning, effectivePermission ?? permission].filter(Boolean).join(' · ') || '—'}
        </dd>
      </>}
      {!mutationSupported && mutationHint ? <dd className="config-detail-hint" data-testid="config-mutation-hint">{mutationHint}</dd> : null}
    </dl>
  );

  return <div
    className={`session-config-bar density-${breakpoint}`}
    data-testid="session-config-bar"
    data-mutation-supported={mutationSupported}
    data-config-rows={mobile ? '1' : 'full'}
  >
    {mobile ? <>
      <button
        type="button"
        ref={triggerRef}
        className="config-capsule"
        data-testid="config-capsule"
        aria-expanded={sheetOpen}
        aria-haspopup="dialog"
        title={summary}
        onClick={() => setSheetOpen(true)}
      >
        <span className="config-capsule-text">{summary}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {controller}
    </> : <>
      {selects}
      {controller}
      {!mutationSupported && (
        <button type="button" className="ghost-button config-detail-trigger" data-testid="config-detail-open"
          onClick={() => setSheetOpen(true)}>
          Details
        </button>
      )}
    </>}

    {sheetOpen && <>
      <div className="drawer-backdrop" data-testid="config-sheet-backdrop" onClick={() => {
        setSheetOpen(false);
        triggerRef.current?.focus();
      }} />
      <div className="drawer drawer-config sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} data-testid="config-sheet">
        <div className="drawer-toolbar">
          <strong id={titleId}>Configuration</strong>
          <button type="button" ref={closeRef} data-testid="config-sheet-close" aria-label="Close configuration"
            onClick={() => { setSheetOpen(false); triggerRef.current?.focus(); }}>Close</button>
        </div>
        <div className="drawer-body">
          {detailRows}
          {!mobile && mutationSupported ? <div className="config-sheet-controls">{selects}</div> : null}
          {mobile && mutationSupported ? <div className="config-sheet-controls">{selects}</div> : null}
          {mobile && !mutationSupported ? null : null}
        </div>
      </div>
    </>}
  </div>;
}
