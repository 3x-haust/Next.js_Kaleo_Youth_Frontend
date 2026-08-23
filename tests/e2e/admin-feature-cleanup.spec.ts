import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { z } from 'zod';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';

function envValue(source: string, name: string): string {
  const value = source.split(/\r?\n/).find((line) => line.startsWith(`${name}=`))?.slice(name.length + 1);
  if (!value) throw new Error(`${name} is required for admin Playwright tests.`);
  return value;
}

async function login(page: Page): Promise<void> {
  const env = await readFile(path.resolve('../kaleo_youth_backend/.env'), 'utf8');
  const csrf = await page.context().request.get(`${API_ORIGIN}/api/auth/csrf`);
  const csrfBody = z.object({ csrfToken: z.string() }).parse(await csrf.json());
  const response = await page.context().request.post(`${API_ORIGIN}/api/auth/login`, {
    data: {
      loginId: process.env.PW_ADMIN_LOGIN_ID ?? envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID'),
      password: process.env.PW_ADMIN_PASSWORD ?? envValue(env, 'SEED_SUPER_ADMIN_PASSWORD'),
    },
    headers: { origin: 'http://localhost:3000', 'x-csrf-token': csrfBody.csrfToken },
  });
  expect(response.status()).toBe(200);
}

let context: BrowserContext;
let page: Page;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
  await login(page);
});

test.afterAll(async () => {
  await page.close();
  await context.close();
});

test('removed notice routes return 404 and no shell exposes notice links', async () => {
  // Given
  const removedRoutes = [
    '/share/notices',
    '/share/notices/33333333-3333-4333-8333-333333333342',
    '/admin/notices',
    '/admin/notices/new',
  ] as const;

  // When / Then
  for (const route of removedRoutes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
  }

  for (const route of ['/', '/share/gallery', '/admin'] as const) {
    await page.goto(route);
    await expect(page.locator('a[href*="/notices"]')).toHaveCount(0);
  }
});

test('admin page titles have no direct subtitle paragraphs', async () => {
  // Given
  const routes = [
    '/admin',
    '/admin/about',
    '/admin/accounts',
    '/admin/audit-logs',
    '/admin/events',
    '/admin/events/new',
    '/admin/gallery',
    '/admin/gallery/new',
    '/admin/password',
    '/admin/sermons',
    '/admin/sermons/new',
    '/admin/setlists',
    '/admin/setlists/new',
    '/admin/team',
  ] as const;

  // When / Then
  for (const route of routes) {
    await page.goto(route);
    const title = page.getByRole('main').locator('h1').first();
    await expect(title).toBeVisible();
    await expect(title.locator('xpath=..').locator(':scope > p')).toHaveCount(0);
  }
});

test('schedule edits omit cover fields so persisted cover data remains untouched', async () => {
  // Given
  const response = await page.request.get(`${API_ORIGIN}/api/events?scope=upcoming&limit=1`);
  const event = z.object({ items: z.array(z.object({ id: z.string() })).min(1) }).parse(await response.json()).items[0];
  if (!event) throw new Error('The schedule fixture is required.');
  await page.route(`${API_ORIGIN}/api/events/${event.id}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.continue();
  });
  await page.goto(`/admin/events/${event.id}`);

  // When
  const patchRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/events/${event.id}` && request.method() === 'PATCH');
  await page.locator('form button[type="submit"]').click();
  const payload = z.record(z.string(), z.unknown()).parse((await patchRequest).postDataJSON());

  // Then
  await expect(page.locator('form input[type="file"]')).toHaveCount(0);
  expect(payload).not.toHaveProperty('coverImageUrl');
  expect(payload).not.toHaveProperty('attachmentIds');
});

test('schedule listing exposes only upcoming scope structure', async () => {
  // Given / When
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/events?scope=past');

  // Then
  await expect(page.locator('select[name="scope"]')).toHaveCount(0);
  await expect(page.locator('a[href*="scope="]')).toHaveCount(0);
  for (const viewport of [
    { width: 1280, height: 900, name: 'desktop' },
    { width: 390, height: 844, name: 'mobile' },
  ] as const) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `.omo/evidence/admin-cleanup/events-${viewport.name}.png`, fullPage: true });
  }
});

test('schedule creation rejects a start date before today without sending a request', async () => {
  // Given
  let createRequests = 0;
  await page.route(`${API_ORIGIN}/api/events`, async (route) => {
    if (route.request().method() === 'POST') {
      createRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'should-not-be-created' }),
      });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/events/new');
  const startDate = page.getByLabel('시작일*');
  const minimumDate = await startDate.getAttribute('min');
  if (!minimumDate) throw new Error('Schedule start date requires a minimum.');
  const previous = new Date(`${minimumDate}T00:00:00.000Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);

  // When
  await page.getByLabel('일정명*').fill('과거 일정 거절 계약');
  await startDate.fill(previous.toISOString().slice(0, 10));
  await page.getByRole('button', { name: '일정 등록' }).click();

  // Then
  await expect(
    page.getByText('시작일은 오늘보다 앞설 수 없습니다.', { exact: true }),
  ).toBeVisible();
  expect(createRequests).toBe(0);
  await page.unroute(`${API_ORIGIN}/api/events`);
});
