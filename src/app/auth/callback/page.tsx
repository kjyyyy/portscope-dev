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
        // Check for errors in both hash fragment and query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Get tokens from hash (Supabase sends tokens in hash)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Check for errors in hash
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');
        
        // Check for errors in query params (some Supabase configs use query params)
        const queryError = queryParams.get('error');
        const queryErrorCode = queryParams.get('error_code');
        const queryErrorMsg = queryParams.get('msg');
        
        // Try to parse JSON error if present in URL (Supabase sometimes returns JSON errors)
        let parsedError: { code?: number; error_code?: string; msg?: string } | null = null;
        try {
          // Check if error is a JSON string in query params
          if (queryError && queryError.startsWith('{')) {
            parsedError = JSON.parse(queryError);
          }
          // Also check the full URL for JSON error response (Supabase may embed it)
          const currentUrl = window.location.href;
          const jsonErrorMatch = currentUrl.match(/\{"code":(\d+),"error_code":"([^"]+)","msg":"([^"]+)"\}/);
          if (jsonErrorMatch) {
            parsedError = {
              code: parseInt(jsonErrorMatch[1]),
              error_code: jsonErrorMatch[2],
              msg: jsonErrorMatch[3],
            };
          }
        } catch {
          // Not JSON, continue with regular error handling
        }
        
        // Handle errors from hash
        if (hashError) {
          setStatus('error');
          const errorMsg = hashErrorDescription || hashError;
          if (hashError === 'expired_token' || hashError.includes('expired')) {
            setMessage('This email verification link has expired. Please sign in to request a new confirmation email.');
          } else {
            setMessage(errorMsg || 'Email verification failed');
          }
          setTimeout(() => router.push('/login?error=expired_link'), 3000);
          return;
        }
        
        // Handle errors from query params or parsed JSON
        if (queryError || queryErrorCode || parsedError) {
          setStatus('error');
          let errorMessage = 'Email verification failed';
          
          // Use parsed error if available (from JSON in URL)
          const errorCode = parsedError?.error_code || queryErrorCode;
          const errorMsg = parsedError?.msg || queryErrorMsg;
          
          if (errorCode === 'otp_expired' || errorCode === 'expired_token' || parsedError?.code === 403) {
            errorMessage = 'This email verification link has expired. You can sign in with your email and password to access your account. If your email is already confirmed, you\'ll be able to sign in directly.';
          } else if (errorMsg) {
            errorMessage = errorMsg;
          } else if (queryError && !queryError.startsWith('{')) {
            errorMessage = queryError;
          }
          
          setMessage(errorMessage);
          setTimeout(() => router.push('/login?error=expired_link'), 3000);
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
              <p className="text-sm text-muted-foreground mt-2">
                {message.includes('expired') && (
                  <span>
                    You can sign in with your email and password to access your account.
                    If your email is already confirmed, you&apos;ll be able to sign in directly.
                  </span>
                )}
                {!message.includes('expired') && (
                  <span>You will be redirected shortly...</span>
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

