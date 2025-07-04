import { siteConfig, urls } from '../../lib/site.config';

export default function handler(req, res) {
  const robotsTxt = `# Robots.txt for ${siteConfig.name}
# This file is automatically generated based on your deployment environment

User-agent: *

# Allow indexing of main application pages
Allow: /
Allow: /create

# Block indexing of shared schedules for privacy
Disallow: /share/
Disallow: /api/

# Block admin areas
Disallow: /admin/

# Allow access to static assets
Allow: /favicon.png
Allow: /sitemap.xml
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$

# Sitemap location
Sitemap: ${urls.sitemap()}`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(robotsTxt);
} 