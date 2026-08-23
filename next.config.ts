import type { NextConfig } from 'next';

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4000';
const { protocol, hostname, port } = new URL(apiOrigin);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,

  compiler: {
    styledComponents: true,
  },

  images: {
    dangerouslyAllowLocalIP:
      hostname === 'localhost' || hostname === '127.0.0.1',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2_678_400,
    remotePatterns: [
      {
        protocol: protocol.replace(':', '') as 'http' | 'https',
        hostname,
        port: port || undefined,
        pathname: '/uploads/**',
      },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ...(process.env.NODE_ENV === 'production'
            ? [{
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              }]
            : []),
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {

            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "img-src 'self' data: blob: https://i.ytimg.com " + apiOrigin,
              "media-src 'self' " + apiOrigin,
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",

              "script-src 'self' 'unsafe-inline'" +
                (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
              "connect-src 'self' " + apiOrigin,
              'frame-src https://www.youtube-nocookie.com',
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
