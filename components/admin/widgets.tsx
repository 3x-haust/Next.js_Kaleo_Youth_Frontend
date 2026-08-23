'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Badge, Button, Notice } from '@/components/ui/primitives';
import { formatFileSize, toFileUrl } from '@/lib/format';
import { clientDelete, errorMessage, uploadFiles, type UploadOwnerType, type UploadedFile } from '@/lib/client-api';
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

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    setPending(true);
    setError(null);
    try {
      const uploaded = await uploadFiles(picked, ownerType);
      onChange(multiple ? [...files, ...uploaded] : uploaded);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
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

const Uploader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
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
