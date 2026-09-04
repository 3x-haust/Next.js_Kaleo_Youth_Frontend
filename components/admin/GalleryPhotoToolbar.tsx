'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Button } from '@/components/ui/primitives';
import {
  BatchActions,
  BatchStatus,
  SelectAllLabel,
  Toolbar,
} from './GalleryPhotoManager.styles';

const HEIF_ACCEPT =
  '.heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence';

export function GalleryPhotoToolbar({
  inputRef,
  pending,
  itemCount,
  selectedCount,
  allSelected,
  onPick,
  onToggleAll,
  onRemoveSelected,
}: {
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly pending: boolean;
  readonly itemCount: number;
  readonly selectedCount: number;
  readonly allSelected: boolean;
  readonly onPick: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onToggleAll: (checked: boolean) => void;
  readonly onRemoveSelected: () => void;
}) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={HEIF_ACCEPT}
        multiple
        aria-label="사진 추가"
        onChange={onPick}
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
        {itemCount > 0 ? (
          <SelectAllLabel>
            <input
              type="checkbox"
              aria-label="사진 전체 선택"
              checked={allSelected}
              disabled={pending}
              onChange={(event) => onToggleAll(event.target.checked)}
            />
            전체 선택
          </SelectAllLabel>
        ) : null}
        {selectedCount > 0 ? (
          <BatchActions>
            <BatchStatus role="status">{selectedCount}장 선택</BatchStatus>
            <Button
              type="button"
              $variant="danger"
              $small
              disabled={pending}
              onClick={onRemoveSelected}
            >
              {pending ? '삭제 중…' : '선택 삭제'}
            </Button>
          </BatchActions>
        ) : null}
      </Toolbar>
    </>
  );
}
