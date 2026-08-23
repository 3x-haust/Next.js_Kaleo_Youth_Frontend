import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type BrowserContext, type Dialog, type Page } from '@playwright/test';

const ADMIN_LISTS = [
  { route: '/admin/gallery', heading: '갤러리', source: 'gallery' },
  { route: '/admin/sermons', heading: '말씀', source: 'sermons' },
  { route: '/admin/events', heading: '일정', source: 'events' },
  { route: '/admin/setlists', heading: 'J-Teen 콘티', source: 'setlists' },
] as const;

const EXCLUDED_LISTS = ['/admin/accounts', '/admin/audit-logs', '/admin/team'] as const;
const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';

function readEnvValue(source: string, name: string): string {
  const prefix = `${name}=`;
  const line = source.split(/\r?\n/).find((entry) => entry.startsWith(prefix));
  if (!line) throw new Error(`${name} is required for admin Playwright tests.`);
  return line.slice(prefix.length);
}

async function login(page: Page): Promise<void> {
  const envSource = await readFile(path.resolve('../kaleo_youth_backend/.env'), 'utf8');
  const loginId =
    process.env.PW_ADMIN_LOGIN_ID ?? readEnvValue(envSource, 'SEED_SUPER_ADMIN_LOGIN_ID');
  const password =
    process.env.PW_ADMIN_PASSWORD ?? readEnvValue(envSource, 'SEED_SUPER_ADMIN_PASSWORD');

  const csrfResponse = await page.context().request.get(`${API_ORIGIN}/api/auth/csrf`);
  expect(csrfResponse.status()).toBe(200);
  const csrfBody = (await csrfResponse.json()) as { csrfToken: string };
  const loginResponse = await page.context().request.post(
    `${API_ORIGIN}/api/auth/login`,
    {
      data: { loginId, password },
      headers: {
        origin: 'http://localhost:3000',
        'x-csrf-token': csrfBody.csrfToken,
      },
    },
  );
  expect(loginResponse.status()).toBe(200);
  await page.goto('/admin');
}

test.describe.serial('admin selectable content tables', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('enables selection on all four content lists and nowhere else', async () => {
    for (const list of ADMIN_LISTS) {
      const source = await readFile(
        path.resolve(`app/admin/(panel)/${list.source}/page.tsx`),
        'utf8',
      );
      expect(source).toContain('<AdminSelectableTable');

      await page.goto(list.route);
      await expect(page.getByRole('heading', { level: 1, name: list.heading })).toBeVisible();
      const rowCheckboxes = page.locator('tbody').getByRole('checkbox');
      if ((await rowCheckboxes.count()) > 0) {
        await expect(page.getByRole('checkbox', { name: '현재 페이지 모두 선택' })).toBeVisible();
        await expect(rowCheckboxes.first()).toBeVisible();
      } else {
        await expect(page.getByRole('checkbox', { name: '현재 페이지 모두 선택' })).toHaveCount(0);
      }
    }

    for (const route of EXCLUDED_LISTS) {
      await page.goto(route);
      await expect(page.getByRole('checkbox', { name: '현재 페이지 모두 선택' })).toHaveCount(0);
    }
  });

  test('supports current-page selection, indeterminate state, count, and clear', async () => {
    await page.goto('/admin/gallery');
    const selectAll = page.getByRole('checkbox', { name: '현재 페이지 모두 선택' });
    const rowCheckboxes = page.locator('tbody').getByRole('checkbox');

    await rowCheckboxes.first().check();
    await expect(selectAll).toHaveJSProperty('indeterminate', true);
    await expect(page.getByRole('status')).toContainText('1개 선택');

    await selectAll.check();
    await expect(selectAll).toBeChecked();
    await expect(page.getByRole('status')).toContainText(
      `${await rowCheckboxes.count()}개 선택`,
    );
    await page.screenshot({
      path: '.omo/evidence/admin-selectable-table/green-selection.png',
      fullPage: true,
    });

    await page.getByRole('button', { name: '선택 해제' }).click();
    await expect(selectAll).not.toBeChecked();
    await expect(page.getByRole('status')).toHaveCount(0);
  });

  test('uses one confirmation and sends successful deletes strictly serially', async () => {
    await page.goto('/admin/gallery');
    const rows = page.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(2);
    await rows.nth(0).getByRole('checkbox').check();
    await rows.nth(1).getByRole('checkbox').check();

    const calls: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const firstCanFinish = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let firstStartedResolve: (() => void) | undefined;
    const firstStarted = new Promise<void>((resolve) => {
      firstStartedResolve = resolve;
    });

    await page.route('**/api/posts/*', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }

      const id = route.request().url().split('/').at(-1) ?? '';
      calls.push(`${id}:start`);
      if (calls.filter((entry) => entry.endsWith(':start')).length === 1) {
        firstStartedResolve?.();
        await firstCanFinish;
      }
      calls.push(`${id}:end`);
      await route.fulfill({ status: 204 });
    });

    let dialogCount = 0;
    const acceptDialog = async (dialog: Dialog) => {
      dialogCount += 1;
      await dialog.accept();
    };
    page.on('dialog', acceptDialog);

    await page.getByRole('button', { name: '선택 삭제' }).click();
    await firstStarted;
    releaseFirst?.();
    await expect(page.getByRole('status')).toContainText('2개 항목을 삭제했습니다.');

    expect(dialogCount).toBe(1);
    expect(calls).toHaveLength(4);
    expect(calls[0]?.endsWith(':start')).toBe(true);
    expect(calls[1]?.endsWith(':end')).toBe(true);
    expect(calls[2]?.endsWith(':start')).toBe(true);
    expect(calls[3]?.endsWith(':end')).toBe(true);
    page.off('dialog', acceptDialog);
    await page.unroute('**/api/posts/*');
  });

  test('cancel sends no deletes and partial failure retains failed selection', async () => {
    await page.goto('/admin/gallery');
    const rows = page.locator('tbody tr');
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThanOrEqual(2);
    await rows.nth(0).getByRole('checkbox').check();
    await rows.nth(1).getByRole('checkbox').check();

    let deleteCount = 0;
    await page.route('**/api/posts/*', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }
      deleteCount += 1;
      await route.fulfill({
        status: deleteCount === 2 ? 500 : 204,
        contentType: 'application/json',
        body: deleteCount === 2 ? JSON.stringify({ message: '의도한 부분 실패' }) : undefined,
      });
    });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: '선택 삭제' }).click();
    expect(deleteCount).toBe(0);
    await expect(rows).toHaveCount(initialCount);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '선택 삭제' }).click();
    await expect(page.locator('p[role="alert"]')).toContainText('1개 삭제 실패');
    await expect(rows).toHaveCount(initialCount - 1);
    await expect(page.getByRole('status')).toContainText('1개 선택');
    await expect(rows.first().getByRole('checkbox')).toBeChecked();
    await page.unroute('**/api/posts/*');
  });

  test('row body and Enter navigate while controls remain isolated', async () => {
    await page.goto('/admin/setlists');
    const firstRow = page.locator('tbody tr').first();
    const href = await firstRow.getAttribute('data-href');
    expect(href).toMatch(/^\/admin\/setlists\//);

    await firstRow.getByRole('checkbox').check();
    await expect(page).toHaveURL(/\/admin\/setlists$/);

    await firstRow.locator('td').last().click();
    await expect(page).toHaveURL(href ?? '');

    await page.goBack();
    const keyboardRow = page.locator('tbody tr').first();
    await keyboardRow.focus();
    await keyboardRow.press('Enter');
    await expect(page).toHaveURL(href ?? '');
  });
});
