import { useEffect } from 'react';
import { generateBreadcrumbsSchema, type BreadcrumbItem } from '../../lib/seo/schema';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  /** Product price in INR — emits product:price OG tags when ogType="product" */
  productPrice?: number;
  schema?: Record<string, any> | Array<Record<string, any>>;
  hreflang?: boolean | Array<{ lang: string; href: string }>;
  /** Auto-generates BreadcrumbList schema and appends it to schema output */
  breadcrumbs?: BreadcrumbItem[];
}

const DEFAULT_TITLE = "Bingooo® — Oversized T-Shirts for Men (240 GSM) & Luxury Streetwear India";
const DEFAULT_DESCRIPTION =
  "Shop India's premier 240–280 GSM heavyweight oversized t-shirts for men & streetwear. 100% super-combed cotton, drop-shoulder fit, 3D custom printing atelier. COD & Pan-India free delivery.";
const DEFAULT_KEYWORDS =
  "oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight t shirt india, drop shoulder t shirt, luxury streetwear india, custom oversized t shirt printing india, streetwear brand india, boxy fit t shirt men, 100 combed cotton oversized tee, bingooo menswear";
const DEFAULT_IMAGE = '/brand-logo.png';
const BASE_URL = 'https://bingooo.co.in';

/**
 * Ensures title length is optimized for search engines (up to 68 characters, preserving keywords)
 */
export function formatSeoTitle(rawTitle?: string): string {
  if (!rawTitle) return DEFAULT_TITLE;
  const brandSuffix = ' | Bingooo®';
  let formatted = rawTitle.includes('Bingooo') ? rawTitle : `${rawTitle}${brandSuffix}`;
  if (formatted.length > 70) {
    if (rawTitle.includes('Bingooo')) {
      // Find clean word boundary before 68 chars
      const lastSpace = rawTitle.slice(0, 68).lastIndexOf(' ');
      formatted = lastSpace > 45 ? rawTitle.slice(0, lastSpace).trim() : rawTitle.slice(0, 68).trim();
    } else {
      const budget = 70 - brandSuffix.length;
      const lastSpace = rawTitle.slice(0, budget).lastIndexOf(' ');
      const trimmed = lastSpace > 30 ? rawTitle.slice(0, lastSpace).trim() : rawTitle.slice(0, budget).trim();
      formatted = `${trimmed}${brandSuffix}`;
    }
  }
  return formatted;
}

function setMetaTag(attribute: 'name' | 'property', key: string, value?: string) {
  if (!value) return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function setLinkTag(rel: string, href: string, attributes: Record<string, string> = {}) {
  let selector = `link[rel="${rel}"]`;
  if (attributes.hreflang) {
    selector += `[hreflang="${attributes.hreflang}"]`;
  }
  let link = document.querySelector(selector) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    for (const [k, v] of Object.entries(attributes)) {
      link.setAttribute(k, v);
    }
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  productPrice,
  schema,
  hreflang = true,
  breadcrumbs,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = formatSeoTitle(title);
    document.title = fullTitle;

    // Meta descriptions and keywords
    setMetaTag('name', 'description', description.slice(0, 160));
    setMetaTag('name', 'keywords', keywords || DEFAULT_KEYWORDS);

    // Robots meta tag (critical for noindex product scheme, unpublished drafts, checkout, cart)
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
      setMetaTag('name', 'googlebot', 'noindex, nofollow');
    } else {
      setMetaTag(
        'name',
        'robots',
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      );
      setMetaTag(
        'name',
        'googlebot',
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      );
    }

    // Resolve Canonical URL (strip query/hash for clean canonical)
    const resolvedCanonical =
      canonical ||
      `${BASE_URL}${window.location.pathname === '/' ? '' : window.location.pathname}`;
    setLinkTag('canonical', resolvedCanonical);

    // OpenGraph tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description.slice(0, 160));
    setMetaTag('property', 'og:type', ogType);
    setMetaTag(
      'property',
      'og:image',
      ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`
    );
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:site_name', 'Bingooo Men\'s Wear');
    setMetaTag('property', 'og:locale', 'en_IN');

    // Twitter card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@bingooo_co');
    setMetaTag('name', 'twitter:creator', '@bingooo_co');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description.slice(0, 160));
    setMetaTag(
      'name',
      'twitter:image',
      ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`
    );

    // Hreflang alternates
    if (hreflang === true && !noindex) {
      setLinkTag('alternate', resolvedCanonical, { hreflang: 'en' });
      setLinkTag('alternate', resolvedCanonical, { hreflang: 'en-IN' });
      setLinkTag('alternate', resolvedCanonical, { hreflang: 'x-default' });
    } else if (Array.isArray(hreflang) && !noindex) {
      hreflang.forEach((item) => {
        setLinkTag('alternate', item.href, { hreflang: item.lang });
      });
    }

    // Product price OG tags (Google Shopping / Facebook Shops)
    if (ogType === 'product' && productPrice) {
      setMetaTag('property', 'product:price:amount', String(productPrice));
      setMetaTag('property', 'product:price:currency', 'INR');
    }

    // JSON-LD Schema structured data — merge breadcrumbs automatically
    const existingScript = document.getElementById('bingooo-json-ld');
    if (existingScript) {
      existingScript.remove();
    }
    const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
      ? generateBreadcrumbsSchema(breadcrumbs)
      : null;
    const allSchemas = [
      ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
      ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ];
    if (allSchemas.length > 0 && !noindex) {
      const script = document.createElement('script');
      script.id = 'bingooo-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(allSchemas.length === 1 ? allSchemas[0] : allSchemas);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up script on unmount
      const s = document.getElementById('bingooo-json-ld');
      if (s) s.remove();
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    noindex,
    ogType,
    ogImage,
    productPrice,
    schema,
    hreflang,
    breadcrumbs,
  ]);
}

export function SEO(props: SEOProps) {
  useSEO(props);

  const fullTitle = formatSeoTitle(props.title);
  const desc = (props.description || DEFAULT_DESCRIPTION).slice(0, 160);
  const resolvedCanonical =
    props.canonical ||
    `${BASE_URL}${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const ogImg = props.ogImage || DEFAULT_IMAGE;
  const fullImg = ogImg.startsWith('http') ? ogImg : `${BASE_URL}${ogImg}`;

  const breadcrumbSchema = props.breadcrumbs && props.breadcrumbs.length > 0
    ? generateBreadcrumbsSchema(props.breadcrumbs)
    : null;
  const allSchemas = [
    ...(props.schema ? (Array.isArray(props.schema) ? props.schema : [props.schema]) : []),
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
  ];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {props.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      )}
      <link rel="canonical" href={resolvedCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={props.ogType || 'website'} />
      <meta property="og:image" content={fullImg} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:site_name" content="Bingooo Men's Wear" />
      <meta property="og:locale" content="en_IN" />
      {props.ogType === 'product' && props.productPrice && (
        <>
          <meta property="product:price:amount" content={String(props.productPrice)} />
          <meta property="product:price:currency" content="INR" />
        </>
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bingooo_co" />
      <meta name="twitter:creator" content="@bingooo_co" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={fullImg} />
      {allSchemas.length > 0 && !props.noindex && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(allSchemas.length === 1 ? allSchemas[0] : allSchemas),
          }}
        />
      )}
    </>
  );
}
