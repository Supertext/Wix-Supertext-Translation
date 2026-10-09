import type { Content, RichContent, RicosDecoration, RicosNode, Schema, WixLocale } from '../../src/wix/client.js';

/**
 * Sample site for tests, the stand-in Wix API and the screenshots: a Swiss
 * chocolate shop in English with German, French and Italian (Switzerland),
 * two Wix Stores products, a category and a Wix Blog post. The schema shapes
 * follow the Wix Translation Schema API; the field keys are this stand-in's
 * own (a real site's are listed by `npm run wix:probe`).
 */

export const STORES = '1380b703-ce81-ff05-f115-39571d94dfcd';
export const BLOG = '14bcded7-0066-7c35-14d7-466cb3f09103';

export const locales: WixLocale[] = [
  { id: 'en-US', languageCode: 'en', regionCode: 'US', primaryLocale: true, visibility: 'VISIBLE', displayName: 'English' },
  { id: 'de-CH', languageCode: 'de', regionCode: 'CH', visibility: 'VISIBLE', displayName: 'German (Switzerland)' },
  { id: 'fr-CH', languageCode: 'fr', regionCode: 'CH', visibility: 'VISIBLE', displayName: 'French (Switzerland)' },
  { id: 'it-CH', languageCode: 'it', regionCode: 'CH', visibility: 'HIDDEN', displayName: 'Italian (Switzerland)' },
];

export const PRODUCTS = '6a1f2c3d-0001-4000-8000-000000000001';
export const CATEGORIES = '6a1f2c3d-0002-4000-8000-000000000002';
export const POSTS = '6a1f2c3d-0003-4000-8000-000000000003';

export const schemas: Schema[] = [
  {
    id: PRODUCTS,
    key: { appId: STORES, entityType: 'product', scope: 'GLOBAL' },
    displayName: 'Products',
    previewFields: { titleFieldId: 'name', imageFieldId: 'mainImage' },
    fields: {
      name: { type: 'SHORT_TEXT', displayName: 'Name', maxLength: 80, index: 0 },
      description: { type: 'RICH_CONTENT', displayName: 'Description', index: 1 },
      'choice()': { type: 'SHORT_TEXT', displayName: 'Option choice', index: 2 },
      seoDescription: { type: 'LONG_TEXT', displayName: 'SEO description', index: 3 },
      mainImage: { type: 'IMAGE', displayName: 'Image', displayOnly: true, index: 4 },
    },
  },
  {
    id: CATEGORIES,
    key: { appId: STORES, entityType: 'category', scope: 'GLOBAL' },
    displayName: 'Categories',
    previewFields: { titleFieldId: 'name' },
    fields: {
      name: { type: 'SHORT_TEXT', displayName: 'Name', index: 0 },
      description: { type: 'HTML', displayName: 'Description', index: 1 },
    },
  },
  {
    id: POSTS,
    key: { appId: BLOG, entityType: 'post', scope: 'GLOBAL' },
    displayName: 'Blog posts',
    previewFields: { titleFieldId: 'title' },
    fields: {
      title: { type: 'SHORT_TEXT', displayName: 'Title', index: 0 },
      excerpt: { type: 'LONG_TEXT', displayName: 'Excerpt', index: 1 },
      content: { type: 'RICH_CONTENT', displayName: 'Content', index: 2 },
    },
  },
];

const text = (value: string, decorations: RicosDecoration[] = []): RicosNode => ({
  type: 'TEXT',
  id: '',
  nodes: [],
  textData: { text: value, decorations },
});
let paragraphs = 0;
const paragraph = (...nodes: RicosNode[]): RicosNode => ({ type: 'PARAGRAPH', id: `p${++paragraphs}`, nodes, paragraphData: {} });
const bold = { type: 'BOLD', fontWeightValue: 700 };
const italic = { type: 'ITALIC', italicData: true };
const link = (url: string) => ({ type: 'LINK', linkData: { link: { url, target: 'BLANK' } } });

const praline: RichContent = {
  nodes: [
    { type: 'HEADING', id: 'h1', nodes: [text('Made by hand in Bern')], headingData: { level: 2 } },
    paragraph(
      text('Twelve handmade pralines with '),
      text('70% dark chocolate', [bold]),
      text(' from Bern. Read more about '),
      text('our chocolatiers', [link('https://www.supertext.com')]),
      text('.'),
    ),
    {
      type: 'BULLETED_LIST',
      id: 'l1',
      nodes: [
        { type: 'LIST_ITEM', id: 'li1', nodes: [paragraph(text('Fresh cream and butter from local farms'))] },
        { type: 'LIST_ITEM', id: 'li2', nodes: [paragraph(text('No palm oil, no preservatives'))] },
      ],
    },
  ],
  metadata: { version: 1 },
};

const bar: RichContent = {
  nodes: [paragraph(text('Creamy Swiss milk chocolate with '), text('whole roasted hazelnuts', [italic]), text('.'))],
  metadata: { version: 1 },
};

const post: RichContent = {
  nodes: [
    paragraph(text('Every morning our chocolatiers temper the chocolate by hand.')),
    paragraph(text('Then they fill each praline with fresh ganache.')),
  ],
  metadata: { version: 1 },
};

export const contents: Content[] = [
  {
    schemaId: PRODUCTS,
    entityId: 'prod-praline-box',
    locale: 'en-US',
    previewField: 'Dark chocolate praline box',
    fields: {
      name: { textValue: 'Dark chocolate praline box' },
      description: { richContent: praline },
      'choice(small)': { textValue: 'Box of 12' },
      seoDescription: { textValue: 'Twelve handmade pralines with 70% dark chocolate, delivered fresh across Switzerland.' },
      mainImage: { image: { id: 'praline.jpg', url: 'https://static.wixstatic.com/media/praline.jpg' } },
    },
  },
  {
    schemaId: PRODUCTS,
    entityId: 'prod-hazelnut-bar',
    locale: 'en-US',
    previewField: 'Milk chocolate bar with hazelnuts',
    fields: {
      name: { textValue: 'Milk chocolate bar with hazelnuts' },
      description: { richContent: bar },
    },
  },
  {
    schemaId: CATEGORIES,
    entityId: 'cat-swiss-chocolate',
    locale: 'en-US',
    previewField: 'Swiss chocolate',
    fields: {
      name: { textValue: 'Swiss chocolate' },
      description: {
        textValue: '<p>Handmade pralines, bars and truffles from our workshop in <strong>Bern</strong>.</p>',
      },
    },
  },
  {
    // Translated by hand already: the category's name in German.
    schemaId: CATEGORIES,
    entityId: 'cat-swiss-chocolate',
    locale: 'de-CH',
    fields: { name: { textValue: 'Schweizer Schokolade', updatedBy: 'USER', published: true } },
  },
  {
    schemaId: POSTS,
    entityId: 'post-pralines',
    locale: 'en-US',
    previewField: 'How we make our pralines',
    fields: {
      title: { textValue: 'How we make our pralines' },
      excerpt: { textValue: 'A morning in our workshop in Bern.' },
      content: { richContent: post },
    },
  },
];
