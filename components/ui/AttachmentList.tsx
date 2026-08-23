'use client';

import styled from 'styled-components';
import { formatFileSize, toFileUrl } from '@/lib/format';
import type { Attachment } from '@/lib/types';

const Wrap = styled.section`
  margin-top: 36px;
  padding: 20px 22px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.bgSoft};

  h2 {
    font-size: 15px;
    margin-bottom: 14px;
    color: ${({ theme }) => theme.colors.ink};
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  a {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14.5px;
    color: ${({ theme }) => theme.colors.primarySoft};
    word-break: break-all;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  em {
    font-style: normal;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.faint};
    flex-shrink: 0;
  }
`;

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <Wrap>
      <h2>첨부파일 {attachments.length}개</h2>
      <ul>
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={toFileUrl(attachment.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <span>{attachment.originalName ?? '첨부파일'}</span>
              {attachment.fileSize ? <em>{formatFileSize(attachment.fileSize)}</em> : null}
            </a>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}
