import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { z } from 'zod';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const GALLERY_POST_ID = '33333333-3333-4333-8333-333333333361';
const PNG = Buffer.from('iVBORw0KGgo=', 'base64');

function envValue(source: string, name: string): string {
  const value = source
    .split(/\r?\n/)
    .find((line) => line.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  if (!value) throw new Error(`${name} is required for admin Playwright tests.`);
  return value;
}

async function login(page: Page): Promise<void> {
  const env = await readFile(
    path.resolve('../kaleo_youth_backend/.env'),
    'utf8',
  );
  const csrf = await page.request.get(`${API_ORIGIN}/api/auth/csrf`);
  const csrfBody = z.object({ csrfToken: z.string() }).parse(await csrf.json());
  const response = await page.request.post(`${API_ORIGIN}/api/auth/login`, {
    data: {
      loginId:
        process.env.PW_ADMIN_LOGIN_ID ??
        envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID'),
      password:
        process.env.PW_ADMIN_PASSWORD ??
        envValue(env, 'SEED_SUPER_ADMIN_PASSWORD'),
    },
    headers: {
      origin: 'http://localhost:3000',
      'x-csrf-token': csrfBody.csrfToken,
    },
  });
  if (!response.ok()) {
    throw new Error(`Gallery admin login failed with ${response.status()}`);
  }
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('bulk delete keeps an uploaded photo when its delete request fails', async ({
  page,
}) => {
  // Given
  const files = [1, 2].map((index) => ({
    name: `bulk-${index}.png`,
    mimeType: 'image/png',
    buffer: PNG,
  }));
  const uploaded = files.map((file, index) => ({
    id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    fileUrl: `/images/gallery/design-detail-main.jpg?bulk=${index + 1}`,
    originalName: file.name,
    fileType: file.mimeType,
    fileSize: '68',
  }));
  await page.route(`${API_ORIGIN}/api/uploads**`, async (route) => {
    if (route.request().method() === 'DELETE') {
      const failed = route.request().url().endsWith(uploaded[0]?.id ?? '');
      await route.fulfill({
        status: failed ? 500 : 204,
        contentType: 'application/json',
        body: failed ? JSON.stringify({ message: '삭제 실패' }) : '',
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(uploaded),
    });
  });
  await page.goto('/admin/gallery/new');
  await page.locator('input[type="file"]').setInputFiles(files);
  await page.getByRole('checkbox', { name: '사진 전체 선택' }).check();

  // When
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: '선택 삭제' }).click();

  // Then
  await expect(
    page.getByRole('checkbox', { name: 'bulk-1.png 선택' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'bulk-2.png 선택' }),
  ).toHaveCount(0);
  await expect(
    page.getByText('1장 삭제, 1장 삭제 실패. 삭제 실패', { exact: true }),
  ).toBeVisible();
});

test('bulk deleting persisted photos keeps a remaining representative image', async ({
  page,
}) => {
  // Given
  const response = await page.request.get(
    `${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`,
  );
  const post = z
    .object({
      attachments: z
        .array(
          z.object({
            id: z.string(),
            fileUrl: z.string(),
          }),
        )
        .min(3),
    })
    .parse(await response.json());
  const patchedThumbnails: string[] = [];
  await page.route(`${API_ORIGIN}/api/uploads/**`, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route(
    `${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = z
          .object({ thumbnailUrl: z.string().nullable() })
          .parse(route.request().postDataJSON());
        if (body.thumbnailUrl) patchedThumbnails.push(body.thumbnailUrl);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        });
        return;
      }
      await route.continue();
    },
  );
  await page.goto(`/admin/gallery/${GALLERY_POST_ID}`);
  const photoChecks = page
    .getByRole('radiogroup')
    .locator('input[type="checkbox"]');
  await photoChecks.nth(0).check();
  await photoChecks.nth(1).check();

  // When
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: '선택 삭제' }).click();

  // Then
  const radios = page.getByRole('radiogroup').getByRole('radio');
  await expect(radios).toHaveCount(post.attachments.length - 2);
  await expect(radios.first()).toBeChecked();
  expect(patchedThumbnails.at(-1)).toBe(post.attachments[2]?.fileUrl);
});

test('thumbnail patch failure releases pending controls after persisted deletion', async ({
  page,
}) => {
  // Given
  const response = await page.request.get(
    `${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`,
  );
  const post = z
    .object({
      attachments: z.array(z.object({ id: z.string() })).min(2),
    })
    .parse(await response.json());
  await page.route(`${API_ORIGIN}/api/uploads/**`, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route(
    `${API_ORIGIN}/api/posts/${GALLERY_POST_ID}`,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: '대표 이미지 저장 실패' }),
        });
        return;
      }
      await route.continue();
    },
  );
  await page.goto(`/admin/gallery/${GALLERY_POST_ID}`);
  const photoChecks = page
    .getByRole('radiogroup')
    .locator('input[type="checkbox"]');
  await photoChecks.first().check();

  // When
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: '선택 삭제' }).click();

  // Then
  await expect(page.getByText(/대표 이미지 저장 실패/)).toBeVisible();
  await expect(page.getByRole('button', { name: '사진 추가' })).toBeEnabled();
  await expect(page.getByRole('radiogroup').getByRole('radio')).toHaveCount(
    post.attachments.length - 1,
  );
});
