'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ForecastMonth {
  month: string;
  estimatedCalls: string;
  confirmedCalls: string;
  estimatedDistributions: string;
  netCashFlow: string;
}

interface Summary {
  totalCommitment: string;
  totalCalled: string;
  totalUnfunded: string;
  holdingsCount: number;
  pendingCallsCount: number;
}

interface ForecastData {
  forecast: ForecastMonth[];
  summary: Summary;
}

function fmtM(val: string) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function fmtMonthLabel(m: string) {
  const [year, month] = m.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    setLoading(true);
    apiFetch<ForecastData>(`/forecast/cashflow?months=${months}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-sm font-semibold text-foreground">Commitment Tracker</h1>
        </header>
        <div className="p-6"><p className="text-sm text-muted-foreground animate-pulse">Loading forecast...</p></div>
      </div>
    );
  }

  if (!data || data.summary.holdingsCount === 0) {
    return (
      <div className="h-full overflow-auto">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-sm font-semibold text-foreground">Commitment Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Cash flow forecasting</p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No holdings data available</p>
          <p className="text-xs mt-1">Forecast will populate once documents are processed and holdings are created.</p>
        </div>
      </div>
    );
  }

  const { summary, forecast } = data;
  const maxBar = Math.max(...forecast.map((f) => Math.max(
    parseFloat(f.confirmedCalls) + parseFloat(f.estimatedCalls),
    parseFloat(f.estimatedDistributions),
  )), 1);

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Commitment Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Cash flow forecast based on unfunded commitments</p>
        </div>
        <select
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
          className="px-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
        >
          <option value={6}>6 months</option>
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
        </select>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total Commitment" value={fmtM(summary.totalCommitment)} />
          <SummaryCard label="Called to Date" value={fmtM(summary.totalCalled)} />
          <SummaryCard label="Unfunded" value={fmtM(summary.totalUnfunded)} accent />
          <SummaryCard label="Pending Calls" value={String(summary.pendingCallsCount)} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-xs font-semibold text-foreground mb-4">Monthly Cash Flow Projection</h2>
          <div className="space-y-1">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-500 inline-block" /> Confirmed Calls</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-300 inline-block" /> Estimated Calls</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-500 inline-block" /> Estimated Distributions</span>
            </div>
            {forecast.map((f) => {
              const confirmed = parseFloat(f.confirmedCalls);
              const estimated = parseFloat(f.estimatedCalls);
              const dist = parseFloat(f.estimatedDistributions);
              const net = parseFloat(f.netCashFlow);
              return (
                <div key={f.month} className="flex items-center gap-3 group">
                  <span className="w-12 text-[10px] text-muted-foreground shrink-0">{fmtMonthLabel(f.month)}</span>
                  <div className="flex-1 flex items-center gap-1 h-5">
                    {confirmed > 0 && (
                      <div className="h-full bg-red-500 rounded-sm" style={{ width: `${(confirmed / maxBar) * 100}%` }} title={`Confirmed: ${fmtM(f.confirmedCalls)}`} />
                    )}
                    {estimated > 0 && (
                      <div className="h-full bg-red-300 rounded-sm" style={{ width: `${(estimated / maxBar) * 100}%` }} title={`Estimated: ${fmtM(f.estimatedCalls)}`} />
                    )}
                    {dist > 0 && (
                      <div className="h-full bg-green-500 rounded-sm" style={{ width: `${(dist / maxBar) * 100}%` }} title={`Distributions: ${fmtM(f.estimatedDistributions)}`} />
                    )}
                  </div>
                  <span className={`w-16 text-right text-[10px] font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {net >= 0 ? '+' : ''}{fmtM(f.netCashFlow)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Month</th>
                <th className="px-4 py-2 font-medium text-right">Confirmed Calls</th>
                <th className="px-4 py-2 font-medium text-right">Estimated Calls</th>
                <th className="px-4 py-2 font-medium text-right">Est. Distributions</th>
                <th className="px-4 py-2 font-medium text-right">Net Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f) => {
                const net = parseFloat(f.netCashFlow);
                return (
                  <tr key={f.month} className="border-t border-border/50">
                    <td className="px-4 py-2 text-foreground">{fmtMonthLabel(f.month)}</td>
                    <td className="px-4 py-2 text-right text-red-600">{parseFloat(f.confirmedCalls) > 0 ? fmtM(f.confirmedCalls) : '—'}</td>
                    <td className="px-4 py-2 text-right text-red-400">{parseFloat(f.estimatedCalls) > 0 ? fmtM(f.estimatedCalls) : '—'}</td>
                    <td className="px-4 py-2 text-right text-green-600">{parseFloat(f.estimatedDistributions) > 0 ? fmtM(f.estimatedDistributions) : '—'}</td>
                    <td className={`px-4 py-2 text-right font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {net >= 0 ? '+' : ''}{fmtM(f.netCashFlow)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
