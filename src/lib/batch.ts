import type { Config, SavedBatch } from '../types';

const SUPPORTED_VERSIONS = [1] as const;

export class BatchFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BatchFormatError';
  }
}

export function serializeBatch(batch: SavedBatch): string {
  return JSON.stringify(batch, null, 2);
}

export function deserializeBatch(text: string): SavedBatch {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new BatchFormatError(
      `Not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new BatchFormatError('Saved batch must be a JSON object');
  }
  const obj = parsed as Record<string, unknown>;

  if (!SUPPORTED_VERSIONS.includes(obj.version as 1)) {
    throw new BatchFormatError(
      `Unsupported batch version: ${String(obj.version)}. Expected: ${SUPPORTED_VERSIONS.join(', ')}`,
    );
  }

  if (!Array.isArray(obj.rows)) {
    throw new BatchFormatError('Saved batch is missing the "rows" array');
  }

  if (!obj.config || typeof obj.config !== 'object') {
    throw new BatchFormatError('Saved batch is missing the "config" object');
  }

  const rows = obj.rows.map((row, idx) => {
    if (!row || typeof row !== 'object') {
      throw new BatchFormatError(`Row ${idx} is not an object`);
    }
    const r = row as Record<string, unknown>;
    if (typeof r.url !== 'string') {
      throw new BatchFormatError(`Row ${idx} is missing "url"`);
    }
    return {
      url: r.url,
      label: typeof r.label === 'string' ? r.label : undefined,
    };
  });

  return {
    version: 1,
    rows,
    config: obj.config as Config,
  };
}

export function batchFilename(): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `d3qr-batch-${stamp}.json`;
}
