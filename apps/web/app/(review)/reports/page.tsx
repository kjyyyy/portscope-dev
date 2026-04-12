'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface DocumentItem {
  id: string;
  fileName: string;
  type: string;
  status: string;
  extractedFields: any[] | null;
  overallConfidence: number | null;
  processedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  fund?: { name: string } | null;
  entity?: { name: string } | null;
}

interface ReportItem {
  id: string;
  title: string;
  quarterLabel: string;
  status: string;
  generatedAt: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'documents' | 'reports'>('documents');

  useEffect(() => {
    async function load() {
      try {
        const [queue, reps] = await Promise.all([
          apiFetch<{ items: DocumentItem[] }>('/documents/queue'),
          apiFetch<ReportItem[]>('/reporting/reports'),
        ]);
        setDocuments(queue.items);
        setReports(reps);
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
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">{error}</p>
        </div>
      </div>
    );
  }

  const approved = documents.filter((d) => d.status === 'APPROVED');
  const processed = documents.filter((d) => ['APPROVED', 'AUTO_APPROVED', 'REVIEW'].includes(d.status));

  return (
    <div className="h-full overflow-auto">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-sm font-semibold text-foreground">Reports & Processed Documents</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track document processing outcomes and generated reports</p>
      </header>

      <div className="px-6 pt-4">
        <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 w-fit mb-4">
          <button
            onClick={() => setTab('documents')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              tab === 'documents' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Processed Documents ({processed.length})
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              tab === 'reports' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Generated Reports ({reports.length})
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {tab === 'documents' ? (
          processed.length === 0 ? (
            <EmptyState
              title="No processed documents"
              description="Upload and process documents in the review queue. Once extracted, they'll appear here with their data."
            />
          ) : (
            <DocumentsTable documents={processed} />
          )
        ) : (
          reports.length === 0 ? (
            <EmptyState
              title="No reports generated"
              description="Reports are automatically generated from approved documents. Approve documents in the review queue to start generating quarterly reports."
            />
          ) : (
            <ReportsTable reports={reports} />
          )
        )}
      </div>

      {tab === 'documents' && approved.length > 0 && (
        <div className="px-6 pb-6">
          <ExtractionSummary documents={approved} />
        </div>
      )}
    </div>
  );
}

function DocumentsTable({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Document</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Confidence</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Fields</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fund</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Processed</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/documents/${doc.id}`} className="text-primary hover:underline font-medium">
                    {doc.fileName}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    {doc.type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {doc.overallConfidence != null ? (
                    <span className={doc.overallConfidence >= 0.85 ? 'text-emerald-500' : doc.overallConfidence >= 0.6 ? 'text-amber-500' : 'text-destructive'}>
                      {(doc.overallConfidence * 100).toFixed(0)}%
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                  {doc.extractedFields?.length ?? 0}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{doc.fund?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {doc.processedAt ? new Date(doc.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTable({ reports }: { reports: ReportItem[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/10">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Report</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Quarter</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{r.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.quarterLabel}</td>
                <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExtractionSummary({ documents }: { documents: DocumentItem[] }) {
  const allFields: Record<string, { count: number; examples: string[] }> = {};

  for (const doc of documents) {
    for (const f of doc.extractedFields ?? []) {
      if (!allFields[f.label]) allFields[f.label] = { count: 0, examples: [] };
      allFields[f.label].count++;
      if (allFields[f.label].examples.length < 3 && f.value) {
        allFields[f.label].examples.push(f.value);
      }
    }
  }

  const sorted = Object.entries(allFields).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Extraction Summary</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Aggregated fields across {documents.length} approved document{documents.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="divide-y divide-border/50 max-h-64 overflow-auto">
        {sorted.map(([label, data]) => (
          <div key={label} className="px-4 py-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-foreground">{label}</span>
              <span className="text-[10px] text-muted-foreground ml-2">× {data.count}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
              {data.examples[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    AUTO_APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    REVIEW: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    DRAFT: 'bg-muted text-muted-foreground border-border',
    DELIVERED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
    ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${styles[status] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto mb-4">{description}</p>
      <Link href="/queue" className="text-xs text-primary hover:underline">
        Go to Review Queue →
      </Link>
    </div>
  );
}
