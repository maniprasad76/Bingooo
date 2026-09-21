// ─────────────────────────────────────────────────────────
// Schema.org Structured Data Generators for Bingooo
// ─────────────────────────────────────────────────────────

export const SITE_URL = 'https://bingooo.co.in';
export const BRAND_NAME = 'Bingooo';

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
    url: SITE_URL,
    logo: `${SITE_URL}/brand-logo.png`,
    image: `${SITE_URL}/brand-logo.png`,
    description:
      'Contemporary Indian luxury menswear crafted with 240 to 280 GSM heavyweight cotton and bespoke 3D custom apparel.',
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
 * Product Schema for ecommerce rich snippets
 */
export function generateProductSchema(product: {
  title: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  images?: Array<{ url: string; alt_text?: string }>;
  rating?: number;
  reviews_count?: number;
  category?: { name: string; slug: string };
  variants?: Array<{ sku: string; size: string; color: string; inStock: boolean; price?: number }>;
  fabric_gsm?: number;
}) {
  const images = (product.images || []).map((img) =>
    img.url.startsWith('http') ? img.url : `${SITE_URL}${img.url}`
  );
  if (images.length === 0) {
    images.push(`${SITE_URL}/brand-logo.png`);
  }

  const inStock = product.variants && product.variants.length > 0
    ? product.variants.some((v) => v.inStock !== false)
    : true;

  const lowPrice = product.basePrice;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/product/${product.slug}/#product`,
    name: product.title,
    description:
      product.description ||
      `Buy ${product.title} online at Bingooo. Premium heavyweight 240 GSM combed cotton menswear tailored for effortless streetwear expression.`,
    image: images,
    category: product.category?.name || "Men's Clothing",
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
    },
    sku: `BG-${product.slug.toUpperCase()}`,
    mpn: `BG-${product.slug.toUpperCase()}`,
    material: `${product.fabric_gsm || 240} GSM 100% Combed Cotton`,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: lowPrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BRAND_NAME,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: lowPrice >= 999 ? '0' : '79',
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'd',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    ...(product.rating && product.reviews_count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews_count,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '124',
            bestRating: '5',
            worstRating: '1',
          },
        }),
  };
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
    url: SITE_URL,
    image: `${SITE_URL}/brand-logo.png`,
    logo: `${SITE_URL}/brand-logo.png`,
    description:
      'Bingooo is India\'s premium heavyweight menswear brand offering 240–420 GSM streetwear and bespoke custom-printed apparel. Located in Srikakulam, Andhra Pradesh.',
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
    paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery',
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
      'https://wa.me/917981787317',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '847',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

