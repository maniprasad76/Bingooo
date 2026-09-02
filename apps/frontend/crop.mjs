import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const src = 'C:/Users/manip/.gemini/antigravity-ide/brain/80115de1-e232-4fda-b340-c6fe81fc4e8a/.user_uploaded/media_1788368591204.png';
const outDir = 'C:/Users/manip/Desktop/bingooo/apps/frontend/public/images/landing';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const crops = [
  // 1. Hero Model
  { name: 'hero-model.png', left: 340, top: 68, width: 342, height: 217 },

  // 2. Categories
  { name: 'cat-tshirts.png', left: 24, top: 324, width: 152, height: 132 },
  { name: 'cat-hoodies.png', left: 184, top: 324, width: 152, height: 132 },
  { name: 'cat-jeans.png', left: 344, top: 324, width: 152, height: 132 },
  { name: 'cat-custom.png', left: 504, top: 324, width: 152, height: 132 },

  // 3. Product Cards
  { name: 'prod-oversized.png', left: 25, top: 586, width: 150, height: 102 },
  { name: 'prod-chaos.png', left: 183, top: 586, width: 150, height: 102 },
  { name: 'prod-hoodie.png', left: 341, top: 586, width: 150, height: 102 },
  { name: 'prod-jeans.png', left: 499, top: 586, width: 150, height: 102 },

  // 4. Value Proposition Model
  { name: 'brand-model.png', left: 0, top: 749, width: 145, height: 87 },

  // 5. UGC 6 Cards
  { name: 'ugc-1.png', left: 25, top: 874, width: 98, height: 68 },
  { name: 'ugc-2.png', left: 128, top: 874, width: 98, height: 68 },
  { name: 'ugc-3.png', left: 231, top: 874, width: 98, height: 68 },
  { name: 'ugc-4.png', left: 334, top: 874, width: 98, height: 68 },
  { name: 'ugc-5.png', left: 437, top: 874, width: 98, height: 68 },
  { name: 'ugc-6.png', left: 540, top: 874, width: 98, height: 68 },
];

async function run() {
  for (const c of crops) {
    const dest = path.join(outDir, c.name);
    await sharp(src)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .png()
      .toFile(dest);
    console.log(`Saved ${c.name} (${c.width}x${c.height})`);
  }
  console.log('All crops created successfully with sharp!');
}

run().catch(console.error);
