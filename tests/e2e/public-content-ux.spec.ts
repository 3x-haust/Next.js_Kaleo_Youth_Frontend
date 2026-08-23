import { expect, test } from '@playwright/test';

test('empty public content pages stay useful and searchable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  const jteen = await page.goto('/jteen');
  expect(jteen?.status()).toBe(200);
  await expect(page.getByText('올라온 콘티가 없습니다.')).toBeVisible();

  await page.goto('/sermons');
  await expect(page.getByText('최근 말씀이 없습니다.')).toBeVisible();
  await expect(page.getByText('올린 말씀이 없습니다.')).toHaveCount(0);
  await expect(page.getByText(/주일 오전 10:00/)).toHaveCount(0);
  await expect(page.getByText('2026.08.13 – 주일예배 찬양 콘티')).toHaveCount(0);

  const sermonSearch = page.getByRole('search');
  const sermonHeading = page.getByRole('heading', {
    name: '하나님의 말씀을 듣습니다',
  });
  const sermonSearchBox = await sermonSearch.boundingBox();
  const sermonHeadingBox = await sermonHeading.boundingBox();
  expect(sermonSearchBox).not.toBeNull();
  expect(sermonHeadingBox).not.toBeNull();
  expect(sermonSearchBox!.x).toBeGreaterThan(720);
  expect(sermonSearchBox!.y).toBeLessThan(
    sermonHeadingBox!.y + sermonHeadingBox!.height + 80,
  );

  await page.goto('/share/gallery');
  await expect(page.getByText('아직 등록된 사진이 없습니다.')).toBeVisible();
  const gallerySearchBox = await page.getByRole('search').boundingBox();
  const galleryHeadingBox = await page
    .getByRole('heading', { name: '우리의 이야기를 담았습니다' })
    .boundingBox();
  expect(gallerySearchBox).not.toBeNull();
  expect(galleryHeadingBox).not.toBeNull();
  expect(gallerySearchBox!.x).toBeGreaterThan(720);
  expect(gallerySearchBox!.y).toBeLessThan(
    galleryHeadingBox!.y + galleryHeadingBox!.height + 80,
  );
});

test('sermons and gallery append later pages while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.route('http://localhost:4000/api/**', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'access-control-allow-origin': 'http://127.0.0.1:3010',
        'access-control-allow-credentials': 'true',
      },
    });
  });

  await page.goto('/sermons');
  await expect(page.locator('[data-sermon-card]')).toHaveCount(6);
  await page.locator('[data-infinite-sentinel="sermons"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sermon-card]')).toHaveCount(9);
  await expect(page.locator('[aria-label="페이지 이동"]')).toHaveCount(0);

  await page.goto('/share/gallery');
  await expect(page.locator('[data-gallery-card]')).toHaveCount(6);
  await page.locator('[data-infinite-sentinel="gallery"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-gallery-card]')).toHaveCount(10);
  await expect(page.locator('[aria-label="페이지 이동"]')).toHaveCount(0);
});
