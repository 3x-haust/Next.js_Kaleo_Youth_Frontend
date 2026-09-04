import { expect, test } from '@playwright/test';
import { z } from 'zod';

const SITE_URL = process.env.PW_FRONTEND_URL ?? 'http://localhost:3000';
const API_URL = 'http://localhost:4000/api';

const publicPages = [
  '/',
  '/about',
  '/sermons',
  '/jteen',
  '/events',
  '/share/gallery',
  '/privacy',
] as const;
const sitemapPages = publicPages.filter((path) => path !== '/jteen');

test('public pages expose their own canonical and Open Graph URLs', async ({
  page,
}) => {
  for (const path of publicPages) {
    await page.goto(path);
    const resolvedPath = new URL(page.url()).pathname;
    const canonical = `${SITE_URL}${resolvedPath === '/' ? '' : resolvedPath}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      canonical,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      canonical,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  }
});

test('home publishes a truthful church and youth organization graph', async ({
  page,
}) => {
  await page.goto('/');
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const nodes = scripts.flatMap((script) => {
    const value = z
      .object({ '@graph': z.array(z.record(z.string(), z.unknown())) })
      .parse(JSON.parse(script));
    return value['@graph'];
  });
  const website = nodes.find((node) => node['@type'] === 'WebSite');
  const youth = nodes.find(
    (node) =>
      node['@type'] === 'Organization' &&
      node.name === '수도교회 청소년부',
  );
  const church = nodes.find((node) => node['@type'] === 'Church');

  expect(website).toMatchObject({
    name: '수도교회 청소년부',
    url: SITE_URL,
  });
  expect(youth).toMatchObject({
    alternateName: 'KALEO YOUTH',
    parentOrganization: { '@id': `${SITE_URL}/#church` },
  });
  expect(church).toMatchObject({
    name: '수도교회',
    telephone: ['+82-2-2606-7344', '+82-2-2606-7644'],
    address: {
      streetAddress: '오목로19길 19',
      addressLocality: '양천구',
      addressRegion: '서울특별시',
      postalCode: '07934',
      addressCountry: 'KR',
    },
  });
});

test('dynamic detail pages publish self canonicals', async ({ page }) => {
  const responses = await Promise.all([
    page.request.get(`${API_URL}/sermons/latest`),
    page.request.get(`${API_URL}/setlists/latest`),
    page.request.get(`${API_URL}/posts/latest/gallery`),
  ]);
  const [sermons, setlists, galleries] = await Promise.all(
    responses.map(async (response) => {
      expect(response.ok()).toBe(true);
      return z
        .array(z.object({ id: z.string().uuid() }))
        .parse(await response.json());
    }),
  );
  const paths = [
    `/sermons/${sermons[0]?.id}`,
    `/jteen/setlists/${setlists[0]?.id}`,
    `/share/gallery/${galleries[0]?.id}`,
  ];

  for (const path of paths) {
    expect(path).not.toContain('undefined');
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE_URL}${path}`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${SITE_URL}${path}`,
    );
  }
});

test('robots and sitemap advertise the canonical site surface', async ({
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Host: ${SITE_URL}`);
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of sitemapPages) {
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
    expect(sitemap).toContain(`<loc>${canonical}</loc>`);
  }
  expect(sitemap).not.toContain(`<loc>${SITE_URL}/jteen</loc>`);
  expect(sitemap).not.toContain(`<loc>${SITE_URL}/share</loc>`);
  expect(sitemap).not.toContain(`<loc>${SITE_URL}/jteen/setlists</loc>`);
});
