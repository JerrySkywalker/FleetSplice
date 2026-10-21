import assert from 'node:assert/strict';
import { expect, type Locator, type Page } from '@playwright/test';
import { stateText, type Locale } from '../apps/web/i18n.ts';
import type { Appearance } from '../apps/web/preferences.ts';

export async function expectState(locator: Locator, state: string, locale: Locale = 'en-US', options: { timeout?: number } = {}) {
  await expect(locator).toHaveAttribute('data-state', state, options);
  await expect(locator).toHaveText(stateText(locale, state), options);
}
export async function setPresentation(page: Page, locale: Locale, appearance: Appearance) {
  await page.getByTestId('preferences').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByTestId('locale-select').selectOption(locale);
  await page.getByTestId('appearance-select').selectOption(appearance);
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('data-appearance', appearance);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByTestId('preferences')).toBeFocused();
}
// Inspect actual painted foreground/background pairs, not only palette declarations.
export async function inspectContrast(page: Page) {
  const rows = await page.evaluate(() => {
    const selectors = ['.brand', '.mark', '.empty-symbol', '.empty p', '.eyebrow', '.subtitle', '.session.selected', '.session.selected small', '.workspace small',
      '.local-note', '.status', '.context .muted', '.context dt', '.context dd', '.control-next', '.composer label',
      '.message-text', '.message-label', 'footer', 'button:not(:disabled)', 'input:not(:disabled)', '[role=dialog] h2', '[role=dialog] label', '[role=dialog] select', '[role=dialog] p'];
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const paint = canvas.getContext('2d', { willReadFrequently: true })!;
    return selectors.flatMap(selector => [...document.querySelectorAll<HTMLElement>(selector)].filter(element => element.checkVisibility()).map(element => {
      const ancestors: Element[] = []; let current: Element | null = element;
      while (current) { ancestors.unshift(current); current = current.parentElement; }
      paint.clearRect(0, 0, 1, 1); paint.fillStyle = '#fff'; paint.fillRect(0, 0, 1, 1);
      for (const ancestor of ancestors) { paint.fillStyle = getComputedStyle(ancestor).backgroundColor; paint.fillRect(0, 0, 1, 1); }
      const background = [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3);
      paint.fillStyle = getComputedStyle(element).color; paint.fillRect(0, 0, 1, 1);
      const foreground = [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3);
      return { selector, foreground, background };
    }));
  });
  const luminance = (color: number[]) => {
    const components = color.map(value => {
      const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return .2126 * components[0]! + .7152 * components[1]! + .0722 * components[2]!;
  };
  assert.ok(rows.length > 15, 'major UI surfaces must be inspected');
  const measured = rows.map(row => { const a = luminance(row.foreground), b = luminance(row.background); return { ...row, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }; });
  for (const row of measured) assert.ok(row.ratio >= 4.5, `${row.selector}: ${row.foreground} on ${row.background} = ${row.ratio}`);
  return measured;
}
