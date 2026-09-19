import React from 'react';

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
}: {
  modelLabel: string; reasoningLabel: string; permissionLabel: string; controllerLabel: string;
  model: string; reasoning: string; permission: string;
  models: ConfigOption[]; reasonings: ConfigOption[]; permissions: ConfigOption[];
  modelDisabled?: boolean; reasoningDisabled?: boolean; permissionDisabled?: boolean;
  modelTitle?: string; reasoningTitle?: string; permissionTitle?: string;
  onModel?: (value: string) => void; onReasoning?: (value: string) => void; onPermission?: (value: string) => void;
  mutationSupported: boolean;
  mutationHint?: string;
}) {
  return <div className="session-config-bar" data-testid="session-config-bar" data-mutation-supported={mutationSupported}>
    <label className="config-chip">
      <span>{modelLabel}</span>
      <select data-testid="config-model" aria-label={modelLabel} title={modelTitle}
        value={model} disabled={modelDisabled || !mutationSupported || !models.length}
        onChange={event => onModel?.(event.target.value)}>
        {!models.length && <option value={model || ''}>{model || '—'}</option>}
        {models.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{reasoningLabel}</span>
      <select data-testid="config-reasoning" aria-label={reasoningLabel} title={reasoningTitle}
        value={reasoning} disabled={reasoningDisabled || !mutationSupported || !reasonings.length}
        onChange={event => onReasoning?.(event.target.value)}>
        {!reasonings.length && <option value={reasoning || ''}>{reasoning || '—'}</option>}
        {reasonings.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>)}
      </select>
    </label>
    <label className="config-chip">
      <span>{permissionLabel}</span>
      <select data-testid="config-permission" aria-label={permissionLabel} title={permissionTitle}
        value={permission} disabled={permissionDisabled || !mutationSupported || !permissions.length}
        onChange={event => onPermission?.(event.target.value)}>
        {!permissions.length && <option value={permission || ''}>{permission || '—'}</option>}
        {permissions.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>)}
      </select>
    </label>
    <div className="config-chip controller-chip" data-testid="config-controller" title={controllerLabel}>
      <span className="controller-dot" aria-hidden="true" />
      <span>{controllerLabel}</span>
    </div>
    {!mutationSupported && mutationHint ? <p className="config-hint" data-testid="config-mutation-hint">{mutationHint}</p> : null}
  </div>;
}
