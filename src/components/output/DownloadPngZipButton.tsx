import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useBatchStore } from '../../store/batch';
import { generateQrPng, optionsFromConfig } from '../../lib/qr';

async function dataUrlToUint8(dataUrl: string): Promise<Uint8Array> {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return arr;
}

export function DownloadPngZipButton() {
  const rows = useBatchStore((s) => s.rows);
  const config = useBatchStore((s) => s.config);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (rows.length === 0) return;
    setGenerating(true);
    setError(null);
    setProgress({ done: 0, total: rows.length });

    try {
      const opts = optionsFromConfig(config);
      const { buildZip, sanitizeFilename, uniqueFilenames, pngZipFilename } =
        await import('../../lib/zip');

      const bases = rows.map((row, idx) =>
        sanitizeFilename(row.label, row.url, idx),
      );
      const filenames = uniqueFilenames(bases, 'png');

      const entries: Array<{ name: string; content: Uint8Array }> = [];
      for (let i = 0; i < rows.length; i++) {
        const dataUrl = await generateQrPng(rows[i].url, opts);
        entries.push({
          name: filenames[i],
          content: await dataUrlToUint8(dataUrl),
        });
        setProgress({ done: i + 1, total: rows.length });
      }
      const blob = await buildZip(entries);
      saveAs(blob, pngZipFilename());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG ZIP failed');
    } finally {
      setGenerating(false);
    }
  }

  const label = generating
    ? `Generating ${progress.done}/${progress.total}…`
    : `Download all PNGs (${rows.length})`;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={rows.length === 0 || generating}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
