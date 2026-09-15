import { useState, type KeyboardEvent } from 'react';
import { useBatchStore } from '../../store/batch';
import { normalizeUrl } from '../../lib/url';
import { Button, FormField, Textarea } from '@d3cloud/ui';

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
      <FormField
        label="Paste many URLs"
        help="One per line. Bullets and dashes are stripped."
      >
        <Textarea
          rows={4}
          spellCheck={false}
          placeholder={'example.com/one\nexample.com/two\nexample.com/three'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          className="font-mono"
        />
      </FormField>
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-muted" aria-live="polite">
          {candidates.length === 0
            ? 'No URLs yet'
            : `${candidates.length} URL${candidates.length === 1 ? '' : 's'} ready`}
        </span>
        <Button onClick={handleAdd} disabled={candidates.length === 0}>
          {candidates.length > 0
            ? `Add ${candidates.length} to batch`
            : 'Add to batch'}
        </Button>
      </div>
    </div>
  );
}
