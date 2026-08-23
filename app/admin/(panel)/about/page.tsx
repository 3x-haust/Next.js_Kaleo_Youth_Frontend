import type { Metadata } from 'next';
import { AboutEditor } from '@/components/admin/AboutEditor';
import { AdminPage, PageTitle } from '@/components/admin/parts';
import { ButtonLink } from '@/components/ui/primitives';
import { apiGet } from '@/lib/api';
import type { AboutPage } from '@/lib/types';

export const metadata: Metadata = { title: '소개 관리' };

export default async function AdminAboutPage() {
  const about = await apiGet<AboutPage>('/about', { authed: true });

  return (
    <AdminPage>
      <PageTitle>
        <h1>소개 관리</h1>
        <ButtonLink href="/about" $variant="outline" $small>사이트에서 보기</ButtonLink>
      </PageTitle>
      <AboutEditor about={about} />
    </AdminPage>
  );
}
