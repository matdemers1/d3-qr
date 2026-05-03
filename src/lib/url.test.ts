import { describe, expect, it } from 'vitest';
import { describeValidation, normalizeUrl, validateUrl } from './url';

describe('normalizeUrl', () => {
  it('trims whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('preserves existing scheme', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
  });

  it('prepends https when no scheme', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('sub.example.com/path')).toBe(
      'https://sub.example.com/path',
    );
  });

  it('returns empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl('   ')).toBe('');
  });
});

describe('validateUrl', () => {
  it('accepts plain hostnames', () => {
    expect(validateUrl('example.com')).toEqual({ valid: true });
    expect(validateUrl('https://example.com/path?q=1')).toEqual({ valid: true });
  });

  it('flags javascript: and data: schemes', () => {
    expect(validateUrl('javascript:alert(1)')).toEqual({
      valid: false,
      reason: 'suspect-scheme',
    });
    expect(validateUrl('data:text/html,abc')).toEqual({
      valid: false,
      reason: 'suspect-scheme',
    });
  });

  it('flags empty input', () => {
    expect(validateUrl('')).toEqual({ valid: false, reason: 'empty' });
    expect(validateUrl('   ')).toEqual({ valid: false, reason: 'empty' });
  });

  it('flags hostname without TLD (except localhost)', () => {
    expect(validateUrl('foo')).toEqual({ valid: false, reason: 'no-host' });
    expect(validateUrl('localhost')).toEqual({ valid: true });
    expect(validateUrl('http://localhost:3000')).toEqual({ valid: true });
  });
});

describe('describeValidation', () => {
  it('returns empty string for valid', () => {
    expect(describeValidation({ valid: true })).toBe('');
  });

  it('returns a message for each invalid reason', () => {
    expect(describeValidation({ valid: false, reason: 'empty' })).toContain(
      'Empty',
    );
    expect(
      describeValidation({ valid: false, reason: 'suspect-scheme' }),
    ).toContain('script');
    expect(
      describeValidation({ valid: false, reason: 'no-host' }),
    ).toContain('host');
    expect(
      describeValidation({ valid: false, reason: 'malformed' }),
    ).toContain('parseable');
  });
});
