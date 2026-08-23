import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const routes = [
  ['home', '/', /부름 받았습니다/],
  ['about', '/about', /혼자가 아니라 함께/],
  ['jteen', '/jteen', /J-TEEN\s*WORSHIP/],
  ['setlists', '/jteen/setlists', /J-TEEN\s*WORSHIP/],
  ['setlist-three', '/jteen/setlists/44444444-4444-4444-8444-444444444441', /J-TEEN|찬양/],
  ['setlist-four', '/jteen/setlists/44444444-4444-4444-8444-444444444442', /J-TEEN|찬양/],
  ['sermons', '/sermons', /말씀/],
  ['sermon-detail', '/sermons/11111111-1111-4111-8111-111111111111', /설교보기/],
  ['events', '/events', /다가오는 일정/],
  ['share', '/share', /이야기|갤러리/],
  ['gallery', '/share/gallery', /이야기|갤러리/],
  ['gallery-detail', '/share/gallery/33333333-3333-4333-8333-333333333361', /청소년부 여름캠프/],
  ['privacy', '/privacy', /개인정보/],
] as const;

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-boundary', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
    });

    for (const [name, route, landmark] of routes) {
      test(`${route} renders its landmark without horizontal overflow`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' });
        await expect(page.getByRole('heading', { level: 1 })).toContainText(landmark);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        const clippedHeadings = await page.locator('main h1, main h2, main h3').evaluateAll(
          (headings) => headings.flatMap((heading) => {
            const rect = heading.getBoundingClientRect();
            const style = getComputedStyle(heading);
            if (
              style.display === 'none'
              || style.visibility === 'hidden'
              || rect.width === 0
              || rect.height === 0
              || (rect.left >= -1 && rect.right <= innerWidth + 1)
            ) {
              return [];
            }

            return [`${heading.textContent?.trim() ?? ''}: ${rect.left}..${rect.right}`];
          }),
        );
        expect(clippedHeadings).toEqual([]);
        await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });

        const directory = path.resolve('.omo/evidence/responsive', viewport.name);
        await mkdir(directory, { recursive: true });
        await page.screenshot({
          path: path.join(directory, `${name}.png`),
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });
}

test('about leader remains fully visible at the 1024px breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/about', { waitUntil: 'networkidle' });
  const clippedChildren = await page
    .locator('[data-zone="about-leader"] > *')
    .evaluateAll((children) => children.flatMap((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= innerWidth + 1
        ? []
        : [`${child.tagName}: ${rect.left}..${rect.right}`];
    }));
  expect(clippedChildren).toEqual([]);
});

test('mobile navigation opens, closes with Escape, and keeps focusable links reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('button[aria-controls="global-nav"]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#global-nav').getByRole('link', { name: '소개' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

for (const route of [
  '/sermons/not-a-uuid',
  '/share/gallery/not-a-uuid',
  '/jteen/setlists/not-a-uuid',
]) {
  test(`${route} uses the not-found surface`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /찾을 수 없|존재하지 않/,
    );
  });
}

test('legacy event detail URLs return to the single-level listing', async ({ page }) => {
  await page.goto('/events/not-a-uuid');
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/다가오는 일정/);
});
