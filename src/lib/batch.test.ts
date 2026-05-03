import { describe, expect, it } from 'vitest';
import {
  BatchFormatError,
  batchFilename,
  deserializeBatch,
  serializeBatch,
} from './batch';
import type { SavedBatch } from '../types';

const SAMPLE: SavedBatch = {
  version: 1,
  rows: [
    { url: 'https://example.com/a', label: 'First' },
    { url: 'https://example.com/b', label: 'Second' },
  ],
  config: {
    pageSize: 'letter',
    errorCorrection: 'M',
    showPageNumbers: true,
    showUrlBelowQr: true,
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
};

describe('serializeBatch / deserializeBatch', () => {
  it('round-trips a sample batch', () => {
    const json = serializeBatch(SAMPLE);
    expect(deserializeBatch(json)).toEqual(SAMPLE);
  });

  it('drops missing labels to undefined', () => {
    const minimal: SavedBatch = {
      version: 1,
      rows: [{ url: 'https://example.com' }],
      config: SAMPLE.config,
    };
    const back = deserializeBatch(serializeBatch(minimal));
    expect(back.rows[0]).toEqual({ url: 'https://example.com', label: undefined });
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializeBatch('{')).toThrow(BatchFormatError);
  });

  it('throws on missing version', () => {
    expect(() => deserializeBatch('{"rows":[],"config":{}}')).toThrow(
      BatchFormatError,
    );
  });

  it('throws on unsupported version', () => {
    expect(() => deserializeBatch('{"version":99,"rows":[],"config":{}}')).toThrow(
      /Unsupported batch version/,
    );
  });

  it('throws on missing rows array', () => {
    expect(() => deserializeBatch('{"version":1,"config":{}}')).toThrow(
      BatchFormatError,
    );
  });

  it('throws on row missing url', () => {
    expect(() =>
      deserializeBatch('{"version":1,"rows":[{}],"config":{}}'),
    ).toThrow(/missing "url"/);
  });
});

describe('batchFilename', () => {
  it('returns a timestamped filename ending with .json', () => {
    const name = batchFilename();
    expect(name).toMatch(/^d3qr-batch-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
  });
});
