import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { postSchema } from '../../lib/schemas';

test('gallery post input is valid without a consent field', () => {
  const result = postSchema.safeParse({
    boardType: 'gallery',
    title: '여름 수련회',
    content: '',
    isPinned: false,
  });

  expect(result.success).toBe(true);
  if (!result.success) return;
  expect(Object.keys(result.data).sort()).toEqual([
    'boardType',
    'content',
    'isPinned',
    'title',
  ]);
});

test('post form and schema expose no consent field or checkbox', async () => {
  const source = await Promise.all(
    ['components/admin/PostForm.tsx', 'lib/schemas.ts'].map((file) =>
      readFile(path.join(process.cwd(), file), 'utf8'),
    ),
  );

  expect(source.join('\n')).not.toContain('consentConfirmed');
  expect(source[0].match(/type="checkbox"/g)).toHaveLength(1);
});

test('privacy sections remain sequential after section removal', async ({ page }) => {
  await page.goto('/privacy');

  const headings = await page.locator('h2').allTextContents();
  expect(headings).toHaveLength(5);
  expect(headings.map((heading) => Number.parseInt(heading, 10))).toEqual([1, 2, 3, 4, 5]);
});
