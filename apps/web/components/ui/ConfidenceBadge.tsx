import { cn } from '@/lib/utils';

interface Props {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ConfidenceBadge({
  confidence,
  showLabel = false,
  size = 'sm',
}: Props) {
  const pct = Math.round(confidence * 100);
  const { bg, text, icon, label } = getLevel(confidence);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded font-mono',
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        bg,
        text,
      )}
    >
      {icon && <span>{icon}</span>}
      {pct}%
      {showLabel && (
        <span className="ml-1 font-sans opacity-75">{label}</span>
      )}
    </span>
  );
}

function getLevel(confidence: number) {
  if (confidence >= 0.95)
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: null,
      label: 'High',
    };
  if (confidence >= 0.85)
    return {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      icon: null,
      label: 'Good',
    };
  if (confidence >= 0.7)
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: '⚠',
      label: 'Review',
    };
  return {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: '✕',
    label: 'Must verify',
  };
}
