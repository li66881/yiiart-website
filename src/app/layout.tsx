import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/SessionProvider'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import ChatWidget from '@/components/ChatWidget'
import CookieConsent from '@/components/CookieConsent'
import MarketingPixels from '@/components/MarketingPixels'
import VercelInsights from '@/components/VercelInsights'
import { siteAssetUrl } from '@/lib/assets'
import { defaultOgImage, defaultSeoDescription, siteName, siteUrl } from '@/lib/seo'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
        <Providers>
          <LanguageProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  {children}
                  <ChatWidget />
                  <CookieConsent />
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </Providers>
        <MarketingPixels />
        <VercelInsights />
      </body>
    </html>
  )
}
