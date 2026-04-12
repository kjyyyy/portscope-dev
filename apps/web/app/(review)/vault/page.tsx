'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface VaultDoc {
  id: string;
  fileName: string;
  type: string;
  status: string;
  overallConfidence: number | null;
  amount: string | null;
  fundName: string | null;
  entityName: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface TypeCount {
  type: string;
  count: number;
}

export default function VaultPage() {
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState<TypeCount[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '50');

      const result = await apiFetch<{ items: VaultDoc[]; total: number }>(`/vault/search?${params}`);
      setDocs(result.items);
      setTotal(result.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [q, typeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    search();
    apiFetch<TypeCount[]>('/vault/types').then(setTypes).catch(() => {});
  }, [search]);

  const statuses = ['PROCESSING', 'REVIEW', 'AUTO_APPROVED', 'APPROVED', 'REJECTED', 'ERROR'];

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-sm font-semibold text-foreground">Document Vault</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Search and filter all processed documents</p>
      </header>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by filename or type..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t.type} value={t.type}>{t.type} ({t.count})</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-border bg-background text-foreground w-[130px]"
              title="From date"
            />
            <span>—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-border bg-background text-foreground w-[130px]"
              title="To date"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {total} document{total !== 1 ? 's' : ''} found
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No documents found</p>
            <p className="text-xs mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">File Name</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Confidence</th>
                <th className="pb-2 pr-4 font-medium">Fund</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5">
                    <Link href={`/documents/${d.id}`} className="text-primary hover:underline font-medium">
                      {d.fileName}
                    </Link>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-2.5"><StatusBadge status={d.status} /></td>
                  <td className="py-2.5">
                    {d.overallConfidence !== null ? `${(d.overallConfidence * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{d.fundName ?? '—'}</td>
                  <td className="py-2.5 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    AUTO_APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}
