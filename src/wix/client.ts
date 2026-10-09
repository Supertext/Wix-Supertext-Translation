import { LocalizedError } from '../i18n/error.js';
import { retryDelayMs } from '../supertext/client.js';

/**
 * The Wix REST calls this app needs: access tokens for an app instance, the
 * site's locales (Wix Multilingual) and the Translation Schema and Translation
 * Content APIs, which hold the original and translated texts of Wix Stores,
 * Wix Blog and other apps' content.
 */

export class WixError extends LocalizedError {
  constructor(
    message: string,
    code: string,
    options: { status?: number; detail?: string; params?: Record<string, string | number> } = {},
  ) {
    super(message, code, options.params ?? {}, options.detail);
    this.name = 'WixError';
    this.status = options.status;
  }

  public readonly status?: number;
}

export interface WixLocale {
  id: string;
  languageCode?: string;
  regionCode?: string;
  visibility?: 'HIDDEN' | 'VISIBLE';
  primaryLocale?: boolean;
  displayName?: string;
  effectiveDisplayName?: string;
}

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'HTML'
  | 'RICH_CONTENT'
  | 'IMAGE'
  | 'IMAGE_LINK'
  | 'VIDEO'
  | 'DOCUMENT';

export interface SchemaField {
  id?: string;
  type: FieldType;
  displayName?: string;
  groupName?: string;
  minLength?: number;
  maxLength?: number;
  hidden?: boolean;
  displayOnly?: boolean;
  index?: number;
}

export interface Schema {
  id: string;
  key: { appId?: string; entityType: string; scope?: 'GLOBAL' | 'SITE' };
  fields: Record<string, SchemaField>;
  previewFields?: { titleFieldId?: string; imageFieldId?: string };
  hidden?: boolean;
  displayName?: string;
  parentId?: string;
  requireParentEntity?: boolean;
}

export interface RichContent {
  nodes: RicosNode[];
  metadata?: Record<string, unknown>;
  documentStyle?: Record<string, unknown>;
}

export interface RicosNode {
  type: string;
  id?: string;
  nodes?: RicosNode[];
  textData?: { text: string; decorations?: RicosDecoration[] };
  [data: string]: unknown;
}

export interface RicosDecoration {
  type: string;
  [data: string]: unknown;
}

export interface ContentField {
  id?: string;
  textValue?: string;
  richContent?: RichContent;
  image?: Record<string, unknown>;
  video?: Record<string, unknown>;
  document?: Record<string, unknown>;
  published?: boolean;
  updatedBy?: 'UNKNOWN_UPDATER_IDENTITY' | 'USER' | 'EXTERNAL_APP' | 'MACHINE';
}

export interface Content {
  id?: string;
  schemaId: string;
  entityId: string;
  locale: string;
  fields: Record<string, ContentField>;
  parentEntityId?: string;
  publishStatus?: string;
  previewField?: string;
}

export interface Page<T> {
  items: T[];
  nextCursor?: string;
}

export interface WixClientOptions {
  appId: string;
  appSecret: string;
  instanceId: string;
  apiBase?: string;
  /** Injected for tests. */
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  tokens?: TokenCache;
}

/** Access tokens are valid for 4 hours; reuse them for 3.5. */
export class TokenCache {
  private readonly tokens = new Map<string, { token: string; expires: number }>();

  get(key: string): string | undefined {
    const entry = this.tokens.get(key);
    return entry && entry.expires > Date.now() ? entry.token : undefined;
  }

  set(key: string, token: string, lifetimeSeconds = 4 * 3600): void {
    const margin = Math.min(1800, lifetimeSeconds / 8);
    this.tokens.set(key, { token, expires: Date.now() + (lifetimeSeconds - margin) * 1000 });
  }

  delete(key: string): void {
    this.tokens.delete(key);
  }
}

const sharedTokens = new TokenCache();

/** Wix Stores, Wix Blog and other Wix apps whose schemas the translate page names. */
export const WIX_APPS: Record<string, string> = {
  '1380b703-ce81-ff05-f115-39571d94dfcd': 'Wix Stores',
  '14bcded7-0066-7c35-14d7-466cb3f09103': 'Wix Blog',
  '13d21c63-b5ec-5912-8397-c3a5ddb27a97': 'Wix Bookings',
  '140603ad-af8d-84a5-2c80-a0f60cb47351': 'Wix Events',
};

export const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';

export class WixClient {
  private readonly apiBase: string;
  private readonly fetchFn: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly tokens: TokenCache;

  constructor(private readonly options: WixClientOptions) {
    this.apiBase = (options.apiBase || 'https://www.wixapis.com').replace(/\/+$/, '');
    this.fetchFn = options.fetch ?? fetch;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.tokens = options.tokens ?? sharedTokens;
  }

  /** All locales of the site; the primary one has `primaryLocale: true`. */
  async locales(): Promise<WixLocale[]> {
    const result: WixLocale[] = [];
    let cursor: string | undefined;
    do {
      const query: Record<string, unknown> = { cursorPaging: { limit: 100, ...(cursor ? { cursor } : {}) } };
      const data = await this.call<{ locales?: WixLocale[]; pagingMetadata?: Paging }>(
        'POST',
        '/locales/v2/locale/query',
        { query },
      );
      result.push(...(data.locales ?? []));
      cursor = nextCursor(data.pagingMetadata);
    } while (cursor);
    return result;
  }

  /** Every translation schema on the site, whichever app created it. */
  async schemas(): Promise<Schema[]> {
    const result: Schema[] = [];
    let cursor: string | undefined;
    do {
      const params = new URLSearchParams({ 'paging.limit': '100' });
      if (cursor) params.set('paging.cursor', cursor);
      const data = await this.call<{ schemas?: Schema[]; pagingMetadata?: Paging }>(
        'GET',
        `/translation-schema/v1/schemas/site?${params}`,
      );
      result.push(...(data.schemas ?? []));
      cursor = nextCursor(data.pagingMetadata);
    } while (cursor);
    return result;
  }

  /** One page of translation content. */
  async queryContents(filter: Record<string, unknown>, limit = 50, cursor?: string): Promise<Page<Content>> {
    const query: Record<string, unknown> = {
      cursorPaging: { limit, ...(cursor ? { cursor } : {}) },
    };
    if (!cursor) {
      query.filter = filter;
      query.sort = [{ fieldName: 'id', order: 'ASC' }];
    }
    const data = await this.call<{ contents?: Content[]; pagingMetadata?: Paging }>(
      'POST',
      '/translation-content/v1/contents/query',
      { query },
    );
    return { items: data.contents ?? [], nextCursor: nextCursor(data.pagingMetadata) };
  }

  /** All content matching the filter (all pages). */
  async allContents(filter: Record<string, unknown>): Promise<Content[]> {
    const result: Content[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.queryContents(filter, 100, cursor);
      result.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    return result;
  }

  /**
   * Writes translations, identified by schema, entity and locale. Only the
   * fields passed are changed. Up to 100 items per call.
   */
  async updateContentsByKey(contents: Content[]): Promise<void> {
    for (let start = 0; start < contents.length; start += 100) {
      const batch = contents.slice(start, start + 100);
      const data = await this.call<{ results?: BulkResult[]; bulkActionMetadata?: { totalFailures?: number } }>(
        'POST',
        '/translation-content/v1/bulk/contents/update-by-key',
        { contents: batch.map((content) => ({ content })), returnEntity: false },
      );
      const failed = (data.results ?? []).find((result) => result.itemMetadata && result.itemMetadata.success === false);
      if (failed) {
        const detail = failed.itemMetadata?.error?.description || failed.itemMetadata?.error?.code || '';
        throw new WixError(`Wix rejected the translation: ${detail}`, 'wixRejected', { detail });
      }
    }
  }

  /** An access token for this app instance (OAuth client credentials). */
  async accessToken(): Promise<string> {
    const cacheKey = `${this.options.appId}:${this.options.instanceId}`;
    const cached = this.tokens.get(cacheKey);
    if (cached) return cached;
    if (!this.options.appId || !this.options.appSecret) {
      throw new WixError('WIX_APP_ID and WIX_APP_SECRET must be set.', 'wixNotConfigured');
    }
    const response = await this.send('POST', '/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: this.options.appId,
      client_secret: this.options.appSecret,
      instance_id: this.options.instanceId,
    });
    const data = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      throw new WixError('Wix did not return an access token.', 'wixAuth');
    }
    this.tokens.set(cacheKey, data.access_token, data.expires_in || 4 * 3600);
    return data.access_token;
  }

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.accessToken();
    const response = await this.send(method, path, body, token);
    return (await response.json().catch(() => ({}))) as T;
  }

  private async send(method: string, path: string, body?: unknown, token?: string): Promise<Response> {
    let response: Response;
    for (let attempt = 0; ; attempt++) {
      try {
        response = await this.fetchFn(this.apiBase + path, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: token } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(30_000),
        });
      } catch (error) {
        const reason = (error as Error).message;
        throw new WixError(`Could not reach Wix: ${reason}`, 'wixUnreachable', { params: { reason } });
      }
      if (response.status !== 429 || attempt >= 4) break;
      await response.body?.cancel().catch(() => undefined);
      await this.sleep(retryDelayMs(attempt, response.headers.get('retry-after')));
    }
    if (response.ok) return response;
    if (token && response.status === 401) {
      this.tokens.delete(`${this.options.appId}:${this.options.instanceId}`);
    }
    throw await wixHttpError(response);
  }
}

interface Paging {
  cursors?: { next?: string };
  hasNext?: boolean;
}

interface BulkResult {
  itemMetadata?: { success?: boolean; error?: { code?: string; description?: string } };
}

function nextCursor(paging?: Paging): string | undefined {
  const next = paging?.cursors?.next;
  return next && paging?.hasNext !== false ? next : undefined;
}

async function wixHttpError(response: Response): Promise<WixError> {
  const status = response.status;
  const text = await response.text().catch(() => '');
  let detail = text.slice(0, 300);
  try {
    const data = JSON.parse(text) as { message?: string; details?: { applicationError?: { description?: string; code?: string } } };
    detail = data.details?.applicationError?.description || data.message || detail;
  } catch {
    // not JSON
  }
  detail = detail.replace(/<[^>]*>/g, '').trim().slice(0, 300);
  if (/multilingual/i.test(detail) && (status === 400 || status === 404 || status === 428 || status === 412)) {
    return new WixError('Wix Multilingual is not installed on this site.', 'multilingualMissing', { status, detail });
  }
  if (status === 401 || status === 403) {
    return new WixError(`Wix refused the request (HTTP ${status}).`, 'wixAuth', { status, detail });
  }
  if (status >= 500) {
    return new WixError(`Wix is unavailable (HTTP ${status}).`, 'wixUnavailable', { status, detail });
  }
  return new WixError(`Wix answered with HTTP ${status}.`, 'wixHttp', { status, detail, params: { status } });
}
