import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/SessionProvider'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { LanguageProvider } from '@/context/LanguageContext'
import ChatWidget from '@/components/ChatWidget'
import CookieConsent from '@/components/CookieConsent'
import MarketingPixels from '@/components/MarketingPixels'
import VercelInsights from '@/components/VercelInsights'
import { defaultOgImage, defaultSeoDescription, siteName, siteUrl } from '@/lib/seo'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <LanguageProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <ChatWidget />
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </Providers>
        <MarketingPixels />
        <VercelInsights />
        <CookieConsent />
      </body>
    </html>
  )
}
