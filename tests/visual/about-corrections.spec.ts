import { expect, test } from '@playwright/test';
import sharp from 'sharp';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
});

test('closing photo reaches black without a visible vertical seam', async ({ page }) => {
  const closing = page.getByRole('region', { name: '함께 드리는 예배' });
  const media = closing.locator('> div').first();
  const mediaBox = await media.boundingBox();
  const closingBox = await closing.boundingBox();

  expect(mediaBox).not.toBeNull();
  expect(closingBox).not.toBeNull();

  const screenshot = await closing.screenshot({ animations: 'disabled' });
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const boundaryX = Math.round(
    (mediaBox?.x ?? 0) + (mediaBox?.width ?? 0) - (closingBox?.x ?? 0),
  );
  const sampleY = Math.round(info.height / 2);
  const pixel = (x: number) => {
    const offset = (sampleY * info.width + x) * info.channels;
    return [data[offset], data[offset + 1], data[offset + 2]] as const;
  };
  const inside = pixel(boundaryX - 1);
  const outside = pixel(boundaryX);

  expect(Math.max(...inside.map((value, index) => Math.abs(value - outside[index])))).toBeLessThanOrEqual(3);
});

test('closing divider uses long directional gradient lines', async ({ page }) => {
  const divider = page.getByLabel('J-TEEN WORSHIP');
  const lines = divider.locator('span');

  await expect(lines).toHaveCount(2);
  for (const line of await lines.all()) {
    await expect(line).toHaveCSS('width', '130px');
    await expect(line).toHaveCSS('background-image', /linear-gradient/);
  }
});

test('closing top divider begins at the Figma media boundary', async ({
  page,
}) => {
  const closing = page.getByRole('region', { name: '함께 드리는 예배' });
  const line = closing.locator('[data-zone="page-under-glow"]');
  const clip = line.locator('..');
  const [closingBox, clipBox] = await Promise.all([
    closing.boundingBox(),
    clip.boundingBox(),
  ]);

  expect(closingBox).not.toBeNull();
  expect(clipBox).not.toBeNull();
  expect(Math.abs((clipBox?.x ?? 0) - (closingBox?.x ?? 0) - 1220)).toBeLessThanOrEqual(1);
  expect(Math.abs((clipBox?.width ?? 0) - 700)).toBeLessThanOrEqual(1);
  await expect(line).toHaveCSS('background-image', 'none');
  await expect(line).toHaveCSS('background-color', 'rgb(59, 130, 246)');
});

test('leader portrait uses the Figma card corner and border', async ({ page }) => {
  const portrait = page.locator('[data-zone="about-leader"] > div').first();

  await expect(portrait).toHaveCSS('border-radius', '14px');
  await expect(portrait).toHaveCSS('border-width', '1px');
  await expect(portrait).toHaveCSS('border-style', 'solid');
});

test('leader portrait keeps the compact Figma proportion on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const portrait = page.locator('[data-zone="about-leader"] > div').first();

  await expect(portrait).toHaveCSS('width', '160px');
  await expect(portrait).toHaveCSS('height', '200px');
  await expect(portrait).toHaveCSS('border-radius', '10px');
});

test('mobile leader copy avoids Korean orphan fragments', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const leader = page.locator('[data-zone="about-leader"]');

  await expect(leader.locator('h2 small')).toHaveCSS('white-space', 'nowrap');
  for (const lineBreak of await leader.locator('blockquote br').all()) {
    await expect(lineBreak).toHaveCSS('display', 'none');
  }
});

test('mobile value glyphs keep visible blue outline strokes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const glyphs = page.locator('section[aria-labelledby="about-heading"] article svg');

  await expect(glyphs).toHaveCount(3);
  for (const glyph of await glyphs.all()) {
    await expect(glyph).toHaveCSS('fill', 'none');
    await expect(glyph).toHaveCSS('stroke', 'rgb(22, 119, 255)');
  }
});

test('tablet closing sentence preserves a visible inter-span gap', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  const statement = page.locator('[data-zone="about-closing-statement"]');

  await expect(statement).toHaveCSS('display', 'flex');
  await expect(statement).toHaveCSS('column-gap', '8px');
});
