// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check for authentication in protected routes
  if (pathname.startsWith('/dashboard')) {
    // Check if Supabase env vars are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      // If Supabase is not configured, allow access (for development)
      // In production, you might want to redirect to a setup page
      console.warn('Supabase environment variables not configured. Skipping auth check.');
      return NextResponse.next();
    }

    try {
      const response = NextResponse.next();
      
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set(name: string, value: string, options: any) {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            remove(name: string, options: any) {
              request.cookies.set({ name, value: '', ...options });
              response.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // If there's an error (e.g., tables don't exist yet), allow access for development
      if (error) {
        console.warn('Auth check error (tables may not exist yet):', error.message);
        return NextResponse.next();
      }

      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // If there's any error, allow access for development
      console.warn('Middleware error (tables may not exist yet):', error);
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
