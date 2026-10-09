import type { Content, ContentField, Schema, SchemaField } from '../wix/client.js';
import { ricosText } from '../wix/ricos.js';

/**
 * Which fields of a translation schema go to Supertext.
 *
 * Text fields (SHORT_TEXT, LONG_TEXT), HTML and Ricos rich content are
 * translated; images, videos, documents, image links, hidden and display-only
 * fields aren't. A field that already has a translation in the target locale
 * is kept unless "overwrite" is chosen.
 */

export type FieldKind = 'text' | 'html' | 'ricos';

export interface PlannedField {
  key: string;
  kind: FieldKind;
  schemaField: SchemaField;
  source: ContentField;
}

export interface FieldPlan {
  fields: PlannedField[];
  /** Fields left alone because they are translated already. */
  kept: number;
}

const KINDS: Partial<Record<SchemaField['type'], FieldKind>> = {
  SHORT_TEXT: 'text',
  LONG_TEXT: 'text',
  HTML: 'html',
  RICH_CONTENT: 'ricos',
};

/**
 * The schema field for a content key. Keys of repeated items carry an ID in
 * parentheses ("choice(abc)") where the schema has "choice()".
 */
export function schemaFieldFor(schema: Schema, key: string): SchemaField | undefined {
  return schema.fields[key] ?? schema.fields[key.replace(/\([^()]*\)/g, '()')];
}

export function fieldKind(field: SchemaField | undefined): FieldKind | undefined {
  if (!field || field.hidden || field.displayOnly) return undefined;
  return KINDS[field.type];
}

/** Whether a content field holds text worth translating. */
export function hasText(field: ContentField | undefined, kind: FieldKind): boolean {
  if (!field) return false;
  if (kind === 'ricos') return ricosText(field.richContent) !== '';
  const value = field.textValue ?? '';
  return (kind === 'html' ? value.replace(/<[^>]*>|&nbsp;/g, '') : value).trim() !== '';
}

/** Keys of the source content's translatable fields that have text. */
export function translatableKeys(schema: Schema, source: Content): string[] {
  return Object.entries(source.fields ?? {})
    .filter(([key, field]) => {
      const kind = fieldKind(schemaFieldFor(schema, key));
      return kind !== undefined && hasText(field, kind);
    })
    .map(([key]) => key)
    .sort((a, b) => (schemaFieldFor(schema, a)?.index ?? 0) - (schemaFieldFor(schema, b)?.index ?? 0));
}

export function planFields(schema: Schema, source: Content, target: Content | undefined, overwrite: boolean): FieldPlan {
  const fields: PlannedField[] = [];
  let kept = 0;
  for (const key of translatableKeys(schema, source)) {
    const schemaField = schemaFieldFor(schema, key)!;
    const kind = fieldKind(schemaField)!;
    if (!overwrite && hasText(target?.fields?.[key], kind)) {
      kept++;
      continue;
    }
    fields.push({ key, kind, schemaField, source: source.fields[key] });
  }
  return { fields, kept };
}

export type EntityState = 'none' | 'partial' | 'done';

/** How far an entity is translated into a locale. */
export function entityState(schema: Schema, source: Content, target: Content | undefined): EntityState {
  const keys = translatableKeys(schema, source);
  if (keys.length === 0) return 'done';
  const translated = keys.filter((key) => {
    const kind = fieldKind(schemaFieldFor(schema, key))!;
    return hasText(target?.fields?.[key], kind);
  }).length;
  if (translated === 0) return 'none';
  return translated === keys.length ? 'done' : 'partial';
}

/** The text shown for an entity in the list. */
export function entityTitle(schema: Schema, content: Content): string {
  const preview = content.previewField?.trim();
  if (preview) return preview;
  const titleKey = schema.previewFields?.titleFieldId;
  const candidates = [titleKey, ...translatableKeys(schema, content)].filter(Boolean) as string[];
  for (const key of candidates) {
    const field = content.fields?.[key];
    const text = field?.textValue?.replace(/<[^>]*>/g, ' ') ?? ricosText(field?.richContent);
    if (text?.trim()) return text.replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  return content.entityId;
}
