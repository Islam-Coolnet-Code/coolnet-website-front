import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'Coolnet';
const SITE_URL = 'https://coolnet.ps';
const DEFAULT_TITLE = 'Coolnet | Ultra-Fast Fiber Internet';
const DEFAULT_DESCRIPTION = 'Experience lightning-fast fiber internet with Coolnet. Up to 1000 Mbps speeds, 99.9% uptime, and 24/7 support.';
const DEFAULT_IMAGE = `${SITE_URL}/images/main.png`;

/**
 * Custom hook for managing SEO meta tags dynamically
 */
export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const metaDescription = description || DEFAULT_DESCRIPTION;
    const metaImage = ogImage || DEFAULT_IMAGE;

    // Primary meta
    setMetaTag('description', metaDescription);
    if (keywords) setMetaTag('keywords', keywords);
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    }

    // Open Graph
    setMetaTag('og:title', ogTitle || fullTitle, true);
    setMetaTag('og:description', ogDescription || metaDescription, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', metaImage, true);
    setMetaTag('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', ogTitle || fullTitle);
    setMetaTag('twitter:description', ogDescription || metaDescription);
    setMetaTag('twitter:image', metaImage);

    // Canonical URL
    const canonical = canonicalUrl || `${SITE_URL}${window.location.pathname}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, canonicalUrl, noIndex]);
}

/**
 * Helper hook for setting just the page title
 */
export function usePageTitle(title: string) {
  useSEO({ title });
}

export default useSEO;
