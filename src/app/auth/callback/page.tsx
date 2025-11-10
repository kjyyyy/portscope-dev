'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error || 'Email verification failed');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Supabase email confirmation uses hash fragments with tokens
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        // If no tokens found, check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('Already authenticated! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        // No valid tokens found
        setStatus('error');
        setMessage('Invalid verification link. Please try signing up again.');
        setTimeout(() => router.push('/signup'), 3000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Email verification failed');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [mounted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Verifying Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-green-600 font-medium">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <p className="text-red-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected shortly...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

