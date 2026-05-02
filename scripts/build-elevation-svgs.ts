import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  buildElevationProfile,
  calcElevationStats,
  niceInterval,
  type ElevationPoint,
  type ElevationStats,
} from '@/lib/gpx-elevation';

// ---------------------------------------------------------------------------
// Constants (match the visual design in ElevationProfile.tsx)
// ---------------------------------------------------------------------------
const W = 800;
const H = 200;
const PAD = { top: 16, bottom: 32, left: 52, right: 16 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const BASELINE = PAD.top + PLOT_H;

// ---------------------------------------------------------------------------
// GPX parsing — regex-based; avoids needing DOMParser in Node.js
// ---------------------------------------------------------------------------
function parseGpxCoords(xml: string): [number, number, number][] {
  const coords: [number, number, number][] = [];
  // Match each <trkpt> block (handles multiline bodies)
  const trkptRe = /<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/g;
  const latRe = /\blat="([^"]+)"/;
  const lonRe = /\blon="([^"]+)"/;
  const eleRe = /<ele>\s*([^<\s]+)\s*<\/ele>/;
  let m: RegExpExecArray | null;
  while ((m = trkptRe.exec(xml)) !== null) {
    const latM = latRe.exec(m[1]);
    const lonM = lonRe.exec(m[1]);
    const eleM = eleRe.exec(m[2]);
    if (latM && lonM && eleM) {
      const lat = parseFloat(latM[1]);
      const lon = parseFloat(lonM[1]);
      const ele = parseFloat(eleM[1]);
      if (isFinite(lat) && isFinite(lon) && isFinite(ele)) {
        coords.push([lon, lat, ele]);
      }
    }
  }
  return coords;
}

// ---------------------------------------------------------------------------
// SVG path builders — Catmull-Rom → cubic Bézier for smooth curves
// ---------------------------------------------------------------------------
function fmt(x: number): string {
  return x.toFixed(2);
}

function buildPaths(
  profile: ElevationPoint[],
  totalDist: number,
  minEle: number,
  maxEle: number,
): { area: string; line: string } {
  const eleRange = maxEle - minEle || 1;
  const toX = (d: number) => PAD.left + (d / totalDist) * PLOT_W;
  const toY = (e: number) => PAD.top + PLOT_H - ((e - minEle) / eleRange) * PLOT_H;

  const xs = profile.map(p => toX(p.d));
  const ys = profile.map(p => toY(p.ele));

  const tension = 0.5;
  let linePath = `M ${fmt(xs[0])},${fmt(ys[0])}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0 = i === 0 ? [xs[0], ys[0]] : [xs[i - 1], ys[i - 1]];
    const p1 = [xs[i], ys[i]];
    const p2 = [xs[i + 1], ys[i + 1]];
    const p3 = i + 2 < xs.length ? [xs[i + 2], ys[i + 2]] : p2;
    const cp1x = p1[0] + (tension * (p2[0] - p0[0])) / 6;
    const cp1y = p1[1] + (tension * (p2[1] - p0[1])) / 6;
    const cp2x = p2[0] - (tension * (p3[0] - p1[0])) / 6;
    const cp2y = p2[1] - (tension * (p3[1] - p1[1])) / 6;
    linePath += ` C ${fmt(cp1x)},${fmt(cp1y)} ${fmt(cp2x)},${fmt(cp2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
  }

  const areaPath =
    `${linePath} L ${fmt(xs[xs.length - 1])},${fmt(BASELINE)} L ${fmt(xs[0])},${fmt(BASELINE)} Z`;

  return { area: areaPath, line: linePath };
}

// ---------------------------------------------------------------------------
// SVG renderer — embeds CSS media queries for dark mode support
// ---------------------------------------------------------------------------
function renderSvg(
  profile: ElevationPoint[],
  stats: ElevationStats,
  totalDistKm: number,
  raceName: string,
): string {
  const { area, line } = buildPaths(profile, totalDistKm, stats.minEle, stats.maxEle);
  const eleRange = stats.maxEle - stats.minEle || 1;
  const toX = (d: number) => PAD.left + (d / totalDistKm) * PLOT_W;
  const toY = (e: number) => PAD.top + PLOT_H - ((e - stats.minEle) / eleRange) * PLOT_H;

  // Y gridlines
  const yInterval = niceInterval(stats.maxEle - stats.minEle, 4);
  const yStart = Math.ceil(stats.minEle / yInterval) * yInterval;
  const gridLines: number[] = [];
  for (let v = yStart; v <= stats.maxEle; v += yInterval) gridLines.push(v);

  // X distance ticks (in km)
  const xInterval = niceInterval(totalDistKm, 5);
  const distTicks: number[] = [];
  for (let v = 0; v <= totalDistKm + xInterval * 0.01; v += xInterval) {
    distTicks.push(Math.round(v * 10) / 10);
  }

  const startY = toY(profile[0].ele);
  const endY = toY(profile[profile.length - 1].ele);
  const startX = toX(0);
  const endX = toX(totalDistKm);

  const gridSvg = gridLines
    .map(v => {
      const y = fmt(toY(v));
      return [
        `<line class="grid" x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" stroke-dasharray="3 3"/>`,
        `<text class="axis" x="${PAD.left - 5}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="10">${Math.round(v)}</text>`,
      ].join('\n    ');
    })
    .join('\n    ');

  const tickSvg = distTicks
    .map(v => {
      const x = toX(v);
      if (x < PAD.left - 1 || x > W - PAD.right + 1) return '';
      return [
        `<line class="tick" x1="${fmt(x)}" y1="${BASELINE}" x2="${fmt(x)}" y2="${BASELINE + 4}"/>`,
        `<text class="axis" x="${fmt(x)}" y="${BASELINE + 13}" text-anchor="middle" font-size="10">${v}</text>`,
      ].join('\n    ');
    })
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Elevation profile for ${raceName.replace(/"/g, '&quot;')}">
  <title>Elevation profile for ${raceName.replace(/</g, '&lt;')}</title>
  <style>
    .bg { fill: #ffffff }
    .grid { stroke: #e5e7eb; stroke-width: 0.5; fill: none }
    .tick { stroke: #d1d5db; stroke-width: 0.8; fill: none }
    .base { stroke: #d1d5db; stroke-width: 0.8 }
    .axis { fill: #9ca3af; font-family: system-ui, sans-serif }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #0f172a }
      .grid { stroke: #334155 }
      .tick { stroke: #475569 }
      .base { stroke: #475569 }
      .axis { fill: #64748b }
    }
  </style>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e63012" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#e63012" stop-opacity="0.03"/>
    </linearGradient>
    <clipPath id="c">
      <rect x="${PAD.left}" y="${PAD.top}" width="${PLOT_W}" height="${PLOT_H}"/>
    </clipPath>
  </defs>
  <rect class="bg" width="${W}" height="${H}"/>
  ${gridSvg}
  <text class="axis" x="${PAD.left - 5}" y="${PAD.top - 6}" text-anchor="end" font-size="9">m</text>
  ${tickSvg}
  <text class="axis" x="${W - PAD.right + 4}" y="${BASELINE + 13}" font-size="9">km</text>
  <line class="base" x1="${PAD.left}" y1="${BASELINE}" x2="${W - PAD.right}" y2="${BASELINE}"/>
  <path d="${area}" fill="url(#g)" clip-path="url(#c)"/>
  <path d="${line}" fill="none" stroke="#e63012" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#c)"/>
  <circle cx="${fmt(startX)}" cy="${fmt(startY)}" r="5" fill="#16a34a" stroke="white" stroke-width="1.5"/>
  <text x="${fmt(startX + 8)}" y="${fmt(startY)}" dominant-baseline="middle" font-size="9" font-weight="700" fill="#16a34a">S</text>
  <circle cx="${fmt(endX)}" cy="${fmt(endY)}" r="5" fill="#1d4ed8" stroke="white" stroke-width="1.5"/>
  <text x="${fmt(endX - 8)}" y="${fmt(endY)}" text-anchor="end" dominant-baseline="middle" font-size="9" font-weight="700" fill="#1d4ed8">F</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const racesDir = path.join(process.cwd(), 'content', 'races');
const outDir = path.join(process.cwd(), 'public', 'results');
fs.mkdirSync(outDir, { recursive: true });

const entries = fs.readdirSync(racesDir, { withFileTypes: true });
let count = 0;

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const gpxFile = path.join(racesDir, entry.name, 'route.gpx');
  if (!fs.existsSync(gpxFile)) continue;

  const xml = fs.readFileSync(gpxFile, 'utf-8');
  const coords = parseGpxCoords(xml);
  if (coords.length === 0) {
    console.warn(`  ⚠ ${entry.name}: GPX contains no elevation data`);
    continue;
  }

  const profile = buildElevationProfile(coords);
  const stats = calcElevationStats(profile);
  const totalDistKm = Math.round((profile.at(-1)?.d ?? 0) * 100) / 100;

  if (stats.maxEle - stats.minEle < 1) {
    console.log(`  – ${entry.name}: no meaningful elevation data (all zeros), skipping`);
    continue;
  }

  // Read race name for SVG aria-label (best-effort, fall back to raceId)
  let raceName = entry.name;
  try {
    const indexMd = path.join(racesDir, entry.name, 'index.md');
    if (fs.existsSync(indexMd)) {
      const { data } = matter.read(indexMd);
      if (typeof data.title === 'string') raceName = data.title;
    }
  } catch { /* no-op */ }

  fs.writeFileSync(
    path.join(outDir, `${entry.name}-elevation-stats.json`),
    JSON.stringify({ ...stats, totalDistKm }),
  );

  fs.writeFileSync(
    path.join(outDir, `${entry.name}-elevation.svg`),
    renderSvg(profile, stats, totalDistKm, raceName),
  );

  count++;
  console.log(`  ✓ ${entry.name}: ${coords.length} → ${profile.length} pts, ${totalDistKm} km`);
}

console.log(`\nGenerated elevation SVGs for ${count} race(s).`);
