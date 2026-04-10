import type { Metadata } from 'next'
import './globals.css'

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
      <body className="antialiased">{children}</body>
    </html>
  )
}
