import { Button } from '../../../packages/ui/components/button.tsx';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '../../../packages/ui/components/sheet.tsx';
import { NativeSelect, NativeSelectOption } from '../../../packages/ui/components/native-select.tsx';
import type { Locale } from '../i18n.ts';
import { StatusChip } from './Presentation.tsx';
import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBreakpoint } from './AppShell.tsx';
import { compactConfigSummary } from '../compact-config.ts';

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
  locale = 'en-US', showController = true,
}: {
  locale?: Locale; showController?: boolean;
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
  const zh = locale === 'zh-CN';
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const observedModel = effectiveModel ?? model;
  const observedReasoning = effectiveReasoning ?? reasoning;
  const observedPermission = effectivePermission ?? permission;
  const summary = compactConfigSummary({ model: observedModel, reasoning: observedReasoning, permission: observedPermission });
  const surfaceVariant = mobile ? 'sheet' : 'side';
  const interactiveSelects = <>
    <label className="config-field grid gap-2 text-sm">
      <span>{modelLabel}</span>
      <NativeSelect className="w-full [&_select]:h-10 [&_select]:text-sm max-sm:[&_select]:h-11" data-testid="config-model" aria-label={modelLabel} title={modelTitle ?? model}
        value={model} disabled={modelDisabled || !models.length}
        onChange={event => onModel?.(event.target.value)}>
        {!models.length && <NativeSelectOption value={model || ''}>{model || '—'}</NativeSelectOption>}
        {models.map(item => <NativeSelectOption key={item.id} value={item.id} disabled={item.disabled}>
          {item.label}
        </NativeSelectOption>)}
      </NativeSelect>
    </label>
    <label className="config-field grid gap-2 text-sm">
      <span>{reasoningLabel}</span>
      <NativeSelect className="w-full [&_select]:h-10 [&_select]:text-sm max-sm:[&_select]:h-11" data-testid="config-reasoning" aria-label={reasoningLabel} title={reasoningTitle ?? reasoning}
        value={reasoning} disabled={reasoningDisabled || !reasonings.length}
        onChange={event => onReasoning?.(event.target.value)}>
        {!reasonings.length && <NativeSelectOption value={reasoning || ''}>{reasoning || '—'}</NativeSelectOption>}
        {reasonings.map(item => <NativeSelectOption key={item.id} value={item.id} disabled={item.disabled}>
          {item.label}
        </NativeSelectOption>)}
      </NativeSelect>
    </label>
    <label className="config-field grid gap-2 text-sm">
      <span>{permissionLabel}</span>
      <NativeSelect className="w-full [&_select]:h-10 [&_select]:text-sm max-sm:[&_select]:h-11" data-testid="config-permission" aria-label={permissionLabel} title={permissionTitle ?? permission}
        value={permission} disabled={permissionDisabled || !permissions.length}
        onChange={event => onPermission?.(event.target.value)}>
        {!permissions.length && <NativeSelectOption value={permission || ''}>{permission || '—'}</NativeSelectOption>}
        {permissions.map(item => <NativeSelectOption key={item.id} value={item.id} disabled={item.disabled}>
          {item.label}
        </NativeSelectOption>)}
      </NativeSelect>
    </label>
  </>;

  const isViewer = controllerLabel.toLowerCase().includes("viewer") || controllerLabel.includes("查看");
  const controller = <StatusChip kind={isViewer ? "viewer" : "controller"} testId="config-controller" title={controllerLabel} label={isViewer ? (zh ? "查看者" : "Viewer") : (zh ? "控制者" : "Controller")}/>;

  const detailModel = observedModel || '—';
  const detailReasoning = observedReasoning || '—';
  const detailPermission = observedPermission || '—';
  const detailRows = (
    <dl className="config-detail-list" data-testid="config-detail-sheet">
      <dt>{modelLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-model">{detailModel}</dd>
      <dt>{reasoningLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-reasoning">{detailReasoning}</dd>
      <dt>{permissionLabel}</dt><dd className="text-wrap-safe" data-testid="config-detail-permission">{detailPermission}</dd>
      {(requestedModel || requestedReasoning || requestedPermission) && <>
        <dt>{zh ? '请求值' : 'Requested'}</dt>
        <dd className="text-wrap-safe" data-testid="config-detail-requested">
          {[requestedModel, requestedReasoning, requestedPermission].filter(Boolean).join(' · ') || '—'}
        </dd>
        <dt>{zh ? '有效值' : 'Effective'}</dt>
        <dd className="text-wrap-safe" data-testid="config-detail-effective">
          {[observedModel, observedReasoning, observedPermission].filter(Boolean).join(' · ') || '—'}
        </dd>
      </>}
      {!mutationSupported && mutationHint ? <dd className="config-detail-hint text-wrap-safe" data-testid="config-mutation-hint">{mutationHint}</dd> : null}
    </dl>
  );

  return <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
    <div className={`session-config-bar density-${breakpoint}`} data-testid="session-config-bar" data-mutation-supported={mutationSupported}
      data-config-rows="1" data-config-capsule="true" data-observe-chips={!mutationSupported ? 'capsule' : 'false'}>
      <SheetTrigger render={<Button type="button" ref={triggerRef} variant="outline" className="config-capsule" data-testid="config-capsule" data-clipping-policy="ellipsis" aria-label={`${modelLabel}: ${summary}`} title={summary}/> }>
        <span className="config-capsule-text text-ellipsis">{summary}</span><ChevronDown size={14} aria-hidden="true"/>
      </SheetTrigger>
      {showController && controller}
    </div>
    <SheetContent side={mobile ? 'bottom' : 'right'} showCloseButton={false} finalFocus={triggerRef}
      data-testid="config-sheet" data-config-surface={surfaceVariant} className={mobile ? 'max-h-[85dvh] rounded-t-xl' : 'w-[min(420px,100vw)]!'}>
      <SheetHeader className="flex-row items-center justify-between border-b p-4"><SheetTitle>{zh ? '会话配置' : 'Configuration'}</SheetTitle>
        <SheetClose render={<Button type="button" variant="ghost" data-testid="config-sheet-close" className="max-sm:min-h-11" aria-label={zh ? '关闭配置' : 'Close configuration'}/>}>{zh ? '关闭' : 'Close'}</SheetClose>
      </SheetHeader>
      <SheetDescription className="sr-only">{zh ? '已观察的有效值；请求值单独显示。' : 'Observed effective values; requested values are shown separately.'}</SheetDescription>
      <div className="min-h-0 overflow-y-auto p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        {detailRows}
        {mutationSupported && <div className="mt-6 grid gap-4" data-testid="config-sheet-controls">{interactiveSelects}</div>}
      </div>
    </SheetContent>
  </Sheet>;
}
