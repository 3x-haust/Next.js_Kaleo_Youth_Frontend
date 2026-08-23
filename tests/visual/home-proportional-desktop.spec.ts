import { expect, test } from '@playwright/test';

test('home preserves the authored 1920 composition at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight))
    .toBe(4502);

  const aboutEyebrow = page.getByText('ABOUT US', { exact: true });
  await expect(aboutEyebrow).toBeVisible();
  await expect
    .poll(() => aboutEyebrow.evaluate((element) => element.getBoundingClientRect().x))
    .toBeGreaterThan(850);

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBe(0);

  await expect(page.getByText('돈에 기대지 마십시오.', { exact: true })).toBeVisible();
  await expect(page.getByText('26 JUL 2026 · SUNDAY WORSHIP', { exact: true })).toBeVisible();
  await expect(page.getByText('2026.06.10', { exact: true })).toHaveCount(4);
});
