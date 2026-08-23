import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { z } from 'zod';

const API_ORIGIN = process.env.PW_API_ORIGIN ?? 'http://localhost:4000';
const PNG = Buffer.from('iVBORw0KGgo=', 'base64');
const uploadResponseSchema = z.object({
  attachmentIds: z.array(z.string()),
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
  expect(response.status()).toBe(200);
}

async function mockImageUpload(page: Page, id: string, fileName: string): Promise<void> {
  await page.route(`${API_ORIGIN}/api/uploads`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id,
        fileUrl: `/uploads/${fileName}`,
        originalName: fileName,
        fileType: 'image/png',
        fileSize: '68',
      }]),
    });
  });
}

let context: BrowserContext;
let page: Page;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
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

test('admin About exposes exactly the pastor and J-Teen panels at required viewports', async () => {
  // Given
  await page.goto('/admin/about');
  const main = page.getByRole('main');

  // When
  for (const viewport of [
    { width: 1280, height: 900, name: 'desktop' },
    { width: 390, height: 844, name: 'mobile' },
  ] as const) {
    await page.setViewportSize(viewport);
    await expect(page.locator('a[href="/admin/about"]')).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `.omo/evidence/admin-about/two-panel-${viewport.name}.png`, fullPage: true });
  }

  // Then
  await expect(main.locator('form > section')).toHaveCount(2);
  await expect(main.locator('#intro-eyebrow, #intro-title, #intro-body, #meta-title, #meta-description')).toHaveCount(0);
  await expect(main.locator('#leader-eyebrow, #team-eyebrow, #closing-label')).toHaveCount(0);

  const fileInputs = main.locator('input[type="file"]');
  await expect(fileInputs).toHaveCount(2);
});

test('admin About preserves hidden content while updating pastor, J-Teen, and both images', async () => {
  // Given
  const initialResponse = await page.request.get(`${API_ORIGIN}/api/about`);
  expect(initialResponse.status()).toBe(200);
  const initial = z.object({
    introEyebrow: z.string(),
    introTitle: z.string(),
    introBody: z.string(),
    values: z.array(z.object({
      icon: z.enum(['cross', 'bible', 'people']),
      label: z.string(),
      title: z.string(),
      body: z.string(),
    })),
    leaderEyebrow: z.string(),
    teamEyebrow: z.string(),
    closingLabel: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
  }).parse(await initialResponse.json());
  const leaderId = '11111111-1111-4111-8111-111111111111';
  const closingId = '22222222-2222-4222-8222-222222222222';
  let uploadCount = 0;
  await page.route(`${API_ORIGIN}/api/uploads`, async (route) => {
    uploadCount += 1;
    const selected = uploadCount === 1
      ? { id: leaderId, fileUrl: '/uploads/leader.png', originalName: 'leader.png' }
      : { id: closingId, fileUrl: '/uploads/closing.png', originalName: 'closing.png' };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ ...selected, fileType: 'image/png', fileSize: '68' }]) });
  });
  await page.route(`${API_ORIGIN}/api/about`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/about');
  const main = page.getByRole('main');
  const fileInputs = main.locator('input[type="file"]');

  // When
  const leaderUpload = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/uploads` && request.method() === 'POST');
  await fileInputs.nth(0).setInputFiles({ name: 'leader.png', mimeType: 'image/png', buffer: PNG });
  expect((await leaderUpload).postData()).toContain('about_page');
  const closingUpload = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/uploads` && request.method() === 'POST');
  await fileInputs.nth(1).setInputFiles({ name: 'closing.png', mimeType: 'image/png', buffer: PNG });
  expect((await closingUpload).postData()).toContain('about_page');
  await main.locator('#leader-name').fill('새 담당자');
  await main.locator('#closing-line-first').fill('새 마무리 문구');
  const patchRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/about` && request.method() === 'PATCH');
  await main.getByRole('button', { name: '소개 저장' }).click();
  const payload = z.object({
    introEyebrow: z.string(),
    introTitle: z.string(),
    introBody: z.string(),
    values: z.array(z.object({ icon: z.string(), label: z.string(), title: z.string(), body: z.string() })),
    leaderEyebrow: z.string(),
    leaderName: z.string(),
    teamEyebrow: z.string(),
    closingLabel: z.string(),
    closingLines: z.array(z.string()),
    metaTitle: z.string(),
    metaDescription: z.string(),
    attachmentIds: z.array(z.string()),
    leaderPhotoAttachmentId: z.string(),
    closingPhotoAttachmentId: z.string(),
  }).parse((await patchRequest).postDataJSON());

  // Then
  expect(payload).toEqual(expect.objectContaining({
    ...initial,
    leaderName: '새 담당자',
    closingLines: ['새 마무리 문구', expect.any(String)],
    attachmentIds: [leaderId, closingId],
    leaderPhotoAttachmentId: leaderId,
    closingPhotoAttachmentId: closingId,
  }));
  await expect(main.getByRole('status')).toBeVisible();
});

test('event form omits cover controls and cover payload fields', async () => {
  // Given
  await page.route(`${API_ORIGIN}/api/events`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'event-created' }) });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/events/new');
  const today = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // When
  await page.locator('#title').fill('payload-contract');
  await page.locator('#startDate').fill(today);
  const createRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/events` && request.method() === 'POST');
  await page.locator('form button[type="submit"]').click();
  const payload = z.record(z.string(), z.unknown()).parse((await createRequest).postDataJSON());

  // Then
  await expect(page.locator('form input[type="file"]')).toHaveCount(0);
  await expect(page.locator('#startDate')).toHaveAttribute('min', today);
  expect(payload).not.toHaveProperty('coverImageUrl');
  expect(payload).not.toHaveProperty('attachmentIds');
});

test('team form hides schedule and cover controls while preserving both values', async () => {
  // Given
  const initialResponse = await page.request.get(`${API_ORIGIN}/api/worship-teams/primary`);
  const initial = z.object({ id: z.string(), scheduleInfo: z.string().nullable(), coverImageUrl: z.string().nullable() }).parse(await initialResponse.json());
  await page.route(`${API_ORIGIN}/api/worship-teams/${initial.id}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/team');
  const teamForm = page.getByRole('main').locator('form').first();

  // When
  const patchRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/worship-teams/${initial.id}` && request.method() === 'PATCH');
  await teamForm.locator('button[type="submit"]').click();
  const payload = z.object({ scheduleInfo: z.string().nullable(), coverImageUrl: z.string().nullable() }).passthrough().parse((await patchRequest).postDataJSON());

  // Then
  await expect(teamForm.locator('#team-schedule, input[type="file"]')).toHaveCount(0);
  expect(payload.scheduleInfo).toBe(initial.scheduleInfo);
  expect(payload.coverImageUrl).toBe(initial.coverImageUrl);
  expect(payload).not.toHaveProperty('attachmentIds');
});

test('existing worship member replaces photo with attachment IDs', async () => {
  // Given
  const uploadedId = '44444444-4444-4444-8444-444444444444';
  await mockImageUpload(page, uploadedId, 'member-existing.png');
  await page.route(`${API_ORIGIN}/api/worship-teams/members/*`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.continue();
  });
  await page.goto('/admin/team');
  const memberPanel = page.getByRole('heading', { name: '팀원' }).locator('..');
  const memberRow = memberPanel.locator('li').first();

  // When
  await expect(page.getByLabel(/사진 주소/)).toHaveCount(0);
  const uploadRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/uploads` && request.method() === 'POST');
  await memberRow.locator('input[type="file"]').setInputFiles({ name: 'member-existing.png', mimeType: 'image/png', buffer: PNG });
  expect((await uploadRequest).postData()).toContain('worship_team_member');
  const patchRequest = page.waitForRequest((request) => request.url().includes('/api/worship-teams/members/') && request.method() === 'PATCH');
  const refreshed = page.waitForResponse((response) => new URL(response.url()).pathname === '/admin/team' && response.request().method() === 'GET');
  await memberRow.getByRole('button', { name: '저장' }).click();
  const payload = uploadResponseSchema.parse((await patchRequest).postDataJSON());

  // Then
  expect(payload.attachmentIds).toEqual([uploadedId]);
  await refreshed;
});

test('new worship member submits uploaded photo attachment IDs', async () => {
  // Given
  const uploadedId = '55555555-5555-4555-8555-555555555555';
  await mockImageUpload(page, uploadedId, 'member-new.png');
  await page.route(`${API_ORIGIN}/api/worship-teams/*/members`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/admin/team');

  // When
  await page.getByRole('textbox', { name: '이름*', exact: true }).fill('새 팀원');
  const newMemberFile = page.locator('input[type="file"]').last();
  const uploadRequest = page.waitForRequest((request) => request.url() === `${API_ORIGIN}/api/uploads` && request.method() === 'POST');
  await newMemberFile.setInputFiles({ name: 'member-new.png', mimeType: 'image/png', buffer: PNG });
  expect((await uploadRequest).postData()).toContain('worship_team_member');
  const createRequest = page.waitForRequest((request) => /\/api\/worship-teams\/[^/]+\/members$/.test(request.url()) && request.method() === 'POST');
  const refreshed = page.waitForResponse((response) => new URL(response.url()).pathname === '/admin/team' && response.request().method() === 'GET');
  await page.getByRole('button', { name: '팀원 추가' }).click();
  const payload = uploadResponseSchema.parse((await createRequest).postDataJSON());

  // Then
  expect(payload.attachmentIds).toEqual([uploadedId]);
  await refreshed;
});
