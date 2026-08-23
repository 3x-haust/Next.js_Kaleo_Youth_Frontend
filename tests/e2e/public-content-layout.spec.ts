import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { withEmptySermons } from './support/isolated-database';

const evidenceDir = '.omo/evidence/public-content-ux';
const apiOrigin = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const frontendOrigin = new URL(
  process.env.PW_FRONTEND_URL ?? 'http://localhost:3000',
).origin;
const archives = [
  {
    route: '/sermons',
    heading: '하나님의 말씀을 듣습니다',
    screenshot: 'sermons-search',
  },
  {
    route: '/events',
    heading: '다가오는 일정',
    screenshot: 'events-search',
  },
  {
    route: '/share/gallery',
    heading: '우리의 이야기를 담았습니다',
    screenshot: 'gallery-search',
  },
] as const;

test.beforeAll(async () => {
  await mkdir(evidenceDir, { recursive: true });
});

test('home featured sermon stays complete', async ({ page, request }) => {
  const response = await request.get(`${apiOrigin}/api/sermons/latest`);
  expect(response.status()).toBe(200);
  const sermons = (await response.json()) as Array<{
    id: string;
    title: string;
    preacherName: string;
    bibleReference: string;
  }>;
  expect(sermons.length).toBeGreaterThan(0);
  const featured = sermons[0];

  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 3, name: featured.title }),
  ).toBeVisible();
  await expect(page.locator('[data-zone="home-message-detail"]')).toContainText(
    featured.bibleReference,
  );
  await expect(page.locator('[data-zone="home-message-detail"]')).toContainText(
    featured.preacherName,
  );
  await expect(
    page.getByRole('button', { name: /KALEO YOUTH 예배 영상/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: '더 많은 영상 보기' }),
  ).toHaveAttribute('href', `/sermons/${featured.id}`);
  await expect(
    page.locator('[data-zone="home-message-empty"]'),
  ).toHaveCount(0);
  await page.screenshot({
    path: `${evidenceDir}/home-sermon-featured-pin.png`,
    fullPage: true,
  });
});

test('home sermon empty state is intentional and useful', async ({ page }) => {
  await withEmptySermons(async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const emptyState = page.locator('[data-zone="home-message-empty"]');
    await expect(emptyState).toBeVisible();
    await expect(
      emptyState.getByRole('heading', { name: '다음 말씀을 기다리고 있어요' }),
    ).toBeVisible();
    await expect(
      emptyState.getByText('지난 말씀을 다시 만나보세요.'),
    ).toBeVisible();
    await expect(
      emptyState.getByRole('link', { name: '지난 말씀 둘러보기' }),
    ).toHaveAttribute('href', '/sermons');
    await expect(page.getByText('새 말씀을 준비하고 있습니다')).toHaveCount(0);
    await expect(page.getByText('말씀을 기다려 주세요.')).toHaveCount(0);

    const box = await emptyState.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(560);
    expect(box!.height).toBeGreaterThan(260);
    await emptyState.scrollIntoViewIfNeeded();
    await expect(emptyState).toHaveCSS('opacity', '1');
    await page
      .locator('[data-zone="home-message-section"]')
      .screenshot({
      path: `${evidenceDir}/home-sermon-empty-desktop.png`,
      });
  });
});

test('archive searches align at the lower right', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const archive of archives) {
    const response = await page.goto(archive.route);
    expect(response?.status()).toBe(200);
    const heading = page.getByRole('heading', {
      level: 1,
      name: archive.heading,
    });
    const headingBlock = page.locator('[data-zone="archive-heading"]');
    const search = page.getByRole('search');
    await expect(search).toBeVisible();
    const [headingBox, headingBlockBox, searchBox] = await Promise.all([
      heading.boundingBox(),
      headingBlock.boundingBox(),
      search.boundingBox(),
    ]);

    expect(headingBox).not.toBeNull();
    expect(headingBlockBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect(searchBox!.x).toBeGreaterThan(
      headingBox!.x + headingBox!.width + 40,
    );
    expect(
      Math.abs(
        searchBox!.y +
          searchBox!.height -
          (headingBlockBox!.y + headingBlockBox!.height),
      ),
    ).toBeLessThanOrEqual(6);

    if (archive.route === '/events') {
      const listBox = await page
        .locator('[data-zone="event-list"]')
        .boundingBox();
      expect(listBox).not.toBeNull();
      expect(searchBox!.y + searchBox!.height).toBeLessThan(listBox!.y);
    }
    await page.screenshot({
      path: `${evidenceDir}/${archive.screenshot}-desktop.png`,
      fullPage: true,
    });
  }
});

test('archive searches stack cleanly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const archive of archives) {
    await page.goto(archive.route);
    const heading = page.getByRole('heading', {
      level: 1,
      name: archive.heading,
    });
    const headingBlock = page.locator('[data-zone="archive-heading"]');
    const search = page.getByRole('search');
    await expect(search).toBeVisible();
    const [headingBox, headingBlockBox, searchBox, inputBox, buttonBox] =
      await Promise.all([
      heading.boundingBox(),
      headingBlock.boundingBox(),
      search.boundingBox(),
      search.locator('input').boundingBox(),
      search.getByRole('button', { name: '검색' }).boundingBox(),
    ]);

    expect(headingBox).not.toBeNull();
    expect(headingBlockBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect(inputBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(searchBox!.y).toBeGreaterThan(
      headingBlockBox!.y + headingBlockBox!.height,
    );
    expect(
      searchBox!.y - (headingBlockBox!.y + headingBlockBox!.height),
    ).toBeLessThanOrEqual(80);
    expect(searchBox!.width).toBeGreaterThanOrEqual(346);
    expect(inputBox!.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);

    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    await page.screenshot({
      path: `${evidenceDir}/${archive.screenshot}-mobile.png`,
      fullPage: true,
    });
  }
});

test('archive infinite loading remains functional', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.route(`${apiOrigin}/api/**`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'access-control-allow-origin': frontendOrigin,
        'access-control-allow-credentials': 'true',
      },
    });
  });

  await page.goto('/sermons');
  await expect(page.locator('[data-sermon-card]')).toHaveCount(6);
  await page
    .locator('[data-infinite-sentinel="sermons"]')
    .scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sermon-card]')).toHaveCount(9);

  await page.goto('/share/gallery');
  await page
    .locator('[data-infinite-sentinel="gallery"]')
    .scrollIntoViewIfNeeded();
  await expect(page.locator('[data-gallery-card]')).toHaveCount(10);
});
