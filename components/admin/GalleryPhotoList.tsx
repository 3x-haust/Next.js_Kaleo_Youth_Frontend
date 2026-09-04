'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/primitives';
import { formatFileSize, toFileUrl } from '@/lib/format';
import {
  CardBody,
  CardMeta,
  FileName,
  PhotoCard,
  PhotoList,
  RemoveButton,
  SelectCheck,
  ThumbnailBadge,
  ThumbnailChoice,
  ThumbnailRadioLabel,
} from './GalleryPhotoManager.styles';
import type { GalleryPhotoItem } from './GalleryPhotoManager.types';

export function GalleryPhotoList({
  items,
  thumbnailUrl,
  selectedUrls,
  pending,
  onThumbnailChange,
  onToggleItem,
  onRemove,
}: {
  readonly items: readonly GalleryPhotoItem[];
  readonly thumbnailUrl: string | null;
  readonly selectedUrls: ReadonlySet<string>;
  readonly pending: boolean;
  readonly onThumbnailChange: (fileUrl: string) => void;
  readonly onToggleItem: (fileUrl: string, checked: boolean) => void;
  readonly onRemove: (item: GalleryPhotoItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <PhotoList role="radiogroup" aria-label="갤러리 대표 이미지">
      {items.map((item) => {
        const isThumbnail = thumbnailUrl === item.fileUrl;
        const isSelected = selectedUrls.has(item.fileUrl);
        return (
          <PhotoCard
            key={item.id}
            $selected={isSelected}
            $thumbnail={isThumbnail}
          >
            <ThumbnailRadioLabel title="대표 이미지로 선택">
              <input
                type="radio"
                name="gallery-thumbnail"
                aria-label={`${item.name} 대표 이미지로 선택`}
                checked={isThumbnail}
                onChange={() => onThumbnailChange(item.fileUrl)}
              />
              <Image
                src={item.previewUrl ?? toFileUrl(item.fileUrl)}
                alt={item.name}
                width={96}
                height={72}
                sizes="96px"
                unoptimized
              />
            </ThumbnailRadioLabel>
            <CardBody>
              <FileName
                href={toFileUrl(item.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </FileName>
              <CardMeta>
                {item.fileSize ? (
                  <Badge>{formatFileSize(item.fileSize)}</Badge>
                ) : null}
                {isThumbnail ? (
                  <ThumbnailBadge>대표</ThumbnailBadge>
                ) : (
                  <ThumbnailChoice>대표 선택</ThumbnailChoice>
                )}
              </CardMeta>
            </CardBody>
            <SelectCheck
              type="checkbox"
              aria-label={`${item.name} 선택`}
              checked={isSelected}
              disabled={pending}
              onChange={(event) =>
                onToggleItem(item.fileUrl, event.target.checked)
              }
            />
            <RemoveButton
              type="button"
              disabled={pending}
              onClick={() => onRemove(item)}
            >
              제거
            </RemoveButton>
          </PhotoCard>
        );
      })}
    </PhotoList>
  );
}
