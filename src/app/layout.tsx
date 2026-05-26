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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yiiart.com'),
  title: {
    default: 'YiiArt | Art for Your Home',
    template: '%s | YiiArt',
  },
  description: 'Discover original, hand-painted artworks by independent Chinese artists. One-of-a-kind oil, acrylic, and mixed-media paintings shipped worldwide with signed certificates.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      zh: '/zh',
    },
  },
  openGraph: {
    title: 'YiiArt | Art for Your Home',
    description: 'Discover original, hand-painted artworks by independent Chinese artists. One-of-a-kind oil, acrylic, and mixed-media paintings shipped worldwide with signed certificates.',
    url: '/',
    siteName: 'YiiArt',
    type: 'website',
    images: [
      {
        url: '/og-image',
        width: 1200,
        height: 630,
        alt: 'YiiArt - Original Art for Your Home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YiiArt | Art for Your Home',
    description: 'Discover original, hand-painted artworks by independent Chinese artists. One-of-a-kind oil, acrylic, and mixed-media paintings shipped worldwide with signed certificates.',
    images: ['/og-image'],
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
