// Wix locale IDs → Supertext language codes, on top of the Supertext SDK's LanguageCodes.
//
// Wix locales are bare languages ("de") or carry a region ("de-CH"). Supertext
// needs a regional code as target ("de-DE"); the source is sent as the bare
// language ("en"). Each site can override the code per language under
// Settings → Languages.
//
// Pure functions without the SDK client, so the views can use them too.

import { DEFAULT_REGIONS, isValid, normalize, target } from "../vendor/supertext-sdk/language-codes.js";

export { DEFAULT_REGIONS };

/** "pt-br" → "pt-BR", "zh_hant" → "zh-Hant", "de" → "de". */
export const normalizeCode = (code: string): string => normalize(code);

/** The suggested Supertext code for a Wix locale: the locale if it has a region, else the default region. */
export const defaultSupertextCode = (wixLocale: string): string => target(wixLocale);

/** The code to send for a Wix locale: the site's own setting, else the default. */
export const supertextCode = (wixLocale: string, overrides: Record<string, string>): string =>
  target(wixLocale, overrides);

/** A plausible language code: "de", "de-CH", "zh-Hant", "es-419". */
export const isValidCode = (code: string): boolean => isValid(code);
