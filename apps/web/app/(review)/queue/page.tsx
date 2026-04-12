'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { apiFetch, apiUpload } from '@/lib/api';
import { IntegrationsPanel } from '@/components/document-review/IntegrationsPanel';

type DocumentStatus = 'PROCESSING' | 'REVIEW' | 'AUTO_APPROVED' | 'APPROVED' | 'REJECTED' | 'ERROR';

interface QueueItem {
  id: string;
  fileName: string;
  type: string;
  status: DocumentStatus;
  amount?: number | string | null;
  dueDate?: string | null;
  overallConfidence?: number | null;
  flaggedFieldCount: number;
  createdAt: string;
  fund?: { name: string; manager?: string } | null;
  entity?: { name: string } | null;
}

interface QueueResponse {
  items: QueueItem[];
  pending: number;
}

export default function ReviewQueuePage() {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<QueueResponse>('/documents/queue');
      setData(res);
      if (!selectedId && res.items.length > 0) {
        setSelectedId(res.items[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10_000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiUpload('/documents/upload', formData);
      await fetchQueue();
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const items = data?.items ?? [];
  const pendingCount = data?.pending ?? 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground">
          Review Queue
          <span className="ml-2 text-muted-foreground font-normal">
            — {pendingCount} pending
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <label className={cn(
            'text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors',
            'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30',
            uploading && 'opacity-50 pointer-events-none',
          )}>
            {uploading ? 'Uploading...' : '+ Upload Document'}
            <input
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <button
            onClick={() => setIntegrationsOpen(true)}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors bg-card text-foreground hover:bg-muted border border-border"
          >
            ⚡ Integrations
          </button>
          <button
            onClick={fetchQueue}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 px-3 py-2 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground animate-pulse">Loading review queue...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">No documents in queue</p>
            <p className="text-muted-foreground/60 text-xs">Upload a PDF to get started</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/documents/${item.id}`}
              onClick={() => setSelectedId(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-md border transition-colors',
                selectedId === item.id
                  ? 'bg-card border-primary/40'
                  : 'border-transparent hover:bg-card hover:border-border',
              )}
            >
              <DocTypeIcon type={item.type} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {item.fund?.name ?? item.fileName}
                  {item.type !== 'UNKNOWN' && ` — ${item.type.replace(/_/g, ' ')}`}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.entity?.name && <span>{item.entity.name} · </span>}
                  {item.amount && <span>{formatAmount(item.amount)} · </span>}
                  {item.dueDate && <span>{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · </span>}
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <StatusBadge status={item.status} flaggedCount={item.flaggedFieldCount} />
            </Link>
          ))}
        </div>
      )}

      <IntegrationsPanel
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
        onImported={fetchQueue}
      />
    </div>
  );
}

function formatAmount(amount: number | string | null | undefined): string {
  if (!amount) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function DocTypeIcon({ type }: { type: string }) {
  const styles: Record<string, string> = {
    CAPITAL_CALL: 'bg-amber-500/10 text-amber-400',
    DISTRIBUTION: 'bg-emerald-500/10 text-emerald-400',
    NAV_STATEMENT: 'bg-blue-500/10 text-blue-400',
    K1: 'bg-purple-500/10 text-purple-400',
    FUND_REPORT: 'bg-cyan-500/10 text-cyan-400',
  };
  const icons: Record<string, string> = {
    CAPITAL_CALL: 'CC',
    DISTRIBUTION: 'DI',
    NAV_STATEMENT: 'NV',
    K1: 'K1',
    FUND_REPORT: 'FR',
    UNKNOWN: '?',
    PROCESSING: '...',
  };

  return (
    <div className={cn('w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold shrink-0', styles[type] ?? 'bg-muted text-muted-foreground')}>
      {icons[type] ?? '??'}
    </div>
  );
}

function StatusBadge({ status, flaggedCount }: { status: DocumentStatus; flaggedCount: number }) {
  if (status === 'PROCESSING') {
    return <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 shrink-0 animate-pulse">Processing</span>;
  }
  if (status === 'AUTO_APPROVED') {
    return <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0">Auto ✓</span>;
  }
  if (status === 'APPROVED') {
    return <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0">Approved</span>;
  }
  if (status === 'ERROR') {
    return <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 shrink-0">Error</span>;
  }
  if (status === 'REJECTED') {
    return <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 shrink-0">Flagged</span>;
  }
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
      Review{flaggedCount > 0 && ` (${flaggedCount})`}
    </span>
  );
}
