'use client';

import Link from 'next/link';

interface Props {
  status: string;
  onApprove: () => void;
  onFlag?: () => void;
  loading?: boolean;
}

export function ReviewActions({ status, onApprove, onFlag, loading }: Props) {
  const isReview = status === 'REVIEW';
  const isDone = status === 'APPROVED' || status === 'AUTO_APPROVED' || status === 'REJECTED';

  if (isDone) {
    return (
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-card/50">
        <span className="text-xs text-muted-foreground">
          Status: <span className="font-mono text-foreground">{status}</span>
        </span>
        <Link
          href="/queue"
          className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          ← Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-card/50">
      <Link
        href="/queue"
        className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
      >
        Skip
      </Link>
      {onFlag && (
        <button
          onClick={onFlag}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          Flag issue
        </button>
      )}
      {isReview && (
        <button
          onClick={onApprove}
          disabled={loading}
          className="text-xs px-4 py-1.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : '✓ Approve & save'}
        </button>
      )}
    </div>
  );
}
