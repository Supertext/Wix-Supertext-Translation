import { describe, expect, it } from 'vitest';
import { entityState, entityTitle, planFields, schemaFieldFor } from '../src/translation/fields.js';
import { translatableSchemas } from '../src/translation/site.js';
import { contents, schemas, PRODUCTS, CATEGORIES } from './standin/seed.js';

const products = schemas.find((schema) => schema.id === PRODUCTS)!;
const categories = schemas.find((schema) => schema.id === CATEGORIES)!;
const praline = contents.find((content) => content.entityId === 'prod-praline-box')!;
const category = contents.find((content) => content.entityId === 'cat-swiss-chocolate' && content.locale === 'en-US')!;
const categoryDe = contents.find((content) => content.entityId === 'cat-swiss-chocolate' && content.locale === 'de-CH')!;

describe('field selection', () => {
  it('translates text, HTML and rich content, in schema order, and skips images', () => {
    const plan = planFields(products, praline, undefined, false);
    expect(plan.fields.map((field) => [field.key, field.kind])).toEqual([
      ['name', 'text'],
      ['description', 'ricos'],
      ['choice(small)', 'text'],
      ['seoDescription', 'text'],
    ]);
  });

  it('finds the schema field of repeated items', () => {
    expect(schemaFieldFor(products, 'choice(small)')?.displayName).toBe('Option choice');
    expect(schemaFieldFor(products, 'nothing')).toBeUndefined();
  });

  it('keeps fields that are translated already, unless overwriting', () => {
    expect(planFields(categories, category, categoryDe, false)).toMatchObject({ kept: 1, fields: [{ key: 'description' }] });
    expect(planFields(categories, category, categoryDe, true).fields).toHaveLength(2);
  });

  it('knows how far an item is translated', () => {
    expect(entityState(categories, category, undefined)).toBe('none');
    expect(entityState(categories, category, categoryDe)).toBe('partial');
    expect(entityState(categories, category, { ...categoryDe, fields: { ...categoryDe.fields, description: { textValue: '<p>x</p>' } } })).toBe('done');
  });

  it('names items by their preview field', () => {
    expect(entityTitle(products, praline)).toBe('Dark chocolate praline box');
    expect(entityTitle(products, { ...praline, previewField: undefined })).toBe('Dark chocolate praline box');
  });

  it('offers schemas with translatable fields, Wix apps by name', () => {
    expect(translatableSchemas(schemas).map((schema) => schema.displayName)).toEqual(['Products', 'Categories', 'Blog posts']);
    expect(translatableSchemas([{ id: 'x', key: { entityType: 'logo' }, fields: { img: { type: 'IMAGE' } } }])).toEqual([]);
  });
});
