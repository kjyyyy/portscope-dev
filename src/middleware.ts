// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes
  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check for authentication in dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authenticated = request.cookies.get('authenticated')?.value === 'true';
    const demoMode = request.cookies.get('demoMode')?.value === 'true';
    
    if (!authenticated && !demoMode) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
