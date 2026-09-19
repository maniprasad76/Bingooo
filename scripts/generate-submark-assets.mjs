import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_IMAGE = 'C:/Users/manip/.gemini/antigravity-ide/brain/c2a7e0d1-2a53-40a6-99d1-064735e6ca02/.user_uploaded/media_1789795320416.jpg';

if (!fs.existsSync(SOURCE_IMAGE)) {
  console.error('Source image not found at', SOURCE_IMAGE);
  process.exit(1);
}

const BG_COLOR = '#F9EEDC';

// Build multi-size Windows ICO from PNG buffers
function buildIco(pngEntries) {
  const count = pngEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const { size, buffer } of pngEntries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function run() {
  console.log('Loading source image...');
  const masterSharp = sharp(SOURCE_IMAGE);
  const metadata = await masterSharp.metadata();
  console.log(`Source dimensions: ${metadata.width}x${metadata.height}`);

  // Generate a lossless 1024x1024 PNG master
  const masterPng = await masterSharp
    .clone()
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  const publicDirs = [
    path.resolve('apps/frontend/public'),
    path.resolve('apps/admin/public'),
  ];

  for (const pDir of publicDirs) {
    if (!fs.existsSync(pDir)) continue;

    console.log(`Generating web assets in ${pDir}...`);

    // 1. submark.png (1024x1024 master)
    fs.writeFileSync(path.join(pDir, 'submark.png'), masterPng);

    // 2. High-res sizes
    const sizes = [
      { name: 'icon-512.png', size: 512 },
      { name: 'app-icon.png', size: 512 },
      { name: 'app-icon-white.png', size: 512 },
      { name: 'brand-logo.png', size: 512 },
      { name: 'favicon.png', size: 512 },
      { name: 'icon-192.png', size: 192 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'brand-logo-32.png', size: 32 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'brand-logo-16.png', size: 16 },
      { name: 'favicon-16x16.png', size: 16 },
    ];

    for (const { name, size } of sizes) {
      const buf = await sharp(masterPng)
        .resize(size, size, { kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9 })
        .toBuffer();
      fs.writeFileSync(path.join(pDir, name), buf);
    }

    // 3. Multi-resolution ICO (16, 32, 48)
    const icoSizes = [16, 32, 48];
    const icoEntries = [];
    for (const size of icoSizes) {
      const buffer = await sharp(masterPng)
        .resize(size, size, { kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer();
      icoEntries.push({ size, buffer });
    }
    const icoBuffer = buildIco(icoEntries);
    fs.writeFileSync(path.join(pDir, 'favicon.ico'), icoBuffer);

    // 4. SVG Favicon & Brand-logo
    // Create an ultra-clean SVG containing the high-res submark image encoded as data URI for 100% pixel fidelity
    const base64Png = masterPng.toString('base64');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" rx="220" fill="#F9EEDC" />
  <image href="data:image/png;base64,${base64Png}" width="1024" height="1024" />
</svg>
`;
    fs.writeFileSync(path.join(pDir, 'brand-logo.svg'), svgContent);
    fs.writeFileSync(path.join(pDir, 'favicon.svg'), svgContent);
  }

  // 5. Android Launcher Icons
  const androidResDir = path.resolve('apps/frontend/android/app/src/main/res');
  if (fs.existsSync(androidResDir)) {
    console.log(`Generating Android icons in ${androidResDir}...`);

    const mipmapDensities = [
      { dir: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
      { dir: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
      { dir: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
      { dir: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
      { dir: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
    ];

    for (const { dir, launcherSize, foregroundSize } of mipmapDensities) {
      const targetDir = path.join(androidResDir, dir);
      if (!fs.existsSync(targetDir)) continue;

      // Regular launcher (squircle/rounded square)
      const launcherBuf = await sharp(masterPng)
        .resize(launcherSize, launcherSize, { kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), launcherBuf);

      // Circular launcher (masked circle)
      const circleSvg = Buffer.from(
        `<svg width="${launcherSize}" height="${launcherSize}"><circle cx="${launcherSize / 2}" cy="${launcherSize / 2}" r="${launcherSize / 2}" fill="#fff"/></svg>`
      );
      const roundBuf = await sharp(masterPng)
        .resize(launcherSize, launcherSize, { kernel: sharp.kernel.lanczos3 })
        .composite([{ input: circleSvg, blend: 'dest-in' }])
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundBuf);

      // Adaptive icon foreground (safe zone is center 66%, so scale submark inside foreground)
      const iconScaledSize = Math.round(foregroundSize * 0.72);
      const iconScaled = await sharp(masterPng)
        .resize(iconScaledSize, iconScaledSize, { kernel: sharp.kernel.lanczos3 })
        .toBuffer();

      const fgBuf = await sharp({
        create: {
          width: foregroundSize,
          height: foregroundSize,
          channels: 4,
          background: { r: 249, g: 238, b: 220, alpha: 1 },
        },
      })
        .composite([
          {
            input: iconScaled,
            top: Math.round((foregroundSize - iconScaledSize) / 2),
            left: Math.round((foregroundSize - iconScaledSize) / 2),
          },
        ])
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgBuf);
    }

    // Android Splash screens
    const splashFiles = [
      { rel: 'drawable/splash.png', w: 1024, h: 1024 },
      { rel: 'drawable-land-mdpi/splash.png', w: 480, h: 320 },
      { rel: 'drawable-land-hdpi/splash.png', w: 800, h: 480 },
      { rel: 'drawable-land-xhdpi/splash.png', w: 1280, h: 720 },
      { rel: 'drawable-land-xxhdpi/splash.png', w: 1600, h: 960 },
      { rel: 'drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280 },
      { rel: 'drawable-port-mdpi/splash.png', w: 320, h: 480 },
      { rel: 'drawable-port-hdpi/splash.png', w: 480, h: 800 },
      { rel: 'drawable-port-xhdpi/splash.png', w: 720, h: 1280 },
      { rel: 'drawable-port-xxhdpi/splash.png', w: 960, h: 1600 },
      { rel: 'drawable-port-xxxhdpi/splash.png', w: 1024, h: 1024 },
    ];

    for (const { rel, w, h } of splashFiles) {
      const splashPath = path.join(androidResDir, rel);
      if (fs.existsSync(splashPath)) {
        const iconDim = Math.round(Math.min(w, h) * 0.45);
        const iconBuf = await sharp(masterPng)
          .resize(iconDim, iconDim, { kernel: sharp.kernel.lanczos3 })
          .toBuffer();

        const splashOut = await sharp({
          create: {
            width: w,
            height: h,
            channels: 4,
            background: { r: 249, g: 238, b: 220, alpha: 1 },
          },
        })
          .composite([
            {
              input: iconBuf,
              top: Math.round((h - iconDim) / 2),
              left: Math.round((w - iconDim) / 2),
            },
          ])
          .png()
          .toBuffer();

        fs.writeFileSync(splashPath, splashOut);
      }
    }
  }

  console.log('All submark assets successfully generated!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
