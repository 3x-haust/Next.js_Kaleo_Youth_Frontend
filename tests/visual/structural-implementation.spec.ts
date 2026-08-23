import { expect, test } from '@playwright/test';
import { FIGMA_FRAMES } from './figma-frames';
import { liveFigmaRoute } from './live-figma-routes';

const forbiddenRasterSourcePattern = String.raw`\/figma\/frames\/|\/images\/exact\/ref\/|data:image\/(?:png|jpe?g)`;

for (const frame of FIGMA_FRAMES) {
  test(`${frame.nodeId} ${frame.slug} is implemented with semantic DOM`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const route = liveFigmaRoute(frame.nodeId);
    await page.goto(route, {
      waitUntil: route === '/' ? 'domcontentloaded' : 'networkidle',
    });

    const suspiciousImages = await page.locator('img').evaluateAll((images, expected) => {
      const forbiddenRasterSources = new RegExp(expected.pattern);
      return images
        .map((image) => {
          const element = image as HTMLImageElement;
          const box = element.getBoundingClientRect();
          return {
            source: element.currentSrc || element.getAttribute('src') || '',
            width: box.width,
            height: box.height,
          };
        })
        .filter(
          (image) =>
            forbiddenRasterSources.test(image.source) ||
            (image.width >= expected.width * 0.95 && image.height >= expected.height * 0.9),
        );
    }, { width: frame.width, height: frame.height, pattern: forbiddenRasterSourcePattern });

    expect(suspiciousImages, 'Whole-frame raster images are not implementation').toEqual([]);
    await expect(page.locator('canvas, svg image')).toHaveCount(0);

    const suspiciousBackgrounds = await page.locator('body *').evaluateAll((elements, pattern) => {
      const forbiddenRasterSources = new RegExp(pattern);
      return elements.flatMap((element) => {
        const node = element as HTMLElement;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        const forbiddenSource = forbiddenRasterSources.test(style.backgroundImage);
        const viewportOverlay =
          style.position === 'fixed' &&
          box.width >= innerWidth * 0.95 &&
          box.height >= innerHeight * 0.95 &&
          style.backgroundImage !== 'none';
        return forbiddenSource || viewportOverlay
          ? [{ background: style.backgroundImage, width: box.width, height: box.height }]
          : [];
      });
    }, forbiddenRasterSourcePattern);

    expect(suspiciousBackgrounds, 'Whole-frame CSS backgrounds are not implementation').toEqual([]);
    await expect(page.locator('[data-desktop-figma-frame]')).toHaveCount(0);
    await expect(page.locator('[data-zone="global-nav"]')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    const sourceAttributes = await page.locator('img').evaluateAll((images) =>
      images.map((image) => {
        const element = image as HTMLImageElement;
        return element.currentSrc || element.getAttribute('src') || '';
      }),
    );
    const forbiddenRasterSources = new RegExp(forbiddenRasterSourcePattern);
    expect(sourceAttributes.some((source) => forbiddenRasterSources.test(source))).toBe(false);

    const hiddenSemanticReplacements = await page.locator('main section, main article, main a').evaluateAll((elements, pattern) => {
      const forbiddenRasterSourcesInPage = new RegExp(pattern);
      return elements.flatMap((element) => {
        const node = element as HTMLElement;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        const hidesChildren = Array.from(node.children).some((child) => getComputedStyle(child).opacity === '0');
        return hidesChildren && forbiddenRasterSourcesInPage.test(style.backgroundImage) && box.width > 300 && box.height > 200
          ? [{ tag: node.tagName, background: style.backgroundImage, width: box.width, height: box.height }]
          : [];
      });
    }, forbiddenRasterSourcePattern);
    expect(hiddenSemanticReplacements, 'Semantic children must not be hidden behind replacement rasters').toEqual([]);
  });
}
