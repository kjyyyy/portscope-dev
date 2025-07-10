import { ReactNode } from 'react';
import SidebarNav from '@/components/ui/SidebarNav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 p-6 bg-muted/50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
