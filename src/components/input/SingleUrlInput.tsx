import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { describeValidation, normalizeUrl, validateUrl } from '../../lib/url';
import { useBatchStore } from '../../store/batch';
import { Button, FormField, Input } from '@d3cloud/ui';

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

  const validation = rawUrl.trim()
    ? validateUrl(rawUrl)
    : { valid: true as const };
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
      {/* A format example, not a label, and never an error: an address the
          validator doubts can still be added, so the note is help text. */}
      <FormField label="URL" help={validationMessage ?? undefined}>
        <Input
          ref={inputRef}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="example.com or https://example.com/page"
          value={rawUrl}
          onChange={(e) => setRawUrl(e.target.value)}
          onKeyDown={onKey}
        />
      </FormField>
      <FormField label="Label" optional>
        <Input
          type="text"
          autoComplete="off"
          placeholder="e.g., Conference badge"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={onKey}
        />
      </FormField>
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={handleAdd} disabled={!canAdd}>
          Add to batch
        </Button>
        <span className="text-xs text-fg-muted">⌘↵ to add</span>
      </div>
    </div>
  );
}
