import { describe, expect, it } from 'vitest';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import {
  A4,
  LETTER,
  assemblePdf,
  computeSlots,
  hexToRgb01,
  pageDimensions,
  pageSizeLabel,
  pdfFilename,
  truncateForUrl,
} from './pdf';
import type { BatchRow, Config } from '../types';

const baseConfig: Config = {
  pageSize: 'letter',
  errorCorrection: 'M',
  showPageNumbers: true,
  showUrlBelowQr: true,
  fgColor: '#000000',
  bgColor: '#ffffff',
};

function makeRow(url: string, label?: string): BatchRow {
  return {
    id: `id-${url}`,
    url,
    label,
    valid: true,
  };
}

async function makeQrPng(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    width: 256,
    margin: 1,
  });
}

describe('pageDimensions / pageSizeLabel', () => {
  it('returns Letter and A4 dimensions', () => {
    expect(pageDimensions('letter')).toEqual(LETTER);
    expect(pageDimensions('a4')).toEqual(A4);
  });

  it('labels are human-readable', () => {
    expect(pageSizeLabel('letter')).toMatch(/Letter/);
    expect(pageSizeLabel('a4')).toBe('A4');
  });
});

describe('hexToRgb01', () => {
  it('converts a 6-char hex to 0..1 channels', () => {
    expect(hexToRgb01('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb01('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToRgb01('#ff8000').r).toBeCloseTo(1, 5);
    expect(hexToRgb01('#ff8000').g).toBeCloseTo(0.502, 2);
  });

  it('tolerates missing hash', () => {
    expect(hexToRgb01('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('computeSlots', () => {
  it('places QR centered for Letter', () => {
    const slots = computeSlots('letter');
    expect(slots.qr.x).toBeCloseTo((612 - 300) / 2, 5);
    expect(slots.qr.y).toBeCloseTo((792 - 300) / 2, 5);
  });

  it('A4 has a different page height', () => {
    const a4 = computeSlots('a4');
    const letter = computeSlots('letter');
    expect(a4.height).not.toBe(letter.height);
    expect(a4.height).toBeCloseTo(841.89, 1);
  });
});

describe('truncateForUrl', () => {
  it('passes through short URLs unchanged', () => {
    expect(truncateForUrl('https://example.com')).toBe('https://example.com');
  });

  it('truncates very long URLs with an ellipsis', () => {
    const long = 'https://example.com/' + 'a'.repeat(100);
    const out = truncateForUrl(long);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(80);
  });
});

describe('assemblePdf', () => {
  it('builds a PDF with one page per row', async () => {
    const rows = [makeRow('https://example.com/a', 'A'), makeRow('https://example.com/b')];
    const qrPngs = await Promise.all(rows.map((r) => makeQrPng(r.url)));
    const bytes = await assemblePdf({ rows, config: baseConfig, qrPngs });

    expect(bytes.byteLength).toBeGreaterThan(1000);
    const head = new TextDecoder().decode(bytes.slice(0, 8));
    expect(head.startsWith('%PDF-')).toBe(true);

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it('letter and A4 produce different page sizes', async () => {
    const rows = [makeRow('https://example.com/x')];
    const qrPngs = [await makeQrPng('https://example.com/x')];

    const letterBytes = await assemblePdf({
      rows,
      config: { ...baseConfig, pageSize: 'letter' },
      qrPngs,
    });
    const a4Bytes = await assemblePdf({
      rows,
      config: { ...baseConfig, pageSize: 'a4' },
      qrPngs,
    });

    const letterDoc = await PDFDocument.load(letterBytes);
    const a4Doc = await PDFDocument.load(a4Bytes);
    const letterSize = letterDoc.getPage(0).getSize();
    const a4Size = a4Doc.getPage(0).getSize();

    expect(letterSize.width).toBe(LETTER[0]);
    expect(letterSize.height).toBe(LETTER[1]);
    expect(a4Size.width).toBeCloseTo(A4[0], 2);
    expect(a4Size.height).toBeCloseTo(A4[1], 2);
  });

  it('throws on row/qr length mismatch', async () => {
    await expect(
      assemblePdf({
        rows: [makeRow('https://example.com')],
        config: baseConfig,
        qrPngs: [],
      }),
    ).rejects.toThrow(/same length/);
  });

  it('throws on empty rows', async () => {
    await expect(
      assemblePdf({ rows: [], config: baseConfig, qrPngs: [] }),
    ).rejects.toThrow(/zero rows/);
  });

  it('reports progress per row', async () => {
    const rows = [
      makeRow('https://example.com/1'),
      makeRow('https://example.com/2'),
      makeRow('https://example.com/3'),
    ];
    const qrPngs = await Promise.all(rows.map((r) => makeQrPng(r.url)));
    const calls: Array<[number, number]> = [];
    await assemblePdf({
      rows,
      config: baseConfig,
      qrPngs,
      onProgress: (done, total) => calls.push([done, total]),
    });
    expect(calls).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });
});

describe('pdfFilename', () => {
  it('returns a timestamped filename ending with .pdf', () => {
    expect(pdfFilename()).toMatch(/^qr-codes-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.pdf$/);
  });
});
