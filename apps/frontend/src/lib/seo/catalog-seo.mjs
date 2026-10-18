// Catalog SEO helpers shared by the React app and the build-time prerender
// script (scripts/prerender-seo.mjs), so search engines, AI crawlers and the
// live page always describe a product the same way. Plain ESM on purpose:
// the prerender script runs in Node without a TypeScript step.

export const SITE_URL = 'https://www.bingooo.co.in';
export const BRAND_NAME = 'Bingooo';
export const BRAND_SUFFIX = ' | Bingooo®';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand-logo.png`;

// Kept in step with the Shipping and Returns policy pages.
export const POLICY = {
  freeShipping: true,
  handlingDays: [1, 2],
  transitDays: [2, 5],
  returnDays: 7,
};

export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function productUrl(slug) {
  return `${SITE_URL}/product/${encodeURIComponent(slug)}`;
}

export function categoryUrl(slug) {
  return `${SITE_URL}/category/${encodeURIComponent(slug)}`;
}

export function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cuts text at a word boundary so snippets never end mid-word. */
export function truncate(text, max) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, '')}…`;
}

/** Page title with the brand suffix, kept within ~70 characters. */
export function formatSeoTitle(rawTitle, fallback = 'Bingooo® — Oversized T-Shirts & Streetwear for Men in India') {
  if (!rawTitle) return fallback;
  const title = stripHtml(rawTitle);
  if (/bingooo/i.test(title)) return truncate(title, 70);
  const budget = 70 - BRAND_SUFFIX.length;
  return `${title.length > budget ? truncate(title, budget) : title}${BRAND_SUFFIX}`;
}

function variantPrice(product, variant) {
  const own = Number(variant?.price);
  return own > 0 ? own : Number(product.base_price ?? product.basePrice ?? 0);
}

function variantAvailable(variant) {
  if (variant?.inStock === false) return false;
  if (typeof variant?.stockQuantity === 'number') {
    return variant.stockQuantity - Number(variant.reservedQuantity || 0) > 0;
  }
  return variant?.inStock !== false;
}

/** Lowest price a customer can actually buy at, and whether anything is in stock. */
export function productPricing(product) {
  const base = Number(product.base_price ?? product.basePrice ?? 0);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const available = variants.filter(variantAvailable);
  const pool = (available.length ? available : variants).map((v) => variantPrice(product, v)).filter((p) => p > 0);
  const prices = pool.length ? pool : base > 0 ? [base] : [];
  const compareAt = Number(product.compare_at_price ?? product.compareAtPrice ?? 0);
  const low = prices.length ? Math.min(...prices) : 0;
  return {
    price: low,
    highPrice: prices.length ? Math.max(...prices) : 0,
    compareAtPrice: compareAt > low ? compareAt : null,
    inStock: variants.length ? available.length > 0 : product.status !== 'out_of_stock',
  };
}

export function productImages(product) {
  const images = (Array.isArray(product.images) ? product.images : [])
    .slice()
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))
    .map((img) => img?.url || img?.object_key)
    .filter((url) => typeof url === 'string' && url.length > 0)
    .map(absoluteUrl);
  return [...new Set(images)];
}

export function productSeoTitle(product) {
  const custom = stripHtml(product.seo_title);
  if (custom.length >= 10) return formatSeoTitle(custom);
  const category = product.category?.name;
  return formatSeoTitle(category ? `${stripHtml(product.title)} — ${category}` : stripHtml(product.title));
}

export function productSeoDescription(product) {
  const custom = stripHtml(product.seo_description);
  if (custom.length >= 50) return truncate(custom, 160);
  const description = stripHtml(product.description);
  if (description.length >= 50) return truncate(description, 160);
  const facts = [product.fabric, product.fit].map(stripHtml).filter(Boolean).join(', ');
  return truncate(
    `Buy ${stripHtml(product.title)} online at Bingooo${facts ? ` — ${facts}` : ''}. Free delivery on prepaid orders and ${POLICY.returnDays}-day easy exchange.`,
    160,
  );
}

const shippingDetails = () => ({
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: POLICY.handlingDays[0], maxValue: POLICY.handlingDays[1], unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: POLICY.transitDays[0], maxValue: POLICY.transitDays[1], unitCode: 'DAY' },
  },
});

const returnPolicy = () => ({
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'IN',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: POLICY.returnDays,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
});

/**
 * schema.org Product for a catalog product. Ratings are only emitted when the
 * product has real reviews — invented ratings violate Google's guidelines.
 */
export function productSchema(product) {
  const url = productUrl(product.slug);
  const { price, highPrice, inStock } = productPricing(product);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const images = productImages(product);
  const reviewCount = Number(product.reviewCount ?? product.reviews_count ?? 0);
  const rating = Number(product.avgRating ?? product.rating ?? 0);

  const offer = {
    '@type': highPrice > price ? 'AggregateOffer' : 'Offer',
    url,
    priceCurrency: 'INR',
    ...(highPrice > price ? { lowPrice: price, highPrice, offerCount: variants.length } : { price }),
    availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL },
    shippingDetails: shippingDetails(),
    hasMerchantReturnPolicy: returnPolicy(),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: stripHtml(product.title),
    description: truncate(product.seo_description || product.description || productSeoDescription(product), 5000),
    url,
    image: images.length ? images : [DEFAULT_OG_IMAGE],
    brand: { '@type': 'Brand', name: BRAND_NAME },
    ...(variants[0]?.sku ? { sku: variants[0].sku } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(product.fabric ? { material: stripHtml(product.fabric) } : {}),
    ...(colors.length ? { color: colors.join(', ') } : {}),
    ...(sizes.length ? { size: sizes.join(', ') } : {}),
    ...(price > 0 ? { offers: offer } : {}),
    ...(reviewCount > 0 && rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.round(rating * 10) / 10,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function categorySeoTitle(category) {
  const custom = stripHtml(category.seo_title);
  if (custom.length >= 10) return formatSeoTitle(custom);
  return formatSeoTitle(`Buy ${stripHtml(category.name)} Online in India`);
}

export function categorySeoDescription(category, productCount = 0) {
  const custom = stripHtml(category.seo_description || category.description);
  if (custom.length >= 50) return truncate(custom, 160);
  const name = stripHtml(category.name);
  return truncate(
    `Shop ${productCount > 0 ? `${productCount} ` : ''}${name.toLowerCase()} from Bingooo — premium cotton streetwear. Free delivery on prepaid orders, cash on delivery available across India and ${POLICY.returnDays}-day easy exchange.`,
    160,
  );
}

/** CollectionPage + ItemList so a category reads as a list of real products. */
export function categorySchema(category, products = []) {
  const url = categoryUrl(category.slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: stripHtml(category.name),
    description: categorySeoDescription(category, products.length),
    url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: productUrl(product.slug),
        name: stripHtml(product.title),
      })),
    },
  };
}

export const GOOGLE_MAPS_STORE_URL =
  'https://www.google.com/maps/search/?api=1&query=Bingooo+7+Roads+Junction+Main+Road+Srikakulam+Andhra+Pradesh+532001';

export const GOOGLE_MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=18.2969,83.8968';

export const GOOGLE_MAPS_EMBED_URL =
  'https://maps.google.com/maps?q=18.2969,83.8968+(Bingooo%20Menswear%20Flagship%20Atelier)&t=&z=16&ie=UTF8&iwloc=B&output=embed';

export const GOOGLE_REVIEW_URL =
  'https://www.google.com/maps/search/?api=1&query=Bingooo+7+Roads+Junction+Main+Road+Srikakulam+Andhra+Pradesh+532001';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['ClothingStore', 'MensClothingStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: BRAND_NAME,
    alternateName: ['Bingooo Men\'s Wear', 'Bingooo Atelier Srikakulam', 'Bingooo Menswear Flagship Store'],
    url: SITE_URL,
    image: `${SITE_URL}/brand-logo.png`,
    logo: `${SITE_URL}/brand-logo.png`,
    description:
      'Bingooo is India\'s premier heavyweight menswear brand offering 240–280 GSM oversized t-shirts, drop-shoulder hoodies, and bespoke custom-printed apparel made in our Srikakulam atelier. Located at 7 Roads Junction, Srikakulam, Andhra Pradesh.',
    keywords:
      'oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight streetwear, custom t-shirt printing, drop shoulder t-shirt, mens clothing store srikakulam, streetwear andhra pradesh',
    knowsAbout: [
      '240 GSM Cotton Fabric',
      'Oversized T-Shirts for Men',
      'Streetwear Fashion',
      'DTF Custom Printing',
      'Heavyweight Hoodies',
      'Drop Shoulder Silhouettes',
      'Custom Garment Studio',
    ],
    telephone: '+91-7981787317',
    email: 'bingooo.sklm@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '7 Roads Junction, Main Road',
      addressLocality: 'Srikakulam',
      addressRegion: 'Andhra Pradesh',
      postalCode: '532001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '18.2969',
      longitude: '83.8968',
    },
    hasMap: GOOGLE_MAPS_STORE_URL,
    areaServed: [
      { '@type': 'City', name: 'Srikakulam' },
      { '@type': 'City', name: 'Visakhapatnam' },
      { '@type': 'AdministrativeArea', name: 'Andhra Pradesh' },
      { '@type': 'Country', name: 'India' },
    ],
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
    priceRange: '₹699–₹1,999',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/bingooo.co.in',
      'https://www.youtube.com/@bingooo_co',
      'https://twitter.com/bingooo_co',
      'https://wa.me/917981787317',
      GOOGLE_MAPS_STORE_URL,
    ],
  };
}
