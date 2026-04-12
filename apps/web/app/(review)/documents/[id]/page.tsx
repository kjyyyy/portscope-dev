'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { ExtractionFields } from '@/components/document-review/ExtractionFields';
import { ReviewActions } from '@/components/document-review/ReviewActions';
import { PDFViewer } from '@/components/document-review/PDFViewer';
import { ReviewPageHeader } from '@/components/document-review/ReviewPageHeader';
import { apiFetch } from '@/lib/api';
import type { ExtractedField } from '@portscope/shared';

interface DocumentData {
  id: string;
  fileName: string;
  type: string;
  status: string;
  extractedFields: ExtractedField[] | null;
  overallConfidence: number | null;
  flaggedFieldCount: number;
  presignedUrl: string | null;
  amount?: string | number | null;
  dueDate?: string | null;
  fund?: { name: string; manager?: string } | null;
  entity?: { name: string } | null;
}

export default function DocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<DocumentData>(`/documents/${id}`);
      setDoc(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (doc?.status !== 'PROCESSING') return;
    const interval = setInterval(loadDocument, 3000);
    return () => clearInterval(interval);
  }, [doc?.status, loadDocument]);

  const handleApprove = async () => {
    if (!doc) return;
    setActionLoading(true);
    try {
      await apiFetch(`/documents/${doc.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ corrections }),
      });
      setDoc((prev) => prev ? { ...prev, status: 'APPROVED' } : prev);
      setActionResult('Document approved successfully');
    } catch (err: any) {
      setActionResult(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    if (!doc) return;
    setActionLoading(true);
    try {
      await apiFetch(`/documents/${doc.id}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Flagged during manual review' }),
      });
      setDoc((prev) => prev ? { ...prev, status: 'REJECTED' } : prev);
      setActionResult('Document flagged');
    } catch (err: any) {
      setActionResult(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReExtract = async () => {
    if (!doc) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      await apiFetch(`/documents/${doc.id}/re-extract`, { method: 'POST' });
      setDoc((prev) => prev ? { ...prev, status: 'PROCESSING', extractedFields: null } : prev);
      setCorrections({});
      setActionResult('Re-extraction started — fields will appear shortly');
    } catch (err: any) {
      setActionResult(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading document...</div>
      </div>
    );
  }

  if (error && !doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">{error ?? 'Document not found'}</p>
          <a href="/queue" className="text-xs text-primary hover:underline">← Back to queue</a>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  const fields: ExtractedField[] = (doc.extractedFields ?? []).map((f: any) => ({
    key: f.key,
    label: f.label,
    value: f.value,
    confidence: f.confidence,
    fieldType: f.fieldType ?? f.field_type ?? 'text',
  }));

  const flaggedCount = fields.filter((f) => f.confidence < 0.85).length;
  const isProcessing = doc.status === 'PROCESSING';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ReviewPageHeader
        documentName={doc.fund?.name ?? doc.fileName}
        documentType={doc.type}
        flaggedCount={flaggedCount}
      />

      {actionResult && (
        <div className={cn(
          'px-4 py-2 text-xs border-b',
          actionResult.startsWith('Error')
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        )}>
          {actionResult}
          <button onClick={() => setActionResult(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-muted/20 border-r border-border overflow-hidden">
          <PDFViewer
            documentName={doc.fileName}
            presignedUrl={doc.presignedUrl}
          />
        </div>

        <div className="w-80 flex flex-col border-l border-border bg-background shrink-0">
          <div className="flex-1 overflow-auto p-4">
            {isProcessing ? (
              <div className="text-center py-8 space-y-3">
                <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Extracting fields from document...
                </p>
                <p className="text-xs text-muted-foreground/60">
                  This takes 10–30 seconds depending on document size
                </p>
              </div>
            ) : fields.length > 0 ? (
              <>
                <ExtractionFields
                  fields={fields}
                  corrections={corrections}
                  onCorrection={(key, value) =>
                    setCorrections((prev) => ({ ...prev, [key]: value }))
                  }
                />
                <button
                  onClick={handleReExtract}
                  disabled={actionLoading}
                  className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-md hover:border-primary/30 transition-colors disabled:opacity-50"
                >
                  ↻ Re-extract fields
                </button>
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-muted-foreground">No extracted fields</p>
                <p className="text-xs text-muted-foreground/60">
                  The extraction may have failed or the document type was not recognized.
                </p>
                <button
                  onClick={handleReExtract}
                  disabled={actionLoading}
                  className="text-xs px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Starting...' : '↻ Try extraction again'}
                </button>
              </div>
            )}
          </div>
          <ReviewActions
            status={doc.status}
            onApprove={handleApprove}
            onFlag={handleFlag}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
