import { useRef, useState, type DragEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import { Alert, Button } from '@d3cloud/ui';
import { DropZone } from '../ui/DropZone';

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
      setError(
        'Logo must be a PNG or SVG. JPEGs do not have transparent backgrounds and break QR contrast.',
      );
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
      <p id="d3qr-logo-heading" className="text-sm font-medium">
        Logo <span className="font-normal text-fg-muted">(optional)</span>
      </p>
      {logo ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-bg p-3">
          {/* White behind the logo, as it will sit on the QR code. */}
          <img
            src={logo.dataUrl}
            alt="Logo preview"
            className="h-12 w-12 rounded border border-border bg-white object-contain p-1"
          />
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
            <span className="truncate text-sm">{logo.filename}</span>
            <span className="text-xs text-fg-muted">
              Error correction auto-bumped to H for scannability
            </span>
          </div>
          <Button size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      ) : (
        <DropZone
          active={isDragOver}
          labelledBy="d3qr-logo-heading"
          onActivate={onClickPick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <p className="text-fg-muted">
            Drop a PNG or SVG here, or click to choose
          </p>
        </DropZone>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.svg,image/png,image/svg+xml"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && (
        <Alert tone="danger" dynamic>
          {error}
        </Alert>
      )}
    </div>
  );
}
