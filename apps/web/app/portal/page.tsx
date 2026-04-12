'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReportDownloadCard } from '@/components/portal/ReportDownloadCard';
import { StatCard } from '@/components/portal/StatCard';

interface PortalData {
  familyOfficeName: string;
  netWorth: string;
  altsNav: string;
  liquidValue: string;
  distributions: string;
  delta: number;
  deltaPercent: number;
  asOf: string;
  quarterLabel: string;
  nextCall: { amount: string; dueDate?: string; fundName: string } | null;
  latestReport: { id: string; title: string; quarterLabel: string; s3Key?: string } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function PortalOverviewPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/reporting/portal-overview`, {
          headers: { Authorization: 'Bearer dev-token' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (err: any) {
        setError(err.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading portfolio...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4 opacity-20">
            <svg className="inline-block w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M12 8v4" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-destructive text-sm mb-2">{error ?? 'No portfolio data available'}</p>
          <p className="text-muted-foreground text-xs mb-4">
            Portfolio data will appear here once documents have been processed through the review queue.
          </p>
          <Link
            href="/"
            className="text-xs text-primary hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const netWorthNum = parseFloat(data.netWorth) || 0;
  const altsNum = parseFloat(data.altsNav) || 0;
  const liquidNum = parseFloat(data.liquidValue) || 0;
  const distNum = parseFloat(data.distributions) || 0;

  const stats = [
    { label: 'Alternatives (NAV)', value: fmtMoney(altsNum) },
    { label: 'Liquid Portfolio', value: fmtMoney(liquidNum) },
    { label: `${data.quarterLabel} Distributions`, value: fmtMoney(distNum) },
    ...(data.nextCall
      ? [{
          label: 'Next Capital Call',
          value: `${fmtMoney(parseFloat(data.nextCall.amount))} · ${data.nextCall.dueDate ? new Date(data.nextCall.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}`,
          urgent: true,
        }]
      : []),
  ];

  return (
    <>
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          ← PORTSCOPE
        </Link>
        <span className="text-sm font-medium text-foreground">{data.familyOfficeName}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <section className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Total Portfolio Value · As of {new Date(data.asOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-5xl font-light tracking-tight font-serif text-foreground">
            {fmtMoney(netWorthNum)}
          </p>
          {data.delta !== 0 && (
            <p className={data.delta >= 0 ? 'text-emerald-400 text-sm mt-2' : 'text-destructive text-sm mt-2'}>
              {data.delta >= 0 ? '↑' : '↓'} {fmtMoney(Math.abs(data.delta))} ({data.deltaPercent.toFixed(1)}%) from last quarter
            </p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} urgent={stat.urgent} />
          ))}
        </section>

        {data.latestReport && (
          <ReportDownloadCard
            title={data.latestReport.title}
            quarterLabel={data.latestReport.quarterLabel}
          />
        )}
      </main>
    </>
  );
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}
