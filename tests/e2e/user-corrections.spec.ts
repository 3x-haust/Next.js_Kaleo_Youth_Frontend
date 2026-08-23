import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const galleryPath = '/share/gallery/33333333-3333-4333-8333-333333333361';
const setlistPath = '/jteen/setlists/44444444-4444-4444-8444-444444444441';

test('J-TEEN and weekly setlist entry share one authored experience', async ({ page }) => {
  await page.goto('/');
  const weeklySetlist = page.getByRole('link', { name: /이번주 콘티/ });
  await expect(weeklySetlist).toHaveAttribute('href', '/jteen');

  await page.goto('/jteen');
  await expect(page).toHaveURL(/\/jteen\/setlists\/[0-9a-f-]+$/);
  await expect(page.locator('[data-zone="setlist-images"]')).toBeVisible();

  await page.goto('/jteen/setlists');
  await expect(page).toHaveURL(/\/jteen\/setlists\/[0-9a-f-]+$/);
});

test('every public route renders the shared footer on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const routes = [
    '/about',
    '/sermons',
    '/sermons/11111111-1111-4111-8111-111111111111',
    '/events',
    '/share/gallery',
    galleryPath,
    setlistPath,
  ];

  for (const route of routes) {
    await page.goto(route);
    const footer = page.locator('footer');
    await expect(footer, route).toBeVisible();
    const box = await footer.boundingBox();
    expect(box?.height, route).toBeGreaterThan(0);
  }
});

test('Gallery keeps a finite four-thumbnail window in stable order', async ({ page }) => {
  await page.goto(galleryPath);
  const rail = page.getByLabel('사진 선택');
  const labels = () =>
    rail.locator('button').evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    );
  const expected = [
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ];

  expect(await labels()).toEqual(expected);
  await rail.getByRole('button', { name: '2번째 사진 선택' }).click();
  expect(await labels()).toEqual(expected);
  const opener = page.getByRole('button', { name: /사진 크게 보기/ }).first();
  await opener.click();
  const dialog = page.getByRole('dialog', { name: /사진 크게 보기/ });
  const closeButton = dialog.getByRole('button', { name: '닫기' });
  await expect(dialog).toContainText('2 / 5');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('3 / 5');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(rail.getByRole('button', { name: '3번째 사진 선택' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(opener).toBeFocused();
  expect(await labels()).toEqual(expected);
});

test('About uses exact Figma instrument exports and quote rule', async ({ page }) => {
  await page.goto('/about');
  const cards = page.locator('[data-zone="about-member-card"]');
  const instruments = cards.locator('img');
  const instrumentByPart = new Map([
    ['ELECTRIC GUITAR', 'electric-guitar'],
    ['DRUMS', 'drums'],
    ['MAIN KEYBOARD', 'main-keyboard'],
    ['SECOND KEYBOARD', 'second-keyboard'],
    ['BASS', 'bass'],
    ['VOCAL', 'vocal'],
  ]);
  const sources = [
    ['electric-guitar', '193:2280'],
    ['drums', '193:2290'],
    ['main-keyboard', '193:2300'],
    ['second-keyboard', '193:2310'],
    ['bass', '193:2320'],
    ['vocal', '193:2330'],
    ['vocal', '193:2330'],
  ] as const;
  await expect(instruments).toHaveCount(sources.length);
  for (let index = 0; index < await cards.count(); index += 1) {
    const part = (await cards.nth(index).locator('small').textContent())
      ?.trim()
      .toUpperCase();
    const name = part ? instrumentByPart.get(part) : undefined;
    expect(name).toBeDefined();
    await expect(cards.nth(index).locator('img')).toHaveAttribute(
      'src',
      `/images/about/exact/icons-svg/${name}.svg`,
    );
  }
  for (const [name, nodeId] of sources.slice(0, 6)) {
    const source = await readFile(
      path.resolve(`public/images/about/exact/icons-svg/${name}.svg`),
      'utf8',
    );
    expect(source).toContain(`data-figma-node="${nodeId}"`);
    expect(source).toContain('<image');
    expect(source).not.toContain('<path');
  }

  await page.setViewportSize({ width: 690, height: 900 });
  await page.goto('/');
  const quote = page.locator('section[aria-labelledby="about-title"] blockquote');
  await expect(quote).toHaveCSS('border-left-width', '3px');
  await expect(quote).toHaveCSS('border-left-color', 'rgb(22, 119, 255)');
  expect((await quote.boundingBox())?.height).toBeLessThanOrEqual(50);
});

test('Event date and detail rows use centered stable geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/events');
  const card = page.locator('[data-zone="event-card"]').first();
  const dateBlock = card.locator(':scope > span').first();
  const dateContent = dateBlock.locator(':scope > span');
  const [blockBox, contentBox] = await Promise.all([
    dateBlock.boundingBox(),
    dateContent.boundingBox(),
  ]);
  expect(blockBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(
    Math.abs(
      (blockBox?.x ?? 0) + (blockBox?.width ?? 0) / 2
        - ((contentBox?.x ?? 0) + (contentBox?.width ?? 0) / 2),
    ),
  ).toBeLessThanOrEqual(1);

  const factGeometry = await card.evaluate((element) => {
    const facts = element.children[2];
    return [...facts.children].map((row) => {
      const icon = row.children[0].getBoundingClientRect();
      const text = row.children[1].getBoundingClientRect();
      return {
        iconWidth: icon.width,
        centerDifference: Math.abs(
          icon.y + icon.height / 2 - (text.y + text.height / 2),
        ),
      };
    });
  });
  expect(factGeometry).toHaveLength(2);
  for (const row of factGeometry) {
    expect(row.iconWidth).toBeCloseTo(36, 0);
    expect(row.centerDifference).toBeLessThanOrEqual(1);
  }
});

test('public shell disables selection and image dragging while preserving controls', async ({
  page,
}) => {
  await page.goto('/');
  expect(
    await page.locator('[data-zone="public-shell"]').evaluate((shell) =>
      getComputedStyle(shell).userSelect,
    ),
  ).toBe('none');
  expect(
    await page.locator('main img').first().evaluate((image) =>
      !image.dispatchEvent(new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
      })),
    ),
  ).toBe(true);

  await page.goto('/events');
  const inputSelection = await page.locator('input').first().evaluate((input) =>
    getComputedStyle(input).userSelect,
  );
  expect(inputSelection).not.toBe('none');
});

test('new public surfaces participate in scroll reveal motion', async ({ page }) => {
  for (const route of ['/events', galleryPath, setlistPath]) {
    await page.goto(route);
    await expect(page.locator('[data-motion-reveal]').first(), route).toBeAttached();
  }
});

test('Home copy, footer, gradient, and event artwork match the supplied corrections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 690, height: 900 });
  await page.goto('/');

  const aboutLines = page.locator('[data-zone="home-about-copy"] > span');
  const quoteLines = page.locator('[data-zone="home-about-quote"] > span');
  await expect(aboutLines).toHaveCount(3);
  await expect(quoteLines).toHaveCount(2);
  for (const line of await aboutLines.all()) {
    expect((await line.evaluate((element) => element.getClientRects().length))).toBe(1);
  }
  for (const line of await quoteLines.all()) {
    expect((await line.evaluate((element) => element.getClientRects().length))).toBe(1);
  }

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const contact = page.locator('section[aria-labelledby="contact-title"]');
  const footer = page.locator('[data-zone="site-footer"]');
  const [contactBackground, footerBackground] = await Promise.all([
    contact.evaluate((element) => getComputedStyle(element).backgroundImage),
    footer.locator(':scope > div').first().evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    ),
  ]);
  expect(contactBackground).toContain('rgba(2, 36, 89, 0.42)');
  expect(footerBackground).toContain('footer-glow-left-top.svg');

  const accentRule = footer.locator('[data-zone="footer-accent-rule"]');
  await expect(accentRule).toHaveCSS('width', '25px');
  await expect(accentRule).toHaveCSS('height', '0px');
  await expect(footer.locator('[data-zone="footer-slogan-lead"]')).toHaveCSS('font-size', '14px');
  await expect(footer.locator('[data-zone="footer-slogan-built"]')).toHaveCSS('font-size', '16px');
  await expect(footer.locator('[data-zone="footer-design-by"]')).toHaveCSS('font-size', '14px');
  await expect(footer.locator('[data-zone="footer-slogan-lead"]')).toHaveCSS(
    'color',
    'rgb(247, 249, 252)',
  );
  const address = footer.locator('[data-zone="footer-address-copy"]');
  expect(await address.evaluate((element) => element.scrollHeight)).toBe(32);
  await expect(address.locator('br')).toHaveCount(1);
  const contactDivider = footer.locator('[data-zone="footer-contact-rule"]');
  await expect(contactDivider).toHaveCSS('width', '300px');
  await expect(contactDivider).toHaveCSS('height', '0px');

  const contactIcon = footer.locator('[data-zone="footer-contact-icon"]').first();
  await expect(contactIcon).toHaveCSS('width', '32px');
  await expect(contactIcon).toHaveCSS('height', '32px');
  await expect(contactIcon).toHaveCSS('padding', '4px');

  await page.goto('/events');
  const firstCard = page.locator('[data-zone="event-card"]').first();
  const dateContent = firstCard.locator(':scope > span > span').first();
  await expect(dateContent).toHaveCSS('text-align', 'center');
  const dateCenters = await dateContent.evaluate((element) => {
    const parent = element.getBoundingClientRect();
    return [...element.children].map((child) => {
      const box = child.getBoundingClientRect();
      return Math.abs(box.x + box.width / 2 - (parent.x + parent.width / 2));
    });
  });
  expect(dateCenters.every((difference) => difference <= 1)).toBe(true);

  const eventIcons = firstCard.locator('[data-zone="event-facts"] img');
  await expect(eventIcons).toHaveCount(2);
  await expect(eventIcons.nth(0)).toHaveAttribute('src', '/images/events/time.svg');
  await expect(eventIcons.nth(1)).toHaveAttribute('src', '/images/events/location.svg');
  for (const [file, nodeId] of [
    ['time.svg', '105:5427'],
    ['location.svg', '105:5422'],
  ] as const) {
    const source = await readFile(path.resolve(`public/images/events/${file}`), 'utf8');
    expect(source).toContain(`data-figma-node="${nodeId}"`);
  }
});
