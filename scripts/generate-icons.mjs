import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Helper to create an ICO buffer containing multiple PNG buffers
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerLen = 6;
  const dirEntryLen = 16;
  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(numImages, 4);

  let offset = headerLen + dirEntryLen * numImages;
  const dirEntries = [];
  const imageBuffers = [];

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Size of PNG
    entry.writeUInt32LE(offset, 12); // Offset to PNG data
    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // High-res HTML template with luxury warm beige background (#F7EEDB), bold red B (#E6321C), and black dot (#171717)
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 512px;
      height: 512px;
      overflow: hidden;
    }
    .badge {
      width: 512px;
      height: 512px;
      border-radius: 124px;
      background: linear-gradient(155deg, #FFFDF8 0%, #F7EEDB 55%, #ECE0C7 100%);
      border: 6px solid #D6C8AE;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: inset 0 2px 5px rgba(255,255,255,0.8), inset 0 -4px 8px rgba(100, 80, 50, 0.12);
    }
    .badge::before {
      content: '';
      position: absolute;
      inset: 8px;
      border-radius: 112px;
      border: 2px solid rgba(255, 255, 255, 0.6);
      pointer-events: none;
    }
    .letter {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 900;
      font-size: 342px;
      line-height: 1;
      color: #E6321C;
      text-shadow: 0 4px 14px rgba(230, 50, 28, 0.22);
      transform: translateY(-8px);
      user-select: none;
      display: flex;
      align-items: baseline;
    }
    .dot {
      width: 44px;
      height: 44px;
      background: #171717;
      border-radius: 50%;
      display: inline-block;
      margin-left: 8px;
      margin-bottom: 24px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
  </style>
</head>
<body>
  <div class="badge" id="icon-root">
    <div class="letter">B<span class="dot"></span></div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Generate 512x512
  await page.setViewportSize({ width: 512, height: 512 });
  const root = page.locator('#icon-root');
  const buf512 = await root.screenshot({ omitBackground: true });

  // Generate 192x192
  await page.setViewportSize({ width: 192, height: 192 });
  await page.evaluate(() => {
    const el = document.getElementById('icon-root');
    el.style.width = '192px';
    el.style.height = '192px';
    el.style.borderRadius = '46px';
    el.style.borderWidth = '2.5px';
    document.querySelector('.letter').style.fontSize = '128px';
    document.querySelector('.letter').style.transform = 'translateY(-3px)';
    document.querySelector('.dot').style.width = '16px';
    document.querySelector('.dot').style.height = '16px';
    document.querySelector('.dot').style.marginLeft = '3px';
    document.querySelector('.dot').style.marginBottom = '8px';
    document.querySelector('.badge::before')?.remove();
  });
  const buf192 = await root.screenshot({ omitBackground: true });

  // Generate 180x180 (apple touch icon)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.evaluate(() => {
    const el = document.getElementById('icon-root');
    el.style.width = '180px';
    el.style.height = '180px';
    el.style.borderRadius = '42px';
    el.style.borderWidth = '2px';
    document.querySelector('.letter').style.fontSize = '120px';
    document.querySelector('.letter').style.transform = 'translateY(-3px)';
    document.querySelector('.dot').style.width = '15px';
    document.querySelector('.dot').style.height = '15px';
    document.querySelector('.dot').style.marginLeft = '3px';
    document.querySelector('.dot').style.marginBottom = '8px';
  });
  const buf180 = await root.screenshot({ omitBackground: true });

  // Generate 64x64
  await page.setViewportSize({ width: 64, height: 64 });
  await page.evaluate(() => {
    const el = document.getElementById('icon-root');
    el.style.width = '64px';
    el.style.height = '64px';
    el.style.borderRadius = '15px';
    el.style.borderWidth = '1px';
    document.querySelector('.letter').style.fontSize = '43px';
    document.querySelector('.letter').style.transform = 'translateY(-1px)';
    document.querySelector('.dot').style.width = '5.5px';
    document.querySelector('.dot').style.height = '5.5px';
    document.querySelector('.dot').style.marginLeft = '1.5px';
    document.querySelector('.dot').style.marginBottom = '3px';
  });
  const buf64 = await root.screenshot({ omitBackground: true });

  // Generate 32x32
  await page.setViewportSize({ width: 32, height: 32 });
  await page.evaluate(() => {
    const el = document.getElementById('icon-root');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '7.5px';
    el.style.borderWidth = '0.75px';
    document.querySelector('.letter').style.fontSize = '21px';
    document.querySelector('.letter').style.transform = 'translateY(-0.5px)';
    document.querySelector('.dot').style.width = '3px';
    document.querySelector('.dot').style.height = '3px';
    document.querySelector('.dot').style.marginLeft = '1px';
    document.querySelector('.dot').style.marginBottom = '1.5px';
  });
  const buf32 = await root.screenshot({ omitBackground: true });

  // Generate 16x16
  await page.setViewportSize({ width: 16, height: 16 });
  await page.evaluate(() => {
    const el = document.getElementById('icon-root');
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '4px';
    el.style.borderWidth = '0.5px';
    document.querySelector('.letter').style.fontSize = '11px';
    document.querySelector('.letter').style.transform = 'translateY(-0.25px)';
    document.querySelector('.dot').style.width = '1.5px';
    document.querySelector('.dot').style.height = '1.5px';
    document.querySelector('.dot').style.marginLeft = '0.5px';
    document.querySelector('.dot').style.marginBottom = '0.75px';
  });
  const buf16 = await root.screenshot({ omitBackground: true });

  // Create multi-resolution ICO buffer
  const icoBuf = createIco([
    { size: 16, buffer: buf16 },
    { size: 32, buffer: buf32 },
    { size: 64, buffer: buf64 },
  ]);

  // Pure Vector SVG without external font dependency:
  // Beige background squircle (#F7EEDB), red B (#E6321C), and black dot (#171717)
  const vectorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="beigeGrad" x1="40" y1="20" x2="470" y2="490" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF8" />
      <stop offset="50%" stop-color="#F7EEDB" />
      <stop offset="100%" stop-color="#ECE0C7" />
    </linearGradient>
    <radialGradient id="topHighlight" cx="256" cy="30" r="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#E6321C" flood-opacity="0.22" />
    </filter>
  </defs>

  <!-- Beige Squircle Base -->
  <rect width="512" height="512" rx="124" fill="url(#beigeGrad)" />
  
  <!-- Subtle Outer Rim Stroke -->
  <rect x="3" y="3" width="506" height="506" rx="121" stroke="#D6C8AE" stroke-width="6" />
  
  <!-- Inner Highlight Glow -->
  <rect x="12" y="12" width="488" height="488" rx="112" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="3" />
  
  <!-- Top Specular Ambient Glow -->
  <path d="M 0 124 C 0 55 55 0 124 0 L 388 0 C 457 0 512 55 512 124 L 512 210 Q 256 260 0 210 Z" fill="url(#topHighlight)" />

  <!-- Monogram Red B + Black Dot -->
  <g filter="url(#subtleShadow)">
    <!-- High Precision Geometric Outfit Black 'B' in Vermilion Red (#E6321C) -->
    <!-- Outer Contour + 2 Inner Cutout Loops (Fill Rule EvenOdd) -->
    <path fill="#E6321C" fill-rule="evenodd" d="
      M 148 116
      L 272 116
      C 328 116 364 146 364 194
      C 364 226 348 248 322 258
      C 356 269 376 295 376 334
      C 376 388 334 422 272 422
      L 148 422
      Z
      M 218 178
      L 218 240
      L 262 240
      C 284 240 298 228 298 209
      C 298 190 284 178 262 178
      Z
      M 218 296
      L 218 360
      L 266 360
      C 290 360 306 346 306 328
      C 306 310 290 296 266 296
      Z
    " />
    
    <!-- Signature Black Dot (#171717) -->
    <circle cx="414" cy="398" r="24" fill="#171717" />
  </g>
</svg>`;

  // Targets to write to
  const targets = [
    path.resolve('apps/frontend/public'),
    path.resolve('apps/admin/public')
  ];

  for (const targetDir of targets) {
    if (!fs.existsSync(targetDir)) continue;
    fs.writeFileSync(path.join(targetDir, 'favicon.svg'), vectorSvg, 'utf8');
    fs.writeFileSync(path.join(targetDir, 'favicon.ico'), icoBuf);
    fs.writeFileSync(path.join(targetDir, 'favicon.png'), buf64);
    fs.writeFileSync(path.join(targetDir, 'favicon-32x32.png'), buf32);
    fs.writeFileSync(path.join(targetDir, 'favicon-16x16.png'), buf16);
    fs.writeFileSync(path.join(targetDir, 'apple-touch-icon.png'), buf180);
    fs.writeFileSync(path.join(targetDir, 'icon-192.png'), buf192);
    fs.writeFileSync(path.join(targetDir, 'icon-512.png'), buf512);
    fs.writeFileSync(path.join(targetDir, 'app-icon.png'), buf512);
    fs.writeFileSync(path.join(targetDir, 'app-icon-white.png'), buf512);
  }

  // Also update Android mipmap launcher icons
  const androidRes = path.resolve('apps/frontend/android/app/src/main/res');
  if (fs.existsSync(androidRes)) {
    const mipmaps = [
      { dir: 'mipmap-mdpi', size: 48, radius: 11, fontSize: 32, dotSize: 4 },
      { dir: 'mipmap-hdpi', size: 72, radius: 17, fontSize: 48, dotSize: 6 },
      { dir: 'mipmap-xhdpi', size: 96, radius: 23, fontSize: 64, dotSize: 8 },
      { dir: 'mipmap-xxhdpi', size: 144, radius: 34, fontSize: 96, dotSize: 12 },
      { dir: 'mipmap-xxxhdpi', size: 192, radius: 46, fontSize: 128, dotSize: 16 },
    ];

    for (const m of mipmaps) {
      await page.setViewportSize({ width: m.size, height: m.size });
      await page.evaluate(({ size, radius, fontSize, dotSize }) => {
        const el = document.getElementById('icon-root');
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = `${radius}px`;
        el.style.borderWidth = '1.5px';
        document.querySelector('.letter').style.fontSize = `${fontSize}px`;
        document.querySelector('.letter').style.transform = 'translateY(-2px)';
        document.querySelector('.dot').style.width = `${dotSize}px`;
        document.querySelector('.dot').style.height = `${dotSize}px`;
        document.querySelector('.dot').style.marginLeft = '2px';
        document.querySelector('.dot').style.marginBottom = '6px';
      }, m);

      const squareBuf = await root.screenshot({ omitBackground: true });
      const targetPath = path.join(androidRes, m.dir);
      if (fs.existsSync(targetPath)) {
        fs.writeFileSync(path.join(targetPath, 'ic_launcher.png'), squareBuf);
        fs.writeFileSync(path.join(targetPath, 'ic_launcher_foreground.png'), squareBuf);
      }

      // Round icon
      await page.evaluate(() => {
        const el = document.getElementById('icon-root');
        el.style.borderRadius = '50%';
      });
      const roundBuf = await root.screenshot({ omitBackground: true });
      if (fs.existsSync(targetPath)) {
        fs.writeFileSync(path.join(targetPath, 'ic_launcher_round.png'), roundBuf);
      }
    }
    console.log('✅ Generated Android launcher icons in mipmap folders!');
  }

  console.log('✅ Generated all icons with beige background, red B, and black dot successfully!');
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
