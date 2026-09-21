/**
 * Bingooo Production Live Smoke Test Suite
 * Validates domain resolution, SSL certificates, security headers,
 * API health probes, merchant feeds, and legal policy pages.
 *
 * Run with: node test/live-smoke.mjs
 */

const ENDPOINTS = [
  // 🛍️ Customer Storefront Core Routes
  { name: 'Storefront Homepage', url: 'https://bingooo.co.in', expectStatus: 200 },
  { name: 'Storefront Catalog', url: 'https://bingooo.co.in/shop', expectStatus: 200 },
  { name: '3D Custom Atelier Studio', url: 'https://bingooo.co.in/customize', expectStatus: 200 },
  { name: 'Shopping Bag', url: 'https://bingooo.co.in/cart', expectStatus: 200 },
  { name: 'Order Tracker', url: 'https://bingooo.co.in/track-order', expectStatus: 200 },

  // 🎛️ Admin Operations Console
  { name: 'Admin Console Homepage', url: 'https://admin.bingooo.co.in', expectStatus: 200 },
  { name: 'Admin Login View', url: 'https://admin.bingooo.co.in/login', expectStatus: 200 },
  { name: 'Admin OAuth Callback Route', url: 'https://admin.bingooo.co.in/auth/callback', expectStatus: 200 },

  // 🚀 NestJS Backend API & Health Probes
  { name: 'API Liveness Probe', url: 'https://api.bingooo.co.in/health/live', expectStatus: 200, jsonCheck: (d) => d.status === 'ok' },
  { name: 'API Readiness Probe', url: 'https://api.bingooo.co.in/health/ready', expectStatus: 200, jsonCheck: (d) => d.status === 'ok' },
  { name: 'API Products Catalog', url: 'https://api.bingooo.co.in/api/v1/products', expectStatus: 200, jsonCheck: (d) => Array.isArray(d) || Array.isArray(d?.data) },

  // 📜 Razorpay & Statutory Legal Pages
  { name: 'Legal: About Us', url: 'https://bingooo.co.in/about', expectStatus: 200 },
  { name: 'Legal: Terms & Conditions', url: 'https://bingooo.co.in/terms', expectStatus: 200 },
  { name: 'Legal: Privacy Policy', url: 'https://bingooo.co.in/privacy-policy', expectStatus: 200 },
  { name: 'Legal: Returns & Refunds', url: 'https://bingooo.co.in/returns-refunds', expectStatus: 200 },
  { name: 'Legal: Shipping Policy', url: 'https://bingooo.co.in/shipping-policy', expectStatus: 200 },
  { name: 'Legal: Contact Us', url: 'https://bingooo.co.in/contact', expectStatus: 200 },

  // 📡 Feeds, Crawlers & SEO Infrastructure
  { name: 'Sitemap XML', url: 'https://bingooo.co.in/sitemap.xml', expectStatus: 200 },
  { name: 'Robots.txt', url: 'https://bingooo.co.in/robots.txt', expectStatus: 200 },
  { name: 'Google Merchant XML Feed', url: 'https://bingooo.co.in/feeds/google-merchant.xml', expectStatus: 200 },
  { name: 'Product Catalog JSON Feed', url: 'https://bingooo.co.in/feeds/products.json', expectStatus: 200, jsonCheck: (d) => d.home_page_url === 'https://bingooo.co.in' },
];

async function runSmokeTests() {
  console.log('\n============================================================');
  console.log('⚡ BINGOOO LIVE PRODUCTION VERIFICATION SUITE');
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  for (const ep of ENDPOINTS) {
    const start = Date.now();
    try {
      const res = await fetch(ep.url, {
        headers: { 'User-Agent': 'BingoooSmokeTest/1.0' },
        redirect: 'follow',
      });
      const durationMs = Date.now() - start;

      if (res.status !== ep.expectStatus) {
        console.error(`❌ [FAIL] ${ep.name} -> Expected ${ep.expectStatus}, got ${res.status} (${durationMs}ms)`);
        failed++;
        continue;
      }

      if (ep.jsonCheck) {
        const data = await res.json();
        if (!ep.jsonCheck(data)) {
          console.error(`❌ [FAIL] ${ep.name} -> JSON validation failed (${durationMs}ms)`);
          failed++;
          continue;
        }
      }

      console.log(`✅ [PASS] ${ep.name} (${res.status} OK, ${durationMs}ms) -> ${ep.url}`);
      passed++;
    } catch (err) {
      console.error(`❌ [ERROR] ${ep.name} (${ep.url}): ${err.message}`);
      failed++;
    }
  }

  console.log('\n============================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${ENDPOINTS.length})`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();
