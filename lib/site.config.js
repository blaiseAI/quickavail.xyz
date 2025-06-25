// Site Configuration
// Centralized configuration to avoid hardcoding URLs throughout the application

// Get the base URL from environment variables or default to localhost
const getBaseUrl = () => {
  // In production, use the NEXT_PUBLIC_SITE_URL environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // For development, check if we're in browser or server
  if (typeof window !== 'undefined') {
    // Browser: use current origin
    return window.location.origin;
  }
  
  // Server: check various environment indicators
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Default production URL if no environment variable is set
    return 'https://quickavail.fyi';
  }
  
  // Development default
  return 'http://localhost:3000';
};

// Site configuration object
export const siteConfig = {
  // Basic site information
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'QuickAvail',
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || (process.env.NODE_ENV === 'production' ? 'quickavail.fyi' : 'localhost:3000'),
  url: getBaseUrl(),
  
  // SEO defaults
  title: 'QuickAvail - Share Your Availability Instantly',
  description: 'Create and share your availability schedules instantly. No signup required. Secure, timezone-safe, and mobile-friendly.',
  keywords: 'availability, scheduling, calendar, meetings, appointments, time slots, share schedule',
  
  // Social media
  twitter: '@quickavail',
  
  // Images (relative paths that will be combined with base URL)
  images: {
    ogImage: '/og-image.png',
    ogImageSquare: '/og-image-square.png',
    twitterCard: '/twitter-card.png',
    favicon: '/favicon.png',
    favicon16: '/favicon.png',
    favicon32: '/favicon.png',
    appleTouchIcon: '/favicon.png',
    webmanifest: '/site.webmanifest'
  }
};

// Utility functions for URL generation
export const urls = {
  // Base URLs
  base: () => siteConfig.url,
  home: () => siteConfig.url,
  
  // Application routes
  create: () => `${siteConfig.url}/create`,
  share: (shareId) => shareId ? `${siteConfig.url}/share/${shareId}` : `${siteConfig.url}/share`,
  admin: () => `${siteConfig.url}/admin`,
  
  // API routes
  api: {
    schedules: () => `${siteConfig.url}/api/schedules`,
    schedule: (shareId) => `${siteConfig.url}/api/schedules/${shareId}`,
    timeSlots: () => `${siteConfig.url}/api/time-slots`,
  },
  
  // SEO files
  sitemap: () => `${siteConfig.url}/sitemap.xml`,
  robots: () => `${siteConfig.url}/robots.txt`,
  
  // Images (full URLs)
  image: (path) => `${siteConfig.url}${path}`,
  ogImage: () => `${siteConfig.url}${siteConfig.images.ogImage}`,
  ogImageSquare: () => `${siteConfig.url}${siteConfig.images.ogImageSquare}`,
  twitterCard: () => `${siteConfig.url}${siteConfig.images.twitterCard}`,
};

// JSON-LD structured data utilities
export const structuredData = {
  // Website schema
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }),
  
  // WebApplication schema
  webApplication: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1'
    }
  }),
  
  // Organization schema
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: siteConfig.url
    }
  })
};

export default siteConfig; 