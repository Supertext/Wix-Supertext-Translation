/**
 * Supertext for this app: the vendored Supertext SDK (src/vendor/supertext-sdk,
 * https://github.com/Supertext/Supertext-API-SDK-and-Guide) with this app's
 * defaults. The SDK handles the protocol: auth header, multipart upload,
 * language codes, HTTP 429 retries, polling, cleanup and packing texts into
 * documents.
 */
import { SupertextClient, type FetchLike, type Politeness } from '../vendor/supertext-sdk/index.js';
import { VERSION } from '../version.js';

export { LanguageCodes, SupertextClient, SupertextError, retryDelayMs } from '../vendor/supertext-sdk/index.js';
export type { Politeness, SegmentInput } from '../vendor/supertext-sdk/index.js';

export interface ClientSettings {
  apiKey: string;
  /** A stand-in API for tests; empty: the live API. */
  endpoint?: string;
  fetch?: typeof fetch;
}

/** A client that identifies this app in the User-Agent. */
export function createSupertextClient(settings: ClientSettings): SupertextClient {
  return new SupertextClient(settings.apiKey, {
    ...(settings.endpoint ? { baseUrl: settings.endpoint } : {}),
    ...(settings.fetch ? { fetch: settings.fetch as FetchLike } : {}),
    userAgent: `Wix-Supertext-Translation/${VERSION || 'dev'}`,
  });
}

/** Plain text escaped for HTML, as the SDK packs it. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
