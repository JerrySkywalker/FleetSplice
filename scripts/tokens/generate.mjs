/**
 * Deterministic design-token generator.
 * Source: packages/design-tokens/src/**
 * Outputs:
 *   - packages/design-tokens/generated/web/tokens.css
 *   - packages/design-tokens/generated/flutter/fleetsplice_tokens.dart
 *   - packages/design-tokens/generated/web/skin-probe.css (dev/test only)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcDir = path.join(root, 'packages/design-tokens/src');
const themesDir = path.join(srcDir, 'themes');
const outWeb = path.join(root, 'packages/design-tokens/generated/web');
const outFlutter = path.join(root, 'packages/design-tokens/generated/flutter');
const fixturePath = path.join(root, 'packages/design-tokens/fixtures/skin-probe.json');

const THEME_IDS = ['light', 'dark', 'oled-black', 'midnight', 'graphite', 'warm'];

const COLOR_CSS = {
  canvas: '--canvas',
  surface: '--surface',
  panel: '--panel',
  raised: '--raised',
  text: '--text',
  textMuted: '--muted',
  border: '--border',
  hover: '--hover',
  accent: '--accent',
  onAccent: '--on-accent',
  accentHover: '--accent-hover',
  selected: '--selected',
  selectedText: '--selected-text',
  focus: '--focus',
  online: '--online',
  offline: '--offline',
  success: '--success',
  attention: '--attention',
  warning: '--warning',
  danger: '--danger',
  streaming: '--streaming',
  tool: '--tool',
  warningBg: '--warning-bg',
  warningText: '--warning-text',
  warningBorder: '--warning-border',
  footer: '--footer',
  shadowColor: '--shadow-color',
};

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function tokenValue(node) {
  if (node && typeof node === 'object' && '$value' in node) return node.$value;
  throw new Error(`Missing $value in token node: ${JSON.stringify(node)}`);
}

function loadFoundation() {
  return readJson(path.join(srcDir, 'foundation.json'));
}

function loadThemes() {
  const themes = {};
  for (const id of THEME_IDS) {
    const file = path.join(themesDir, `${id}.json`);
    themes[id] = readJson(file);
  }
  const found = readdirSync(themesDir).filter(f => f.endsWith('.json')).sort();
  const expected = THEME_IDS.map(id => `${id}.json`).sort();
  if (JSON.stringify(found) !== JSON.stringify(expected)) {
    throw new Error(`Theme set mismatch. found=${found.join(',')} expected=${expected.join(',')}`);
  }
  return themes;
}

function emitCss(foundation, themes) {
  const lines = [];
  lines.push('/* GENERATED FILE — do not edit. Source: packages/design-tokens/src */');
  lines.push('/* Reproducible via: npm run tokens:generate */');
  lines.push('');

  const light = themes.light;
  lines.push(':root {');
  lines.push(`  color-scheme: ${tokenValue(light.colorScheme)};`);
  for (const [key, cssVar] of Object.entries(COLOR_CSS)) {
    lines.push(`  ${cssVar}: ${tokenValue(light.color[key])};`);
  }
  lines.push(`  --shadow: 0 8px 28px var(--shadow-color);`);
  lines.push(`  --radius: ${tokenValue(foundation.radii.md)};`);
  lines.push(`  --radius-sm: ${tokenValue(foundation.radii.sm)};`);
  lines.push(`  --radius-md: ${tokenValue(foundation.radii.md)};`);
  lines.push(`  --radius-lg: ${tokenValue(foundation.radii.lg)};`);
  for (let i = 1; i <= 6; i++) {
    lines.push(`  --space-${i}: ${tokenValue(foundation.spacing[String(i)])};`);
  }
  lines.push(`  --control-h: ${tokenValue(foundation.controls.compactHeight)};`);
  lines.push(`  --control-h-desktop: ${tokenValue(foundation.controls.compactHeight)};`);
  lines.push(`  --touch-h: ${tokenValue(foundation.controls.touchHeight)};`);
  lines.push(`  --btn-font: 12.5px;`);
  lines.push(`  --type-body: ${tokenValue(foundation.typography.body)};`);
  lines.push(`  --type-small: ${tokenValue(foundation.typography.small)};`);
  lines.push(`  --type-label: ${tokenValue(foundation.typography.label)};`);
  lines.push(`  --type-title: ${tokenValue(foundation.typography.title)};`);
  lines.push(`  --motion-fast: ${tokenValue(foundation.motion.fastDuration)} ease;`);
  lines.push(`  --motion: ${tokenValue(foundation.motion.normalDuration)} ease;`);
  lines.push(`  --left-panel: 260px;`);
  lines.push(`  --right-panel: 300px;`);
  lines.push(`  --conversation-gutter: 16px;`);
  lines.push('}');

  for (const id of THEME_IDS) {
    if (id === 'light') continue;
    const theme = themes[id];
    lines.push(`:root[data-theme="${id}"] {`);
    lines.push(`  color-scheme: ${tokenValue(theme.colorScheme)};`);
    for (const [key, cssVar] of Object.entries(COLOR_CSS)) {
      lines.push(`  ${cssVar}: ${tokenValue(theme.color[key])};`);
    }
    lines.push('}');
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function emitSkinProbeCss(foundation, probe) {
  const lines = [];
  lines.push('/* GENERATED — DEV/TEST skin probe only. Not a user-facing theme. */');
  lines.push(':root[data-skin-probe="true"] {');
  for (const [key, node] of Object.entries(probe.overrides.color ?? {})) {
    const cssVar = COLOR_CSS[key];
    if (!cssVar) throw new Error(`Unknown skin-probe color key: ${key}`);
    lines.push(`  ${cssVar}: ${tokenValue(node)};`);
  }
  for (const [key, node] of Object.entries(probe.overrides.radii ?? {})) {
    lines.push(`  --radius-${key}: ${tokenValue(node)};`);
    if (key === 'md') lines.push(`  --radius: ${tokenValue(node)};`);
  }
  lines.push('}');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function parseCssDim(value) {
  const m = String(value).trim().match(/^(-?[\d.]+)(px|ms)$/);
  if (!m) throw new Error(`Unsupported dimension for Dart proof: ${value}`);
  return { amount: Number(m[1]), unit: m[2] };
}

function dartColor(hex) {
  const raw = String(hex).trim().replace('#', '');
  if (raw.length === 6) return `Color(0xFF${raw.toUpperCase()})`;
  if (raw.length === 8) {
    const rgb = raw.slice(0, 6).toUpperCase();
    const aa = raw.slice(6, 8).toUpperCase();
    return `Color(0x${aa}${rgb})`;
  }
  throw new Error(`Unsupported color: ${hex}`);
}

function emitDart(foundation, themes, iconIntents, layoutIntents) {
  const lines = [];
  lines.push('// GENERATED FILE — do not edit. Source: packages/design-tokens/src');
  lines.push('// Flutter portability PROOF only. Not a Flutter application.');
  lines.push('// ignore_for_file: dangling_library_doc_comments');
  lines.push('');
  lines.push("import 'package:flutter/painting.dart';");
  lines.push('');
  lines.push('/// Semantic colors for one FleetSplice theme.');
  lines.push('class FleetSpliceColors {');
  lines.push('  const FleetSpliceColors({');
  for (const key of Object.keys(COLOR_CSS)) {
    lines.push(`    required this.${key},`);
  }
  lines.push('  });');
  lines.push('');
  for (const key of Object.keys(COLOR_CSS)) {
    lines.push(`  final Color ${key};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('/// Shared spacing / radii / controls / motion (platform-neutral values).');
  lines.push('class FleetSpliceMetrics {');
  lines.push('  const FleetSpliceMetrics({');
  lines.push('    required this.space1,');
  lines.push('    required this.space2,');
  lines.push('    required this.space3,');
  lines.push('    required this.space4,');
  lines.push('    required this.space5,');
  lines.push('    required this.space6,');
  lines.push('    required this.radiusSm,');
  lines.push('    required this.radiusMd,');
  lines.push('    required this.radiusLg,');
  lines.push('    required this.compactHeight,');
  lines.push('    required this.touchHeight,');
  lines.push('    required this.typeBody,');
  lines.push('    required this.typeSmall,');
  lines.push('    required this.typeLabel,');
  lines.push('    required this.typeTitle,');
  lines.push('    required this.fastDurationMs,');
  lines.push('    required this.normalDurationMs,');
  lines.push('  });');
  lines.push('');
  lines.push('  final double space1;');
  lines.push('  final double space2;');
  lines.push('  final double space3;');
  lines.push('  final double space4;');
  lines.push('  final double space5;');
  lines.push('  final double space6;');
  lines.push('  final double radiusSm;');
  lines.push('  final double radiusMd;');
  lines.push('  final double radiusLg;');
  lines.push('  final double compactHeight;');
  lines.push('  final double touchHeight;');
  lines.push('  final double typeBody;');
  lines.push('  final double typeSmall;');
  lines.push('  final double typeLabel;');
  lines.push('  final double typeTitle;');
  lines.push('  final int fastDurationMs;');
  lines.push('  final int normalDurationMs;');
  lines.push('}');
  lines.push('');
  lines.push('class FleetSpliceThemeTokens {');
  lines.push('  const FleetSpliceThemeTokens({required this.id, required this.colors});');
  lines.push('  final String id;');
  lines.push('  final FleetSpliceColors colors;');
  lines.push('}');
  lines.push('');

  const s = (n) => parseCssDim(tokenValue(foundation.spacing[String(n)])).amount;
  const r = (k) => parseCssDim(tokenValue(foundation.radii[k])).amount;
  const c = (k) => parseCssDim(tokenValue(foundation.controls[k])).amount;
  const t = (k) => parseCssDim(tokenValue(foundation.typography[k])).amount;
  const mFast = parseCssDim(tokenValue(foundation.motion.fastDuration)).amount;
  const mNorm = parseCssDim(tokenValue(foundation.motion.normalDuration)).amount;

  lines.push('const fleetSpliceMetrics = FleetSpliceMetrics(');
  lines.push(`  space1: ${s(1)}, space2: ${s(2)}, space3: ${s(3)},`);
  lines.push(`  space4: ${s(4)}, space5: ${s(5)}, space6: ${s(6)},`);
  lines.push(`  radiusSm: ${r('sm')}, radiusMd: ${r('md')}, radiusLg: ${r('lg')},`);
  lines.push(`  compactHeight: ${c('compactHeight')}, touchHeight: ${c('touchHeight')},`);
  lines.push(`  typeBody: ${t('body')}, typeSmall: ${t('small')}, typeLabel: ${t('label')}, typeTitle: ${t('title')},`);
  lines.push(`  fastDurationMs: ${mFast}, normalDurationMs: ${mNorm},`);
  lines.push(');');
  lines.push('');
  lines.push('const fleetSpliceThemes = <FleetSpliceThemeTokens>[');
  for (const id of THEME_IDS) {
    const theme = themes[id];
    lines.push('  FleetSpliceThemeTokens(');
    lines.push(`    id: '${id}',`);
    lines.push('    colors: FleetSpliceColors(');
    for (const key of Object.keys(COLOR_CSS)) {
      lines.push(`      ${key}: ${dartColor(tokenValue(theme.color[key]))},`);
    }
    lines.push('    ),');
    lines.push('  ),');
  }
  lines.push('];');
  lines.push('');
  lines.push('/// Semantic icon intents (map to platform glyphs separately).');
  lines.push(`const fleetSpliceIconIntents = <String>[${iconIntents.intents.map(i => `'${i}'`).join(', ')}];`);
  lines.push('');
  lines.push('/// Adaptive layout intents (thresholds are platform-local).');
  lines.push(`const fleetSpliceLayoutIntents = <String>[${layoutIntents.intents.map(i => `'${i.name}'`).join(', ')}];`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  mkdirSync(outWeb, { recursive: true });
  mkdirSync(outFlutter, { recursive: true });
  const foundation = loadFoundation();
  const themes = loadThemes();
  const iconIntents = readJson(path.join(srcDir, 'icon-intents.json'));
  const layoutIntents = readJson(path.join(srcDir, 'layout-intents.json'));
  const probe = readJson(fixturePath);

  const css = emitCss(foundation, themes);
  const dart = emitDart(foundation, themes, iconIntents, layoutIntents);
  const skin = emitSkinProbeCss(foundation, probe);

  writeFileSync(path.join(outWeb, 'tokens.css'), css, 'utf8');
  writeFileSync(path.join(outWeb, 'skin-probe.css'), skin, 'utf8');
  writeFileSync(path.join(outFlutter, 'fleetsplice_tokens.dart'), dart, 'utf8');

  process.stdout.write(`tokens:generate wrote\n  ${path.join(outWeb, 'tokens.css')}\n  ${path.join(outWeb, 'skin-probe.css')}\n  ${path.join(outFlutter, 'fleetsplice_tokens.dart')}\n`);
}

main();
