/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Static assets — cache aggressively at CDN edge
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images and fonts
      {
        source: '/(.*\.(?:jpg|jpeg|png|webp|avif|svg|ico|woff2?|ttf|eot))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, must-revalidate',
          },
        ],
      },
      // Content-Security-Policy
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://s.pinimg.com https://analytics.tiktok.com https://www.paypal.com https://js.stripe.com https://*.vercel-insights.com https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com https://picsum.photos https://res.cloudinary.com https://*.public.blob.vercel-storage.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.sanity.io https://api.stripe.com https://www.paypal.com https://*.supabase.co https://www.google-analytics.com https://www.facebook.com https://ct.pinterest.com https://analytics.tiktok.com https://*.vercel-insights.com",
              "frame-src 'self' https://www.paypal.com https://js.stripe.com https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://www.paypal.com https://checkout.stripe.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'yiiart.com',
          },
        ],
        destination: 'https://www.yiiart.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
