import type { NativeThread, NativeTurn } from './types.ts';

const nativeNumber = (value: unknown): number | null => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
export function projectTurn(turn: any): NativeTurn {
  const state = { inProgress: 'RUNNING', completed: 'COMPLETED', interrupted: 'INTERRUPTED', failed: 'FAILED' } as const;
  return { id: turn.id, state: state[turn.status as keyof typeof state], startedAt: nativeNumber(turn.startedAt),
    completedAt: nativeNumber(turn.completedAt), durationMs: nativeNumber(turn.durationMs) };
}
export const commandTerminal = (status: string) => ['completed', 'failed', 'declined'].includes(status);
export function residualState(tools: Iterable<NativeThread['activity'][number]>, interrupted: Set<string>): NativeThread['residualCommandState'] {
  const residual = [...tools].filter(tool => interrupted.has(tool.turnId));
  return residual.some(tool => !commandTerminal(tool.status)) ? 'MAY_STILL_BE_RUNNING' : residual.length ? 'OBSERVED_DRAINED' : 'NONE_OBSERVED';
}
