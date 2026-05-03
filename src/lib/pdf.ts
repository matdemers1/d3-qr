import {
  PDFDocument,
  PDFFont,
  PDFImage,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { BatchRow, Config } from '../types';
import {
  LAYOUT,
  type PageSlots,
  computeSlots,
  truncateForUrl,
} from './pdf-layout';

export {
  A4,
  LAYOUT,
  LETTER,
  computeSlots,
  hexToRgb01,
  pageDimensions,
  pageSizeLabel,
  pdfFilename,
  truncateForUrl,
} from './pdf-layout';
export type { PageSlots } from './pdf-layout';

async function dataUrlToArrayBuffer(dataUrl: string): Promise<ArrayBuffer> {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bytes = atob(base64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return buf.buffer;
}

async function embedDataUrlImage(
  doc: PDFDocument,
  dataUrl: string,
): Promise<PDFImage> {
  const buf = await dataUrlToArrayBuffer(dataUrl);
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    return doc.embedJpg(buf);
  }
  return doc.embedPng(buf);
}

export interface AssemblePdfArgs {
  rows: BatchRow[];
  config: Config;
  qrPngs: string[];
  onProgress?: (done: number, total: number) => void;
}

export async function assemblePdf({
  rows,
  config,
  qrPngs,
  onProgress,
}: AssemblePdfArgs): Promise<Uint8Array> {
  if (rows.length === 0) throw new Error('Cannot build a PDF with zero rows');
  if (rows.length !== qrPngs.length) {
    throw new Error('rows and qrPngs must have the same length');
  }

  const doc = await PDFDocument.create();
  doc.setTitle('D3 QR — generated codes');
  doc.setProducer('D3 QR (qr.d3cloud.io)');
  doc.setCreator('D3 QR');

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const slots = computeSlots(config.pageSize);

  let headerImg: PDFImage | null = null;
  if (config.header?.image) {
    try {
      headerImg = await embedDataUrlImage(doc, config.header.image.dataUrl);
    } catch {
      headerImg = null;
    }
  }
  let footerImg: PDFImage | null = null;
  if (config.footer?.image) {
    try {
      footerImg = await embedDataUrlImage(doc, config.footer.image.dataUrl);
    } catch {
      footerImg = null;
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const page = doc.addPage([slots.width, slots.height]);

    const qrImg = await embedDataUrlImage(doc, qrPngs[i]);
    page.drawImage(qrImg, {
      x: slots.qr.x,
      y: slots.qr.y,
      width: slots.qr.size,
      height: slots.qr.size,
    });

    if (row.label) {
      const text = row.label;
      const textW = helveticaBold.widthOfTextAtSize(text, LAYOUT.labelSize);
      page.drawText(text, {
        x: slots.label.x - textW / 2,
        y: slots.label.baseline,
        size: LAYOUT.labelSize,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
    }

    if (config.showUrlBelowQr) {
      const text = truncateForUrl(row.url);
      const textW = helvetica.widthOfTextAtSize(text, LAYOUT.urlSize);
      page.drawText(text, {
        x: slots.url.x - textW / 2,
        y: slots.url.baseline,
        size: LAYOUT.urlSize,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    drawHeader(page, slots, helvetica, config, headerImg);
    drawFooter(page, slots, helvetica, config, footerImg);

    if (config.showPageNumbers) {
      const pn = `Page ${i + 1} of ${rows.length}`;
      const pnW = helvetica.widthOfTextAtSize(pn, LAYOUT.pageNumberSize);
      page.drawText(pn, {
        x: slots.pageNumber.rightEdge - pnW,
        y: slots.pageNumber.baseline,
        size: LAYOUT.pageNumberSize,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    onProgress?.(i + 1, rows.length);
  }

  return doc.save();
}

function drawHeader(
  page: ReturnType<PDFDocument['addPage']>,
  slots: PageSlots,
  font: PDFFont,
  config: Config,
  image: PDFImage | null,
) {
  if (!config.header) return;
  if (config.header.text) {
    page.drawText(config.header.text, {
      x: slots.header.leftEdge,
      y: slots.header.textBaseline,
      size: LAYOUT.headerTextSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }
  if (image) {
    const ratio = image.width / image.height;
    const h = LAYOUT.headerImageMaxHeight;
    const w = h * ratio;
    page.drawImage(image, {
      x: slots.header.rightEdge - w,
      y: slots.header.imageTop - h,
      width: w,
      height: h,
    });
  }
}

function drawFooter(
  page: ReturnType<PDFDocument['addPage']>,
  slots: PageSlots,
  font: PDFFont,
  config: Config,
  image: PDFImage | null,
) {
  if (!config.footer) return;
  if (config.footer.text) {
    page.drawText(config.footer.text, {
      x: slots.footer.leftEdge,
      y: slots.footer.textBaseline,
      size: LAYOUT.footerTextSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }
  if (image) {
    const ratio = image.width / image.height;
    const h = LAYOUT.footerImageMaxHeight;
    const w = h * ratio;
    const xRight = slots.footer.rightEdge - w;
    page.drawImage(image, {
      x: xRight,
      y: slots.footer.imageBottom,
      width: w,
      height: h,
    });
  }
}
