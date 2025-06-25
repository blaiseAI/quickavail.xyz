# Configuration Guide

QuickAvail uses a centralized configuration system to avoid hardcoded URLs and make deployment across different environments seamless.

## Environment Configuration

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Customize the variables for your environment:
   ```bash
   # Development (default)
   NODE_ENV=development
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=QuickAvail
   NEXT_PUBLIC_SITE_DOMAIN=localhost:3000
   
   # Production (QuickAvail example)
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://quickavail.fyi
   NEXT_PUBLIC_SITE_NAME=QuickAvail
   NEXT_PUBLIC_SITE_DOMAIN=quickavail.fyi
   ```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `NEXT_PUBLIC_SITE_URL` | Base URL of your application | Auto-detected | No |
| `NEXT_PUBLIC_SITE_NAME` | Name of your application | `QuickAvail` | No |
| `NEXT_PUBLIC_SITE_DOMAIN` | Domain of your application | Auto-detected | No |
| `MONGODB_URI` | MongoDB connection string | See MongoDB docs | Yes |

## Site Configuration

The centralized configuration is managed in `lib/site.config.js`:

### siteConfig Object

```javascript
export const siteConfig = {
  name: 'QuickAvail',           // App name
  domain: 'quickavail.fyi',     // Domain
  url: 'https://quickavail.fyi', // Base URL
  title: 'QuickAvail - Share Your Availability Instantly',
  description: 'Create and share availability schedules...',
  keywords: 'availability, scheduling, calendar...',
  twitter: '@quickavail',
  images: {
    ogImage: '/og-image.png',
    // ... other images
  }
}
```

### URL Utilities

```javascript
import { urls } from '../lib/site.config';

// Basic URLs
urls.home()                    // https://quickavail.fyi
urls.create()                  // https://quickavail.fyi/create
urls.share('abc123')           // https://quickavail.fyi/share/abc123

// API URLs
urls.api.schedules()           // https://quickavail.fyi/api/schedules
urls.api.schedule('abc123')    // https://quickavail.fyi/api/schedules/abc123

// SEO URLs
urls.sitemap()                 // https://quickavail.fyi/sitemap.xml
urls.robots()                  // https://quickavail.fyi/robots.txt

// Images
urls.ogImage()                 // https://quickavail.fyi/og-image.png
urls.image('/custom.png')      // https://quickavail.fyi/custom.png
```

### Structured Data Utilities

```javascript
import { structuredData } from '../lib/site.config';

// Pre-built structured data
structuredData.website()       // Website schema
structuredData.webApplication() // WebApplication schema
structuredData.organization()  // Organization schema
```

## SEO Configuration

The SEO configuration in `lib/seo.config.js` automatically uses the site configuration:

### Global SEO

```javascript
import { defaultSEO } from '../lib/seo.config';

// In _app.js
<DefaultSeo {...defaultSEO} />
```

### Page-specific SEO

```javascript
import { pageSEO } from '../lib/seo.config';

// In pages
<NextSeo {...pageSEO.landing} />
<NextSeo {...pageSEO.create} />
<NextSeo {...pageSEO.share} />
```

### Dynamic SEO

```javascript
import { generateScheduleSEO } from '../lib/seo.config';

// For dynamic content
const seoData = generateScheduleSEO(schedule);
<NextSeo {...seoData} />
```

## Deployment

### Automatic Detection

The configuration automatically detects the environment:

1. **Environment Variables**: Uses `NEXT_PUBLIC_SITE_URL` if set
2. **Browser**: Uses `window.location.origin` on client side
3. **Vercel**: Uses `VERCEL_URL` environment variable
4. **Production**: Falls back to `https://quickavail.fyi`
5. **Development**: Falls back to `http://localhost:3000`

### Platform-specific Setup

#### Vercel
```bash
# Environment variables are automatically set
# Just add your custom variables:
NEXT_PUBLIC_SITE_NAME=Your App Name
```

#### Railway
```bash
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
NEXT_PUBLIC_SITE_DOMAIN=your-app.railway.app
```

#### Render
```bash
NEXT_PUBLIC_SITE_URL=https://your-app.onrender.com
NEXT_PUBLIC_SITE_DOMAIN=your-app.onrender.com
```

#### Custom Domain
```bash
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
NEXT_PUBLIC_SITE_DOMAIN=your-custom-domain.com
```

## Dynamic SEO Files

The application generates SEO files dynamically:

### robots.txt
- **URL**: `/robots.txt` → `/api/robots.txt`
- **Features**: Environment-aware sitemap URL, privacy-conscious disallows

### sitemap.xml
- **URL**: `/sitemap.xml` → `/api/sitemap.xml`
- **Features**: Dynamic URL generation, proper timestamps

## Migration from Hardcoded URLs

If you're upgrading from hardcoded URLs:

1. Replace hardcoded URLs with utility functions:
   ```javascript
   // Before
   const url = 'https://quickavail.fyi/create';
   
   // After
   import { urls } from '../lib/site.config';
   const url = urls.create();
   ```

2. Update SEO configurations:
   ```javascript
   // Before
   canonical: 'https://quickavail.fyi/page'
   
   // After
   canonical: urls.page()
   ```

3. Use environment variables for customization:
   ```bash
   # .env.local
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

## Testing

Test your configuration across environments:

```bash
# Development
npm run dev
# Check: http://localhost:3000

# Production build
npm run build
npm start
# Check: URLs in HTML source

# Environment-specific
NODE_ENV=production NEXT_PUBLIC_SITE_URL=https://staging.example.com npm run dev
```

## Best Practices

1. **Never hardcode URLs** - Always use the utility functions
2. **Set environment variables** - Don't rely on auto-detection in production
3. **Test across environments** - Verify URLs work in all deployment scenarios
4. **Update SEO files** - Ensure robots.txt and sitemap.xml use correct URLs
5. **Check social sharing** - Verify Open Graph and Twitter Cards use correct images

## Troubleshooting

### URLs showing localhost in production
- Set `NEXT_PUBLIC_SITE_URL` environment variable
- Check deployment platform environment variables

### Images not loading
- Verify image paths in `siteConfig.images`
- Check if images exist in `public/` directory
- Ensure CDN configuration if using external images

### SEO issues
- Verify canonical URLs are correct
- Check structured data with Google's Rich Results Test
- Ensure meta tags are properly generated 