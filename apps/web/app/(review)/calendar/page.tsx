'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface CalendarEvent {
  id: string;
  fundName: string;
  entityName: string;
  amount: string;
  currency: string;
  eventDate: string;
  dueDate: string | null;
  status: string;
  wireStatus: string | null;
  wireInstruction: {
    id: string;
    bankName: string | null;
    accountNumber: string | null;
    reference: string | null;
    wireStatus: string;
    wiredAt: string | null;
    confirmedAt: string | null;
  } | null;
  document: { id: string; fileName: string } | null;
}

function fmtMoney(val: string, ccy = 'USD') {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const sym = ccy === 'EUR' ? '€' : ccy === 'GBP' ? '£' : '$';
  if (num >= 1_000_000) return `${sym}${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${sym}${(num / 1_000).toFixed(0)}K`;
  return `${sym}${num.toFixed(0)}`;
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function CalendarPage() {
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [past, setPast] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchData = useCallback(async () => {
    try {
      const [u, p] = await Promise.all([
        apiFetch<CalendarEvent[]>('/calendar/upcoming'),
        apiFetch<CalendarEvent[]>('/calendar/past'),
      ]);
      setUpcoming(u);
      setPast(p);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markWired = async (id: string) => {
    await apiFetch(`/calendar/${id}/mark-wired`, { method: 'POST' });
    fetchData();
  };

  const confirmWire = async (id: string) => {
    await apiFetch(`/calendar/${id}/confirm`, { method: 'POST' });
    fetchData();
  };

  const totalPending = upcoming.filter((e) => !e.wireStatus || e.wireStatus === 'PENDING').length;
  const totalDue7Days = upcoming.filter((e) => {
    const d = daysUntil(e.dueDate);
    return d !== null && d <= 7 && d >= 0;
  }).length;

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Capital Call Calendar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track wire deadlines and payment confirmations</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Upcoming Calls" value={String(upcoming.length)} />
          <StatCard label="Action Required" value={String(totalPending)} accent />
          <StatCard label="Due Within 7 Days" value={String(totalDue7Days)} warn={totalDue7Days > 0} />
        </div>

        <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'upcoming' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'past' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Past ({past.length})
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading calendar...</p>
        ) : tab === 'upcoming' ? (
          upcoming.length === 0 ? (
            <EmptyState message="No upcoming capital calls" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((e) => (
                <CallCard key={e.id} event={e} onMarkWired={markWired} onConfirm={confirmWire} />
              ))}
            </div>
          )
        ) : past.length === 0 ? (
          <EmptyState message="No past capital calls" />
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Fund</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Due Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((e) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{e.fundName}</td>
                  <td className="py-2">{fmtMoney(e.amount, e.currency)}</td>
                  <td className="py-2 text-muted-foreground">{e.dueDate ? new Date(e.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="py-2"><WireStatusBadge status={e.wireStatus ?? e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CallCard({ event: e, onMarkWired, onConfirm }: { event: CalendarEvent; onMarkWired: (id: string) => void; onConfirm: (id: string) => void }) {
  const days = daysUntil(e.dueDate);
  const isUrgent = days !== null && days <= 3 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <div className={`rounded-lg border p-4 ${isOverdue ? 'border-destructive/40 bg-destructive/5' : isUrgent ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{e.fundName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{e.entityName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{fmtMoney(e.amount, e.currency)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{e.currency}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span>Due: {e.dueDate ? new Date(e.dueDate).toLocaleDateString() : 'No date'}</span>
        {days !== null && (
          <span className={isOverdue ? 'text-destructive font-medium' : isUrgent ? 'text-yellow-600 font-medium' : ''}>
            {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
          </span>
        )}
        <WireStatusBadge status={e.wireInstruction?.wireStatus ?? 'PENDING'} />
      </div>

      {e.wireInstruction?.bankName && (
        <div className="mt-2 text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1">
          Bank: {e.wireInstruction.bankName} · Acct: {e.wireInstruction.accountNumber ?? '—'} · Ref: {e.wireInstruction.reference ?? '—'}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        {(!e.wireInstruction || e.wireInstruction.wireStatus === 'PENDING') && (
          <button onClick={() => onMarkWired(e.id)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Mark as Wired
          </button>
        )}
        {e.wireInstruction?.wireStatus === 'WIRED' && (
          <button onClick={() => onConfirm(e.id)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
            Confirm Receipt
          </button>
        )}
      </div>
    </div>
  );
}

function WireStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    WIRED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${warn ? 'text-destructive' : accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-1">Capital calls will appear here when documents with due dates are processed.</p>
    </div>
  );
}
