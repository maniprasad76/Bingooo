// Build-time SEO prerender.
//
// The storefront is a single-page app, so without this every URL would ship
// the same empty HTML shell. Search engines that run JavaScript cope, but AI
// crawlers (ChatGPT, Perplexity, Claude, Gemini grounding) and link previews
// mostly read the raw HTML. This script fetches the live catalog and writes,
// into dist/:
//   - a real HTML page per product, category and key static page
//     (title, description, canonical, Open Graph, JSON-LD and readable content)
//   - app.html: the neutral shell served for every other route (see vercel.json)
//   - sitemap.xml, llms.txt, feeds/google-merchant.xml and feeds/products.json built from the catalog
//
// If the API can't be reached the build still succeeds with the static pages
// only. Products added later appear once the site is rebuilt; the backend can
// trigger that automatically via VERCEL_DEPLOY_HOOK_URL.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SITE_URL,
  POLICY,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  productUrl,
  categoryUrl,
  stripHtml,
  truncate,
  formatSeoTitle,
  productPricing,
  productImages,
  productSeoTitle,
  productSeoDescription,
  productSchema,
  breadcrumbSchema,
  categorySeoTitle,
  categorySeoDescription,
  categorySchema,
} from '../src/lib/seo/catalog-seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const TODAY = new Date().toISOString().slice(0, 10);

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`[SEO prerender] ${TEMPLATE_PATH} not found. Run vite build first.`);
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const xmlEsc = (value) => esc(value).replace(/&#39;/g, '&apos;');

// JSON inside <script>: escape "<" so "</script>" in data can't end the tag.
const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const inr = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/**
 * VITE_API_URL holds the API origin (the app appends /api/v1 itself, see
 * src/lib/api/client.ts); accept it with or without the /api/v1 suffix.
 */
function resolveApiBase() {
  const candidates = [process.env.SEO_API_URL, process.env.VITE_API_URL, 'https://api.bingooo.co.in'];
  for (const raw of candidates) {
    const origin = String(raw || '').trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    if (/^https?:\/\//.test(origin)) return `${origin}/api/v1`;
  }
  return 'https://api.bingooo.co.in/api/v1';
}

async function fetchJson(url, { attempts = 3, timeoutMs = 45_000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      return body && typeof body === 'object' && 'data' in body ? body.data : body;
    } catch (err) {
      lastError = err;
      // The API host can be cold-starting; wait before retrying.
      if (attempt < attempts) await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
  throw lastError;
}

const asList = (data) => (Array.isArray(data) ? data : data?.items || data?.products || data?.data || []);

async function loadCatalog() {
  const api = resolveApiBase();
  try {
    const [categoriesRaw, productsRaw] = await Promise.all([
      fetchJson(`${api}/categories`),
      fetchJson(`${api}/products?limit=1000`),
    ]);
    const categories = asList(categoriesRaw).filter((c) => c?.slug && c.is_active !== false && c.status !== 'inactive');
    const listed = asList(productsRaw).filter((p) => p?.slug && (!p.status || p.status === 'active'));

    // List responses can be trimmed; fetch each product's full record for complete data.
    const products = [];
    for (const item of listed) {
      try {
        const full = await fetchJson(`${api}/products/${encodeURIComponent(item.slug)}`, { attempts: 2, timeoutMs: 20_000 });
        if (full?.slug && (!full.status || full.status === 'active')) products.push(full);
      } catch {
        products.push(item);
      }
    }
    console.log(`[SEO prerender] Catalog from ${api}: ${categories.length} categories, ${products.length} products`);
    return { categories, products, ok: true };
  } catch (err) {
    // Loud on purpose: the site still deploys, but products get no crawlable pages until the next build.
    console.warn(`[SEO prerender] WARNING: catalog unavailable from ${api} (${err?.message || err}); product and category pages, sitemap entries and the Merchant feed were NOT generated.`);
    return { categories: [], products: [], ok: false };
  }
}

// ── HTML template handling ──────────────────────────────────────────────────

const builtHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
if (builtHtml.includes('id="seo-prerender"')) {
  console.error('[SEO prerender] dist/ is already prerendered. Run vite build first.');
  process.exit(1);
}

/** The inline site-wide JSON-LD graph from index.html, parsed. */
function readSiteGraph(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return { block: null, graph: null };
  try {
    return { block: match[0], graph: JSON.parse(match[1]) };
  } catch {
    return { block: match[0], graph: null };
  }
}

const { block: siteGraphBlock, graph: siteGraph } = readSiteGraph(builtHtml);

/** Site-wide graph without the homepage FAQ (FAQ markup must match visible page content). */
function siteGraphWithoutFaq() {
  if (!siteGraph?.['@graph']) return null;
  return { ...siteGraph, '@graph': siteGraph['@graph'].filter((node) => node['@type'] !== 'FAQPage') };
}

function setTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

/**
 * Renders a page from the built shell.
 * @param {object} page
 * @param {string} page.title          full <title>
 * @param {string} page.description
 * @param {string} [page.canonical]
 * @param {string} [page.ogType]
 * @param {string} [page.ogImage]
 * @param {object[]} [page.schemas]    page JSON-LD (replaced by the app on load)
 * @param {string} [page.bodyHtml]     readable content for crawlers
 * @param {boolean} [page.keepHomeFaq]
 * @param {string[]} [page.extraHead]
 */
function renderPage(page) {
  let html = builtHtml;
  const title = esc(page.title);
  const description = esc(truncate(page.description, 160));
  const image = esc(page.ogImage || DEFAULT_OG_IMAGE);

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${esc(page.ogType || 'website')}" />`);
  html = setTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`);
  html = setTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);

  if (page.canonical) {
    const canonical = esc(page.canonical);
    html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`);
    html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`);
  } else {
    // The SPA shell serves many URLs; a fixed canonical/og:url would point them all at one page.
    html = html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, '');
    html = html.replace(/\s*<meta property="og:url" content="[^"]*"\s*\/?>/, '');
  }

  if (!page.keepHomeFaq && siteGraphBlock) {
    const graph = siteGraphWithoutFaq();
    html = html.replace(siteGraphBlock, graph ? `<script type="application/ld+json">${jsonLd(graph)}</script>` : '');
  }

  const head = [...(page.extraHead || [])];
  if (page.schemas?.length) {
    const data = page.schemas.length === 1 ? page.schemas[0] : page.schemas;
    // Same id the app's SEO component uses, so it replaces this block once it runs.
    head.push(`<script type="application/ld+json" id="bingooo-json-ld">${jsonLd(data)}</script>`);
  }
  if (head.length) html = html.replace('</head>', `    ${head.join('\n    ')}\n  </head>`);

  if (page.bodyHtml) {
    // Inside #root: visible to crawlers in the raw HTML, replaced by the app on load
    // (the loading screen covers it meanwhile). Same content the app renders.
    html = html.replace(
      /<div id="root">/,
      `<div id="root"><div id="seo-prerender" style="max-width:1100px;margin:0 auto;padding:32px 20px;font-family:Manrope,system-ui,sans-serif;color:#171717;background:#F7EEDB;line-height:1.6">${page.bodyHtml}</div>`,
    );
  }
  return html;
}

function writePage(routePath, html) {
  const dir = routePath ? path.join(DIST_DIR, routePath) : DIST_DIR;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
}

// ── Content blocks ──────────────────────────────────────────────────────────

const POLICY_FACTS = [
  'Free delivery on every order across India (typically 3–7 business days).',
  `${POLICY.returnDays}-day easy size exchange with free doorstep pickup.`,
  'Secure prepaid checkout via UPI, cards and net banking (Razorpay) — 5% off every prepaid order. No cash on delivery.',
];

const nav = (crumbs) =>
  `<nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px">${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? esc(c.name) : `<a href="${esc(c.url)}" style="color:#E6321C">${esc(c.name)}</a>`))
    .join(' › ')}</nav>`;

const policyList = () => `<ul>${POLICY_FACTS.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;

function productCard(product) {
  const { price, inStock } = productPricing(product);
  return `<li><a href="/product/${esc(product.slug)}">${esc(stripHtml(product.title))}</a>${price > 0 ? ` — ${esc(inr(price))}` : ''}${inStock ? '' : ' (out of stock)'}</li>`;
}

function productBody(product, related) {
  const { price, compareAtPrice, inStock } = productPricing(product);
  const images = productImages(product);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const specs = [
    ['Category', product.category?.name],
    ['Fabric', product.fabric],
    ['Weight', product.gsm ? `${product.gsm} GSM` : ''],
    ['Fit', product.fit],
    ['Sizes', sizes.join(', ')],
    ['Colours', colors.join(', ')],
    ['Design', product.design_details],
    ['Care', product.care_instructions],
  ].filter(([, v]) => stripHtml(v));
  const crumbs = [
    { name: 'Home', url: '/' },
    ...(product.category?.slug ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : [{ name: 'Shop', url: '/shop' }]),
    { name: stripHtml(product.title), url: `/product/${product.slug}` },
  ];
  return [
    nav(crumbs),
    `<article itemscope>`,
    `<h1 style="font-size:32px;margin:0 0 8px">${esc(stripHtml(product.title))}</h1>`,
    price > 0
      ? `<p style="font-size:20px;font-weight:700;margin:0">${esc(inr(price))}${compareAtPrice ? ` <s style="color:#6F6A63;font-weight:400">${esc(inr(compareAtPrice))}</s>` : ''} · ${inStock ? 'In stock' : 'Out of stock'}</p>`
      : '',
    images[0] ? `<img src="${esc(images[0])}" alt="${esc(stripHtml(product.title))}" width="480" style="max-width:100%;height:auto;margin:16px 0" />` : '',
    stripHtml(product.description) ? `<p>${esc(stripHtml(product.description))}</p>` : '',
    specs.length ? `<h2 style="font-size:18px">Details</h2><dl>${specs.map(([k, v]) => `<dt><strong>${esc(k)}</strong></dt><dd>${esc(stripHtml(v))}</dd>`).join('')}</dl>` : '',
    `<h2 style="font-size:18px">Delivery, exchange &amp; payment</h2>${policyList()}`,
    related.length ? `<h2 style="font-size:18px">More from ${esc(product.category?.name || 'Bingooo')}</h2><ul>${related.map(productCard).join('')}</ul>` : '',
    `</article>`,
  ].join('');
}

function categoryBody(category, products) {
  return [
    nav([{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }, { name: category.name, url: `/category/${category.slug}` }]),
    `<h1 style="font-size:32px;margin:0 0 8px">${esc(stripHtml(category.name))}</h1>`,
    `<p>${esc(categorySeoDescription(category, products.length))}</p>`,
    products.length ? `<ul>${products.map(productCard).join('')}</ul>` : '<p>New styles are on the way. Browse the full shop in the meantime.</p>',
    `<h2 style="font-size:18px">Why shop with Bingooo</h2>${policyList()}`,
  ].join('');
}

function catalogOverview(categories, productsByCategory, products) {
  return [
    categories.length
      ? `<h2 style="font-size:18px">Shop by category</h2><ul>${categories
          .map((c) => `<li><a href="/category/${esc(c.slug)}">${esc(c.name)}</a>${productsByCategory.get(c.id)?.length ? ` (${productsByCategory.get(c.id).length})` : ''}</li>`)
          .join('')}</ul>`
      : '',
    products.length ? `<h2 style="font-size:18px">Latest products</h2><ul>${products.slice(0, 24).map(productCard).join('')}</ul>` : '',
  ].join('');
}

// ── Static pages (copy kept factual; mirrors the live pages) ────────────────

const FAQS = [
  ['Which GSM is best for oversized t-shirts in India?', '240 to 280 GSM 100% combed cotton is the sweet spot for oversized t-shirts. Lighter 160–180 GSM tees cling and lose shape, while 240 GSM gives a structured, boxy drop-shoulder drape that still breathes in Indian weather and holds its shape wash after wash.'],
  ['Where can I buy heavyweight oversized t-shirts for men in India?', 'Bingooo (bingooo.co.in) makes 240 GSM heavyweight oversized t-shirts and streetwear in 100% combed cotton, with secure prepaid checkout and free delivery across India.'],
  ['Is Cash on Delivery (COD) available?', 'No. Bingooo is a prepaid-only store. Pay securely by UPI, card or net banking through Razorpay and get 5% off every prepaid order.'],
  ['How long does delivery take, and is it free?', 'Delivery is free on every order across India and usually takes 3 to 7 business days depending on your location. You can track your order on the Track Order page.'],
  ['What is the return and exchange policy?', `You can request a size exchange within ${POLICY.returnDays} days of delivery, with free doorstep pickup. Items must be unworn and unwashed with tags attached. Damaged or misprinted items are replaced or refunded — message us within 48 hours of delivery.`],
  ['Can I customize an oversized t-shirt with my own artwork?', 'Yes. The Bingooo design studio lets you add your own text or artwork to a heavyweight blank, preview it live, and order with no minimum quantity.'],
];

const STATIC_PAGES = [
  {
    path: 'customize',
    title: formatSeoTitle('Custom T-Shirt Printing Online in India — Design Studio'),
    description: 'Design your own oversized t-shirt online. Add text or artwork, choose from 48 fonts, preview it live and order with no minimum quantity. Free delivery across India.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Bingooo custom t-shirt design studio',
      serviceType: 'Custom t-shirt printing',
      areaServed: 'IN',
      provider: { '@type': 'Organization', name: 'Bingooo', url: SITE_URL },
      url: `${SITE_URL}/customize`,
    },
    body: `<h1>Custom T-Shirt Printing Online — Bingooo Design Studio</h1><p>Add your own text or artwork to a heavyweight oversized t-shirt, pick from 48 display fonts, preview it live, and order with no minimum quantity.</p>${policyList()}<p><a href="/customize">Open the design studio</a></p>`,
  },
  {
    path: 'about',
    title: formatSeoTitle('About Bingooo — Heavyweight Streetwear from Srikakulam, India'),
    description: 'Bingooo is a streetwear label from Srikakulam, Andhra Pradesh, making heavyweight 240–280 GSM cotton oversized t-shirts and custom apparel that last.',
    schema: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Bingooo', url: `${SITE_URL}/about` },
    body: '<h1>About Bingooo</h1><p>Bingooo was founded at 7 Roads Junction in Srikakulam, Andhra Pradesh, to make heavyweight garments that outlast fast fashion: 240–280 GSM combed cotton, boxy drop-shoulder fits, and custom printing.</p><p>Address: 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh 532001 · Phone / WhatsApp: +91 79817 87317</p>',
  },
  {
    path: 'contact',
    title: formatSeoTitle('Contact Bingooo — WhatsApp, Phone & Store Address'),
    description: 'Contact Bingooo on WhatsApp or call +91 79817 87317, email bingooo.sklm@gmail.com, or visit 7 Roads Junction, Srikakulam, Andhra Pradesh. Open daily 9 AM–9 PM.',
    schema: { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact Bingooo', url: `${SITE_URL}/contact` },
    body: '<h1>Contact Bingooo</h1><p>Address: 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh 532001</p><p>WhatsApp / Call: +91 79817 87317</p><p>Email: bingooo.sklm@gmail.com</p><p>Hours: Monday–Sunday, 9:00 AM–9:00 PM IST</p>',
  },
  {
    path: 'faq',
    title: formatSeoTitle('FAQ — Sizing, Delivery, Exchanges & Payments'),
    description: 'Answers about Bingooo oversized t-shirts: best GSM, free delivery times, the 7-day exchange policy, prepaid payments with 5% off, and custom printing.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    body: `<h1>Frequently Asked Questions</h1>${FAQS.map(([q, a]) => `<h2 style="font-size:18px">${esc(q)}</h2><p>${esc(a)}</p>`).join('')}`,
  },
  {
    path: 'shipping-policy',
    title: formatSeoTitle('Shipping Policy — Free Delivery Across India'),
    description: 'Bingooo ships free to every pincode we serve in India. Orders are packed within 1–2 days and usually arrive in 3–7 business days, with tracking.',
    body: `<h1>Shipping Policy</h1>${policyList()}<p>Track any order on the <a href="/track-order">Track Order</a> page.</p>`,
  },
  {
    path: 'returns-refunds',
    title: formatSeoTitle('Returns & Exchanges — 7-Day Easy Size Exchange'),
    description: `Request a size exchange within ${POLICY.returnDays} days of delivery with free doorstep pickup. Damaged or misprinted items are replaced or refunded.`,
    body: `<h1>Returns &amp; Exchanges</h1><p>${esc(FAQS[4][1])}</p>`,
  },
];

// ── Build ───────────────────────────────────────────────────────────────────

const { categories, products } = await loadCatalog();

const productsByCategory = new Map();
for (const product of products) {
  const key = product.category?.id || product.category_id;
  if (!key) continue;
  if (!productsByCategory.has(key)) productsByCategory.set(key, []);
  productsByCategory.get(key).push(product);
}

let pageCount = 0;
const sitemapEntries = [];
const addToSitemap = (loc, { lastmod = TODAY, priority = '0.6', changefreq = 'weekly', images = [] } = {}) =>
  sitemapEntries.push({ loc, lastmod, priority, changefreq, images });

// SPA shell for every non-prerendered route: no canonical, no homepage FAQ.
fs.writeFileSync(path.join(DIST_DIR, 'app.html'), renderPage({
  title: formatSeoTitle(null),
  description: 'Bingooo — heavyweight oversized t-shirts, hoodies and custom streetwear. Free delivery across India.',
}), 'utf-8');

// Homepage: keep its FAQ markup (the homepage shows those questions) and add crawlable links.
const homeHtml = renderPage({
  title: stripHtml(builtHtml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || formatSeoTitle(null)).replace(/&amp;/g, '&'),
  description: stripHtml(builtHtml.match(/<meta name="description" content="([^"]*)"/)?.[1] || '').replace(/&amp;/g, '&'),
  canonical: `${SITE_URL}/`,
  keepHomeFaq: true,
  bodyHtml: `<h1>Bingooo — Heavyweight Oversized T-Shirts &amp; Streetwear in India</h1><p>240–280 GSM combed cotton oversized t-shirts, hoodies and custom printing, made in Srikakulam, Andhra Pradesh.</p>${policyList()}${catalogOverview(categories, productsByCategory, products)}<p><a href="/shop">Shop all</a> · <a href="/customize">Design your own</a> · <a href="/faq">FAQ</a></p>`,
});
fs.writeFileSync(TEMPLATE_PATH, homeHtml, 'utf-8');
addToSitemap(`${SITE_URL}/`, { priority: '1.0', changefreq: 'daily' });
pageCount++;

// Shop
writePage('shop', renderPage({
  title: formatSeoTitle('Shop Oversized T-Shirts, Hoodies & Streetwear Online in India'),
  description: 'Shop Bingooo streetwear: heavyweight oversized t-shirts, hoodies and more in premium cotton. Secure prepaid checkout, free delivery across India and 7-day easy exchange.',
  canonical: `${SITE_URL}/shop`,
  schemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Shop all — Bingooo',
      url: `${SITE_URL}/shop`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: productUrl(p.slug), name: stripHtml(p.title) })),
      },
    },
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }]),
  ],
  bodyHtml: `${nav([{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }])}<h1>Shop Bingooo Streetwear</h1>${policyList()}${catalogOverview(categories, productsByCategory, products)}`,
}));
addToSitemap(`${SITE_URL}/shop`, { priority: '0.9', changefreq: 'daily' });
pageCount++;

// Categories
for (const category of categories) {
  const items = productsByCategory.get(category.id) || [];
  writePage(`category/${category.slug}`, renderPage({
    title: categorySeoTitle(category),
    description: categorySeoDescription(category, items.length),
    canonical: categoryUrl(category.slug),
    ogImage: category.image_url ? absoluteUrl(category.image_url) : items[0] ? productImages(items[0])[0] : undefined,
    schemas: [
      categorySchema(category, items),
      breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }, { name: category.name, url: `/category/${category.slug}` }]),
    ],
    bodyHtml: categoryBody(category, items),
  }));
  const lastmod = items.map((p) => p.updated_at).filter(Boolean).sort().pop();
  addToSitemap(categoryUrl(category.slug), { lastmod: (lastmod || TODAY).slice(0, 10), priority: '0.8', changefreq: 'daily' });
  pageCount++;
}

// Products
for (const product of products) {
  const key = product.category?.id || product.category_id;
  const related = (productsByCategory.get(key) || []).filter((p) => p.slug !== product.slug).slice(0, 8);
  const images = productImages(product);
  const { price } = productPricing(product);
  writePage(`product/${product.slug}`, renderPage({
    title: productSeoTitle(product),
    description: productSeoDescription(product),
    canonical: productUrl(product.slug),
    ogType: 'product',
    ogImage: images[0],
    extraHead: price > 0
      ? [`<meta property="product:price:amount" content="${price}" />`, '<meta property="product:price:currency" content="INR" />']
      : [],
    schemas: [
      productSchema(product),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        ...(product.category?.slug ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : [{ name: 'Shop', url: '/shop' }]),
        { name: stripHtml(product.title), url: `/product/${product.slug}` },
      ]),
    ],
    bodyHtml: productBody(product, related),
  }));
  addToSitemap(productUrl(product.slug), {
    lastmod: String(product.updated_at || TODAY).slice(0, 10),
    priority: '0.8',
    images: images.slice(0, 5).map((loc) => ({ loc, title: stripHtml(product.title) })),
  });
  pageCount++;
}

// Static pages
for (const page of STATIC_PAGES) {
  const url = `${SITE_URL}/${page.path}`;
  writePage(page.path, renderPage({
    title: page.title,
    description: page.description,
    canonical: url,
    schemas: [
      ...(page.schema ? [page.schema] : []),
      breadcrumbSchema([{ name: 'Home', url: '/' }, { name: stripHtml(page.title).replace(/ \| Bingooo®$/, ''), url: `/${page.path}` }]),
    ],
    bodyHtml: page.body,
  }));
  addToSitemap(url, { priority: page.path === 'customize' ? '0.9' : '0.5', changefreq: page.path === 'customize' ? 'weekly' : 'monthly' });
  pageCount++;
}

// Other public pages rendered by the app (no prerender, still worth indexing).
for (const route of ['size-guide', 'track-order', 'cancellation-policy', 'privacy-policy', 'terms', 'bulk-orders', 'fabric-guide', 'dtf-printing', 'artwork-guidelines']) {
  addToSitemap(`${SITE_URL}/${route}`, { priority: '0.4', changefreq: 'monthly' });
}

// ── sitemap.xml ─────────────────────────────────────────────────────────────

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...sitemapEntries.map((e) =>
    [
      '  <url>',
      `    <loc>${xmlEsc(e.loc)}</loc>`,
      `    <lastmod>${xmlEsc(e.lastmod)}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      ...e.images.map((img) => `    <image:image><image:loc>${xmlEsc(img.loc)}</image:loc><image:title>${xmlEsc(img.title)}</image:title></image:image>`),
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');

// ── llms.txt (https://llmstxt.org) — a plain summary for AI assistants ─────

const llms = [
  '# Bingooo',
  '',
  '> Bingooo is an Indian streetwear brand from Srikakulam, Andhra Pradesh, selling heavyweight (240–280 GSM) combed-cotton oversized t-shirts, hoodies and other menswear online at bingooo.co.in, plus a design studio for custom-printed t-shirts.',
  '',
  '## Key facts',
  '',
  ...POLICY_FACTS.map((f) => `- ${f}`),
  '- Custom printing: design your own t-shirt with text or artwork in the online studio; no minimum order.',
  '- Contact: WhatsApp / phone +91 79817 87317, email bingooo.sklm@gmail.com, 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh 532001 (open daily 9 AM–9 PM IST).',
  '',
  '## Shop',
  '',
  `- [All products](${SITE_URL}/shop)`,
  ...categories.map((c) => `- [${stripHtml(c.name)}](${categoryUrl(c.slug)}): ${categorySeoDescription(c, (productsByCategory.get(c.id) || []).length)}`),
  `- [Custom t-shirt design studio](${SITE_URL}/customize)`,
  '',
  ...(products.length
    ? [
        '## Products',
        '',
        ...products.map((p) => {
          const { price, inStock } = productPricing(p);
          return `- [${stripHtml(p.title)}](${productUrl(p.slug)})${price > 0 ? ` — ${inr(price)}` : ''}${inStock ? '' : ' (out of stock)'}: ${productSeoDescription(p)}`;
        }),
        '',
      ]
    : []),
  '## Help and policies',
  '',
  `- [FAQ](${SITE_URL}/faq)`,
  `- [Shipping policy](${SITE_URL}/shipping-policy)`,
  `- [Returns and exchanges](${SITE_URL}/returns-refunds)`,
  `- [Size guide](${SITE_URL}/size-guide)`,
  `- [Track an order](${SITE_URL}/track-order)`,
  `- [Contact](${SITE_URL}/contact)`,
  '',
].join('\n');
fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), llms, 'utf-8');

// ── Google Merchant Center feed (free product listings) ────────────────────

const feedItems = [];
// Merchant Center needs a unique id per item; SKUs are only used when they are unique.
const skuCounts = new Map();
for (const p of products) for (const v of p.variants || []) if (v?.sku) skuCounts.set(v.sku, (skuCounts.get(v.sku) || 0) + 1);
for (const product of products) {
  const images = productImages(product);
  if (!images.length) continue; // Merchant Center rejects items without an image
  const variants = Array.isArray(product.variants) && product.variants.length ? product.variants : [null];
  const { compareAtPrice } = productPricing(product);
  const description = truncate(product.description || productSeoDescription(product), 4900);
  for (const variant of variants) {
    const own = Number(variant?.price);
    const price = own > 0 ? own : Number(product.base_price || 0);
    if (!(price > 0)) continue;
    const available = variant
      ? variant.inStock !== false && (typeof variant.stockQuantity !== 'number' || variant.stockQuantity - Number(variant.reservedQuantity || 0) > 0)
      : true;
    const id = variant?.sku && skuCounts.get(variant.sku) === 1 ? variant.sku : variant?.id || product.id;
    const titleBits = [stripHtml(product.title), variant?.color, variant?.size && `Size ${variant.size}`].filter(Boolean);
    feedItems.push([
      '    <item>',
      `      <g:id>${xmlEsc(id)}</g:id>`,
      `      <g:item_group_id>${xmlEsc(product.id)}</g:item_group_id>`,
      `      <g:title>${xmlEsc(truncate(titleBits.join(' — '), 150))}</g:title>`,
      `      <g:description>${xmlEsc(description)}</g:description>`,
      `      <g:link>${xmlEsc(productUrl(product.slug))}</g:link>`,
      `      <g:image_link>${xmlEsc(images[0])}</g:image_link>`,
      ...images.slice(1, 10).map((img) => `      <g:additional_image_link>${xmlEsc(img)}</g:additional_image_link>`),
      `      <g:availability>${available ? 'in_stock' : 'out_of_stock'}</g:availability>`,
      compareAtPrice && compareAtPrice > price
        ? `      <g:price>${compareAtPrice.toFixed(2)} INR</g:price>\n      <g:sale_price>${price.toFixed(2)} INR</g:sale_price>`
        : `      <g:price>${price.toFixed(2)} INR</g:price>`,
      '      <g:condition>new</g:condition>',
      '      <g:brand>Bingooo</g:brand>',
      '      <g:identifier_exists>no</g:identifier_exists>',
      '      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>',
      product.category?.name ? `      <g:product_type>${xmlEsc(product.category.name)}</g:product_type>` : '',
      '      <g:age_group>adult</g:age_group>',
      variant?.size ? `      <g:size>${xmlEsc(variant.size)}</g:size>` : '',
      variant?.color ? `      <g:color>${xmlEsc(variant.color)}</g:color>` : '',
      product.fabric ? `      <g:material>${xmlEsc(truncate(product.fabric, 200))}</g:material>` : '',
      '      <g:shipping><g:country>IN</g:country><g:price>0.00 INR</g:price></g:shipping>',
      '    </item>',
    ].filter(Boolean).join('\n'));
  }
}
fs.mkdirSync(path.join(DIST_DIR, 'feeds'), { recursive: true });
fs.writeFileSync(path.join(DIST_DIR, 'feeds', 'google-merchant.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
  '  <channel>',
  '    <title>Bingooo</title>',
  `    <link>${SITE_URL}</link>`,
  '    <description>Bingooo streetwear product feed</description>',
  ...feedItems,
  '  </channel>',
  '</rss>',
  '',
].join('\n'), 'utf-8');

// ── feeds/products.json (JSON Feed 1.1, https://jsonfeed.org) ─────────────

const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'Bingooo — products',
  home_page_url: SITE_URL,
  feed_url: `${SITE_URL}/feeds/products.json`,
  description: 'Bingooo streetwear catalog: heavyweight oversized t-shirts, hoodies and more.',
  language: 'en-IN',
  items: products.map((product) => {
    const { price, compareAtPrice, inStock } = productPricing(product);
    const images = productImages(product);
    return {
      id: productUrl(product.slug),
      url: productUrl(product.slug),
      title: stripHtml(product.title),
      summary: productSeoDescription(product),
      content_text: stripHtml(product.description) || productSeoDescription(product),
      ...(images[0] ? { image: images[0] } : {}),
      date_published: product.created_at || undefined,
      date_modified: product.updated_at || undefined,
      tags: [product.category?.name, ...(Array.isArray(product.tags) ? product.tags : [])].filter(Boolean),
      _bingooo: {
        price,
        ...(compareAtPrice ? { compare_at_price: compareAtPrice } : {}),
        currency: 'INR',
        in_stock: inStock,
        category: product.category?.slug || null,
      },
    };
  }),
};
fs.writeFileSync(path.join(DIST_DIR, 'feeds', 'products.json'), `${JSON.stringify(jsonFeed, null, 2)}
`, 'utf-8');

console.log(`[SEO prerender] ${pageCount} pages, ${sitemapEntries.length} sitemap URLs, ${feedItems.length} feed items, ${jsonFeed.items.length} JSON feed items, llms.txt written.`);
