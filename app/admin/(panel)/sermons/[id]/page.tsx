import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SermonForm } from '@/components/admin/SermonForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { ButtonLink } from '@/components/ui/primitives';
import { apiGet } from '@/lib/api';
import type { Sermon } from '@/lib/types';

export const metadata: Metadata = { title: '말씀 수정' };

async function loadSermon(id: string): Promise<Sermon | null> {
  try {
    return await apiGet<Sermon>(`/sermons/${id}`, { authed: true });
  } catch {
    return null;
  }
}

export default async function EditSermonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sermon = await loadSermon(id);
  if (!sermon) notFound();

  return (
    <AdminPage>
      <PageTitle>
        <h1>말씀 수정</h1>
        <ButtonLink href={`/sermons/${sermon.id}`} $variant="outline" $small>
          사이트에서 보기
        </ButtonLink>
      </PageTitle>
      <Panel>
        <SermonForm sermon={sermon} />
      </Panel>
    </AdminPage>
  );
}
