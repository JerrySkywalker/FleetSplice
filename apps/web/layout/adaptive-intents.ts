/**
 * Shared adaptive layout intents. Web maps local breakpoints → intents.
 * Exact pixel thresholds stay Web-only; Flutter must not copy them.
 */
export const layoutIntents = ['compact', 'medium', 'expanded'] as const;
export type LayoutIntent = typeof layoutIntents[number];

/** Web-local breakpoint class names (do not prescribe to Flutter). */
export type WebBreakpoint = 'mobile' | 'tablet' | 'desktop';

export function layoutIntentFromWebBreakpoint(breakpoint: WebBreakpoint): LayoutIntent {
  if (breakpoint === 'mobile') return 'compact';
  if (breakpoint === 'tablet') return 'medium';
  return 'expanded';
}

/** Current Web thresholds — documented for Web only. */
export const webBreakpointThresholds = {
  compactMaxExclusive: 768,
  mediumMaxExclusive: 1280,
} as const;
