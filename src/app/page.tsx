'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Play, ArrowRight, Lock } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simple password authentication
  const APP_PASSWORD = 'portscope2024'; // You can change this password

  const handleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    // Simple password check
    if (password === APP_PASSWORD) {
      // Set authentication cookie
      document.cookie = 'authenticated=true; path=/; max-age=86400'; // 24 hours
      document.cookie = 'demoMode=false; path=/; max-age=86400';
      router.push('/dashboard');
    } else {
      setError('Invalid password. Please try again.');
    }
    setIsLoading(false);
  };

  const handleDemoMode = () => {
    // Set demo mode cookie
    document.cookie = 'demoMode=true; path=/; max-age=86400'; // 24 hours
    document.cookie = 'authenticated=true; path=/; max-age=86400';
    router.push('/dashboard');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
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
            <p className="text-sm font-medium text-muted-foreground mb-4">Secure Access</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Access Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter access password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-1"
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
            <div className="text-sm text-center text-muted-foreground">
              <p>Password: <code className="bg-gray-100 px-2 py-1 rounded text-xs">portscope2024</code></p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700" 
            onClick={handleSignIn}
            disabled={isLoading}
          >
            <Lock className="h-4 w-4 mr-2" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
