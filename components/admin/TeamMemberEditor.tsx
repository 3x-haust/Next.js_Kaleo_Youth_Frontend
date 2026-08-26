'use client';

import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/primitives';
import { clientDelete, clientPatch, clientPost, errorMessage } from '@/lib/client-api';
import type { UploadedFile } from '@/lib/client-upload';
import { fieldErrors, memberSchema } from '@/lib/schemas';
import type { WorshipTeam, WorshipTeamMember } from '@/lib/types';
import { clearAdminFlash, showAdminFlash } from '@/store/admin-flash';
import { Actions, ErrorText, Field, FieldRow, Form, Hint, Input, Label } from './parts';
import { TeamMemberRow, type MemberPatch } from './TeamMemberRow';
import { FileUploader, FormError } from './widgets';

export function TeamMemberEditor({ team }: { readonly team: WorshipTeam }) {
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPart, setNewPart] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [members, setMembers] = useState(() =>
    [...team.members].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const dragMemberId = useRef<string | null>(null);
  const dragTargetId = useRef<string | null>(null);
  const currentMembers = useRef(members);

  function updateMembers(next: WorshipTeamMember[]) {
    currentMembers.current = next;
    setMembers(next);
  }

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    clearAdminFlash();
    const parsed = memberSchema.safeParse({
      name: newName,
      part: newPart,
      bio: newBio,
      displayOrder: members.length,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      const created = await clientPost<WorshipTeamMember>(
        `/worship-teams/${team.id}/members`,
        {
          ...parsed.data,
          attachmentIds: newPhoto.map((file) => file.id),
        },
      );
      updateMembers([...currentMembers.current, created]);
      setNewName('');
      setNewPart('');
      setNewBio('');
      setNewPhoto([]);
      showAdminFlash('팀원을 추가했습니다.');
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function saveMember(member: WorshipTeamMember, patch: MemberPatch) {
    setFailure(null);
    clearAdminFlash();
    setBusy(true);
    try {
      const saved = await clientPatch<WorshipTeamMember>(
        `/worship-teams/members/${member.id}`,
        patch,
      );
      updateMembers(
        currentMembers.current.map((current) =>
          current.id === member.id ? { ...current, ...saved } : current,
        ),
      );
      showAdminFlash(`${saved.name} 팀원 정보를 저장했습니다.`);
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(member: WorshipTeamMember) {
    if (!window.confirm(`${member.name} 팀원을 삭제합니다. 계속할까요?`)) return;
    setFailure(null);
    clearAdminFlash();
    setBusy(true);
    try {
      await clientDelete(`/worship-teams/members/${member.id}`);
      updateMembers(
        currentMembers.current.filter((current) => current.id !== member.id),
      );
      showAdminFlash(`${member.name} 팀원을 삭제했습니다.`);
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function persistOrder(next: WorshipTeamMember[], previous: WorshipTeamMember[]) {
    if (next.every((member, index) => member.id === previous[index]?.id)) return;
    setBusy(true);
    setFailure(null);
    clearAdminFlash();
    try {
      await clientPatch(`/worship-teams/${team.id}/members/order`, {
        memberIds: next.map((member) => member.id),
      });
      showAdminFlash('팀원 순서를 저장했습니다.');
    } catch (caught) {
      updateMembers(previous);
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function swapOrder(index: number, direction: -1 | 1) {
    const previous = currentMembers.current;
    const destination = index + direction;
    if (!previous[index] || !previous[destination]) return;
    const next = [...previous];
    [next[index], next[destination]] = [next[destination], next[index]];
    updateMembers(next);
    await persistOrder(next, previous);
  }

  function startDrag(memberId: string, event: React.MouseEvent) {
    if (busy || event.button !== 0) return;
    event.preventDefault();
    dragMemberId.current = memberId;
    dragTargetId.current = memberId;
    const track = (mouseEvent: MouseEvent) => {
      const target = document
        .elementFromPoint(mouseEvent.clientX, mouseEvent.clientY)
        ?.closest<HTMLElement>('[data-member-id]');
      if (target?.dataset.memberId) {
        dragTargetId.current = target.dataset.memberId;
      }
    };
    const finish = () => {
      window.removeEventListener('mousemove', track);
      window.removeEventListener('mouseup', finish);
      void dropOrder();
    };
    window.addEventListener('mousemove', track);
    window.addEventListener('mouseup', finish);
  }

  async function dropOrder() {
    const draggedId = dragMemberId.current;
    const targetId = dragTargetId.current;
    const previous = currentMembers.current;
    const from = previous.findIndex((member) => member.id === draggedId);
    const to = previous.findIndex((member) => member.id === targetId);
    dragMemberId.current = null;
    dragTargetId.current = null;
    if (from < 0 || to < 0 || from === to) return;
    const next = [...previous];
    const [dragged] = next.splice(from, 1);
    next.splice(to, 0, dragged);
    updateMembers(next);
    await persistOrder(next, previous);
  }

  return (
    <div>
      <FormError message={failure} />
      {members.length === 0 ? <Hint>아직 등록된 팀원이 없습니다.</Hint> : (
        <MemberList>
          {members.map((member, index) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              index={index}
              count={members.length}
              busy={busy}
              onSave={saveMember}
              onRemove={removeMember}
              onMove={swapOrder}
              onDragStart={startDrag}
            />
          ))}
        </MemberList>
      )}
      <AddForm onSubmit={addMember} noValidate>
        <FieldRow $cols={2}>
          <Field>
            <Label htmlFor="new-member-name">이름<em>*</em></Label>
            <Input id="new-member-name" value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={50} />
            {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
          </Field>
          <Field>
            <Label htmlFor="new-member-part">파트</Label>
            <Input id="new-member-part" value={newPart} onChange={(event) => setNewPart(event.target.value)} maxLength={50} />
          </Field>
        </FieldRow>
        <Field>
          <Label htmlFor="new-member-bio">소개</Label>
          <Input id="new-member-bio" value={newBio} onChange={(event) => setNewBio(event.target.value)} maxLength={200} />
        </Field>
        <Field>
          <Label>사진</Label>
          <FileUploader ownerType="worship_team_member" files={newPhoto} onChange={setNewPhoto} accept="image/*" label="사진 선택" multiple={false} />
        </Field>
        <Actions><Button type="submit" $variant="outline" $small disabled={busy}>팀원 추가</Button></Actions>
      </AddForm>
    </div>
  );
}

const MemberList = styled.ul`
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
`;

const AddForm = styled(Form)`
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;
