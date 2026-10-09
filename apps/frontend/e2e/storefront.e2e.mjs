// Storefront browser E2E: runs the built app (dist/) in Chromium against a
// mocked API and checks the flows customers depend on. No backend needed.
//
//   npm run build -w apps/frontend && npm run test:e2e -w apps/frontend
//
// dist/ is served with Vercel's routing (file, then folder index.html, then the
// app.html SPA shell). The catalog below is fake; API calls never leave the box.

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
if (!fs.existsSync(path.join(DIST, 'app.html'))) {
  console.error('dist/app.html not found. Run `npm run build -w apps/frontend` first.');
  process.exit(1);
}

// ── Static server with Vercel-style routing ────────────────────────────────

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const candidates = [path.join(DIST, urlPath), path.join(DIST, urlPath, 'index.html')];
  let file = candidates.find((f) => f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) {
    // Missing assets 404 (e.g. Vercel's own /_vercel scripts); page routes get the SPA shell.
    if (path.extname(urlPath)) { res.writeHead(404); return res.end(); }
    file = path.join(DIST, 'app.html');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ── Mock catalog ─────────────────────────────────────────────────────────────

const img = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="5"><rect width="4" height="5" fill="#ccc"/></svg>');
const variant = (id, size, color, hex) => ({ id, sku: id.toUpperCase(), size, color, colorHex: hex, price: 999, inStock: true, stockQuantity: 5, reservedQuantity: 0 });
const tee = {
  id: 'p1', slug: 'heavy-tee', title: 'Heavy Tee', status: 'active', base_price: 999, compare_at_price: 1299, description: 'Heavy cotton tee.',
  category: { id: 'c1', name: 'T-Shirts', slug: 't-shirts' }, category_id: 'c1', images: [{ url: img, is_primary: true }],
  variants: [variant('v1', 'M', 'Black', '#111'), variant('v2', 'L', 'Black', '#111'), variant('v3', 'S', 'Cream', '#eee')],
};
const hoodie = {
  ...tee, id: 'p2', slug: 'big-hoodie', title: 'Big Hoodie', category: { id: 'c2', name: 'Hoodies', slug: 'hoodies' }, category_id: 'c2',
  variants: [variant('v4', 'XL', 'Grey', '#888'), variant('v5', 'XXL', 'Grey', '#888')],
};
const categories = [{ id: 'c1', name: 'T-Shirts', slug: 't-shirts', is_active: true }, { id: 'c2', name: 'Hoodies', slug: 'hoodies', is_active: true }];

// Custom studio catalogue as configured in the admin panel.
const studioGarment = (over) => ({
  style: 'tshirt', compareAtPrice: null, description: '', isActive: true, sizes: ['S', 'M', 'L'], activeSizes: ['M', 'L'],
  sizeMeasurements: { in: [{ size: 'M', chest: '44 in', length: '28 in' }], cm: [] },
  colors: [{ id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: img, backImageUrl: '', isActive: true }],
  ...over,
});
const studioConfig = {
  updatedAt: '2026-10-09T00:00:00.000Z',
  garments: [
    studioGarment({ id: 'oversized', name: 'Oversized T-Shirt', shortName: 'OVERSIZED', price: 649, compareAtPrice: 1499 }),
    studioGarment({ id: 'heavy-hoodie', name: 'Heavy Hoodie', shortName: 'HOODIE', style: 'hoodie', price: 799 }),
    studioGarment({ id: 'hidden-tee', name: 'Hidden Tee', shortName: 'HIDDEN', price: 499, isActive: false }),
  ],
};
let studioEmpty = false;

function apiData(rawUrl) {
  const url = new URL(rawUrl);
  const p = url.pathname.replace(/^.*\/api\/v1/, '');
  if (p === '/categories') return categories;
  if (p === '/products/heavy-tee') return tee;
  if (p === '/products/big-hoodie') return hoodie;
  if (p.startsWith('/products')) {
    const slug = url.searchParams.get('categorySlug') || url.searchParams.get('category');
    const q = (url.searchParams.get('search') || '').toLowerCase();
    return [tee, hoodie].filter((x) => (!slug || x.category.slug === slug) && (!q || x.title.toLowerCase().includes(q)));
  }
  if (p.startsWith('/reviews')) return { reviews: [], summary: { average: 0, count: 0 } };
  if (p === '/customizations/studio/config') return studioEmpty ? { garments: [], updatedAt: null } : studioConfig;
  return [];
}

// ── Checks ───────────────────────────────────────────────────────────────────

const results = [];
const check = (ok, name, extra = '') => {
  results.push(ok);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('bingooo_community_invite', JSON.stringify({ status: 'joined', at: Date.now() }));
    localStorage.setItem('bingooo_recent_searches', JSON.stringify(['oversized tee']));
  });
  await ctx.route(/\/api\/v1\//, (route) =>
    // Signed-out visitor: endpoints behind AuthGuard answer 401.
    /\/reviews\/eligibility/.test(route.request().url())
      ? route.fulfill({
          status: 401,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true' },
          body: JSON.stringify({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' } }),
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true' },
          body: JSON.stringify({ success: true, data: apiData(route.request().url()), timestamp: new Date().toISOString(), requestId: 'e2e' }),
        }),
  );
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /re-render|Maximum update depth/i.test(m.text())) errors.push(m.text()); });
  const settle = (ms = 1200) => page.waitForTimeout(ms);
  const navigateClientSide = (to) => page.evaluate((url) => { history.pushState({}, '', url); dispatchEvent(new PopStateEvent('popstate')); }, to);
  const mainText = () => page.locator('main').last().innerText();

  console.log('-- search');
  await page.goto(`${BASE}/search?q=heavy`, { waitUntil: 'load' }); await settle();
  const searchInput = page.locator('input[type="search"], input[placeholder*="earch" i]').first();
  check((await searchInput.inputValue()) === 'heavy', 'search input starts from ?q=');
  await navigateClientSide('/search?q=hoodie'); await settle(800);
  check((await searchInput.inputValue()) === 'hoodie', 'search input follows a URL change');

  console.log('-- category');
  await page.goto(`${BASE}/category/t-shirts`, { waitUntil: 'load' }); await settle();
  check(await page.getByText('Heavy Tee').first().isVisible(), 'category page lists its products');
  await navigateClientSide('/category/hoodies'); await settle(1500);
  check(await page.getByText('Big Hoodie').first().isVisible(), 'switching category updates the listing');

  console.log('-- product');
  await page.goto(`${BASE}/product/heavy-tee`, { waitUntil: 'load' }); await settle(1800);
  const tee1 = await mainText();
  check(/COLOR:\s*BLACK/i.test(tee1) && /size M\b/i.test(tee1), 'first colour and size are selected');
  await navigateClientSide('/product/big-hoodie'); await settle(1800);
  const hoodie1 = await mainText();
  check(/COLOR:\s*GREY/i.test(hoodie1) && /size XL\b/i.test(hoodie1), 'another product resets colour and size to valid options');

  console.log('-- review link from the post-delivery email');
  await page.goto(`${BASE}/product/heavy-tee?review=1`, { waitUntil: 'load' }); await settle(2500);
  check(await page.getByText(/Sign In To Review/i).first().isVisible().catch(() => false), 'review link opens the review form and asks a signed-out visitor to sign in');
  await page.keyboard.press('Escape'); await settle(400);

  console.log('-- custom studio (catalogue from the admin panel)');
  await page.goto(`${BASE}/customize`, { waitUntil: 'load' }); await settle(1500);
  const studioButtons = await page.locator('button').allInnerTexts();
  check(studioButtons.some((t) => t.includes('OVERSIZED')) && studioButtons.some((t) => t.includes('HOODIE')), 'garment picker shows the admin garments');
  check(!studioButtons.some((t) => t.includes('HIDDEN')), 'hidden garments are not offered');
  check(await page.locator('img[alt="Oversized T-Shirt - Black (front)"]').isVisible(), 'uploaded front photo is shown');
  const sizeButtons = (await page.locator('button').allInnerTexts()).map((t) => t.trim());
  check(sizeButtons.includes('M') && sizeButtons.includes('L') && !sizeButtons.includes('S'), 'only the sizes the admin offers are selectable');
  await page.getByRole('button', { name: 'BACK', exact: true }).first().click(); await settle(500);
  check(await page.getByText(/Back photo coming soon/i).isVisible(), 'missing back photo shows a placeholder, not a broken image');
  await page.goto(`${BASE}/customize?fit=hoodie`, { waitUntil: 'load' }); await settle(1500);
  check(await page.locator('img[alt^="Heavy Hoodie"]').isVisible(), '?fit=hoodie selects the hoodie by style');
  studioEmpty = true;
  await page.goto(`${BASE}/customize`, { waitUntil: 'load' }); await settle(1500);
  check(await page.getByText(/Custom studio opening soon/i).isVisible(), 'empty catalogue shows "opening soon" instead of placeholder garments');
  studioEmpty = false;
  check(errors.length === 0, 'custom studio renders without errors', errors.join(' | '));

  console.log('-- search modal');
  await page.goto(`${BASE}/shop`, { waitUntil: 'load' }); await settle();
  await page.keyboard.press('Control+k'); await settle(600);
  const modalInput = page.locator('input[placeholder*="earch" i]').last();
  check(await page.getByText('oversized tee').first().isVisible().catch(() => false), 'recent searches are shown');
  await modalInput.fill('hood'); await settle(400);
  await page.keyboard.press('Escape'); await settle(400);
  await page.keyboard.press('Control+k'); await settle(600);
  check((await modalInput.inputValue()) === '', 'query is cleared after reopening');
  check(await page.evaluate(() => document.activeElement?.tagName === 'INPUT'), 'input is focused on open');
  await page.keyboard.press('Escape'); await settle(400);

  console.log('-- cart drawer');
  await page.getByRole('button', { name: /cart|bag/i }).first().click(); await settle(600);
  const open = await page.locator('[role="dialog"]').count();
  await page.keyboard.press('Escape'); await settle(700);
  check(open > 0 && (await page.locator('[role="dialog"]').count()) < open, 'cart drawer opens and Escape closes it');

  check(errors.length === 0, 'no page errors or render loops', errors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r).length;
console.log(`\nSUMMARY: ${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
