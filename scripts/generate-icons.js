const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0a0a0a"/>
  <rect x="${size * 0.23}" y="${size * 0.27}" width="${size * 0.54}" height="${size * 0.38}" rx="${Math.round(size * 0.03)}" fill="none" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}"/>
  <polygon points="${size * 0.5},${size * 0.35} ${size * 0.32},${size * 0.6} ${size * 0.68},${size * 0.6}" fill="none" stroke="#c8a951" stroke-width="${Math.round(size * 0.01)}"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.38}" y2="${size * 0.74}" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}" stroke-linecap="round"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.5}" y2="${size * 0.76}" stroke="#c8a951" stroke-width="${Math.round(size * 0.014)}" stroke-linecap="round"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.62}" y2="${size * 0.74}" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}" stroke-linecap="round"/>
</svg>`;

async function generate() {
  const sizes = [512, 192, 180, 152, 120];
  const outDir = path.join(__dirname, "..", "public", "icons");
  fs.mkdirSync(outDir, { recursive: true });

  for (const size of sizes) {
    const buf = Buffer.from(svg(size));
    await sharp(buf).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
  console.log("Done!");
}

generate().catch((e) => { console.error(e); process.exit(1); });
