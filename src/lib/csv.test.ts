import { describe, expect, it } from 'vitest';
import { parseCsvText } from './csv';

describe('parseCsvText', () => {
  it('parses a header row with url + label', () => {
    const result = parseCsvText('url,label\nexample.com,First\nfoo.com,Second');
    expect(result.rows).toEqual([
      { url: 'https://example.com', label: 'First' },
      { url: 'https://foo.com', label: 'Second' },
    ]);
  });

  it('strips a leading BOM', () => {
    const text = '﻿url,label\nexample.com,First';
    const result = parseCsvText(text);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].url).toBe('https://example.com');
  });

  it('handles CRLF line endings', () => {
    const result = parseCsvText('url,label\r\nexample.com,First\r\nfoo.com,Second\r\n');
    expect(result.rows).toHaveLength(2);
  });

  it('handles Excel-style quoted fields with commas', () => {
    const result = parseCsvText('url,label\nexample.com,"Last, First"');
    expect(result.rows[0].label).toBe('Last, First');
  });

  it('infers no header when first row has no recognizable label', () => {
    const result = parseCsvText('example.com,Hello\nfoo.com,World');
    expect(result.rows).toEqual([
      { url: 'https://example.com', label: 'Hello' },
      { url: 'https://foo.com', label: 'World' },
    ]);
  });

  it('tolerates rows with only a URL (no label column)', () => {
    const result = parseCsvText('url\nexample.com\nfoo.com\n');
    expect(result.rows).toEqual([
      { url: 'https://example.com', label: undefined },
      { url: 'https://foo.com', label: undefined },
    ]);
  });

  it('skips empty rows', () => {
    const result = parseCsvText('url,label\nexample.com,A\n\n\nfoo.com,B\n');
    expect(result.rows).toHaveLength(2);
  });

  it('returns empty result for empty input', () => {
    expect(parseCsvText('')).toEqual({ rows: [], warnings: [] });
    expect(parseCsvText('\n\n\n')).toEqual({ rows: [], warnings: [] });
  });

  it('preserves existing scheme on URLs', () => {
    const result = parseCsvText(
      'url,label\nhttps://example.com,A\nhttp://foo.com,B',
    );
    expect(result.rows[0].url).toBe('https://example.com');
    expect(result.rows[1].url).toBe('http://foo.com');
  });

  it('finds url column even if it is not first', () => {
    const result = parseCsvText('label,url\nFirst,example.com\nSecond,foo.com');
    expect(result.rows).toEqual([
      { url: 'https://example.com', label: 'First' },
      { url: 'https://foo.com', label: 'Second' },
    ]);
  });
});
