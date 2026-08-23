import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { FIGMA_DATA_FRAMES, type FigmaStyles } from './figma-data-manifest';
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

function primaryFontFamily(value: string): string {
  const family = value.split(',')[0]?.replaceAll('"', '');
  return family === 'Paperlogy Exact' ? 'Paperlogy' : family;
}

function compareStyles(
  expected: Partial<FigmaStyles> | undefined,
  actual: Record<string, string>,
): string[] {
  const differences: string[] = [];
  if (!expected) return differences;
  for (const key of styleKeys) {
    const value = expected[key];
    if (value === undefined) continue;
    const matches =
      key === 'fontFamily'
        ? primaryFontFamily(actual[key]) === value
        : cssValuesMatch(value, actual[key] ?? '');
    if (!matches)
      differences.push(
        `${key}: expected ${value}, received ${actual[key] ?? ''}`,
      );
  }
  return differences;
}

function compareBox(
  expected: { x: number; y: number; width: number; height: number },
  actual: { x: number; y: number; width: number; height: number },
  tolerance: number,
): string[] {
  const differences: string[] = [];
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    if (Math.abs(expected[key] - actual[key]) > tolerance) {
      differences.push(
        `${key}: expected ${expected[key]}, received ${actual[key]}`,
      );
    }
  }
  return differences;
}

function selectorForNode(name: string): string | undefined {
  if (name === 'Menu List') return '[data-zone="global-nav"] nav';
  if (name === 'Images Container') return '[data-zone="setlist-images"]';
  if (name === 'Team Eyebrow') return '[data-zone="about-team-eyebrow"]';
  if (name === 'Hero Meta') return '[data-zone="sermon-hero-meta"] span';
  if (name === 'Closing Statement')
    return '[data-zone="about-closing-statement"]';
  const gallery = name.match(/^Gallery (Caption|Title|Date) (\d+)$/);
  if (gallery) {
    return `[data-gallery-${gallery[1]?.toLowerCase()}="${gallery[2]}"]`;
  }
  const recent = name.match(/^Recent Image (\d+)$/);
  if (recent) return `[data-recent-image="${recent[1]}"]`;
  const thumbnail = name.match(/^Thumbnail (\d+)$/);
  if (thumbnail) return `[aria-label="사진 선택"] li:nth-child(${thumbnail[1]}) button`;
  return undefined;
}

for (const frame of FIGMA_DATA_FRAMES) {
  test(`${frame.frameId} renders the authored Figma values`, async ({ page }) => {
    await page.setViewportSize(frame.viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(liveFigmaRoute(frame.frameId), { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>('[data-reduced-motion]'),
      ).every((element) => {
        const transform = getComputedStyle(element).transform;
        return transform === 'none' || new DOMMatrixReadOnly(transform).m42 === 0;
      }),
    );
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
        Array.from(document.images, (image) =>
          image.complete
            ? image.decode().catch(() => undefined)
            : Promise.resolve(),
        ),
      );
    });

    const checks = frame.nodes
      .filter((node) => frame.frameId === '63:6' || !sharedNavigationNodes.has(node.name))
      .map((node) => ({
      nodeId: node.nodeId,
      text: node.text,
      expectedBox: userContractBox(node.nodeId, node.box),
      expectedStyles: node.styles,
      selector: selectorForNode(node.name),
      }));

    const observed = await page.evaluate(
      ({ items, keys }) => {
        const candidates = Array.from(
          document.body.querySelectorAll<HTMLElement>('*'),
        );
        const boxOf = (element: HTMLElement) => {
          const box = element.getBoundingClientRect();
          return {
            x: Number((box.left + scrollX).toFixed(3)),
            y: Number((box.top + scrollY).toFixed(3)),
            width: Number(box.width.toFixed(3)),
            height: Number(box.height.toFixed(3)),
          };
        };
        const boxDistance = (
          actual: { x: number; y: number; width: number; height: number },
          expected: { x: number; y: number; width: number; height: number },
        ) =>
          Math.abs(actual.x - expected.x) +
          Math.abs(actual.y - expected.y) +
          Math.abs(actual.width - expected.width) +
          Math.abs(actual.height - expected.height);
        const byText = (
          expected: string,
          expectedBox: { x: number; y: number; width: number; height: number },
        ): HTMLElement | null => {
          const needle = expected.replace(/\s+/g, ' ').trim();
          let found: HTMLElement | null = null;
          let closestDistance = Number.POSITIVE_INFINITY;
          for (const node of candidates) {
            const text = (node.innerText ?? '').replace(/\s+/g, ' ').trim();
            if (text === needle) {
              const distance = boxDistance(boxOf(node), expectedBox);
              if (distance < closestDistance) {
                closestDistance = distance;
                found = node;
              }
            }
          }
          return found;
        };
        const byBox = (expected: {
          x: number;
          y: number;
          width: number;
          height: number;
        }): HTMLElement | null => {
          let closest: HTMLElement | null = null;
          let closestDistance = Number.POSITIVE_INFINITY;
          for (const candidate of candidates) {
            const box = boxOf(candidate);
            const distance = boxDistance(box, expected);
            if (distance < closestDistance) {
              closest = candidate;
              closestDistance = distance;
            }
          }
          return closest;
        };
        return items.map((item) => {
          const element = item.selector
            ? document.querySelector<HTMLElement>(item.selector)
            : item.text === undefined
              ? byBox(item.expectedBox)
              : byText(item.text, item.expectedBox);
          if (!element) {
            return {
              nodeId: item.nodeId,
              matched: false,
              box: null,
              styles: null,
            };
          }
          const computed = getComputedStyle(element);
          return {
            nodeId: item.nodeId,
            matched: true,
            box: boxOf(element),
            styles: Object.fromEntries(
              keys.map((key) => [key, computed[key]]),
            ),
          };
        });
      },
      { items: checks, keys: styleKeys },
    );

    const results = checks.map((check) => {
      const actual = observed.find((entry) => entry.nodeId === check.nodeId);
      const differences: string[] = [];
      if (!actual?.matched) {
        differences.push('authored node is missing from the DOM');
      } else {
        if (actual.box) {
          differences.push(
            ...compareBox(check.expectedBox, actual.box, Math.max(frame.tolerance, 0.5)),
          );
        }
        if (actual.styles) {
          differences.push(
            ...compareStyles(
              check.expectedStyles,
              actual.styles,
            ),
          );
        }
      }
      return {
        nodeId: check.nodeId,
        name: frame.nodes.find((node) => node.nodeId === check.nodeId)?.name ?? '',
        passed: differences.length === 0,
        differences,
        expected: {
          text: check.text,
          box: check.expectedBox,
          styles: check.expectedStyles,
        },
        actual: actual
          ? {
              matched: actual.matched,
              box: actual.box,
              styles: actual.styles,
            }
          : null,
      };
    });

    const passedNodes = results.filter((result) => result.passed).length;
    const report = {
      frameId: frame.frameId,
      source: frame.source,
      totalNodes: results.length,
      passedNodes,
      failedNodes: results.length - passedNodes,
      valueMatchRatio: results.length === 0 ? 0 : passedNodes / results.length,
      results,
    };
    const evidenceDir = path.join(
      '.omo',
      'evidence',
      'figma-data',
      frame.frameId.replace(':', '-'),
    );
    const rootEvidenceDir = path.join(
      '..',
      '.omo',
      'evidence',
      'figma-data',
      frame.frameId.replace(':', '-'),
    );
    await mkdir(evidenceDir, { recursive: true });
    await mkdir(rootEvidenceDir, { recursive: true });
    const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
    await Promise.all([
      writeFile(path.join(evidenceDir, 'report.json'), serializedReport),
      writeFile(path.join(rootEvidenceDir, 'report.json'), serializedReport),
    ]);

    expect(
      results.filter((result) => !result.passed),
      JSON.stringify(report, null, 2),
    ).toEqual([]);
  });
}
