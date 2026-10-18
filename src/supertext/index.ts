/**
 * Supertext for this app: the vendored Supertext SDK (src/vendor/supertext-sdk,
 * https://github.com/Supertext/Supertext-API-SDK-and-Guide; the API in its `v1`
 * namespace) with this app's defaults. The SDK handles the protocol: auth header,
 * multipart upload, HTTP 429 retries, polling, cleanup, packing texts into
 * documents, the language list and the API key check. Version reports are Supertext
 * Plugin Health's (src/vendor/supertext-plugin-health, see ../reporting.ts).
 */
import { SupertextClient, type FetchLike } from '../vendor/supertext-sdk/v1/index.js';
import { VERSION } from '../version.js';

export {
  apiKeyFingerprint,
  Languages,
  SOURCE_LANGUAGES,
  SupertextClient,
  SupertextError,
  TARGET_LANGUAGES,
  retryDelayMs,
} from '../vendor/supertext-sdk/v1/index.js';
export type {
  ApiKeyCheck,
  ApiKeyCheckStatus,
  FetchLike,
  LanguageMapping,
  Politeness,
  SegmentInput,
} from '../vendor/supertext-sdk/v1/index.js';
export { SDK_VERSION, TranslationFiles, TranslationFileError } from '../vendor/supertext-sdk/index.js';
export type { FileFormat, FileJob, ImportStatus } from '../vendor/supertext-sdk/index.js';

export interface ClientSettings {
  apiKey: string;
  /** A stand-in API for tests; empty: the live API. */
  endpoint?: string;
  fetch?: typeof fetch;
}

/** Appended to the SDK's User-Agent. */
export const USER_AGENT = `Wix-Supertext-Translation/${VERSION || 'dev'}`;

/** A client that identifies this app in the User-Agent. */
export function createSupertextClient(settings: ClientSettings): SupertextClient {
  return new SupertextClient(settings.apiKey, {
    ...(settings.endpoint ? { baseUrl: settings.endpoint } : {}),
    ...(settings.fetch ? { fetch: settings.fetch as FetchLike } : {}),
    userAgent: USER_AGENT,
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
