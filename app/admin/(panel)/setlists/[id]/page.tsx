import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SetlistForm } from '@/components/admin/SetlistForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { ButtonLink } from '@/components/ui/primitives';
import { apiGet, apiGetSafe } from '@/lib/api';
import type { Setlist } from '@/lib/types';

export const metadata: Metadata = { title: '콘티 수정' };

async function loadSetlist(id: string): Promise<Setlist | null> {
  try {
    return await apiGet<Setlist>(`/setlists/${id}`, { authed: true });
  } catch {
    return null;
  }
}

export default async function EditSetlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [setlist, capabilities] = await Promise.all([
    loadSetlist(id),
    apiGetSafe<{ playlistImportEnabled: boolean }>(
      '/setlists/capabilities',
      { playlistImportEnabled: false },
      { authed: true },
    ),
  ]);
  if (!setlist) notFound();

  return (
    <AdminPage>
      <PageTitle>
        <h1>콘티 수정</h1>
        <ButtonLink href={`/jteen/setlists/${setlist.id}`} $variant="outline" $small>
          사이트에서 보기
        </ButtonLink>
      </PageTitle>
      <Panel>
        <SetlistForm
          setlist={setlist}
          teamId={setlist.teamId}
          playlistImportEnabled={capabilities.playlistImportEnabled}
        />
      </Panel>
    </AdminPage>
  );
}
