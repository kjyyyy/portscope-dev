'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LandingContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-primary mb-4">
          Portscope
        </p>
        <h1 className="font-serif text-4xl font-light text-foreground mb-3">
          The family office <em className="text-primary">autopilot.</em>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Documents arrive. Books close. Reports deliver. You barely touch a thing.
        </p>

        {error === 'staff_auth' && (
          <div className="mb-6 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            Staff login required. Please sign in to access the review queue.
          </div>
        )}
        {error === 'portal_auth' && (
          <div className="mb-6 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            Client portal requires a magic link. Check your email for access.
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/queue"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Staff Review
          </Link>
          <Link
            href="/portal"
            className="px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
