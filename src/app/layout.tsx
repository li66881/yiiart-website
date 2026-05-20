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
  description: 'Discover unique hand-drawn oil paintings from talented artists. Find the perfect artwork for your space.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YiiArt | Art for Your Home',
    description: 'Discover unique hand-drawn oil paintings from talented artists. Find the perfect artwork for your space.',
    url: '/',
    siteName: 'YiiArt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YiiArt | Art for Your Home',
    description: 'Discover unique hand-drawn oil paintings from talented artists. Find the perfect artwork for your space.',
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
