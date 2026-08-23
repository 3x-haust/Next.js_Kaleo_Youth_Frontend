import type { WorshipTeam } from '@/lib/types';
import { Panel, PanelTitle } from './parts';
import { TeamInfoForm } from './TeamInfoForm';
import { TeamMemberEditor } from './TeamMemberEditor';

export function TeamManager({ team }: { readonly team: WorshipTeam }) {
  return (
    <>
      <Panel>
        <PanelTitle>팀 소개</PanelTitle>
        <TeamInfoForm team={team} />
      </Panel>
      <Panel>
        <PanelTitle>팀원</PanelTitle>
        <TeamMemberEditor team={team} />
      </Panel>
    </>
  );
}
