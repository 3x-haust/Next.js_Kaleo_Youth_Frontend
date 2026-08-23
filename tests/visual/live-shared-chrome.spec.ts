import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

const evidenceStage = process.env.FIDELITY_EVIDENCE_STAGE ?? 'red';
const evidenceRoot = path.resolve(
  '.omo/evidence/ulw-all-pages',
  evidenceStage,
  'shared-chrome',
);

test('internal desktop header expands at origin then becomes readable glass', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/about', { waitUntil: 'networkidle' });
  const nav = page.locator('[data-zone="global-nav"]');
  await expect(nav).toHaveAttribute('data-glass', 'true');
  await expect(nav).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(nav).toHaveCSS(
    'backdrop-filter',
    'none',
  );
  expect((await nav.boundingBox())?.width).toBeCloseTo(1920, 0);

  const settled = nav.evaluate((element) => new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error('Navbar width transition did not settle')),
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
  await settled;
  await expect(nav).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(nav).toHaveCSS(
    'backdrop-filter',
    'blur(16px) saturate(0.9) brightness(0.9)',
  );
  expect((await nav.boundingBox())?.width).toBeCloseTo(1500, 0);

  const outputDirectory = path.join(evidenceRoot, 'header');
  await mkdir(outputDirectory, { recursive: true });
  await nav.screenshot({
    path: path.join(outputDirectory, 'readable-glass.png'),
    caret: 'hide',
  });
});

test('home desktop footer matches the corrected typography and gradient contract', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const footer = page.locator('[data-zone="site-footer"]');
  const content = footer.locator(':scope > div').nth(1);
  const identity = content.locator(':scope > div').first();
  const contact = content.locator(':scope > div').last();
  const wordmark = identity.locator('a').first();
  const slogan = identity.locator('p').first();
  const sloganKo = identity.locator('p').nth(1);
  const sloganLead = footer.locator('[data-zone="footer-slogan-lead"]');
  const sloganBuilt = footer.locator('[data-zone="footer-slogan-built"]');
  const accentRule = identity.locator('[data-zone="footer-accent-rule"]');
  const contactIcon = contact.locator('[data-zone="footer-contact-icon"]').first();
  const address = contact.locator('[data-zone="footer-address-copy"]');
  const contactDivider = contact.locator('[data-zone="footer-contact-rule"]');

  await expect(footer).toHaveCSS('height', '351px');
  await expect(identity).toHaveCSS('width', '235px');
  await expect(contact).toHaveCSS('width', '300px');
  await expect(wordmark).toHaveCSS('width', '149px');
  await expect(wordmark).toHaveCSS('height', '92px');
  await expect(slogan).toHaveCSS('font-size', '12px');
  await expect(sloganLead).toHaveCSS('font-size', '14px');
  await expect(sloganLead).toHaveCSS('color', 'rgb(247, 249, 252)');
  await expect(sloganLead).toHaveCSS('font-weight', '200');
  await expect(sloganBuilt).toHaveCSS('font-size', '16px');
  await expect(sloganBuilt).toHaveCSS('font-weight', '500');
  expect(await page.evaluate(() => document.fonts.check('200 14px Paperlogy'))).toBe(true);
  await expect(sloganKo).toHaveCSS('font-size', '12px');
  await expect(sloganKo).toHaveCSS('line-height', '19px');
  await expect(sloganKo).toHaveCSS('color', 'rgb(247, 249, 252)');
  await expect(sloganKo).toHaveCSS('font-weight', '200');
  await expect(sloganKo).toHaveCSS('opacity', '1');
  await expect(footer.locator('[data-zone="footer-design-by"]')).toHaveCSS('font-size', '14px');
  await expect(accentRule).toHaveCSS('width', '25px');
  await expect(accentRule).toHaveCSS('height', '0px');
  expect(
    await accentRule.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
  ).toBe('rgb(22, 119, 255)');
  await expect(contact).toHaveCSS('color', 'rgb(235, 235, 235)');
  await expect(address).toHaveCSS('line-height', '16px');
  expect(await address.evaluate((element) => element.scrollHeight)).toBe(32);
  await expect(address.locator('br')).toHaveCount(1);
  await expect(contactDivider).toHaveCSS('width', '300px');
  await expect(contactDivider).toHaveCSS('height', '0px');
  expect(
    await contactDivider.evaluate(
      (element) => getComputedStyle(element, '::before').backgroundColor,
    ),
  ).toBe('rgb(247, 249, 252)');
  await expect(contactIcon).toHaveCSS('width', '32px');
  await expect(contactIcon).toHaveCSS('height', '32px');
  await expect(contactIcon).toHaveCSS('padding', '4px');

  for (const width of [1440, 1024, 641]) {
    await page.setViewportSize({ width, height: 1080 });
    await expect(address).toHaveCSS('font-size', '12px');
    await expect(accentRule).toHaveCSS('width', '25px');
    await expect(contactDivider).toHaveCSS('width', '300px');
  }
  await page.setViewportSize({ width: 1920, height: 1080 });

  const actualPage = await page.screenshot({ fullPage: true, caret: 'hide' });
  const footerBox = await footer.boundingBox();
  expect(footerBox).not.toBeNull();
  const boundaryY = Math.round(footerBox?.y ?? 0);
  const { data, info } = await sharp(actualPage)
    .extract({ left: 0, top: boundaryY - 1, width: 600, height: 2 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let channelDelta = 0;
  for (let x = 0; x < info.width; x += 1) {
    for (let channel = 0; channel < info.channels; channel += 1) {
      const above = data[x * info.channels + channel] ?? 0;
      const below = data[(info.width + x) * info.channels + channel] ?? 0;
      channelDelta += Math.abs(above - below);
    }
  }
  const averageBoundaryDelta = channelDelta / (info.width * info.channels);
  expect(averageBoundaryDelta).toBeLessThanOrEqual(3);

  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await footer.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await address.evaluate((element) => element.scrollHeight)).toBe(32);

  await page.setViewportSize({ width: 1920, height: 1080 });
  const cornerShot = await footer.screenshot({ caret: 'hide' });
  const { data: cornerData } = await sharp(cornerShot)
    .extract({ left: 1700, top: 280, width: 60, height: 40 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let blueSum = 0;
  for (let index = 0; index < cornerData.length; index += 3) {
    blueSum += cornerData[index + 2] ?? 0;
  }
  expect(blueSum / (cornerData.length / 3)).toBeGreaterThan(8);
});
