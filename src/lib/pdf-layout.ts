export const LETTER: readonly [number, number] = [612, 792];
export const A4: readonly [number, number] = [595.276, 841.89];

export const LAYOUT = {
  qrSize: 300,
  marginTop: 36,
  marginBottom: 36,
  marginSides: 36,
  headerImageMaxHeight: 36,
  footerImageMaxHeight: 24,
  labelGap: 30,
  labelSize: 14,
  urlGap: 24,
  urlSize: 10,
  urlMaxChars: 80,
  headerTextSize: 11,
  footerTextSize: 9,
  pageNumberSize: 9,
} as const;

export function pageDimensions(size: 'letter' | 'a4'): readonly [number, number] {
  return size === 'a4' ? A4 : LETTER;
}

export function pageSizeLabel(size: 'letter' | 'a4'): string {
  return size === 'a4' ? 'A4' : 'Letter (8.5×11")';
}

export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const t = hex.replace('#', '').padEnd(6, '0');
  return {
    r: parseInt(t.slice(0, 2), 16) / 255,
    g: parseInt(t.slice(2, 4), 16) / 255,
    b: parseInt(t.slice(4, 6), 16) / 255,
  };
}

export interface PageSlots {
  width: number;
  height: number;
  qr: { x: number; y: number; size: number };
  label: { x: number; baseline: number };
  url: { x: number; baseline: number };
  header: { textBaseline: number; imageTop: number; rightEdge: number; leftEdge: number };
  footer: { textBaseline: number; imageBottom: number; rightEdge: number; leftEdge: number };
  pageNumber: { rightEdge: number; baseline: number };
}

export function computeSlots(size: 'letter' | 'a4'): PageSlots {
  const [w, h] = pageDimensions(size);
  const qrX = (w - LAYOUT.qrSize) / 2;
  const qrY = (h - LAYOUT.qrSize) / 2;
  return {
    width: w,
    height: h,
    qr: { x: qrX, y: qrY, size: LAYOUT.qrSize },
    label: { x: w / 2, baseline: qrY + LAYOUT.qrSize + LAYOUT.labelGap },
    url: { x: w / 2, baseline: qrY - LAYOUT.urlGap },
    header: {
      textBaseline: h - LAYOUT.marginTop,
      imageTop: h - LAYOUT.marginTop,
      rightEdge: w - LAYOUT.marginSides,
      leftEdge: LAYOUT.marginSides,
    },
    footer: {
      textBaseline: LAYOUT.marginBottom,
      imageBottom: LAYOUT.marginBottom,
      rightEdge: w - LAYOUT.marginSides,
      leftEdge: LAYOUT.marginSides,
    },
    pageNumber: {
      rightEdge: w - LAYOUT.marginSides,
      baseline: LAYOUT.marginBottom,
    },
  };
}

export function truncateForUrl(url: string): string {
  if (url.length <= LAYOUT.urlMaxChars) return url;
  return url.slice(0, LAYOUT.urlMaxChars - 1) + '…';
}

export function pdfFilename(): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `qr-codes-${stamp}.pdf`;
}
