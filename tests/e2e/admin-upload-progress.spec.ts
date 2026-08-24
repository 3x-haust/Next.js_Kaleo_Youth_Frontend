import { expect, test, type BrowserContext } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const apiOrigin = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const frontendOrigin = new URL(
  process.env.PW_FRONTEND_URL ?? 'http://localhost:3000',
).origin;

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
  const page = await context.newPage();
  await login(page);
  authCookies = await context.cookies();
  await context.close();
});

test.beforeEach(async ({ context }) => {
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
  let uploadIndex = 0;

  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadIndex += 1;
    const current = uploadIndex;
    requestStarted();
    await release;
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify([
        {
          id: `progress-result-${current}`,
          fileUrl: `/uploads/progress-${current}.webp`,
          originalName: `progress-${current}.png`,
          fileType: 'image/webp',
          fileSize: '1024',
        },
      ]),
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

test('multi-photo upload uses three bounded parallel requests', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let active = 0;
  let maximumActive = 0;
  let requestCount = 0;
  let releaseRequests!: () => void;
  const release = new Promise<void>((resolve) => {
    releaseRequests = resolve;
  });
  let threeStarted!: () => void;
  const ready = new Promise<void>((resolve) => {
    threeStarted = resolve;
  });

  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    active += 1;
    requestCount += 1;
    const current = requestCount;
    maximumActive = Math.max(maximumActive, active);
    if (requestCount === 3) threeStarted();
    await release;
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify([
        {
          id: `parallel-${current}`,
          fileUrl: `/uploads/parallel-${current}.webp`,
          originalName: `parallel-${current}.png`,
          fileType: 'image/webp',
          fileSize: '1024',
        },
      ]),
    });
    active -= 1;
  });

  await page.getByLabel('사진 추가').setInputFiles(await imageFiles());
  try {
    await Promise.race([
      ready,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('three concurrent uploads did not start')),
          3_000,
        );
      }),
    ]);
    expect(maximumActive).toBe(3);
    expect(requestCount).toBe(3);
  } finally {
    releaseRequests();
  }

  await expect(page.locator('a[href*="/uploads/parallel-"]')).toHaveCount(4);
});

test('failed multi-photo upload cleans completed files and remains retryable', async ({
  page,
}) => {
  await page.goto('/admin/gallery/new');

  let uploadCount = 0;
  let deleteCount = 0;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadCount += 1;
    if (uploadCount === 2) {
      await route.fulfill({
        status: 500,
        headers: responseHeaders(),
        body: JSON.stringify({ message: '강제 업로드 실패' }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify([
        {
          id: `retry-${uploadCount}`,
          fileUrl: `/uploads/retry-${uploadCount}.webp`,
          originalName: `retry-${uploadCount}.png`,
          fileType: 'image/webp',
          fileSize: '1024',
        },
      ]),
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
  expect(deleteCount).toBe(3);
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

test('real API processes four parallel photos and removes them cleanly', async ({
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
  expect(uploadCount).toBe(4);

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
