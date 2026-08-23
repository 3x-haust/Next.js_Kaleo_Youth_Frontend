import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { apiGetSafe } from '@/lib/api';
import type { Setlist } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'J-TEEN WORSHIP',
  description: '수도교회 청소년부 J-TEEN의 이번 주 찬양 콘티입니다.',
};

export default async function JteenPage() {
  const setlists = await apiGetSafe<Setlist[]>('/setlists/latest', [], {
    revalidate: 60,
  });
  const [latest] = setlists.toSorted((left, right) =>
    right.serviceDate.localeCompare(left.serviceDate) || left.id.localeCompare(right.id),
  );

  if (!latest) notFound();
  redirect(`/jteen/setlists/${latest.id}`);
}
