// src/components/SessionWrapper.tsx
'use client';

import { ReactNode } from 'react';

export default function SessionWrapper({ children }: { children: ReactNode }) {
  // Simple wrapper - no need for NextAuth SessionProvider
  return <>{children}</>;
}
