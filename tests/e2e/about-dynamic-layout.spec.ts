import { expect, test } from '@playwright/test';

test('keeps variable leader copy and team cards in flow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1170, height: 900 });
  await page.goto('/about');

  const geometry = await page.evaluate(() => {
    const leader = document.querySelector<HTMLElement>('[data-zone="about-leader"]');
    const quote = leader?.querySelector<HTMLElement>('blockquote');
    const team = document.querySelector<HTMLElement>('section[aria-labelledby="team-title"]');
    const grid = team?.querySelector<HTMLElement>('[data-zone="about-member-card"]')
      ?.parentElement;
    const closing = team?.nextElementSibling as HTMLElement | null;
    if (!leader || !quote || !team || !grid || !closing) {
      throw new Error('About layout contract is incomplete');
    }

    quote.style.height = '800px';
    grid.style.height = '1422px';

    const quoteBox = quote.getBoundingClientRect();
    const teamBox = team.getBoundingClientRect();
    const gridBox = grid.getBoundingClientRect();
    const closingBox = closing.getBoundingClientRect();
    const role = grid.querySelector<HTMLElement>('small');

    return {
      leaderToTeamGap: teamBox.top - quoteBox.bottom,
      teamToClosingGap: closingBox.top - gridBox.bottom,
      roleWhiteSpace: role ? getComputedStyle(role).whiteSpace : '',
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  expect(geometry.leaderToTeamGap).toBeGreaterThanOrEqual(50);
  expect(geometry.teamToClosingGap).toBeGreaterThanOrEqual(20);
  expect(geometry.roleWhiteSpace).toBe('nowrap');
  expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);
});

test('contains every member card before the closing section at tablet width', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/about');

  const geometry = await page.evaluate(() => {
    const team = document.querySelector<HTMLElement>('section[aria-labelledby="team-title"]');
    const grid = team?.querySelector<HTMLElement>('[data-zone="about-member-card"]')
      ?.parentElement;
    const closing = team?.nextElementSibling as HTMLElement | null;
    if (!team || !grid || !closing) {
      throw new Error('About team layout contract is incomplete');
    }

    grid.style.height = '1900px';
    const gridBox = grid.getBoundingClientRect();
    const closingBox = closing.getBoundingClientRect();
    return {
      closingGap: closingBox.top - gridBox.bottom,
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  expect(geometry.closingGap).toBeGreaterThanOrEqual(20);
  expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);
});

test('aligns the desktop underglow with a dynamically shifted closing section', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/about');
  await page.waitForFunction(() => {
    const route = document.querySelector<HTMLElement>('[data-reduced-motion="true"]');
    if (!route) return false;
    const styles = getComputedStyle(route);
    return styles.opacity === '1' && styles.transform === 'none';
  });

  const geometry = await page.evaluate(() => {
    const team = document.querySelector<HTMLElement>('section[aria-labelledby="team-title"]');
    const grid = team?.querySelector<HTMLElement>('[data-zone="about-member-card"]')
      ?.parentElement;
    const closing = team?.nextElementSibling;
    const pageSurface = team?.parentElement;
    const glow = document.querySelector<HTMLElement>('[data-zone="page-under-glow"]');
    const glowClip = glow?.parentElement;
    if (
      !grid
      || !(closing instanceof HTMLElement)
      || !pageSurface
      || !glowClip
    ) {
      throw new Error('About underglow contract is incomplete');
    }

    grid.style.height = '1900px';
    const pageBox = pageSurface.getBoundingClientRect();
    const closingBox = closing.getBoundingClientRect();
    const glowBox = glowClip.getBoundingClientRect();
    const ambientHeight = Number.parseFloat(
      getComputedStyle(pageSurface, '::before').height,
    );
    return {
      glowOffset: glowBox.top - closingBox.top,
      ambientOffset: pageBox.top + ambientHeight - closingBox.top,
    };
  });

  expect(Math.abs(geometry.glowOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.ambientOffset)).toBeLessThanOrEqual(1);
});

test('packs an eighth desktop member into the existing final row', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/about');
  await page.waitForFunction(() => {
    const route = document.querySelector<HTMLElement>('[data-reduced-motion="true"]');
    if (!route) return false;
    const styles = getComputedStyle(route);
    return styles.opacity === '1' && styles.transform === 'none';
  });

  const geometry = await page.evaluate(() => {
    const cards = [...document.querySelectorAll<HTMLElement>('[data-zone="about-member-card"]')];
    const seventh = cards[6];
    const grid = seventh?.parentElement;
    if (!seventh || !grid) throw new Error('Seven-member About fixture is incomplete');
    const eighth = seventh.cloneNode(true);
    if (!(eighth instanceof HTMLElement)) throw new Error('Eighth member clone failed');
    grid.append(eighth);

    const seventhBox = seventh.getBoundingClientRect();
    const eighthBox = eighth.getBoundingClientRect();
    return {
      rowOffset: eighthBox.top - seventhBox.top,
      columnOffset: eighthBox.left - seventhBox.left,
    };
  });

  expect(Math.abs(geometry.rowOffset)).toBeLessThanOrEqual(1);
  expect(geometry.columnOffset).toBeGreaterThan(0);
});
