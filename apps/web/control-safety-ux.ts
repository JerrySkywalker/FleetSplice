/** Presentation severity for Fleet Control / Safety UX. Never auto-acknowledges. */
export type PresentationSeverity = 'info' | 'attention' | 'danger';

export type ControlSurfaceMode =
  | 'send'
  | 'steer_interrupt'
  | 'review'
  | 'receipt_lookup'
  | 'attach'
  | 'viewer';

export function permissionPresentation(permission: string | null | undefined, zh: boolean): { label: string; severity: PresentationSeverity } {
  if (!permission) return { label: zh ? '权限尚未观察' : 'Permission not yet observed', severity: 'info' };
  if (/approval\s*=\s*never|YOLO|dangerFullAccess/i.test(permission)) {
    return { label: permission, severity: 'info' };
  }
  return { label: permission, severity: 'info' };
}

export function externalAdvanceSeverity(): PresentationSeverity {
  // Ordinary cooperative TUI advancement is informational, not a fault banner.
  return 'info';
}

export function residualSeverity(state: string | null | undefined): PresentationSeverity {
  if (state === 'MAY_STILL_BE_RUNNING') return 'attention';
  return 'info';
}

export function observationSeverity(state: string | null | undefined): PresentationSeverity {
  if (!state || state === 'READY') return 'info';
  if (state === 'NATIVE_OBSERVATION_LOST' || /UNKNOWN|UNPROVABLE|RECOVERY/.test(state)) return 'danger';
  return 'attention';
}

export function controlSurfaceMode(input: {
  attached: boolean;
  controlled: boolean;
  externalAdvance: boolean;
  activeTurn: boolean;
  outcomeUnknown: boolean;
  viewer: boolean;
}): ControlSurfaceMode {
  if (input.outcomeUnknown) return 'receipt_lookup';
  if (!input.attached) return 'attach';
  if (input.viewer || !input.controlled) return 'viewer';
  if (input.externalAdvance) return 'review';
  if (input.activeTurn) return 'steer_interrupt';
  return 'send';
}

export function approvalResolveUnavailableLabel(permission: string | null | undefined, zh: boolean): string {
  if (permission && /approval\s*=\s*never|YOLO/i.test(permission)) {
    return zh ? '当前权限为自动通过（YOLO / approval=never）' : 'Current permission auto-approves (YOLO / approval=never)';
  }
  return zh ? '此运行时未提供网页审批解析' : 'Approval resolve is not offered by this runtime';
}
