'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/primitives';
import { clientDelete, errorMessage } from '@/lib/client-api';
import {
  uploadFiles,
  type UploadFileProgress,
  type UploadedFile,
} from '@/lib/client-upload';
import type { Attachment } from '@/lib/types';
import { ErrorText } from './parts';
import {
  BatchActions,
  BatchStatus,
  Manager,
  SelectAllLabel,
  StatusText,
  Toolbar,
} from './GalleryPhotoManager.styles';
import { GalleryPhotoList } from './GalleryPhotoList';
import type { GalleryPhotoItem } from './GalleryPhotoManager.types';
import { GalleryUploadProgress } from './GalleryUploadProgress';

export function GalleryPhotoManager({
  persisted,
  uploaded,
  thumbnailUrl,
  onUploadedChange,
  onThumbnailChange,
  onRemovePersisted,
}: {
  readonly persisted: readonly Attachment[];
  readonly uploaded: UploadedFile[];
  readonly thumbnailUrl: string | null;
  readonly onUploadedChange: (files: UploadedFile[]) => void;
  readonly onThumbnailChange: (fileUrl: string) => void;
  readonly onRemovePersisted: (id: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<
    readonly UploadFileProgress[]
  >([]);
  const [selectedFileUrls, setSelectedFileUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const items: readonly GalleryPhotoItem[] = [
    ...persisted.map((attachment, index) => ({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      name: attachment.originalName ?? `사진 ${index + 1}`,
      fileSize: attachment.fileSize,
      persisted: true,
    })),
    ...uploaded.map((file, index) => ({
      id: file.id,
      fileUrl: file.fileUrl,
      previewUrl: file.previewUrl,
      name: file.originalName ?? `새 사진 ${index + 1}`,
      fileSize: file.fileSize,
      persisted: false,
    })),
  ];

  const visibleUrls = new Set(items.map((item) => item.fileUrl));
  const activeSelectedUrls = new Set(
    [...selectedFileUrls].filter((fileUrl) => visibleUrls.has(fileUrl)),
  );
  const allSelected =
    items.length > 0 && activeSelectedUrls.size === items.length;

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    setPending(true);
    setError(null);
    setStatus(null);
    try {
      const uploadedNew = await uploadFiles(picked, 'post', setUploadProgress);
      onUploadedChange([...uploaded, ...uploadedNew]);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
      setUploadProgress([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function removeSingle(item: GalleryPhotoItem) {
    if (item.persisted) {
      await onRemovePersisted(item.id);
      return;
    }
    const remaining = uploaded.filter((file) => file.id !== item.id);
    onUploadedChange(remaining);
    try {
      await clientDelete(`/uploads/${item.id}`);
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    } catch (caught) {
      onUploadedChange(uploaded);
      throw caught;
    }
  }

  async function removeSelected() {
    if (activeSelectedUrls.size === 0 || pending) return;
    if (
      !window.confirm(
        `선택한 ${activeSelectedUrls.size}장의 사진을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?`,
      )
    ) {
      return;
    }

    setPending(true);
    setError(null);
    setStatus(null);

    let removed = 0;
    let failed = 0;
    let firstFailure: string | null = null;
    let workingUploaded = [...uploaded];

    for (const item of items) {
      if (!activeSelectedUrls.has(item.fileUrl)) continue;
      try {
        if (item.persisted) {
          await onRemovePersisted(item.id);
        } else {
          workingUploaded = workingUploaded.filter((file) => file.id !== item.id);
          await clientDelete(`/uploads/${item.id}`);
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          onUploadedChange(workingUploaded);
        }
        removed += 1;
      } catch (caught) {
        failed += 1;
        firstFailure ??= errorMessage(caught);
      }
    }

    if (failed > 0) {
      setError(
        `${removed}장 삭제, ${failed}장 삭제 실패.${firstFailure ? ` ${firstFailure}` : ''}`,
      );
    } else {
      setStatus(`${removed}장의 사진을 삭제했습니다.`);
    }
    setSelectedFileUrls(new Set());
    setPending(false);
  }

  function toggleAll(checked: boolean) {
    setSelectedFileUrls(checked ? new Set(visibleUrls) : new Set());
    setError(null);
    setStatus(null);
  }

  function toggleItem(fileUrl: string, checked: boolean) {
    setSelectedFileUrls((current) => {
      const next = new Set([...current].filter((url) => visibleUrls.has(url)));
      if (checked) next.add(fileUrl);
      else next.delete(fileUrl);
      return next;
    });
    setError(null);
    setStatus(null);
  }

  return (
    <Manager>
      <input
        ref={inputRef}
        type="file"
        accept={HEIF_ACCEPT}
        multiple
        aria-label="사진 추가"
        onChange={pick}
        hidden
      />
      <Toolbar>
        <Button
          type="button"
          $variant="outline"
          $small
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          {pending ? '올리는 중…' : '사진 추가'}
        </Button>
        {items.length > 0 ? (
          <SelectAllLabel>
            <input
              type="checkbox"
              aria-label="사진 전체 선택"
              checked={allSelected}
              disabled={pending}
              onChange={(event) => toggleAll(event.target.checked)}
            />
            전체 선택
          </SelectAllLabel>
        ) : null}
        {activeSelectedUrls.size > 0 ? (
          <BatchActions>
            <BatchStatus role="status">{activeSelectedUrls.size}장 선택</BatchStatus>
            <Button
              type="button"
              $variant="danger"
              $small
              disabled={pending}
              onClick={removeSelected}
            >
              {pending ? '삭제 중…' : '선택 삭제'}
            </Button>
          </BatchActions>
        ) : null}
      </Toolbar>
      {error ? <ErrorText>{error}</ErrorText> : null}
      {status ? <StatusText role="status">{status}</StatusText> : null}

      <GalleryUploadProgress files={uploadProgress} />
      <GalleryPhotoList
        items={items}
        thumbnailUrl={thumbnailUrl}
        selectedUrls={activeSelectedUrls}
        pending={pending}
        onThumbnailChange={(fileUrl) => {
          onThumbnailChange(fileUrl);
          setError(null);
          setStatus(null);
        }}
        onToggleItem={toggleItem}
        onRemove={(item) => {
          void removeSingle(item).catch((caught: unknown) => {
            setError(errorMessage(caught));
          });
        }}
      />
    </Manager>
  );
}

const HEIF_ACCEPT =
  '.heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence';
