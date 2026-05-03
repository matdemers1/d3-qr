import { useEffect, useRef, useState } from 'react';
import { useBatchStore } from '../../store/batch';
import { renderPagePreview } from '../../lib/pdf-preview';
import { useDebounce } from '../../hooks/useDebounce';

export function PdfPreview() {
  const rows = useBatchStore((s) => s.rows);
  const config = useBatchStore((s) => s.config);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const firstRow = rows[0];
  const debouncedConfig = useDebounce(config, 200);

  useEffect(() => {
    if (!firstRow || !canvasRef.current) return;
    let cancelled = false;
    setError(null);
    renderPagePreview(canvasRef.current, firstRow, debouncedConfig).catch(
      (err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Preview failed');
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [firstRow, debouncedConfig]);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        PDF preview
      </h2>
      <div className="flex flex-col items-center gap-2">
        {firstRow ? (
          <>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`PDF preview of row 1: ${firstRow.url}`}
              className="rounded-md shadow-sm ring-1 ring-[var(--color-border)]"
              style={{ maxWidth: '100%' }}
            />
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              First page of {rows.length} — preview is a fast approximation; final PDF uses Helvetica.
            </p>
          </>
        ) : (
          <div className="flex aspect-[8.5/11] w-full max-w-[240px] items-center justify-center rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)] p-4 text-center text-xs text-[var(--color-text-muted)]">
            Add a URL to see the PDF page preview
          </div>
        )}
        {error && (
          <p className="text-xs text-[var(--color-error)]">{error}</p>
        )}
      </div>
    </div>
  );
}
