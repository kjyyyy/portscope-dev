'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface PortfolioOverview {
  totalNav: string;
  totalCommitment: string;
  totalCalled: string;
  totalDistributed: string;
  holdingsCount: number;
  nextCall: { fundName: string; amount: string; dueDate?: string } | null;
}

interface HoldingItem {
  id: string;
  commitment: string | null;
  calledAmount: string | null;
  distributedAmount: string | null;
  currentNav: string | null;
  irr: string | null;
  tvpi: string | null;
  dpi: string | null;
  asOfDate: string | null;
  fund: { id: string; name: string; manager: string; strategy?: string; currency: string };
  entity: { id: string; name: string };
}

interface CapitalEventItem {
  id: string;
  type: 'CALL' | 'DISTRIBUTION';
  amount: string;
  currency: string;
  eventDate: string;
  dueDate: string | null;
  status: string;
  holding: {
    fund: { name: string };
    entity: { name: string };
  };
  document: { id: string; fileName: string } | null;
}

export default function PortfolioPage() {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [events, setEvents] = useState<CapitalEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ov, hl, ev] = await Promise.all([
          apiFetch<PortfolioOverview>('/portfolio/overview'),
          apiFetch<HoldingItem[]>('/portfolio/holdings'),
          apiFetch<CapitalEventItem[]>('/portfolio/events'),
        ]);
        setOverview(ov);
        setHoldings(hl);
        setEvents(ev);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-destructive text-sm mb-2">{error}</p>
          <p className="text-xs text-muted-foreground">Make sure documents have been approved to populate portfolio data.</p>
        </div>
      </div>
    );
  }

  const isEmpty = holdings.length === 0;

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Portfolio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Holdings, allocations, and capital activity</p>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex items-center justify-center h-[calc(100%-60px)]">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-2">No portfolio data yet</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Portfolio data is automatically created when you approve documents in the review queue.
              Upload a document, review the extracted fields, then approve it to see holdings here.
            </p>
            <Link href="/queue" className="text-xs text-primary hover:underline">
              Go to Review Queue →
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {overview && <SummaryCards overview={overview} />}
          <HoldingsTable holdings={holdings} />
          {events.length > 0 && <CapitalEvents events={events} />}
        </div>
      )}
    </div>
  );
}

function SummaryCards({ overview }: { overview: PortfolioOverview }) {
  const cards = [
    { label: 'Total NAV', value: fmtMoney(overview.totalNav) },
    { label: 'Total Commitment', value: fmtMoney(overview.totalCommitment) },
    { label: 'Called', value: fmtMoney(overview.totalCalled) },
    { label: 'Distributed', value: fmtMoney(overview.totalDistributed) },
    { label: 'Holdings', value: String(overview.holdingsCount) },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{c.label}</p>
          <p className="text-lg font-semibold text-foreground">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function HoldingsTable({ holdings }: { holdings: HoldingItem[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fund</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Entity</th>
              <th className="text-center px-4 py-2 font-medium text-muted-foreground">CCY</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">NAV</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Commitment</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Called</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Distributed</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">IRR</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">TVPI</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">As-of</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-foreground">{h.fund.name}</div>
                  <div className="text-muted-foreground text-[10px]">{h.fund.manager}</div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{h.entity.name}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded text-muted-foreground">{h.fund.currency}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">{fmtMoney(h.currentNav, h.fund.currency)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{fmtMoney(h.commitment, h.fund.currency)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{fmtMoney(h.calledAmount, h.fund.currency)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{fmtMoney(h.distributedAmount, h.fund.currency)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{h.irr ? `${(parseFloat(h.irr) * 100).toFixed(1)}%` : '—'}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{h.tvpi ? `${parseFloat(h.tvpi).toFixed(2)}x` : '—'}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">{h.asOfDate ? new Date(h.asOfDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CapitalEvents({ events }: { events: CapitalEventItem[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Recent Capital Activity</h3>
      </div>
      <div className="divide-y divide-border/50">
        {events.slice(0, 10).map((e) => (
          <div key={e.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                e.type === 'CALL'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {e.type}
              </span>
              <div>
                <p className="text-xs text-foreground font-medium">{e.holding.fund.name}</p>
                <p className="text-[10px] text-muted-foreground">{e.holding.entity.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-foreground">{fmtMoney(e.amount, e.currency)}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmtMoney(val: string | null | undefined, currency?: string): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  const sym = currencySymbol(currency);
  if (n === 0) return `${sym}0`;
  if (Math.abs(n) >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${sym}${(n / 1_000).toFixed(0)}K`;
  return `${sym}${n.toLocaleString()}`;
}

function currencySymbol(code?: string): string {
  if (!code || code === 'USD') return '$';
  if (code === 'EUR') return '€';
  if (code === 'GBP') return '£';
  return `${code} `;
}
