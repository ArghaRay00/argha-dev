// Generates Excalidraw-aesthetic SVGs for the cache series using rough.js,
// the same library Excalidraw uses internally for the hand-drawn look.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rough = require('roughjs/bundled/rough.cjs.js');
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'public', 'assets', 'blog');

const gen = rough.generator();

const PALETTE = {
  ink: '#1e1e1e',
  yellow: '#ffec99',
  orange: '#ffd8a8',
  red: '#ffc9c9',
  blue: '#a5d8ff',
  green: '#b2f2bb',
  purple: '#d0bfff',
  bg: '#f8f5ee',         // cream / parchment — works in light and dark mode
  axis: '#1e1e1e',
  redInk: '#c92a2a',
  blueInk: '#1864ab',
  greenInk: '#2b8a3e',
  redLight: '#ffd6d6',
  greenLight: '#c3edcd',
};

const FONT = "'Virgil', 'Caveat', 'Kalam', 'Comic Sans MS', cursive";

function opsToPath(ops) {
  let d = '';
  for (const op of ops) {
    if (op.op === 'move') d += `M${op.data[0]} ${op.data[1]} `;
    else if (op.op === 'lineTo') d += `L${op.data[0]} ${op.data[1]} `;
    else if (op.op === 'bcurveTo')
      d += `C${op.data[0]} ${op.data[1]}, ${op.data[2]} ${op.data[3]}, ${op.data[4]} ${op.data[5]} `;
  }
  return d.trim();
}

function drawableToSvg(drawable, opts = {}) {
  const stroke = opts.stroke || '#1e1e1e';
  const strokeWidth = opts.strokeWidth ?? 1.5;
  const fill = opts.fill || 'transparent';
  const strokeStyle = opts.strokeStyle === 'dashed' ? `stroke-dasharray="6 6"` : '';
  // For fillSketch (hachure lines) default to a visible 1.5px stroke even if the
  // shape's outer stroke-width is 0 — otherwise hachure fills disappear.
  const fillStrokeWidth = opts.fillWeight ?? Math.max(strokeWidth, 1.5);
  let out = '';
  for (const set of drawable.sets) {
    const d = opsToPath(set.ops);
    if (set.type === 'path') {
      out += `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${strokeStyle}/>\n`;
    } else if (set.type === 'fillPath') {
      out += `<path d="${d}" stroke="none" fill="${fill}" fill-rule="evenodd"/>\n`;
    } else if (set.type === 'fillSketch') {
      out += `<path d="${d}" stroke="${fill}" stroke-width="${fillStrokeWidth}" fill="none" stroke-linecap="round"/>\n`;
    }
  }
  return out;
}

const baseRoughOpts = (overrides = {}) => ({
  roughness: 2.4,
  bowing: 2.5,
  strokeWidth: 2.2,
  fillStyle: 'hachure',
  fillWeight: 1.6,
  hachureGap: 4.5,
  hachureAngle: -41,
  ...overrides,
});

function rect(x, y, w, h, fill, opts = {}) {
  const d = gen.rectangle(x, y, w, h, baseRoughOpts({ fill, roughness: 1.8, ...opts }));
  return drawableToSvg(d, { stroke: PALETTE.ink, strokeWidth: 2.2, fill });
}

function line(x1, y1, x2, y2, opts = {}) {
  // For chart data lines and axes we want SUBTLE roughness — a single wobbly stroke,
  // not the doubled-parallel-line look that rough.js produces by default for straight segments.
  const r = opts.roughness ?? 1.1;
  const d = gen.line(x1, y1, x2, y2, baseRoughOpts({
    roughness: r,
    bowing: opts.bowing ?? 1.4,
    disableMultiStroke: opts.disableMultiStroke ?? true,
  }));
  return drawableToSvg(d, { stroke: opts.stroke || PALETTE.ink, strokeWidth: opts.strokeWidth || 2.2, strokeStyle: opts.strokeStyle });
}

function arrow(x1, y1, x2, y2, opts = {}) {
  // Arrows in flow diagrams want a SINGLE wobbly stroke (not doubled), with
  // moderate roughness so they read as hand-drawn but not chaotic.
  const stroke = opts.stroke || PALETTE.ink;
  const sw = opts.strokeWidth || 2.2;
  const shaft = gen.line(x1, y1, x2, y2, baseRoughOpts({
    roughness: 1.4, bowing: 2, disableMultiStroke: true,
  }));
  let svg = drawableToSvg(shaft, { stroke, strokeWidth: sw, strokeStyle: opts.strokeStyle });
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 16;
  const headAngle = Math.PI / 7;
  const hx1 = x2 - headLen * Math.cos(angle - headAngle);
  const hy1 = y2 - headLen * Math.sin(angle - headAngle);
  const hx2 = x2 - headLen * Math.cos(angle + headAngle);
  const hy2 = y2 - headLen * Math.sin(angle + headAngle);
  const head1 = gen.line(x2, y2, hx1, hy1, baseRoughOpts({ roughness: 0.8, disableMultiStroke: true }));
  const head2 = gen.line(x2, y2, hx2, hy2, baseRoughOpts({ roughness: 0.8, disableMultiStroke: true }));
  svg += drawableToSvg(head1, { stroke, strokeWidth: sw });
  svg += drawableToSvg(head2, { stroke, strokeWidth: sw });
  return svg;
}

function curveArrow(points, opts = {}) {
  const stroke = opts.stroke || PALETTE.ink;
  const sw = opts.strokeWidth || 1.8;
  const path = gen.curve(points, baseRoughOpts({ roughness: 1.4 }));
  let svg = drawableToSvg(path, { stroke, strokeWidth: sw });
  const [px, py] = points[points.length - 2];
  const [x2, y2] = points[points.length - 1];
  const angle = Math.atan2(y2 - py, x2 - px);
  const headLen = 14;
  const headAngle = Math.PI / 7;
  const hx1 = x2 - headLen * Math.cos(angle - headAngle);
  const hy1 = y2 - headLen * Math.sin(angle - headAngle);
  const hx2 = x2 - headLen * Math.cos(angle + headAngle);
  const hy2 = y2 - headLen * Math.sin(angle + headAngle);
  const head1 = gen.line(x2, y2, hx1, hy1, baseRoughOpts({ roughness: 0.8 }));
  const head2 = gen.line(x2, y2, hx2, hy2, baseRoughOpts({ roughness: 0.8 }));
  svg += drawableToSvg(head1, { stroke, strokeWidth: sw });
  svg += drawableToSvg(head2, { stroke, strokeWidth: sw });
  return svg;
}

function text(x, y, content, { size = 18, color = PALETTE.ink, anchor = 'start', weight = 'normal', italic = false } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" ${italic ? 'font-style="italic"' : ''}>${content}</text>\n`;
}

function svgWrap(width, height, body) {
  // Rounded cream card background — readable in light AND dark mode without screaming
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect x="0" y="0" width="${width}" height="${height}" rx="12" ry="12" fill="${PALETTE.bg}"/>
${body}
</svg>
`;
}

// =============================================================
// Diagram 1: break-even hit rate
// =============================================================
function buildBreakeven() {
  const W = 820, H = 580;
  const X0 = 110, Y0 = 440, X1 = 760, Y1 = 110; // chart inner box
  // Illustrative: c/s = 0.3, so break-even at h = 0.3
  const hToX = h => X0 + h * (X1 - X0);
  const Y_C = 410, Y_S = 320, Y_CS = 140;
  const breakX = hToX(0.3); // ~305

  let body = '';
  // Region fills — visible hachure with strong stroke contrast
  const hurtsDraw = gen.rectangle(X0, Y1, breakX - X0, Y0 - Y1, baseRoughOpts({
    fill: '#e8a3a3', fillStyle: 'hachure', hachureGap: 6, hachureAngle: 35, fillWeight: 1.6, roughness: 1.0, strokeWidth: 0,
  }));
  body += drawableToSvg(hurtsDraw, { fill: '#c97070', strokeWidth: 0 });
  const helpsDraw = gen.rectangle(breakX, Y1, X1 - breakX, Y0 - Y1, baseRoughOpts({
    fill: '#9bdba8', fillStyle: 'hachure', hachureGap: 6, hachureAngle: -35, fillWeight: 1.6, roughness: 1.0, strokeWidth: 0,
  }));
  body += drawableToSvg(helpsDraw, { fill: '#5fb377', strokeWidth: 0 });

  // Title (above the chart, plenty of breathing room)
  body += text(W / 2, 56, 'break-even hit rate:  h > c / s', { size: 30, anchor: 'middle', weight: 'bold' });

  // Region labels — top-left of red, top-right of green (both kept HIGH and CLEAR of the diagonal line)
  body += text(X0 + 22, Y1 + 30, 'cache hurts', { size: 22, italic: true, color: '#7a1f1f' });
  body += text(X0 + 22, Y1 + 54, '(below break-even)', { size: 14, color: '#7a1f1f' });
  body += text(X1 - 24, Y1 + 30, 'cache helps', { size: 22, anchor: 'end', italic: true, color: '#1c5e2e' });
  body += text(X1 - 24, Y1 + 54, '(above break-even)', { size: 14, anchor: 'end', color: '#1c5e2e' });

  // Axes (drawn AFTER fills so they sit on top)
  body += line(X0, Y0, X1 + 24, Y0, { strokeWidth: 2.4 });
  body += line(X0, Y0, X0, Y1 - 26, { strokeWidth: 2.4 });

  // No-cache horizontal line at Y_S
  body += line(X0, Y_S, X1, Y_S, { stroke: PALETTE.redInk, strokeWidth: 3 });
  // With-cache line: from (h=0, y=Y_CS) to (h=1, y=Y_C)
  body += line(X0, Y_CS, X1, Y_C, { stroke: PALETTE.blueInk, strokeWidth: 3 });

  // Crossover dot
  const cross = gen.circle(breakX, Y_S, 16, baseRoughOpts({ fill: PALETTE.ink, fillStyle: 'solid', strokeWidth: 1.6, roughness: 1.5 }));
  body += drawableToSvg(cross, { stroke: PALETTE.ink, fill: PALETTE.ink, strokeWidth: 1.6 });
  // Drop line from crossover down to axis (kept short and dashed)
  body += line(breakX, Y_S + 8, breakX, Y0 - 4, { stroke: '#666', strokeWidth: 1.4, strokeStyle: 'dashed' });

  // Axis labels — "hit rate (h)" anchored on its own line BELOW the tick numbers so it never collides with the rightmost tick
  body += text((X0 + X1) / 2, Y0 + 64, 'hit rate (h)', { size: 18, anchor: 'middle', italic: true });
  body += text(X0 - 18, Y1 - 32, 'latency', { size: 18, anchor: 'end', italic: true });

  // X ticks
  const ticks = [[0, '0'], [0.25, '0.25'], [0.5, '0.5'], [0.75, '0.75'], [1, '1']];
  for (const [h, lbl] of ticks) {
    const x = hToX(h);
    body += line(x, Y0, x, Y0 + 7, { strokeWidth: 1.6, roughness: 0.9 });
    body += text(x, Y0 + 28, lbl, { size: 16, anchor: 'middle' });
  }
  // Y ticks: c, s, c+s — labels only, no horizontal gridlines (decluttered)
  body += text(X0 - 14, Y_C + 6, 'c', { size: 20, anchor: 'end', italic: true });
  body += text(X0 - 14, Y_S + 6, 's', { size: 20, anchor: 'end', italic: true });
  body += text(X0 - 14, Y_CS + 6, 'c + s', { size: 20, anchor: 'end', italic: true });

  // Line labels — "no cache" right above the red horizontal; "with cache" follows the slope on its UPPER side, well below the region label band
  body += text(X0 + 24, Y_S - 12, 'no cache  ( y = s )', { size: 18, color: '#7a1f1f', italic: true });
  body += text(X0 + 280, Y_CS + 96, 'with cache:  c + (1 - h) · s', { size: 18, color: '#0d3a6b', italic: true });

  // Crossover annotation — placed under the tick number for breakX, with arrow up to the dot.
  body += text(breakX, Y0 + 100, 'h = c / s', { size: 22, anchor: 'middle', weight: 'bold' });

  return svgWrap(W, H, body);
}

// =============================================================
// Diagram 2: cache-aside flow
// =============================================================
function buildCacheAside() {
  const W = 860, H = 460;
  let body = '';
  body += text(W / 2, 44, 'cache-aside  (lazy loading)', { size: 28, anchor: 'middle', weight: 'bold' });
  body += text(W / 2, 72, 'on miss: 2 round trips.  on hit: 1.', { size: 17, anchor: 'middle', italic: true, color: '#666' });

  // Boxes
  const appBox = { x: 60, y: 170, w: 180, h: 120, fill: PALETTE.orange, label: 'App', sub: 'your service' };
  const cacheBox = { x: 340, y: 170, w: 180, h: 120, fill: PALETTE.yellow, label: 'Cache', sub: 'Redis' };
  const srcBox = { x: 620, y: 170, w: 180, h: 120, fill: PALETTE.blue, label: 'Source', sub: 'Postgres' };

  for (const b of [appBox, cacheBox, srcBox]) {
    body += rect(b.x, b.y, b.w, b.h, b.fill, { roughness: 1.4 });
    body += text(b.x + b.w / 2, b.y + b.h / 2 + 4, b.label, { size: 26, anchor: 'middle', weight: 'bold' });
    body += text(b.x + b.w / 2, b.y + b.h / 2 + 30, b.sub, { size: 15, anchor: 'middle', italic: true, color: '#666' });
  }

  // 1. App -> Cache GET
  body += arrow(240, 200, 340, 200);
  body += text(290, 188, '1.  GET key', { size: 17, anchor: 'middle', italic: true });

  // 2. Cache -> App miss (dashed)
  body += line(340, 230, 240, 230, { strokeStyle: 'dashed' });
  body += arrow(280, 230, 240, 230, { strokeStyle: 'dashed' });
  body += text(290, 248, '2.  miss (nil)', { size: 17, anchor: 'middle', italic: true });

  // 3. App -> Source query (curve below)
  body += curveArrow([[240, 270], [380, 360], [540, 360], [620, 270]]);
  body += text(360, 380, '3.  query', { size: 17, anchor: 'middle', italic: true });

  // 4. Source -> App row (curve below, opposite direction)
  body += curveArrow([[620, 285], [540, 410], [320, 410], [240, 285]]);
  body += text(500, 432, '4.  row', { size: 17, anchor: 'middle', italic: true });

  // 5. App -> Cache SET (curve above)
  body += curveArrow([[240, 180], [290, 130], [380, 130], [340, 180]]);
  body += text(310, 116, '5.  SET key, ttl=300', { size: 17, anchor: 'middle', italic: true });

  return svgWrap(W, H, body);
}

// =============================================================
// Diagram 3: thundering herd
// =============================================================
function buildThunderingHerd() {
  const W = 860, H = 560;
  let body = '';
  body += text(W / 2, 38, 'thundering herd on a cold key', { size: 26, anchor: 'middle', weight: 'bold' });
  body += text(W / 2, 64, 'five readers all miss, all query the source, source takes 5x load', { size: 16, anchor: 'middle', italic: true, color: '#666' });

  // Five App instances
  const appX = 60, appW = 130, appH = 50;
  const appYs = [110, 180, 250, 320, 390];
  for (let i = 0; i < appYs.length; i++) {
    body += rect(appX, appYs[i], appW, appH, PALETTE.orange);
    body += text(appX + appW / 2, appYs[i] + 32, `App #${i + 1}`, { size: 19, anchor: 'middle', weight: 'bold' });
  }

  // Cache (cold)
  const cacheX = 320, cacheY = 220, cacheW = 200, cacheH = 110;
  body += rect(cacheX, cacheY, cacheW, cacheH, PALETTE.yellow);
  body += text(cacheX + cacheW / 2, cacheY + 50, 'Cache', { size: 24, anchor: 'middle', weight: 'bold' });
  body += text(cacheX + cacheW / 2, cacheY + 78, 'key not yet set', { size: 15, anchor: 'middle', italic: true, color: '#666' });

  // Source
  const srcX = 640, srcY = 220, srcW = 180, srcH = 110;
  body += rect(srcX, srcY, srcW, srcH, PALETTE.red);
  body += text(srcX + srcW / 2, srcY + 50, 'Source', { size: 24, anchor: 'middle', weight: 'bold' });
  body += text(srcX + srcW / 2, srcY + 78, 'Postgres', { size: 15, anchor: 'middle', italic: true, color: '#666' });

  // 5 arrows from each app to cache
  for (const y of appYs) {
    body += arrow(appX + appW, y + appH / 2, cacheX, cacheY + cacheH / 2 + (y - 250) * 0.25);
  }

  // 5 red arrows from cache to source (parallel, fanning slightly)
  const offsets = [-32, -16, 0, 16, 32];
  for (const off of offsets) {
    body += arrow(cacheX + cacheW, cacheY + cacheH / 2 + off, srcX, srcY + cacheH / 2 + off, { stroke: PALETTE.redInk });
  }

  // 5x load callout
  body += text((cacheX + cacheW + srcX) / 2, srcY - 28, '5x load', { size: 30, anchor: 'middle', weight: 'bold', color: PALETTE.redInk });
  body += text((cacheX + cacheW + srcX) / 2, srcY - 8, 'on the cold-key window', { size: 15, anchor: 'middle', italic: true, color: PALETTE.redInk });

  // Bottom: single-flight
  body += text(W / 2, 478, 'fix:  single-flight  (one fetch per key)', { size: 22, anchor: 'middle', weight: 'bold', color: PALETTE.greenInk });
  body += rect(280, 498, 300, 38, PALETTE.green);
  body += text(W / 2, 522, 'only request #1 reaches the source; others wait', { size: 15, anchor: 'middle', italic: true });

  return svgWrap(W, H, body);
}

writeFileSync(resolve(outDir, 'cache-1-breakeven.svg'), buildBreakeven());
writeFileSync(resolve(outDir, 'cache-1-cache-aside.svg'), buildCacheAside());
writeFileSync(resolve(outDir, 'cache-1-thundering-herd.svg'), buildThunderingHerd());

console.log('wrote 3 SVGs to', outDir);
