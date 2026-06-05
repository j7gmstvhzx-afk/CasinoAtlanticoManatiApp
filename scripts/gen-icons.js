#!/usr/bin/env node
// Generates public/icon-512.png and public/icon-192.png
// Design: casino poker chip matching Casino Atlántico Manatí blue logo

const { PNG } = require('pngjs');
const fs   = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public');
fs.mkdirSync(OUT, { recursive: true });

// Logo blue: #5b8ec5   Navy: #1a2332
const CHIP_BLUE = [91, 142, 197];
const WHITE     = [255, 255, 255];
const LIGHT_BG  = [240, 244, 250]; // very light blue-gray background inside chip

function renderChip(SIZE) {
  const png  = new PNG({ width: SIZE, height: SIZE, filterType: -1 });
  const data = png.data;
  const cx   = SIZE / 2, cy = SIZE / 2;

  // All radii as pixel values
  const R_OUT  = SIZE * 0.468; // outer chip edge
  const R_RING = SIZE * 0.410; // inside edge of chip ring
  const R_SEP  = SIZE * 0.375; // outer edge of white separator gap
  const R_IN   = SIZE * 0.345; // inner circle

  const NOTCHES    = 12;
  const NOTCH_W    = 0.42; // fraction of each segment taken by white notch

  // Floral parameters (relative to R_IN)
  const PETAL_DIST  = R_IN * 0.44;
  const PETAL_R     = R_IN * 0.27;
  const INNER_DIST  = R_IN * 0.21;
  const INNER_R     = R_IN * 0.14;
  const CENTER_R    = R_IN * 0.12;
  const N           = 8; // number of petals

  // Smooth edge: 1 inside, 0 outside, anti-aliased over 1.5px
  const AA = Math.max(1.5, SIZE * 0.003);
  function edgeFactor(d, r) {
    return Math.max(0, Math.min(1, (r + AA - d) / (2 * AA)));
  }

  // Blend fg onto bg with weight α ∈ [0,1], pre-composited to white
  function blendOnWhite(fg, α) {
    return [
      Math.round(fg[0] * α + 255 * (1 - α)),
      Math.round(fg[1] * α + 255 * (1 - α)),
      Math.round(fg[2] * α + 255 * (1 - α)),
    ];
  }

  function inFloral(dx, dy, d) {
    if (d <= CENTER_R) return true;
    for (let i = 0; i < N; i++) {
      const a = (i * 2 * Math.PI) / N;
      const px = Math.cos(a) * PETAL_DIST - dx;
      const py = Math.sin(a) * PETAL_DIST - dy;
      if (px*px + py*py <= PETAL_R * PETAL_R) return true;
    }
    for (let i = 0; i < N; i++) {
      const a = (i * 2 * Math.PI) / N + Math.PI / N;
      const px = Math.cos(a) * INNER_DIST - dx;
      const py = Math.sin(a) * INNER_DIST - dy;
      if (px*px + py*py <= INNER_R * INNER_R) return true;
    }
    return false;
  }

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      const d  = Math.sqrt(dx*dx + dy*dy);
      const idx = (y * SIZE + x) * 4;

      // Outer chip boundary alpha (handles the round edge)
      const chipA = edgeFactor(d, R_OUT);

      let r = 255, g = 255, b = 255, a = 0;

      if (chipA > 0) {
        let color;

        if (d <= R_IN) {
          // Inner circle: white background with blue floral
          const floralA = edgeFactor(d, R_IN);
          color = inFloral(dx, dy, d) ? CHIP_BLUE : WHITE;
          // soft-clip the edge of the inner circle
          const bg = LIGHT_BG;
          color = [
            Math.round(color[0] * floralA + bg[0] * (1 - floralA)),
            Math.round(color[1] * floralA + bg[1] * (1 - floralA)),
            Math.round(color[2] * floralA + bg[2] * (1 - floralA)),
          ];

        } else if (d <= R_SEP) {
          // White separator / gap between inner circle and ring
          color = WHITE;

        } else {
          // Chip ring: blue with white rectangular notches
          const angle  = Math.atan2(dy, dx);
          const step   = (2 * Math.PI) / NOTCHES;
          const mod    = ((angle % step) + step) % step;
          const half   = NOTCH_W * step * 0.5;
          const notch  = mod < half || mod > step - half;
          color = notch ? WHITE : CHIP_BLUE;
        }

        const finalA = chipA;
        r = Math.round(color[0] * finalA + 255 * (1 - finalA));
        g = Math.round(color[1] * finalA + 255 * (1 - finalA));
        b = Math.round(color[2] * finalA + 255 * (1 - finalA));
        a = Math.round(finalA * 255);
      }

      data[idx]     = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  return png;
}

const sizes = [
  { size: 512, name: 'icon-512.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 32,  name: 'favicon-32.png' },
];

for (const { size, name } of sizes) {
  const png = renderChip(size);
  const buf = PNG.sync.write(png);
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`✓ public/${name} (${buf.length} bytes)`);
}
