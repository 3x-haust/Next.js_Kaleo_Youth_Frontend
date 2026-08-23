import { expect, test } from '@playwright/test';

test('home hero replaces the photo with a silent looping video', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('section[aria-labelledby="home-title"]');
  const video = hero.locator('video');

  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('src', '/videos/main.mp4');
  await expect(video).toHaveAttribute('autoplay', '');
  await expect(video).toHaveAttribute('loop', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(hero.locator('img[src*="hero-worship"]')).toHaveCount(0);
  await expect(hero.locator('[data-zone="home-hero-blue-overlay"]')).toHaveCSS(
    'background-image',
    /linear-gradient/,
  );

  const state = await video.evaluate(async (element) => {
    const media = element as HTMLVideoElement;
    if (media.paused || media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('video did not start')), 5_000);
        const onPlaying = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        media.addEventListener('playing', onPlaying, { once: true });
        void media.play().catch(reject);
      });
    }

    return {
      muted: media.muted,
      paused: media.paused,
      videoWidth: media.videoWidth,
      videoHeight: media.videoHeight,
    };
  });

  expect(state).toEqual({
    muted: true,
    paused: false,
    videoWidth: 1280,
    videoHeight: 720,
  });
});

test('home hero video pauses for reduced motion and stays decorative', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const video = page.locator('section[aria-labelledby="home-title"] video');

  await expect(video).toHaveAttribute('aria-hidden', 'true');
  await expect(video).toHaveAttribute('data-motion', 'paused');
  expect(await video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
});
