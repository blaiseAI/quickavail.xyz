// Schedule creation page
// URL: /create

import QuickAvail from '../components/QuickAvail'
import { NextSeo, BreadcrumbJsonLd } from 'next-seo'
import { pageSEO } from '../lib/seo.config'
import { siteConfig, urls } from '../lib/site.config'

export default function CreatePage() {
  return (
    <>
      <NextSeo {...pageSEO.create} />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: siteConfig.name,
            item: urls.home(),
          },
          {
            position: 2,
            name: 'Create Schedule',
            item: urls.create(),
          },
        ]}
      />
      <QuickAvail />
    </>
  )
} 