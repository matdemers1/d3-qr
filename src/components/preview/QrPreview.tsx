import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { useBatchStore } from '../../store/batch';
import { generateQrPng, generateQrSvg, optionsFromConfig } from '../../lib/qr';
import { Alert, Button, Spinner } from '@d3cloud/ui';

interface Props {
  url: string;
  label?: string;
}

interface PreviewState {
  url: string;
  dataUrl: string;
  error?: string;
}

function filenameFor(
  url: string,
  label: string | undefined,
  ext: string,
): string {
  const base = (label?.trim() || url || 'qr-code')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'qr-code'}.${ext}`;
}

export function QrPreview({ url, label }: Props) {
  const config = useBatchStore((s) => s.config);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    generateQrPng(url, optionsFromConfig(config))
      .then((dataUrl) => {
        if (!cancelled) setPreview({ url, dataUrl });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPreview({
            url,
            dataUrl: '',
            error: err instanceof Error ? err.message : 'QR generation failed',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url, config]);

  const isCurrent = !!preview && preview.url === url;
  const pngDataUrl = isCurrent && !preview.error ? preview.dataUrl : null;
  const previewError = isCurrent ? (preview.error ?? null) : null;
  const generating = !!url && !isCurrent;

  async function downloadPng() {
    if (!url) return;
    setDownloadError(null);
    try {
      const dataUrl = await generateQrPng(url, optionsFromConfig(config));
      const blob = await (await fetch(dataUrl)).blob();
      saveAs(blob, filenameFor(url, label, 'png'));
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : 'PNG download failed',
      );
    }
  }

  async function downloadSvg() {
    if (!url) return;
    setDownloadError(null);
    try {
      const svg = await generateQrSvg(url, optionsFromConfig(config));
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, filenameFor(url, label, 'svg'));
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : 'SVG download failed',
      );
    }
  }

  const showLogoHint = !!config.logo && config.errorCorrection !== 'H';

  return (
    <div className="flex flex-col gap-3">
      {/* White in both themes: this is the code as it will be printed. A light
          theme island, so the spinner and the empty-state text inside take the
          light palette instead of dark-theme greys on a white ground. */}
      <div
        data-theme="light"
        className="flex aspect-square w-full max-w-[360px] items-center justify-center self-center rounded-md border border-border bg-white p-4"
      >
        {pngDataUrl ? (
          <img
            src={pngDataUrl}
            alt={`QR code for ${url}`}
            className="h-full w-full object-contain"
          />
        ) : generating ? (
          <Spinner label="Generating the QR code" />
        ) : (
          <p className="text-center text-sm text-fg-muted">
            {url ? 'Preview unavailable' : 'Type a URL to see a preview'}
          </p>
        )}
      </div>
      {showLogoHint && (
        <p className="text-center text-xs text-fg-muted">
          Logo detected — using high error correction (H)
        </p>
      )}
      {(previewError || downloadError) && (
        <Alert tone="danger" dynamic>
          {previewError ?? downloadError}
        </Alert>
      )}
      <div className="flex justify-center gap-2">
        <Button onClick={() => void downloadPng()} disabled={!url}>
          Download PNG
        </Button>
        <Button onClick={() => void downloadSvg()} disabled={!url}>
          Download SVG
        </Button>
      </div>
    </div>
  );
}
