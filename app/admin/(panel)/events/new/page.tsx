import type { Metadata } from 'next';
import { EventForm } from '@/components/admin/EventForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';

export const metadata: Metadata = { title: '일정 등록' };

export default function NewEventPage() {
  return (
    <AdminPage>
      <PageTitle>
        <h1>일정 등록</h1>
      </PageTitle>
      <Panel>
        <EventForm />
      </Panel>
    </AdminPage>
  );
}
