import { describe, expect, it } from 'vitest';
import { generateQrPng, generateQrSvg, resolveEcl } from './qr';

const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9ZL8DYkAAAAASUVORK5CYII=';

describe('resolveEcl', () => {
  it('returns user choice when no logo', () => {
    expect(resolveEcl({ errorCorrection: 'L' })).toBe('L');
    expect(resolveEcl({ errorCorrection: 'M' })).toBe('M');
    expect(resolveEcl({ errorCorrection: 'Q' })).toBe('Q');
    expect(resolveEcl({ errorCorrection: 'H' })).toBe('H');
  });

  it('forces H when a logo is present', () => {
    const logo = { dataUrl: TINY_PNG_DATA_URL, filename: 'logo.png' };
    expect(resolveEcl({ errorCorrection: 'L', logo })).toBe('H');
    expect(resolveEcl({ errorCorrection: 'M', logo })).toBe('H');
  });
});

describe('generateQrPng', () => {
  it('returns a PNG data URL for a plain URL (no logo)', async () => {
    const dataUrl = await generateQrPng('https://example.com', {
      errorCorrection: 'M',
      fgColor: '#000000',
      bgColor: '#ffffff',
      size: 128,
    });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});

describe('generateQrSvg', () => {
  it('returns SVG markup for a plain URL', async () => {
    const svg = await generateQrSvg('https://example.com', {
      errorCorrection: 'M',
      fgColor: '#000000',
      bgColor: '#ffffff',
      size: 128,
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox');
  });

  it('honors custom foreground and background colors', async () => {
    const svg = await generateQrSvg('https://example.com', {
      errorCorrection: 'M',
      fgColor: '#ff0000',
      bgColor: '#00ff00',
      size: 128,
    });
    expect(svg.toLowerCase()).toContain('#ff0000');
    expect(svg.toLowerCase()).toContain('#00ff00');
  });

  it('injects logo overlay when logo provided', async () => {
    const logo = { dataUrl: TINY_PNG_DATA_URL, filename: 'logo.png' };
    const svg = await generateQrSvg('https://example.com', {
      errorCorrection: 'M',
      fgColor: '#000000',
      bgColor: '#ffffff',
      size: 128,
      logo,
    });
    expect(svg).toContain('<image');
    expect(svg).toContain(TINY_PNG_DATA_URL);
    expect(svg).toContain('<rect');
  });

  it('skips logo overlay when no logo configured', async () => {
    const svg = await generateQrSvg('https://example.com', {
      errorCorrection: 'M',
      fgColor: '#000000',
      bgColor: '#ffffff',
      size: 128,
    });
    expect(svg).not.toContain('<image');
  });
});
