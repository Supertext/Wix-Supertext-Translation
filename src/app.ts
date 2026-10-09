import { createVerify } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { verifyInstance, type AppInstance } from './auth/instance.js';
import type { Config } from './config.js';
import { errorInfo, LocalizedError, type ErrorInfo } from './i18n/error.js';
import { resolveLocale, translator, type Translator } from './i18n/index.js';
import { SupertextClient } from './supertext/client.js';
import type { SiteSettings, Store } from './store/store.js';
import { startJob } from './translation/jobs.js';
import { isValidCode, normalizeCode } from './translation/language-codes.js';
import { entityPage, siteLanguages, translatableSchemas, type SiteLanguages } from './translation/site.js';
import { JobPanel } from './views/job.js';
import { appUrl, type PageContext } from './views/layout.js';
import { SettingsPage } from './views/settings.js';
import { TranslatePage } from './views/translate.js';
import { WixClient } from './wix/client.js';

export interface AppDeps {
  config: Config;
  store: Store;
  /** Injected for tests. */
  fetch?: typeof fetch;
  /** Called with each job's completion promise (tests wait on it). */
  onJob?: (done: Promise<unknown>) => void;
}

/** Wix shows dashboard pages in an iframe on these hosts. */
const FRAME_ANCESTORS = "frame-ancestors 'self' https://manage.wix.com https://*.wix.com https://*.wixstudio.com";

export function createApp(deps: AppDeps) {
  const { config, store } = deps;
  const app = new Hono();

  const wixFor = (instanceId: string) =>
    new WixClient({
      appId: config.wixAppId,
      appSecret: config.wixAppSecret,
      instanceId,
      apiBase: config.wixApiBase,
      fetch: deps.fetch,
    });
  const supertextFor = (settings: SiteSettings) =>
    new SupertextClient({
      apiKey: settings.apiKey || config.supertextApiKey,
      endpoint: config.supertextEndpoint || undefined,
      fetch: deps.fetch,
    });
  const hasKey = (settings: SiteSettings) => Boolean(settings.apiKey || config.supertextApiKey);

  app.use('*', async (c, next) => {
    await next();
    c.header('Content-Security-Policy', FRAME_ANCESTORS);
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('X-Content-Type-Options', 'nosniff');
  });

  app.get('/health', (c) => c.text('ok'));

  /** The signed instance of a page request (query or form), or a "reload" page. */
  const pageAuth = (c: Context, signed: string | undefined): { instance: AppInstance; signed: string } | Response => {
    try {
      return { instance: verifyInstance(signed, config.wixAppSecret), signed: signed! };
    } catch (error) {
      console.warn('Supertext: rejected dashboard request:', (error as Error).message);
      const t = translator(resolveLocale(c.req.query('locale'), c.req.header('accept-language')));
      return c.html(`<!doctype html><meta charset="utf-8"><p style="font-family:sans-serif">${t.t('error.session')}</p>`, 401);
    }
  };

  /** API calls carry the signed instance in a header. */
  const apiAuth = (c: Context): AppInstance | Response => {
    try {
      return verifyInstance(c.req.header('x-wix-instance'), config.wixAppSecret);
    } catch {
      return c.json({ error: { message: 'Invalid instance', code: 'session' } satisfies ErrorInfo }, 401);
    }
  };

  const localeOf = (c: Context, value?: string): Translator =>
    translator(resolveLocale(value ?? c.req.query('locale'), c.req.header('accept-language')));

  app.get('/', async (c) => {
    const auth = pageAuth(c, c.req.query('instance'));
    if (auth instanceof Response) return auth;
    const t = localeOf(c);
    console.log(`Supertext: translate page opened on instance ${auth.instance.instanceId}`);
    const ctx: PageContext = { t, instance: auth.signed, page: 'translate' };
    const settings = await store.getSettings(auth.instance.instanceId);
    const wix = wixFor(auth.instance.instanceId);
    let languages: SiteLanguages | undefined;
    let schemas: Awaited<ReturnType<typeof translatableSchemas>> = [];
    let error: ErrorInfo | undefined;
    let entities;
    const cursor = c.req.query('cursor') || undefined;
    const requested = c.req.query('type');
    let schema;
    try {
      languages = await siteLanguages(wix);
      schemas = translatableSchemas(await wix.schemas());
      schema = schemas.find((candidate) => candidate.id === requested) ?? schemas[0];
      if (schema && languages.targets.length > 0) {
        entities = await entityPage(wix, schema, languages, cursor);
      }
    } catch (caught) {
      console.error('Supertext: could not load the translate page', caught);
      error = errorInfo(caught);
    }
    const job = await store.latestJob(auth.instance.instanceId);
    return c.html(
      page(TranslatePage({
        ctx,
        hasKey: hasKey(settings),
        languageCodes: settings.languageCodes,
        languages,
        schemas,
        schema,
        entities,
        cursor,
        job,
        error,
      })),
    );
  });

  app.post('/api/jobs', async (c) => {
    const instance = apiAuth(c);
    if (instance instanceof Response) return instance;
    const body = (await c.req.json().catch(() => ({}))) as {
      schemaId?: string;
      entityIds?: string[];
      locales?: string[];
      overwrite?: boolean;
    };
    const entityIds = (body.entityIds ?? []).filter((id) => typeof id === 'string' && id.length > 0);
    const locales = (body.locales ?? []).filter((id) => typeof id === 'string' && id.length > 0);
    if (!body.schemaId || entityIds.length === 0 || locales.length === 0) {
      return c.json({ error: { message: 'Select at least one item and one language.', code: 'select' } }, 400);
    }
    const settings = await store.getSettings(instance.instanceId);
    if (!hasKey(settings)) {
      return c.json({ error: errorInfo(new LocalizedError('No Supertext API key configured.', 'noApiKey')) }, 400);
    }
    const { job, done } = await startJob(
      { store, wix: wixFor(instance.instanceId), supertext: supertextFor },
      { instanceId: instance.instanceId, schemaId: body.schemaId, entityIds, locales, overwrite: Boolean(body.overwrite) },
    );
    deps.onJob?.(done);
    return c.json({ id: job.id });
  });

  app.get('/api/jobs/:id', async (c) => {
    const instance = apiAuth(c);
    if (instance instanceof Response) return instance;
    const job = await store.getJob(instance.instanceId, c.req.param('id'));
    if (!job) return c.json({ error: { message: 'Not found', code: 'notFound' } }, 404);
    const t = localeOf(c);
    let languages: SiteLanguages | undefined;
    try {
      languages = await siteLanguages(wixFor(instance.instanceId));
    } catch {
      // names fall back to locale IDs
    }
    const html = (await JobPanel({ t, job, languages })).toString();
    return c.json({ status: job.status, html });
  });

  app.post('/api/test', async (c) => {
    const instance = apiAuth(c);
    if (instance instanceof Response) return instance;
    const t = localeOf(c);
    const body = (await c.req.json().catch(() => ({}))) as { apiKey?: string };
    const settings = await store.getSettings(instance.instanceId);
    const key = body.apiKey?.trim() || settings.apiKey || config.supertextApiKey;
    try {
      await new SupertextClient({ apiKey: key, endpoint: config.supertextEndpoint || undefined, fetch: deps.fetch }).validate();
      return c.json({ ok: true, message: t.t('settings.testOk') });
    } catch (error) {
      return c.json({ ok: false, message: t.error(errorInfo(error)) });
    }
  });

  app.get('/settings', async (c) => {
    const auth = pageAuth(c, c.req.query('instance'));
    if (auth instanceof Response) return auth;
    const t = localeOf(c);
    const settings = await store.getSettings(auth.instance.instanceId);
    let languages: SiteLanguages | undefined;
    let languagesError: ErrorInfo | undefined;
    try {
      languages = await siteLanguages(wixFor(auth.instance.instanceId));
    } catch (error) {
      languagesError = errorInfo(error);
    }
    return c.html(
      page(SettingsPage({
        ctx: { t, instance: auth.signed, page: 'settings' },
        settings,
        serverKey: Boolean(config.supertextApiKey),
        languages,
        languagesError,
        saved: c.req.query('saved') === '1',
        invalidCodes: c.req.query('invalid') || undefined,
      })),
    );
  });

  app.post('/settings', async (c) => {
    const form = await c.req.parseBody();
    const signed = String(form.instance ?? '');
    const auth = pageAuth(c, signed);
    if (auth instanceof Response) return auth;
    const t = localeOf(c, String(form.locale ?? ''));
    const settings = await store.getSettings(auth.instance.instanceId);
    const apiKey = String(form.apiKey ?? '').trim();
    if (form.removeKey === '1') settings.apiKey = '';
    if (apiKey) settings.apiKey = apiKey;
    const tone = String(form.tone ?? 'default');
    settings.tone = tone === 'more' || tone === 'less' ? tone : 'default';
    settings.publish = form.publish === '1';
    const invalid: string[] = [];
    const codes: Record<string, string> = {};
    for (const [name, value] of Object.entries(form)) {
      if (!name.startsWith('code:')) continue;
      const code = String(value).trim();
      if (!code) continue;
      if (isValidCode(code)) codes[name.slice(5)] = normalizeCode(code);
      else invalid.push(code);
    }
    settings.languageCodes = codes;
    await store.saveSettings(settings);
    const ctx: PageContext = { t, instance: signed, page: 'settings' };
    return c.redirect(appUrl(ctx, '/settings', { saved: '1', invalid: invalid.join(', ') || undefined }), 303);
  });

  /** Wix webhooks: forget a site's settings when the app is removed. */
  app.post('/webhooks', async (c) => {
    const body = await c.req.text();
    if (!config.wixPublicKey) return c.text('ignored');
    const event = verifyWebhook(body, config.wixPublicKey);
    if (!event) return c.text('invalid', 401);
    if (event.eventType === 'AppRemoved' && event.instanceId) {
      await store.deleteSite(event.instanceId);
      console.log(`Supertext: app removed from instance ${event.instanceId}; settings deleted.`);
    }
    return c.text('ok');
  });

  return app;
}

/** A full HTML page from a JSX element. */
async function page(element: { toString(): string | Promise<string> }): Promise<string> {
  return `<!doctype html>\n${await element.toString()}`;
}

/** Wix sends webhooks as an RS256 JWT; its `data` claim is JSON with eventType and instanceId. */
export function verifyWebhook(jwt: string, publicKey: string): { eventType?: string; instanceId?: string } | undefined {
  const [header, payload, signature] = jwt.trim().split('.');
  if (!header || !payload || !signature) return undefined;
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${header}.${payload}`);
  if (!verifier.verify(publicKey, Buffer.from(signature, 'base64url'))) return undefined;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { data?: string };
    const outer = JSON.parse(claims.data ?? '{}') as { eventType?: string; instanceId?: string };
    return { eventType: outer.eventType, instanceId: outer.instanceId };
  } catch {
    return undefined;
  }
}
