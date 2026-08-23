import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.join(root, 'public/images/gallery');
const outputDir = path.join(sourceDir, 'sanitized');

await mkdir(outputDir, { recursive: true });

for (const index of [1, 3, 4]) {
  await sharp(path.join(sourceDir, `design-story-${index}.jpg`))
    .rotate()
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .toFile(path.join(outputDir, `design-story-${index}.jpg`));
}

const semanticDir = path.join(sourceDir, 'semantic');
await mkdir(semanticDir, { recursive: true });

await sharp(path.join(sourceDir, 'exact-home', 'container-98-3098.png'))
  .extract({ left: 1, top: 1, width: 450, height: 395 })
  .png()
  .toFile(path.join(semanticDir, 'home-card-2-photo.png'));

for (const nodeId of [
  '5637',
  '5712',
  '5719',
  '5767',
  '5773',
  '5779',
  '5787',
  '5793',
  '5799',
]) {
  await sharp(path.join(sourceDir, 'exact', `image-110-${nodeId}.png`))
    .extract({ left: 1, top: 1, width: 554, height: 295 })
    .png()
    .toFile(path.join(semanticDir, `image-110-${nodeId}-photo.png`));

  const { data, info } = await sharp(
    path.join(sourceDir, 'exact', `image-110-${nodeId}.png`),
  )
    .extract({ left: 1, top: 1, width: 554, height: 400 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const output = Buffer.from(data);
  const mask = new Uint8Array(info.width * info.height);
  for (const [left, top, width, height] of [
    [29, 314, 496, 37],
    [29, 355, 496, 26],
  ]) {
    for (let y = top; y < top + height; y += 1) {
      for (let x = left; x < left + width; x += 1) {
        const offset = (y * info.width + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        if (
          red > 210 &&
          Math.abs(red - green) < 15 &&
          Math.abs(green - blue) < 15
        ) {
          mask[y * info.width + x] = 1;
        }
      }
    }
  }
  for (let y = 314; y < 381; y += 1) {
    for (let x = 29; x < 525; x += 1) {
      if (!mask[y * info.width + x]) continue;
      const samples = [];
      for (let radius = 1; radius <= 12 && samples.length < 4; radius += 1) {
        for (const [sampleX, sampleY] of [
          [x - radius, y],
          [x + radius, y],
          [x, y - radius],
          [x, y + radius],
        ]) {
          if (
            sampleX < 0 ||
            sampleX >= info.width ||
            sampleY < 0 ||
            sampleY >= info.height ||
            mask[sampleY * info.width + sampleX]
          )
            continue;
          samples.push((sampleY * info.width + sampleX) * 4);
        }
      }
      const target = (y * info.width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        output[target + channel] = Math.round(
          samples.reduce((sum, offset) => sum + data[offset + channel], 0) /
            samples.length,
        );
      }
    }
  }
  await sharp(output, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path.join(semanticDir, `image-110-${nodeId}-background.png`));
}
