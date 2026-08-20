import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'product';
  schema?: Record<string, any>;
  noindex?: boolean;
}

export function Seo({
  title,
  description,
  url = 'https://virginiadenagodealership.com',
  image = 'https://virginiadenagodealership.com/og-image.png',
  type = 'website',
  schema,
  noindex = false,
}: SeoProps) {
  useEffect(() => {
    // Update robots meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    const prevRobotsContent = metaRobots?.getAttribute('content') ?? null;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noindex ? 'noindex,nofollow' : 'index, follow');

    // Update title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Update Open Graph tags
    const updateMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', url);
    updateMeta('og:image', image);
    updateMeta('og:type', type);

    // Update Twitter tags
    const updateTwitter = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitter('twitter:title', title);
    updateTwitter('twitter:description', description);
    updateTwitter('twitter:image', image);

    // Update Schema (JSON-LD)
    if (schema) {
      let scriptTag = document.querySelector('script[data-type="seo-schema"]');
      if (scriptTag) {
        document.head.removeChild(scriptTag);
      }
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-type', 'seo-schema');
      scriptTag.textContent = JSON.stringify(schema);
      document.head.appendChild(scriptTag);
    }

    return () => {
      // Restore robots tag to default on unmount
      const robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag) {
        if (prevRobotsContent !== null) {
          robotsTag.setAttribute('content', prevRobotsContent);
        } else {
          robotsTag.setAttribute('content', 'index, follow');
        }
      }
      // Cleanup schema on unmount to avoid duplicates
      const scriptTag = document.querySelector('script[data-type="seo-schema"]');
      if (scriptTag) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [title, description, url, image, type, schema, noindex]);

  return null;
}
