import type { NativeThread } from '../../../packages/native-adoption/types.ts';

export function sessionTitle(thread: NativeThread): string {
  return thread.history.find(item => item.role === 'user')?.text.split('\n')[0]?.trim().slice(0, 56) || `Codex · ${thread.id.slice(0, 12)}`;
}
export function matchingSessions(threads: readonly NativeThread[], query: string, recent: readonly string[] = []) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return threads.filter(thread => terms.every(term => `${sessionTitle(thread)} ${thread.workspace} ${thread.id}`.toLocaleLowerCase().includes(term)))
    .sort((a, b) => {
      const rank = (id: string) => recent.includes(id) ? recent.indexOf(id) : recent.length;
      return rank(a.id) - rank(b.id);
    });
}
export type NavigationPreference = { selected: string; recent: string[] };
const key = (scope: string) => `fleetsplice.navigation:${scope}`;
export function readNavigationPreference(scope: string): NavigationPreference {
  try { const value = JSON.parse(localStorage.getItem(key(scope)) ?? 'null');
    return { selected: typeof value?.selected === 'string' ? value.selected : '',
      recent: Array.isArray(value?.recent) ? value.recent.filter((id: unknown) => typeof id === 'string').slice(0, 12) : [] };
  } catch { return { selected: '', recent: [] }; }
}
export function saveNavigationPreference(scope: string, selected: string, recent: readonly string[]) {
  const next = { selected, recent: [selected, ...recent.filter(id => id !== selected)].slice(0, 12) };
  try { localStorage.setItem(key(scope), JSON.stringify(next)); } catch { /* Selection still works without browser storage. */ }
  return next;
}
