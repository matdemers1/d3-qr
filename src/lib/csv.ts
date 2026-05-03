import Papa from 'papaparse';
import { normalizeUrl } from './url';

export interface ParsedCsvRow {
  url: string;
  label?: string;
}

export interface ParsedCsvResult {
  rows: ParsedCsvRow[];
  warnings: string[];
}

const HEADER_HINTS = ['url', 'link', 'href', 'address'];
const LABEL_HINTS = ['label', 'name', 'title', 'description'];

function looksLikeHeader(values: string[]): boolean {
  if (values.length === 0) return false;
  const lower = values.map((v) => v.trim().toLowerCase());
  return lower.some((v) => HEADER_HINTS.includes(v));
}

function pickColumns(header: string[]): { url: number; label: number | null } {
  const lower = header.map((v) => v.trim().toLowerCase());
  let urlIdx = lower.findIndex((v) => HEADER_HINTS.includes(v));
  let labelIdx = lower.findIndex((v) => LABEL_HINTS.includes(v));
  if (urlIdx === -1) urlIdx = 0;
  if (labelIdx === -1 && header.length > 1) labelIdx = urlIdx === 0 ? 1 : 0;
  return { url: urlIdx, label: labelIdx === -1 ? null : labelIdx };
}

export function parseCsvText(text: string): ParsedCsvResult {
  const stripped = text.replace(/^\uFEFF/, '');
  if (!stripped.trim()) return { rows: [], warnings: [] };
  const result = Papa.parse<string[]>(stripped, {
    skipEmptyLines: 'greedy',
  });

  const warnings: string[] = result.errors
    .filter((e) => e.code !== 'TooFewFields' && e.code !== 'TooManyFields')
    .map((e) => `${e.type}: ${e.message}${e.row !== undefined ? ` (row ${e.row + 1})` : ''}`);

  const data = result.data.filter((row) => row.length > 0 && row.some((v) => v && v.trim()));
  if (data.length === 0) return { rows: [], warnings };

  let columns: { url: number; label: number | null };
  let dataStart = 0;
  if (looksLikeHeader(data[0])) {
    columns = pickColumns(data[0]);
    dataStart = 1;
  } else {
    columns = { url: 0, label: data[0].length > 1 ? 1 : null };
  }

  const rows: ParsedCsvRow[] = [];
  for (let i = dataStart; i < data.length; i++) {
    const cells = data[i];
    const rawUrl = (cells[columns.url] ?? '').trim();
    if (!rawUrl) continue;
    const label =
      columns.label !== null ? (cells[columns.label] ?? '').trim() : '';
    rows.push({
      url: normalizeUrl(rawUrl),
      label: label || undefined,
    });
  }

  return { rows, warnings };
}

export function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      resolve(parseCsvText(text));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
}
