'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { toFileUrl } from '@/lib/format';

export type GalleryThumbnailCandidate = {
  readonly id: string;
  readonly fileUrl: string;
  readonly previewUrl?: string;
  readonly name: string;
};

export function GalleryThumbnailSelector({
  candidates,
  value,
  onChange,
}: {
  readonly candidates: readonly GalleryThumbnailCandidate[];
  readonly value: string | null;
  readonly onChange: (fileUrl: string) => void;
}) {
  if (candidates.length === 0) return null;

  return (
    <Selector role="radiogroup" aria-label="갤러리 대표 이미지">
      {candidates.map((candidate) => (
        <Choice key={candidate.id}>
          <input
            type="radio"
            name="gallery-thumbnail"
            value={candidate.fileUrl}
            checked={value === candidate.fileUrl}
            onChange={() => onChange(candidate.fileUrl)}
          />
          <Image
            src={candidate.previewUrl ?? toFileUrl(candidate.fileUrl)}
            alt={candidate.name}
            width={72}
            height={56}
            sizes="72px"
            unoptimized
          />
          <span>{candidate.name}</span>
        </Choice>
      ))}
    </Selector>
  );
}

const Selector = styled.div`
  display: grid;
  gap: 8px;
`;

const Choice = styled.label`
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgSoft};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 14px;
  cursor: pointer;

  &:has(input:checked) {
    border-color: ${({ theme }) => theme.colors.primarySoft};
    background: ${({ theme }) => theme.colors.primaryTint};
  }

  &:focus-within {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTint};
  }

  input {
    width: 16px;
    height: 16px;
    flex: none;
    accent-color: ${({ theme }) => theme.colors.primary};
  }

  img {
    width: 72px;
    height: 56px;
    flex: none;
    border-radius: ${({ theme }) => theme.radius.sm};
    object-fit: cover;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
