// ─────────────────────────────────────────────────────────
// Schema.org Structured Data Generators for Bingooo
// ─────────────────────────────────────────────────────────

import { SITE_URL, BRAND_NAME, productSchema } from './catalog-seo.mjs';

export { SITE_URL, BRAND_NAME };

/**
 * Serialize structured data for an inline <script type="application/ld+json">.
 * JSON.stringify leaves `<` intact, so a value containing `</script>` would
 * close the tag and let the rest run as HTML; `<` is the same character
 * to a JSON parser but inert to the HTML parser.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

/**
 * Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: ['Bingooo Menswear', 'Bingooo Streetwear', 'Bingooo Clothing India'],
    url: SITE_URL,
    logo: `${SITE_URL}/brand-logo.png`,
    image: `${SITE_URL}/brand-logo.png`,
    description:
      'Contemporary Indian luxury menswear crafted with 240 to 280 GSM heavyweight cotton and bespoke 3D custom apparel.',
    keywords:
      'oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight streetwear india, custom oversized t shirt printing india, drop shoulder t-shirt, 380 gsm fleece hoodie',
    knowsAbout: [
      '240 GSM Cotton Fabric',
      'Oversized Streetwear',
      'DTF Custom Printing',
      'Heavyweight Hoodies',
      '3D Apparel Design',
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/bingooo.co',
      'https://www.youtube.com/@bingooo_co',
      'https://twitter.com/bingooo_co',
      'https://wa.me/917981787317',
    ],
    priceRange: '₹₹',
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND_NAME,
    alternateName: ['Bingooo Menswear', 'Bingooo Streetwear', 'Bingooo Clothing India'],
    keywords:
      'oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight streetwear india, custom t-shirt printing india, drop shoulder t-shirt',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Product schema — see catalog-seo.mjs (shared with the build-time prerender).
 */
export function generateProductSchema(product: Record<string, any>) {
  return productSchema(product);
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbsSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * FAQPage Schema
 */
export function generateFaqSchema(faqs: FaqItemSchema[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * ItemList Schema — for Shop / Category listing pages (enables Google rich sitelinks)
 */
export function generateItemListSchema(
  items: Array<{ name: string; slug: string; price: number; image?: string }>,
  listName = 'Bingooo Products',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}/product/${item.slug}`,
      image: item.image
        ? item.image.startsWith('http')
          ? item.image
          : `${SITE_URL}${item.image}`
        : `${SITE_URL}/brand-logo.png`,
    })),
  };
}

/**
 * CollectionPage Schema — for category pages
 */
export function generateCollectionPageSchema(
  name: string,
  description: string,
  slug: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/category/${slug}/#collection`,
    name,
    description,
    url: `${SITE_URL}/category/${slug}`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

/**
 * LocalBusiness Schema — richer than ClothingStore alone, boosts Google Maps pack
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['ClothingStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: BRAND_NAME,
    alternateName: ['Bingooo Men\'s Wear', 'Bingooo Atelier Srikakulam'],
    url: SITE_URL,
    image: `${SITE_URL}/brand-logo.png`,
    logo: `${SITE_URL}/brand-logo.png`,
    description:
      'Bingooo is India\'s premier heavyweight menswear brand offering 240–280 GSM oversized t-shirts, drop-shoulder hoodies, and bespoke custom-printed apparel engineered in our 3D Atelier. Located in Srikakulam, Andhra Pradesh.',
    keywords:
      'oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight streetwear, custom t-shirt printing, drop shoulder t-shirt, mens clothing store srikakulam',
    knowsAbout: [
      '240 GSM Cotton Fabric',
      'Oversized T-Shirts for Men',
      'Streetwear Fashion',
      'DTF Custom Printing',
      'Heavyweight Hoodies',
      'Drop Shoulder Silhouettes',
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
    hasMap: 'https://maps.google.com/?q=Srikakulam+Andhra+Pradesh',
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
      'https://www.instagram.com/bingooo.co',
      'https://www.youtube.com/@bingooo_co',
      'https://twitter.com/bingooo_co',
      'https://wa.me/917981787317',
    ],
  };
}

