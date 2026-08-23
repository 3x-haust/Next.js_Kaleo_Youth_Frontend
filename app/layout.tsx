import type { Metadata, Viewport } from 'next';
import { StyledRegistry } from '@/lib/registry';
import { SITE, siteUrl } from '@/lib/site';
import { SiteGlobalStyle } from '@/lib/site-global-styles';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.nameKo,
    template: `%s · ${SITE.nameKo}`,
  },
  applicationName: SITE.nameKo,
  description: SITE.description,
  alternates: { canonical: '/' },
  icons: {
    icon: {
      url: '/images/logo/kaleo-logo-after.svg',
      type: 'image/svg+xml',
    },
    shortcut: '/images/logo/kaleo-logo-after.svg',
  },
  openGraph: {
    title: SITE.nameKo,
    description: SITE.description,
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: SITE.nameKo,
    images: [
      {
        url: '/images/seo/home-share.png',
        width: 1200,
        height: 630,
        alt: '수도교회 청소년부 KALEO YOUTH',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.nameKo,
    description: SITE.description,
    images: ['/images/seo/home-share.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1B3670',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="/fonts/Paperlogy-4Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Paperlogy-7Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <StyledRegistry>
          <SiteGlobalStyle />
          {children}
        </StyledRegistry>
      </body>
    </html>
  );
}
