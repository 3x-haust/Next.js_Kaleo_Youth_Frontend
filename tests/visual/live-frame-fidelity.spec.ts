import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';
import { FIGMA_FRAMES } from './figma-frames';
import { liveFigmaRoute } from './live-figma-routes';
import { comparePng } from './pixel-diff';

const evidenceStage = process.env.FIDELITY_EVIDENCE_STAGE ?? 'red';
const evidenceRoot = path.resolve('.omo/evidence/ulw-all-pages', evidenceStage);
const referenceRoot = path.resolve('.omo/evidence/figma-desktop');
const wholeFrameMismatchCeiling = 0.006;
const cropMismatchCeiling = 0.004;
const cropHeight = 540;

interface TextMask {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

async function maskTextRaster(image: Buffer, masks: readonly TextMask[]): Promise<Buffer> {
  const metadata = await sharp(image).metadata();
  const imageWidth = metadata.width ?? 0;
  const imageHeight = metadata.height ?? 0;
  const overlays = masks.flatMap((mask) => {
    const left = Math.max(0, Math.floor(mask.x) - 2);
    const top = Math.max(0, Math.floor(mask.y) - 2);
    const width = Math.min(imageWidth - left, Math.ceil(mask.width) + 4);
    const height = Math.min(imageHeight - top, Math.ceil(mask.height) + 4);
    if (width <= 0 || height <= 0) return [];
    return [{
      input: {
        create: {
          width,
          height,
          channels: 4 as const,
          background: '#000000',
        },
      },
      left,
      top,
    }];
  });
  return sharp(image).composite(overlays).png().toBuffer();
}

async function settlePage(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([
      document.fonts.load('400 22px "Paperlogy"'),
      document.fonts.load('500 22px "Paperlogy"'),
      document.fonts.load('600 22px "Paperlogy"'),
      document.fonts.load('700 22px "Paperlogy"'),
      document.fonts.load('900 22px "Paperlogy"'),
    ]);
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) =>
        image.complete
          ? image.decode().catch(() => undefined)
          : new Promise<void>((resolve) => {
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener('error', () => resolve(), { once: true });
            }),
      ),
    );
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

async function expectCssPixels(
  locator: ReturnType<Page['locator']>,
  property: string,
  expected: number,
): Promise<void> {
  const actual = await locator.evaluate(
    (element, key) => Number.parseFloat(getComputedStyle(element).getPropertyValue(key)),
    property,
  );
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.05);
}

async function expectImageSource(
  image: Locator,
  expected: string,
): Promise<void> {
  const source = await image.getAttribute('src');
  expect(source).not.toBeNull();
  const url = new URL(source ?? '', 'http://localhost');
  const original =
    url.pathname === '/_next/image'
      ? url.searchParams.get('url')
      : url.pathname;
  expect(original).toBe(expected);
}

for (const frame of FIGMA_FRAMES) {
  test(`${frame.nodeId} ${frame.slug} live route matches strict Figma crops`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: frame.width, height: 1080 });
    const liveRoute = liveFigmaRoute(frame.nodeId);
    await page.goto(liveRoute, {
      waitUntil: liveRoute === '/' ? 'domcontentloaded' : 'networkidle',
    });
    await settlePage(page);
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });

    const rasterMasks = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const masks: TextMask[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;
        const styles = getComputedStyle(parent);
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
          continue;
        }
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width === 0 || rect.height === 0) continue;
          masks.push({
            x: rect.left + scrollX,
            y: rect.top + scrollY,
            width: rect.width,
            height: rect.height,
          });
        }
      }
      for (const element of document.querySelectorAll<HTMLElement>('svg, img')) {
        const source =
          element instanceof HTMLImageElement
            ? new URL(element.currentSrc || element.src, location.href).pathname
            : '';
        const authoredRaster =
          source.endsWith('/images/exact/container-98-3134-cal.png') ||
          source.endsWith('/images/sections/message-artwork.png');
        if (element.tagName !== 'SVG' && !source.endsWith('.svg') && !authoredRaster) {
          continue;
        }
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        masks.push({
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height,
        });
      }
      for (const element of document.querySelectorAll<HTMLElement>(
        'section[aria-labelledby="home-title"] video, [class*="about-styled__ValueIcon"], [class*="about-styled__MemberIcon"], [class*="about-styled__MemberPortrait"], [class*="about-styled__ClosingMedia"] img',
      )) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        masks.push({
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height,
        });
      }
      return masks;
    });
    if (liveRoute !== '/') {
      rasterMasks.push({ x: 0, y: 0, width: frame.width, height: 160 });
    }
    if (frame.nodeId === '63:6') {
      const map = page.locator('[data-zone="home-interactive-map"]');
      await expect(map).toHaveCSS('width', '847px');
      await expect(map).toHaveCSS('height', '695px');
      await expect(map.locator('[data-map-canvas]')).toBeVisible();
      await expect(map.locator('[data-map-marker="church"]')).toBeVisible();
      await expect(page.locator('a[href*="map.naver.com"]')).toHaveCount(1);
      const messagePoster = page.locator(
        'img[src$="/images/exact/container-98-3134-cal.png"]',
      );
      await expect(messagePoster).toHaveCount(1);
      await expect(messagePoster).toHaveCSS('width', '1000px');
      await expect(messagePoster).toHaveCSS('height', '558px');
    }
    if (frame.nodeId === '153:31') {
      const valueIcons = page.locator('[class*="about-styled__ValueIcon"]');
      const portraits = page.locator('[class*="about-styled__MemberPortrait"]');
      const closingMedia = page.locator('[class*="about-styled__ClosingMedia"]');
      await expect(valueIcons).toHaveCount(3);
      await expect(portraits).toHaveCount(7);
      await expect(portraits.first()).toHaveCSS('width', '215px');
      await expect(portraits.first()).toHaveCSS('height', '272px');
      await expect(closingMedia).toHaveCSS('left', '2px');
      await expect(closingMedia).toHaveCSS('width', '1220px');
      await expect(closingMedia).toHaveCSS('height', '460px');
    }
    if (frame.nodeId === '105:5093') {
      const sermonPoster = page.locator(
        'img[src$="/images/sections/message-artwork.png"]',
      );
      await expect(sermonPoster).toHaveCount(1);
      await expect(sermonPoster).toHaveCSS('width', '1720px');
      await expect(sermonPoster).toHaveCSS('height', '960px');
    }
    if (frame.nodeId === '105:4378') {
      const galleryImages = page.locator('[data-zone="gallery-grid"] img');
      const gallerySources = [
        '/images/gallery/semantic/image-110-5637-background.png',
        '/images/gallery/semantic/image-110-5712-background.png',
        '/images/gallery/semantic/image-110-5719-background.png',
        '/images/gallery/semantic/image-110-5767-background.png',
        '/images/gallery/semantic/image-110-5773-background.png',
        '/images/gallery/semantic/image-110-5779-background.png',
        '/images/gallery/semantic/image-110-5787-background.png',
        '/images/gallery/semantic/image-110-5793-background.png',
        '/images/gallery/semantic/image-110-5799-background.png',
      ] as const;
      await expect(galleryImages).toHaveCount(gallerySources.length);
      for (let index = 0; index < gallerySources.length; index += 1) {
        const image = galleryImages.nth(index);
        await expectImageSource(image, gallerySources[index]);
        await expectCssPixels(image, 'width', 554);
        await expectCssPixels(image, 'height', 400);
      }
      rasterMasks.push(
        ...(await galleryImages.evaluateAll((images) =>
          images.map((image) => {
            const rect = image.getBoundingClientRect();
            return {
              x: rect.left + scrollX,
              y: rect.top + scrollY,
              width: rect.width,
              height: rect.height,
            };
          }),
        )),
      );
    }
    if (frame.nodeId === '110:5901') {
      const detailImages = page.locator('main img');
      const detailSources = [
        '/images/gallery/design-detail-main.jpg',
        '/images/gallery/design-detail-main.jpg',
        '/images/gallery/design-detail-1.jpg',
        '/images/gallery/design-detail-2.jpg',
        '/images/gallery/design-detail-3.jpg',
      ] as const;
      await expect(detailImages).toHaveCount(detailSources.length);
      for (let index = 0; index < detailSources.length; index += 1) {
        await expectImageSource(detailImages.nth(index), detailSources[index]);
      }
      await expectCssPixels(detailImages.first(), 'width', 1720);
      await expectCssPixels(detailImages.first(), 'height', 960);
      rasterMasks.push(
        ...(await detailImages.evaluateAll((images) =>
          images.map((image) => {
            const rect = image.getBoundingClientRect();
            return {
              x: rect.left + scrollX,
              y: rect.top + scrollY,
              width: rect.width,
              height: rect.height,
            };
          }),
        )),
      );
      rasterMasks.push({ x: 100, y: 1544, width: 1720, height: 201 });
    }
    if (frame.nodeId === '105:5251') {
      rasterMasks.push(
        { x: 190, y: 521, width: 180, height: 920 },
        { x: 1490, y: 521, width: 250, height: 920 },
      );
    }
    if (frame.nodeId === '102:147' || frame.nodeId === '102:503') {
      const threeImageFrame = frame.nodeId === '102:147';
      const setlistImages = page.locator('[data-zone="setlist-images"] img');
      const setlistSources = threeImageFrame
        ? [
            '/images/setlists/setlist-1.png',
            '/images/setlists/setlist-2.png',
            '/images/setlists/setlist-3.png',
          ]
        : [
            '/images/setlists/setlist-5.png',
            '/images/setlists/setlist-4.png',
            '/images/setlists/setlist-6.png',
            '/images/setlists/setlist-7.png',
          ];
      await expect(setlistImages).toHaveCount(setlistSources.length);
      for (let index = 0; index < setlistSources.length; index += 1) {
        const image = setlistImages.nth(index);
        await expectImageSource(image, setlistSources[index]);
        await expectCssPixels(image, 'width', threeImageFrame ? 544 : 416);
        await expectCssPixels(image, 'height', threeImageFrame ? 305 : 233);
      }
      rasterMasks.push(
        ...(await setlistImages.evaluateAll((images) =>
          images.map((image) => {
            const rect = image.getBoundingClientRect();
            return {
              x: rect.left + scrollX,
              y: rect.top + scrollY,
              width: rect.width,
              height: rect.height,
            };
          }),
        )),
      );
    }
    const fullPage = await page.screenshot({
      fullPage: true,
      caret: 'hide',
    });
    const actual = await sharp(fullPage)
      .extract({ left: 0, top: 0, width: frame.width, height: frame.height })
      .png()
      .toBuffer();
    const frameKey = frame.nodeId.replace(':', '-');
    const outputDirectory = path.join(evidenceRoot, frameKey);
    const reference = await readFile(path.join(referenceRoot, frameKey, 'reference.png'));
    const wholeResult = await comparePng(actual, reference, outputDirectory);
    const frameMasks = rasterMasks
      .filter((mask) => mask.y < frame.height)
      .map((mask) => ({
        ...mask,
        height: Math.min(mask.height, frame.height - mask.y),
      }));
    const [visualActual, visualReference] = await Promise.all([
      maskTextRaster(actual, frameMasks),
      maskTextRaster(reference, frameMasks),
    ]);
    const visualDirectory = path.join(outputDirectory, 'visual');
    const visualResult = await comparePng(
      visualActual,
      visualReference,
      visualDirectory,
    );

    expect(wholeResult.actualWidth).toBe(frame.width);
    expect(wholeResult.actualHeight).toBe(frame.height);

    const cropResults: Array<{
      readonly index: number;
      readonly top: number;
      readonly height: number;
      readonly mismatchRatio: number;
    }> = [];

    for (let top = 0, index = 0; top < frame.height; top += cropHeight, index += 1) {
      const height = Math.min(cropHeight, frame.height - top);
      const [actualCrop, referenceCrop] = await Promise.all([
        sharp(visualActual)
          .extract({ left: 0, top, width: frame.width, height })
          .png()
          .toBuffer(),
        sharp(visualReference)
          .extract({ left: 0, top, width: frame.width, height })
          .png()
          .toBuffer(),
      ]);
      const cropDirectory = path.join(outputDirectory, 'crops', String(index).padStart(2, '0'));
      await writeFile(path.join(cropDirectory, 'reference.png'), referenceCrop).catch(
        async () => {
          const { mkdir } = await import('node:fs/promises');
          await mkdir(cropDirectory, { recursive: true });
          await writeFile(path.join(cropDirectory, 'reference.png'), referenceCrop);
        },
      );
      const cropResult = await comparePng(actualCrop, referenceCrop, cropDirectory);
      cropResults.push({ index, top, height, mismatchRatio: cropResult.mismatchRatio });
    }

    const failedCrops = cropResults.filter(
      (result) => result.mismatchRatio > cropMismatchCeiling,
    );

    expect(
      failedCrops,
      `${frame.nodeId} has crop mismatch above ${cropMismatchCeiling}: ${JSON.stringify(
        failedCrops,
      )}`,
    ).toEqual([]);
    expect(
      visualResult.mismatchRatio,
      `${frame.nodeId} visual mismatch exceeds ${wholeFrameMismatchCeiling}`,
    ).toBeLessThanOrEqual(wholeFrameMismatchCeiling);
  });
}
