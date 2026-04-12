'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorType: string;
  before: any;
  after: any;
  metadata: any;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  DOCUMENT_UPLOADED: 'Document Uploaded',
  DOCUMENT_APPROVED: 'Document Approved',
  DOCUMENT_REJECTED: 'Document Rejected',
  DOCUMENT_RE_EXTRACTED: 'Re-extraction Started',
  DOCUMENT_FLAGGED: 'Document Flagged',
  FIELD_CORRECTED: 'Field Corrected',
  CAPITAL_EVENT_CREATED: 'Capital Event Created',
  WIRE_MARKED: 'Wire Marked as Sent',
  WIRE_CONFIRMED: 'Wire Confirmed',
  REPORT_GENERATED: 'Report Generated',
  REPORT_APPROVED: 'Report Approved',
  REPORT_DELIVERED: 'Report Delivered',
  RECONCILIATION_COMPLETED: 'Reconciliation Completed',
  THRESHOLD_UPDATED: 'Threshold Updated',
  INTEGRATION_CONNECTED: 'Integration Connected',
  INTEGRATION_DISCONNECTED: 'Integration Disconnected',
  TAX_PACKAGE_RECEIVED: 'Tax Package Received',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityTypeFilter) params.set('entityType', entityTypeFilter);
      if (actionFilter) params.set('action', actionFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      params.set('limit', '50');

      const result = await apiFetch<{ items: AuditLogItem[]; total: number }>(`/audit/log?${params}`);
      setLogs(result.items);
      setTotal(result.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [entityTypeFilter, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const entityTypes = ['Document', 'CapitalEvent', 'ExposureThreshold', 'ReconciliationPeriod', 'TaxPackage'];
  const actions = Object.keys(ACTION_LABELS);

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-sm font-semibold text-foreground">Audit Trail</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Complete log of all system and user actions</p>
      </header>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground"
          >
            <option value="">All Entity Types</option>
            {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground"
          >
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-border bg-background text-foreground w-[130px]"
            />
            <span>—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-border bg-background text-foreground w-[130px]"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{total} event{total !== 1 ? 's' : ''}</p>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading audit trail...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No audit events found</p>
            <p className="text-xs mt-1">Events will appear here as actions are performed in the system.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <ActionIcon action={log.action} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {log.entityType} · {log.actorType === 'USER' ? 'User' : 'System'}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 bg-muted/10 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">Entity ID</p>
                          <p className="text-xs font-mono text-foreground break-all">{log.entityId}</p>
                        </div>
                        {log.actorId && (
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium mb-1">Actor ID</p>
                            <p className="text-xs font-mono text-foreground break-all">{log.actorId}</p>
                          </div>
                        )}
                      </div>

                      {log.before && (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">Before</p>
                          <pre className="text-[10px] font-mono bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.before, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.after && (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">After</p>
                          <pre className="text-[10px] font-mono bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.after, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.metadata && (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">Metadata</p>
                          <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionIcon({ action }: { action: string }) {
  const iconMap: Record<string, string> = {
    DOCUMENT_UPLOADED: '📄',
    DOCUMENT_APPROVED: '✅',
    DOCUMENT_REJECTED: '❌',
    DOCUMENT_RE_EXTRACTED: '🔄',
    WIRE_MARKED: '💸',
    WIRE_CONFIRMED: '✓',
    RECONCILIATION_COMPLETED: '⚖️',
    THRESHOLD_UPDATED: '📊',
    TAX_PACKAGE_RECEIVED: '📋',
    INTEGRATION_CONNECTED: '🔗',
    INTEGRATION_DISCONNECTED: '🔌',
  };

  return (
    <span className="text-sm shrink-0 w-6 text-center">{iconMap[action] ?? '•'}</span>
  );
}
