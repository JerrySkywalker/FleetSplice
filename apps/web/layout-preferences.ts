import { browserStorage } from './preferences.ts';

export type ShellLayout = {
  leftWidth: number;
  rightWidth: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
};

export const layoutKeys = {
  leftWidth: 'fleetsplice.layout.leftWidth',
  rightWidth: 'fleetsplice.layout.rightWidth',
  leftCollapsed: 'fleetsplice.layout.leftCollapsed',
  rightCollapsed: 'fleetsplice.layout.rightCollapsed',
} as const;

export const LEFT_MIN = 220;
export const LEFT_MAX = 380;
export const RIGHT_MIN = 240;
export const RIGHT_MAX = 440;
export const LEFT_DEFAULT = 260;
export const RIGHT_DEFAULT = 300;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readNumber(storage: Pick<Storage, 'getItem'> | undefined, key: string, fallback: number, min: number, max: number): number {
  try {
    const raw = storage?.getItem(key);
    const parsed = raw == null ? NaN : Number(raw);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  } catch {
    return fallback;
  }
}

function readBool(storage: Pick<Storage, 'getItem'> | undefined, key: string, fallback: boolean): boolean {
  try {
    const raw = storage?.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function readShellLayout(storage: Pick<Storage, 'getItem'> | undefined = browserStorage()): ShellLayout {
  return {
    leftWidth: readNumber(storage, layoutKeys.leftWidth, LEFT_DEFAULT, LEFT_MIN, LEFT_MAX),
    rightWidth: readNumber(storage, layoutKeys.rightWidth, RIGHT_DEFAULT, RIGHT_MIN, RIGHT_MAX),
    leftCollapsed: readBool(storage, layoutKeys.leftCollapsed, false),
    rightCollapsed: readBool(storage, layoutKeys.rightCollapsed, false),
  };
}

export function persistShellLayout(partial: Partial<ShellLayout>, storage: Pick<Storage, 'setItem'> | undefined = browserStorage()): boolean {
  try {
    if (!storage) return false;
    if (partial.leftWidth !== undefined) storage.setItem(layoutKeys.leftWidth, String(clamp(partial.leftWidth, LEFT_MIN, LEFT_MAX)));
    if (partial.rightWidth !== undefined) storage.setItem(layoutKeys.rightWidth, String(clamp(partial.rightWidth, RIGHT_MIN, RIGHT_MAX)));
    if (partial.leftCollapsed !== undefined) storage.setItem(layoutKeys.leftCollapsed, String(partial.leftCollapsed));
    if (partial.rightCollapsed !== undefined) storage.setItem(layoutKeys.rightCollapsed, String(partial.rightCollapsed));
    return true;
  } catch {
    return false;
  }
}
