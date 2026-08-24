import type { UploadedFile } from '@/lib/client-upload';

export function existingImage(fileUrl: string, id: string, label: string): UploadedFile {
  return {
    id: `persisted-${id}`,
    fileUrl,
    originalName: label,
    fileType: 'image/*',
    fileSize: null,
    isPersisted: true,
  };
}

export function uploadedIds(files: readonly UploadedFile[]): string[] {
  return files.flatMap((file) => file.isPersisted ? [] : [file.id]);
}
