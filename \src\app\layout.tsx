import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/SessionProvider'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { LanguageProvider } from '@/context/LanguageContext'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'YiiArt | Art for Your Home',
  description: 'Discover unique hand-drawn oil paintings from talented artists. Find the perfect artwork for your space.',
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
      </body>
    </html>
  )
}
