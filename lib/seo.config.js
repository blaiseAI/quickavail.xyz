// SEO Configuration for QuickAvail
// This file contains all the default SEO settings used across the application

import { siteConfig, urls } from './site.config.js';

// Global SEO configuration for Next SEO
export const defaultSEO = {
  // Basic meta tags
  title: siteConfig.title,
  description: siteConfig.description,
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: urls.home(),
    site_name: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: urls.ogImage(),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Share Your Availability Instantly`,
        type: 'image/png',
      },
      {
        url: urls.ogImageSquare(),
        width: 1080,
        height: 1080,
        alt: `${siteConfig.name} - Share Your Availability Instantly`,
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    handle: siteConfig.twitter,
    site: siteConfig.twitter,
    cardType: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [urls.twitterCard()],
  },
  
  // Additional metadata
  additionalMetaTags: [
    {
      name: 'keywords',
      content: siteConfig.keywords,
    },
    {
      name: 'author',
      content: siteConfig.name,
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
    {
      name: 'theme-color',
      content: '#3B82F6',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: siteConfig.name,
    },
    {
      name: 'application-name',
      content: siteConfig.name,
    },
    {
      name: 'msapplication-TileColor',
      content: '#3B82F6',
    },
    {
      name: 'msapplication-config',
      content: '/browserconfig.xml',
    },
  ],
  
  // Additional link tags
  additionalLinkTags: [
    {
      rel: 'icon',
      href: siteConfig.images.favicon,
    },
    {
      rel: 'apple-touch-icon',
      href: siteConfig.images.appleTouchIcon,
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: siteConfig.images.webmanifest,
    },
    {
      rel: 'canonical',
      href: urls.home(),
    },
  ],
  
  // Robots configuration
  robotsProps: {
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    noarchive: false,
    nofollow: false,
    noimageclick: false,
    noindex: false,
  },
};

// Page-specific SEO configurations
export const pageSEO = {
  landing: {
    title: `${siteConfig.name} - Share Your Availability in Under 2 Minutes`,
    description: 'Create and share your availability schedules instantly. Perfect for client meetings, team coordination, interviews, and events.',
    canonical: urls.home(),
    openGraph: {
      title: `${siteConfig.name} - Share Your Availability in Under 2 Minutes`,
      description: 'Create and share your availability schedules instantly. No signup required. Secure, timezone-safe, and mobile-friendly.',
      url: urls.home(),
      type: 'website',
    },
  },
  
  create: {
    title: `Create Schedule - ${siteConfig.name}`,
    description: 'Create your availability schedule in 4 simple steps. Choose your project type, set your available times, add contact info, and share instantly.',
    canonical: urls.create(),
    openGraph: {
      title: `Create Schedule - ${siteConfig.name}`,
      description: 'Create your availability schedule in 4 simple steps. Choose your project type, set your available times, add contact info, and share instantly.',
      url: urls.create(),
      type: 'website',
    },
  },
  
  share: {
    title: `Shared Schedule - ${siteConfig.name}`,
    description: 'View this shared availability schedule and find the perfect time to connect.',
    canonical: urls.share(),
    openGraph: {
      title: `Shared Schedule - ${siteConfig.name}`,
      description: 'View this shared availability schedule and find the perfect time to connect.',
      url: urls.share(),
      type: 'website',
    },
  },
  
  admin: {
    title: `Admin Dashboard - ${siteConfig.name}`,
    description: `${siteConfig.name} admin dashboard for analytics and cleanup operations.`,
    canonical: urls.admin(),
    robots: {
      index: false,
      follow: false,
    },
  },
};

// Dynamic SEO generation for schedule pages
export const generateScheduleSEO = (schedule) => {
  if (!schedule) {
    return pageSEO.share;
  }
  
  const title = `${schedule.personName}'s Availability - ${siteConfig.name}`;
  const description = `View ${schedule.personName}'s availability schedule and find the perfect time to connect. ${schedule.projects?.length || 0} project(s) available.`;
  
  return {
    title,
    description,
    canonical: urls.share(schedule.shareId),
    openGraph: {
      title,
      description,
      url: urls.share(schedule.shareId),
      type: 'website',
    },
    // Don't index individual schedules for privacy
    robots: {
      index: false,
      follow: false,
    },
  };
};

export default defaultSEO; 