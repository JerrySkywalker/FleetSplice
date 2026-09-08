import { locales, type Locale } from './i18n.ts';
export const appearances = ['system', 'light', 'dark', 'oled-black'] as const;
export type Appearance = typeof appearances[number];
export type ResolvedTheme = Exclude<Appearance, 'system'>;
export type Preferences = { locale: Locale; appearance: Appearance };
export const preferenceKeys = { locale: 'fleetsplice.locale', appearance: 'fleetsplice.appearance' } as const;
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;
export function resolveLocale(explicit: unknown, languages: readonly string[]): Locale {
  if (locales.includes(explicit as Locale)) return explicit as Locale;
  return /^zh(?:-|$)/i.test(languages[0] ?? '') ? 'zh-CN' : 'en-US';
}
export function resolveAppearance(explicit: unknown): Appearance {
  return appearances.includes(explicit as Appearance) ? explicit as Appearance : 'system';
}
export function resolveTheme(appearance: Appearance, systemDark: boolean): ResolvedTheme {
  return appearance === 'system' ? (systemDark ? 'dark' : 'light') : appearance;
}
export function readPreferences(storage: PreferenceStorage | undefined, languages: readonly string[]): Preferences {
  const read = (key: string) => { try { return storage?.getItem(key); } catch { return null; } };
  return { locale: resolveLocale(read(preferenceKeys.locale), languages), appearance: resolveAppearance(read(preferenceKeys.appearance)) };
}
export function persistPreference<K extends keyof Preferences>(storage: PreferenceStorage | undefined, key: K, value: Preferences[K]): boolean {
  try { if (!storage) return false; storage.setItem(preferenceKeys[key], value); return true; } catch { return false; }
}
export function browserStorage(): Storage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}
