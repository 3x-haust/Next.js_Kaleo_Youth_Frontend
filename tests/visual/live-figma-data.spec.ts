import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { FIGMA_DATA_FRAMES } from './figma-data-manifest';
import { liveFigmaRoute } from './live-figma-routes';
import { userContractBox } from './user-contract-overrides';

const styleKeys = [
  'backdropFilter',
  'backgroundColor',
  'backgroundImage',
  'border',
  'borderRadius',
  'boxShadow',
  'color',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'gap',
  'letterSpacing',
  'lineHeight',
  'objectFit',
  'opacity',
] as const;
const evidenceStage = process.env.FIDELITY_EVIDENCE_STAGE ?? 'red';
const geometryTolerance = 0.5;
const numericTolerance = 0.05;
const sharedNavigationNodes = new Set([
  'App Bar',
  'Logo',
  'Logo Container',
  'Menu List',
]);

function cssValuesMatch(expected: string, actual: string): boolean {
  if (expected === actual) return true;
  const pattern = /-?\d+(?:\.\d+)?/g;
  const expectedNumbers = expected.match(pattern)?.map(Number) ?? [];
  const actualNumbers = actual.match(pattern)?.map(Number) ?? [];
  if (
    expectedNumbers.length === 0 ||
    expectedNumbers.length !== actualNumbers.length ||
    expected.replace(pattern, '#') !== actual.replace(pattern, '#')
  ) return false;
  return expectedNumbers.every(
    (value, index) => Math.abs(value - actualNumbers[index]) <= numericTolerance,
  );
}

function primaryFontFamily(value: string): string | undefined {
  const family = value.split(',')[0]?.replaceAll('"', '');
  return family === 'Paperlogy Exact' ? 'Paperlogy' : family;
}

function selectorForNode(name: string): string | undefined {
  if (name === 'Menu List') return '[data-zone="global-nav"] nav';
  if (name === 'Images Container') return '[data-zone="setlist-images"]';
  if (name === 'Team Eyebrow') return '[data-zone="about-team-eyebrow"]';
  if (name === 'Hero Meta') return '[data-zone="sermon-hero-meta"] span';
  if (name === 'Closing Statement') return '[data-zone="about-closing-statement"]';
  const gallery = name.match(/^Gallery (Caption|Title|Date) (\d+)$/);
  if (gallery) {
    return `[data-gallery-${gallery[1]?.toLowerCase()}="${gallery[2]}"]`;
  }
  const recent = name.match(/^Recent Image (\d+)$/);
  if (recent) return `[data-recent-image="${recent[1]}"]`;
  const thumbnail = name.match(/^Thumbnail (\d+)$/);
  return thumbnail
    ? `[aria-label="사진 선택"] li:nth-child(${thumbnail[1]}) button`
    : undefined;
}

for (const frame of FIGMA_DATA_FRAMES) {
  test(`${frame.frameId} live route matches exact Figma node data`, async ({ page }) => {
    await page.setViewportSize(frame.viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(liveFigmaRoute(frame.frameId), { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('400 22px "Paperlogy"'),
        document.fonts.load('500 22px "Paperlogy"'),
        document.fonts.load('600 22px "Paperlogy"'),
        document.fonts.load('700 22px "Paperlogy"'),
        document.fonts.load('900 22px "Paperlogy"'),
      ]);
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => image.decode().catch(() => undefined)),
      );
    });

    const expectations = frame.nodes
      .filter((node) => frame.frameId === '63:6' || !sharedNavigationNodes.has(node.name))
      .map((node) => ({
      nodeId: node.nodeId,
      name: node.name,
      text: node.text,
      expectedBox: userContractBox(node.nodeId, node.box),
      expectedStyles: node.styles,
      selector: selectorForNode(node.name),
      }));
    const observed = await page.evaluate(
      ({ items, keys }) => {
        const candidates = [...document.body.querySelectorAll<HTMLElement>('*')];
        const boxOf = (element: HTMLElement) => {
          const box = element.getBoundingClientRect();
          return {
            x: Number((box.left + scrollX).toFixed(3)),
            y: Number((box.top + scrollY).toFixed(3)),
            width: Number(box.width.toFixed(3)),
            height: Number(box.height.toFixed(3)),
          };
        };
        const distance = (
          actual: { x: number; y: number; width: number; height: number },
          expected: { x: number; y: number; width: number; height: number },
        ) =>
          Math.abs(actual.x - expected.x) +
          Math.abs(actual.y - expected.y) +
          Math.abs(actual.width - expected.width) +
          Math.abs(actual.height - expected.height);
        const closest = (
          expectedBox: { x: number; y: number; width: number; height: number },
          text?: string,
        ) => {
          const normalizedText = text?.replace(/\s+/g, ' ').trim();
          return candidates
            .filter((candidate) => {
              if (normalizedText === undefined) return true;
              return (candidate.innerText ?? '').replace(/\s+/g, ' ').trim() === normalizedText;
            })
            .map((candidate) => ({ candidate, value: distance(boxOf(candidate), expectedBox) }))
            .sort((left, right) => left.value - right.value)[0]?.candidate;
        };
        return items.map((item) => {
          const element = item.selector
            ? document.querySelector<HTMLElement>(item.selector)
            : closest(item.expectedBox, item.text);
          if (!element) return { nodeId: item.nodeId, box: null, styles: null };
          const computed = getComputedStyle(element);
          return {
            nodeId: item.nodeId,
            box: boxOf(element),
            styles: Object.fromEntries(keys.map((key) => [key, computed[key]])),
          };
        });
      },
      { items: expectations, keys: styleKeys },
    );

    const results = expectations.map((expected) => {
      const actual = observed.find((entry) => entry.nodeId === expected.nodeId);
      const differences: string[] = [];
      if (!actual?.box || !actual.styles) {
        differences.push('authored node is missing from the live DOM');
      } else {
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          if (Math.abs(expected.expectedBox[key] - actual.box[key]) > geometryTolerance) {
            differences.push(
              `${key}: expected ${expected.expectedBox[key]}, received ${actual.box[key]}`,
            );
          }
        }
        for (const key of styleKeys) {
          const expectedValue = expected.expectedStyles?.[key];
          if (expectedValue === undefined) continue;
          const actualValue = actual.styles[key] ?? '';
          const matches =
            key === 'fontFamily'
              ? primaryFontFamily(actualValue) === expectedValue
              : cssValuesMatch(expectedValue, actualValue);
          if (!matches) {
            differences.push(`${key}: expected ${expectedValue}, received ${actualValue}`);
          }
        }
      }
      return {
        nodeId: expected.nodeId,
        name: expected.name,
        passed: differences.length === 0,
        differences,
        expected: expected.expectedBox,
        actual: actual?.box ?? null,
      };
    });
    const report = {
      frameId: frame.frameId,
      route: liveFigmaRoute(frame.frameId),
      tolerance: geometryTolerance,
      totalNodes: results.length,
      passedNodes: results.filter((result) => result.passed).length,
      failedNodes: results.filter((result) => !result.passed).length,
      results,
    };
    const outputDirectory = path.join(
      '.omo',
      'evidence',
      'ulw-all-pages',
      evidenceStage,
      'figma-data',
      frame.frameId.replace(':', '-'),
    );
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      path.join(outputDirectory, 'report.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    );

    expect(
      results.filter((result) => !result.passed),
      JSON.stringify(report, null, 2),
    ).toEqual([]);
  });
}
