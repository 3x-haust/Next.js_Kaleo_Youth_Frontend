import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('navbar is readable liquid glass at scroll origin', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const nav = page.locator('[data-zone="global-nav"]');

  await expect(nav).toHaveAttribute('data-glass', 'true');
  await expect(nav).toHaveAttribute('data-scrolled', 'false');
  await expect(nav).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(nav).toHaveCSS('background-image', 'none');
  await expect(nav).toHaveCSS('backdrop-filter', 'none');
  await expect(nav).toHaveCSS('box-shadow', 'none');
  await expect(nav).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(nav).toHaveCSS('border-top-width', '1px');
  await expect(nav.getByRole('link', { name: '소개' })).toHaveCSS(
    'text-shadow',
    'rgba(0, 0, 0, 0.74) 0px 1px 2px, rgba(4, 8, 28, 0.36) 0px 0px 12px',
  );

  const material = await nav.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      backgroundImage: computed.backgroundImage,
      boxShadow: computed.boxShadow,
    };
  });
  expect(material.backgroundImage).toBe('none');
  expect(material.boxShadow).toBe('none');
});

test('navbar transitions into the authored liquid-glass pill', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const nav = page.locator('[data-zone="global-nav"]');
  await expect(nav).toHaveAttribute('data-glass', 'true');

  const transition = page.evaluate(() => new Promise<{
    readonly startWidth: number;
    readonly intermediateWidth: number;
    readonly finalWidth: number;
    readonly duration: string;
  }>((resolve, reject) => {
    const element = document.querySelector<HTMLElement>('[data-zone="global-nav"]');
    if (!element) {
      reject(new Error('Global navigation was not found'));
      return;
    }

    const startWidth = element.getBoundingClientRect().width;
    const timeout = window.setTimeout(
      () => reject(new Error('Navbar transition did not settle')),
      2_000,
    );
    let intermediateWidth = startWidth;

    element.addEventListener('transitionrun', () => {
      requestAnimationFrame(() => {
        intermediateWidth = element.getBoundingClientRect().width;
      });
    }, { once: true });
    element.addEventListener('transitionend', () => {
      window.clearTimeout(timeout);
      resolve({
        startWidth,
        intermediateWidth,
        finalWidth: element.getBoundingClientRect().width,
        duration: getComputedStyle(element).transitionDuration,
      });
    }, { once: true });
    scrollTo(0, 48);
  }));
  await expect(nav).toHaveAttribute('data-glass', 'true');
  await expect(nav.locator(':scope > span[aria-hidden="true"]')).toHaveCount(0);
  await expect(nav).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(nav).toHaveCSS('background-image', 'none');
  await expect(nav).toHaveCSS(
    'backdrop-filter',
    'blur(16px) saturate(0.9) brightness(0.9)',
  );
  await expect(nav).toHaveCSS('border-top-width', '1px');
  await page.waitForFunction(() => {
    const element = document.querySelector<HTMLElement>('[data-zone="global-nav"]');
    return element && Math.abs(element.getBoundingClientRect().width - 1500) < 0.5;
  });

  const styles = await nav.evaluate((element) => {
    const computed = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top,
      radius: computed.borderRadius,
      backdrop:
        computed.backdropFilter
        || computed.getPropertyValue('-webkit-backdrop-filter'),
    };
  });

  expect(styles.width).toBeCloseTo(1500, 0);
  expect(styles.height).toBeCloseTo(100, 0);
  expect(styles.top).toBeCloseTo(30, 0);
  expect(Number.parseFloat(styles.radius)).toBeGreaterThanOrEqual(50);
  expect(styles.backdrop).toContain('blur(16px)');
  const transitionEvidence = await transition;
  expect(transitionEvidence.startWidth).toBeCloseTo(1920, 0);
  expect(transitionEvidence.intermediateWidth).toBeLessThan(transitionEvidence.startWidth);
  expect(transitionEvidence.intermediateWidth).toBeGreaterThan(transitionEvidence.finalWidth);
  expect(transitionEvidence.finalWidth).toBeCloseTo(1500, 0);
  expect(transitionEvidence.duration).not.toBe('0s');

  await page.locator('.ky-skip-link').focus();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'KALEO YOUTH 홈' })).toBeFocused();

  const directory = path.resolve('.omo/evidence/interactions');
  await mkdir(directory, { recursive: true });
  await nav.screenshot({ path: path.join(directory, 'liquid-glass-navbar.png') });
});

test('navbar preserves route-aware navigation and keyboard mobile controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const nav = page.locator('[data-zone="global-nav"]');
  const toggle = page.locator('button[aria-controls="global-nav"]');
  const logo = nav.getByRole('link', { name: 'KALEO YOUTH 홈' }).locator('img');
  await expect(nav).toHaveCSS('height', '72px');
  expect((await toggle.boundingBox())?.x).toBeGreaterThanOrEqual(326);
  await expect(logo).toHaveAttribute('src', /kaleo-logo\.svg/);
  await expect(nav.getByRole('link', { name: 'J-Teen', exact: true })).toBeHidden();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: 'J-Teen', exact: true })).toBeVisible();
  const menuSurface = await page.locator('#global-nav').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      backdropFilter: style.backdropFilter,
    };
  });
  expect(menuSurface.backgroundImage).toContain('linear-gradient');
  expect(menuSurface.backdropFilter).not.toBe('none');
  expect((await page.locator('#global-nav').boundingBox())?.width).toBeGreaterThanOrEqual(
    370,
  );
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.evaluate(() => scrollTo(0, 48));
  await expect(nav).toHaveAttribute('data-scrolled', 'true');
  await expect(nav).toHaveCSS('height', '72px');
  await expect(logo).toHaveAttribute('src', /kaleo-logo-after\.svg/);

  await page.goto('/about');
  await page.getByRole('button', { name: '메뉴' }).click();
  await expect(nav.getByRole('link', { name: 'J-Teen', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: '소개' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('desktop labels remain readable with a 44px pointer hit region', async ({ page }) => {
  await page.setViewportSize({ width: 1170, height: 1080 });
  await page.goto('/');
  const link = page.getByRole('link', { name: '소개' });

  expect(
    await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(15);
  expect(
    await link.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      return [centerY - 21, centerY + 21].every(
        (y) => document.elementFromPoint(centerX, y)?.closest('a') === element,
      );
    }),
  ).toBe(true);
});

test('Home navbar matches the schedule page label geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  const measure = async (route: string) => {
    await page.goto(route);
    return page.locator('#global-nav').evaluate((nav) => ({
      box: (() => {
        const rect = nav.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      })(),
      labels: [...nav.querySelectorAll('a')].map((link) => link.textContent?.trim()),
      links: [...nav.querySelectorAll('a')].map((link) => {
        const rect = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
        };
      }),
    }));
  };

  const home = await measure('/');
  const schedule = await measure('/events');

  expect(home).toEqual(schedule);
});

test('navbar disables state motion when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const nav = page.locator('[data-zone="global-nav"]');

  const transitionIsReduced = async () => {
    const durations = await nav.evaluate((element) =>
      getComputedStyle(element).transitionDuration
        .split(',')
        .map((duration) => Number.parseFloat(duration)),
    );
    return durations.every((duration) => duration <= 0.00001);
  };
  await expect.poll(transitionIsReduced).toBe(true);
  await page.evaluate(() => scrollTo(0, 48));
  await expect(nav).toHaveAttribute('data-scrolled', 'true');
  await expect.poll(transitionIsReduced).toBe(true);
});

test('navbar captures responsive origin and scrolled glass evidence', async ({
  page,
}) => {
  const directory = path.resolve('.omo/evidence/interactions/liquid-glass-navbar');
  const evidence: Array<Record<string, string | number>> = [];
  await mkdir(directory, { recursive: true });

  for (const width of [390, 768, 1170, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto('/');
    const nav = page.locator('[data-zone="global-nav"]');
    await expect(nav).toHaveAttribute('data-glass', 'true');
    await expect(nav).toHaveAttribute('data-scrolled', 'false');
    await nav.screenshot({
      path: path.join(directory, `${width}-origin.png`),
      animations: 'disabled',
    });
    await page.screenshot({
      path: path.join(directory, `${width}-origin-context.png`),
      animations: 'disabled',
    });

    const origin = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        state: 'origin',
        width: box.width,
        top: box.top,
        background: style.backgroundColor,
        backdrop: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
        border: style.borderTopColor,
        shadow: style.boxShadow,
      };
    });
    evidence.push({ viewport: width, ...origin });

    await page.evaluate(() => scrollTo(0, 48));
    await expect(nav).toHaveAttribute('data-scrolled', 'true');
    await expect.poll(async () => (await nav.boundingBox())?.y).toBeCloseTo(
      width >= 1024 ? (width / 1920) * 30 : 10,
      1,
    );
    await nav.screenshot({
      path: path.join(directory, `${width}-scrolled.png`),
      animations: 'disabled',
    });
    await page.screenshot({
      path: path.join(directory, `${width}-scrolled-context.png`),
      animations: 'disabled',
    });

    const scrolled = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        state: 'scrolled',
        width: box.width,
        top: box.top,
        background: style.backgroundColor,
        backdrop: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
        border: style.borderTopColor,
        shadow: style.boxShadow,
      };
    });
    evidence.push({ viewport: width, ...scrolled });
  }

  await writeFile(
    path.join(directory, 'computed-styles.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
});
