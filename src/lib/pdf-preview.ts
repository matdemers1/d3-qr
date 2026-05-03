import type { BatchRow, Config } from '../types';
import { LAYOUT, computeSlots, truncateForUrl } from './pdf-layout';
import { generateQrPng, optionsFromConfig } from './qr';

export interface PreviewOptions {
  scale?: number;
}

const DEFAULT_SCALE = 0.42;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export async function renderPagePreview(
  canvas: HTMLCanvasElement,
  row: BatchRow,
  config: Config,
  options: PreviewOptions = {},
): Promise<void> {
  const scale = options.scale ?? DEFAULT_SCALE;
  const slots = computeSlots(config.pageSize);
  const w = slots.width * scale;
  const h = slots.height * scale;

  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  canvas.style.aspectRatio = `${slots.width} / ${slots.height}`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

  const qrDataUrl = await generateQrPng(row.url, optionsFromConfig(config));
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(
    qrImg,
    slots.qr.x * scale,
    (slots.height - slots.qr.y - slots.qr.size) * scale,
    slots.qr.size * scale,
    slots.qr.size * scale,
  );

  if (row.label) {
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${LAYOUT.labelSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(
      row.label,
      slots.label.x * scale,
      (slots.height - slots.label.baseline) * scale,
    );
  }

  if (config.showUrlBelowQr) {
    ctx.fillStyle = '#333333';
    ctx.font = `${LAYOUT.urlSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      truncateForUrl(row.url),
      slots.url.x * scale,
      (slots.height - slots.url.baseline) * scale,
    );
  }

  if (config.header?.text) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${LAYOUT.headerTextSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(
      config.header.text,
      slots.header.leftEdge * scale,
      (slots.height - slots.header.textBaseline) * scale,
    );
  }
  if (config.header?.image) {
    try {
      const img = await loadImage(config.header.image.dataUrl);
      const ratio = img.width / img.height;
      const imgH = LAYOUT.headerImageMaxHeight * scale;
      const imgW = imgH * ratio;
      ctx.drawImage(
        img,
        slots.header.rightEdge * scale - imgW,
        (slots.height - slots.header.imageTop) * scale,
        imgW,
        imgH,
      );
    } catch {
      // ignore preview-time image errors
    }
  }

  if (config.footer?.text) {
    ctx.fillStyle = '#666666';
    ctx.font = `${LAYOUT.footerTextSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(
      config.footer.text,
      slots.footer.leftEdge * scale,
      (slots.height - slots.footer.textBaseline) * scale,
    );
  }
  if (config.footer?.image) {
    try {
      const img = await loadImage(config.footer.image.dataUrl);
      const ratio = img.width / img.height;
      const imgH = LAYOUT.footerImageMaxHeight * scale;
      const imgW = imgH * ratio;
      ctx.drawImage(
        img,
        slots.footer.rightEdge * scale - imgW,
        (slots.height - slots.footer.imageBottom - LAYOUT.footerImageMaxHeight) * scale,
        imgW,
        imgH,
      );
    } catch {
      // ignore
    }
  }

  if (config.showPageNumbers) {
    ctx.fillStyle = '#888888';
    ctx.font = `${LAYOUT.pageNumberSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(
      'Page 1 of N',
      slots.pageNumber.rightEdge * scale,
      (slots.height - slots.pageNumber.baseline) * scale,
    );
  }
}
