import { describe, expect, it } from 'vitest';
import { signInstance } from '../src/auth/instance.js';
import type { Job } from '../src/store/store.js';
import { APP_SECRET, INSTANCE_ID, setup } from './helpers.js';
import { CATEGORIES, PRODUCTS } from './standin/seed.js';

const startJob = async (env: ReturnType<typeof setup>, body: Record<string, unknown>) => {
  const response = await env.request('/api/jobs', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  return { status: response.status, json: (await response.json()) as { id?: string; error?: { code?: string } } };
};

const content = (env: ReturnType<typeof setup>, entityId: string, locale: string) =>
  env.wix.contents.find((candidate) => candidate.entityId === entityId && candidate.locale === locale);

describe('translate page', () => {
  it('lists the content types, items and their state per language', async () => {
    const env = setup();
    const response = await env.page('/', { type: CATEGORIES });
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('Translate with Supertext');
    expect(html).toMatch(/<optgroup label="Wix Stores">.*Products.*Categories.*<optgroup label="Wix Blog">/s);
    expect(html).toContain('Swiss chocolate');
    expect(html).toContain('Partly translated');
    expect(html).toContain('Translating from English');
    expect(html).toContain('German (Switzerland)');
    expect(html).toContain('<code>de-CH</code>');
    expect(html).toContain('hidden on the site');
  });

  it('follows the dashboard language', async () => {
    const env = setup();
    const html = await (await env.page('/', { locale: 'de' })).text();
    expect(html).toContain('Mit Supertext übersetzen');
    expect(html).toContain('Nicht übersetzt');
  });

  it('turns away requests that Wix did not sign', async () => {
    const env = setup();
    const forged = signInstance({ instanceId: INSTANCE_ID, uid: 'u' }, 'not-the-secret');
    expect((await env.app.request(`/?instance=${forged}`)).status).toBe(401);
    expect((await env.app.request('/api/jobs', { method: 'POST', headers: { 'X-Wix-Instance': forged } })).status).toBe(401);
  });

  it('asks for an API key when there is none', async () => {
    const env = setup({ SUPERTEXT_API_KEY: '' });
    const html = await (await env.page('/')).text();
    expect(html).toContain('Add your Supertext API key');
    expect(html).toContain('https://www.supertext.com/person/en/account/signin');
    expect(html).toContain('https://www.supertext.com/en/integrations/api');
    const { status, json } = await startJob(env, { schemaId: PRODUCTS, entityIds: ['prod-praline-box'], locales: ['de-CH'] });
    expect(status).toBe(400);
    expect(json.error?.code).toBe('noApiKey');
  });
});

describe('translation job', () => {
  it('translates the selected items into the selected languages and writes them to Wix Multilingual', async () => {
    const env = setup();
    const { json } = await startJob(env, {
      schemaId: PRODUCTS,
      entityIds: ['prod-praline-box', 'prod-hazelnut-bar'],
      locales: ['de-CH', 'fr-CH'],
    });
    await env.settle();
    const job = (await env.store.getJob(INSTANCE_ID, json.id!)) as Job;
    expect(job.status).toBe('done');
    expect(job.items.map((item) => [item.entityId, item.locale, item.state, item.written])).toEqual([
      ['prod-praline-box', 'de-CH', 'translated', 4],
      ['prod-praline-box', 'fr-CH', 'translated', 4],
      ['prod-hazelnut-bar', 'de-CH', 'translated', 2],
      ['prod-hazelnut-bar', 'fr-CH', 'translated', 2],
    ]);

    const de = content(env, 'prod-praline-box', 'de-CH')!;
    expect(de.fields.name).toEqual({ textValue: 'Pralinenbox mit dunkler Schokolade', published: true, updatedBy: 'EXTERNAL_APP' });
    expect(de.fields['choice(small)'].textValue).toBe('Schachtel mit 12 Stück');
    expect(de.fields.mainImage).toBeUndefined();
    const paragraph = de.fields.description.richContent!.nodes[1].nodes!;
    expect(paragraph.map((node) => node.textData!.text).join('')).toBe(
      'Zwölf handgemachte Pralinen mit 70 % dunkler Schokolade aus Bern. Mehr über unsere Chocolatiers.',
    );
    expect(paragraph.find((node) => node.textData!.text === 'unsere Chocolatiers')!.textData!.decorations![0].type).toBe('LINK');
    expect(de.fields.description.richContent!.nodes[2].nodes![1].nodes![0].nodes![0].textData!.text).toBe(
      'Ohne Palmöl, ohne Konservierungsstoffe',
    );
    expect(content(env, 'prod-hazelnut-bar', 'fr-CH')!.fields.name.textValue).toBe('Tablette de chocolat au lait aux noisettes');

    // One document per item and language, source as the bare language, target with region.
    expect(env.supertext.documents).toHaveLength(4);
    expect(env.supertext.documents[0]).toMatchObject({ target: 'de-CH', source: 'en' });
    // Access tokens are reused (at most one token request).
    expect(env.wix.log.filter((line) => line.endsWith('/oauth2/token')).length).toBeLessThanOrEqual(1);

    // The page shows the result.
    const panel = (await (await env.request(`/api/jobs/${json.id}?locale=en`)).json()) as { status: string; html: string };
    expect(panel.status).toBe('done');
    expect(panel.html).toContain('Done: 4 translated, 0 unchanged, 0 failed.');
    expect(panel.html).toContain('Translated (4 fields)');
  });

  it('keeps existing translations unless asked to overwrite', async () => {
    const env = setup();
    const first = await startJob(env, { schemaId: CATEGORIES, entityIds: ['cat-swiss-chocolate'], locales: ['de-CH'] });
    await env.settle();
    const job = (await env.store.getJob(INSTANCE_ID, first.json.id!))!;
    expect(job.items[0]).toMatchObject({ state: 'translated', written: 1, kept: 1 });
    expect(content(env, 'cat-swiss-chocolate', 'de-CH')!.fields.description.textValue).toContain('<strong>Bern</strong>');

    content(env, 'cat-swiss-chocolate', 'de-CH')!.fields.name.textValue = 'Von Hand geändert';
    await startJob(env, { schemaId: CATEGORIES, entityIds: ['cat-swiss-chocolate'], locales: ['de-CH'] });
    await env.settle();
    expect((await env.store.latestJob(INSTANCE_ID))!.items[0]).toMatchObject({ state: 'unchanged', kept: 2 });
    expect(content(env, 'cat-swiss-chocolate', 'de-CH')!.fields.name.textValue).toBe('Von Hand geändert');

    await startJob(env, { schemaId: CATEGORIES, entityIds: ['cat-swiss-chocolate'], locales: ['de-CH'], overwrite: true });
    await env.settle();
    expect(content(env, 'cat-swiss-chocolate', 'de-CH')!.fields.name.textValue).toBe('Schweizer Schokolade');
  });

  it('uses the site settings: tone, language codes, publishing', async () => {
    const env = setup();
    const settings = await env.store.getSettings(INSTANCE_ID);
    await env.store.saveSettings({ ...settings, tone: 'more', publish: false, languageCodes: { 'fr-CH': 'fr-FR' } });
    await startJob(env, { schemaId: PRODUCTS, entityIds: ['prod-hazelnut-bar'], locales: ['fr-CH'] });
    await env.settle();
    expect(env.supertext.documents[0]).toMatchObject({ target: 'fr-FR', politeness: 'more' });
    expect(content(env, 'prod-hazelnut-bar', 'fr-CH')!.fields.name.published).toBe(false);
  });

  it('skips a language Supertext rejects and stops on authentication errors', async () => {
    const env = setup();
    const settings = await env.store.getSettings(INSTANCE_ID);
    await env.store.saveSettings({ ...settings, languageCodes: { 'de-CH': 'de' } });
    await startJob(env, { schemaId: PRODUCTS, entityIds: ['prod-praline-box', 'prod-hazelnut-bar'], locales: ['de-CH', 'fr-CH'] });
    await env.settle();
    const job = (await env.store.latestJob(INSTANCE_ID))!;
    expect(job.status).toBe('done');
    expect(job.items.filter((item) => item.locale === 'de-CH').map((item) => item.error?.code)).toEqual(['languagePair', 'languagePair']);
    expect(job.items.filter((item) => item.locale === 'fr-CH').every((item) => item.state === 'translated')).toBe(true);
    expect(env.supertext.documents.map((document) => document.target)).toEqual(['fr-CH', 'fr-CH']);

    await env.store.saveSettings({ ...settings, apiKey: 'invalid' });
    await startJob(env, { schemaId: PRODUCTS, entityIds: ['prod-praline-box', 'prod-hazelnut-bar'], locales: ['de-CH', 'fr-CH'] });
    await env.settle();
    const failed = (await env.store.latestJob(INSTANCE_ID))!;
    expect(failed.status).toBe('failed');
    expect(failed.error?.code).toBe('auth');
    expect(failed.items).toHaveLength(1);
  });
});

describe('settings', () => {
  it('saves the key, tone, publishing and language codes, and reports invalid codes', async () => {
    const env = setup();
    const form = new URLSearchParams({
      instance: env.instance,
      locale: 'fr',
      apiKey: 'Supertext-Auth-Key my-key',
      tone: 'less',
      'code:de-CH': 'de-ch',
      'code:fr-CH': 'french',
    });
    const response = await env.app.request('/settings', { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('invalid=french');
    expect(response.headers.get('location')).toContain('locale=fr');
    const saved = await env.store.getSettings(INSTANCE_ID);
    expect(saved).toMatchObject({ apiKey: 'Supertext-Auth-Key my-key', tone: 'less', publish: false, languageCodes: { 'de-CH': 'de-CH' } });

    const html = await (await env.app.request(response.headers.get('location')!)).text();
    expect(html).toContain('Paramètres Supertext');
    expect(html).toContain('french');
    expect(html).toContain('Une clé est enregistrée');
    expect(html).toMatch(/version <a href="https:\/\/github.com\/Supertext\/Wix-Supertext-Translation\/releases\/tag\/v\d+\.\d+\.\d+"/);
  });

  it('tests the connection with the entered or saved key', async () => {
    const env = setup();
    const ok = await env.request('/api/test?locale=de', { method: 'POST', body: JSON.stringify({ apiKey: '' }) });
    expect(await ok.json()).toEqual({ ok: true, message: 'Verbunden. Der API-Schlüssel funktioniert.' });
    const bad = (await (await env.request('/api/test', { method: 'POST', body: JSON.stringify({ apiKey: 'invalid' }) })).json()) as {
      ok: boolean;
      message: string;
    };
    expect(bad.ok).toBe(false);
    expect(bad.message).toMatch(/^Authentication failed.*Invalid API key/);
  });

  it('stores API keys encrypted', async () => {
    const { Secrets } = await import('../src/store/store.js');
    const secrets = new Secrets(APP_SECRET);
    const sealed = secrets.encrypt('my-key');
    expect(sealed).not.toContain('my-key');
    expect(secrets.decrypt(sealed)).toBe('my-key');
    expect(new Secrets('other').decrypt(sealed)).toBe('');
  });
});

describe('health and framing', () => {
  it('answers the health check and allows framing by the Wix dashboard', async () => {
    const env = setup();
    const response = await env.app.request('/health');
    expect(await response.text()).toBe('ok');
    expect(response.headers.get('content-security-policy')).toContain('https://manage.wix.com');
  });
});
