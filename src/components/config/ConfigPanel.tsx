import { useRef, useState, type DragEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import type {
  ErrorCorrection,
  HeaderFooter,
  PageSize,
} from '../../types';

const ECL_OPTIONS: { value: ErrorCorrection; label: string; help: string }[] = [
  { value: 'L', label: 'Low (~7%)', help: 'Smallest QR, less damage tolerance' },
  { value: 'M', label: 'Medium (~15%)', help: 'Default. Good balance' },
  { value: 'Q', label: 'Quartile (~25%)', help: 'More tolerance, larger code' },
  { value: 'H', label: 'High (~30%)', help: 'Most tolerance — required when a logo is embedded' },
];

const PAGE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'letter', label: 'Letter (8.5×11")' },
  { value: 'a4', label: 'A4' },
];

const HF_ACCEPTED = ['image/png', 'image/jpeg'];

function isAcceptedHfImage(file: File): boolean {
  if (file.type && HF_ACCEPTED.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg');
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

interface HfFieldProps {
  position: 'header' | 'footer';
  value: HeaderFooter | undefined;
  onChange: (next: HeaderFooter | undefined) => void;
}

function HeaderFooterField({ position, value, onChange }: HfFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<HeaderFooter>) {
    const merged: HeaderFooter = {
      text: value?.text,
      image: value?.image,
      ...patch,
    };
    if (!merged.text && !merged.image) {
      onChange(undefined);
    } else {
      onChange(merged);
    }
  }

  async function pickImage(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!isAcceptedHfImage(file)) {
      setError('PNG or JPEG only. SVGs cannot be embedded directly into the PDF.');
      return;
    }
    try {
      const dataUrl = await readDataUrl(file);
      update({ image: { dataUrl, filename: file.name } });
    } catch {
      setError('Could not read that image.');
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void pickImage(event.dataTransfer.files[0]);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`d3qr-${position}-text`}
        className="text-sm font-medium capitalize"
      >
        {position}
      </label>
      <input
        id={`d3qr-${position}-text`}
        type="text"
        autoComplete="off"
        placeholder={`${position === 'header' ? 'Top' : 'Bottom'} text (optional)`}
        value={value?.text ?? ''}
        onChange={(e) => update({ text: e.target.value || undefined })}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      {value?.image ? (
        <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] p-2">
          <img
            src={value.image.dataUrl}
            alt={`${position} image`}
            className="h-9 w-9 rounded border border-[var(--color-border)] object-contain"
          />
          <span className="flex-1 truncate text-xs">{value.image.filename}</span>
          <button
            type="button"
            onClick={() => update({ image: undefined })}
            className="rounded-sm px-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className="cursor-pointer rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-elevated)]/50 px-2.5 py-2 text-center text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
        >
          Drop or click to add a {position} image (PNG/JPEG)
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => void pickImage(e.target.files?.[0])}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

export function ConfigPanel() {
  const config = useBatchStore((s) => s.config);
  const setConfig = useBatchStore((s) => s.setConfig);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        PDF config
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="d3qr-page" className="text-sm font-medium">
          Page size
        </label>
        <select
          id="d3qr-page"
          value={config.pageSize}
          onChange={(e) => setConfig({ pageSize: e.target.value as PageSize })}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
        >
          {PAGE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <HeaderFooterField
        position="header"
        value={config.header}
        onChange={(next) => setConfig({ header: next })}
      />
      <HeaderFooterField
        position="footer"
        value={config.footer}
        onChange={(next) => setConfig({ footer: next })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Toggles</label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.showPageNumbers}
            onChange={(e) => setConfig({ showPageNumbers: e.target.checked })}
          />
          Page numbers
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.showUrlBelowQr}
            onChange={(e) => setConfig({ showUrlBelowQr: e.target.checked })}
          />
          Show URL below QR
        </label>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d3qr-fg" className="text-sm font-medium">
            Foreground
          </label>
          <input
            id="d3qr-fg"
            type="color"
            value={config.fgColor}
            onChange={(e) => setConfig({ fgColor: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d3qr-bg" className="text-sm font-medium">
            Background
          </label>
          <input
            id="d3qr-bg"
            type="color"
            value={config.bgColor}
            onChange={(e) => setConfig({ bgColor: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="d3qr-ecl" className="text-sm font-medium">
          Error correction
        </label>
        <select
          id="d3qr-ecl"
          value={config.errorCorrection}
          onChange={(e) =>
            setConfig({ errorCorrection: e.target.value as ErrorCorrection })
          }
          disabled={!!config.logo}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
        >
          {ECL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--color-text-muted)]">
          {config.logo
            ? 'Forced to High while a logo is embedded.'
            : (ECL_OPTIONS.find((o) => o.value === config.errorCorrection)?.help ?? '')}
        </p>
      </div>
    </div>
  );
}
