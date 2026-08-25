import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { FIGMA_FRAMES } from './figma-frames';
import { liveFigmaRoute } from './live-figma-routes';
import { comparePng } from './pixel-diff';

const evidenceRoot = path.resolve('.omo/evidence/figma-desktop');

for (const frame of FIGMA_FRAMES) {
  test(`${frame.nodeId} ${frame.slug} preserves authored frame provenance`, async ({ page }) => {
    await page.setViewportSize({ width: frame.width, height: 1080 });

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const liveRoute = liveFigmaRoute(frame.nodeId);
    await page.goto(liveRoute, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const route = document.querySelector<HTMLElement>('[data-reduced-motion="true"]');
      if (!route) return false;
      const styles = getComputedStyle(route);
      return styles.opacity === '1' && styles.transform === 'none';
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const image of document.images) {
        image.loading = 'eager';
      }

      await Promise.all(
        [...document.images].map((image) => {
          if (image.complete) {
            return image.decode().catch(() => undefined);
          }

          return new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(
              () => reject(new Error(`Image did not settle: ${image.currentSrc || image.src}`)),
              10_000,
            );
            const settle = () => {
              window.clearTimeout(timeout);
              resolve();
            };
            image.addEventListener('load', settle, { once: true });
            image.addEventListener('error', settle, { once: true });
          });
        }),
      );
    });

    const nav = page.locator('[data-zone="global-nav"]');
    await expect(nav).toHaveAttribute('data-glass', 'true');
    await page.waitForFunction(
      ({ width }) => {
        const element = document.querySelector<HTMLElement>('[data-zone="global-nav"]');
        return element
          && element.dataset.glass === 'true'
          && Math.abs(element.getBoundingClientRect().width - width) < 0.5;
      },
      { width: 1920 },
    );
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
    const fullPage = await page.screenshot({
      fullPage: true,
      caret: 'hide',
    });
    const actual = await sharp(fullPage)
      .extract({ left: 0, top: 0, width: frame.width, height: frame.height })
      .png()
      .toBuffer();
    const frameDirectory = path.join(evidenceRoot, frame.nodeId.replace(':', '-'));
    const reference = await readFile(path.join(frameDirectory, 'reference.png'));

    const manifest = JSON.parse(
      await readFile(path.join(evidenceRoot, 'manifest.json'), 'utf8'),
    ) as Array<{
      nodeId: string;
      width: number;
      height: number;
      sha256: string;
    }>;
    const entry = manifest.find((item) => item.nodeId === frame.nodeId);
    if (!entry) throw new Error(`No manifest entry for ${frame.nodeId}`);
    expect(createHash('sha256').update(reference).digest('hex')).toBe(entry.sha256);

    const result = await comparePng(actual, reference, frameDirectory);

    expect(result.actualWidth, `Rendered width must be ${frame.width}`).toBe(frame.width);
    expect(result.actualHeight, `Rendered height must match authored ${frame.height}`).toBe(frame.height);
    expect(result.referenceWidth).toBe(frame.width);
    expect(result.referenceHeight).toBe(frame.height);

    if (frame.nodeId === '153:31') {
      expect(result.mismatchRatio, 'Full About frame must match at least 99%').toBeLessThanOrEqual(
        0.01,
      );
      const card = { left: 680, top: 1665, width: 560, height: 318 };
      const [actualCard, referenceCard] = await Promise.all([
        sharp(actual).extract(card).png().toBuffer(),
        sharp(reference).extract(card).png().toBuffer(),
      ]);
      const cardDirectory = path.join(frameDirectory, 'regions', '193-2283');
      await mkdir(cardDirectory, { recursive: true });
      await writeFile(path.join(cardDirectory, 'reference.png'), referenceCard);
      const cardResult = await comparePng(
        actualCard,
        referenceCard,
        cardDirectory,
      );
      const icon = { left: 1103, top: 1670, width: 125, height: 125 };
      const [actualIcon, referenceIcon] = await Promise.all([
        sharp(actual).extract(icon).png().toBuffer(),
        sharp(reference).extract(icon).png().toBuffer(),
      ]);
      const iconDirectory = path.join(frameDirectory, 'regions', '193-2290');
      await mkdir(iconDirectory, { recursive: true });
      await writeFile(path.join(iconDirectory, 'reference.png'), referenceIcon);
      const iconResult = await comparePng(
        actualIcon,
        referenceIcon,
        iconDirectory,
      );
      expect(
        cardResult.mismatchRatio,
        'Figma node 193:2283 must match at least 99%',
      ).toBeLessThanOrEqual(0.01);
      expect(
        iconResult.mismatchRatio,
        'Figma icon node 193:2290 must match at least 99%',
      ).toBeLessThanOrEqual(0.01);
    }
  });
}
