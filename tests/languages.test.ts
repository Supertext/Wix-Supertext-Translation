import { describe, expect, it } from 'vitest';
import { errorInfo } from '../src/i18n/error.js';
import { translator } from '../src/i18n/index.js';
import {
  exactTarget,
  languageName,
  resolveSource,
  resolveTarget,
  supportedSource,
  supportedTarget,
  supportsPoliteness,
  targetCodeOf,
} from '../src/translation/language-codes.js';

describe('language codes (no guessing)', () => {
  it('uses the mapping, else an exact Supertext code, else nothing', () => {
    expect(resolveTarget('de', { de: 'de-CH' })).toBe('de-CH');
    expect(resolveTarget('de_ch', {})).toBe('de-CH');
    expect(resolveTarget('es', {})).toBe('es');
    expect(targetCodeOf('de', {})).toBeNull(); // no default region
    expect(targetCodeOf('zh-CN', {})).toBeNull();
    expect(exactTarget('fr-ch')).toBe('fr-CH');
    let error: unknown;
    try {
      resolveTarget('pt', {});
    } catch (caught) {
      error = caught;
    }
    const info = errorInfo(error);
    expect(info).toMatchObject({ code: 'unsupported_language', params: { language: 'pt' } });
    expect(translator('de').error(info)).toContain('„pt“ hat noch keine Supertext-Sprache');
  });

  it('sends the source bare; one mapping serves both directions', () => {
    expect(resolveSource('en-US', {})).toBe('en');
    expect(resolveSource('de', { de: 'de-CH' })).toBe('de');
    expect(() => resolveSource('xx', {})).toThrow();
  });

  it('accepts only codes Supertext offers in the settings', () => {
    expect(supportedTarget('de-de')).toBe('de-DE');
    expect(supportedTarget('de')).toBeNull();
    expect(supportedTarget('french')).toBeNull();
    expect(supportedSource('EN')).toBe('en');
    expect(supportedSource('en-US')).toBeNull();
  });

  it('knows where formal/informal address exists', () => {
    expect(supportsPoliteness('de-CH')).toBe(true);
    expect(supportsPoliteness('en-US')).toBe(false);
    expect(supportsPoliteness('xx')).toBe(false);
  });

  it('names languages in the interface language', () => {
    expect(languageName('de-CH', 'de')).toBe('Deutsch (Schweiz)');
    expect(languageName('gsw-u-sd-chzh', 'en')).toMatch(/\(Zürich\)$/);
  });
});
