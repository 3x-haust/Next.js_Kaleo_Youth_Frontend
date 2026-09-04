'use client';

import type { UploadFileProgress } from '@/lib/client-upload';
import {
  ProgressFiles,
  ProgressPanel,
  ProgressSummary,
} from './GalleryPhotoManager.styles';

export function GalleryUploadProgress({
  files,
}: {
  readonly files: readonly UploadFileProgress[];
}) {
  if (files.length === 0) return null;

  const total = files.reduce((sum, file) => sum + file.total, 0);
  const loaded = files.reduce((sum, file) => sum + file.loaded, 0);
  const percent = total === 0 ? 0 : Math.round((loaded / total) * 100);

  return (
    <ProgressPanel role="status" aria-label="사진 업로드 진행">
      <ProgressSummary>
        <strong>사진 업로드 및 변환 중</strong>
        <span>
          {files.filter((file) => file.state === 'complete').length}
          {' / '}
          {files.length}
        </span>
      </ProgressSummary>
      <progress max={100} value={percent} aria-label="전체 업로드 진행률" />
      <ProgressFiles>
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`}>
            <span title={file.name}>{file.name}</span>
            <progress
              max={100}
              value={
                file.total > 0
                  ? Math.round((file.loaded / file.total) * 100)
                  : 0
              }
              aria-label={`${file.name} 업로드 진행률`}
            />
          </li>
        ))}
      </ProgressFiles>
    </ProgressPanel>
  );
}
