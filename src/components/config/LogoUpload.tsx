import { useRef, useState, type DragEvent } from 'react';
import { useBatchStore } from '../../store/batch';

const ACCEPTED = ['image/png', 'image/svg+xml'];

function isAcceptedFile(file: File): boolean {
  if (file.type && ACCEPTED.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return lower.endsWith('.png') || lower.endsWith('.svg');
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export function LogoUpload() {
  const logo = useBatchStore((s) => s.config.logo);
  const setConfig = useBatchStore((s) => s.setConfig);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!isAcceptedFile(file)) {
      setError('Logo must be a PNG or SVG. JPEGs do not have transparent backgrounds and break QR contrast.');
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      setConfig({ logo: { dataUrl, filename: file.name } });
    } catch {
      setError('Could not read that file. Try another one.');
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    void handleFile(file);
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

  function onRemove() {
    setConfig({ logo: undefined });
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Logo (optional)</label>
      {logo ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
          <img
            src={logo.dataUrl}
            alt="Logo preview"
            className="h-12 w-12 rounded border border-[var(--color-border)] bg-white object-contain p-1"
          />
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
            <span className="truncate text-sm">{logo.filename}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Error correction auto-bumped to H for scannability
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2 py-1 text-xs hover:bg-[var(--color-elevated)]"
          >
            Remove
          </button>
        </div>
      ) : (
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
            Drop a PNG or SVG here, or click to choose
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.svg,image/png,image/svg+xml"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
