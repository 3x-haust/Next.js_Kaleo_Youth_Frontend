import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

interface PixelDiffResult {
  readonly mismatchPixels: number;
  readonly mismatchRatio: number;
  readonly actualWidth: number;
  readonly actualHeight: number;
  readonly referenceWidth: number;
  readonly referenceHeight: number;
}

export async function comparePng(
  actualBytes: Buffer,
  referenceBytes: Buffer,
  outputDirectory: string,
): Promise<PixelDiffResult> {
  const actual = PNG.sync.read(actualBytes);
  const reference = PNG.sync.read(referenceBytes);
  if (actual.width !== reference.width || actual.height !== reference.height) {
    throw new Error(
      `Image dimensions differ: actual ${actual.width}x${actual.height}, reference ${reference.width}x${reference.height}`,
    );
  }
  const { width, height } = actual;
  const diff = new PNG({ width, height });
  const mismatchPixels = pixelmatch(
    actual.data,
    reference.data,
    diff.data,
    width,
    height,
    { threshold: 0.15, includeAA: false },
  );

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, 'actual.png'), actualBytes),
    writeFile(path.join(outputDirectory, 'diff.png'), PNG.sync.write(diff)),
  ]);

  const result = {
    mismatchPixels,
    mismatchRatio: mismatchPixels / (width * height),
    actualWidth: actual.width,
    actualHeight: actual.height,
    referenceWidth: reference.width,
    referenceHeight: reference.height,
  };
  await writeFile(path.join(outputDirectory, 'report.json'), JSON.stringify(result, null, 2));
  return result;
}
