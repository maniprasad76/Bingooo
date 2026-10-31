// Builds the optimised images in public/img/v1 (AVIF + WebP at several widths).
//
//   node scripts/optimize-images.mjs            # writes only files that are missing
//   node scripts/optimize-images.mjs --force    # rewrites everything
//
// Files in img/v1 are served with a one-year immutable cache, so don't change
// an existing image in place: put new versions in img/v2 and update
// src/lib/images.ts, whose names and widths must match the list below.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { HERO_WIDTHS } from '../src/lib/hero-image.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '../public');
const OUT = path.join(PUBLIC, 'img/v1');
const force = process.argv.includes('--force');

const AVIF = { quality: 52, effort: 7, chromaSubsampling: '4:2:0' };
const WEBP = { quality: 74, effort: 6, smartSubsample: true };
const AVIF_ALPHA = { quality: 58, effort: 7 };
const WEBP_ALPHA = { quality: 80, alphaQuality: 90, effort: 6 };

// The same matrix CSS grayscale(1) applies to sRGB values, so a baked-in
// greyscale looks exactly like the filter it replaces.
const GRAYSCALE = [
  [0.2126, 0.7152, 0.0722],
  [0.2126, 0.7152, 0.0722],
  [0.2126, 0.7152, 0.0722],
];

const unsplash = (id, width) => `https://images.unsplash.com/${id}?fm=jpg&w=${width}&q=92`;

const IMAGES = [
  { name: 'hero', src: unsplash('photo-1529139574466-a303027c1d8b', 2400), widths: HERO_WIDTHS, gray: true, jpg: 960 },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ name: `real-fit-${n}`, src: `real-fit-${n}.jpg`, widths: [360, 720, 1024] })),
  { name: 'about-atelier', src: 'about-atelier.jpg', widths: [640, 1024] },
  { name: 'custom-studio', src: 'custom-studio.jpg', widths: [640, 1024] },
  { name: 'privacy-hero', src: 'privacy-hero.jpg', widths: [640, 1024] },
  { name: 'terms-hero', src: 'terms-hero.jpg', widths: [480, 1024] },
  { name: 'returns', src: unsplash('photo-1551488831-00ddcb6c6bd3', 1600), widths: [640, 1024, 1600], gray: true, jpg: 1024 },
  { name: 'shipping', src: unsplash('photo-1586528116311-ad8dd3c8310d', 1600), widths: [640, 1024, 1600], gray: true, jpg: 1024 },
  { name: 'size-guide', src: unsplash('photo-1521572267360-ee0c2909d518', 1600), widths: [640, 1024, 1600], gray: true, jpg: 1024 },
  { name: 'men-category', src: 'men-category.jpg', widths: [128, 260] },
  { name: 'women-category', src: 'women-category.jpg', widths: [128, 260] },
  { name: 'empty-wishlist-art', src: 'empty-wishlist-art.png', widths: [512, 1024], alpha: true },
  { name: 'wishlist-bag-heart', src: 'wishlist-bag-heart.png', widths: [510], alpha: true },
  { name: 'submark', src: 'submark.png', widths: [128, 256], png: 256 },
  ...['phonepe', 'gpay', 'paytm', 'upi', 'whatsapp', 'instagram', 'youtube', 'twitter'].map((n) => ({
    name: n, src: `custom/${n}.png`, widths: [96], alpha: true, png: 96, formats: ['webp'],
  })),
];

async function loadSource(src) {
  if (!src.startsWith('https://')) return fs.readFileSync(path.join(PUBLIC, src));
  const cache = path.join(os.tmpdir(), 'bingooo-img-src', src.replace(/[^a-z0-9]+/gi, '_') + '.jpg');
  if (!fs.existsSync(cache)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    fs.writeFileSync(cache, Buffer.from(await res.arrayBuffer()));
  }
  return fs.readFileSync(cache);
}

fs.mkdirSync(OUT, { recursive: true });
let written = 0;

for (const image of IMAGES) {
  const input = await loadSource(image.src);
  const { width: sourceWidth } = await sharp(input).metadata();
  // Never upscale: widths above the source collapse to the source width.
  const widths = [...new Set(image.widths.map((w) => Math.min(w, sourceWidth)))];
  const resized = (w) => {
    const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    return image.gray ? pipeline.recomb(GRAYSCALE) : pipeline;
  };
  const outputs = [];
  for (const w of widths) {
    for (const format of image.formats || ['avif', 'webp']) {
      const options = format === 'avif' ? (image.alpha ? AVIF_ALPHA : AVIF) : image.alpha ? WEBP_ALPHA : WEBP;
      outputs.push([`${image.name}-${w}.${format}`, () => resized(w)[format](options)]);
    }
  }
  if (image.jpg) outputs.push([`${image.name}-${image.jpg}.jpg`, () => resized(image.jpg).jpeg({ quality: 76, mozjpeg: true })]);
  if (image.png) outputs.push([`${image.name}-${image.png}.png`, () => resized(image.png).png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })]);

  for (const [file, build] of outputs) {
    const target = path.join(OUT, file);
    if (!force && fs.existsSync(target)) continue;
    await build().toFile(target);
    written++;
    console.log(`img/v1/${file}  ${Math.round(fs.statSync(target).size / 1024)} KB`);
  }
}

console.log(`${written} file(s) written to public/img/v1`);
