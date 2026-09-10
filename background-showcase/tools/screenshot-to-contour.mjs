import fs from 'node:fs';
import { PNG } from 'pngjs/lib/png.js';

const [inputPath, outputDir = '.'] = process.argv.slice(2);
if (!inputPath) throw new Error('Usage: node screenshot-to-contour.mjs input.png output-dir');

const image = PNG.sync.read(fs.readFileSync(inputPath));
const { width, height, data } = image;
const index = (x, y) => (y * width + x) * 4;
const pixel = (x, y) => {
  const i = index(x, y);
  return [data[i], data[i + 1], data[i + 2]];
};
const isWaterColor = (x, y) => {
  const [r, g, b] = pixel(x, y);
  return b > 175 && b > r + 28 && g > r + 28;
};
const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const water = new Uint8Array(width * height);
const queue = [];
const enqueue = (x, y) => {
  if (!inside(x, y) || water[y * width + x] || !isWaterColor(x, y)) return;
  water[y * width + x] = 1;
  queue.push([x, y]);
};

for (let x = 0; x < width; x += 1) { enqueue(x, 0); enqueue(x, height - 1); }
for (let y = 0; y < height; y += 1) { enqueue(0, y); enqueue(width - 1, y); }
for (let cursor = 0; cursor < queue.length; cursor += 1) {
  const [x, y] = queue[cursor];
  for (const [dx, dy] of neighbors) enqueue(x + dx, y + dy);
}

const land = new Uint8Array(width * height);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) land[y * width + x] = water[y * width + x] ? 0 : 1;
}

const visited = new Uint8Array(width * height);
let largest = [];
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x;
    if (!land[start] || visited[start]) continue;
    const component = [];
    const pending = [[x, y]];
    visited[start] = 1;
    for (let cursor = 0; cursor < pending.length; cursor += 1) {
      const [cx, cy] = pending[cursor];
      component.push([cx, cy]);
      for (const [dx, dy] of neighbors) {
        const nx = cx + dx; const ny = cy + dy;
        const ni = ny * width + nx;
        if (inside(nx, ny) && land[ni] && !visited[ni]) { visited[ni] = 1; pending.push([nx, ny]); }
      }
    }
    if (component.length > largest.length) largest = component;
  }
}
land.fill(0);
for (const [x, y] of largest) land[y * width + x] = 1;

const mask = new PNG({ width, height });
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = index(x, y);
    const value = land[y * width + x] ? 255 : 0;
    mask.data[i] = 255; mask.data[i + 1] = 255; mask.data[i + 2] = 255; mask.data[i + 3] = value;
  }
}

const segments = [];
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (!land[y * width + x]) continue;
    const has = (nx, ny) => inside(nx, ny) && land[ny * width + nx];
    if (!has(x, y - 1)) segments.push(`M${x} ${y}L${x + 1} ${y}`);
    if (!has(x + 1, y)) segments.push(`M${x + 1} ${y}L${x + 1} ${y + 1}`);
    if (!has(x, y + 1)) segments.push(`M${x + 1} ${y + 1}L${x} ${y + 1}`);
    if (!has(x - 1, y)) segments.push(`M${x} ${y + 1}L${x} ${y}`);
  }
}

const maskData = PNG.sync.write(mask).toString('base64');
const contour = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Контур суши из скриншота карты"><path d="${segments.join(' ')}" fill="none" stroke="#1a3c2e" stroke-width="2" stroke-linejoin="round"/></svg>\n`;
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Маска суши из скриншота карты"><image href="data:image/png;base64,${maskData}" width="${width}" height="${height}"/></svg>\n`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(`${outputDir}/tobizina-mask.png`, PNG.sync.write(mask));
fs.writeFileSync(`${outputDir}/tobizina-mask.svg`, maskSvg);
fs.writeFileSync(`${outputDir}/tobizina-contour.svg`, contour);
console.log(JSON.stringify({ width, height, waterPixels: water.reduce((sum, value) => sum + value, 0), landPixels: land.reduce((sum, value) => sum + value, 0), contourSegments: segments.length }, null, 2));
