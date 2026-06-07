#!/usr/bin/env node
// Generates public/icon-512.png, icon-192.png, favicon-32.png
// White-background opaque PNG — required for PWA maskable icons

const { PNG } = require('pngjs');
const fs   = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public');
fs.mkdirSync(OUT, { recursive: true });

// Colors (RGB)
const BLUE  = [91, 142, 197];   // #5b8ec5 — logo blue
const WHITE = [255, 255, 255];

function renderChip(SIZE) {
  const png  = new PNG({ width: SIZE, height: SIZE, filterType: -1 });
  const data = png.data;
  const cx = SIZE / 2, cy = SIZE / 2;

  // Radii
  const R_OUT  = SIZE * 0.468;
  const R_RING = SIZE * 0.405;
  const R_SEP  = SIZE * 0.370;
  const R_IN   = SIZE * 0.340;

  const NOTCHES = 12;
  const NOTCH_W = 0.40;

  // Floral params (relative to R_IN)
  const PD = R_IN * 0.44;   // petal center distance
  const PR = R_IN * 0.275;  // petal radius
  const SD = R_IN * 0.21;   // small petal dist
  const SR = R_IN * 0.145;  // small petal radius
  const CR = R_IN * 0.12;   // center dot radius
  const NP = 8;

  const AA = Math.max(1.5, SIZE * 0.003);
  function edge(d, r) { return Math.max(0, Math.min(1, (r + AA - d) / (2 * AA))); }

  function floralAt(dx, dy, d) {
    if (d <= CR) return true;
    for (let i = 0; i < NP; i++) {
      const a = (i * 2 * Math.PI) / NP;
      const ex = Math.cos(a) * PD - dx, ey = Math.sin(a) * PD - dy;
      if (ex*ex + ey*ey <= PR*PR) return true;
    }
    for (let i = 0; i < NP; i++) {
      const a = (i * 2 * Math.PI) / NP + Math.PI / NP;
      const ex = Math.cos(a) * SD - dx, ey = Math.sin(a) * SD - dy;
      if (ex*ex + ey*ey <= SR*SR) return true;
    }
    return false;
  }

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      const d  = Math.sqrt(dx*dx + dy*dy);
      const idx = (y * SIZE + x) * 4;

      // Always opaque white background
      let r = 255, g = 255, b = 255;

      const chipA = edge(d, R_OUT);
      if (chipA > 0) {
        let fg;

        if (d <= R_IN) {
          fg = floralAt(dx, dy, d) ? BLUE : WHITE;
          const innerA = edge(d, R_IN);
          r = Math.round(fg[0] * innerA + 255 * (1 - innerA));
          g = Math.round(fg[1] * innerA + 255 * (1 - innerA));
          b = Math.round(fg[2] * innerA + 255 * (1 - innerA));
        } else if (d <= R_SEP) {
          // White separator
          fg = WHITE;
          r = fg[0]; g = fg[1]; b = fg[2];
        } else {
          // Chip ring with notches
          const angle = Math.atan2(dy, dx);
          const step  = (2 * Math.PI) / NOTCHES;
          const mod   = ((angle % step) + step) % step;
          const half  = NOTCH_W * step * 0.5;
          fg = (mod < half || mod > step - half) ? WHITE : BLUE;
          // blend ring edge to white background
          r = Math.round(fg[0] * chipA + 255 * (1 - chipA));
          g = Math.round(fg[1] * chipA + 255 * (1 - chipA));
          b = Math.round(fg[2] * chipA + 255 * (1 - chipA));
        }
      }

      data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
    }
  }
  return png;
}

for (const [size, name] of [[512, 'icon-512.png'], [192, 'icon-192.png'], [32, 'favicon-32.png']]) {
  const buf = PNG.sync.write(renderChip(size));
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`✓ public/${name} (${buf.length} bytes)`);
}
