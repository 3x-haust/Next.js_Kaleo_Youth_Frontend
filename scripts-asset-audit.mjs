import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const origin = process.env.ASSET_AUDIT_ORIGIN ?? 'http://localhost:3000';
const routes = [
  '/',
  '/about',
  '/events',
  '/sermons',
  '/sermons/11111111-1111-4111-8111-111111111111',
  '/share/gallery',
  '/share/gallery/33333333-3333-4333-8333-333333333361',
  '/jteen/setlists/44444444-4444-4444-8444-444444444441',
  '/jteen/setlists/44444444-4444-4444-8444-444444444442',
];
const receiptFile = '.omo/evidence/asset-export-receipts.json';
const receipts = JSON.parse(await readFile(receiptFile, 'utf8')).receipts;
const receiptByReference = new Map(
  receipts.map((receipt) => [receipt.reference, receipt]),
);
const observed = new Map();

function localReference(source) {
  const url = new URL(source, origin);
  if (url.pathname === '/_next/image') {
    const nested = url.searchParams.get('url');
    return nested ? new URL(nested, origin).pathname : null;
  }
  return url.origin === origin ? url.pathname : null;
}

function observe(reference, width, height) {
  if (!reference || reference.startsWith('/uploads/')) return;
  const current = observed.get(reference) ?? { width: 0, height: 0 };
  observed.set(reference, {
    width: Math.max(current.width, width),
    height: Math.max(current.height, height),
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const route of routes) {
  await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; y <= maximum; y += innerHeight * 0.75) {
      scrollTo(0, Math.min(y, maximum));
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }
    await Promise.race([
      Promise.all([...document.images].map((image) => image.decode().catch(() => undefined))),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Asset decode timeout')), 15_000),
      ),
    ]);
    scrollTo(0, 0);
  });
  const assets = await page.evaluate(() => {
    const values = [];
    for (const image of document.images) {
      if (image.getAttribute('aria-hidden') === 'true') continue;
      const box = image.getBoundingClientRect();
      values.push({ source: image.currentSrc || image.src, width: box.width, height: box.height });
    }
    return values;
  });
  for (const asset of assets) {
    observe(localReference(asset.source), asset.width, asset.height);
  }
}
await browser.close();

const failures = [];
const assets = [];
for (const [reference, rendered] of [...observed].sort(([left], [right]) => left.localeCompare(right))) {
  if (!/\.(?:png|jpe?g|webp)$/i.test(reference)) continue;
  const file = path.join('public', reference);
  let input;
  try {
    input = await readFile(file);
  } catch {
    failures.push({ reference, reason: 'local-raster-missing' });
    continue;
  }
  const metadata = await sharp(input).metadata();
  const natural = { width: metadata.width ?? 0, height: metadata.height ?? 0 };
  const receipt = receiptByReference.get(reference);
  const sha256 = createHash('sha256').update(input).digest('hex');
  const receiptValid =
    receipt?.sha256 === sha256 &&
    receipt?.dimensions?.[0] === natural.width &&
    receipt?.dimensions?.[1] === natural.height;
  const native2x =
    natural.width >= rendered.width * 2 - 1 &&
    natural.height >= rendered.height * 2 - 1;
  const passed = native2x || receiptValid;
  const result = { reference, rendered, natural, native2x, receiptValid, passed };
  assets.push(result);
  if (!passed) {
    failures.push({
      ...result,
      reason: 'raster-below-2x-and-no-figma-receipt',
    });
  }
}

const report = { origin, routeCount: routes.length, assetCount: assets.length, failCount: failures.length, failures, assets };
await writeFile(
  '.omo/evidence/rebuild-green/system/asset-audit.json',
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify({ assetCount: assets.length, failCount: failures.length }));
if (failures.length > 0) process.exitCode = 1;
