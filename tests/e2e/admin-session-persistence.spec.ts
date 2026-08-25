import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function envValue(source: string, key: string): string {
  const line = source
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  if (!line) throw new Error(`${key} is missing from the backend environment.`);
  return line.slice(key.length + 1);
}

test('admin navigation refreshes an expired access session', async ({
  page,
}) => {
  const env = await readFile(
    path.resolve('../kaleo_youth_backend/.env'),
    'utf8',
  );
  await page.goto('/admin/login');
  await page
    .getByLabel('아이디')
    .fill(envValue(env, 'SEED_SUPER_ADMIN_LOGIN_ID'));
  await page
    .getByLabel('비밀번호')
    .fill(envValue(env, 'SEED_SUPER_ADMIN_PASSWORD'));
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.context().clearCookies({ name: 'kaleo_at' });
  await page.context().clearCookies({ name: 'kaleo_csrf' });
  await page.goto('/admin/gallery');

  await expect(page).toHaveURL(/\/admin\/gallery$/);
  await expect(
    page.getByRole('heading', { level: 1, name: '갤러리' }),
  ).toBeVisible();
  expect(
    (await page.context().cookies()).some(
      (cookie) => cookie.name === 'kaleo_at',
    ),
  ).toBe(true);
});
