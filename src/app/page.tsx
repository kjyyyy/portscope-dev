'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function HomePage() {

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
        
        <CardContent className="space-y-4">
          <Button 
            asChild
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold shadow-lg" 
          >
            <Link href="/login">
              Sign In
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline"
            className="w-full h-12 text-lg font-semibold" 
          >
            <Link href="/signup">
              Sign Up
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
