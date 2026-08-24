'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Badge, Button, Notice } from '@/components/ui/primitives';
import { clientDelete, errorMessage } from '@/lib/client-api';
import {
  uploadFiles,
  type UploadFileProgress,
  type UploadOwnerType,
  type UploadedFile,
} from '@/lib/client-upload';
import { formatFileSize, toFileUrl } from '@/lib/format';
import { ErrorText, Hint } from './parts';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Notice $tone="warn" role="alert">
      {message}
    </Notice>
  );
}

export function SavedNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return <Notice role="status">{message}</Notice>;
}

export function DeleteButton({
  path,
  label = '삭제',
  confirmMessage,
  redirectTo,
  onDeleted,
}: {
  path: string;
  label?: string;
  confirmMessage: string;
  redirectTo?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    setError(null);
    try {
      await clientDelete(path);
      onDeleted?.();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <DeleteWrap>
      <Button type="button" $variant="danger" $small onClick={remove} disabled={pending}>
        {pending ? '삭제 중…' : label}
      </Button>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </DeleteWrap>
  );
}

const DeleteWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export function FileUploader({
  ownerType,
  files,
  onChange,
  accept,
  label = '파일 추가',
  hint,
  multiple = true,
}: {
  ownerType: UploadOwnerType;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  label?: string;
  hint?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<
    readonly UploadFileProgress[]
  >([]);

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    setPending(true);
    setError(null);
    try {
      const uploaded = await uploadFiles(picked, ownerType, setUploadProgress);
      onChange(multiple ? [...files, ...uploaded] : uploaded);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
      setUploadProgress([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function drop(file: UploadedFile) {
    const remaining = files.filter((item) => item.id !== file.id);
    onChange(remaining);
    if (file.isPersisted) return;

    try {
      await clientDelete(`/uploads/${file.id}`);
    } catch (caught) {
      onChange(files);
      setError(errorMessage(caught));
    }
  }

  return (
    <Uploader>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={label}
        onChange={pick}
        hidden
      />
      <Button
        type="button"
        $variant="outline"
        $small
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        {pending ? '올리는 중…' : label}
      </Button>
      {hint ? <Hint>{hint}</Hint> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {uploadProgress.length > 0 ? (
        <UploadProgressPanel role="status" aria-label="사진 업로드 진행">
          <UploadProgressSummary>
            <strong>사진 업로드 진행</strong>
            <span>
              {uploadProgress.filter((file) => file.state === 'complete').length}
              {' / '}
              {uploadProgress.length}
            </span>
          </UploadProgressSummary>
          <progress
            max={100}
            value={uploadPercent(uploadProgress)}
            aria-label="전체 업로드 진행률"
          />
          <UploadProgressFiles>
            {uploadProgress.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <span title={file.name}>{file.name}</span>
                <progress
                  max={100}
                  value={file.total > 0 ? Math.round((file.loaded / file.total) * 100) : 0}
                  aria-label={`${file.name} 업로드 진행률`}
                />
              </li>
            ))}
          </UploadProgressFiles>
        </UploadProgressPanel>
      ) : null}

      {files.length > 0 ? (
        <FileList>
          {files.map((file) => (
            <li key={file.id}>
              {(file.fileType?.startsWith('image/') ?? /\.(avif|gif|jpe?g|png|webp)$/i.test(file.fileUrl)) ? (
                <Image
                  src={toFileUrl(file.fileUrl)}
                  alt={file.originalName ?? '업로드 이미지 미리보기'}
                  width={72}
                  height={56}
                  sizes="72px"
                />
              ) : null}
              <a href={toFileUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                {file.originalName ?? file.fileUrl}
              </a>
              {file.fileSize ? <Badge>{formatFileSize(file.fileSize)}</Badge> : null}
              <button type="button" onClick={() => drop(file)}>
                제거
              </button>
            </li>
          ))}
        </FileList>
      ) : null}
    </Uploader>
  );
}

function uploadPercent(files: readonly UploadFileProgress[]): number {
  const total = files.reduce((sum, file) => sum + file.total, 0);
  if (total === 0) return 0;
  const loaded = files.reduce((sum, file) => sum + file.loaded, 0);
  return Math.round((loaded / total) * 100);
}

const Uploader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const UploadProgressPanel = styled.div`
  width: 100%;
  display: grid;
  gap: 9px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgSoft};

  progress {
    width: 100%;
    height: 7px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UploadProgressSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-variant-numeric: tabular-nums;
  }
`;

const UploadProgressFiles = styled.ul`
  display: grid;
  gap: 6px;

  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(90px, 28%);
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.muted};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const FileList = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: ${({ theme }) => theme.colors.bgSoft};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
  }

  img {
    width: 72px;
    height: 56px;
    flex: none;
    border-radius: ${({ theme }) => theme.radius.sm};
    object-fit: cover;
  }

  a {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.primarySoft};
  }

  button {
    background: none;
    border: 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.danger};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const AdminEmpty = styled.div`
  padding: 44px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.faint};
  font-size: 14.5px;
`;
