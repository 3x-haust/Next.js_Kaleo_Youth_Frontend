import { expect, test } from '@playwright/test';

type SermonList = {
  items: Array<{
    id: string;
    title: string;
    youtubeVideoId: string;
  }>;
};

test('Home map is movable and marks the church location', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('[data-zone="home-interactive-map"]');
  const canvas = map.locator('[data-map-canvas]');
  const marker = map.locator('[data-map-marker="church"]');

  await expect(map).toHaveAttribute('data-latitude', '37.524967193604');
  await expect(map).toHaveAttribute('data-longitude', '126.84674835205');
  await map.scrollIntoViewIfNeeded();
  await expect(canvas).toBeVisible();
  await expect(marker).toBeVisible();
  await expect(marker).toHaveCSS('width', '56px');
  await expect(marker).toHaveCSS('height', '72px');
  await expect(marker.locator('[data-map-marker-pin]')).toHaveCSS(
    'background-color',
    'rgb(239, 88, 72)',
  );
  await expect(map.getByText('수도교회 소예배실')).toHaveCount(0);
  const tile = map.locator('img[src*="/api/map-tiles/"]').first();
  await expect(tile).toHaveJSProperty('naturalWidth', 256);
  await expect(page.locator('a[href*="map.naver.com"]')).toHaveCount(1);

  const before = await marker.boundingBox();
  const canvasBox = await canvas.boundingBox();
  expect(before).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  if (!before || !canvasBox) return;

  const moved = marker.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: ['style'],
        });
      }),
  );
  await page.mouse.move(
    canvasBox.x + canvasBox.width * 0.72,
    canvasBox.y + canvasBox.height * 0.32,
  );
  await page.mouse.down();
  await page.mouse.move(
    canvasBox.x + canvasBox.width * 0.72 + 100,
    canvasBox.y + canvasBox.height * 0.32 + 20,
    { steps: 8 },
  );
  await page.mouse.up();
  await moved;

  const after = await marker.boundingBox();
  expect(after).not.toBeNull();
  if (!after) return;
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(50);

  const zoom = Number(await canvas.getAttribute('data-zoom'));
  await map.getByRole('button', { name: '지도 확대' }).click();
  await expect(canvas).toHaveAttribute('data-zoom', String(zoom + 1));
});

test('Home contact links use verified social and road-address destinations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const contact = page.locator('section[aria-labelledby="contact-title"]');
  await contact.scrollIntoViewIfNeeded();

  const instagram = 'https://www.instagram.com/sdbc_youth/';
  const youtube = 'https://www.youtube.com/channel/UCOu3vzGN6T3iDD9YzOPVIuw';
  const roadAddress = '서울특별시 양천구 오목로19길 19';
  const naver = `https://map.naver.com/p/search/${encodeURIComponent(roadAddress)}`;

  const instagramRow = contact.getByRole('link', { name: '수도교회 청소년부' });
  const youtubeRow = contact.getByRole('link', { name: '수도침례교회 청소년부' });
  const instagramButton = contact.getByRole('link', { name: /인스타그램 바로가기/ });
  const naverButton = contact.getByRole('link', { name: /네이버 지도/ });

  await expect(instagramRow).toHaveAttribute('href', instagram);
  await expect(contact.getByRole('link', { name: '수도침례교회 청소년부' }))
    .toHaveAttribute('href', youtube);
  await expect(instagramButton).toHaveAttribute('href', instagram);
  await expect(naverButton).toHaveAttribute('href', naver);
  await instagramRow.click({ trial: true });
  await youtubeRow.click({ trial: true });
  await instagramButton.click({ trial: true });
  await naverButton.click({ trial: true });
  await expect(contact.getByText(roadAddress)).toBeVisible();
  await expect(contact.getByText(/07934|신월동/)).toHaveCount(0);
});

test('YouTube facade replaces itself with the privacy-enhanced player', async ({
  page,
  request,
}) => {
  const response = await request.get('http://localhost:4000/api/sermons?page=1&limit=1');
  expect(response.status()).toBe(200);
  const sermons = (await response.json()) as SermonList;
  expect(sermons.items.length).toBeGreaterThan(0);
  const sermon = sermons.items[0];

  await page.goto(`/sermons/${sermon.id}`);
  await page.getByRole('button', { name: `${sermon.title} 영상 재생` }).click();

  const player = page.getByTestId('youtube-player');
  await expect(player).toBeVisible();
  await expect(player).toHaveAttribute(
    'src',
    new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${sermon.youtubeVideoId}\\?.*autoplay=1`),
  );
});

test('reduced-motion preference removes the route entrance transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');

  const transition = page.locator('[data-reduced-motion]');
  await expect(transition).toBeVisible();
  await expect(transition).toHaveAttribute('data-reduced-motion', 'true');
  await expect(transition).toHaveCSS('opacity', '1');
  await expect(transition).toHaveCSS('transform', 'none');
});
