import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';

type DatabaseClient = {
  connect(): Promise<void>;
  query(text: string, values?: readonly unknown[]): Promise<unknown>;
  end(): Promise<void>;
};

function envValue(source: string, name: string): string {
  const prefix = `${name}=`;
  const line = source.split(/\r?\n/).find((entry) => entry.startsWith(prefix));
  if (!line) throw new Error(`${name} is required for admin Playwright tests.`);
  return line.slice(prefix.length);
}

test('refreshes rows, total, and pagination after depleting a page', async ({ page }) => {
  const env = await readFile(path.resolve('../kaleo_youth_backend/.env'), 'utf8');
  const loginId =
    process.env.PW_ADMIN_LOGIN_ID ?? envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID');
  const password =
    process.env.PW_ADMIN_PASSWORD ?? envValue(env, 'SEED_SUPER_ADMIN_PASSWORD');
  const api = page.context().request;
  const csrfResponse = await api.get(`${API_ORIGIN}/api/auth/csrf`);
  expect(csrfResponse.status()).toBe(200);
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const mutationHeaders = {
    origin: 'http://localhost:3000',
    'x-csrf-token': csrfToken,
  };
  const loginResponse = await api.post(`${API_ORIGIN}/api/auth/login`, {
    data: { loginId, password },
    headers: mutationHeaders,
  });
  expect(loginResponse.status()).toBe(200);

  const marker = `QA-ADMIN-REFRESH-${crypto.randomUUID()}`;
  const backendRequire = createRequire(path.resolve('../kaleo_youth_backend/package.json'));
  const { Client } = backendRequire('pg') as {
    Client: new (config: Record<string, unknown>) => DatabaseClient;
  };
  const database = new Client({
    host: envValue(env, 'DB_HOST'),
    port: Number(envValue(env, 'DB_PORT')),
    user: envValue(env, 'DB_USERNAME'),
    password: envValue(env, 'DB_PASSWORD'),
    database: envValue(env, 'DB_DATABASE'),
  });
  await database.connect();

  try {
    await database.query(
      `INSERT INTO posts (board_type, title, content, is_pinned, view_count)
       SELECT 'gallery', $1 || '-' || lpad(index::text, 2, '0'), $1, false, 0
       FROM generate_series(0, 20) AS index`,
      [marker],
    );

    await page.goto(`/admin/gallery?keyword=${encodeURIComponent(marker)}`);
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(20);
    await page.getByRole('checkbox', { name: '현재 페이지 모두 선택' }).check();

    const refreshed = page.waitForResponse(
      (response) =>
        response.url().includes('/admin/gallery') &&
        response.request().headers().rsc === '1' &&
        response.ok(),
    );
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '선택 삭제' }).click();
    await refreshed;

    await expect(rows).toHaveCount(1);
    await expect(page.locator('[data-zone="admin-empty-state"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: '다음 페이지' })).toHaveCount(0);
  } finally {
    await database.query('DELETE FROM posts WHERE content = $1', [marker]);
    await database.end();
  }
});

test('drops a failed selection when refresh removes its row', async ({ page }) => {
  const env = await readFile(path.resolve('../kaleo_youth_backend/.env'), 'utf8');
  const api = page.context().request;
  const csrfResponse = await api.get(`${API_ORIGIN}/api/auth/csrf`);
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const mutationHeaders = {
    origin: 'http://localhost:3000',
    'x-csrf-token': csrfToken,
  };
  const loginResponse = await api.post(`${API_ORIGIN}/api/auth/login`, {
    data: {
      loginId:
        process.env.PW_ADMIN_LOGIN_ID ?? envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID'),
      password:
        process.env.PW_ADMIN_PASSWORD ?? envValue(env, 'SEED_SUPER_ADMIN_PASSWORD'),
    },
    headers: mutationHeaders,
  });
  expect(loginResponse.status()).toBe(200);

  const marker = `QA-ADMIN-SELECTION-${crypto.randomUUID()}`;
  const backendRequire = createRequire(path.resolve('../kaleo_youth_backend/package.json'));
  const { Client } = backendRequire('pg') as {
    Client: new (config: Record<string, unknown>) => DatabaseClient;
  };
  const database = new Client({
    host: envValue(env, 'DB_HOST'),
    port: Number(envValue(env, 'DB_PORT')),
    user: envValue(env, 'DB_USERNAME'),
    password: envValue(env, 'DB_PASSWORD'),
    database: envValue(env, 'DB_DATABASE'),
  });
  await database.connect();

  try {
    await database.query(
      `INSERT INTO posts (board_type, title, content, is_pinned, view_count)
       SELECT 'gallery', $1 || '-' || index::text, $1, false, 0
       FROM generate_series(0, 2) AS index`,
      [marker],
    );
    await page.goto(`/admin/gallery?keyword=${encodeURIComponent(marker)}`);
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    const failedId = (await rows.nth(1).getAttribute('data-href'))?.split('/').at(-1);
    expect(failedId).toBeTruthy();

    let deleteCount = 0;
    await page.route('**/api/posts/*', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }
      deleteCount += 1;
      if (deleteCount === 1) {
        await route.continue();
        return;
      }
      await database.query('DELETE FROM posts WHERE id = $1', [failedId]);
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '의도한 외부 제거' }),
      });
    });

    await rows.nth(0).getByRole('checkbox').check();
    await rows.nth(1).getByRole('checkbox').check();
    const refreshed = page.waitForResponse(
      (response) =>
        response.url().includes('/admin/gallery') &&
        response.request().headers().rsc === '1' &&
        response.ok(),
    );
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '선택 삭제' }).click();
    await refreshed;

    await expect(rows).toHaveCount(1);
    await expect(page.locator('[data-zone="admin-empty-state"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '선택 삭제' })).toHaveCount(0);
    await expect(page.locator('p[role="status"]', { hasText: '개 선택' })).toHaveCount(0);
  } finally {
    await page.unroute('**/api/posts/*');
    await database.query('DELETE FROM posts WHERE content = $1', [marker]);
    await database.end();
  }
});
