'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface UserInfo {
  name?: string;
  email: string;
  familyOfficeName?: string;
}

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    apiFetch<UserInfo>('/auth/me').then(setUser).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-sidebar-border">
          <Link href="/" className="font-mono text-xs tracking-[0.18em] text-primary">
            ◆ PORTSCOPE
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <NavSection label="Documents">
            <NavItem href="/queue" label="Review Queue" active={pathname === '/queue' || pathname.startsWith('/documents/')} />
            <NavItem href="/vault" label="Document Vault" active={pathname === '/vault'} />
          </NavSection>
          <NavSection label="Portfolio">
            <NavItem href="/portfolio" label="Overview" active={pathname === '/portfolio'} />
            <NavItem href="/exposure" label="Exposure" active={pathname === '/exposure'} />
            <NavItem href="/forecast" label="Commitments" active={pathname === '/forecast'} />
          </NavSection>
          <NavSection label="Operations">
            <NavItem href="/calendar" label="Wire Calendar" active={pathname === '/calendar'} />
            <NavItem href="/reconciliation" label="Reconciliation" active={pathname.startsWith('/reconciliation')} />
            <NavItem href="/tax" label="Tax Packages" active={pathname.startsWith('/tax')} />
          </NavSection>
          <NavSection label="Intelligence">
            <NavItem href="/analyst" label="AI Analyst" active={pathname === '/analyst'} />
            <NavItem href="/reports" label="Reports" active={pathname === '/reports'} />
          </NavSection>
          <NavSection label="System">
            <NavItem href="/audit" label="Audit Trail" active={pathname === '/audit'} />
          </NavSection>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {user ? (
            <>
              <p className="font-mono text-[10px] text-muted-foreground tracking-wide uppercase">
                {user.name ?? user.email}
              </p>
              {user.familyOfficeName && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.familyOfficeName}
                </p>
              )}
            </>
          ) : (
            <p className="font-mono text-[10px] text-muted-foreground tracking-wide uppercase animate-pulse">
              Loading...
            </p>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
        active
          ? 'bg-muted/70 text-foreground font-medium'
          : 'text-sidebar-foreground hover:bg-muted/50'
      }`}
    >
      {label}
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-3 first:pt-0">
      <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
