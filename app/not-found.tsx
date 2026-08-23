import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/layout/SiteShell';
import { DetailBody, PageHeader, PageTitle } from '@/styles/editorial.styled';

export const metadata: Metadata = { title: '페이지를 찾을 수 없습니다' };

export default function NotFound() {
  return (
    <SiteShell>
      <PageHeader>
        <PageTitle>페이지를 찾을 수 없습니다</PageTitle>
      </PageHeader>
      <DetailBody>
        <p>주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <p style={{ marginTop: 'var(--ky-sp-2)' }}>
          <Link href="/" style={{ color: 'var(--ky-ink)' }}>
            첫 화면으로 돌아가기
          </Link>
        </p>
      </DetailBody>
    </SiteShell>
  );
}
