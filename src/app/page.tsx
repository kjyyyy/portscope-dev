'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Play, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoMode = () => {
    // Store demo mode in localStorage
    localStorage.setItem('demoMode', 'true');
    router.push('/dashboard');
  };

  const handleSignIn = () => {
    // In demo mode, always allow access regardless of input
    localStorage.setItem('demoMode', 'true');
    router.push('/dashboard');
  };

  const handleGoogleSignIn = () => {
    alert('Demo Mode: Google authentication would be configured in production');
    // For demo, allow access
    localStorage.setItem('demoMode', 'true');
    router.push('/dashboard');
  };

  const handleGithubSignIn = () => {
    alert('Demo Mode: GitHub authentication would be configured in production');
    // For demo, allow access
    localStorage.setItem('demoMode', 'true');
    router.push('/dashboard');
  };

  const handleSignUp = () => {
    // For demo, allow access without authentication
    localStorage.setItem('demoMode', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/portscope_logo.png" alt="PortScope Logo" width={80} height={80} className="rounded-lg shadow-md" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PortScope Dev
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Professional Portfolio Management Platform</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Mode Button - Prominent */}
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold shadow-lg" 
            onClick={handleDemoMode}
          >
            <Play className="h-5 w-5 mr-2" />
            🚀 Launch Demo Mode
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Explore the full UI without authentication</p>
          </div>

          <Separator className="my-6" />
          
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Production Authentication</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-3 justify-center h-11" 
              onClick={handleGoogleSignIn}
            >
              <FcGoogle className="h-5 w-5" /> 
              Continue with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-3 justify-center h-11" 
              onClick={handleGithubSignIn}
            >
              <FaGithub className="h-5 w-5" /> 
              Continue with GitHub
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-right">
              <button onClick={() => alert('Demo Mode: Password recovery would be configured in production')} className="text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700" 
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button 
            variant="ghost" 
            className="text-sm text-gray-500 hover:text-gray-700" 
            onClick={handleSignUp}
          >
            No account yet? Sign up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
