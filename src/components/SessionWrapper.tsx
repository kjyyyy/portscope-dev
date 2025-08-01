// src/components/SessionWrapper.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';

export default function SessionWrapper({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  // In demo mode, don't wrap with SessionProvider to avoid auth errors
  if (isDemoMode) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
