'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OnboardButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={cn('flex justify-end', className)}>
      <Button
        onClick={() => router.push('/dashboard/portfolio/new')}
        className="bg-primary text-white hover:bg-primary/90"
      >
        + Onboard Portfolio Company
      </Button>
    </div>
  );
} 