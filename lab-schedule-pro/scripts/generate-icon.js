#!/usr/bin/env node
/**
 * Generates build/icon.png and build/icon.ico for Electron Builder.
 * Uses pngjs (pure JS) + png-to-ico — no native deps.
 */
import { PNG } from 'pngjs';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

function drawIcon(size) {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const cx = size / 2, cy = size / 2, r = size * 0.45;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist > r) {
        // Transparent outside circle
        png.data[idx]     = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        continue;
      }

      // Gradient background: dark blue center → bright blue edge
      const t = dist / r;
      png.data[idx]     = Math.round(13  + t * (0   - 13));   // R
      png.data[idx + 1] = Math.round(33  + t * (112 - 33));   // G
      png.data[idx + 2] = Math.round(55  + t * (243 - 55));   // B
      png.data[idx + 3] = 255;

      // Draw white "L" letter in center
      const lx = Math.floor(x / size * 10);
      const ly = Math.floor(y / size * 10);
      // Letter L occupies roughly grid cells (3-5, 2-8)
      const isL = (lx === 3 || lx === 4) && (ly >= 2 && ly <= 8)  // vertical stroke
               || (ly === 7 || ly === 8) && (lx >= 3 && lx <= 7); // horizontal stroke

      if (isL) {
        png.data[idx]     = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 230;
      }
    }
  }

  return PNG.sync.write(png);
}

const sizes = [16, 32, 48, 64, 128, 256];
const pngBuffers = sizes.map(s => drawIcon(s));

// Save the 256×256 as icon.png
const pngPath = path.join(buildDir, 'icon.png');
fs.writeFileSync(pngPath, pngBuffers[pngBuffers.length - 1]);
console.log('✔ icon.png written');

// Convert all sizes to ICO
try {
  const icoBuffer = await pngToIco(pngBuffers);
  const icoPath = path.join(buildDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✔ icon.ico written');
} catch (e) {
  // Fallback: copy 256px PNG as ICO (electron-builder may convert it)
  fs.copyFileSync(pngPath, path.join(buildDir, 'icon.ico'));
  console.warn('⚠  png-to-ico failed, copied PNG as ICO fallback:', e.message);
}
