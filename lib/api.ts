import 'server-only';

import { cookies } from 'next/headers';

const BASE_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export function buildQuery(query?: Query): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

interface FetchOptions {
  query?: Query;

  authed?: boolean;

  revalidate?: number;
}

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.authed) {

    const store = await cookies();
    const cookieHeader = store
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    if (cookieHeader) headers.Cookie = cookieHeader;
  }

  const response = await fetch(`${BASE_URL}${path}${buildQuery(options.query)}`, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await extractMessage(response);
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export async function apiGetSafe<T>(
  path: string,
  fallback: T,
  options: FetchOptions = {},
): Promise<T> {
  try {
    return await apiGet<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return fallback;
    throw error;
  }
}

async function extractMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join('\n');
    if (body.message) return body.message;
  } catch {
  }
  return `요청을 처리하지 못했습니다. (${response.status})`;
}

export const API_BASE_URL = BASE_URL;
