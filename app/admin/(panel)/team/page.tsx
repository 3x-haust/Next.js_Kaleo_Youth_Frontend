import type { Metadata } from 'next';
import { TeamManager } from '@/components/admin/TeamManager';
import { AdminPage, PageTitle, Panel } from '@/components/admin/parts';
import { ButtonLink, Notice } from '@/components/ui/primitives';
import { apiGetSafe } from '@/lib/api';
import type { WorshipTeam } from '@/lib/types';

export const metadata: Metadata = { title: '찬양팀 관리' };

export default async function AdminTeamPage() {
  const team = await apiGetSafe<WorshipTeam | null>('/worship-teams/primary', null, {
    authed: true,
  });

  return (
    <AdminPage>
      <PageTitle>
        <h1>찬양팀 관리</h1>
        {team ? (
          <ButtonLink href="/jteen" $variant="outline" $small>
            사이트에서 보기
          </ButtonLink>
        ) : null}
      </PageTitle>

      {team ? (
        <TeamManager team={team} />
      ) : (
        <Panel>
          <Notice $tone="warn">
            등록된 찬양팀이 없습니다. 초기 데이터가 들어가 있어야 하는 화면이니, 서버 시드가
            실행되었는지 확인해 주세요.
          </Notice>
        </Panel>
      )}
    </AdminPage>
  );
}
