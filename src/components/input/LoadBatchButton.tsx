import { useRef, useState } from 'react';
import { useBatchStore } from '../../store/batch';
import { BatchFormatError, deserializeBatch } from '../../lib/batch';

export function LoadBatchButton() {
  const loadBatch = useBatchStore((s) => s.loadBatch);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick() {
    inputRef.current?.click();
  }

  async function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    try {
      const text = await file.text();
      const batch = deserializeBatch(text);
      loadBatch(batch);
    } catch (err) {
      if (err instanceof BatchFormatError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Could not load batch.');
      }
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onPick}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm hover:bg-[var(--color-canvas)]"
      >
        Load batch (JSON)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
