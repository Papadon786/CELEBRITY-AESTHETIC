// One-off dev script: generates 30 lightweight PLACEHOLDER frames so the
// scroll-sequence hero can be tested end-to-end before real photography /
// render frames are dropped in. Delete this script (and re-run nothing) once
// public/hero-sequence/frame-0XX.webp are replaced with real assets.
//
// Run with: node scripts/gen-placeholder-frames.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "hero-sequence");
const W = 1200;
const H = 1500;
const TOTAL = 30;

// Roughly maps to the brief's scroll story so the placeholder at least
// *feels* staged even before real frames exist.
function stageFor(i) {
  if (i <= 10) return { label: "FACE ROTATE / DOLLY IN", bg: ["#F8F3E8", "#E7DDE5"] };
  if (i <= 18) return { label: "INTO SKIN CROSS-SECTION", bg: ["#DCE8EC", "#C9B28A"] };
  if (i <= 23) return { label: "LASER HANDPIECE", bg: ["#54152F", "#3D1024"] };
  if (i <= 25) return { label: "LASER EXIT / FADE", bg: ["#3D1024", "#54152F"] };
  return { label: "PULL BACK TO FACE", bg: ["#E7DDE5", "#F8F3E8"] };
}

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 1; i <= TOTAL; i++) {
    const t = (i - 1) / (TOTAL - 1);
    const { label, bg } = stageFor(i);
    const dark = i >= 19 && i <= 25;
    const textColor = dark ? "#F8F3E8" : "#54152F";
    const ring = lerpColor(bg[0], bg[1], 0.5);

    const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg[0]}" />
      <stop offset="100%" stop-color="${bg[1]}" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)" />
  <circle cx="${W / 2}" cy="${H / 2}" r="${260 + t * 140}" fill="none" stroke="${ring}" stroke-width="2" opacity="0.55" />
  <circle cx="${W / 2}" cy="${H / 2}" r="${180 + t * 90}" fill="none" stroke="${textColor}" stroke-width="1" opacity="0.35" />
  <text x="${W / 2}" y="${H / 2 - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="${textColor}" font-weight="600" letter-spacing="4">FRAME ${String(i).padStart(2, "0")} / ${TOTAL}</text>
  <text x="${W / 2}" y="${H / 2 + 34}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" letter-spacing="2" opacity="0.8">${label} — PLACEHOLDER</text>
</svg>`.trim();

    const outPath = path.join(OUT_DIR, `frame-${String(i).padStart(3, "0")}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(outPath);
    process.stdout.write(`wrote ${outPath}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
