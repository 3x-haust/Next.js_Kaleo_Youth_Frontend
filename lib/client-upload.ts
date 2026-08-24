'use client';

import {
  ClientApiError,
  clientAuthPost,
  clientDelete,
} from '@/lib/client-api';

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? 'https://api.kaleoyouth.com';
const UPLOAD_URL = `${API_ORIGIN}/api/uploads`;
const CSRF_COOKIE = 'kaleo_csrf';
const CSRF_HEADER = 'x-csrf-token';
const MAX_PARALLEL_UPLOADS = 3;

export interface UploadedFile {
  readonly id: string;
  readonly fileUrl: string;
  readonly originalName: string | null;
  readonly fileType: string | null;
  readonly fileSize: string | null;
  readonly isPersisted?: boolean;
}

export type UploadOwnerType =
  | 'post'
  | 'setlist'
  | 'event'
  | 'sermon'
  | 'worship_team'
  | 'worship_team_member'
  | 'about_page';

export interface UploadFileProgress {
  readonly name: string;
  readonly loaded: number;
  readonly total: number;
  readonly state: 'queued' | 'uploading' | 'complete' | 'failed';
}

type ProgressListener = (files: readonly UploadFileProgress[]) => void;

let refreshPromise: Promise<void> | null = null;

function readCookie(name: string): string | null {
  const found = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function refreshSession(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = clientAuthPost('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function responseMessage(request: XMLHttpRequest): string {
  const body = request.response as { message?: string | string[] } | null;
  if (Array.isArray(body?.message)) return body.message.join('\n');
  if (body?.message) return body.message;
  if (request.status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (request.status === 403) return '권한이 없거나 요청이 거부되었습니다.';
  if (request.status === 429) return '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.';
  return `요청을 처리하지 못했습니다. (${request.status})`;
}

async function uploadFile(
  file: File,
  ownerType: UploadOwnerType,
  onProgress: (loaded: number, total: number) => void,
  canRetry = true,
): Promise<UploadedFile[]> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', UPLOAD_URL);
    request.withCredentials = true;
    request.responseType = 'json';
    const csrfToken = readCookie(CSRF_COOKIE);
    if (csrfToken) request.setRequestHeader(CSRF_HEADER, csrfToken);

    request.upload.onprogress = (event) => {
      onProgress(event.loaded, event.lengthComputable ? event.total : file.size);
    };
    request.onerror = () => {
      reject(new ClientApiError(0, '업로드 연결이 끊어졌습니다.'));
    };
    request.onload = async () => {
      if (request.status === 401 && canRetry) {
        try {
          await refreshSession();
          resolve(await uploadFile(file, ownerType, onProgress, false));
        } catch (error) {
          reject(error);
        }
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        reject(new ClientApiError(request.status, responseMessage(request)));
        return;
      }
      resolve(request.response as UploadedFile[]);
    };

    const form = new FormData();
    form.append('ownerType', ownerType);
    form.append('files', file);
    request.send(form);
  });
}

export async function uploadFiles(
  files: readonly File[],
  ownerType: UploadOwnerType,
  onProgress?: ProgressListener,
): Promise<UploadedFile[]> {
  const progress: UploadFileProgress[] = files.map((file) => ({
    name: file.name,
    loaded: 0,
    total: file.size,
    state: 'queued',
  }));
  const results: UploadedFile[][] = Array.from({ length: files.length }, () => []);
  const failures: unknown[] = [];
  let cursor = 0;

  function update(index: number, change: Partial<UploadFileProgress>) {
    progress[index] = { ...progress[index], ...change };
    onProgress?.(progress.map((item) => ({ ...item })));
  }

  async function worker() {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      const file = files[index];
      update(index, { state: 'uploading' });
      try {
        results[index] = await uploadFile(file, ownerType, (loaded, total) => {
          update(index, { loaded, total });
        });
        update(index, {
          loaded: progress[index].total,
          state: 'complete',
        });
      } catch (error) {
        failures.push(error);
        update(index, { state: 'failed' });
      }
    }
  }

  onProgress?.(progress);
  const workerCount = Math.min(MAX_PARALLEL_UPLOADS, files.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const uploaded = results.flat();
  if (failures.length > 0) {
    await Promise.allSettled(
      uploaded.map((file) => clientDelete(`/uploads/${file.id}`)),
    );
    throw failures[0];
  }
  return uploaded;
}
