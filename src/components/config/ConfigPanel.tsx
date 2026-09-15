import { useRef, useState, type DragEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import type { ErrorCorrection, HeaderFooter, PageSize } from '../../types';
import { Alert, Button, Checkbox, FormField, Input, Select } from '@d3cloud/ui';
import { DropZone } from '../ui/DropZone';

const ECL_OPTIONS: { value: ErrorCorrection; label: string; help: string }[] = [
  {
    value: 'L',
    label: 'Low (~7%)',
    help: 'Smallest QR, less damage tolerance',
  },
  { value: 'M', label: 'Medium (~15%)', help: 'Default. Good balance' },
  { value: 'Q', label: 'Quartile (~25%)', help: 'More tolerance, larger code' },
  {
    value: 'H',
    label: 'High (~30%)',
    help: 'Most tolerance — required when a logo is embedded',
  },
];

const PAGE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'letter', label: 'Letter (8.5×11")' },
  { value: 'a4', label: 'A4' },
];

const HF_ACCEPTED = ['image/png', 'image/jpeg'];

function isAcceptedHfImage(file: File): boolean {
  if (file.type && HF_ACCEPTED.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')
  );
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
      setError(
        'PNG or JPEG only. SVGs cannot be embedded directly into the PDF.',
      );
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

  const title = position === 'header' ? 'Header' : 'Footer';
  const headingId = `d3qr-${position}-image`;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{title}</legend>
      <FormField label="Text" optional>
        <Input
          type="text"
          autoComplete="off"
          value={value?.text ?? ''}
          onChange={(e) => update({ text: e.target.value || undefined })}
        />
      </FormField>
      <p id={headingId} className="sr-only">
        {title} image
      </p>
      {value?.image ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-bg p-2">
          <img
            src={value.image.dataUrl}
            alt={`${title} image`}
            className="h-9 w-9 rounded border border-border object-contain"
          />
          <span className="flex-1 truncate text-xs">
            {value.image.filename}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => update({ image: undefined })}
          >
            Remove
          </Button>
        </div>
      ) : (
        <DropZone
          size="sm"
          active={false}
          labelledBy={headingId}
          onActivate={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          Drop or click to add a {position} image (PNG/JPEG)
        </DropZone>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => void pickImage(e.target.files?.[0])}
      />
      {error && (
        <Alert tone="danger" dynamic>
          {error}
        </Alert>
      )}
    </fieldset>
  );
}

export function ConfigPanel() {
  const config = useBatchStore((s) => s.config);
  const setConfig = useBatchStore((s) => s.setConfig);

  return (
    <section
      aria-labelledby="d3qr-config-heading"
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5"
    >
      <h2
        id="d3qr-config-heading"
        className="text-sm font-semibold tracking-wide text-fg-muted uppercase"
      >
        PDF config
      </h2>

      <FormField label="Page size">
        <Select
          value={config.pageSize}
          onValueChange={(v) => setConfig({ pageSize: v as PageSize })}
          options={PAGE_OPTIONS}
        />
      </FormField>

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

      <FormField label="On each page" as="group">
        <div className="flex flex-col gap-2">
          <Checkbox
            checked={config.showPageNumbers}
            onCheckedChange={(c) => setConfig({ showPageNumbers: c === true })}
            label="Page numbers"
          />
          <Checkbox
            checked={config.showUrlBelowQr}
            onCheckedChange={(c) => setConfig({ showUrlBelowQr: c === true })}
            label="Show URL below QR"
          />
        </div>
      </FormField>

      <div className="flex gap-3">
        {/* Native colour pickers: the system has no colour input, and the
            browser's own is the accessible one. */}
        <FormField label="Foreground">
          <input
            type="color"
            value={config.fgColor}
            onChange={(e) => setConfig({ fgColor: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-md border border-border-field bg-bg"
          />
        </FormField>
        <FormField label="Background">
          <input
            type="color"
            value={config.bgColor}
            onChange={(e) => setConfig({ bgColor: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-md border border-border-field bg-bg"
          />
        </FormField>
      </div>

      <FormField
        label="Error correction"
        help={
          config.logo
            ? 'Forced to High while a logo is embedded.'
            : (ECL_OPTIONS.find((o) => o.value === config.errorCorrection)
                ?.help ?? '')
        }
      >
        <Select
          value={config.errorCorrection}
          onValueChange={(v) =>
            setConfig({ errorCorrection: v as ErrorCorrection })
          }
          disabled={!!config.logo}
          options={ECL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </FormField>
    </section>
  );
}
