import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

/** npm test runs from the repository root; compiled tests live under test-results/. */
const root = process.cwd();
const tokensRoot = path.join(root, 'packages/design-tokens');
const themes = ['light', 'dark', 'oled-black', 'midnight', 'graphite', 'warm'] as const;
const requiredColors = [
  'canvas', 'surface', 'panel', 'raised', 'text', 'textMuted', 'border', 'hover',
  'accent', 'onAccent', 'selected', 'focus', 'success', 'attention', 'danger', 'streaming', 'tool',
] as const;

function readJson(rel: string) {
  return JSON.parse(readFileSync(path.join(root, rel), 'utf8'));
}

test('design-token themes expose the bounded semantic color set', () => {
  for (const id of themes) {
    const theme = readJson(`packages/design-tokens/src/themes/${id}.json`);
    for (const key of requiredColors) {
      assert.equal(typeof theme.color[key].$value, 'string', `${id}.${key}`);
      assert.match(theme.color[key].$value, /^#/);
    }
  }
  const oled = readJson('packages/design-tokens/src/themes/oled-black.json');
  assert.equal(oled.color.canvas.$value, '#000000');
  assert.equal(oled.color.surface.$value, '#000000');
});

test('foundation tokens stay small and explicit', () => {
  const foundation = readJson('packages/design-tokens/src/foundation.json');
  assert.deepEqual(Object.keys(foundation.spacing), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(Object.keys(foundation.radii), ['sm', 'md', 'lg']);
  assert.equal(foundation.controls.compactHeight.$value, '32px');
  assert.equal(foundation.controls.touchHeight.$value, '36px');
  assert.equal(foundation.motion.normalDuration.$value, '160ms');
  assert.equal(foundation.motion.fastDuration.$value, '100ms');
});

test('generated web CSS and flutter dart proof exist and preserve OLED black', () => {
  const cssPath = path.join(tokensRoot, 'generated/web/tokens.css');
  const dartPath = path.join(tokensRoot, 'generated/flutter/fleetsplice_tokens.dart');
  assert.equal(existsSync(cssPath), true);
  assert.equal(existsSync(dartPath), true);
  const css = readFileSync(cssPath, 'utf8');
  assert.match(css, /:root\[data-theme="oled-black"\][\s\S]*--canvas: #000000/);
  assert.match(css, /--control-h-desktop: 32px/);
  assert.match(css, /--touch-h: 36px/);
  const dart = readFileSync(dartPath, 'utf8');
  assert.match(dart, /class FleetSpliceColors/);
  assert.match(dart, /compactHeight:/);
  assert.match(dart, /fastDurationMs:/);
  assert.match(dart, /fleetSpliceIconIntents/);
  assert.match(dart, /fleetSpliceLayoutIntents/);
});

test('skin-probe fixture changes accent/surface/radius without being a user theme', () => {
  const probe = readJson('packages/design-tokens/fixtures/skin-probe.json');
  const light = readJson('packages/design-tokens/src/themes/light.json');
  assert.equal(probe.userFacing, false);
  assert.notEqual(probe.overrides.color.accent.$value, light.color.accent.$value);
  assert.notEqual(probe.overrides.color.surface.$value, light.color.surface.$value);
  assert.notEqual(probe.overrides.radii.md.$value, '8px');
  const skinCss = readFileSync(path.join(tokensRoot, 'generated/web/skin-probe.css'), 'utf8');
  assert.match(skinCss, /data-skin-probe="true"/);
  assert.match(skinCss, /--accent: #7a2f6b/);
  assert.match(skinCss, /--radius-md: 4px/);
  // Preferences theme IDs remain the production set — probe is attribute-gated.
  const prefs = readFileSync(path.join(root, 'apps/web/preferences.ts'), 'utf8');
  assert.match(prefs, /oled-black/);
  assert.doesNotMatch(prefs, /skin-probe/);
});

test('icon and layout intent contracts stay bounded', () => {
  const icons = readJson('packages/design-tokens/src/icon-intents.json');
  const layouts = readJson('packages/design-tokens/src/layout-intents.json');
  assert.deepEqual(icons.intents, [
    'settings', 'sessions', 'context', 'send', 'interrupt', 'steer', 'review',
    'connected', 'controller', 'viewer', 'toolRunning', 'toolCompleted', 'warning',
  ]);
  assert.deepEqual(layouts.intents.map((i: { name: string }) => i.name), ['compact', 'medium', 'expanded']);
});
