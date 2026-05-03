import JSZip from 'jszip';

export interface ZipEntry {
  name: string;
  content: Blob | Uint8Array | ArrayBuffer | string;
}

export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const zip = new JSZip();
  for (const entry of entries) {
    if (entry.content instanceof Blob) {
      zip.file(entry.name, entry.content);
    } else if (entry.content instanceof ArrayBuffer) {
      zip.file(entry.name, entry.content);
    } else if (typeof entry.content === 'string') {
      zip.file(entry.name, entry.content);
    } else {
      // Uint8Array
      zip.file(entry.name, entry.content);
    }
  }
  return zip.generateAsync({ type: 'blob' });
}

// eslint-disable-next-line no-control-regex -- intentional: filesystem-unfriendly bytes
const FORBIDDEN = /[<>:"/\\|?*\x00-\x1f]/g;

function slugify(input: string, maxLen = 60): string {
  return input
    .replace(/^https?:\/\//i, '')
    .replace(FORBIDDEN, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
}

export function sanitizeFilename(
  label: string | undefined,
  url: string,
  index: number,
): string {
  const fromLabel = label ? slugify(label) : '';
  if (fromLabel) return fromLabel;
  const fromUrl = slugify(url);
  if (fromUrl) return fromUrl;
  return `qr-${index + 1}`;
}

export function uniqueFilenames(
  bases: string[],
  extension: string,
): string[] {
  const seen = new Map<string, number>();
  return bases.map((base) => {
    const key = base.toLowerCase();
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    return n === 0 ? `${base}.${extension}` : `${base}-${n + 1}.${extension}`;
  });
}

export function pngZipFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `qr-pngs-${stamp}.zip`;
}

export function svgZipFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `qr-svgs-${stamp}.zip`;
}
