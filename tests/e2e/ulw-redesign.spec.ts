import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceRoot = path.resolve(
  `.omo/evidence/${process.env.ULW_EVIDENCE_PHASE === 'green' ? 'ulw-green' : 'ulw-red'}`,
);
const API_ORIGIN = process.env.PW_API_URL ?? 'http://localhost:4000';
const galleryRoute = '/share/gallery/33333333-3333-4333-8333-333333333361';

async function capture(page: import('@playwright/test').Page, name: string) {
  await mkdir(evidenceRoot, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceRoot, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

test('Home matches the authored gradient divider and footer contracts', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
    const maximum = document.documentElement.scrollHeight - innerHeight;
    for (let y = 0; y <= maximum; y += innerHeight * 0.75) {
      scrollTo(0, Math.min(y, maximum));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    }
    scrollTo(0, 0);
  });
  await capture(page, 'home');

  const messageCopy = page.getByText(
    '하나님의 말씀을 듣고, 삶으로 살아내는 우리입니다.',
    { exact: true },
  );
  await expect(messageCopy).toHaveCSS('border-left-width', '3px');
  await expect(messageCopy).toHaveCSS('border-left-color', 'rgb(22, 119, 255)');

  const gallery = page.getByRole('region', { name: /우리의 이야기를/ });
  const seam = await gallery.evaluate((element) => {
    const after = getComputedStyle(element, '::after');
    return {
      content: after.content,
      backgroundImage: after.backgroundImage,
    };
  });
  expect(seam.content).toBe('none');
  expect(seam.backgroundImage).toBe('none');

  const footerBox = await page.locator('[data-zone="site-footer"]').boundingBox();
  expect(footerBox?.height).toBeCloseTo(351, 0);
  expect(footerBox?.y).toBeCloseTo(5534, 0);
});

test('About uses exact authored team art and closing treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');
  await capture(page, 'about');

  await expect(page.getByRole('heading', { level: 2, name: 'J-TEEN' })).toBeVisible();
  const portraits = page.locator('[data-zone="about-member-portrait"]');
  await expect(portraits).toHaveCount(7);
  const portraitBackgrounds = await portraits.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundImage),
  );
  expect(
    portraitBackgrounds.every((background) => background.includes('conic-gradient')),
  ).toBe(true);

  const closing = page.getByLabel('함께 드리는 예배');
  const closingOverlay = await closing.evaluate(
    (element) => getComputedStyle(element, '::after').backgroundImage,
  );
  expect(closingOverlay).toBe('none');
});

test('J-TEEN resolves to the authored weekly setlist experience', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const latestResponse = await page.request.get(`${API_ORIGIN}/api/setlists/latest`);
  expect(latestResponse.ok()).toBe(true);
  const [latest] = await latestResponse.json() as Array<{
    id: string;
    serviceDate: string;
    title: string;
    songs: Array<{ thumbnailUrl: string | null; youtubeVideoId: string }>;
  }>;
  expect(latest).toBeDefined();
  await page.goto('/jteen');
  await capture(page, 'jteen');

  await expect(page).toHaveURL(
    new RegExp(`/jteen/setlists/${latest.id}$`),
  );
  await expect(page.getByRole('heading', { level: 1, name: /J-TEEN\s*WORSHIP/ })).toBeVisible();
  await expect(page.locator('[data-zone="setlist-images"] img')).toHaveCount(
    latest.songs.length,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const meta = page.getByText(
    new RegExp(
      `${latest.serviceDate.slice(0, 10).replaceAll('-', '\\.')}.*${latest.title}`,
    ),
  );
  await expect(meta).toHaveCSS('white-space', 'normal');
  expect((await meta.boundingBox())?.height).toBeLessThanOrEqual(72);

  for (const filename of ['electric-guitar.svg', 'vocal.svg']) {
    const source = await readFile(
      path.resolve(`public/images/about/exact/icons-svg/${filename}`),
      'utf8',
    );
    expect(source).toContain('data-figma-node=');
    expect(source).toContain('<image');
    expect(source).not.toContain('<path');
  }
});

test('Events is a single-level non-navigation listing', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/events');
  await capture(page, 'events');

  const cards = page.locator('[data-zone="event-card"]');
  await expect(cards).toHaveCount(4);
  await expect(cards.locator('a')).toHaveCount(0);

  await page.goto('/events/22222222-2222-4222-8222-222222222221');
  await expect(page).toHaveURL(/\/events$/);
});

test('Gallery keeps every source thumbnail stable while selection changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(galleryRoute);

  const rail = page.getByLabel('사진 선택');
  const labels = () =>
    rail.locator('button').evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    );
  await expect(rail.locator('button')).toHaveCount(4);
  await expect.poll(labels).toEqual([
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ]);

  await rail.getByRole('button', { name: '2번째 사진 선택' }).click();
  await expect.poll(labels).toEqual([
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ]);
  await expect(
    rail.getByRole('button', { name: '2번째 사진 선택' }),
  ).toHaveAttribute('aria-current', 'true');

  await page.getByRole('button', { name: '다음 사진 선택' }).click();
  await page.getByRole('button', { name: '다음 사진 선택' }).click();
  await page.getByRole('button', { name: '다음 사진 선택' }).click();
  await expect.poll(labels).toEqual([
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
    '5번째 사진 선택',
  ]);

  const heroImage = page.getByRole('button', { name: /사진 크게 보기/ }).locator('img');
  const transition = await heroImage.evaluate(
    (image) => getComputedStyle(image).transitionProperty,
  );
  expect(transition).toContain('opacity');
  await capture(page, 'gallery-carousel');
});

test('Every public route expands at origin and uses readable glass after scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const routes = ['/about', '/sermons', '/jteen', '/events', '/share/gallery'] as const;
  const evidence: Array<Record<string, string | number>> = [];

  for (const route of routes) {
    await page.goto(route);
    const nav = page.locator('[data-zone="global-nav"]');
    await expect(nav).toHaveAttribute('data-glass', 'true');
    const origin = await nav.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, top: box.top, background: getComputedStyle(element).backgroundColor };
    });
    expect(origin.width).toBeCloseTo(1920, 0);
    expect(origin.top).toBeCloseTo(0, 0);
    expect(origin.background).toBe('rgba(0, 0, 0, 0)');

    const compactSettled = nav.evaluate((element) => new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('Navbar compact transition did not settle')),
        2_000,
      );
      const onTransitionEnd = (event: Event) => {
        if (!(event instanceof TransitionEvent) || event.propertyName !== 'width') return;
        window.clearTimeout(timeout);
        element.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };
      element.addEventListener('transitionend', onTransitionEnd);
    }));
    await page.evaluate(() => scrollTo(0, 48));
    await expect(nav).toHaveAttribute('data-glass', 'true');
    await compactSettled;
    const compact = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        route: location.pathname,
        width: box.width,
        top: box.top,
        background: style.backgroundColor,
        backdrop: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
      };
    });
    expect(compact.width).toBeCloseTo(1500, 0);
    expect(compact.top).toBeCloseTo(30, 0);
    expect(compact.background).toBe('rgba(0, 0, 0, 0)');
    expect(compact.backdrop).toContain('blur(16px)');
    evidence.push(compact);
  }

  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(
    path.join(evidenceRoot, 'navbar-states.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
});
