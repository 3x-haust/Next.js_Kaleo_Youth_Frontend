import { copyFile } from 'node:fs/promises';
import path from 'node:path';

const fonts = path.resolve('public/fonts');
const source = path.join(fonts, 'Paperlogy-4Regular.ttf');

await Promise.all(
  ['PD_deck.woff2', 'PD_rest.woff2', 'EXPR_Hahmlet_stmt.woff2'].map((alias) =>
    copyFile(source, path.join(fonts, alias)),
  ),
);
