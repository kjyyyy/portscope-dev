// src/components/SessionWrapper.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';

export default function SessionWrapper({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode in cookies
    const demoMode = document.cookie.includes('demoMode=true');
    setIsDemoMode(demoMode);
  }, []);

  // Simple wrapper - no need for NextAuth SessionProvider
  return <>{children}</>;
}
