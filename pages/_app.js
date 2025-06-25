import '../src/index.css'
import { DefaultSeo } from 'next-seo'
import { defaultSEO } from '../lib/seo.config'

import { useEffect } from 'react'
import { Router } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: 'history_change',
      capture_exceptions: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      debug: process.env.NODE_ENV === 'development',
    })
  }, [])

  return (
    <PostHogProvider client={posthog}>
      <DefaultSeo {...defaultSEO} />
      <Component {...pageProps} />
    </PostHogProvider>
  )
}