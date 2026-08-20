import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/SessionProvider'
import CatalogNavigationProvider from '@/components/CatalogNavigationProvider'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import ChatWidget from '@/components/ChatWidget'
import MiniCartDrawer from '@/components/MiniCartDrawer'
import CookieConsent from '@/components/CookieConsent'
import MarketingPixels from '@/components/MarketingPixels'
import NavigationRecovery from '@/components/NavigationRecovery'
import VercelInsights from '@/components/VercelInsights'
import { siteAssetUrl } from '@/lib/assets'
import { defaultOgImage, defaultSeoDescription, siteName, siteUrl } from '@/lib/seo'
import { getCatalogNavigationState } from '@/lib/storefront/collection-catalog'

const poppins = localFont({
  src: [
    { path: '../../public/fonts/poppins-latin-300.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/poppins-latin-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/poppins-latin-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/poppins-latin-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
})

const urbanist = localFont({
  src: '../../public/fonts/urbanist-latin.woff2',
  weight: '300 700',
  variable: '--font-heading',
  display: 'swap',
})

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-8B8R7YY67Q"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'YiiArt | Art for Your Home',
    template: '%s | YiiArt',
  },
  description: defaultSeoDescription,
  openGraph: {
    title: 'YiiArt | Art for Your Home',
    description: defaultSeoDescription,
    url: '/',
    siteName,
    type: 'website',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Original artwork styled in a modern interior',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YiiArt | Art for Your Home',
    description: defaultSeoDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: siteAssetUrl("/favicon.svg"),
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigationState = await getCatalogNavigationState()

  return (
    <html lang="en" className={`${poppins.variable} ${urbanist.variable}`}>
      <head>
        {gaMeasurementId && (
          <>
            <Script
              id="yiiart-google-consent-default"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    wait_for_update: 500
                  });
                `,
              }}
            />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script
              id="yiiart-ga4-head"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  gtag('js', new Date());
                  gtag('config', ${JSON.stringify(gaMeasurementId)}, {
                    anonymize_ip: true,
                    send_page_view: false
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: siteName,
                  url: siteUrl,
                  logo: `${siteUrl}/brand/yiiart-logo.svg`,
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  name: siteName,
                  url: siteUrl,
                  publisher: { "@id": `${siteUrl}/#organization` },
                },
              ],
            }),
          }}
        />
        <Providers>
          <NavigationRecovery />
          <CatalogNavigationProvider navigationState={navigationState}>
            <LanguageProvider>
              <CurrencyProvider>
                <WishlistProvider>
                  <CartProvider>
                    {children}
                    <MiniCartDrawer />
                    <ChatWidget />
                    <CookieConsent />
                  </CartProvider>
                </WishlistProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </CatalogNavigationProvider>
        </Providers>
        <MarketingPixels />
        <VercelInsights />
      </body>
    </html>
  )
}
