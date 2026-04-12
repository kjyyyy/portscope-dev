interface Props {
  label: string;
  value: string;
  urgent?: boolean;
}

export function StatCard({ label, value, urgent }: Props) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={urgent ? 'font-mono text-amber-400' : 'font-mono text-foreground'}>
        {value}
      </p>
    </div>
  );
}
