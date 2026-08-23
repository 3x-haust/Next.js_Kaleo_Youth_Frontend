import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { ButtonLink } from '@/components/ui/primitives';
import { apiGet } from '@/lib/api';
import type { ChurchEvent } from '@/lib/types';

export const metadata: Metadata = { title: '일정 수정' };

async function loadEvent(id: string): Promise<ChurchEvent | null> {
  try {
    return await apiGet<ChurchEvent>(`/events/${id}`, { authed: true });
  } catch {
    return null;
  }
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) notFound();

  return (
    <AdminPage>
      <PageTitle>
        <h1>일정 수정</h1>
        <ButtonLink href="/events" $variant="outline" $small>
          일정 페이지 보기
        </ButtonLink>
      </PageTitle>
      <Panel>
        <EventForm event={event} />
      </Panel>
    </AdminPage>
  );
}
