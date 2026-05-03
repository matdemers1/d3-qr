import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useBatchStore } from '../../store/batch';
import { generateQrPng, optionsFromConfig } from '../../lib/qr';
import { pdfFilename } from '../../lib/pdf-layout';

export function DownloadPdfButton() {
  const rows = useBatchStore((s) => s.rows);
  const config = useBatchStore((s) => s.config);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (rows.length === 0) return;
    setGenerating(true);
    setError(null);
    setProgress({ done: 0, total: rows.length });

    try {
      const opts = optionsFromConfig(config);
      const qrPngs: string[] = [];
      for (let i = 0; i < rows.length; i++) {
        qrPngs.push(await generateQrPng(rows[i].url, opts));
        setProgress({ done: i + 1, total: rows.length });
      }

      const { assemblePdf } = await import('../../lib/pdf');
      const bytes = await assemblePdf({
        rows,
        config,
        qrPngs,
        onProgress: (done, total) => setProgress({ done, total }),
      });

      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      saveAs(blob, pdfFilename());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF generation failed');
    } finally {
      setGenerating(false);
    }
  }

  const label = generating
    ? `Generating ${progress.done}/${progress.total}…`
    : `Download PDF (${rows.length} page${rows.length === 1 ? '' : 's'})`;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={rows.length === 0 || generating}
        className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
