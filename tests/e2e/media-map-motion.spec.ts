import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { youtubeThumbnail } from '@/lib/format';

const evidence = path.resolve('.omo/evidence/interactions');

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true });
});

test('YouTube thumbnail fallback requests the maximum-resolution asset', () => {
  expect(youtubeThumbnail('video-id')).toBe(
    'https://i.ytimg.com/vi/video-id/maxresdefault.jpg',
  );
});

test('map surface stays interactive with a road-address Naver destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const map = page.locator('[data-zone="home-interactive-map"]');
  await expect(map).toBeVisible();
  await expect(map.locator('[data-map-canvas]')).toBeVisible();
  const marker = map.locator('[data-map-marker="church"]');
  await expect(marker).toBeVisible();
  await expect(marker).toHaveCSS('width', '44px');
  await expect(marker).toHaveCSS('height', '57px');
  await expect(map.getByText('수도교회 소예배실')).toHaveCount(0);
  await expect(page.locator('a[href*="map.naver.com"]')).toHaveAttribute(
    'href',
    `https://map.naver.com/p/search/${encodeURIComponent('서울특별시 양천구 오목로19길 19')}`,
  );
  await map.screenshot({ path: path.join(evidence, 'map.png') });
});

type SermonList = {
  readonly items: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly youtubeVideoId: string;
  }>;
};

test('sermon facade becomes the expected YouTube player', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await request.get('http://localhost:4000/api/sermons?page=1&limit=1');
  expect(response.status()).toBe(200);
  const sermons = (await response.json()) as SermonList;
  expect(sermons.items.length).toBeGreaterThan(0);
  const sermon = sermons.items[0];
  await page.goto(`/sermons/${sermon.id}`);
  const play = page.getByRole('button', { name: `${sermon.title} 영상 재생` });
  await play.click();
  const iframe = page.getByTestId('youtube-player');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute(
    'src',
    new RegExp(`youtube-nocookie\\.com/embed/${sermon.youtubeVideoId}`),
  );
  await page.screenshot({ path: path.join(evidence, 'youtube.png'), fullPage: true });
});

test('Motion reveal reaches its terminal state after scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const reveal = page.locator('div[style*="--motion-delay"]').last();
  await expect(reveal).toHaveCSS('opacity', '0');
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveCSS('opacity', '1');
  await page.screenshot({ path: path.join(evidence, 'motion.png'), fullPage: true });
});

test('reduced motion preserves content and marks the route transition', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  const main = page.locator('#main-content');
  await expect(main).toBeVisible();
  expect(
    await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
  ).toBe(true);
  const animatedContent = page.locator('section').nth(1);
  await expect(animatedContent).toBeVisible();
  expect(
    Number.parseFloat(
      await animatedContent.evaluate((element) => getComputedStyle(element).transitionDuration),
    ),
  )
    .toBeLessThanOrEqual(0.00001);
  await page.screenshot({
    path: path.join(evidence, 'reduced-motion.png'),
    fullPage: true,
  });
  await context.close();
});
