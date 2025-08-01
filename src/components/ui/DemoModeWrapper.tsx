'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DemoModeWrapperProps {
  children: React.ReactNode;
}

export default function DemoModeWrapper({ children }: DemoModeWrapperProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const exitDemoMode = () => {
    localStorage.removeItem('demoMode');
    setIsDemoMode(false);
    window.location.href = '/';
  };

  if (!isDemoMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Demo Mode Banner */}
      {showDemoBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white text-blue-600">
                DEMO MODE
              </Badge>
              <span className="text-sm font-medium">
                Exploring PortScope Dev UI - All features are interactive for demonstration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowDemoBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-blue-600"
                onClick={exitDemoMode}
              >
                Exit Demo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={showDemoBanner ? 'pt-16' : ''}>
        {children}
      </div>

      {/* Demo Mode Indicator (if banner is hidden) */}
      {!showDemoBanner && (
        <div className="fixed top-4 right-4 z-40">
          <Badge variant="secondary" className="bg-blue-600 text-white">
            DEMO MODE
          </Badge>
        </div>
      )}
    </div>
  );
} 