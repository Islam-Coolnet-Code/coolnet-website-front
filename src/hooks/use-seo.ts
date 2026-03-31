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

const DEFAULT_TITLE = 'Coolnet - Ultra-Fast Fiber Internet';
const DEFAULT_DESCRIPTION = 'Experience lightning-fast fiber internet with Coolnet. Up to 1Gbps speeds, 99.9% uptime, and 24/7 support.';

/**
 * Custom hook for managing SEO meta tags dynamically
 * Updates document title and meta tags based on the current page
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
    // Set document title
    const fullTitle = title ? `${title} | Coolnet` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper function to set or create meta tag
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

    // Set description
    const metaDescription = description || DEFAULT_DESCRIPTION;
    setMetaTag('description', metaDescription);

    // Set keywords
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Set Open Graph tags
    setMetaTag('og:title', ogTitle || fullTitle, true);
    setMetaTag('og:description', ogDescription || metaDescription, true);
    setMetaTag('og:type', ogType, true);

    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
    }

    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', ogTitle || fullTitle);
    setMetaTag('twitter:description', ogDescription || metaDescription);

    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Set canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }

    // Set robots meta tag for noIndex
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    }

    // Cleanup function - reset to defaults when component unmounts
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
