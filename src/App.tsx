import { useCallback, useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SingleUrlInput } from './components/input/SingleUrlInput';
import { MultiLinePaste } from './components/input/MultiLinePaste';
import { CsvDropZone } from './components/input/CsvDropZone';
import { LoadBatchButton } from './components/input/LoadBatchButton';
import { LogoUpload } from './components/config/LogoUpload';
import { QrPreview } from './components/preview/QrPreview';
import { BatchTable } from './components/batch/BatchTable';
import { SaveBatchButton } from './components/output/SaveBatchButton';
import { TestLinksButton } from './components/output/TestLinksButton';
import { useBatchStore } from './store/batch';

function Divider() {
  return <hr className="border-[var(--color-border)]" />;
}

export function App() {
  const rows = useBatchStore((s) => s.rows);
  const [scratchUrl, setScratchUrl] = useState('');
  const [scratchLabel, setScratchLabel] = useState<string | undefined>();

  const handlePreviewChange = useCallback(
    (url: string, label: string | undefined) => {
      setScratchUrl(url);
      setScratchLabel(label);
    },
    [],
  );

  const previewUrl = scratchUrl || rows[0]?.url || '';
  const previewLabel = scratchUrl ? scratchLabel : rows[0]?.label;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate QR codes from URLs
          </h1>
          <p className="max-w-prose text-[var(--color-text-muted)]">
            Drop in a list of URLs (or upload a CSV), get back a print-ready PDF
            with one QR per page, plus per-QR PNG/SVG downloads and bulk ZIP.
            Fully client-side — your URLs never leave your browser.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
            <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              Add URLs
            </h2>
            <SingleUrlInput onPreviewChange={handlePreviewChange} />
            <Divider />
            <MultiLinePaste />
            <Divider />
            <CsvDropZone />
            <Divider />
            <LoadBatchButton />
            <Divider />
            <LogoUpload />
          </div>

          <div className="flex flex-col gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
            <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              Preview
            </h2>
            <QrPreview url={previewUrl} label={previewLabel} />
            {!scratchUrl && rows.length > 0 && (
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Showing row #1. Type a URL above to preview a different one.
              </p>
            )}
          </div>
        </section>

        <BatchTable />

        <section className="flex flex-wrap items-center gap-2">
          <SaveBatchButton />
          <TestLinksButton />
          {rows.length === 0 && (
            <a
              href="/example-batch.csv"
              download
              className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-elevated)]/50 px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
            >
              Download example CSV
            </a>
          )}
        </section>

        <p className="text-center text-xs text-[var(--color-text-muted)]">
          PDF export and bulk ZIP downloads land in Phases 3–4.
        </p>
      </main>
      <Footer />
    </div>
  );
}
