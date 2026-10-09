/**
 * Read-only look at what Wix Multilingual exposes on a real site, through the
 * same calls the app makes: the site's locales, its translation schemas and,
 * per schema, how much content exists in the main language and one sample
 * item (field keys, types and the start of each value).
 *
 *   WIX_APP_ID=… WIX_APP_SECRET=… npm run wix:probe -- <instanceId> [schema entityType or ID]
 *
 * The instance ID is in the app's log line for each dashboard request, or in
 * the app dashboard's installation list. Nothing is written to the site.
 */
import { loadConfig } from '../src/config.js';
import { translatableSchemas } from '../src/translation/site.js';
import { fieldKind, schemaFieldFor } from '../src/translation/fields.js';
import { WIX_APPS, WixClient, type Content } from '../src/wix/client.js';
import { ricosText } from '../src/wix/ricos.js';

const [instanceId, only] = process.argv.slice(2);
if (!instanceId) {
  console.error('Usage: npm run wix:probe -- <instanceId> [schema entityType or ID]');
  process.exit(1);
}
const config = loadConfig();
const wix = new WixClient({ appId: config.wixAppId, appSecret: config.wixAppSecret, instanceId, apiBase: config.wixApiBase });

const short = (value: string) => (value.length > 70 ? `${value.slice(0, 70)}…` : value).replace(/\s+/g, ' ');
const describe = (field: Content['fields'][string]) =>
  field.textValue !== undefined
    ? `text "${short(field.textValue)}"`
    : field.richContent
      ? `rich content "${short(ricosText(field.richContent))}"`
      : Object.keys(field).filter((key) => !['published', 'updatedBy', 'id'].includes(key)).join(', ') || '(empty)';

async function main() {
  const locales = await wix.locales();
  console.log('Locales:');
  for (const locale of locales) {
    console.log(`  ${locale.id}${locale.primaryLocale ? ' (main)' : ''} ${locale.visibility ?? ''} ${locale.displayName ?? ''}`);
  }
  const primary = locales.find((locale) => locale.primaryLocale);

  const schemas = await wix.schemas();
  const translatable = new Set(translatableSchemas(schemas).map((schema) => schema.id));
  console.log(`\nSchemas (${schemas.length}, ${translatable.size} with translatable fields):`);
  for (const schema of schemas) {
    if (only && schema.id !== only && schema.key.entityType !== only) continue;
    const app = schema.key.appId ? (WIX_APPS[schema.key.appId] ?? schema.key.appId) : '?';
    console.log(`\n- ${schema.displayName ?? '(no name)'} | app ${app} | entityType ${schema.key.entityType} | ${schema.key.scope ?? ''} | id ${schema.id}${schema.hidden ? ' | hidden' : ''}`);
    for (const [key, field] of Object.entries(schema.fields ?? {})) {
      const kind = fieldKind(field);
      console.log(`    ${key}: ${field.type}${field.displayOnly ? ' displayOnly' : ''}${field.hidden ? ' hidden' : ''}${field.maxLength ? ` max ${field.maxLength}` : ''}${kind ? `  → translated as ${kind}` : ''}`);
    }
    if (!primary || !translatable.has(schema.id)) continue;
    const page = await wix.queryContents({ schemaId: { $eq: schema.id }, locale: { $eq: primary.id } }, 3);
    const others = await wix.queryContents({ schemaId: { $eq: schema.id }, locale: { $ne: primary.id } }, 3);
    console.log(`    content in ${primary.id}: ${page.items.length}${page.nextCursor ? '+' : ''} item(s); in other locales: ${others.items.length}${others.nextCursor ? '+' : ''}`);
    const sample = page.items[0] ?? others.items[0];
    if (sample) {
      console.log(`    sample ${sample.entityId} (${sample.locale})${sample.parentEntityId ? ` parent ${sample.parentEntityId}` : ''}:`);
      for (const [key, field] of Object.entries(sample.fields ?? {})) {
        const known = schemaFieldFor(schema, key) ? '' : '  (not in schema)';
        console.log(`      ${key}: ${describe(field)}${field.published !== undefined ? ` published=${field.published}` : ''}${field.updatedBy ? ` by ${field.updatedBy}` : ''}${known}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}${(error as { detail?: string }).detail ? ` (${(error as { detail?: string }).detail})` : ''}` : error);
  process.exit(1);
});
