import { LocalizedError } from '../i18n/error.js';
import type { Content, Schema, WixClient, WixLocale } from '../wix/client.js';
import { WIX_APPS, WIX_STORES_APP_ID } from '../wix/client.js';
import { entityState, entityTitle, fieldKind, type EntityState } from './fields.js';

/** What the translate page shows: the site's languages, translatable content types and items. */

export interface SiteLanguages {
  primary: WixLocale;
  targets: WixLocale[];
}

export async function siteLanguages(wix: Pick<WixClient, 'locales'>): Promise<SiteLanguages> {
  const locales = await wix.locales();
  const primary = locales.find((locale) => locale.primaryLocale);
  if (!primary) {
    throw new LocalizedError('Wix Multilingual is not set up on this site.', 'multilingualMissing');
  }
  return { primary, targets: locales.filter((locale) => !locale.primaryLocale) };
}

export const localeName = (locale: WixLocale): string =>
  locale.effectiveDisplayName || locale.displayName || locale.id;

/** Schemas with at least one translatable field: Wix Stores first (products first), other Wix apps, then the rest. */
export function translatableSchemas(schemas: Schema[]): Schema[] {
  const rank = (schema: Schema) =>
    (schema.key.appId === WIX_STORES_APP_ID ? 0 : schemaGroup(schema) ? 2 : 4) +
    (/product/i.test(schema.key.entityType) ? 0 : 1);
  return schemas
    .filter((schema) => !schema.hidden && Object.values(schema.fields ?? {}).some((field) => fieldKind(field)))
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        schemaGroup(a).localeCompare(schemaGroup(b)) ||
        schemaName(a).localeCompare(schemaName(b)),
    );
}

/** "Wix Stores", "Wix Blog" … or the entity type for other apps. */
export function schemaGroup(schema: Schema): string {
  const app = schema.key.appId ? WIX_APPS[schema.key.appId] : undefined;
  return app ?? '';
}

export function schemaName(schema: Schema): string {
  return schema.displayName?.trim() || humanize(schema.key.entityType);
}

const humanize = (value: string): string =>
  value
    .replace(/[-_.]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (letter) => letter.toUpperCase());

export interface EntityRow {
  entityId: string;
  title: string;
  states: Record<string, EntityState>;
}

export interface EntityPage {
  rows: EntityRow[];
  nextCursor?: string;
}

/** One page of items of a schema, with their state in every target language. */
export async function entityPage(
  wix: Pick<WixClient, 'queryContents' | 'allContents'>,
  schema: Schema,
  languages: SiteLanguages,
  cursor?: string,
  limit = 25,
): Promise<EntityPage> {
  const page = await wix.queryContents(
    { schemaId: { $eq: schema.id }, locale: { $eq: languages.primary.id } },
    limit,
    cursor,
  );
  const ids = page.items.map((content) => content.entityId);
  const targets =
    ids.length > 0 && languages.targets.length > 0
      ? await wix.allContents({
          schemaId: { $eq: schema.id },
          entityId: { $in: ids },
          locale: { $in: languages.targets.map((locale) => locale.id) },
        })
      : [];
  const byKey = new Map(targets.map((content) => [`${content.entityId}|${content.locale}`, content]));
  return {
    rows: page.items.map((source) => ({
      entityId: source.entityId,
      title: entityTitle(schema, source),
      states: Object.fromEntries(
        languages.targets.map((locale) => [
          locale.id,
          entityState(schema, source, byKey.get(`${source.entityId}|${locale.id}`)),
        ]),
      ),
    })),
    nextCursor: page.nextCursor,
  };
}

/** Index content by entity ID and locale. */
export function contentIndex(contents: Content[]): Map<string, Content> {
  return new Map(contents.map((content) => [`${content.entityId}|${content.locale}`, content]));
}
