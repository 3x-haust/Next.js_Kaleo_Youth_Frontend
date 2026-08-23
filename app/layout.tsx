import type { Metadata, Viewport } from 'next';
import { StyledRegistry } from '@/lib/registry';
import { SITE } from '@/lib/site';
import { SiteGlobalStyle } from '@/lib/site-global-styles';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.nameKo}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} · ${SITE.nameKo}`,
    description: SITE.description,
    type: 'website',
    locale: 'ko_KR',
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
