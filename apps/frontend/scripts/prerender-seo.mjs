import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`❌ [SEO Pre-render] Template not found at: ${TEMPLATE_PATH}. Run vite build first.`);
  process.exit(1);
}

const baseHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

const ROUTES = [
  {
    path: 'shop',
    title: 'Buy Heavyweight Oversized T-Shirts & Menswear Online India | Bingooo®',
    description: 'Explore Bingooo’s curated 240–280 GSM heavyweight streetwear collection. Oversized tees, drop-shoulder hoodies, boxy cut shirts, and bottomwear. Cash on delivery & Pan-India express shipping.',
    canonical: 'https://bingooo.co.in/shop',
    h1: 'Shop Heavyweight Menswear & Streetwear Fits',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Bingooo Heavyweight Streetwear Collection',
      description: 'Curated 240–280 GSM heavyweight cotton oversized tees, hoodies, and streetwear apparel.',
      url: 'https://bingooo.co.in/shop',
      numberOfItems: 4,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Classic Heavyweight Oversized Tee (240 GSM)',
          url: 'https://bingooo.co.in/product/classic-oversized-tee',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Midnight Graphic Drop (240 GSM)',
          url: 'https://bingooo.co.in/product/graphic-print-tee-midnight',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Essential Pullover Hoodie (380 GSM Fleece)',
          url: 'https://bingooo.co.in/product/essential-pullover-hoodie',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '3D Custom Atelier T-Shirt (Custom Print)',
          url: 'https://bingooo.co.in/customize',
        },
      ],
    },
    contentHtml: `
      <h1>Buy Heavyweight Oversized T-Shirts &amp; Menswear Online India</h1>
      <p>Discover India's premier collection of 240–280 GSM heavyweight oversized t-shirts, dropped shoulder hoodies, and custom streetwear. Tailored for an effortless boxy fit that lasts.</p>
      <ul>
        <li><a href="/category/oversized-tees">240 GSM Oversized Tees (Boxy Streetwear Fit)</a></li>
        <li><a href="/category/hoodies">Heavyweight Fleece Hoodies (380 GSM)</a></li>
        <li><a href="/category/graphic-drops">Limited Edition Midnight Graphic Drops</a></li>
        <li><a href="/customize">Design Custom Streetwear in 3D Atelier</a></li>
      </ul>
    `,
  },
  {
    path: 'category/oversized-tees',
    title: '240 GSM Oversized T-Shirts for Men | Heavyweight Streetwear | Bingooo®',
    description: 'Shop premium 240 GSM heavyweight oversized t-shirts crafted from 100% super-combed cotton. Structured boxy drape, anti-sag French rib collar. Express delivery across India.',
    canonical: 'https://bingooo.co.in/category/oversized-tees',
    h1: '240 GSM Heavyweight Oversized T-Shirts',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '240 GSM Oversized T-Shirts',
      url: 'https://bingooo.co.in/category/oversized-tees',
      description: 'Men’s 240 GSM heavyweight oversized tees crafted with super-combed luxury cotton.',
    },
    contentHtml: `
      <h1>240 GSM Heavyweight Oversized T-Shirts for Men</h1>
      <p>Upgrade your streetwear wardrobe with Bingooo's signature 240 GSM combed cotton oversized tees. Engineered to resist wrinkling, drape squarely off the shoulders, and maintain structure wash after wash.</p>
      <a href="/product/classic-oversized-tee">View Classic Oversized Tee — ₹1,299</a>
    `,
  },
  {
    path: 'category/hoodies',
    title: 'Heavyweight Fleece Hoodies for Men (380 GSM) | Bingooo® Streetwear',
    description: 'Shop luxury 380 GSM brushed fleece pullover hoodies. Double-layered kangaroo hood, ribbed cuffs, and structured boxy silhouette. Made in India with express shipping.',
    canonical: 'https://bingooo.co.in/category/hoodies',
    h1: 'Heavyweight 380 GSM Fleece Hoodies',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Heavyweight Hoodies',
      url: 'https://bingooo.co.in/category/hoodies',
      description: 'Premium 380 GSM brushed fleece pullover hoodies with double-layered hoods.',
    },
    contentHtml: `
      <h1>380 GSM Luxury Fleece Hoodies</h1>
      <p>Ultra-dense 380 GSM fleece pullover hoodies designed for unmatched warmth, silhouette retention, and streetwear luxury.</p>
      <a href="/product/essential-pullover-hoodie">View Essential Pullover Hoodie — ₹2,499</a>
    `,
  },
  {
    path: 'customize',
    title: '3D Custom T-Shirt Designer & Atelier Studio | DTF Printing India | Bingooo®',
    description: 'Craft your own bespoke oversized streetwear in Bingooo’s interactive 3D Atelier. Upload high-res artwork, adjust placement, and order premium 240 GSM custom t-shirts with express dispatch.',
    canonical: 'https://bingooo.co.in/customize',
    h1: '3D Custom Streetwear Atelier Studio',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Bingooo 3D Atelier Customizer',
      provider: {
        '@type': 'ClothingStore',
        name: 'Bingooo Men\'s Wear',
        url: 'https://bingooo.co.in',
      },
      serviceType: 'Custom T-Shirt Printing & Bespoke Streetwear',
      areaServed: 'IN',
      description: 'Interactive 3D preview and custom high-density DTF printing on 240–280 GSM heavyweight cotton blanks.',
    },
    contentHtml: `
      <h1>3D Custom T-Shirt Designer &amp; Bespoke Atelier</h1>
      <p>Print your personal artwork, logos, or typography on 240 GSM heavyweight blanks in our real-time 3D Atelier studio. Premium direct-to-film (DTF) vibrant finish with zero cracking.</p>
      <a href="/customize">Launch 3D Atelier Customizer</a>
    `,
  },
  {
    path: 'product/classic-oversized-tee',
    title: 'Classic Heavyweight Oversized Tee — 240 GSM Cotton | Bingooo®',
    description: 'Buy the Classic Heavyweight Oversized Tee in 240 GSM 100% super-combed cotton. Streetwear boxy fit with anti-sag collar. Available in Charcoal Black, Vintage Cream & Crimson. ₹1,299 with COD.',
    canonical: 'https://bingooo.co.in/product/classic-oversized-tee',
    h1: 'Classic Heavyweight Oversized Tee (240 GSM)',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Classic Heavyweight Oversized Tee',
      description: 'Boxy streetwear cut in 240 GSM super-combed cotton. Anti-pilling rib collar and drop shoulder drape.',
      image: ['https://bingooo.co.in/custom/tshirt-step-1.png'],
      sku: 'BG-CLASSIC-OVERSIZED-TEE',
      mpn: 'BG-CLASSIC-OVERSIZED-TEE',
      brand: { '@type': 'Brand', name: 'Bingooo' },
      material: '240 GSM 100% Combed Cotton',
      offers: {
        '@type': 'Offer',
        url: 'https://bingooo.co.in/product/classic-oversized-tee',
        priceCurrency: 'INR',
        price: '1299',
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Bingooo' },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IN',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '124',
        bestRating: '5',
      },
    },
    contentHtml: `
      <h1>Classic Heavyweight Oversized Tee (240 GSM)</h1>
      <p>₹1,299 • 240 GSM 100% Super-Combed Cotton • Free Pan-India Delivery on orders over ₹999.</p>
      <p>Engineered with a dense weave that drops squarely off the shoulders and holds a boxy silhouette throughout the day.</p>
      <a href="/product/classic-oversized-tee">Order Now</a>
    `,
  },
  {
    path: 'about',
    title: 'About Bingooo® — Heavyweight Menswear Atelier Srikakulam, India',
    description: 'Learn about Bingooo: our craftsmanship, 240–280 GSM heavyweight cotton philosophy, and our flagship atelier studio in Srikakulam, Andhra Pradesh.',
    canonical: 'https://bingooo.co.in/about',
    h1: 'About Bingooo Menswear & Streetwear Atelier',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Bingooo',
      url: 'https://bingooo.co.in/about',
      mainEntity: {
        '@type': 'ClothingStore',
        name: 'Bingooo',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '7 Roads Junction, Main Road',
          addressLocality: 'Srikakulam',
          addressRegion: 'Andhra Pradesh',
          postalCode: '532001',
          addressCountry: 'IN',
        },
      },
    },
    contentHtml: `
      <h1>About Bingooo Menswear Atelier</h1>
      <p>Born at 7 Roads Junction in Srikakulam, Andhra Pradesh, Bingooo was founded to rebel against flimsy fast fashion. We create heavyweight garments that endure.</p>
      <p>Location: 7 Roads Junction, Main Road, Srikakulam, AP 532001 • Phone: +91 7981787317</p>
    `,
  },
  {
    path: 'contact',
    title: 'Contact Us | Bingooo® Flagship Atelier Srikakulam, Andhra Pradesh',
    description: 'Get in touch with Bingooo. Visit our flagship store at 7 Roads Junction, Srikakulam, AP, or contact our support concierge via WhatsApp at +91 7981787317.',
    canonical: 'https://bingooo.co.in/contact',
    h1: 'Contact Bingooo Atelier & Concierge',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Bingooo',
      url: 'https://bingooo.co.in/contact',
    },
    contentHtml: `
      <h1>Contact Bingooo Atelier</h1>
      <p>Address: 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh 532001</p>
      <p>WhatsApp / Call: +91 7981787317</p>
      <p>Email: bingooo.sklm@gmail.com</p>
      <p>Hours: Monday – Sunday: 09:00 AM – 09:00 PM IST</p>
    `,
  },
  {
    path: 'faq',
    title: 'Frequently Asked Questions (FAQ) | Shipping, Returns, 240 GSM Fabric | Bingooo®',
    description: 'Find answers about Bingooo orders, Pan-India shipping timelines, 7-day returns, 240 GSM fabric care, and custom 3D printing guidelines.',
    canonical: 'https://bingooo.co.in/faq',
    h1: 'Bingooo Help & Frequently Asked Questions',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Where is Bingooo based and do you deliver across India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bingooo is based at 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh. We ship to all 28 states and 8 union territories across India.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does 240 GSM mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GSM stands for Grams per Square Metre. 240 GSM represents a dense, heavyweight cotton fabric weave that provides a structured boxy fit that does not lose shape after washes.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does delivery take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Orders are typically delivered within 3 to 7 business days depending on location, with live tracking sent via SMS and WhatsApp.',
          },
        },
      ],
    },
    contentHtml: `
      <h1>Frequently Asked Questions (FAQ)</h1>
      <h2>Orders, Shipping &amp; Delivery</h2>
      <p>We deliver Pan-India in 3–7 business days with express tracking via WhatsApp and SMS.</p>
      <h2>What is 240 GSM Fabric?</h2>
      <p>240 GSM is luxury heavyweight combed cotton engineered for durability and structural streetwear drape.</p>
    `,
  },
];

console.log(`\n🚀 [SEO Pre-render] Generating static HTML snapshots for ${ROUTES.length} core routes...`);

let generatedCount = 0;

for (const r of ROUTES) {
  const targetDir = path.join(DIST_DIR, r.path);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let html = baseHtml;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/s, `<title>${r.title}</title>`);

  // Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${r.description}" />`
  );

  // Replace OG / Twitter Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/s,
    `<meta property="og:title" content="${r.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/s,
    `<meta property="og:description" content="${r.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/s,
    `<meta property="og:url" content="${r.canonical}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/s,
    `<meta name="twitter:title" content="${r.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/s,
    `<meta name="twitter:description" content="${r.description}" />`
  );

  // Insert or update canonical link
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/s, `<link rel="canonical" href="${r.canonical}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${r.canonical}" />\n  </head>`);
  }

  // Inject route-specific JSON-LD Schema
  if (r.schema) {
    const schemaScript = `\n    <!-- Route Specific JSON-LD -->\n    <script type="application/ld+json">\n    ${JSON.stringify(r.schema, null, 2)}\n    </script>\n  `;
    html = html.replace('</head>', `${schemaScript}</head>`);
  }

  // Inject route-specific fallback content inside #root
  if (r.contentHtml) {
    const routeFallback = `
      <div style="max-width: 1000px; margin: 0 auto; padding: 32px 20px; font-family: sans-serif; color: #171717;">
        ${r.contentHtml}
        <p style="margin-top: 24px;"><a href="/" style="color: #e6321c; font-weight: 700;">← Return to Bingooo Home</a></p>
      </div>
    `;
    const rootStartTag = '<div id="root">';
    const bodyEndTag = '</body>';
    const startIndex = html.indexOf(rootStartTag);
    const bodyEndIndex = html.indexOf(bodyEndTag, startIndex);
    if (startIndex !== -1 && bodyEndIndex !== -1) {
      const lastDivClose = html.lastIndexOf('</div>', bodyEndIndex);
      if (lastDivClose > startIndex) {
        html =
          html.substring(0, startIndex) +
          `<div id="root">${routeFallback}</div>\n  ` +
          html.substring(lastDivClose + 6);
      }
    }
  }

  const destFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(destFile, html, 'utf-8');
  generatedCount++;
  console.log(`  ✓ Generated: dist/${r.path}/index.html`);
}

console.log(`✅ [SEO Pre-render] Successfully generated ${generatedCount} static routes!\n`);
