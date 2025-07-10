'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center space-y-2">
          <Image src="/portscope_logo.png" alt="Company Logo" width={60} height={60} className="mx-auto" />
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full flex items-center gap-2 justify-center" onClick={() => signIn('google')}>
            <FcGoogle className="h-5 w-5" /> Continue with Google
          </Button>
          <Button variant="outline" className="w-full flex items-center gap-2 justify-center" onClick={() => signIn('github')}>
            <FaGithub className="h-5 w-5" /> Continue with GitHub
          </Button>
          <Separator className="my-4" />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="text-sm text-right">
            <button onClick={() => alert('Redirect to password recovery')} className="text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => router.push('/dashboard')}>Sign In</Button>
          <Button variant="ghost" className="text-sm text-gray-500" onClick={() => alert('Redirect to sign up page')}>
            No account yet? Sign up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
