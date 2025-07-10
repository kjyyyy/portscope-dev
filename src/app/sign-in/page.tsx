'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Sign in to Portscope</h1>
      <button
        onClick={() => signIn('google')}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
