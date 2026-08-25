import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'kaleo_at';
const REFRESH_TOKEN_COOKIE = 'kaleo_rt';
const CSRF_COOKIE = 'kaleo_csrf';
const CSRF_HEADER = 'x-csrf-token';
const API_BASE_URL =
  process.env.API_INTERNAL_URL ??
  `${process.env.NEXT_PUBLIC_API_ORIGIN ?? 'https://api.kaleoyouth.com'}/api`;

function loginRedirect(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  if (pathname.startsWith('/admin/')) url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

function getSetCookies(headers: Headers): string[] {
  const accessor = headers as Headers & {
    getSetCookie?: () => string[];
  };
  const values = accessor.getSetCookie?.();
  if (values && values.length > 0) return values;
  const combined = headers.get('set-cookie');
  return combined ? [combined] : [];
}

function cookiePair(setCookies: readonly string[], name: string): string | null {
  const prefix = `${name}=`;
  const value = setCookies.find((cookie) => cookie.startsWith(prefix));
  return value?.split(';', 1)[0] ?? null;
}

function replaceCookie(header: string, pair: string): string {
  const name = pair.slice(0, pair.indexOf('=') + 1);
  return [
    ...header
      .split(/;\s*/)
      .filter((cookie) => cookie && !cookie.startsWith(name)),
    pair,
  ].join('; ');
}

function copySetCookies(
  response: NextResponse,
  setCookies: readonly string[],
): void {
  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  if (!request.cookies.has(REFRESH_TOKEN_COOKIE)) {
    return loginRedirect(request);
  }

  let cookieHeader = request.headers.get('cookie') ?? '';
  let csrfToken = request.cookies.get(CSRF_COOKIE)?.value;
  const issuedCookies: string[] = [];

  try {
    if (!csrfToken) {
      const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf`, {
        headers: {
          Accept: 'application/json',
          Cookie: cookieHeader,
        },
        cache: 'no-store',
      });
      if (!csrfResponse.ok) return loginRedirect(request);
      const body = (await csrfResponse.json()) as {
        csrfToken?: string | null;
      };
      if (!body.csrfToken) return loginRedirect(request);
      csrfToken = body.csrfToken;
      issuedCookies.push(...getSetCookies(csrfResponse.headers));
      cookieHeader = replaceCookie(
        cookieHeader,
        `${CSRF_COOKIE}=${csrfToken}`,
      );
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
        Origin: request.nextUrl.origin,
        [CSRF_HEADER]: csrfToken,
      },
      cache: 'no-store',
    });
    const refreshCookies = getSetCookies(refreshResponse.headers);
    issuedCookies.push(...refreshCookies);
    if (!refreshResponse.ok) {
      const response = loginRedirect(request);
      copySetCookies(response, issuedCookies);
      return response;
    }

    const accessCookie = cookiePair(refreshCookies, ACCESS_TOKEN_COOKIE);
    if (!accessCookie) return loginRedirect(request);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      'cookie',
      replaceCookie(cookieHeader, accessCookie),
    );
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    copySetCookies(response, issuedCookies);
    return response;
  } catch {
    return loginRedirect(request);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
