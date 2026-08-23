import type { Metadata } from 'next';
import { SetlistForm } from '@/components/admin/SetlistForm';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { apiGetSafe } from '@/lib/api';
import type { WorshipTeam } from '@/lib/types';

export const metadata: Metadata = { title: '콘티 등록' };

export default async function NewSetlistPage() {
  const [capabilities, team] = await Promise.all([
    apiGetSafe<{ playlistImportEnabled: boolean }>(
      '/setlists/capabilities',
      { playlistImportEnabled: false },
      { authed: true },
    ),
    apiGetSafe<WorshipTeam | null>('/worship-teams/primary', null),
  ]);

  return (
    <AdminPage>
      <PageTitle>
        <h1>콘티 등록</h1>
      </PageTitle>
      <Panel>
        <SetlistForm
          teamId={team?.id ?? null}
          playlistImportEnabled={capabilities.playlistImportEnabled}
        />
      </Panel>
    </AdminPage>
  );
}
