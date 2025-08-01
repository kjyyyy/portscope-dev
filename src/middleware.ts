// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // For demo purposes, allow all access to dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
