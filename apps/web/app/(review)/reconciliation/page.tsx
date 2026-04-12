'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface Period {
  id: string;
  year: number;
  month: number;
  status: string;
  diffs: any[] | null;
  reconciledAt: string | null;
  reconciledBy: string | null;
}

interface DiffItem {
  fundName: string;
  field: string;
  custodianValue: string;
  portscopeValue: string;
  difference: string;
  status: 'MATCH' | 'WITHIN_TOLERANCE' | 'EXCEPTION';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReconciliationPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [uploadMonth, setUploadMonth] = useState(new Date().getMonth() + 1);
  const [tolerance, setTolerance] = useState('1');
  const [csvText, setCsvText] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fetchPeriods = useCallback(async () => {
    try {
      const result = await apiFetch<Period[]>('/reconciliation/periods');
      setPeriods(result);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  const parseCsv = (text: string): { fundName: string; amount: number; date: string; type: string }[] => {
    const lines = text.trim().split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
      return {
        fundName: row['fund'] || row['fund_name'] || row['fundname'] || row['name'] || '',
        amount: parseFloat((row['amount'] || '0').replace(/[$,]/g, '')) || 0,
        date: row['date'] || row['event_date'] || '',
        type: row['type'] || row['event_type'] || 'UNKNOWN',
      };
    });
  };

  const handleUpload = async () => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) return;

    try {
      const result = await apiFetch('/reconciliation/upload-custodian', {
        method: 'POST',
        body: JSON.stringify({
          year: uploadYear,
          month: uploadMonth,
          rows,
          tolerancePercent: parseFloat(tolerance) || 1,
        }),
      });
      setUploadResult(result);
      fetchPeriods();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Monthly Reconciliation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Compare custodian statements against extracted data</p>
        </div>
        <button
          onClick={() => { setShowUpload(!showUpload); setUploadResult(null); }}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {showUpload ? 'Close' : 'Upload Custodian Data'}
        </button>
      </header>

      <div className="p-6 space-y-6">
        {showUpload && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="text-xs font-semibold text-foreground">Upload Custodian Statement</h2>
            <p className="text-xs text-muted-foreground">
              Paste CSV data with columns: fund (or fund_name), amount, date, type. The system will match against Portscope&apos;s capital events.
            </p>
            <div className="flex gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Year</label>
                <input type="number" value={uploadYear} onChange={(e) => setUploadYear(parseInt(e.target.value))} className="block mt-1 w-24 px-2 py-1.5 text-xs rounded border border-border bg-background" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Month</label>
                <select value={uploadMonth} onChange={(e) => setUploadMonth(parseInt(e.target.value))} className="block mt-1 px-2 py-1.5 text-xs rounded border border-border bg-background">
                  {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Tolerance %</label>
                <input type="number" value={tolerance} onChange={(e) => setTolerance(e.target.value)} className="block mt-1 w-20 px-2 py-1.5 text-xs rounded border border-border bg-background" step="0.5" min="0" />
              </div>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="fund,amount,date,type&#10;Acme Fund III,500000,2024-03-15,CALL&#10;Vista Partners,250000,2024-03-20,DISTRIBUTION"
              className="w-full h-32 px-3 py-2 text-xs rounded-md border border-border bg-background font-mono resize-none"
            />
            <button onClick={handleUpload} disabled={!csvText.trim()} className="px-4 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              Reconcile
            </button>

            {uploadResult && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <StatPill label="Matches" value={uploadResult.summary.matches} color="green" />
                  <StatPill label="Within Tolerance" value={uploadResult.summary.withinTolerance} color="blue" />
                  <StatPill label="Exceptions" value={uploadResult.summary.exceptions} color="red" />
                </div>
                <DiffTable diffs={uploadResult.diffs} />
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        ) : periods.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No reconciliation history</p>
            <p className="text-xs mt-1">Upload a custodian CSV to start reconciling.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">History</h2>
            <div className="space-y-2">
              {periods.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPeriod(selectedPeriod?.id === p.id ? null : p)}
                  className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {MONTHS[p.month - 1]} {p.year}
                    </span>
                    <ReconciliationStatus status={p.status} />
                  </div>
                  {p.reconciledAt && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Reconciled {new Date(p.reconciledAt).toLocaleDateString()}
                    </p>
                  )}
                  {selectedPeriod?.id === p.id && p.diffs && (
                    <div className="mt-3">
                      <DiffTable diffs={p.diffs as DiffItem[]} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DiffTable({ diffs }: { diffs: DiffItem[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="pb-2 font-medium">Fund</th>
          <th className="pb-2 font-medium">Field</th>
          <th className="pb-2 font-medium">Custodian</th>
          <th className="pb-2 font-medium">Portscope</th>
          <th className="pb-2 font-medium">Diff</th>
          <th className="pb-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {diffs.map((d, i) => (
          <tr key={i} className="border-b border-border/50">
            <td className="py-1.5 text-foreground">{d.fundName}</td>
            <td className="py-1.5 text-muted-foreground">{d.field}</td>
            <td className="py-1.5">{d.custodianValue}</td>
            <td className="py-1.5">{d.portscopeValue}</td>
            <td className="py-1.5">{d.difference}</td>
            <td className="py-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                d.status === 'MATCH' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                d.status === 'WITHIN_TOLERANCE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {d.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReconciliationStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    RECONCILED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    EXCEPTION: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const bg = color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const txt = color === 'green' ? 'text-green-800 dark:text-green-400' : color === 'blue' ? 'text-blue-800 dark:text-blue-400' : 'text-red-800 dark:text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${bg} ${txt}`}>
      {label}: {value}
    </span>
  );
}
