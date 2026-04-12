'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface Bucket {
  label: string;
  nav: string;
  percent: number;
  holdingsCount: number;
}

interface Alert {
  dimension: string;
  label: string;
  percent: number;
  threshold: number;
}

interface ExposureData {
  totalNav: string;
  byStrategy: Bucket[];
  byGeography: Bucket[];
  byManager: Bucket[];
  byVintage: Bucket[];
  thresholds: Record<string, number>;
  alerts: Alert[];
}

const DIMENSIONS = ['STRATEGY', 'GEOGRAPHY', 'MANAGER', 'VINTAGE'] as const;

function fmtNav(val: string) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

export default function ExposurePage() {
  const [data, setData] = useState<ExposureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [thresholdValues, setThresholdValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFetch<ExposureData>('/exposure/summary');
      setData(result);
      const tv: Record<string, string> = {};
      DIMENSIONS.forEach((d) => {
        tv[d] = String(result.thresholds[d] ?? 30);
      });
      setThresholdValues(tv);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveThresholds = async () => {
    const thresholds = DIMENSIONS.map((d) => ({
      dimension: d,
      maxPercent: parseFloat(thresholdValues[d]) || 30,
    }));
    await apiFetch('/exposure/thresholds', {
      method: 'PUT',
      body: JSON.stringify({ thresholds }),
    });
    setEditingThresholds(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-sm font-semibold text-foreground">Exposure Analysis</h1>
        </header>
        <div className="p-6">
          <p className="text-sm text-muted-foreground animate-pulse">Loading exposure data...</p>
        </div>
      </div>
    );
  }

  if (!data || parseFloat(data.totalNav) === 0) {
    return (
      <div className="h-full overflow-auto">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-sm font-semibold text-foreground">Exposure Analysis</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Concentration risk monitoring</p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No portfolio data available</p>
          <p className="text-xs mt-1">Exposure analysis will populate once documents are approved and holdings are materialized.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Exposure Analysis</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Concentration risk by strategy, geography, manager, and vintage</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total NAV</p>
          <p className="text-lg font-bold text-foreground">{fmtNav(data.totalNav)}</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {data.alerts.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h2 className="text-xs font-semibold text-destructive mb-2">Concentration Alerts</h2>
            {data.alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-destructive mb-1">
                <span className="font-medium">{a.label}</span>
                <span>({a.dimension})</span>
                <span>at {a.percent.toFixed(1)}% exceeds {a.threshold}% threshold</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Thresholds</h2>
          {editingThresholds ? (
            <div className="flex gap-2">
              <button onClick={saveThresholds} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">Save</button>
              <button onClick={() => setEditingThresholds(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingThresholds(true)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground">
              Edit Thresholds
            </button>
          )}
        </div>

        {editingThresholds && (
          <div className="grid grid-cols-4 gap-3">
            {DIMENSIONS.map((d) => (
              <div key={d}>
                <label className="text-[10px] text-muted-foreground uppercase">{d}</label>
                <input
                  type="number"
                  value={thresholdValues[d]}
                  onChange={(e) => setThresholdValues((p) => ({ ...p, [d]: e.target.value }))}
                  className="w-full mt-1 px-2 py-1.5 text-xs rounded border border-border bg-background"
                  min={1}
                  max={100}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <ConcentrationChart title="By Strategy" data={data.byStrategy} threshold={data.thresholds.STRATEGY} />
          <ConcentrationChart title="By Geography" data={data.byGeography} threshold={data.thresholds.GEOGRAPHY} />
          <ConcentrationChart title="By Manager" data={data.byManager} threshold={data.thresholds.MANAGER} />
          <ConcentrationChart title="By Vintage Year" data={data.byVintage} threshold={data.thresholds.VINTAGE} />
        </div>
      </div>
    </div>
  );
}

function ConcentrationChart({ title, data, threshold }: { title: string; data: Bucket[]; threshold?: number }) {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold text-foreground mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data</p>
      ) : (
        <div className="space-y-2">
          {data.map((b, i) => {
            const overThreshold = threshold && b.percent > threshold;
            return (
              <div key={b.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${overThreshold ? 'text-destructive' : 'text-foreground'}`}>{b.label}</span>
                  <span className="text-muted-foreground">
                    {b.percent.toFixed(1)}% · {fmtNav(b.nav)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${overThreshold ? 'bg-destructive' : colors[i % colors.length]}`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                  {threshold && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-foreground/40"
                      style={{ left: `${Math.min(threshold, 100)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
