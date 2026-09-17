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

const DEFAULT_TITLE = "Bingooo — Premium Heavyweight Men's Wear";
const DEFAULT_DESCRIPTION =
  "Shop curated 240–280 GSM heavyweight cotton menswear or craft custom bespoke streetwear in our 3D Atelier Studio. Pan-India express delivery.";
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = 'https://bingooo.in';

/**
 * Ensures title length is optimized for search engines (50-60 characters)
 */
export function formatSeoTitle(rawTitle?: string): string {
  if (!rawTitle) return DEFAULT_TITLE;
  const brandSuffix = ' | Bingooo';
  let formatted = rawTitle.includes('Bingooo') ? rawTitle : `${rawTitle}${brandSuffix}`;
  if (formatted.length > 60) {
    // If appending brand pushed it over 60, check if core title fits with brand
    const trimmed = rawTitle.slice(0, 60 - brandSuffix.length).trim();
    formatted = rawTitle.includes('Bingooo') ? rawTitle.slice(0, 60).trim() : `${trimmed}${brandSuffix}`;
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
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

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
