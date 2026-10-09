import type { Content, Schema, WixLocale } from '../../src/wix/client.js';
import * as seed from './seed.js';

/**
 * A stand-in for the Wix REST API calls the app makes (OAuth token, Locales,
 * Translation Schema, Translation Content). In memory; one site.
 * `handle(request)` is a fetch handler, so tests can call it directly.
 */

export interface WixStandin {
  handle(request: Request): Promise<Response>;
  contents: Content[];
  locales: WixLocale[];
  schemas: Schema[];
  /** Requests received (method + path), for assertions. */
  log: string[];
}

export function createWixStandin(options: { locales?: WixLocale[]; schemas?: Schema[]; contents?: Content[] } = {}): WixStandin {
  const state: WixStandin = {
    locales: structuredClone(options.locales ?? seed.locales),
    schemas: structuredClone(options.schemas ?? seed.schemas),
    contents: structuredClone(options.contents ?? seed.contents),
    log: [],
    handle: async (request) => {
      const url = new URL(request.url);
      const path = url.pathname;
      state.log.push(`${request.method} ${path}`);
      const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      const body = request.method === 'POST' ? ((await request.json().catch(() => ({}))) as Record<string, any>) : {};

      if (path === '/oauth2/token') {
        if (body.grant_type !== 'client_credentials' || !body.client_id || !body.client_secret || !body.instance_id) {
          return json({ message: 'invalid client' }, 400);
        }
        return json({ access_token: `token-${body.instance_id}`, token_type: 'Bearer', expires_in: 14400 });
      }
      if (!request.headers.get('authorization')?.startsWith('token-')) {
        return json({ message: 'Unauthorized' }, 401);
      }
      if (path === '/locales/v2/locale/query') {
        return json({ locales: state.locales, pagingMetadata: { count: state.locales.length, hasNext: false } });
      }
      if (path === '/translation-schema/v1/schemas/site') {
        return json({ schemas: state.schemas, pagingMetadata: { count: state.schemas.length, hasNext: false } });
      }
      if (path === '/translation-content/v1/contents/query') {
        const query = body.query ?? {};
        const limit = query.cursorPaging?.limit ?? 50;
        const cursor = query.cursorPaging?.cursor as string | undefined;
        let filter = query.filter ?? {};
        let offset = 0;
        if (cursor) {
          const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
          filter = decoded.filter;
          offset = decoded.offset;
        }
        const matches = state.contents.filter((content) => matchesFilter(content, filter));
        const page = matches.slice(offset, offset + limit);
        const hasNext = offset + limit < matches.length;
        const next = hasNext
          ? Buffer.from(JSON.stringify({ filter, offset: offset + limit })).toString('base64url')
          : undefined;
        return json({
          contents: page.map((content) => ({ id: `${content.schemaId}:${content.entityId}:${content.locale}`, ...content })),
          pagingMetadata: { count: page.length, hasNext, cursors: next ? { next } : {} },
        });
      }
      if (path === '/translation-content/v1/bulk/contents/update-by-key') {
        const results = [];
        for (const item of body.contents ?? []) {
          const content = item.content as Content;
          const schema = state.schemas.find((candidate) => candidate.id === content.schemaId);
          if (!schema || !content.entityId || !content.locale) {
            results.push({ itemMetadata: { success: false, error: { code: 'INVALID', description: 'Unknown schema' } } });
            continue;
          }
          for (const [key, field] of Object.entries(content.fields ?? {})) {
            if (!field.updatedBy) {
              return json({ message: `fields.${key}.updatedBy is required` }, 400);
            }
            const schemaField = schema.fields[key] ?? schema.fields[key.replace(/\([^()]*\)/g, '()')];
            if (!schemaField) {
              results.push({ itemMetadata: { success: false, error: { code: 'INVALID_FIELD', description: `No field ${key}` } } });
            }
          }
          let existing = state.contents.find(
            (candidate) =>
              candidate.schemaId === content.schemaId &&
              candidate.entityId === content.entityId &&
              candidate.locale === content.locale,
          );
          if (!existing) {
            existing = { schemaId: content.schemaId, entityId: content.entityId, locale: content.locale, fields: {} };
            state.contents.push(existing);
          }
          for (const [key, field] of Object.entries(content.fields ?? {})) {
            if (Object.keys(field).length === 0) delete existing.fields[key];
            else existing.fields[key] = field;
          }
          results.push({ itemMetadata: { success: true } });
        }
        return json({ results, bulkActionMetadata: { totalSuccesses: results.length, totalFailures: 0 } });
      }
      return json({ message: `No stand-in for ${request.method} ${path}` }, 404);
    },
  };
  return state;
}

/** The subset of Wix's query language the app uses: $eq, $in, $ne and plain values. */
function matchesFilter(content: Content, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([field, condition]) => {
    const value = (content as unknown as Record<string, unknown>)[field];
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      const ops = condition as Record<string, unknown>;
      if ('$eq' in ops && value !== ops.$eq) return false;
      if ('$ne' in ops && value === ops.$ne) return false;
      if ('$in' in ops && !(ops.$in as unknown[]).includes(value)) return false;
      return true;
    }
    return value === condition;
  });
}
