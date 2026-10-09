import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────
// Custom studio catalogue: everything comes from the admin panel, bad input is
// rejected with a clear message, and links to the removed bundled mockups
// (/custom/*.png) are cleaned out of stored data.
// ─────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}
const results: TestResult[] = [];
function assert(condition: boolean, name: string, details?: string) {
  results.push({ name, passed: condition, details });
  if (condition) console.log(`  ✅ [PASS] ${name}`);
  else console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
}

function rejection(fn: () => unknown): string {
  try {
    fn();
    return '';
  } catch (err: any) {
    return `${err?.getStatus?.() ?? ''} ${err?.response?.message ?? err?.message ?? ''}`;
  }
}

const PHOTO = 'https://zqmrmgwxhrdscippanuv.supabase.co/storage/v1/object/public/product-images/uploads/tee-front.png';

const garment = (over: any = {}) => ({
  name: 'Oversized T-Shirt',
  price: 649,
  compareAtPrice: 1499,
  isActive: true,
  sizes: ['S', 'M', 'L'],
  activeSizes: ['M', 'L'],
  colors: [{ name: 'Black', hex: '#171717', frontImageUrl: PHOTO, backImageUrl: '', isActive: true }],
  ...over,
});

async function run() {
  // Importing the store loads (and later rewrites) the local store.json; keep a copy.
  const { getDataDir } = await import('../src/common/utils/paths.util');
  const storeFile = path.join(getDataDir(), 'store.json');
  const storeBackup = fs.existsSync(storeFile) ? fs.readFileSync(storeFile) : null;

  const { db, waitForPendingWrites } = await import('../src/common/database/store');
  const { CustomizationsService } = await import('../src/customizations/customizations.service');
  const service = new CustomizationsService();
  const savedConfig = db.customizer_config;

  try {
    console.log('🧵 1. No built-in garments');
    db.customizer_config = undefined as any;
    const empty = service.getStudioConfig();
    assert(Array.isArray(empty.garments) && empty.garments.length === 0, 'Nothing configured → no garments (no hard-coded defaults)');
    db.customizer_config = { garments: [], updatedAt: null };
    assert(service.getStudioConfig().garments.length === 0, 'An emptied catalogue stays empty (deleted garments do not come back)');

    console.log('🧹 2. Stored data is cleaned');
    db.customizer_config = {
      updatedAt: '2026-10-01T00:00:00.000Z',
      garments: [
        {
          id: 'hoodie',
          name: 'Drop Shoulder Hoodie',
          price: 799,
          compareAtPrice: 1799,
          isActive: true,
          sizes: ['S', 'M'],
          activeSizes: ['S', 'M', 'XXL'],
          colors: [
            { id: 'black', name: 'Obsidian Black', hex: '#171717', frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png', isActive: true },
            { id: 'white', name: 'Pure White', hex: '#ffffff', frontImageUrl: PHOTO, isActive: true },
          ],
        },
      ],
    };
    const cleaned = service.getStudioConfig().garments[0];
    assert(cleaned.colors[0].frontImageUrl === '' && cleaned.colors[0].backImageUrl === '', 'Links to the removed /custom/*.png mockups are dropped');
    assert(cleaned.colors[1].frontImageUrl === PHOTO, 'Uploaded photo links are kept');
    assert(cleaned.style === 'hoodie' && cleaned.shortName === 'HOODIE', 'Style and button label inferred for existing garments');
    assert(JSON.stringify(cleaned.activeSizes) === JSON.stringify(['S', 'M']), 'Offered sizes limited to the garment\'s own sizes');
    assert(cleaned.colors[1].hex === '#FFFFFF' && cleaned.colors[1].textContrast === '#171717', 'Colour hex normalised and ink contrast derived');
    assert(
      (db.customizer_config.garments[0].colors[0].frontImageUrl ?? '') === '',
      'Cleanup is persisted, not just applied on the fly',
    );

    console.log('✍️ 3. Admin saves are validated');
    const ok = service.updateStudioConfig({
      garments: [
        garment(),
        garment({ name: 'Oversized T-Shirt', price: 699, sizes: ['36', '38', '38', ' 40 '], activeSizes: ['38', '40'] }),
        garment({ name: 'Polo', style: 'polo', compareAtPrice: 100 }),
      ],
    });
    const [g1, g2, g3] = ok.garments;
    assert(g1.id === 'oversized-t-shirt' && g2.id === 'oversized-t-shirt-2', 'New garments get unique ids from their names', `${g1.id}, ${g2.id}`);
    assert(JSON.stringify(g2.sizes) === JSON.stringify(['36', '38', '40']), 'Numeric sizes allowed; duplicates and spaces removed', JSON.stringify(g2.sizes));
    assert(g3.style === 'polo' && g3.compareAtPrice === null, 'Compare-at price below the selling price is dropped');
    assert(typeof ok.updatedAt === 'string' && db.customizer_config.garments.length === 3, 'Saved config replaces the stored one');

    const bad = (over: any) => rejection(() => service.updateStudioConfig({ garments: [garment(over)] }));
    assert(/^400 .*price/.test(bad({ price: 0 })), 'Price must be positive', bad({ price: 0 }));
    assert(/^400 .*name/.test(bad({ name: '  ' })), 'Garment needs a name', bad({ name: '  ' }));
    assert(/^400 .*hex/.test(bad({ colors: [{ name: 'Red', hex: 'red' }] })), 'Colour needs a valid hex code');
    assert(/^400 .*photos/.test(bad({ colors: [{ name: 'Red', hex: '#E6321C', frontImageUrl: 'javascript:alert(1)' }] })), 'javascript: photo links rejected');
    assert(/^400 .*photos/.test(bad({ colors: [{ name: 'Red', hex: '#E6321C', frontImageUrl: 'data:image/png;base64,AAAA' }] })), 'Inline base64 photos rejected (they would bloat the database)');
    assert(/^400 .*photos/.test(bad({ colors: [{ name: 'Red', hex: '#E6321C', frontImageUrl: 'http://evil.example/x.png' }] })), 'Plain http photo links rejected outside localhost');
    assert(rejection(() => service.updateStudioConfig({})).startsWith('400'), 'A payload without a garments list is rejected');
    assert(db.customizer_config.garments.length === 3, 'Rejected saves leave the stored config untouched');

    console.log('🎨 4. Colour endpoints go through the same rules');
    const added = service.addColorToGarment('polo', { name: 'Sage Green', hex: '4a584a', frontImageUrl: PHOTO });
    assert(added.color?.id === 'sage-green' && added.color.hex === '#4A584A', 'Added colour gets an id and a normalised hex');
    assert(rejection(() => service.addColorToGarment('polo', { name: 'Bad', hex: '#000000', frontImageUrl: 'ftp://x/y.png' })).startsWith('400'), 'Added colour with a bad photo link is rejected');
    service.deleteGarmentColor('polo', 'sage-green');
    assert(!service.getStudioConfig().garments.find((g) => g.id === 'polo')!.colors.some((c) => c.id === 'sage-green'), 'Colours can be deleted');

    console.log('📐 5. Print areas line up with each garment photo');
    const { normalizeStudioConfig, DEFAULT_PRINT_AREAS } = await import('../src/customizations/studio-config');
    const [tee, hoodie] = normalizeStudioConfig({ garments: [garment(), garment({ name: 'Heavy Hoodie', style: 'hoodie' })] }, true).garments;
    assert(JSON.stringify(tee.printAreas) === JSON.stringify(DEFAULT_PRINT_AREAS.tshirt), 'A garment without saved print areas gets its style defaults', JSON.stringify(tee.printAreas));
    assert(JSON.stringify(hoodie.printAreas) === JSON.stringify(DEFAULT_PRINT_AREAS.hoodie), 'Hoodies get hoodie placement by default');
    const tuned = normalizeStudioConfig(
      { garments: [garment({ printAreas: { front: { x: 48.04, y: 35, w: 40 }, chest: { x: 200, y: -4, w: 0 }, back: { x: 'left', y: null } } })] },
      true,
    ).garments[0].printAreas;
    assert(tuned.front.x === 48 && tuned.front.y === 35 && tuned.front.w === 40, 'Adjusted print areas are saved (to 0.1%)', JSON.stringify(tuned.front));
    assert(tuned.chest.x === 95 && tuned.chest.y === 5 && tuned.chest.w === 5, 'Out-of-range values are kept on the photo', JSON.stringify(tuned.chest));
    assert(JSON.stringify(tuned.back) === JSON.stringify(DEFAULT_PRINT_AREAS.tshirt.back), 'Unreadable values fall back to the defaults', JSON.stringify(tuned.back));
  } finally {
    db.customizer_config = savedConfig;
    // Local disk flushes are async: let any in-flight one land first, or it
    // would overwrite the restored store.json with test data.
    await waitForPendingWrites();
    if (storeBackup) fs.writeFileSync(storeFile, storeBackup);
  }

  const failed = results.filter((r) => !r.passed).length;
  console.log('\n======================================================');
  console.log(`SUMMARY: ${results.length - failed} passed, ${failed} failed out of ${results.length} tests`);
  console.log('======================================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});
