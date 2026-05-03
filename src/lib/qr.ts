import QRCode from 'qrcode';
import type { Config, ErrorCorrection, LogoConfig } from '../types';

const LOGO_PAD_RATIO = 0.22;
const LOGO_SIZE_RATIO = 0.18;
const DEFAULT_PIXEL_SIZE = 512;

export interface QrRenderOptions {
  errorCorrection: ErrorCorrection;
  fgColor: string;
  bgColor: string;
  logo?: LogoConfig;
  size?: number;
}

export function optionsFromConfig(config: Config): QrRenderOptions {
  return {
    errorCorrection: config.errorCorrection,
    fgColor: config.fgColor,
    bgColor: config.bgColor,
    logo: config.logo,
    size: DEFAULT_PIXEL_SIZE,
  };
}

export function resolveEcl(
  options: Pick<QrRenderOptions, 'errorCorrection' | 'logo'>,
): ErrorCorrection {
  return options.logo ? 'H' : options.errorCorrection;
}

export async function generateQrPng(
  url: string,
  options: QrRenderOptions,
): Promise<string> {
  const ecl = resolveEcl(options);
  const size = options.size ?? DEFAULT_PIXEL_SIZE;

  if (!options.logo) {
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: ecl,
      width: size,
      margin: 1,
      color: { dark: options.fgColor, light: options.bgColor },
    });
  }

  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: ecl,
    width: size,
    margin: 1,
    color: { dark: options.fgColor, light: options.bgColor },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const padSize = size * LOGO_PAD_RATIO;
  const padOffset = (size - padSize) / 2;
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(padOffset, padOffset, padSize, padSize);

  const logoImg = await loadImage(options.logo.dataUrl);
  const logoSize = size * LOGO_SIZE_RATIO;
  const logoOffset = (size - logoSize) / 2;
  ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);

  return canvas.toDataURL('image/png');
}

export async function generateQrSvg(
  url: string,
  options: QrRenderOptions,
): Promise<string> {
  const ecl = resolveEcl(options);
  const size = options.size ?? DEFAULT_PIXEL_SIZE;

  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: ecl,
    width: size,
    margin: 1,
    color: { dark: options.fgColor, light: options.bgColor },
  });

  if (!options.logo) return svg;

  const viewBox = parseViewBox(svg) ?? { width: size, height: size };
  const padSize = viewBox.width * LOGO_PAD_RATIO;
  const padOffset = (viewBox.width - padSize) / 2;
  const logoSize = viewBox.width * LOGO_SIZE_RATIO;
  const logoOffset = (viewBox.width - logoSize) / 2;

  const overlay =
    `<rect x="${padOffset}" y="${padOffset}" width="${padSize}" height="${padSize}" fill="${escapeAttr(options.bgColor)}"/>` +
    `<image x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" href="${escapeAttr(options.logo.dataUrl)}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace('</svg>', `${overlay}</svg>`);
}

function parseViewBox(svg: string): { width: number; height: number } | null {
  const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = src;
  });
}
