import { useState, type KeyboardEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import { normalizeUrl } from '../../lib/url';

const BULLET_RE = /^[\s\-*•·▪◦‣⁃→›»–—]+/;

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET_RE, '').trim())
    .filter((line) => line.length > 0);
}

export function MultiLinePaste() {
  const importRows = useBatchStore((s) => s.importRows);
  const [text, setText] = useState('');

  const candidates = splitLines(text);

  function handleAdd() {
    if (candidates.length === 0) return;
    importRows(candidates.map((line) => ({ url: normalizeUrl(line) })));
    setText('');
  }

  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="d3qr-multi" className="text-sm font-medium">
        Paste many URLs{' '}
        <span className="text-xs font-normal text-[var(--color-text-muted)]">
          (one per line)
        </span>
      </label>
      <textarea
        id="d3qr-multi"
        rows={4}
        spellCheck={false}
        placeholder={'example.com/one\nexample.com/two\nexample.com/three'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        className="resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 font-mono text-xs outline-none focus:border-[var(--color-accent)]"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">
          {candidates.length === 0
            ? '0 URLs'
            : `${candidates.length} URL${candidates.length === 1 ? '' : 's'} ready`}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={candidates.length === 0}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add {candidates.length || ''} to batch
        </button>
      </div>
    </div>
  );
}
