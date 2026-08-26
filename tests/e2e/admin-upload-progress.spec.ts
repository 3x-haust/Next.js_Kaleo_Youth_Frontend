import { expect, test, type BrowserContext } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const apiOrigin = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const frontendOrigin = new URL(
  process.env.PW_FRONTEND_URL ?? 'http://localhost:3000',
).origin;
const sessionCookieMigration = 'kaleo-session-cookie-v1';

function envValue(source: string, key: string): string {
  const line = source
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  if (!line) throw new Error(`${key} is missing from the backend environment.`);
  return line.slice(key.length + 1);
}

async function login(page: import('@playwright/test').Page) {
  const env = await readFile(
    path.resolve('../kaleo_youth_backend/.env'),
    'utf8',
  );
  await page.goto('/admin/login');
  await page.getByLabel('아이디').fill(envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID'));
  await page
    .getByLabel('비밀번호')
    .fill(envValue(env, 'SEED_SUPER_ADMIN_PASSWORD'));
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

let authCookies: Parameters<BrowserContext['addCookies']>[0];

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript((key) => {
    localStorage.setItem(key, 'complete');
  }, sessionCookieMigration);
  const page = await context.newPage();
  await login(page);
  authCookies = await context.cookies();
  await context.close();
});

test.beforeEach(async ({ context }) => {
  await context.addInitScript((key) => {
    localStorage.setItem(key, 'complete');
  }, sessionCookieMigration);
  await context.addCookies(authCookies);
});

async function imageFiles() {
  const buffer = await readFile(
    path.resolve('public/images/gallery/semantic/image-110-5712-background.png'),
  );
  return ['one', 'two', 'three', 'four'].map((name) => ({
    name: `${name}.png`,
    mimeType: 'image/png',
    buffer,
  }));
}

async function heicFiles() {
  const buffer = await readFile(
    path.resolve(
      '../kaleo_youth_backend/src/modules/uploads/tests/fixtures/minimal.heic',
    ),
  );
  return Array.from({ length: 11 }, (_, index) => ({
    name: `IMG_${5377 + index}.HEIC`,
    mimeType: 'image/heic',
    buffer,
  }));
}

function responseHeaders() {
  return {
    'access-control-allow-origin': frontendOrigin,
    'access-control-allow-credentials': 'true',
    'content-type': 'application/json',
  };
}

test('multi-photo upload exposes aggregate and file progress', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let releaseRequest!: () => void;
  const release = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  let requestStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    requestStarted = resolve;
  });
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    const body = route.request().postDataBuffer();
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    requestStarted();
    await release;
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name, index) => ({
          id: `progress-result-${index}`,
          fileUrl: `/uploads/progress-${index}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });

  await page.getByLabel('사진 추가').setInputFiles(await imageFiles());
  await started;
  try {
    const status = page.getByRole('status', { name: '사진 업로드 진행' });
    await expect(status).toBeVisible();
    await expect(status).toContainText('0 / 4');
    await expect(
      status.getByRole('progressbar', { name: '전체 업로드 진행률' }),
    ).toHaveAttribute('max', '100');
    await expect(status.getByText('one.png')).toBeVisible();
    await expect(status.getByText('four.png')).toBeVisible();
    await page.screenshot({
      path: '.omo/evidence/admin-upload-progress/desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: '.omo/evidence/admin-upload-progress/mobile.png',
      fullPage: true,
    });
  } finally {
    releaseRequest();
  }
});

test('large multi-photo upload uses one optimized batch request', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  const selected = await imageFiles();
  let requestCount = 0;
  let requestBytes = 0;
  const uploadedNames: string[] = [];

  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    requestCount += 1;
    const body = route.request().postDataBuffer();
    requestBytes += body?.length ?? 0;
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    uploadedNames.push(...names);
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name, index) => ({
          id: `batch-${requestCount}-${index}`,
          fileUrl: `/uploads/batch-${requestCount}-${index}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });

  await page.getByLabel('사진 추가').setInputFiles(selected);
  await expect(page.locator('a[href*="/uploads/batch-"]')).toHaveCount(4);

  expect(requestCount).toBe(1);
  expect(uploadedNames).toEqual(
    selected.map((file) => file.name.replace(/\.[^.]+$/, '.webp')),
  );
  expect(requestBytes).toBeLessThan(
    selected.reduce((total, file) => total + file.buffer.length, 0),
  );
});

test('eleven HEIC photos upload through sequential bounded batches', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  const selected = await heicFiles();
  const requestNames: string[][] = [];
  const uploadedNames: string[] = [];

  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    const body = route.request().postDataBuffer();
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    requestNames.push(names);
    uploadedNames.push(...names);
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name) => ({
          id: `heic-batch-${name}`,
          fileUrl: `/uploads/heic-batch-${name}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });

  await page.getByLabel('사진 추가').setInputFiles(selected);
  await expect(page.locator('a[href*="/uploads/heic-batch-"]')).toHaveCount(11);
  expect(requestNames).toEqual([
    selected.slice(0, 3).map((file) => file.name),
    selected.slice(3, 6).map((file) => file.name),
    selected.slice(6, 9).map((file) => file.name),
    selected.slice(9).map((file) => file.name),
  ]);
  expect(uploadedNames.sort()).toEqual(
    selected.map((file) => file.name).sort(),
  );
});

test('uploaded photos use decoded local previews', async ({ page }) => {
  await page.goto('/admin/gallery/new');

  let submittedPayload: {
    attachmentIds?: string[];
    thumbnailUrl?: string;
  } | null = null;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    const body = route.request().postDataBuffer();
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name, index) => ({
          id: `local-preview-${index}`,
          fileUrl: `/uploads/unavailable-preview-${index}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });
  await page.route(`${apiOrigin}/api/posts`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    submittedPayload = route.request().postDataJSON() as {
      attachmentIds?: string[];
      thumbnailUrl?: string;
    };
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify({ id: 'local-preview-gallery' }),
    });
  });

  await page.getByLabel('사진 추가').setInputFiles((await imageFiles()).slice(0, 2));

  const previews = page
    .getByRole('radiogroup', { name: '갤러리 대표 이미지' })
    .locator('img');
  await expect(previews).toHaveCount(2);
  await expect(previews.first()).toHaveAttribute('src', /^blob:/);
  expect(
    await previews.evaluateAll((images) =>
      images.every(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0,
      ),
    ),
  ).toBe(true);
  await previews.nth(1).click();
  await expect(
    page
      .getByRole('radiogroup', { name: '갤러리 대표 이미지' })
      .locator('input')
      .nth(1),
  ).toBeChecked();
  await page
    .getByRole('radiogroup', { name: '갤러리 대표 이미지' })
    .screenshot({
      path: '.omo/evidence/admin-upload-progress/local-preview-selector.png',
    });
  await page.getByLabel('제목').fill('gallery-preview-regression');
  await page.getByLabel('시작일').fill('2026-08-24');
  const submitted = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url() === `${apiOrigin}/api/posts`,
  );
  await page.getByRole('button', { name: '갤러리 등록' }).click();
  await submitted;
  expect(submittedPayload).toEqual(
    expect.objectContaining({
      attachmentIds: ['local-preview-0', 'local-preview-1'],
      thumbnailUrl: '/uploads/unavailable-preview-1.webp',
    }),
  );
});

test('multi-photo upload keeps all files in one pending request', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let requestCount = 0;
  let batchFileCount = 0;
  let releaseRequests!: () => void;
  const release = new Promise<void>((resolve) => {
    releaseRequests = resolve;
  });
  let requestStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    requestStarted = resolve;
  });

  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    requestCount += 1;
    const body = route.request().postDataBuffer();
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    batchFileCount = names.length;
    requestStarted();
    await release;
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name, index) => ({
          id: `batch-pending-${index}`,
          fileUrl: `/uploads/batch-pending-${index}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });

  await page.getByLabel('사진 추가').setInputFiles(await imageFiles());
  try {
    await started;
    expect(requestCount).toBe(1);
    expect(batchFileCount).toBe(4);
  } finally {
    releaseRequests();
  }

  await expect(page.locator('a[href*="/uploads/batch-pending-"]')).toHaveCount(
    4,
  );
});

test('failed multi-photo batch remains retryable without partial files', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let uploadCount = 0;
  let deleteCount = 0;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadCount += 1;
    if (uploadCount === 1) {
      await route.fulfill({
        status: 500,
        headers: responseHeaders(),
        body: JSON.stringify({ message: '강제 업로드 실패' }),
      });
      return;
    }
    const body = route.request().postDataBuffer();
    const names = [
      ...(body?.toString('latin1').matchAll(/filename="([^"]+)"/g) ?? []),
    ].map((match) => match[1]);
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify(
        names.map((name, index) => ({
          id: `retry-${index}`,
          fileUrl: `/uploads/retry-${index}.webp`,
          originalName: name,
          fileType: 'image/webp',
          fileSize: '1024',
        })),
      ),
    });
  });
  await page.route(`${apiOrigin}/api/uploads/*`, async (route) => {
    deleteCount += 1;
    await route.fulfill({
      status: 204,
      headers: responseHeaders(),
    });
  });

  const input = page.getByLabel('사진 추가');
  await input.setInputFiles(await imageFiles());
  await expect(page.getByText('강제 업로드 실패')).toBeVisible();
  expect(deleteCount).toBe(0);
  await expect(page.locator('a[href*="/uploads/retry-"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '사진 추가' })).toBeEnabled();

  await input.setInputFiles((await imageFiles()).slice(0, 1));
  await expect(page.locator('a[href*="/uploads/retry-"]')).toHaveCount(1);
  await expect(page.getByText('강제 업로드 실패')).toHaveCount(0);
});

test('upload retries once after refreshing an expired access token', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let uploadCount = 0;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadCount += 1;
    if (uploadCount === 1) {
      await route.fulfill({
        status: 401,
        headers: responseHeaders(),
        body: JSON.stringify({ message: 'expired' }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify([
        {
          id: 'refreshed-upload',
          fileUrl: '/uploads/refreshed-upload.webp',
          originalName: 'refreshed-upload.png',
          fileType: 'image/webp',
          fileSize: '1024',
        },
      ]),
    });
  });

  await page
    .getByLabel('사진 추가')
    .setInputFiles((await imageFiles()).slice(0, 1));

  await expect(
    page.locator('a[href$="/uploads/refreshed-upload.webp"]'),
  ).toBeVisible();
  expect(uploadCount).toBe(2);
});

test('real API processes one optimized photo batch and removes it cleanly', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let uploadCount = 0;
  page.on('request', (request) => {
    if (request.url() !== `${apiOrigin}/api/uploads` || request.method() !== 'POST') return;
    uploadCount += 1;
  });

  await page.getByLabel('사진 추가').setInputFiles(await imageFiles());
  await expect(page.locator('a[href*="/uploads/"]')).toHaveCount(4, {
    timeout: 20_000,
  });
  expect(uploadCount).toBe(1);

  for (let remaining = 4; remaining > 0; remaining -= 1) {
    const deleted = page.waitForResponse(
      (response) =>
        response.url().startsWith(`${apiOrigin}/api/uploads/`) &&
        response.request().method() === 'DELETE',
    );
    await page.getByRole('button', { name: '제거' }).first().click();
    expect((await deleted).ok()).toBe(true);
  }
  await expect(page.locator('a[href*="/uploads/"]')).toHaveCount(0);
});

test('real API processes eleven HEIC photos in bounded batches', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let uploadCount = 0;
  page.on('request', (request) => {
    if (
      request.url() === `${apiOrigin}/api/uploads` &&
      request.method() === 'POST'
    ) {
      uploadCount += 1;
    }
  });

  await page.getByLabel('사진 추가').setInputFiles(await heicFiles());
  await expect(page.locator('a[href*="/uploads/"]')).toHaveCount(11, {
    timeout: 30_000,
  });
  expect(uploadCount).toBe(4);

  for (let remaining = 11; remaining > 0; remaining -= 1) {
    const deleted = page.waitForResponse(
      (response) =>
        response.url().startsWith(`${apiOrigin}/api/uploads/`) &&
        response.request().method() === 'DELETE',
    );
    await page.getByRole('button', { name: '제거' }).first().click();
    expect((await deleted).ok()).toBe(true);
  }
  await expect(page.locator('a[href*="/uploads/"]')).toHaveCount(0);
});
