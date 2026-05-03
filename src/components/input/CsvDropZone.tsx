import { useRef, useState, type DragEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import { parseCsvFile } from '../../lib/csv';

function isCsvFile(file: File): boolean {
  if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
    return true;
  }
  return file.name.toLowerCase().endsWith('.csv');
}

export function CsvDropZone() {
  const importRows = useBatchStore((s) => s.importRows);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<{
    rows: number;
    warnings: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    setError(null);
    setStatus(null);
    if (!file) return;
    if (!isCsvFile(file)) {
      setError('That file does not look like a CSV. Drop a .csv file or use the picker.');
      return;
    }
    try {
      const result = await parseCsvFile(file);
      if (result.rows.length === 0) {
        setError('No URLs found in that CSV.');
        return;
      }
      importRows(result.rows);
      setStatus({ rows: result.rows.length, warnings: result.warnings });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not parse that CSV file.',
      );
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onClickPick() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Drop a CSV</label>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onClickPick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClickPick();
          }
        }}
        className={`cursor-pointer rounded-md border-2 border-dashed p-4 text-center text-sm transition ${
          isDragOver
            ? 'border-[var(--color-accent)] bg-[var(--color-elevated)]'
            : 'border-[var(--color-border)] bg-[var(--color-elevated)]/50 hover:border-[var(--color-accent)]'
        }`}
      >
        <p className="text-[var(--color-text-muted)]">
          Drop a .csv here, or click to choose
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          First column = URL, second column (optional) = label
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {status && (
        <p className="text-xs text-[var(--color-success)]">
          Imported {status.rows} URL{status.rows === 1 ? '' : 's'}
          {status.warnings.length > 0
            ? ` (${status.warnings.length} warning${status.warnings.length === 1 ? '' : 's'})`
            : ''}
        </p>
      )}
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
