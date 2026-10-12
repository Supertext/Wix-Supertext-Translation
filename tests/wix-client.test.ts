import { describe, expect, it } from 'vitest';
import { TokenCache, WixClient, type Content } from '../src/wix/client.js';
import { createWixStandin } from './standin/wix.js';
import { CATEGORIES, PRODUCTS } from './standin/seed.js';

const setup = () => {
  const wix = createWixStandin();
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => wix.handle(new Request(input, init))) as typeof fetch;
  return {
    wix,
    client: new WixClient({ appId: 'a', appSecret: 's', instanceId: 'i', apiBase: 'https://wixapis.test', fetch: fetchFn, tokens: new TokenCache() }),
  };
};

const find = (contents: Content[], entityId: string, locale: string) =>
  contents.find((content) => content.entityId === entityId && content.locale === locale);

describe('saving translation content', () => {
  it('creates the translation when the item has none in that language yet', async () => {
    const { wix, client } = setup();
    await client.saveContent(
      { schemaId: PRODUCTS, entityId: 'prod-hazelnut-bar', locale: 'fr-CH', fields: { name: { textValue: 'Tablette', updatedBy: 'EXTERNAL_APP' } } },
      false,
    );
    expect(find(wix.contents, 'prod-hazelnut-bar', 'fr-CH')?.fields.name.textValue).toBe('Tablette');
    expect(wix.log.filter((line) => line.startsWith('POST /translation-content'))).toEqual(['POST /translation-content/v1/contents']);
  });

  it('updates an existing translation by key, keeping the other fields', async () => {
    const { wix, client } = setup();
    await client.saveContent(
      { schemaId: CATEGORIES, entityId: 'cat-swiss-chocolate', locale: 'de-CH', fields: { description: { textValue: '<p>Neu</p>', updatedBy: 'EXTERNAL_APP' } } },
      true,
    );
    const de = find(wix.contents, 'cat-swiss-chocolate', 'de-CH')!;
    expect(de.fields.description.textValue).toBe('<p>Neu</p>');
    expect(de.fields.name.textValue).toBe('Schweizer Schokolade');
  });

  it('falls back to the other call when Wix disagrees about whether the translation exists', async () => {
    const { wix, client } = setup();
    // Believed missing, but exists: create is refused, update by key follows.
    await client.saveContent(
      { schemaId: CATEGORIES, entityId: 'cat-swiss-chocolate', locale: 'de-CH', fields: { description: { textValue: '<p>A</p>', updatedBy: 'EXTERNAL_APP' } } },
      false,
    );
    expect(find(wix.contents, 'cat-swiss-chocolate', 'de-CH')!.fields.description.textValue).toBe('<p>A</p>');
    // Believed to exist, but missing: "Entity not found", then create.
    await client.saveContent(
      { schemaId: CATEGORIES, entityId: 'cat-swiss-chocolate', locale: 'it-CH', fields: { name: { textValue: 'Cioccolato', updatedBy: 'EXTERNAL_APP' } } },
      true,
    );
    expect(find(wix.contents, 'cat-swiss-chocolate', 'it-CH')!.fields.name.textValue).toBe('Cioccolato');
  });
});
