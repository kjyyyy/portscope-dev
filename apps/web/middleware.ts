import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isDemoMode = true;
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/portal')) {
    const token = searchParams.get('token');

    if (token) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('token');
      const response = NextResponse.redirect(url);
      response.cookies.set('ps-portal-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    if (isDemoMode) {
      return NextResponse.next();
    }

    const session = request.cookies.get('ps-portal-session');
    if (!session?.value) {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'portal_auth');
      return NextResponse.redirect(url);
    }
  }

  if (
    pathname.startsWith('/queue') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/analyst') ||
    pathname.startsWith('/vault') ||
    pathname.startsWith('/exposure') ||
    pathname.startsWith('/forecast') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/reconciliation') ||
    pathname.startsWith('/tax') ||
    pathname.startsWith('/audit')
  ) {
    if (isDemoMode) {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get('ps-staff-session');
    if (!authCookie?.value) {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'staff_auth');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/queue/:path*',
    '/documents/:path*',
    '/reports/:path*',
    '/portfolio/:path*',
    '/analyst/:path*',
    '/vault/:path*',
    '/exposure/:path*',
    '/forecast/:path*',
    '/calendar/:path*',
    '/reconciliation/:path*',
    '/tax/:path*',
    '/audit/:path*',
  ],
};
