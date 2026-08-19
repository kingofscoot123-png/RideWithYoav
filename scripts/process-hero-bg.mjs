import sharp from "sharp";
import { resolve } from "path";

const input = resolve("assets/images/hero-bg-source.png");
const output = resolve("assets/images/hero-bg.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const bg = { r: 36, g: 48, b: 31 }; /* --bg #24301f */
const blob = { r: 193, g: 98, b: 45 }; /* --terracotta #c1622d */
const blobDeep = { r: 58, g: 72, b: 46 }; /* olive shadow in blob */

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (a < 16) continue;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;

  const isBlue = b > 90 && b > r + 18 && b > g + 8 && sat > 0.25;
  const isLight = max > 175 && sat < 0.18;

  if (isBlue) {
    const t = Math.min(1, (b - 80) / 140);
    data[i] = Math.round(blobDeep.r + (blob.r - blobDeep.r) * t);
    data[i + 1] = Math.round(blobDeep.g + (blob.g - blobDeep.g) * t);
    data[i + 2] = Math.round(blobDeep.b + (blob.b - blobDeep.b) * t);
  } else if (isLight) {
    data[i] = bg.r;
    data[i + 1] = bg.g;
    data[i + 2] = bg.b;
  } else {
    data[i] = Math.round(r * 0.35 + bg.r * 0.65);
    data[i + 1] = Math.round(g * 0.35 + bg.g * 0.65);
    data[i + 2] = Math.round(b * 0.35 + bg.b * 0.65);
  }
}

await sharp(data, { raw: { width, height, channels } })
  .resize(2400, null, { fit: "inside", withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`Saved ${meta.width}x${meta.height} -> ${output}`);
