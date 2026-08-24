import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { formatDateRange } from '@/lib/format';

const evidence = path.resolve('.omo/evidence/integration');

interface TitledCollection {
  items: Array<{ title: string }>;
}

interface GalleryCollection {
  items: Array<{
    id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
  }>;
}

test('real API health and public collection contracts are reachable', async ({ request }) => {
  await mkdir(evidence, { recursive: true });
  const health = await request.get('http://localhost:4000/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: 'ok' });
  await writeFile(
    path.join(evidence, 'backend-health.txt'),
    `${health.status()} ${JSON.stringify(await health.json())}\n`,
  );

  for (const resource of [
    'sermons?page=1&limit=20',
    'events?page=1&limit=12&scope=upcoming',
    'posts?page=1&limit=12&boardType=gallery',
  ]) {
    const response = await request.get(`http://localhost:4000/api/${resource}`);
    expect(response.status(), resource).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      totalPages: expect.any(Number),
    });
  }
});

test('homepage gallery reflects backend CMS records when present', async ({ page, request }) => {
  const response = await request.get('http://localhost:4000/api/posts/latest/gallery');
  expect(response.status()).toBe(200);
  const records = (await response.json()) as Array<{ title: string }>;
  if (records.length === 0) return;

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('main')).toContainText(records[0].title);
});

test('homepage gallery loads uploaded images without the optimizer proxy', async ({
  page,
}) => {
  await page.goto('/');
  const image = page
    .locator('section[aria-labelledby="gallery-title"] a[href^="/share/gallery/"] img')
    .first();
  if ((await image.count()) === 0) return;

  await expect(image).not.toHaveAttribute('src', /\/_next\/image/);
  await expect
    .poll(() =>
      image.evaluate(
        (element) =>
          element instanceof HTMLImageElement &&
          element.complete &&
          element.naturalWidth > 0,
      ),
    )
    .toBe(true);
});

test('gallery list and detail use selected dates instead of upload timestamps', async ({
  page,
  request,
}) => {
  const response = await request.get(
    'http://localhost:4000/api/posts?page=1&limit=12&boardType=gallery',
  );
  expect(response.status()).toBe(200);
  const collection = (await response.json()) as GalleryCollection;
  const gallery = collection.items[0];
  if (!gallery) return;

  expect(gallery.startDate).not.toBeNull();
  const expected = formatDateRange(gallery.startDate, gallery.endDate);

  await page.goto('/share/gallery', { waitUntil: 'networkidle' });
  const card = page.locator(`a[href="/share/gallery/${gallery.id}"]`);
  await expect(card.locator('time')).toHaveText(expected);
  await expect(card.locator('time')).toHaveAttribute(
    'datetime',
    gallery.startDate ?? '',
  );

  await page.goto(`/share/gallery/${gallery.id}`, {
    waitUntil: 'networkidle',
  });
  await expect(page.locator('main time').first()).toHaveText(expected);
});

test('production collection routes preserve sparse backend records', async ({ page, request }) => {
  for (const [resource, route] of [
    ['sermons?page=1&limit=20', '/sermons'],
    ['events?page=1&limit=12&scope=upcoming', '/events'],
    ['posts?page=1&limit=12&boardType=gallery', '/share/gallery'],
  ] as const) {
    const response = await request.get(`http://localhost:4000/api/${resource}`);
    expect(response.status(), resource).toBe(200);
    const collection = (await response.json()) as TitledCollection;
    if (collection.items.length === 0) continue;

    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(collection.items[0].title);
  }
});

test('frontend content routes render through the configured API boundary', async ({ page }) => {
  for (const [route, landmark] of [
    ['/sermons', /말씀/],
    ['/events', /다가오는 일정/],
    ['/share/gallery', /갤러리|이야기/],
  ] as const) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(landmark);
  }

  const response = await page.request.get('http://localhost:3000/sermons');
  await writeFile(
    path.join(evidence, 'sermons-response.txt'),
    `${response.status()} ${response.headers()['content-type'] ?? ''}\n`,
  );
});
