import Link from 'next/link';

interface Props {
  documentName: string;
  documentType: string;
  flaggedCount: number;
}

export function ReviewPageHeader({
  documentName,
  documentType,
  flaggedCount,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
      <div className="flex items-center gap-3">
        <Link
          href="/queue"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Queue
        </Link>
        <span className="text-xs text-muted-foreground/40">|</span>
        <span className="text-sm text-foreground">{documentName}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground font-mono">
          {documentType.replace(/_/g, ' ')}
        </span>
      </div>
      {flaggedCount > 0 && (
        <span className="text-xs bg-amber-500/10 text-amber-400 font-mono px-2 py-0.5 rounded">
          {flaggedCount} field{flaggedCount !== 1 ? 's' : ''} needs review
        </span>
      )}
    </div>
  );
}
