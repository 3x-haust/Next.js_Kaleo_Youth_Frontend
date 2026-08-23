import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const frontendRoot = process.cwd();
const frontendEvidence = path.join(frontendRoot, '.omo/evidence');
const rootEvidence = path.resolve(frontendRoot, '../.omo/evidence');

for (const directory of ['admin-e2e', 'sentinel']) {
  const source = path.join(frontendEvidence, directory);
  const target = path.join(rootEvidence, directory);
  await rm(target, { recursive: true, force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

const files = [
  'animations.json',
  'asset-audit.json',
  'asset-export-receipts.json',
  'ulw-final/pixel-fidelity.json',
  'admin-e2e/transcript.json',
  'admin-e2e/run.txt',
  'admin-e2e/run.exit',
  'sentinel/sentinel.json',
  'sentinel/run.txt',
  'sentinel/run.exit',
  'final/playwright-94.json',
  'final/frontend-lint.txt',
  'final/frontend-lint.exit',
  'final/frontend-build.txt',
  'final/frontend-build.exit',
  'final/backend-lint.txt',
  'final/backend-lint.exit',
  'final/backend-build.txt',
  'final/backend-build.exit',
  'final/backend-unit.txt',
  'final/backend-unit.exit',
  'final/backend-e2e.txt',
  'final/backend-e2e.exit',
];

for (const relative of files) {
  const source = path.join(frontendEvidence, relative);
  const target = path.join(rootEvidence, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

for (const stale of ['animations-run.txt', 'asset-audit-run.txt']) {
  await Promise.all([
    rm(path.join(frontendEvidence, stale), { force: true }),
    rm(path.join(rootEvidence, stale), { force: true }),
  ]);
}

const pixel = JSON.parse(
  await readFile(path.join(frontendEvidence, 'ulw-final/pixel-fidelity.json'), 'utf8'),
);
const animation = JSON.parse(
  await readFile(path.join(frontendEvidence, 'animations.json'), 'utf8'),
);
const assets = JSON.parse(
  await readFile(path.join(frontendEvidence, 'asset-audit.json'), 'utf8'),
);
const playwright = JSON.parse(
  await readFile(path.join(frontendEvidence, 'final/playwright-94.json'), 'utf8'),
);
const summary = {
  synchronizedAt: new Date().toISOString(),
  pixel: pixel.summary,
  animation: animation.summary,
  assets: {
    total: assets.assetCount,
    pass: assets.passCount,
    fail: assets.failCount,
  },
  playwright: playwright.stats,
};
await Promise.all([
  writeFile(
    path.join(frontendEvidence, 'final/evidence-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  ),
  writeFile(
    path.join(rootEvidence, 'final/evidence-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  ),
]);
