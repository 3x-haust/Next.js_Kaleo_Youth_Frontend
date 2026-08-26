import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const FRONTEND_ORIGIN = new URL(
  process.env.PW_FRONTEND_URL ?? 'http://localhost:3000',
).origin;
const GALLERY_ID = '33333333-3333-4333-8333-333333333361';

function envValue(source: string, name: string): string {
  const prefix = `${name}=`;
  const line = source.split(/\r?\n/).find((entry) => entry.startsWith(prefix));
  if (!line) throw new Error(`${name} is required for admin Playwright tests.`);
  return line.slice(prefix.length);
}

function responseHeaders() {
  return {
    'access-control-allow-origin': FRONTEND_ORIGIN,
    'access-control-allow-credentials': 'true',
    'content-type': 'application/json',
  };
}

async function login(page: Page): Promise<void> {
  const source = await readFile(
    path.resolve('../kaleo_youth_backend/.env'),
    'utf8',
  );
  const csrf = await page.context().request.get(`${API_ORIGIN}/api/auth/csrf`);
  const csrfBody = (await csrf.json()) as { csrfToken: string };
  const response = await page.context().request.post(
    `${API_ORIGIN}/api/auth/login`,
    {
      data: {
        loginId:
          process.env.PW_ADMIN_LOGIN_ID ??
          envValue(source, 'SEED_SUPER_ADMIN_LOGIN_ID'),
        password:
          process.env.PW_ADMIN_PASSWORD ??
          envValue(source, 'SEED_SUPER_ADMIN_PASSWORD'),
      },
      headers: {
        origin: FRONTEND_ORIGIN,
        'x-csrf-token': csrfBody.csrfToken,
      },
    },
  );
  expect(response.status()).toBe(200);
}

async function mockCreate(
  page: Page,
  endpoint: string,
  id: string,
): Promise<void> {
  await page.route(`${API_ORIGIN}/api${endpoint}`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      headers: responseHeaders(),
      body: JSON.stringify({ id }),
    });
  });
}

let context: BrowserContext;
let page: Page;

test.describe.serial('admin save feedback', () => {
  test.beforeAll(async ({ browser }) => {
    await mkdir('.omo/evidence/admin-save-feedback', { recursive: true });
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

  test('create flows: gallery returns to its list with feedback', async () => {
    const image = await readFile(
      path.resolve(
        'public/images/gallery/semantic/image-110-5712-background.png',
      ),
    );
    await page.route(`${API_ORIGIN}/api/uploads`, async (route) => {
      await route.fulfill({
        status: 201,
        headers: responseHeaders(),
        body: JSON.stringify([
          {
            id: '91000000-0000-4000-8000-000000000001',
            fileUrl: '/uploads/save-feedback-gallery.webp',
            originalName: 'save-feedback.png',
            fileType: 'image/webp',
            fileSize: '1024',
          },
        ]),
      });
    });
    await mockCreate(page, '/posts', 'save-feedback-gallery');
    await page.goto('/admin/gallery/new');
    await page
      .getByLabel('사진 추가')
      .setInputFiles({
        name: 'save-feedback.png',
        mimeType: 'image/png',
        buffer: image,
      });
    await page.getByLabel('제목*').fill('저장 UX 갤러리');
    await page.getByLabel('시작일*').fill('2026-08-26');
    await page.getByRole('button', { name: '갤러리 등록' }).click();

    await expect(page).toHaveURL('/admin/gallery');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '갤러리를 등록했습니다.',
    );
    await page.screenshot({
      path: '.omo/evidence/admin-save-feedback/create-desktop.png',
      fullPage: true,
    });
    await page.getByRole('link', { name: '일정', exact: true }).click();
    await expect(page).toHaveURL('/admin/events');
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.getByRole('status').locator('span')).toHaveText('');
  });

  test('create flows: event returns to its list with feedback', async () => {
    await mockCreate(page, '/events', 'save-feedback-event');
    await page.goto('/admin/events/new');
    await page.getByLabel('일정명*').fill('저장 UX 일정');
    await page.getByLabel('시작일*').fill('2026-08-26');
    await page.getByRole('button', { name: '일정 등록' }).click();

    await expect(page).toHaveURL('/admin/events');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '일정을 등록했습니다.',
    );
  });

  test('create flows: sermon returns to its list with feedback', async () => {
    await mockCreate(page, '/sermons', 'save-feedback-sermon');
    await page.goto('/admin/sermons/new');
    await page.getByLabel('제목*').fill('저장 UX 말씀');
    await page.getByLabel('설교자*').fill('테스트 설교자');
    await page.getByLabel('설교 날짜*').fill('2026-08-26');
    await page.getByRole('button', { name: '말씀 등록' }).click();

    await expect(page).toHaveURL('/admin/sermons');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '말씀을 등록했습니다.',
    );
  });

  test('create flows: setlist returns to its list with feedback', async () => {
    await mockCreate(page, '/setlists', 'save-feedback-setlist');
    await page.goto('/admin/setlists/new');
    await page.getByLabel('예배 날짜*').fill('2026-08-30');
    await page.getByLabel('콘티 제목*').fill('저장 UX 콘티');
    await page.getByLabel('곡 제목').fill('테스트 찬양');
    await page.getByRole('button', { name: '콘티 등록' }).click();

    await expect(page).toHaveURL('/admin/setlists');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '콘티를 등록했습니다.',
    );
    await page.setViewportSize({ width: 375, height: 812 });
    const tableScroll = page.getByTestId('admin-table-scroll');
    await expect(page.getByText('표를 좌우로 밀어 더 보기')).toBeVisible();
    expect(
      await tableScroll.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ).toBe(true);
    await tableScroll.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: '.omo/evidence/admin-save-feedback/create-mobile.png',
      fullPage: true,
    });
  });

  test('edit flows: gallery stays in place with feedback', async () => {
    await page.route(`${API_ORIGIN}/api/posts/${GALLERY_ID}`, async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        headers: responseHeaders(),
        body: JSON.stringify({}),
      });
    });
    await page.goto(`/admin/gallery/${GALLERY_ID}`);
    await page.getByRole('button', { name: '저장', exact: true }).click();

    await expect(page).toHaveURL(`/admin/gallery/${GALLERY_ID}`);
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '변경사항을 저장했습니다.',
    );
  });

  test('inline actions: team ordering confirms persistence', async () => {
    const response = await page.request.get(
      `${API_ORIGIN}/api/worship-teams/primary`,
    );
    const team = (await response.json()) as {
      id: string;
      members: Array<{ id: string }>;
    };
    expect(team.members.length).toBeGreaterThan(1);
    await page.route(
      `${API_ORIGIN}/api/worship-teams/${team.id}/members/order`,
      async (route) => {
        await route.fulfill({
          status: 200,
          headers: responseHeaders(),
          body: JSON.stringify({}),
        });
      },
    );
    await page.goto('/admin/team');
    await page.getByRole('button', { name: /아래로 이동/ }).first().click();

    await expect(page).toHaveURL('/admin/team');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '팀원 순서를 저장했습니다.',
    );
  });

  test('detail delete returns to its list with feedback', async () => {
    await page.route(`${API_ORIGIN}/api/posts/${GALLERY_ID}`, async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 204, headers: responseHeaders() });
    });
    page.once('dialog', (dialog) => dialog.accept());
    await page.goto(`/admin/gallery/${GALLERY_ID}`);
    await page
      .locator('form')
      .getByRole('button', { name: '삭제', exact: true })
      .last()
      .click();

    await expect(page).toHaveURL('/admin/gallery');
    await expect(page.getByRole('status').locator('span')).toHaveText(
      '갤러리를 삭제했습니다.',
    );
  });

  test('failed create keeps fields and never announces success', async () => {
    const image = await readFile(
      path.resolve(
        'public/images/gallery/semantic/image-110-5712-background.png',
      ),
    );
    await page.route(`${API_ORIGIN}/api/uploads`, async (route) => {
      await route.fulfill({
        status: 201,
        headers: responseHeaders(),
        body: JSON.stringify([
          {
            id: '91000000-0000-4000-8000-000000000002',
            fileUrl: '/uploads/save-feedback-failure.webp',
            originalName: 'save-feedback-failure.png',
            fileType: 'image/webp',
            fileSize: '1024',
          },
        ]),
      });
    });
    await page.route(`${API_ORIGIN}/api/posts`, async (route) => {
      await route.fulfill({
        status: 500,
        headers: responseHeaders(),
        body: JSON.stringify({ message: '의도한 저장 실패' }),
      });
    });
    await page.goto('/admin/gallery/new');
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.getByRole('status').locator('span')).toHaveText('');
    await page
      .getByLabel('사진 추가')
      .setInputFiles({
        name: 'save-feedback-failure.png',
        mimeType: 'image/png',
        buffer: image,
      });
    await page.getByLabel('제목*').fill('실패해도 유지되는 제목');
    await page.getByLabel('시작일*').fill('2026-08-26');
    await page.getByRole('button', { name: '갤러리 등록' }).click();

    await expect(page).toHaveURL('/admin/gallery/new');
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(
      '의도한 저장 실패',
    );
    await expect(page.getByLabel('제목*')).toHaveValue(
      '실패해도 유지되는 제목',
    );
    await expect(page.getByRole('status').locator('span')).toHaveText('');
  });
});
