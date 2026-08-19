import sharp from "sharp";
import { resolve } from "path";

const input = resolve("assets/images/hero-rider.png");
const output = resolve("assets/images/hero-rider.png");
const tmp = resolve("assets/images/hero-rider-out.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const total = width * height;
const visited = new Uint8Array(total);
const queue = [];

const idx = (x, y) => (y * width + x) * 4;
const isBg = (i) => {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return max > 236 || (max > 148 && sat < 0.14);
};

for (let x = 0; x < width; x += 1) {
  queue.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y += 1) {
  queue.push([0, y], [width - 1, y]);
}

while (queue.length) {
  const [x, y] = queue.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  const i = idx(x, y);
  if (!isBg(i)) continue;
  visited[p] = 1;
  data[i + 3] = 0;
  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (data[idx(x, y) + 3] > 12) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const pad = 4;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

const cropped = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y += 1) {
  for (let x = 0; x < cropW; x += 1) {
    const src = idx(minX + x, minY + y);
    const dst = (y * cropW + x) * 4;
    cropped[dst] = data[src];
    cropped[dst + 1] = data[src + 1];
    cropped[dst + 2] = data[src + 2];
    cropped[dst + 3] = data[src + 3];
  }
}

await sharp(cropped, { raw: { width: cropW, height: cropH, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(tmp);

await sharp(tmp).metadata().then((m) => console.log(`Saved ${m.width}x${m.height} -> ${output}`));
await sharp(tmp).toFile(output);
