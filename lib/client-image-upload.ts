'use client';

import { ClientApiError } from '@/lib/client-api';

const MAX_IMAGE_EDGE = 2560;
const WEBP_QUALITY = 0.8;
const CONVERTIBLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function webpName(name: string): string {
  const extensionStart = name.lastIndexOf('.');
  const stem = extensionStart > 0 ? name.slice(0, extensionStart) : name;
  return `${stem}.webp`;
}

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(
          new ClientApiError(
            0,
            '사진을 업로드용 WebP로 변환하지 못했습니다.',
          ),
        );
      },
      'image/webp',
      WEBP_QUALITY,
    );
  });
}

export async function optimizeUploadFile(file: File): Promise<File> {
  if (!CONVERTIBLE_IMAGE_TYPES.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
  } catch {
    throw new ClientApiError(0, `${file.name} 사진을 읽지 못했습니다.`);
  }

  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      throw new ClientApiError(0, '사진 변환 화면을 준비하지 못했습니다.');
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToWebp(canvas);
    return new File([blob], webpName(file.name), {
      type: 'image/webp',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}
