import type { Politeness, SegmentInput, SupertextClient } from '../supertext/index.js';
import type { Content, ContentField, Schema, WixClient } from '../wix/client.js';
import { extractRicos, type RicosExtraction } from '../wix/ricos.js';
import { planFields, type PlannedField } from './fields.js';

/**
 * One entity (a product, a blog post …) into one locale: read the original
 * content, send the fields that need translating to Supertext (the SDK packs
 * them into as few documents as possible, one segment per text field, HTML
 * field or rich-text block), write the translations back to Wix Multilingual.
 */

export interface TranslateEntityOptions {
  wix: Pick<WixClient, 'saveContent'>;
  supertext: Pick<SupertextClient, 'translateTexts'>;
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

  const segments: { text: string; html: boolean }[] = [];
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
    await options.wix.saveContent(
      {
        schemaId: schema.id,
        entityId: source.entityId,
        locale: options.locale,
        fields,
        ...(source.parentEntityId ? { parentEntityId: source.parentEntityId } : {}),
      },
      target !== undefined,
    );
  }
  return { written, kept: plan.kept, tooLong };
}

/** Translates the segments; the SDK fails with `incomplete_response` if any comes back missing. */
async function translateSegments(
  segments: { text: string; html: boolean }[],
  options: TranslateEntityOptions,
): Promise<Map<number, string>> {
  const input = new Map<string, SegmentInput>(segments.map((segment, index) => [String(index), segment]));
  const translated = await options.supertext.translateTexts(input, options.supertextTarget, {
    sourceLang: options.sourceLanguage,
    ...(options.politeness ? { politeness: options.politeness } : {}),
  });
  return new Map([...translated].map(([key, value]) => [Number(key), value]));
}
