import { expect, test } from '@playwright/test';

test('Home exposes canonical title, favicon, and social sharing metadata', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle('수도교회 청소년부');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://kaleoyouth.com',
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    /\/images\/logo\/kaleo-logo-after\.svg(?:\?.*)?$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    '수도교회 청소년부',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://kaleoyouth.com/images/seo/home-share.png',
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    'content',
    '1200',
  );
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
    'content',
    '630',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    'https://kaleoyouth.com/images/seo/home-share.png',
  );
});

test('robots and sitemap publish the production canonical origin', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  await expect(robots.text()).resolves.toContain(
    'Sitemap: https://kaleoyouth.com/sitemap.xml',
  );

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  await expect(sitemap.text()).resolves.toContain(
    '<loc>https://kaleoyouth.com/</loc>',
  );
});
