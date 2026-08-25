'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/primitives';
import { errorMessage } from '@/lib/client-api';
import { uploadFiles, type UploadedFile } from '@/lib/client-upload';
import { formatFileSize, toFileUrl } from '@/lib/format';
import type { SetlistAttachment } from '@/lib/types';
import { ErrorText, Field, Hint } from './parts';

interface Props {
  readonly attachments: readonly SetlistAttachment[];
  readonly onChange: (attachments: SetlistAttachment[]) => void;
  readonly onDocumentUploaded: (fileUrl: string) => void;
}

type UploadKind = 'image' | 'document';

const PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
] as const;
const PHOTO_ACCEPT = `.heic,.heif,${PHOTO_MIME_TYPES.join(',')}`;

function isSupportedPhotoType(fileType: string | null): boolean {
  return fileType !== null && PHOTO_MIME_TYPES.some((supported) => supported === fileType);
}

function isImage(attachment: SetlistAttachment): boolean {
  return isSupportedPhotoType(attachment.fileType);
}

function toAttachment(file: UploadedFile, displayOrder: number): SetlistAttachment {
  return {
    id: file.id,
    fileUrl: file.fileUrl,
    originalName: file.originalName,
    fileType: file.fileType,
    fileSize: file.fileSize,
    displayOrder,
  };
}

export function SetlistAttachmentsField({
  attachments,
  onChange,
  onDocumentUploaded,
}: Props) {
  const imageInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<UploadKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const images = attachments.filter(isImage);
  const documents = attachments.filter((attachment) => !isImage(attachment));

  async function upload(kind: UploadKind, event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length === 0) return;
    if (kind === 'image' && picked.some((file) => !isSupportedPhotoType(file.type))) {
      setError('이미지 파일만 올릴 수 있습니다.');
      return;
    }

    setPending(kind);
    setError(null);
    try {
      const uploaded = await uploadFiles(picked, 'setlist');
      const added = uploaded.map((file, index) => toAttachment(file, attachments.length + index));
      onChange([...attachments, ...added]);
      if (kind === 'document') {
        const last = added.at(-1);
        if (last) onDocumentUploaded(last.fileUrl);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(null);
    }
  }

  function remove(id: string) {
    onChange(
      attachments
        .filter((attachment) => attachment.id !== id)
        .map((attachment, displayOrder) => ({ ...attachment, displayOrder })),
    );
  }

  return (
    <AttachmentFields>
      <Field>
        <SectionTitle>콘티 사진</SectionTitle>
        <Hint>PNG, JPG, WEBP, HEIC 이미지를 순서대로 올리면 사이트 콘티 상세에 모두 표시됩니다.</Hint>
        <input
          ref={imageInput}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          aria-label="콘티 사진 파일"
          onChange={(event) => void upload('image', event)}
          hidden
        />
        <Button
          type="button"
          $variant="outline"
          $small
          onClick={() => imageInput.current?.click()}
          disabled={pending !== null}
        >
          {pending === 'image' ? '사진 올리는 중…' : '사진 추가'}
        </Button>
        {images.length > 0 ? (
          <ImageGrid aria-label="등록된 콘티 사진">
            {images.map((attachment) => (
              <ImageCard key={attachment.id}>
                <Image
                  src={toFileUrl(attachment.fileUrl)}
                  alt={attachment.originalName ?? '콘티 이미지'}
                  width={320}
                  height={220}
                  sizes="320px"
                  data-zone="setlist-admin-image"
                />
                <ImageMeta>
                  <span>{attachment.originalName ?? attachment.fileUrl}</span>
                  <small>{formatFileSize(attachment.fileSize)}</small>
                </ImageMeta>
                <RemoveButton
                  type="button"
                  aria-label={`${attachment.originalName ?? '콘티 이미지'} 제거`}
                  onClick={() => remove(attachment.id)}
                >
                  제거
                </RemoveButton>
              </ImageCard>
            ))}
          </ImageGrid>
        ) : (
          <EmptyText>등록된 콘티 사진이 없습니다.</EmptyText>
        )}
      </Field>

      <Field>
        <SectionTitle>콘티 전체 악보 (PDF 등)</SectionTitle>
        <Hint>곡별 악보는 아래 각 줄에서 따로 올릴 수 있습니다.</Hint>
        <input
          ref={documentInput}
          type="file"
          accept=".pdf,.doc,.docx,.hwp,.hwpx,application/pdf"
          multiple
          aria-label="콘티 첨부 파일"
          onChange={(event) => void upload('document', event)}
          hidden
        />
        <Button
          type="button"
          $variant="outline"
          $small
          onClick={() => documentInput.current?.click()}
          disabled={pending !== null}
        >
          {pending === 'document' ? '파일 올리는 중…' : '파일 추가'}
        </Button>
        {documents.length > 0 ? (
          <DocumentList aria-label="등록된 콘티 첨부 파일">
            {documents.map((attachment) => (
              <li key={attachment.id}>
                <a href={toFileUrl(attachment.fileUrl)} target="_blank" rel="noopener noreferrer">
                  {attachment.originalName ?? attachment.fileUrl}
                </a>
                <small>{formatFileSize(attachment.fileSize)}</small>
                <RemoveButton
                  type="button"
                  aria-label={`${attachment.originalName ?? '첨부 파일'} 제거`}
                  onClick={() => remove(attachment.id)}
                >
                  제거
                </RemoveButton>
              </li>
            ))}
          </DocumentList>
        ) : null}
      </Field>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </AttachmentFields>
  );
}

const AttachmentFields = styled.div`
  display: contents;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

const ImageCard = styled.figure`
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.bgSoft};

  img {
    width: 100%;
    height: 140px;
    object-fit: cover;
  }
`;

const ImageMeta = styled.figcaption`
  display: grid;
  gap: 3px;
  padding: 10px 12px 36px;

  span {
    overflow: hidden;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: ${({ theme }) => theme.colors.faint};
    font-size: 12px;
  }
`;

const RemoveButton = styled.button`
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;

  ${ImageCard} & {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.faint};
  font-size: 13px;
`;

const DocumentList = styled.ul`
  display: grid;
  gap: 6px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.bgSoft};
    font-size: 14px;
  }

  a {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.primarySoft};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: ${({ theme }) => theme.colors.faint};
  }
`;
