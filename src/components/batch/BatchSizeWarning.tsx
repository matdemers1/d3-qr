import { useState } from 'react';
import { useBatchStore } from '../../store/batch';

const THRESHOLD = 500;

export function BatchSizeWarning() {
  const rowCount = useBatchStore((s) => s.rows.length);
  const [dismissed, setDismissed] = useState(false);

  if (rowCount < THRESHOLD || dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_8%,var(--color-elevated))] px-3 py-2"
    >
      <span aria-hidden="true" className="mt-0.5 text-[var(--color-warning)]">
        ⚠
      </span>
      <p className="flex-1 text-sm text-[var(--color-text-primary)]">
        Large batches ({rowCount} rows) may slow your browser during generation.
        If you hit issues, consider splitting into smaller batches and merging
        the resulting PDFs.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss warning"
        className="rounded-sm px-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        ✕
      </button>
    </div>
  );
}
