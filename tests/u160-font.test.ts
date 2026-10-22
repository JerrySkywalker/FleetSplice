import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { authFixture } from './fixtures/u160-auth.ts';

test('U05 real Gateway serves the selected Inter font used by the login surface', async () => {
  const fixture = await authFixture(path.resolve('C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022/U05', `font-${Date.now()}`));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ ignoreHTTPSErrors: true, locale: 'en-US' }); await page.goto(fixture.origin);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.fonts.check('14px "Inter Variable"', 'FleetSplice')), true);
  } finally { await browser.close(); await fixture.close(); }
});
