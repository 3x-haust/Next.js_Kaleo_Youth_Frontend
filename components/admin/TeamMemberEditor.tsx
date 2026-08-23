'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/primitives';
import { clientDelete, clientPatch, clientPost, errorMessage, type UploadedFile } from '@/lib/client-api';
import { fieldErrors, memberSchema } from '@/lib/schemas';
import type { WorshipTeam, WorshipTeamMember } from '@/lib/types';
import { Actions, ErrorText, Field, FieldRow, Form, Hint, Input, Label } from './parts';
import { TeamMemberRow, type MemberPatch } from './TeamMemberRow';
import { FileUploader, FormError } from './widgets';

export function TeamMemberEditor({ team }: { readonly team: WorshipTeam }) {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPart, setNewPart] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const members = [...team.members].sort((a, b) => a.displayOrder - b.displayOrder);

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
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
      await clientPost(`/worship-teams/${team.id}/members`, {
        ...parsed.data,
        attachmentIds: newPhoto.map((file) => file.id),
      });
      setNewName('');
      setNewPart('');
      setNewBio('');
      setNewPhoto([]);
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function saveMember(member: WorshipTeamMember, patch: MemberPatch) {
    setFailure(null);
    setBusy(true);
    try {
      await clientPatch(`/worship-teams/members/${member.id}`, patch);
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(member: WorshipTeamMember) {
    if (!window.confirm(`${member.name} 팀원을 삭제합니다. 계속할까요?`)) return;
    setFailure(null);
    setBusy(true);
    try {
      await clientDelete(`/worship-teams/members/${member.id}`);
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function swapOrder(index: number, direction: -1 | 1) {
    const first = members[index];
    const second = members[index + direction];
    if (!first || !second) return;
    setBusy(true);
    setFailure(null);
    try {
      await clientPatch(`/worship-teams/members/${first.id}`, { displayOrder: second.displayOrder });
      await clientPatch(`/worship-teams/members/${second.id}`, { displayOrder: first.displayOrder });
      router.refresh();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <FormError message={failure} />
      {members.length === 0 ? <Hint>아직 등록된 팀원이 없습니다.</Hint> : (
        <MemberList>
          {members.map((member, index) => (
            <TeamMemberRow key={member.id} member={member} index={index} count={members.length} busy={busy} onSave={saveMember} onRemove={removeMember} onMove={swapOrder} />
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
