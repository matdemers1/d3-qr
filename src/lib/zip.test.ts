import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  buildZip,
  pngZipFilename,
  sanitizeFilename,
  svgZipFilename,
  uniqueFilenames,
} from './zip';

describe('sanitizeFilename', () => {
  it('prefers a slugified label', () => {
    expect(sanitizeFilename('Math 101 — Tuesday', 'https://example.com', 0)).toBe(
      'Math-101-Tuesday',
    );
  });

  it('falls back to URL slug when no label', () => {
    expect(sanitizeFilename(undefined, 'https://example.com/path?q=1', 0)).toBe(
      'example-com-path-q-1',
    );
  });

  it('falls back to index when label and URL both empty', () => {
    expect(sanitizeFilename(undefined, '', 4)).toBe('qr-5');
    expect(sanitizeFilename('', '', 0)).toBe('qr-1');
  });

  it('strips path-traversal and shell-unfriendly characters', () => {
    expect(sanitizeFilename('../etc/passwd', 'http://x', 0)).toBe('etc-passwd');
    expect(sanitizeFilename('foo/bar:baz?', 'http://x', 0)).toBe('foo-bar-baz');
  });

  it('truncates long inputs', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeFilename(long, '', 0).length).toBeLessThanOrEqual(60);
  });
});

describe('uniqueFilenames', () => {
  it('appends -N to collisions, case-insensitive', () => {
    expect(uniqueFilenames(['foo', 'foo', 'Foo', 'bar'], 'png')).toEqual([
      'foo.png',
      'foo-2.png',
      'Foo-3.png',
      'bar.png',
    ]);
  });

  it('preserves order', () => {
    expect(uniqueFilenames(['a', 'b', 'a', 'c'], 'svg')).toEqual([
      'a.svg',
      'b.svg',
      'a-2.svg',
      'c.svg',
    ]);
  });
});

describe('buildZip', () => {
  it('round-trips entries', async () => {
    const blob = await buildZip([
      { name: 'a.txt', content: 'hello' },
      { name: 'b.txt', content: 'world' },
      { name: 'nested/c.txt', content: 'deep' },
    ]);

    const zip = await JSZip.loadAsync(blob);
    const files = Object.values(zip.files)
      .filter((f) => !f.dir)
      .map((f) => f.name)
      .sort();
    expect(files).toEqual(['a.txt', 'b.txt', 'nested/c.txt']);
    await expect(zip.file('a.txt')!.async('string')).resolves.toBe('hello');
    await expect(zip.file('b.txt')!.async('string')).resolves.toBe('world');
    await expect(zip.file('nested/c.txt')!.async('string')).resolves.toBe('deep');
  });

  it('accepts Uint8Array entries', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const blob = await buildZip([{ name: 'bin.dat', content: bytes }]);
    const zip = await JSZip.loadAsync(blob);
    const round = await zip.file('bin.dat')!.async('uint8array');
    expect(Array.from(round)).toEqual([1, 2, 3, 4]);
  });
});

describe('pngZipFilename / svgZipFilename', () => {
  it('produce timestamped names', () => {
    expect(pngZipFilename()).toMatch(
      /^qr-pngs-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/,
    );
    expect(svgZipFilename()).toMatch(
      /^qr-svgs-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/,
    );
  });
});
