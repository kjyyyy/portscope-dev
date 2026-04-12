interface Props {
  title: string;
  quarterLabel: string;
}

export function ReportDownloadCard({ title, quarterLabel }: Props) {
  return (
    <div className="bg-card rounded-lg p-5 flex items-center justify-between border border-border">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Latest Report</p>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <button className="text-xs bg-primary text-primary-foreground font-bold px-4 py-2 rounded hover:bg-primary/90 transition-colors">
        ↓ PDF
      </button>
    </div>
  );
}
