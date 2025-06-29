import { test, expect } from '@playwright/test';

test(`visit and screenshot`, async ({ page }) => {
  await page.goto('https://sentry.io/careers/#openings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await page.getByLabel('Filter By offices:').selectOption('63ea26ea-e529-472a-93cc-fbd1a85c9941');
  await page.waitForTimeout(5000);
  await expect(page.locator('section.e1powafx10')).toHaveScreenshot({
    mask: [page.locator('div.css-scgl3v.e1powafx7 > p')],
  });
});
