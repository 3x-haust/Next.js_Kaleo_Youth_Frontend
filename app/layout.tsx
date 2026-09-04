import type { Metadata, Viewport } from 'next';
import { StyledRegistry } from '@/lib/registry';
import { pageMetadata } from '@/lib/seo';
import { SITE, siteUrl } from '@/lib/site';
import { SiteGlobalStyle } from '@/lib/site-global-styles';

const homeMetadata = pageMetadata({
  title: SITE.nameKo,
  description: SITE.description,
  path: '/',
});

export const metadata: Metadata = {
  ...homeMetadata,
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.nameKo,
    template: `%s · ${SITE.nameKo}`,
  },
  applicationName: SITE.nameKo,
  keywords: [
    '수도교회',
    '수도교회 청소년부',
    'KALEO YOUTH',
    '양천구 교회',
    '신월동 교회',
    '청소년부',
    '중고등부',
  ],
  icons: {
    icon: {
      url: '/images/logo/kaleo-logo-after.svg',
      type: 'image/svg+xml',
    },
    shortcut: '/images/logo/kaleo-logo-after.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
