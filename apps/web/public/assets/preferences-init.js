// Blocking script on the existing /assets route: apply preferences before first paint.
// Keep this tiny bootstrap compatible with preferences.ts; parity is tested.
(() => {
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const savedLocale = read('fleetsplice.locale');
  const locale = ['zh-CN', 'en-US'].includes(savedLocale) ? savedLocale
    : /^zh(?:-|$)/i.test(navigator.languages?.[0] ?? navigator.language ?? '') ? 'zh-CN' : 'en-US';
  const savedAppearance = read('fleetsplice.appearance');
  const appearance = ['system', 'light', 'dark', 'oled-black'].includes(savedAppearance) ? savedAppearance : 'system';
  document.documentElement.lang = locale;
  document.documentElement.dataset.appearance = appearance;
  document.documentElement.dataset.theme = appearance === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : appearance;
})();
