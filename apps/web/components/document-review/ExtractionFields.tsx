'use client';

import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { cn } from '@/lib/utils';
import type { ExtractedField } from '@portscope/shared';

interface Props {
  fields: ExtractedField[];
  corrections: Record<string, string>;
  onCorrection: (key: string, value: string) => void;
}

export function ExtractionFields({ fields, corrections, onCorrection }: Props) {
  const flaggedCount = fields.filter((f) => f.confidence < 0.85).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Extracted Fields
        </h3>
        {flaggedCount > 0 && (
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-sm font-mono">
            ⚠ {flaggedCount} {flaggedCount === 1 ? 'field' : 'fields'} flagged
          </span>
        )}
      </div>

      {fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          editedValue={corrections[field.key]}
          onEdit={(val) => onCorrection(field.key, val)}
        />
      ))}
    </div>
  );
}

function FieldRow({
  field,
  editedValue,
  onEdit,
}: {
  field: ExtractedField;
  editedValue?: string;
  onEdit: (val: string) => void;
}) {
  const isEdited =
    editedValue !== undefined && editedValue !== field.value;
  const needsReview = field.confidence < 0.85;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
          {field.label}
        </label>
        <ConfidenceBadge confidence={field.confidence} />
      </div>
      <input
        type="text"
        value={editedValue ?? field.value}
        onChange={(e) => onEdit(e.target.value)}
        className={cn(
          'w-full text-sm font-mono h-8 px-2 rounded-md border bg-card text-foreground outline-none transition-colors',
          'focus:ring-1 focus:ring-primary/50',
          needsReview && !isEdited && 'border-amber-500/40 bg-amber-500/5',
          isEdited && 'border-emerald-500/40 bg-emerald-500/5',
          !needsReview && !isEdited && 'border-border',
        )}
      />
    </div>
  );
}
