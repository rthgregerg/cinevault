const fs = require("fs");
const path = require("path");

// Simple SVG icon: dark bg + gold beam symbol
const svg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0a0a0a"/>
  <rect x="${size * 0.25}" y="${size * 0.28}" width="${size * 0.5}" height="${size * 0.35}" rx="${Math.round(size * 0.03)}" fill="none" stroke="#c8a951" stroke-width="${Math.round(size * 0.015)}"/>
  <polygon points="${size * 0.5},${size * 0.36} ${size * 0.34},${size * 0.58} ${size * 0.66},${size * 0.58}" fill="#c8a951" opacity="0.25" stroke="#c8a951" stroke-width="${Math.round(size * 0.01)}"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.4}" y2="${size * 0.72}" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}" stroke-linecap="round" opacity="0.5"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.5}" y2="${size * 0.75}" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}" stroke-linecap="round" opacity="0.7"/>
  <line x1="${size * 0.5}" y1="${size * 0.63}" x2="${size * 0.6}" y2="${size * 0.72}" stroke="#c8a951" stroke-width="${Math.round(size * 0.012)}" stroke-linecap="round" opacity="0.5"/>
</svg>`;

const sizes = [512, 192, 180, 152, 120];
const outDir = path.join(__dirname, "..", "public", "icons");

for (const size of sizes) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.svg`), svg(size));
  console.log(`Generated icon-${size}.svg`);
}
