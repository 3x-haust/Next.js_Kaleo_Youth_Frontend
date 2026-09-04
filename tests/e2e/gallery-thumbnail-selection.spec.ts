import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { z } from 'zod';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const GALLERY_POST_ID = '33333333-3333-4333-8333-333333333361';
const PNG = Buffer.from('iVBORw0KGgo=', 'base64');
const postPayloadSchema = z.object({
  attachmentIds: z.array(z.string()).optional(),
  thumbnailUrl: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
});

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
  if (response.status() !== 200) {
    throw new Error(
      `Gallery admin login failed with ${response.status()}: ${await response.text()}`,
    );
  }
}

let context: BrowserContext;
let page: Page;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  await mkdir('.omo/evidence/gallery-thumbnail-selection', { recursive: true });
  context = await browser.newContext();
  const authPage = await context.newPage();
  await login(authPage);
  await authPage.close();
});

test.beforeEach(async () => {
  page = await context.newPage();
});

test.afterEach(async () => {
  await page.close();
});

test.afterAll(async () => {
  await context.close();
});

test('new gallery defaults to the first of an unrestricted photo selection and submits an explicit choice', async () => {
  // Given
  const files = Array.from({ length: 11 }, (_, index) => ({
    name: `gallery-${index + 1}.png`,
    mimeType: 'image/png',
    buffer: PNG,
  }));
  const uploaded = files.map((file, index) => ({
    id: `90000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    fileUrl: `/images/gallery/design-detail-main.jpg?upload=${index + 1}`,
    originalName: file.name,
    fileType: file.mimeType,
    fileSize: '68',
  }));
  await page.route(`${API_ORIGIN}/api/uploads`, async (route) => {
    const body = route.request().postDataBuffer()?.toString('latin1') ?? '';
    const indexes = [
      ...body.matchAll(/filename="gallery-(\d+)\.(?:png|webp)"/g),
    ].map((match) => Number(match[1]) - 1);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(indexes.map((index) => uploaded[index])),
    });
  });
  await page.route(`${API_ORIGIN}/api/posts`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'gallery-created' }),
      });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/gallery/new');
  const fileField = page.locator('input[type="file"]');

  // When
  await fileField.setInputFiles(files);

  // Then
  await expect(fileField).toHaveAttribute('multiple', '');
  const choices = page.getByRole('radiogroup').getByRole('radio');
  await expect(choices).toHaveCount(11);
  await expect(choices.first()).toBeChecked();
  await expect(fileField.locator('xpath=..').locator('p')).toHaveCount(0);
  for (const viewport of [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 900 },
    { name: 'desktop', width: 1280, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.left < -1 || rect.right > window.innerWidth + 1)
          );
        })
        .map((element) => ({
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 80),
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
        })),
    );
    expect(overflow).toEqual([]);
    await page.screenshot({
      path: `.omo/evidence/gallery-thumbnail-selection/new-${viewport.name}.png`,
      fullPage: true,
    });
  }

  // When
  await choices.nth(1).check();
  await page.getByLabel('제목*').fill('대표 사진 선택 계약');
  const startDate = page.getByLabel('시작일*');
  const endDate = page.getByLabel('종료일');
  await expect(startDate).not.toHaveAttribute('min');
  await expect(endDate).not.toHaveAttribute('min');
  await startDate.fill('2024-07-20');
  await endDate.fill('2024-07-22');
  const createPayload = page
    .waitForRequest(
      (request) =>
        request.url() === `${API_ORIGIN}/api/posts` &&
        request.method() === 'POST',
    )
    .then((request) => postPayloadSchema.parse(request.postDataJSON()));
  await page.getByRole('button', { name: '갤러리 등록' }).click();
  const payload = await createPayload;

  // Then
  expect(payload.attachmentIds).toEqual(uploaded.map((file) => file.id));
  expect(payload.thumbnailUrl).toBe(uploaded[1]?.fileUrl);
  expect(payload.startDate).toBe('2024-07-20');
  expect(payload.endDate).toBe('2024-07-22');
});

test('gallery edit allows a persisted image to become the thumbnail without changing attachment order', async () => {
  // Given
  const response = await page.request.get(`${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`);
  const post = z.object({
    attachments: z.array(z.object({ id: z.string(), fileUrl: z.string() })).min(2),
  }).parse(await response.json());
  await page.route(`${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.continue();
  });
  await page.goto(`/admin/gallery/${GALLERY_POST_ID}`);
  const choices = page.getByRole('radiogroup').getByRole('radio');
  await expect(choices).toHaveCount(post.attachments.length);
  await expect(choices.first()).toBeChecked();

  // When
  await choices.nth(1).check();
  await page.getByLabel('시작일*').fill('2023-12-30');
  await page.getByLabel('종료일').fill('2024-01-01');
  const patchRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/posts/${GALLERY_POST_ID}` && request.method() === 'PATCH');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  const payload = postPayloadSchema.parse((await patchRequest).postDataJSON());

  // Then
  expect(payload.attachmentIds).toBeUndefined();
  expect(payload.thumbnailUrl).toBe(post.attachments[1]?.fileUrl);
  expect(payload.startDate).toBe('2023-12-30');
  expect(payload.endDate).toBe('2024-01-01');
});
