import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { describeValidation, normalizeUrl, validateUrl } from '../../lib/url';
import { useBatchStore } from '../../store/batch';

interface Props {
  onPreviewChange: (url: string, label: string | undefined) => void;
}

export function SingleUrlInput({ onPreviewChange }: Props) {
  const addRow = useBatchStore((s) => s.addRow);
  const [rawUrl, setRawUrl] = useState('');
  const [label, setLabel] = useState('');
  const debouncedUrl = useDebounce(rawUrl, 200);
  const debouncedLabel = useDebounce(label, 200);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trimmed = debouncedUrl.trim();
    if (!trimmed) {
      onPreviewChange('', undefined);
      return;
    }
    onPreviewChange(normalizeUrl(trimmed), debouncedLabel.trim() || undefined);
  }, [debouncedUrl, debouncedLabel, onPreviewChange]);

  const validation = rawUrl.trim() ? validateUrl(rawUrl) : { valid: true as const };
  const validationMessage = describeValidation(validation);
  const canAdd = !!rawUrl.trim();

  function handleAdd() {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;
    addRow(normalizeUrl(trimmed), label.trim() || undefined);
    setRawUrl('');
    setLabel('');
    onPreviewChange('', undefined);
    inputRef.current?.focus();
  }

  function onKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="d3qr-url" className="text-sm font-medium">
          URL
        </label>
        <input
          ref={inputRef}
          id="d3qr-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="example.com or https://example.com/page"
          value={rawUrl}
          onChange={(e) => setRawUrl(e.target.value)}
          onKeyDown={onKey}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        {validationMessage && (
          <p className="text-xs text-[var(--color-warning)]">
            {validationMessage}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="d3qr-label" className="text-sm font-medium">
          Label{' '}
          <span className="text-xs font-normal text-[var(--color-text-muted)]">
            (optional)
          </span>
        </label>
        <input
          id="d3qr-label"
          type="text"
          autoComplete="off"
          placeholder="e.g., Conference badge"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={onKey}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to batch
        </button>
        <span className="text-xs text-[var(--color-text-muted)]">
          ⌘↵ to add
        </span>
      </div>
    </div>
  );
}
