import type { Metadata } from 'next';
import { GlobalStyle } from '@/lib/global-styles';

export const metadata: Metadata = {
  title: { default: '관리자', template: '%s · KALEO YOUTH 관리자' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <><GlobalStyle />{children}</>;
}
