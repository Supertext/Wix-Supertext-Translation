import { LocalizedError } from '../i18n/error.js';
import type { Politeness, SupertextClient } from '../supertext/client.js';
import { MAX_DOCUMENT_CHARACTERS } from '../supertext/client.js';
import { buildDocument, parseDocument, type Segment } from '../supertext/html.js';
import type { Content, ContentField, Schema, WixClient } from '../wix/client.js';
import { extractRicos, type RicosExtraction } from '../wix/ricos.js';
import { planFields, type PlannedField } from './fields.js';

/**
 * One entity (a product, a blog post …) into one locale: read the original
 * content, send the fields that need translating to Supertext in one HTML
 * document, write the translations back to Wix Multilingual.
 */

export interface TranslateEntityOptions {
  wix: Pick<WixClient, 'updateContentsByKey'>;
  supertext: Pick<SupertextClient, 'translateDocument'>;
  schema: Schema;
  source: Content;
  /** The entity's current content in the target locale, if any. */
  target?: Content;
  locale: string;
  supertextTarget: string;
  sourceLanguage: string;
  politeness?: Politeness;
  overwrite: boolean;
  /** Mark the translations as ready to publish on the live site. */
  publish: boolean;
}

export interface EntityResult {
  /** Fields written. */
  written: number;
  /** Fields that were translated already and kept. */
  kept: number;
  /** Fields whose translation exceeded the schema's maximum length. */
  tooLong: number;
}

interface Part {
  field: PlannedField;
  first: number;
  count: number;
  ricos?: RicosExtraction;
}

export async function translateEntity(options: TranslateEntityOptions): Promise<EntityResult> {
  const { schema, source, target, overwrite } = options;
  const plan = planFields(schema, source, target, overwrite);
  if (plan.fields.length === 0) {
    return { written: 0, kept: plan.kept, tooLong: 0 };
  }

  const segments: Segment[] = [];
  const parts: Part[] = plan.fields.map((field) => {
    const first = segments.length;
    if (field.kind === 'ricos') {
      const ricos = extractRicos(field.source.richContent!);
      segments.push(...ricos.segments);
      return { field, first, count: ricos.segments.length, ricos };
    }
    segments.push({ text: field.source.textValue ?? '', html: field.kind === 'html' });
    return { field, first, count: 1 };
  });

  const translated = await translateSegments(segments, options);

  const fields: Record<string, ContentField> = {};
  let tooLong = 0;
  for (const part of parts) {
    let value: ContentField;
    if (part.ricos) {
      const map = new Map<number, string>();
      for (let i = 0; i < part.count; i++) map.set(i, translated.get(part.first + i)!);
      value = { richContent: part.ricos.rebuild(map) };
    } else {
      const text = translated.get(part.first)!;
      const max = part.field.schemaField.maxLength;
      if (max && text.length > max) {
        tooLong++;
        continue;
      }
      value = { textValue: text };
    }
    fields[part.field.key] = { ...value, published: options.publish, updatedBy: 'EXTERNAL_APP' };
  }

  const written = Object.keys(fields).length;
  if (written > 0) {
    await options.wix.updateContentsByKey([
      {
        schemaId: schema.id,
        entityId: source.entityId,
        locale: options.locale,
        fields,
        ...(source.parentEntityId ? { parentEntityId: source.parentEntityId } : {}),
      },
    ]);
  }
  return { written, kept: plan.kept, tooLong };
}

/** Translates segments in as few documents as possible; every segment must come back. */
async function translateSegments(segments: Segment[], options: TranslateEntityOptions): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  for (const chunk of chunks(segments)) {
    const local = chunk.map((index) => segments[index]);
    const html = await options.supertext.translateDocument(buildDocument(local), {
      targetLanguage: options.supertextTarget,
      sourceLanguage: options.sourceLanguage,
      politeness: options.politeness,
    });
    const parsed = parseDocument(html, local);
    if (parsed.size !== local.length) {
      throw new LocalizedError(
        `Supertext returned ${parsed.size} of ${local.length} texts; nothing was saved for this item.`,
        'incomplete',
        { received: parsed.size, sent: local.length },
      );
    }
    parsed.forEach((value, localIndex) => result.set(chunk[localIndex], value));
  }
  return result;
}

/** Groups segment indexes into documents below the size limit. */
function chunks(segments: Segment[]): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  let size = 0;
  segments.forEach((segment, index) => {
    const length = segment.text.length + 40;
    if (current.length > 0 && size + length > MAX_DOCUMENT_CHARACTERS) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(index);
    size += length;
  });
  if (current.length > 0) groups.push(current);
  return groups;
}
