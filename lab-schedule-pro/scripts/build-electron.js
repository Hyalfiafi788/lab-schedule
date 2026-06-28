#!/usr/bin/env node
/**
 * Bundles the Electron main-process TypeScript files with esbuild.
 * Output goes to electron/dist/ as .cjs files (CommonJS) so Electron
 * can load them even when the root package.json has "type":"module".
 */
import { build } from 'esbuild';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'electron', 'dist');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
  outdir: outDir,
  external: [
    'electron',
    'better-sqlite3',
    'electron-log',
  ],
  sourcemap: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV !== 'development',
  logLevel: 'info',
};

await Promise.all([
  build({
    ...sharedConfig,
    entryPoints: [join(root, 'electron', 'main.ts')],
  }),
  build({
    ...sharedConfig,
    entryPoints: [join(root, 'electron', 'preload.ts')],
  }),
]);

// Copy splash.html into electron/dist so packaged app can find it
copyFileSync(
  join(root, 'electron', 'splash.html'),
  join(outDir, 'splash.html')
);

console.log('✔ Electron main process bundled → electron/dist/');
