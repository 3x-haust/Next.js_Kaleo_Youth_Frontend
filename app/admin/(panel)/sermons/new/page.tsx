import type { Metadata } from 'next';
import { SermonForm } from '@/components/admin/SermonForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';

export const metadata: Metadata = { title: '말씀 등록' };

export default function NewSermonPage() {
  return (
    <AdminPage>
      <PageTitle>
        <h1>말씀 등록</h1>
      </PageTitle>
      <Panel>
        <SermonForm />
      </Panel>
    </AdminPage>
  );
}
