'use client';

import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';
import { errorMessage } from '@/lib/client-api';
import { formatFileSize, toFileUrl } from '@/lib/format';
import type { Attachment } from '@/lib/types';
import { ErrorText } from './parts';

export function ExistingAttachments({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(attachment: Attachment) {
    if (!window.confirm('이 파일을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
    setBusy(attachment.id);
    setError(null);
    try {
      await onRemove(attachment.id);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <List>
        {attachments.map((attachment) => {
          const isImage = attachment.fileType?.startsWith('image/');
          return (
            <li key={attachment.id}>
              {isImage ? (
                <Image
                  src={toFileUrl(attachment.fileUrl)}
                  alt=""
                  width={52}
                  height={40}
                  sizes="52px"
                />
              ) : (
                <FileMark aria-hidden>FILE</FileMark>
              )}
              <a href={toFileUrl(attachment.fileUrl)} target="_blank" rel="noopener noreferrer">
                {attachment.originalName ?? attachment.fileUrl}
              </a>
              <small>{formatFileSize(attachment.fileSize)}</small>
              <button type="button" onClick={() => remove(attachment)} disabled={busy === attachment.id}>
                {busy === attachment.id ? '삭제 중…' : '삭제'}
              </button>
            </li>
          );
        })}
      </List>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: ${({ theme }) => theme.colors.bgSoft};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
  }

  img {
    width: 52px;
    height: 40px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.sm};
    flex-shrink: 0;
  }

  a {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.primarySoft};
  }

  small {
    color: ${({ theme }) => theme.colors.faint};
    white-space: nowrap;
  }

  button {
    background: none;
    border: 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.danger};

    &:hover:not(:disabled) {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.5;
    }
  }
`;

const FileMark = styled.span`
  width: 52px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;
