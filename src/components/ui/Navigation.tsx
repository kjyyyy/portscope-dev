'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, BarChart3, Calculator, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  if (!isDemoMode || pathname === '/') {
    return null;
  }

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Valuations', path: '/dashboard/valuations', icon: Calculator },
  ];

  const handleLogout = () => {
    localStorage.removeItem('demoMode');
    router.push('/');
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-4 py-2">
        <div className="flex items-center gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => router.push(item.path)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {item.name}
              </Button>
            );
          })}
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Exit Demo
          </Button>
        </div>
      </div>
    </div>
  );
} 