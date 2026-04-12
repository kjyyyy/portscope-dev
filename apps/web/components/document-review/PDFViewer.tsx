interface Props {
  documentName: string;
  presignedUrl?: string | null;
}

export function PDFViewer({ documentName, presignedUrl }: Props) {
  if (presignedUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            Original Document
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{documentName}</span>
        </div>
        <div className="flex-1">
          <iframe
            src={presignedUrl}
            className="w-full h-full border-0"
            title={documentName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
          Original Document
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-md p-6 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-30">
              <svg className="inline-block w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">{documentName}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PDF preview unavailable. Upload the document via the queue to enable viewing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
