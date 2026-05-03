const SUSPECT_SCHEMES = ['javascript:', 'data:', 'file:', 'vbscript:'];

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export type UrlValidation =
  | { valid: true }
  | { valid: false; reason: 'empty' | 'suspect-scheme' | 'no-host' | 'malformed' };

export function validateUrl(input: string): UrlValidation {
  const raw = input.trim();
  if (!raw) return { valid: false, reason: 'empty' };

  const lower = raw.toLowerCase();
  if (SUSPECT_SCHEMES.some((s) => lower.startsWith(s))) {
    return { valid: false, reason: 'suspect-scheme' };
  }

  const normalized = normalizeUrl(raw);
  try {
    const url = new URL(normalized);
    if (!url.hostname) return { valid: false, reason: 'no-host' };
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
      return { valid: false, reason: 'no-host' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}

export function describeValidation(v: UrlValidation): string {
  if (v.valid) return '';
  switch (v.reason) {
    case 'empty':
      return 'Empty URL';
    case 'suspect-scheme':
      return 'Looks like a script or data URL — likely not what you want in a QR';
    case 'no-host':
      return 'Missing a host (e.g., example.com)';
    case 'malformed':
      return 'Not a parseable URL';
  }
}
