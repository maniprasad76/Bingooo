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
    title: 'Buy Oversized T-Shirts for Men (240 GSM) & Streetwear Online India | Bingooo®',
    description: 'Shop India\'s best 240–280 GSM heavyweight oversized t-shirts for men, drop-shoulder hoodies, and streetwear. 100% super-combed cotton, boxy fit, COD & Pan-India free shipping.',
    canonical: 'https://bingooo.co.in/shop',
    h1: 'Shop 240 GSM Oversized T-Shirts & Luxury Streetwear for Men',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Bingooo 240 GSM Heavyweight Streetwear Collection',
      description: 'Curated 240–280 GSM heavyweight cotton oversized t-shirts for men, drop-shoulder hoodies, and bespoke apparel.',
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
          name: 'Midnight Graphic Drop Oversized Tee (240 GSM)',
          url: 'https://bingooo.co.in/product/graphic-print-tee-midnight',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Essential Heavyweight Pullover Hoodie (380 GSM Fleece)',
          url: 'https://bingooo.co.in/product/essential-pullover-hoodie',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Custom 240 GSM Oversized T-Shirt (3D Atelier)',
          url: 'https://bingooo.co.in/customize',
        },
      ],
    },
    contentHtml: `
      <h1>Buy Oversized T-Shirts for Men (240 GSM) &amp; Luxury Streetwear Online India</h1>
      <p>Discover India's top collection of 240–280 GSM heavyweight oversized t-shirts for men, dropped shoulder hoodies, and custom streetwear. Engineered with 100% super-combed cotton for an authentic boxy fit that holds shape wash after wash.</p>
      <ul>
        <li><a href="/category/oversized-tees">240 GSM Oversized T-Shirts for Men (Boxy Streetwear Fit)</a></li>
        <li><a href="/category/hoodies">Heavyweight 380 GSM Fleece Hoodies for Men</a></li>
        <li><a href="/category/graphic-drops">Limited Edition Midnight Graphic Drop Oversized Tees</a></li>
        <li><a href="/customize">Custom Oversized T-Shirt Printing India in 3D Atelier</a></li>
      </ul>
    `,
  },
  {
    path: 'category/oversized-tees',
    title: '240 GSM Oversized T-Shirts for Men | Best Heavyweight Streetwear India | Bingooo®',
    description: 'Buy premium 240 GSM oversized t-shirts for men in India. 100% super-combed cotton, drop-shoulder boxy drape, anti-sag French rib collar. Cash on delivery & express shipping.',
    canonical: 'https://bingooo.co.in/category/oversized-tees',
    h1: '240 GSM Heavyweight Oversized T-Shirts for Men',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '240 GSM Oversized T-Shirts for Men',
      url: 'https://bingooo.co.in/category/oversized-tees',
      description: 'Men’s 240 GSM heavyweight oversized tees crafted with super-combed luxury cotton in India.',
    },
    contentHtml: `
      <h1>240 GSM Heavyweight Oversized T-Shirts for Men</h1>
      <p>Upgrade your streetwear wardrobe with Bingooo's signature 240 GSM combed cotton oversized tees. Engineered to resist wrinkling, drape squarely off the shoulders, and maintain structure wash after wash with anti-sag French rib collars.</p>
      <a href="/product/classic-oversized-tee">View Classic 240 GSM Oversized Tee — ₹1,299</a>
    `,
  },
  {
    path: 'category/hoodies',
    title: '380 GSM Heavyweight Fleece Hoodies for Men | Luxury Streetwear India | Bingooo®',
    description: 'Shop 380 GSM heavyweight fleece pullover hoodies for men. Double-layered kangaroo hood, boxy streetwear fit, ultra-warm brushed cotton. Fast Pan-India delivery.',
    canonical: 'https://bingooo.co.in/category/hoodies',
    h1: 'Heavyweight 380 GSM Fleece Hoodies for Men',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '380 GSM Heavyweight Hoodies',
      url: 'https://bingooo.co.in/category/hoodies',
      description: 'Premium 380 GSM brushed fleece pullover hoodies with double-layered hoods and drop shoulders.',
    },
    contentHtml: `
      <h1>380 GSM Luxury Heavyweight Fleece Hoodies for Men</h1>
      <p>Ultra-dense 380 GSM fleece pullover hoodies designed for unmatched warmth, drop-shoulder silhouette retention, and premium Indian streetwear luxury.</p>
      <a href="/product/essential-pullover-hoodie">View Essential 380 GSM Pullover Hoodie — ₹2,499</a>
    `,
  },
  {
    path: 'customize',
    title: 'Custom Oversized T-Shirt Printing India | 3D Atelier Studio | Bingooo®',
    description: 'Design & print custom 240 GSM oversized t-shirts online in India. High-density DTF printing, real-time 3D preview, zero minimum order, express dispatch across India.',
    canonical: 'https://bingooo.co.in/customize',
    h1: '3D Custom Oversized T-Shirt Printing Atelier Studio',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Bingooo 3D Atelier Customizer',
      provider: {
        '@type': 'ClothingStore',
        name: 'Bingooo Men\'s Wear',
        url: 'https://bingooo.co.in',
      },
      serviceType: 'Custom Oversized T-Shirt Printing & Bespoke Streetwear',
      areaServed: 'IN',
      description: 'Interactive 3D preview and custom high-density DTF printing on 240–280 GSM heavyweight cotton blanks.',
    },
    contentHtml: `
      <h1>Custom Oversized T-Shirt Printing India &amp; 3D Atelier</h1>
      <p>Print your custom graphics, brand artwork, or typography on 240 GSM heavyweight blanks in our real-time 3D Atelier studio. Premium direct-to-film (DTF) vibrant finish with zero cracking and wash resistance.</p>
      <a href="/customize">Launch 3D Atelier Customizer Studio</a>
    `,
  },
  {
    path: 'product/classic-oversized-tee',
    title: 'Classic 240 GSM Heavyweight Oversized T-Shirt for Men | Bingooo® Streetwear',
    description: 'Buy the #1 Classic Heavyweight Oversized T-Shirt in 240 GSM super-combed cotton. Drop shoulder boxy fit, anti-sag collar, pre-shrunk fabric. COD & Pan-India free delivery.',
    canonical: 'https://bingooo.co.in/product/classic-oversized-tee',
    h1: 'Classic Heavyweight Oversized Tee (240 GSM)',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Classic Heavyweight Oversized Tee (240 GSM)',
      description: 'Boxy streetwear cut in 240 GSM super-combed cotton. Anti-pilling rib collar and drop shoulder drape.',
      image: ['https://bingooo.co.in/custom/tshirt-step-1.png'],
      sku: 'BG-CLASSIC-OVERSIZED-TEE',
      mpn: 'BG-CLASSIC-OVERSIZED-TEE',
      brand: { '@type': 'Brand', name: 'Bingooo', alternateName: 'Bingooo Streetwear' },
      material: '240 GSM 100% Super-Combed Cotton',
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
    title: 'Frequently Asked Questions (FAQ) | 240 GSM Fabric, Shipping, Returns | Bingooo®',
    description: 'Find answers about Bingooo 240 GSM oversized t-shirts, custom 3D Atelier printing, Pan-India shipping timelines, 7-day returns, and Cash on Delivery.',
    keywords: 'oversized t-shirts faq, 240 gsm t-shirt meaning, custom t-shirt printing delivery, cash on delivery streetwear, bingooo help',
    canonical: 'https://bingooo.co.in/faq',
    h1: 'Bingooo Help & Frequently Asked Questions',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which GSM is best for oversized t-shirts in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '240 GSM to 280 GSM 100% super-combed cotton is the gold standard for oversized t-shirts in India. Unlike flimsy 160-180 GSM tees that lose shape and cling to the body, 240 GSM fabric delivers a structured, boxy drop-shoulder drape that breathes well in tropical Indian climates and holds its shape through dozens of washes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where can I buy the best oversized t-shirts for men in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bingooo (bingooo.co.in) offers India\'s premier collection of 240 GSM heavyweight oversized t-shirts for men. Featuring 100% super-combed cotton, anti-sag French rib collars, pre-shrunk fabric, and authentic streetwear silhouettes, with Cash on Delivery (COD) and express Pan-India shipping.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does delivery take across India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Orders are typically delivered within 3 to 7 business days depending on location, with live tracking sent via SMS and WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I customize oversized t-shirts with my own artwork?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Bingooo\'s 3D Atelier Studio lets you customize 240 GSM heavyweight blanks in real-time 3D. Upload high-resolution graphics, position prints, and receive bespoke apparel with zero minimum order quantity.',
          },
        },
      ],
    },
    contentHtml: `
      <h1>Frequently Asked Questions (FAQ) — 240 GSM Oversized Tees &amp; Streetwear</h1>
      <h2>Orders, Shipping &amp; Cash on Delivery</h2>
      <p>We deliver Pan-India in 3–7 business days with express tracking via WhatsApp and SMS. Cash on Delivery is supported on all domestic orders.</p>
      <h2>What Makes 240 GSM Cotton the Best for Oversized T-Shirts?</h2>
      <p>240 GSM is luxury heavyweight combed cotton engineered for durability and structural streetwear drape, eliminating collar sagging and flimsy drape.</p>
      <h2>3D Custom Atelier Printing</h2>
      <p>Design your own custom streetwear using our interactive 3D studio with high-definition DTF printing.</p>
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

  // Replace Keywords if route specifies
  if (r.keywords) {
    html = html.replace(
      /<meta name="keywords" content=".*?" \/>/s,
      `<meta name="keywords" content="${r.keywords}" />`
    );
  }

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
