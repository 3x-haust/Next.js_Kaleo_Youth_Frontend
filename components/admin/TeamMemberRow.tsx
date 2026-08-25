'use client';

import { useState } from 'react';
import styled from 'styled-components';
import type { UploadedFile } from '@/lib/client-upload';
import type { WorshipTeamMember } from '@/lib/types';
import { existingImage, uploadedIds } from './image-upload';
import { Input } from './parts';
import { FileUploader } from './widgets';

export interface MemberPatch {
  readonly name?: string;
  readonly part?: string;
  readonly bio?: string;
  readonly displayOrder?: number;
  readonly attachmentIds?: readonly string[];
}

interface Props {
  readonly member: WorshipTeamMember;
  readonly index: number;
  readonly count: number;
  readonly busy: boolean;
  readonly onSave: (member: WorshipTeamMember, patch: MemberPatch) => Promise<void>;
  readonly onRemove: (member: WorshipTeamMember) => Promise<void>;
  readonly onMove: (index: number, direction: -1 | 1) => Promise<void>;
  readonly onDragStart: (memberId: string, event: React.MouseEvent) => void;
}

function normalizedPart(part: string | null): string {
  const value = part?.trim() ?? '';
  return value.toLocaleUpperCase('en-US') === 'ELECTRIC GUITAR'
    ? 'ELECTRIC GUITAR'
    : value;
}

export function TeamMemberRow({
  member,
  index,
  count,
  busy,
  onSave,
  onRemove,
  onMove,
  onDragStart,
}: Props) {
  const [name, setName] = useState(member.name);
  const initialPart = normalizedPart(member.part);
  const [part, setPart] = useState(initialPart);
  const [bio, setBio] = useState(member.bio ?? '');
  const initialPhoto = member.photoUrl
    ? [existingImage(member.photoUrl, `member-${member.id}`, `${member.name} 현재 사진`)]
    : [];
  const [photo, setPhoto] = useState<UploadedFile[]>(initialPhoto);
  const photoChanged = photo.at(-1)?.fileUrl !== member.photoUrl;
  const dirty = name !== member.name || part !== initialPart || bio !== (member.bio ?? '') || photoChanged;

  return (
    <Row data-member-id={member.id}>
      <Fields>
        <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} aria-label={`${member.name} 이름`} />
        <Input value={part} onChange={(event) => setPart(event.target.value)} maxLength={50} placeholder="파트" aria-label={`${member.name} 파트`} />
        <Input value={bio} onChange={(event) => setBio(event.target.value)} maxLength={200} placeholder="소개" aria-label={`${member.name} 소개`} />
      </Fields>
      <FileUploader ownerType="worship_team_member" files={photo} onChange={setPhoto} accept="image/*" label="사진 선택" multiple={false} />
      <Tools>
        <DragHandle
          type="button"
          disabled={busy}
          aria-label={`${member.name} 순서 드래그`}
          title="드래그하여 순서 변경"
          onMouseDown={(event) => onDragStart(member.id, event)}
        >
          ≡
        </DragHandle>
        <button type="button" onClick={() => onMove(index, -1)} disabled={busy || index === 0} aria-label={`${member.name} 위로 이동`}>↑</button>
        <button type="button" onClick={() => onMove(index, 1)} disabled={busy || index === count - 1} aria-label={`${member.name} 아래로 이동`}>↓</button>
        <button
          type="button"
          onClick={() => onSave(member, {
            name,
            part,
            bio,
            ...(photoChanged ? { attachmentIds: uploadedIds(photo) } : {}),
          })}
          disabled={busy || !dirty}
        >
          저장
        </button>
        <button type="button" className="danger" onClick={() => onRemove(member)} disabled={busy}>삭제</button>
      </Tools>
    </Row>
  );
}

const Row = styled.li`
  display: grid;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineSoft};
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
  }
`;

const DragHandle = styled.button`
  cursor: grab;
  font-size: 20px !important;
  line-height: 1;
  touch-action: none;
  user-select: none;

  &:active { cursor: grabbing; }
`;

const Tools = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  button {
    min-width: 44px;
    min-height: 44px;
    padding: 0 10px;
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.bg};
    font-size: 13px;

    &.danger { color: ${({ theme }) => theme.colors.danger}; }
    &:disabled { opacity: 0.4; }
  }
`;
