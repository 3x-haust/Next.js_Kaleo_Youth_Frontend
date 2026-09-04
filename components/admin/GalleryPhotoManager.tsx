'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import {
  ClientApiError,
  clientDelete,
  errorMessage,
} from '@/lib/client-api';
import {
  uploadFiles,
  type UploadFileProgress,
  type UploadedFile,
} from '@/lib/client-upload';
import type { Attachment } from '@/lib/types';
import { ErrorText } from './parts';
import { Manager, StatusText } from './GalleryPhotoManager.styles';
import { GalleryPhotoList } from './GalleryPhotoList';
import { GalleryPhotoToolbar } from './GalleryPhotoToolbar';
import type {
  GalleryPhotoItem,
  GalleryRemovalResult,
} from './GalleryPhotoManager.types';
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
  readonly onRemovePersisted: (
    ids: readonly string[],
  ) => Promise<GalleryRemovalResult>;
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
      const result = await onRemovePersisted([item.id]);
      if (result.firstFailure) {
        throw new ClientApiError(0, result.firstFailure);
      }
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
    const failedUrls = new Set<string>();
    const persistedItems = items.filter(
      (item) => item.persisted && activeSelectedUrls.has(item.fileUrl),
    );

    try {
      if (persistedItems.length > 0) {
        const result = await onRemovePersisted(
          persistedItems.map((item) => item.id),
        );
        removed += result.removedIds.length;
        failed += result.failedIds.length;
        firstFailure ??= result.firstFailure;
        const failedPersistedIds = new Set(result.failedIds);
        for (const item of persistedItems) {
          if (failedPersistedIds.has(item.id)) failedUrls.add(item.fileUrl);
        }
      }

      for (const item of items) {
        if (item.persisted || !activeSelectedUrls.has(item.fileUrl)) continue;
        try {
          await clientDelete(`/uploads/${item.id}`);
          workingUploaded = workingUploaded.filter(
            (file) => file.id !== item.id,
          );
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          onUploadedChange(workingUploaded);
          removed += 1;
        } catch (caught) {
          failed += 1;
          failedUrls.add(item.fileUrl);
          firstFailure ??= errorMessage(caught);
        }
      }

      if (failed > 0 || firstFailure) {
        setError(
          failed > 0
            ? `${removed}장 삭제, ${failed}장 삭제 실패.${firstFailure ? ` ${firstFailure}` : ''}`
            : `${removed}장 삭제. ${firstFailure}`,
        );
      } else {
        setStatus(`${removed}장의 사진을 삭제했습니다.`);
      }
      setSelectedFileUrls(failedUrls);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
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
      <GalleryPhotoToolbar
        inputRef={inputRef}
        pending={pending}
        itemCount={items.length}
        selectedCount={activeSelectedUrls.size}
        allSelected={allSelected}
        onPick={pick}
        onToggleAll={toggleAll}
        onRemoveSelected={() => void removeSelected()}
      />
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
