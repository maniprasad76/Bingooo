const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function parsePNG(buffer) {
  let offset = 8;
  const idats = [];
  let width = 0, height = 0;
  while(offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii');
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
      idats.push(buffer.slice(offset + 8, offset + 8 + len));
    }
    offset += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const raw = Buffer.alloc(width * height * 4);
  const stride = width * 4;
  let srcPos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcPos++];
    const destPos = y * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = decompressed[srcPos++];
      let left = x >= 4 ? raw[destPos + x - 4] : 0;
      let up = y > 0 ? raw[destPos - stride + x] : 0;
      let upLeft = (y > 0 && x >= 4) ? raw[destPos - stride + x - 4] : 0;
      let val = 0;
      if (filterType === 0) val = rawByte;
      else if (filterType === 1) val = (rawByte + left) & 0xFF;
      else if (filterType === 2) val = (rawByte + up) & 0xFF;
      else if (filterType === 3) val = (rawByte + Math.floor((left + up) / 2)) & 0xFF;
      else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = upLeft;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        val = (rawByte + pr) & 0xFF;
      }
      raw[destPos + x] = val;
    }
  }
  return { width, height, data: raw };
}

function encodePNG(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let dest = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dest++] = 0; // filter None
    const src = y * width * 4;
    rgbaBuffer.copy(scanlines, dest, src, src + width * 4);
    dest += width * 4;
  }

  const idat = makeChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function resizeRGBA(srcData, srcW, srcH, dstW, dstH) {
  const dstData = Buffer.alloc(dstW * dstH * 4);
  const xRatio = (srcW - 1) / (dstW > 1 ? dstW - 1 : 1);
  const yRatio = (srcH - 1) / (dstH > 1 ? dstH - 1 : 1);

  for (let y = 0; y < dstH; y++) {
    const srcY = y * yRatio;
    const yFloor = Math.floor(srcY);
    const yCeil = Math.min(srcH - 1, yFloor + 1);
    const yWeight = srcY - yFloor;

    for (let x = 0; x < dstW; x++) {
      const srcX = x * xRatio;
      const xFloor = Math.floor(srcX);
      const xCeil = Math.min(srcW - 1, xFloor + 1);
      const xWeight = srcX - xFloor;

      const idx00 = (yFloor * srcW + xFloor) * 4;
      const idx10 = (yFloor * srcW + xCeil) * 4;
      const idx01 = (yCeil * srcW + xFloor) * 4;
      const idx11 = (yCeil * srcW + xCeil) * 4;

      const dstIdx = (y * dstW + x) * 4;

      for (let c = 0; c < 4; c++) {
        const top = srcData[idx00 + c] * (1 - xWeight) + srcData[idx10 + c] * xWeight;
        const bottom = srcData[idx01 + c] * (1 - xWeight) + srcData[idx11 + c] * xWeight;
        dstData[dstIdx + c] = Math.round(top * (1 - yWeight) + bottom * yWeight);
      }
    }
  }
  return dstData;
}

function createICO(pngBuffers) {
  // pngBuffers = [{ width, height, buffer }]
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type = 1 (ICO)
  header.writeUInt16LE(count, 4); // Count

  let offset = 6 + count * 16;
  const dirEntries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color count
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size of image
    entry.writeUInt32LE(offset, 12); // Offset of image
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

const inputPath = 'C:/Users/manip/.gemini/antigravity-ide/brain/0f491bcf-93f0-41b8-92e9-2d5d13f585e7/.user_uploaded/media_1788339087061.png';
const publicDir = path.resolve(__dirname, '../apps/web/public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.copyFileSync(inputPath, path.join(publicDir, 'logo-original.png'));

const source = parsePNG(fs.readFileSync(inputPath));
console.log('Parsed source image:', source.width, 'x', source.height);

let minX = source.width, maxX = 0, minY = source.height, maxY = 0;
for (let y = 0; y < source.height; y++) {
  for (let x = 0; x < source.width; x++) {
    const idx = (y * source.width + x) * 4;
    const r = source.data[idx];
    const g = source.data[idx+1];
    const b = source.data[idx+2];
    if (r > 20 || g > 20 || b > 20) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 6;
const cropX = Math.max(0, minX - pad);
const cropY = Math.max(0, minY - pad);
const cropW = Math.min(source.width - cropX, (maxX - minX + 1) + pad * 2);
const cropH = Math.min(source.height - cropY, (maxY - minY + 1) + pad * 2);

const redTrimmed = Buffer.alloc(cropW * cropH * 4);
const whiteTrimmed = Buffer.alloc(cropW * cropH * 4);
const darkTrimmed = Buffer.alloc(cropW * cropH * 4);

const BRAND_R = 254;
const BRAND_G = 38;
const BRAND_B = 10;

for (let dy = 0; dy < cropH; dy++) {
  const sy = cropY + dy;
  for (let dx = 0; dx < cropW; dx++) {
    const sx = cropX + dx;
    const srcIdx = (sy * source.width + sx) * 4;
    const dstIdx = (dy * cropW + dx) * 4;

    const r = source.data[srcIdx];
    const g = source.data[srcIdx+1];
    const b = source.data[srcIdx+2];

    let alpha = 0;
    if (r > 12) {
      alpha = Math.min(255, Math.max(0, Math.round(((r - 12) / (245 - 12)) * 255)));
    }

    redTrimmed[dstIdx] = BRAND_R;
    redTrimmed[dstIdx+1] = Math.round(g * (BRAND_G / 45));
    redTrimmed[dstIdx+2] = Math.round(b * (BRAND_B / 30));
    redTrimmed[dstIdx+3] = alpha;

    whiteTrimmed[dstIdx] = 255;
    whiteTrimmed[dstIdx+1] = 255;
    whiteTrimmed[dstIdx+2] = 255;
    whiteTrimmed[dstIdx+3] = alpha;

    darkTrimmed[dstIdx] = r;
    darkTrimmed[dstIdx+1] = g;
    darkTrimmed[dstIdx+2] = b;
    darkTrimmed[dstIdx+3] = 255;
  }
}

const logoRedPNG = encodePNG(cropW, cropH, redTrimmed);
const logoWhitePNG = encodePNG(cropW, cropH, whiteTrimmed);
const logoDarkPNG = encodePNG(cropW, cropH, darkTrimmed);

fs.writeFileSync(path.join(publicDir, 'logo.png'), logoRedPNG);
fs.writeFileSync(path.join(publicDir, 'logo-white.png'), logoWhitePNG);
fs.writeFileSync(path.join(publicDir, 'logo-dark.png'), logoDarkPNG);

// Crop Stylized "B" for icon
const bMinX = minX;
const bMaxX = 288;
const bMinY = minY;
const bMaxY = maxY;
const bW = bMaxX - bMinX + 1;
const bH = bMaxY - bMinY + 1;

const iconSize = Math.max(bW, bH) + 20;
const bIcon = Buffer.alloc(iconSize * iconSize * 4);
const bDarkIcon = Buffer.alloc(iconSize * iconSize * 4);

const offsetX = Math.round((iconSize - bW) / 2);
const offsetY = Math.round((iconSize - bH) / 2);

for (let y = 0; y < iconSize; y++) {
  for (let x = 0; x < iconSize; x++) {
    const dstIdx = (y * iconSize + x) * 4;
    const srcX = bMinX + (x - offsetX);
    const srcY = bMinY + (y - offsetY);

    bDarkIcon[dstIdx] = 17;
    bDarkIcon[dstIdx+1] = 17;
    bDarkIcon[dstIdx+2] = 17;
    bDarkIcon[dstIdx+3] = 255;

    if (srcX >= bMinX && srcX <= bMaxX && srcY >= bMinY && srcY <= bMaxY) {
      const srcIdx = (srcY * source.width + srcX) * 4;
      const r = source.data[srcIdx];
      let alpha = 0;
      if (r > 12) {
        alpha = Math.min(255, Math.max(0, Math.round(((r - 12) / (245 - 12)) * 255)));
      }
      bIcon[dstIdx] = BRAND_R;
      bIcon[dstIdx+1] = BRAND_G;
      bIcon[dstIdx+2] = BRAND_B;
      bIcon[dstIdx+3] = alpha;

      const aNorm = alpha / 255;
      bDarkIcon[dstIdx] = Math.round(17 * (1 - aNorm) + BRAND_R * aNorm);
      bDarkIcon[dstIdx+1] = Math.round(17 * (1 - aNorm) + BRAND_G * aNorm);
      bDarkIcon[dstIdx+2] = Math.round(17 * (1 - aNorm) + BRAND_B * aNorm);
    }
  }
}

const favicon16Data = resizeRGBA(bIcon, iconSize, iconSize, 16, 16);
const favicon32Data = resizeRGBA(bIcon, iconSize, iconSize, 32, 32);
const favicon48Data = resizeRGBA(bIcon, iconSize, iconSize, 48, 48);
const favicon64Data = resizeRGBA(bIcon, iconSize, iconSize, 64, 64);
const favicon180Data = resizeRGBA(bDarkIcon, iconSize, iconSize, 180, 180);
const favicon192Data = resizeRGBA(bIcon, iconSize, iconSize, 192, 192);
const favicon512Data = resizeRGBA(bIcon, iconSize, iconSize, 512, 512);

const png16 = encodePNG(16, 16, favicon16Data);
const png32 = encodePNG(32, 32, favicon32Data);
const png48 = encodePNG(48, 48, favicon48Data);
const png64 = encodePNG(64, 64, favicon64Data);
const png180 = encodePNG(180, 180, favicon180Data);
const png192 = encodePNG(192, 192, favicon192Data);
const png512 = encodePNG(512, 512, favicon512Data);

fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);
fs.writeFileSync(path.join(publicDir, 'favicon-64x64.png'), png64);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

// Write favicon.ico containing 16x16, 32x32, 48x48
const icoData = createICO([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);

// Generate SVGs
// 1. logo.svg
const logoBase64 = logoRedPNG.toString('base64');
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="${cropW}" height="${cropH}">
  <image href="data:image/png;base64,${logoBase64}" width="${cropW}" height="${cropH}" />
</svg>`;
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);

// 2. logo-white.svg
const logoWhiteBase64 = logoWhitePNG.toString('base64');
const logoWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="${cropW}" height="${cropH}">
  <image href="data:image/png;base64,${logoWhiteBase64}" width="${cropW}" height="${cropH}" />
</svg>`;
fs.writeFileSync(path.join(publicDir, 'logo-white.svg'), logoWhiteSvg);

// 3. favicon.svg (Vector B mark for browser tabs)
const bIconBase64 = png192.toString('base64');
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <style>
      @media (prefers-color-scheme: dark) {
        .bg { fill: #111111; }
      }
    </style>
  </defs>
  <rect class="bg" width="192" height="192" rx="40" fill="#0D0D0D"/>
  <image href="data:image/png;base64,${bIconBase64}" x="0" y="0" width="192" height="192" />
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

// 4. OpenGraph image (1200x630)
const ogW = 1200;
const ogH = 630;
const ogData = Buffer.alloc(ogW * ogH * 4);
for (let y = 0; y < ogH; y++) {
  const gVal = Math.round(10 + (y / ogH) * 8);
  for (let x = 0; x < ogW; x++) {
    const idx = (y * ogW + x) * 4;
    ogData[idx] = gVal;
    ogData[idx+1] = gVal;
    ogData[idx+2] = gVal + 2;
    ogData[idx+3] = 255;
  }
}
const ogLogoW = 720;
const ogLogoH = Math.round(cropH * (ogLogoW / cropW));
const resizedLogo = resizeRGBA(redTrimmed, cropW, cropH, ogLogoW, ogLogoH);
const ogOffsetX = Math.round((ogW - ogLogoW) / 2);
const ogOffsetY = Math.round((ogH - ogLogoH) / 2 - 20);

for (let y = 0; y < ogLogoH; y++) {
  const dy = ogOffsetY + y;
  if (dy < 0 || dy >= ogH) continue;
  for (let x = 0; x < ogLogoW; x++) {
    const dx = ogOffsetX + x;
    if (dx < 0 || dx >= ogW) continue;
    const srcIdx = (y * ogLogoW + x) * 4;
    const dstIdx = (dy * ogW + dx) * 4;
    const alpha = resizedLogo[srcIdx+3] / 255;
    if (alpha > 0) {
      ogData[dstIdx] = Math.round(ogData[dstIdx] * (1 - alpha) + resizedLogo[srcIdx] * alpha);
      ogData[dstIdx+1] = Math.round(ogData[dstIdx+1] * (1 - alpha) + resizedLogo[srcIdx+1] * alpha);
      ogData[dstIdx+2] = Math.round(ogData[dstIdx+2] * (1 - alpha) + resizedLogo[srcIdx+2] * alpha);
    }
  }
}
fs.writeFileSync(path.join(publicDir, 'og-image.png'), encodePNG(ogW, ogH, ogData));

console.log('All branding assets generated successfully:');
console.log(' - logo.png, logo-white.png, logo-dark.png, logo-original.png');
console.log(' - logo.svg, logo-white.svg, favicon.svg');
console.log(' - favicon.ico (16, 32, 48), favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png');
console.log(' - og-image.png');
