'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface TaxPackageItem {
  id: string;
  taxYear: number;
  entityName: string;
  entityType: string;
  entityId: string;
  fundId: string | null;
  status: string;
  expectedDate: string | null;
  receivedDate: string | null;
}

interface K1Doc {
  id: string;
  fileName: string;
  fundId: string | null;
  entityId: string | null;
  createdAt: string;
}

interface TaxData {
  packages: TaxPackageItem[];
  k1Documents: K1Doc[];
  summary: { total: number; received: number; pending: number; overdue: number };
}

export default function TaxPage() {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [data, setData] = useState<TaxData | null>(null);
  const [years, setYears] = useState<{ year: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<TaxData>(`/tax/${year}/packages`);
      setData(result);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
    apiFetch<{ year: number; count: number }[]>('/tax/years').then(setYears).catch(() => {});
  }, [fetchData]);

  const markReceived = async (id: string) => {
    await apiFetch(`/tax/${year}/packages/${id}/mark-received`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    fetchData();
  };

  const exportCpa = async () => {
    try {
      const result = await apiFetch<any>(`/tax/${year}/export`);
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portscope-k1-export-${year}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const summary = data?.summary;
  const completionPct = summary && summary.total > 0
    ? Math.round((summary.received / summary.total) * 100)
    : 0;

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Tax Package Builder</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track K-1s and prepare CPA exports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
          >
            {(years.length > 0 ? years : [{ year: new Date().getFullYear() - 1, count: 0 }, { year: new Date().getFullYear(), count: 0 }]).map((y) => (
              <option key={y.year} value={y.year}>Tax Year {y.year}</option>
            ))}
          </select>
          <button
            onClick={exportCpa}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted/50"
          >
            Export for CPA
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard label="Total Packages" value={String(summary.total)} />
            <SummaryCard label="Received" value={String(summary.received)} color="green" />
            <SummaryCard label="Pending" value={String(summary.pending)} />
            <SummaryCard label="Overdue" value={String(summary.overdue)} color={summary.overdue > 0 ? 'red' : undefined} />
          </div>
        )}

        {summary && summary.total > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">K-1 Collection Progress</span>
              <span className="text-xs text-muted-foreground">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completionPct === 100 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        ) : !data || (data.packages.length === 0 && data.k1Documents.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No tax packages for {year}</p>
            <p className="text-xs mt-1">Upload K-1 documents or create tax package expectations to get started.</p>
          </div>
        ) : (
          <>
            {data.packages.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">K-1 Packages</h2>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Entity</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Expected</th>
                      <th className="pb-2 font-medium">Received</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.packages.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{p.entityName}</td>
                        <td className="py-2 text-muted-foreground">{p.entityType}</td>
                        <td className="py-2 text-muted-foreground">{p.expectedDate ? new Date(p.expectedDate).toLocaleDateString() : '—'}</td>
                        <td className="py-2 text-muted-foreground">{p.receivedDate ? new Date(p.receivedDate).toLocaleDateString() : '—'}</td>
                        <td className="py-2"><TaxStatusBadge status={p.status} /></td>
                        <td className="py-2">
                          {p.status !== 'RECEIVED' && (
                            <button onClick={() => markReceived(p.id)} className="text-primary hover:underline text-xs">
                              Mark Received
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.k1Documents.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">K-1 Documents</h2>
                <div className="space-y-2">
                  {data.k1Documents.map((d) => (
                    <div key={d.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">{d.fileName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Uploaded {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaxStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    RECEIVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const textColor = color === 'green' ? 'text-green-600' : color === 'red' ? 'text-destructive' : 'text-foreground';
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${textColor}`}>{value}</p>
    </div>
  );
}
