import test from 'node:test';
import assert from 'node:assert/strict';
import { LEFT_MAX, LEFT_MIN, RIGHT_MAX, RIGHT_MIN, layoutKeys, persistShellLayout, readShellLayout } from '../apps/web/layout-preferences.ts';

test('shell layout widths clamp and collapse state persists', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  assert.equal(persistShellLayout({ leftWidth: 100, rightWidth: 999, leftCollapsed: true, rightCollapsed: false }, storage), true);
  const layout = readShellLayout(storage);
  assert.equal(layout.leftWidth, LEFT_MIN);
  assert.equal(layout.rightWidth, RIGHT_MAX);
  assert.equal(layout.leftCollapsed, true);
  assert.equal(layout.rightCollapsed, false);
  assert.ok(layout.leftWidth >= LEFT_MIN && layout.leftWidth <= LEFT_MAX);
  assert.ok(layout.rightWidth >= RIGHT_MIN && layout.rightWidth <= RIGHT_MAX);
  assert.deepEqual([...values.keys()].sort(), Object.values(layoutKeys).sort());
});
