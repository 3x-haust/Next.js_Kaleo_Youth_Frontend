'use client';

import {
  ClientApiError,
  clientAuthPost,
} from '@/lib/client-api';
import { optimizeUploadFile } from '@/lib/client-image-upload';

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? 'https://api.kaleoyouth.com';
const UPLOAD_URL = `${API_ORIGIN}/api/uploads`;
const CSRF_COOKIE = 'kaleo_csrf';
const CSRF_HEADER = 'x-csrf-token';
const MAX_PARALLEL_PREPARATIONS = 2;

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

async function uploadBatch(
  files: readonly File[],
  ownerType: UploadOwnerType,
  onProgress: (loaded: number) => void,
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
      onProgress(event.loaded);
    };
    request.upload.onload = () => {
      onProgress(files.reduce((total, file) => total + file.size, 0));
    };
    request.onerror = () => {
      reject(new ClientApiError(0, '업로드 연결이 끊어졌습니다.'));
    };
    request.onload = async () => {
      if (request.status === 401 && canRetry) {
        try {
          await refreshSession();
          resolve(await uploadBatch(files, ownerType, onProgress, false));
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
    for (const file of files) form.append('files', file);
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
  const prepared: File[] = Array.from({ length: files.length });
  const failures: unknown[] = [];
  let cursor = 0;

  function publish() {
    onProgress?.(progress.map((item) => ({ ...item })));
  }

  function update(index: number, change: Partial<UploadFileProgress>) {
    progress[index] = { ...progress[index], ...change };
    publish();
  }

  async function prepareWorker() {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      const file = files[index];
      try {
        update(index, { state: 'uploading' });
        const optimized = await optimizeUploadFile(file);
        prepared[index] = optimized;
        update(index, {
          loaded: 0,
          total: optimized.size,
          state: 'queued',
        });
      } catch (error) {
        failures.push(error);
        update(index, { state: 'failed' });
      }
    }
  }

  publish();
  const preparationCount = Math.min(
    MAX_PARALLEL_PREPARATIONS,
    files.length,
  );
  await Promise.all(
    Array.from({ length: preparationCount }, () => prepareWorker()),
  );

  if (failures.length > 0) {
    throw failures[0];
  }

  for (let index = 0; index < progress.length; index += 1) {
    progress[index] = { ...progress[index], state: 'uploading' };
  }
  publish();

  const uploaded = await uploadBatch(prepared, ownerType, (loaded) => {
    let remaining = loaded;
    for (let index = 0; index < prepared.length; index += 1) {
      const file = prepared[index];
      const fileLoaded = Math.min(file.size, Math.max(0, remaining));
      remaining -= file.size;
      progress[index] = {
        ...progress[index],
        loaded: fileLoaded,
        state: fileLoaded >= file.size ? 'complete' : 'uploading',
      };
    }
    publish();
  });

  return uploaded.map((file, index) => ({
    ...file,
    originalName: files[index]?.name ?? file.originalName,
  }));
}
