/**
 * Web mapping from semantic icon intents → Lucide.
 * Product code should prefer SemanticIcon(intent) over raw Lucide names.
 * Future Flutter maps the same intents independently.
 */
import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  Menu,
  MoreHorizontal,
  SendHorizontal,
  Settings,
  ShieldAlert,
  Square,
  Waypoints,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export const iconIntents = [
  'settings',
  'sessions',
  'context',
  'send',
  'interrupt',
  'steer',
  'review',
  'connected',
  'controller',
  'viewer',
  'toolRunning',
  'toolCompleted',
  'warning',
] as const;

export type IconIntent = typeof iconIntents[number];

const lucideByIntent: Record<IconIntent, LucideIcon> = {
  settings: Settings,
  sessions: Menu,
  context: MoreHorizontal,
  send: SendHorizontal,
  interrupt: Square,
  steer: Waypoints,
  review: AlertTriangle,
  connected: CheckCircle2,
  controller: Circle,
  viewer: Circle,
  toolRunning: Loader2,
  toolCompleted: CheckCircle2,
  warning: ShieldAlert,
};

/** Failed tool state reuses warning intent glyph (Web Lucide choice). */
export const toolFailedIcon: LucideIcon = XCircle;

export function SemanticIcon({
  intent,
  size = 16,
  className,
  spin = false,
}: {
  intent: IconIntent;
  size?: number;
  className?: string;
  spin?: boolean;
}) {
  const Icon = lucideByIntent[intent];
  return <Icon
    size={size}
    className={[className, spin ? 'spin' : ''].filter(Boolean).join(' ') || undefined}
    aria-hidden="true"
    data-icon-intent={intent}
  />;
}
