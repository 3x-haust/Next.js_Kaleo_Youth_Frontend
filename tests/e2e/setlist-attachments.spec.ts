import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { once } from 'node:events';
import { cp, readFile, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const SETLIST_ID = '44444444-4444-4444-8444-444444444441';
const evidence = path.resolve('.omo/evidence/setlist-attachments');
const fixture = {
  id: SETLIST_ID,
  teamId: null,
  team: null,
  serviceDate: '2026-08-23',
  title: '주일 J-TEEN 콘티',
  fileUrl: '/uploads/existing-sheet.pdf',
  youtubePlaylistId: null,
  youtubePlaylistTitle: null,
  lastSyncedAt: null,
  syncStatus: 'manual',
  songs: [
    {
      id: 'song-one',
      setlistId: SETLIST_ID,
      displayOrder: 0,
      songTitle: '주의 이름 높이며',
      artist: 'J-TEEN',
      youtubeVideoId: null,
      youtubeVideoTitle: null,
      thumbnailUrl: null,
      note: null,
      sheetFileUrl: null,
      isUnavailable: false,
    },
  ],
  attachments: [
    {
      id: 'existing-image-one',
      fileUrl: '/uploads/existing-one.png',
      originalName: 'existing-one.png',
      fileType: 'image/png',
      fileSize: '4096',
      displayOrder: 0,
    },
    {
      id: 'existing-sheet',
      fileUrl: '/uploads/existing-sheet.pdf',
      originalName: 'existing-sheet.pdf',
      fileType: 'application/pdf',
      fileSize: '8192',
      displayOrder: 1,
    },
    {
      id: 'existing-image-two',
      fileUrl: '/uploads/existing-two.png',
      originalName: 'existing-two.png',
      fileType: 'image/png',
      fileSize: '6144',
      displayOrder: 2,
    },
  ],
  createdAt: '2026-08-20T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

let apiServer: Server | undefined;
let frontendProcess: ChildProcessWithoutNullStreams | undefined;
let apiOrigin = '';
let frontendOrigin = '';
let png: Buffer;
let fixtureRoot = '';
let frontendLog = '';

function json(response: ServerResponse, body: unknown) {
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Fixture server has no TCP port');
  return address.port;
}

async function freePort(): Promise<number> {
  const server = createServer();
  const port = await listen(server);
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForReady(process: ChildProcessWithoutNullStreams): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Fixture frontend did not become ready')), 60_000);
    const inspect = (chunk: Buffer) => {
      frontendLog += chunk.toString();
      if (!/Ready in|Ready on|started server/i.test(chunk.toString())) return;
      clearTimeout(timeout);
      resolve();
    };
    process.stdout.on('data', inspect);
    process.stderr.on('data', inspect);
    process.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Fixture frontend exited before ready (${code ?? 'signal'})`));
    });
  });
}

function corsHeaders() {
  return {
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type,x-csrf-token',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-origin': frontendOrigin,
    'content-type': 'application/json',
  };
}

async function fulfillCors(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, headers: corsHeaders(), body: JSON.stringify(body) });
}

async function openEditPage(page: Page) {
  if (frontendProcess?.exitCode !== null) {
    throw new Error(`Fixture frontend stopped before navigation:\n${frontendLog}`);
  }
  await page.context().addCookies([{
    name: 'kaleo_at',
    value: 'fixture-access-token',
    url: frontendOrigin,
  }]);
  await page.goto(`${frontendOrigin}/admin/setlists/${SETLIST_ID}`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '콘티 수정' })).toBeVisible();
}

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true });
  png = await readFile(path.resolve('public/images/about/exact/icons/vocal.png'));
  const sourceRoot = process.cwd();
  fixtureRoot = await mkdtemp(path.join(tmpdir(), 'kaleo-setlist-attachments-'));
  const excluded = new Set([
    '.env.local',
    '.git',
    '.next',
    '.omo',
    'node_modules',
    'public/videos',
    'test-results',
  ]);
  await cp(sourceRoot, fixtureRoot, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(sourceRoot, source);
      if (!relative) return true;
      const segments = relative.split(path.sep);
      return !segments.some((_, index) => excluded.has(segments.slice(0, index + 1).join('/')));
    },
  });
  await symlink(path.join(sourceRoot, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'dir');
  apiServer = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/api/auth/me') {
      json(response, {
        id: 'admin-one',
        loginId: 'fixture-admin',
        name: 'Fixture Admin',
        positionLabel: null,
        isSuperAdmin: true,
      });
      return;
    }
    if (url.pathname === '/api/setlists/capabilities') {
      json(response, { playlistImportEnabled: false });
      return;
    }
    if (url.pathname === `/api/setlists/${SETLIST_ID}`) {
      json(response, fixture);
      return;
    }
    if (url.pathname === '/api/auth/csrf') {
      response.setHeader('set-cookie', 'kaleo_csrf=fixture-token; Path=/; SameSite=Lax');
      json(response, { csrfToken: 'fixture-token' });
      return;
    }
    if (url.pathname.endsWith('.png')) {
      response.writeHead(200, { 'content-type': 'image/png' });
      response.end(png);
      return;
    }
    if (url.pathname.endsWith('.pdf')) {
      response.writeHead(200, { 'content-type': 'application/pdf' });
      response.end('%PDF-1.4 fixture');
      return;
    }
    response.writeHead(404);
    response.end();
  });
  apiOrigin = `http://127.0.0.1:${await listen(apiServer)}`;
  const frontendPort = await freePort();
  frontendOrigin = `http://127.0.0.1:${frontendPort}`;
  frontendProcess = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'dev',
      '--webpack',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(frontendPort),
    ],
    {
      cwd: fixtureRoot,
      env: {
        ...process.env,
        API_INTERNAL_URL: `${apiOrigin}/api`,
        NEXT_PUBLIC_API_ORIGIN: apiOrigin,
      },
      stdio: 'pipe',
    },
  );
  await waitForReady(frontendProcess);
});

test.afterAll(async () => {
  if (frontendProcess && frontendProcess.exitCode === null) {
    const exited = once(frontendProcess, 'exit');
    frontendProcess.kill('SIGTERM');
    await exited;
  }
  if (apiServer) {
    await new Promise<void>((resolve, reject) => apiServer?.close((error) => error ? reject(error) : resolve()));
  }
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

test('admin retains existing attachments, previews PNG uploads, and maps ordered attachmentIds', async ({ page }) => {
  let resolvePatch: ((body: unknown) => void) | undefined;
  const patchSeen = new Promise<unknown>((resolve) => {
    resolvePatch = resolve;
  });
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }
    expect(request.postData()).toContain('name="ownerType"\r\n\r\nsetlist');
    expect(request.postData()).toContain('uploaded.png');
    await fulfillCors(route, [{
      id: 'uploaded-image',
      fileUrl: '/uploads/uploaded.png',
      originalName: 'uploaded.png',
      fileType: 'image/png',
      fileSize: String(png.byteLength),
    }]);
  });
  await page.route(`${apiOrigin}/api/setlists/${SETLIST_ID}`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }
    resolvePatch?.(route.request().postDataJSON());
    await fulfillCors(route, fixture);
  });

  await openEditPage(page);
  await expect(page.getByRole('heading', { name: '콘티 사진' })).toBeVisible();
  await expect(page.locator('[data-zone="setlist-admin-image"]')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'existing-sheet.pdf' })).toBeVisible();
  await page.getByLabel('콘티 사진 파일').setInputFiles({
    name: 'uploaded.png',
    mimeType: 'image/png',
    buffer: png,
  });
  await expect(page.locator('[data-zone="setlist-admin-image"]')).toHaveCount(3);
  await page.getByRole('button', { name: 'existing-two.png 제거' }).click();
  await page.screenshot({ path: path.join(evidence, 'admin-preview-green.png'), fullPage: true });
  await page.getByRole('button', { name: '저장', exact: true }).click();

  await expect(patchSeen).resolves.toMatchObject({
    attachmentIds: ['existing-image-one', 'existing-sheet', 'uploaded-image'],
    fileUrl: '/uploads/existing-sheet.pdf',
  });
});

test('admin rejects a malformed image before upload without losing existing previews', async ({ page }) => {
  let uploadRequests = 0;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadRequests += 1;
    await fulfillCors(route, { message: '손상된 이미지 파일입니다.' }, 400);
  });
  await openEditPage(page);

  await page.getByLabel('콘티 사진 파일').setInputFiles({
    name: 'broken.png',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });

  await expect(
    page.getByRole('alert').filter({ hasText: '이미지 파일만 올릴 수 있습니다.' }),
  ).toBeVisible();
  await expect(page.locator('[data-zone="setlist-admin-image"]')).toHaveCount(2);
  expect(uploadRequests).toBe(0);
});

test('admin rejects unsupported GIF images before upload', async ({ page }) => {
  let uploadRequests = 0;
  await page.route(`${apiOrigin}/api/uploads`, async (route) => {
    uploadRequests += 1;
    await fulfillCors(route, { message: '지원하지 않는 이미지 형식입니다.' }, 400);
  });
  await openEditPage(page);

  await page.getByLabel('콘티 사진 파일').setInputFiles({
    name: 'animated.gif',
    mimeType: 'image/gif',
    buffer: png,
  });

  await expect(
    page.getByRole('alert').filter({ hasText: '이미지 파일만 올릴 수 있습니다.' }),
  ).toBeVisible();
  await expect(page.locator('[data-zone="setlist-admin-image"]')).toHaveCount(2);
  expect(uploadRequests).toBe(0);
});

test('public detail renders every image attachment responsively and lists non-image downloads', async ({ page }) => {
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto(`${frontendOrigin}/jteen/setlists/${SETLIST_ID}`, { waitUntil: 'networkidle' });
    const images = page.locator('[data-zone="setlist-attachment-image"]');
    await expect(images).toHaveCount(2);
    await expect(images.nth(0)).toHaveAttribute('alt', 'existing-one.png');
    await expect(images.nth(1)).toHaveAttribute('alt', 'existing-two.png');
    const download = page.getByRole('link', { name: /existing-sheet\.pdf/ });
    await expect(download).toHaveAttribute('href', `${apiOrigin}/uploads/existing-sheet.pdf`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: path.join(evidence, `public-${viewport.name}-green.png`),
      fullPage: true,
      animations: 'disabled',
    });
  }
});
