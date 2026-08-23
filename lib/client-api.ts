'use client';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4000';
const BASE_URL = `${API_ORIGIN}/api`;

const CSRF_COOKIE = 'kaleo_csrf';
const CSRF_HEADER = 'x-csrf-token';

export class ClientApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ClientApiError';
  }
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const found = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;

  try {
    const response = await fetch(`${BASE_URL}/auth/csrf`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { csrfToken?: string | null };
    return readCookie(CSRF_COOKIE) ?? body.csrfToken ?? null;
  } catch {
    return null;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {

  noRetry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(csrfToken?: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(csrfToken ? { [CSRF_HEADER]: csrfToken } : {}),
    },
  })
    .then((response) => response.ok)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function send(
  method: Method,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const isForm = body instanceof FormData;

  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  if (method !== 'GET') {
    const token = await ensureCsrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (response.status !== 401 || options.noRetry) return response;

  const refreshed = await refreshAccessToken(headers[CSRF_HEADER]);
  if (!refreshed) return response;

  return fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ClientApiError(response.status, await extractMessage(response));
  }
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function extractMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join('\n');
    if (body.message) return body.message;
  } catch {

  }
  if (response.status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (response.status === 403) return '권한이 없거나 요청이 거부되었습니다.';
  if (response.status === 429) return '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.';
  return `요청을 처리하지 못했습니다. (${response.status})`;
}

export async function clientGet<T>(path: string): Promise<T> {
  return parse<T>(await send('GET', path));
}

export async function clientPost<T>(path: string, body?: unknown): Promise<T> {
  return parse<T>(await send('POST', path, body));
}

export async function clientPatch<T>(path: string, body?: unknown): Promise<T> {
  return parse<T>(await send('PATCH', path, body));
}

export async function clientDelete<T>(path: string): Promise<T> {
  return parse<T>(await send('DELETE', path));
}

export async function clientAuthPost<T>(path: string, body?: unknown): Promise<T> {
  return parse<T>(await send('POST', path, body, { noRetry: true }));
}

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

export async function uploadFiles(
  files: File[],
  ownerType: UploadOwnerType,
): Promise<UploadedFile[]> {
  const form = new FormData();
  form.append('ownerType', ownerType);
  for (const file of files) form.append('files', file);
  return parse<UploadedFile[]>(await send('POST', '/uploads', form));
}

export function errorMessage(error: unknown): string {
  if (error instanceof ClientApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
}
