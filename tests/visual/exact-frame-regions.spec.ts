import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { FIGMA_DATA_FRAMES, type FigmaBox } from './figma-data-manifest';
import { liveFigmaRoute } from './live-figma-routes';

type CssExpectations = Partial<Record<'backgroundColor' | 'backgroundImage' | 'backgroundSize' | 'backdropFilter' | 'webkitBackdropFilter' | 'boxShadow' | 'color' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'letterSpacing' | 'lineHeight' | 'objectFit' | 'objectPosition' | 'opacity' | 'borderTopWidth' | 'borderBottomWidth' | 'borderLeftWidth' | 'borderRightWidth' | 'borderTopColor' | 'borderBottomColor' | 'borderLeftColor' | 'borderRightColor', string>>;

type CheckResult = {
  readonly name: string;
  readonly passed: boolean;
  readonly differences: readonly string[];
};

type RegionCheck = {
  readonly name: string;
  readonly locator: (page: Page) => Locator;
  readonly count?: number;
  readonly box?: FigmaBox;
  readonly text?: string | RegExp;
  readonly css?: CssExpectations;
  readonly attr?: Record<string, string | RegExp>;
};

const evidenceRoot = path.join('.omo', 'evidence', 'exact-red');
const geometryTolerance = 0.05;
const numericTolerance = 0.05;
const rgbBlue = 'rgb(22, 119, 255)';

const frameBySlug = new Map(FIGMA_DATA_FRAMES.map((frame) => [frame.route, frame]));

function frame(route: string) {
  const value = frameBySlug.get(route);
  if (!value) throw new Error(`Missing Figma data frame for ${route}`);
  return value;
}

async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([
      document.fonts.load('400 22px "Paperlogy"'),
      document.fonts.load('500 22px "Paperlogy"'),
      document.fonts.load('600 22px "Paperlogy"'),
      document.fonts.load('700 22px "Paperlogy"'),
      document.fonts.load('900 80px "Paperlogy"'),
    ]);
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

function cssValue(value: string | undefined, key: string) {
  if (!value) return '';
  if (key === 'fontFamily') return value.split(',')[0]?.replaceAll('"', '').replace(' Exact', '') ?? value;
  return value;
}

function cssValuesMatch(expected: string, actual: string): boolean {
  if (expected === actual) return true;
  const pattern = /-?\d+(?:\.\d+)?/g;
  const expectedNumbers = expected.match(pattern)?.map(Number) ?? [];
  const actualNumbers = actual.match(pattern)?.map(Number) ?? [];
  if (
    expectedNumbers.length === 0 ||
    expectedNumbers.length !== actualNumbers.length ||
    expected.replace(pattern, '#') !== actual.replace(pattern, '#')
  ) return false;
  return expectedNumbers.every(
    (value, index) => Math.abs(value - actualNumbers[index]) <= numericTolerance,
  );
}

async function checkRegion(page: Page, check: RegionCheck): Promise<CheckResult> {
  const locator = check.locator(page);
  const expectedCount = check.count ?? 1;
  const differences: string[] = [];
  const count = await locator.count();
  if (count !== expectedCount) {
    differences.push(`count: expected ${expectedCount}, received ${count}`);
    return { name: check.name, passed: false, differences };
  }
  if (expectedCount === 0) return { name: check.name, passed: true, differences };

  const first = locator.first();
  if (check.text !== undefined) {
    const text = (await first.innerText()).replace(/\s+/g, ' ').trim();
    if (check.text instanceof RegExp) {
      if (!check.text.test(text)) differences.push(`text: expected ${check.text}, received ${JSON.stringify(text)}`);
    } else if (text !== check.text.replace(/\s+/g, ' ').trim()) {
      differences.push(`text: expected ${JSON.stringify(check.text)}, received ${JSON.stringify(text)}`);
    }
  }
  if (check.box) {
    const box = await first.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: Number((rect.left + scrollX).toFixed(3)),
        y: Number((rect.top + scrollY).toFixed(3)),
        width: Number(rect.width.toFixed(3)),
        height: Number(rect.height.toFixed(3)),
      };
    });
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      if (Math.abs(box[key] - check.box[key]) > geometryTolerance) {
        differences.push(`${key}: expected ${check.box[key]}, received ${box[key]}`);
      }
    }
  }
  if (check.css) {
    const styles = await first.evaluate((element, keys) => {
      const computed = getComputedStyle(element as HTMLElement);
      return Object.fromEntries(keys.map((key) => [key, computed[key as keyof CSSStyleDeclaration]]));
    }, Object.keys(check.css));
    for (const [key, expected] of Object.entries(check.css)) {
      const actual = cssValue(String(styles[key] ?? ''), key);
      if (!cssValuesMatch(expected, actual)) differences.push(`${key}: expected ${expected}, received ${actual}`);
    }
  }
  if (check.attr) {
    for (const [name, expected] of Object.entries(check.attr)) {
      const rawActual = (await first.getAttribute(name)) ?? '';
      const actual =
        name === 'src' && rawActual.includes('/_next/image?')
          ? new URL(rawActual, 'http://localhost').searchParams.get('url') ??
            rawActual
          : rawActual;
      if (expected instanceof RegExp) {
        if (!expected.test(actual)) differences.push(`${name}: expected ${expected}, received ${actual}`);
      } else if (actual !== expected) {
        differences.push(`${name}: expected ${expected}, received ${actual}`);
      }
    }
  }
  return { name: check.name, passed: differences.length === 0, differences };
}

async function runExactCase(page: Page, route: string, checks: readonly RegionCheck[], reportSlug?: string) {
  const figma = frame(route);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(liveFigmaRoute(figma.frameId), { waitUntil: 'networkidle' });
  await settle(page);

  const pageMetrics = await page.evaluate(() => {
    const footer = document.querySelector<HTMLElement>('[data-zone="site-footer"]');
    const footerBox = footer?.getBoundingClientRect();
    return {
      height: document.documentElement.scrollHeight,
      footerY: footerBox ? footerBox.top + scrollY : null,
      footerHeight: footerBox?.height ?? null,
    };
  });
  const expectedHeight = route === '/'
    ? figma.viewport.height
    : figma.viewport.height + 351;
  const results: CheckResult[] = [{
    name: 'authored frame plus shared footer height',
    passed: pageMetrics.height === expectedHeight,
    differences: pageMetrics.height === expectedHeight ? [] : [`height: expected ${expectedHeight}, received ${pageMetrics.height}`],
  }];
  if (route !== '/') {
    const footerMatches = pageMetrics.footerY === figma.viewport.height
      && pageMetrics.footerHeight === 351;
    results.push({
      name: 'shared footer begins after authored frame',
      passed: footerMatches,
      differences: footerMatches
        ? []
        : [`footer: expected y=${figma.viewport.height}, height=351; received y=${pageMetrics.footerY}, height=${pageMetrics.footerHeight}`],
    });
  }

  for (const check of checks) results.push(await checkRegion(page, check));

  const report = {
    frameId: figma.frameId,
    route,
    expectedViewport: figma.viewport,
    totalChecks: results.length,
    passedChecks: results.filter((result) => result.passed).length,
    failedChecks: results.filter((result) => !result.passed).length,
    results,
  };
  const routeSlug = route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_/, '');
  const output = path.join(evidenceRoot, `${figma.frameId.replace(':', '-')}-${reportSlug ?? routeSlug}.json`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);

  expect(results.filter((result) => !result.passed), JSON.stringify(report, null, 2)).toEqual([]);
}

const appBarChecks: readonly RegionCheck[] = [
  {
    name: 'expanded public app bar liquid glass origin surface',
    locator: (page) => page.locator('[data-zone="global-nav"]'),
    box: { x: 0, y: 0, width: 1920, height: 100 },
    css: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backdropFilter: 'none',
    },
  },
  {
    name: 'expanded public app bar uses no extra blur element',
    locator: (page) => page.locator('[data-zone="global-nav"] > [aria-hidden="true"]'),
    count: 0,
  },
  {
    name: 'internal app bar menu typography',
    locator: (page) => page.locator('[data-zone="global-nav"] nav'),
    box: { x: 751, y: 39.5, width: 418, height: 21 },
    css: { fontFamily: 'Paperlogy', fontSize: '22px', fontWeight: '500', letterSpacing: '0.816px', lineHeight: '20.4px' },
  },
];

const titleStyle: CssExpectations = { fontFamily: 'Paperlogy', fontSize: '80px', fontWeight: '900', letterSpacing: '2px', lineHeight: '80px' };
const eyebrowStyle: CssExpectations = { fontFamily: 'Paperlogy', fontSize: '28px', fontWeight: '600', letterSpacing: '2px' };

function underGlow(box: FigmaBox): RegionCheck {
  return {
    name: 'exact 3px bottom Under Glow',
    locator: (page) => page.locator('[data-zone="page-under-glow"]'),
    box,
  };
}

function dataAttr(name: string, value: number) {
  return `[${name}="${value}"]`;
}

test.describe('exact Figma RED visual-region contracts on live DB routes', () => {
  test('About exact frame regions', async ({ page }) => {
    await runExactCase(page, '/about', [
      ...appBarChecks,
      { name: 'About intro section', locator: (p) => p.getByRole('region', { name: /혼자가 아니라 함께|ABOUT US/i }), box: { x: 0, y: 0, width: 1920, height: 600 } },
      { name: 'About h1 typography and box', locator: (p) => p.getByRole('heading', { level: 1, name: '혼자가 아니라 함께' }), box: { x: 100, y: 280, width: 617, height: 80 }, css: titleStyle },
      { name: 'About values semantic cards', locator: (p) => p.getByText(/하나님을 예배합니다|말씀 안에서 성장합니다|서로를 사랑하고 함께합니다/), count: 3 },
      { name: 'About leader section', locator: (p) => p.locator('[data-zone="about-leader"]'), box: { x: 0, y: 600, width: 1920, height: 660 } },
      { name: 'About leader portrait asset crop', locator: (p) => p.locator('[data-zone="about-leader"] img').first(), box: { x: 100, y: 735, width: 312, height: 390 }, css: { objectFit: 'cover' } },
      { name: 'About team member portrait semantic contract', locator: (p) => p.locator('[data-zone="about-member-portrait"]'), count: 7 },
      { name: 'About closing media exact box', locator: (p) => p.getByLabel('함께 드리는 예배').locator('img').first(), box: { x: 2, y: 2830, width: 1220, height: 460 }, css: { objectFit: 'cover' } },
      { name: 'About closing divider semantic boundary', locator: (p) => p.getByLabel('J-TEEN WORSHIP'), box: { x: 1221, y: 3148, width: 584, height: 80 } },
      { name: 'About exact closing media opacity', locator: (p) => p.getByLabel('함께 드리는 예배').locator('img').first(), css: { opacity: '0.72' } },
      underGlow({ x: 2, y: 2827, width: 1920, height: 3 }),
    ]);
  });

  test('Events exact frame regions', async ({ page }) => {
    await runExactCase(page, '/events', [
      ...appBarChecks,
      { name: 'Events eyebrow exact text style', locator: (p) => p.getByText('UPCOMING', { exact: true }), box: { x: 100, y: 230, width: 181, height: 33 }, css: { ...eyebrowStyle, color: rgbBlue } },
      { name: 'Events title exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: '다가오는 일정' }), box: { x: 100, y: 279, width: 452, height: 80 }, css: titleStyle },
      { name: 'Events list semantic container', locator: (p) => p.locator('[data-zone="event-list"]'), box: { x: 100, y: 521, width: 1720, height: 920 } },
      { name: 'Events exact card count', locator: (p) => p.locator('[data-zone="event-card"]'), count: 4 },
      { name: 'Events first card exact box', locator: (p) => p.locator('[data-zone="event-card"]').first(), box: { x: 100, y: 521, width: 1720, height: 200 } },
      { name: 'Events first date block exact rail', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('JUN', { exact: true }).locator('..').locator('..'), box: { x: 201, y: 549.5, width: 205, height: 143 } },
      { name: 'Events first date content centers in date rail', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('JUN', { exact: true }).locator('..'), box: { x: 248.5, y: 549.5, width: 109, height: 143 } },
      { name: 'Events first month stays centered in date content', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('JUN', { exact: true }), box: { x: 279.531, y: 549.5, width: 46.922, height: 26 } },
      { name: 'Events first day stays centered in date content', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('16', { exact: true }), box: { x: 248.5, y: 585.5, width: 109, height: 71 } },
      { name: 'Events first weekday stays centered in date content', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('SUN', { exact: true }), box: { x: 278, y: 666.5, width: 50, height: 26 } },
      { name: 'Events divider-to-copy gap and copy box', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('WORSHIP', { exact: true }).locator('..'), box: { x: 500, y: 555.5, width: 372.688, height: 131 } },
      { name: 'Events first worship label exact box', locator: (p) => p.locator('[data-zone="event-card"]').first().getByText('WORSHIP', { exact: true }), box: { x: 500, y: 555.5, width: 103.766, height: 24 }, css: { color: rgbBlue, fontFamily: 'Paperlogy', fontSize: '20px', fontWeight: '600', lineHeight: '24px' } },
      { name: 'Events first card title typography', locator: (p) => p.getByText('주일 청소년 예배', { exact: true }), box: { x: 500, y: 589.5, width: 360, height: 61 }, css: { fontFamily: 'Paperlogy', fontSize: '52px', fontWeight: '500', letterSpacing: '2px', lineHeight: '61px' } },
      { name: 'Events first subtitle exact box', locator: (p) => p.getByText('하나님께 예배하고 함께 말씀을 나누는 시간', { exact: true }), box: { x: 500, y: 660.5, width: 372.688, height: 26 }, css: { color: 'rgb(191, 191, 191)', fontFamily: 'Paperlogy', fontSize: '22px', fontWeight: '400', lineHeight: '26px' } },
      { name: 'Events first facts exact box', locator: (p) => p.locator('[data-zone="event-facts"]').first(), box: { x: 1513, y: 580, width: 206, height: 82 } },
      { name: 'Events first time exact box', locator: (p) => p.locator('[data-zone="event-facts"]').first().getByText('11:00 AM', { exact: true }), box: { x: 1559, y: 585, width: 108, height: 26 }, css: { fontFamily: 'Paperlogy', fontSize: '22px', fontWeight: '600', lineHeight: '26px' } },
      { name: 'Events first location exact box', locator: (p) => p.locator('[data-zone="event-facts"]').first().getByText('수도교회 본당', { exact: true }), box: { x: 1559, y: 631, width: 121, height: 26 }, css: { fontFamily: 'Paperlogy', fontSize: '22px', fontWeight: '600', lineHeight: '26px' } },
      underGlow({ x: 2, y: 2157, width: 1920, height: 3 }),
    ]);
  });

  test('Sermons exact frame regions', async ({ page }) => {
    await runExactCase(page, '/sermons', [
      ...appBarChecks,
      { name: 'Sermons heading exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: /하나님의\s*말씀을 듣습니다/ }), box: { x: 100, y: 279, width: 525, height: 160 }, css: titleStyle },
      { name: 'Sermons exact hero meta copy', locator: (p) => p.getByText('2026.08.13 – 주일예배 찬양 콘티', { exact: true }), box: { x: 123, y: 479, width: 315, height: 26 }, css: { fontFamily: 'Paperlogy', fontSize: '22px', fontWeight: '400' } },
      { name: 'Sermons archive semantic grid', locator: (p) => p.locator('[data-zone="sermon-archive-list"]'), box: { x: 100, y: 595, width: 1720, height: 1581 } },
      { name: 'Sermons exact card count', locator: (p) => p.locator('[data-zone="sermon-archive-list"] a'), count: 9 },
      { name: 'Sermons first image exact crop', locator: (p) => p.locator('[data-zone="sermon-archive-list"] img').first(), box: { x: 100, y: 595, width: 544, height: 304 }, css: { objectFit: 'none' }, attr: { src: '/images/exact/image-105-4268-cal.png' } },
      underGlow({ x: 2, y: 2157, width: 1920, height: 3 }),
    ]);
  });

  test('Sermon detail exact frame regions', async ({ page }) => {
    await runExactCase(page, '/sermons/11111111-1111-4111-8111-111111111111', [
      ...appBarChecks,
      { name: 'Sermon detail title exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: '설교보기' }), box: { x: 100, y: 279, width: 288, height: 80 }, css: titleStyle },
      { name: 'Sermon detail back control', locator: (p) => p.getByRole('link', { name: /돌아가기/ }).first(), box: { x: 100, y: 449, width: 184, height: 45 } },
      { name: 'Sermon detail main media exact source crop', locator: (p) => p.locator('main button[aria-label$="영상 재생"] img'), box: { x: 100, y: 524, width: 1720, height: 960 }, css: { objectFit: 'cover' }, attr: { src: '/images/sections/message-artwork.png' } },
      { name: 'Sermon detail feature title typography', locator: (p) => p.getByRole('heading', { level: 2, name: '돈에 기대지 마십시오.' }), box: { x: 100, y: 1577, width: 576, height: 73 }, css: { fontFamily: 'Paperlogy', fontSize: '62px', fontWeight: '900', letterSpacing: '3.4491px' } },
      { name: 'Sermon detail recent image semantic count', locator: (p) => p.locator('[data-recent-image]'), count: 3 },
      { name: 'Sermon detail first recent image exact box', locator: (p) => p.locator(dataAttr('data-recent-image', 1)).locator('img'), box: { x: 100, y: 1968, width: 544, height: 304 }, css: { objectFit: 'cover' } },
      underGlow({ x: 2, y: 2597, width: 1920, height: 3 }),
    ]);
  });

  test('Gallery exact frame regions', async ({ page }) => {
    await runExactCase(page, '/share/gallery', [
      ...appBarChecks,
      { name: 'Gallery title exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: /우리의 이야기를\s*담았습니다/ }), box: { x: 100, y: 279, width: 525, height: 160 }, css: titleStyle },
      { name: 'Gallery semantic grid exact box', locator: (p) => p.locator('[data-zone="gallery-grid"]'), box: { x: 100, y: 529, width: 1720, height: 1300 } },
      { name: 'Gallery exact card count', locator: (p) => p.locator('[data-gallery-card]'), count: 9 },
      { name: 'Gallery first card exact box', locator: (p) => p.locator(dataAttr('data-gallery-card', 1)), box: { x: 100, y: 529, width: 554, height: 400 } },
      { name: 'Gallery first image exact crop', locator: (p) => p.locator('[data-gallery-card="1"] img'), box: { x: 100, y: 529, width: 554, height: 400 }, css: { objectFit: 'cover' } },
      { name: 'Gallery caption title exact typography', locator: (p) => p.locator(dataAttr('data-gallery-title', 1)), box: { x: 130, y: 844, width: 494, height: 35 }, css: { fontFamily: 'Paperlogy', fontSize: '30px', fontWeight: '400', letterSpacing: '2px' } },
      underGlow({ x: 2, y: 2157, width: 1920, height: 3 }),
    ]);
  });

  test('Gallery detail exact frame regions', async ({ page }) => {
    await runExactCase(page, '/share/gallery/33333333-3333-4333-8333-333333333361', [
      ...appBarChecks,
      { name: 'Gallery detail title exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: '청소년부 여름캠프' }), box: { x: 100, y: 279, width: 597, height: 80 }, css: titleStyle },
      { name: 'Gallery detail back control', locator: (p) => p.getByRole('link', { name: /돌아가기/ }), box: { x: 100, y: 449, width: 184, height: 45 } },
      { name: 'Gallery detail main photo semantic button', locator: (p) => p.getByRole('button', { name: /청소년부 여름캠프 1번째 사진 크게 보기/ }), box: { x: 100, y: 524, width: 1720, height: 960 } },
      { name: 'Gallery detail main image exact crop', locator: (p) => p.getByRole('button', { name: /1번째 사진 크게 보기/ }).locator('img'), box: { x: 100, y: 524, width: 1720, height: 960 }, css: { objectFit: 'cover' }, attr: { src: /design-detail-main\.jpg|33333333/ } },
      { name: 'Gallery detail visible thumbnail count', locator: (p) => p.getByLabel('사진 선택').locator('button'), count: 4 },
      { name: 'Gallery detail first visible thumbnail box', locator: (p) => p.getByLabel('사진 선택').locator('button').first(), box: { x: 204, y: 1544, width: 360, height: 201 } },
      underGlow({ x: 2, y: 2597, width: 1920, height: 3 }),
    ]);
  });

  test('Setlist three exact frame regions', async ({ page }) => {
    await runExactCase(page, '/jteen/setlists/44444444-4444-4444-8444-444444444441', [
      ...appBarChecks,
      { name: 'Setlist three heading exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: /J-TEEN\s*WORSHIP/ }), box: { x: 100, y: 279, width: 439, height: 160 }, css: titleStyle },
      { name: 'Setlist three meta quote exact text', locator: (p) => p.getByText(/2026\.08\.13.*주일예배 찬양 콘티/), box: { x: 148, y: 479, width: 372, height: 31 }, css: { fontFamily: 'Paperlogy', fontSize: '26px', fontWeight: '400', lineHeight: '30.62px' } },
      { name: 'Setlist three image list semantic box', locator: (p) => p.locator('[data-zone="setlist-images"]'), box: { x: 100, y: 600, width: 1720, height: 305 } },
      { name: 'Setlist three exact image count', locator: (p) => p.locator('[data-zone="setlist-images"] img'), count: 3 },
      { name: 'Setlist three first media crop', locator: (p) => p.locator('[data-zone="setlist-images"] img').first(), box: { x: 100, y: 600, width: 544, height: 305 }, css: { objectFit: 'cover' }, attr: { src: /setlist-1\.png|i\.ytimg\.com/ } },
      underGlow({ x: 2, y: 1077, width: 1920, height: 3 }),
    ]);
  });

  test('Setlist four exact frame regions', async ({ page }) => {
    await runExactCase(page, '/jteen/setlists/44444444-4444-4444-8444-444444444442', [
      ...appBarChecks,
      { name: 'Setlist four heading exact typography', locator: (p) => p.getByRole('heading', { level: 1, name: /J-TEEN\s*WORSHIP/ }), box: { x: 100, y: 279, width: 439, height: 160 }, css: titleStyle },
      { name: 'Setlist four image list semantic box', locator: (p) => p.locator('[data-zone="setlist-images"]'), box: { x: 100, y: 600, width: 1720, height: 233 } },
      { name: 'Setlist four exact image count', locator: (p) => p.locator('[data-zone="setlist-images"] img'), count: 4 },
      { name: 'Setlist four first media crop', locator: (p) => p.locator('[data-zone="setlist-images"] img').first(), box: { x: 100, y: 600, width: 416, height: 233 }, css: { objectFit: 'cover' }, attr: { src: /setlist-5\.png|i\.ytimg\.com/ } },
      { name: 'Setlist four fourth media crop', locator: (p) => p.locator('[data-zone="setlist-images"] img').nth(3), box: { x: 1404, y: 600, width: 416, height: 233 }, css: { objectFit: 'cover' } },
      underGlow({ x: 2, y: 1077, width: 1920, height: 3 }),
    ]);
  });

  test('Home footer/contact/dividers exact regions', async ({ page }) => {
    await runExactCase(page, '/', [
      { name: 'Home app bar exact full-width glass surface', locator: (p) => p.locator('[data-zone="global-nav"]'), box: { x: 0, y: 0, width: 1920, height: 100 }, css: { backgroundColor: 'rgba(0, 0, 0, 0)', backdropFilter: 'none' } },
      { name: 'Home app bar uses no extra blur element', locator: (p) => p.locator('[data-zone="global-nav"] > [aria-hidden="true"]'), count: 0 },
      { name: 'Home hero under-glow divider semantic contract', locator: (p) => p.locator('[data-zone="home-hero-under-glow"]'), count: 1, box: { x: 1, y: 1077, width: 1920, height: 3 } },
      { name: 'Home message scripture divider', locator: (p) => p.locator('[data-zone="home-message-detail"]'), css: { borderLeftWidth: '3px', borderLeftColor: rgbBlue } },
      { name: 'Home worship copy divider', locator: (p) => p.locator('[data-zone="home-worship-copy"]'), css: { borderRightWidth: '3px', borderRightColor: rgbBlue } },
      { name: 'Home contact section exact box', locator: (p) => p.getByRole('region', { name: /함께하고 싶으신가요/ }), box: { x: 0, y: 4569, width: 1920, height: 965 } },
      { name: 'Home contact map exact box', locator: (p) => p.locator('[data-zone="home-interactive-map"]'), box: { x: 973, y: 4704, width: 847, height: 695 } },
      { name: 'Home footer exact adjacency to contact', locator: (p) => p.locator('[data-zone="site-footer"]'), box: { x: 0, y: 5534, width: 1920, height: 351 } },
      { name: 'Home contact footer no gap/no overlap', locator: (p) => p.locator('body'), count: 1, text: /Called to serve/ },
    ]);
  });

  test('Expanded public app bar contract across non-home live routes', async ({ page }) => {
    for (const route of ['/about', '/events', '/sermons', '/sermons/11111111-1111-4111-8111-111111111111', '/share/gallery', '/share/gallery/33333333-3333-4333-8333-333333333361', '/jteen/setlists/44444444-4444-4444-8444-444444444441', '/jteen/setlists/44444444-4444-4444-8444-444444444442']) {
      const figma = frame(route);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(liveFigmaRoute(figma.frameId), { waitUntil: 'networkidle' });
      await settle(page);
      const results: CheckResult[] = [];
      for (const check of appBarChecks) results.push(await checkRegion(page, check));
      expect(
        results.filter((result) => !result.passed),
        JSON.stringify({ frameId: figma.frameId, route, results }, null, 2),
      ).toEqual([]);
    }
  });
});
