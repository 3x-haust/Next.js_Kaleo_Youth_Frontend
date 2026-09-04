import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { apiGetSafe } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import type { Setlist } from '@/lib/types';
import {
  EmptyEyebrow,
  EmptyPage,
  EmptyState,
  EmptyTitle,
} from './jteen.styled';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'J-TEEN WORSHIP',
  description: '수도교회 청소년부 J-TEEN의 이번 주 찬양 콘티입니다.',
  path: '/jteen',
});

export default async function JteenPage() {
  const setlists = await apiGetSafe<Setlist[]>('/setlists/latest', [], {
    revalidate: 60,
  });
  const [latest] = setlists.toSorted((left, right) =>
    right.serviceDate.localeCompare(left.serviceDate) || left.id.localeCompare(right.id),
  );

  if (!latest) {
    return (
      <EmptyPage>
        <header>
          <EmptyEyebrow>J-TEEN WORSHIP</EmptyEyebrow>
          <EmptyTitle>함께 찬양합니다</EmptyTitle>
        </header>
        <EmptyState>
          <span aria-hidden="true" />
          <strong>올라온 콘티가 없습니다.</strong>
        </EmptyState>
      </EmptyPage>
    );
  }

  redirect(`/jteen/setlists/${latest.id}`);
}
