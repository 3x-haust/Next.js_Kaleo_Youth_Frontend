import { expect, test } from '@playwright/test';

test.describe('public media delivery', () => {
  test('loads a paused hero video frame when reduced motion is enabled', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const videoRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/videos/main.mp4') {
        videoRequests.push(request.url());
      }
    });

    await page.goto('/');
    await expect(page.locator('video')).toHaveAttribute(
      'data-motion',
      'paused',
    );
    expect(videoRequests.length).toBeGreaterThan(0);
    await context.close();
  });

  test('serves responsive gallery images and lazily loads later cards', async ({
    page,
  }) => {
    await page.goto('/share/gallery');
    const images = page.locator('[data-zone="gallery-grid"] img');
    await expect(images.first()).toBeVisible();
    expect(await images.count()).toBeGreaterThan(1);
    await expect(images.first()).toHaveAttribute(
      'srcset',
      /\/_next\/image\?url=/,
    );

    for (let index = 1; index < (await images.count()); index += 1) {
      await expect(images.nth(index)).toHaveAttribute('loading', 'lazy');
    }
  });

  test('defers YouTube and footer media until user or scroll intent', async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname === 'www.youtube-nocookie.com') {
        youtubeRequests.push(request.url());
      }
    });

    await page.goto('/');
    const player = page.getByRole('button', { name: /영상 재생/ }).first();
    await expect(player).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(youtubeRequests).toEqual([]);

    await player.click();
    const iframe = page.locator('iframe').first();
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute('src', /autoplay=1/);

    const footerImages = page.locator('[data-zone="site-footer"] img');
    for (let index = 0; index < (await footerImages.count()); index += 1) {
      await expect(footerImages.nth(index)).toHaveAttribute('loading', 'lazy');
    }
  });

  test('plays setlist videos inline while keeping the YouTube fallback', async ({
    page,
  }) => {
    await page.goto(
      '/jteen/setlists/44444444-4444-4444-8444-444444444442',
    );
    const player = page.getByRole('button', { name: /영상 재생/ }).first();
    const fallback = page
      .getByRole('link', { name: '유튜브에서 보기' })
      .first();

    await expect(player).toBeVisible();
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute(
      'href',
      /^https:\/\/www\.youtube\.com\/watch\?v=/,
    );
    await player.click();

    const iframe = page.locator('iframe').first();
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /autoplay=1/);
  });
});
