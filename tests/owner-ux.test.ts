import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { catalogs, enUS, zhCN, stateText, systemText, translate } from '../apps/web/i18n.ts';
import { appearances, preferenceKeys, readPreferences, persistPreference, resolveAppearance, resolveLocale, resolveTheme } from '../apps/web/preferences.ts';

for (const locale of ['en-US', 'zh-CN'] as const) test(`${locale} catalog is complete and contains no empty messages`, () => {
  assert.equal(Object.keys(catalogs[locale]).length, Object.keys(enUS).length);
  for (const [key, text] of Object.entries(catalogs[locale])) assert.ok(text.trim().length > 0, key);
});
test('catalog keys and interpolation placeholders are exactly compatible', () => {
  assert.deepEqual(Object.keys(zhCN).sort(), Object.keys(enUS).sort());
  for (const key of Object.keys(enUS) as (keyof typeof enUS)[]) {
    const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(parameters(enUS[key]), parameters(zhCN[key]), key);
  }
  assert.equal(translate('zh-CN', 'logicalSession', { id: 'ORBIT-731', control: 'SKYFORGE-01' }), '逻辑会话 ORBIT-731 · SKYFORGE-01');
  for (const code of ['AMBIGUOUS_EFFECT', 'RECOVERY_REQUIRED', 'UNKNOWN_MACHINE_CODE', '__proto__']) assert.ok(stateText('zh-CN', code).includes(code));
  assert.equal(systemText('zh-CN', 'Turn completed'), '本轮已完成');
  assert.equal(systemText('zh-CN', 'ORBIT-731'), 'ORBIT-731');
});
test('locale resolution gives persisted preference priority and has a bounded browser fallback', () => {
  assert.equal(resolveLocale('en-US', ['zh-CN']), 'en-US');
  assert.equal(resolveLocale('zh-CN', ['en-US']), 'zh-CN');
  for (const language of ['zh', 'zh-CN', 'zh-Hans', 'zh-TW', 'ZH-cn']) assert.equal(resolveLocale(null, [language]), 'zh-CN');
  for (const language of ['en-US', 'fr-FR', 'not-zh', 'zhinvalid', '']) assert.equal(resolveLocale('invalid', [language]), 'en-US');
  assert.equal(resolveLocale(undefined, []), 'en-US');
  assert.equal(resolveLocale(undefined, ['fr-FR', 'zh-CN']), 'en-US');
});
test('locale and all four appearances persist independently and survive a new read', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.deepEqual(readPreferences(storage, ['zh-CN']), { locale: 'zh-CN', appearance: 'system' });
  assert.equal(persistPreference(storage, 'locale', 'en-US'), true);
  for (const appearance of appearances) {
    assert.equal(persistPreference(storage, 'appearance', appearance), true);
    assert.deepEqual(readPreferences(storage, ['zh-CN']), { locale: 'en-US', appearance });
  }
  assert.equal(values.size, 2);
  assert.deepEqual([...values.keys()].sort(), Object.values(preferenceKeys).sort());
  const denied = { getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('denied'); } };
  assert.deepEqual(readPreferences(denied, ['zh']), { locale: 'zh-CN', appearance: 'system' });
  assert.equal(persistPreference(denied, 'appearance', 'light'), false);
  assert.equal(persistPreference(undefined, 'locale', 'en-US'), false);
});
test('exactly four appearances resolve system changes and respect explicit overrides', () => {
  assert.deepEqual([...appearances], ['system', 'light', 'dark', 'oled-black']);
  assert.equal(resolveAppearance('unknown'), 'system');
  for (const dark of [true, false]) {
    assert.equal(resolveTheme('system', dark), dark ? 'dark' : 'light');
    for (const explicit of ['light', 'dark', 'oled-black'] as const) assert.equal(resolveTheme(explicit, dark), explicit);
  }
});
test('blocking prepaint bootstrap matches typed preferences, including denied storage', () => {
  const source = readFileSync('apps/web/public/assets/preferences-init.js', 'utf8');
  for (const explicitLocale of [null, 'en-US', 'zh-CN', 'invalid']) for (const explicitAppearance of [null, ...appearances, 'invalid']) {
    for (const language of ['zh-CN', 'en-US']) for (const systemDark of [false, true]) {
      const root = { lang: '', dataset: {} as Record<string, string> };
      const storage = { getItem: (key: string) => key === preferenceKeys.locale ? explicitLocale : explicitAppearance };
      runInNewContext(source, { document: { documentElement: root }, navigator: { languages: [language] }, localStorage: storage, matchMedia: () => ({ matches: systemDark }) });
      assert.equal(root.lang, resolveLocale(explicitLocale, [language]));
      assert.equal(root.dataset.appearance, resolveAppearance(explicitAppearance));
      assert.equal(root.dataset.theme, resolveTheme(resolveAppearance(explicitAppearance), systemDark));
    }
  }
  const root = { lang: '', dataset: {} as Record<string, string> };
  runInNewContext(source, { document: { documentElement: root }, navigator: { language: 'zh' }, localStorage: { getItem: () => { throw Error('denied'); } }, matchMedia: () => ({ matches: true }) });
  assert.equal(root.lang, 'zh-CN'); assert.equal(root.dataset.theme, 'dark');
  const html = readFileSync('apps/web/index.html', 'utf8');
  assert.ok(html.indexOf('src="/assets/preferences-init.js"') < html.indexOf('src="/main.tsx"'));
  assert.ok(!/\b(?:async|defer|type="module")\b/.test(html.match(/<script[^>]*preferences-init[^>]*>/)![0]));
});
