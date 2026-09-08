import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
}

const DEFAULT_TITLE = "Bingooo — Men's Wear & Custom Fashion";
const DEFAULT_DESCRIPTION =
  "Shop curated heavyweight menswear or create custom apparel in our 3D Atelier Studio. 240–280 GSM combed cotton made for effortless personal expression.";
const DEFAULT_IMAGE = '/og-image.png';

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

export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? title.includes('Bingooo')
        ? title
        : `${title} | Bingooo`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonical || window.location.href);

    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Update canonical link if provided
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, keywords, canonical, ogType, ogImage]);
}

export function SEO(props: SEOProps) {
  useSEO(props);

  const fullTitle = props.title
    ? props.title.includes('Bingooo')
      ? props.title
      : `${props.title} | Bingooo`
    : DEFAULT_TITLE;
  const desc = props.description || DEFAULT_DESCRIPTION;

  // React 19 supports head tags inside components
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </>
  );
}
