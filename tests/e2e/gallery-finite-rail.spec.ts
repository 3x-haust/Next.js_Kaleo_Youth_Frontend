import { expect, test } from '@playwright/test';

const galleryPath =
  '/share/gallery/33333333-3333-4333-8333-333333333361';

test('gallery exposes four thumbnails and stops at both ends', async ({
  page,
}) => {
  await page.goto(galleryPath);
  const rail = page.getByLabel('사진 선택');
  const previous = page.getByRole('button', { name: '이전 사진 선택' });
  const next = page.getByRole('button', { name: '다음 사진 선택' });
  const labels = () =>
    rail.locator('button').evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    );

  await expect(rail.locator('button')).toHaveCount(4);
  expect(await labels()).toEqual([
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ]);
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  await rail.getByRole('button', { name: '3번째 사진 선택' }).click();
  expect(await labels()).toEqual([
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ]);
  expect(
    await rail
      .getByRole('button', { name: '3번째 사진 선택' })
      .evaluate((button) => {
        const selection = getComputedStyle(button, '::after');
        return {
          content: selection.content,
          inset: selection.inset,
          borderTopWidth: selection.borderTopWidth,
          borderRightWidth: selection.borderRightWidth,
          borderBottomWidth: selection.borderBottomWidth,
          borderLeftWidth: selection.borderLeftWidth,
          borderColor: selection.borderColor,
        };
      }),
  ).toEqual({
    content: '""',
    inset: '0px',
    borderTopWidth: '3px',
    borderRightWidth: '3px',
    borderBottomWidth: '3px',
    borderLeftWidth: '3px',
    borderColor: 'rgb(22, 119, 255)',
  });

  await next.click();
  await next.click();
  expect(await labels()).toEqual([
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
    '5번째 사진 선택',
  ]);
  await expect(
    rail.getByRole('button', { name: '5번째 사진 선택' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(next).toBeDisabled();

  await previous.click();
  await previous.click();
  await previous.click();
  expect(await labels()).toEqual([
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
    '5번째 사진 선택',
  ]);
  await previous.click();
  expect(await labels()).toEqual([
    '1번째 사진 선택',
    '2번째 사진 선택',
    '3번째 사진 선택',
    '4번째 사진 선택',
  ]);
  await expect(previous).toBeDisabled();
});

test('gallery lightbox navigation is finite and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(galleryPath);
  const rail = page.getByLabel('사진 선택');
  await expect(rail.locator('button')).toHaveCount(4);
  const boxes = await rail.locator('button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(
    boxes.every(
      (box, index) =>
        box.left >= 0 &&
        box.right <= viewportWidth &&
        (index === 0 || box.left > boxes[index - 1].left),
    ),
  ).toBe(true);

  await page.getByRole('button', { name: /1번째 사진 크게 보기/ }).click();
  const dialog = page.getByRole('dialog', { name: /사진 크게 보기/ });
  const previous = dialog.getByRole('button', { name: '이전 사진' });
  const next = dialog.getByRole('button', { name: '다음 사진' });
  await expect(previous).toBeDisabled();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog).toContainText('1 / 5');

  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press('ArrowRight');
  }
  await expect(dialog).toContainText('5 / 5');
  await expect(next).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('5 / 5');
});
