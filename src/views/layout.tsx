import type { Child } from 'hono/jsx';
import type { Translator } from '../i18n/index.js';

/** What every page needs: the language, the signed instance to pass on, and the current page. */
export interface PageContext {
  t: Translator;
  /** The signed Wix instance, passed on in links, forms and API calls. */
  instance: string;
  page: 'translate' | 'settings';
}

export const SIGNUP_URL = 'https://www.supertext.com/person/en/account/signin';
export const API_KEY_URL = 'https://www.supertext.com/en/integrations/api';

/** A link within the app, keeping the instance and language. */
export function appUrl(ctx: PageContext, path: string, params: Record<string, string | undefined> = {}): string {
  const query = new URLSearchParams({ instance: ctx.instance, locale: ctx.t.locale });
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return `${path}?${query}`;
}

export function Layout(props: { ctx: PageContext; title: string; children: Child }) {
  const { ctx } = props;
  const { t } = ctx;
  return (
    <html lang={t.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <link rel="stylesheet" href="/static/app.css" />
      </head>
      <body data-instance={ctx.instance} data-locale={t.locale}>
        <header class="topbar">
          <div class="brand">
            <span class="dot" aria-hidden="true"></span>Supertext
          </div>
          <nav class="tabs">
            <a href={appUrl(ctx, '/')} class={ctx.page === 'translate' ? 'tab active' : 'tab'}>
              {t.t('nav.translate')}
            </a>
            <a href={appUrl(ctx, '/settings')} class={ctx.page === 'settings' ? 'tab active' : 'tab'}>
              {t.t('nav.settings')}
            </a>
          </nav>
        </header>
        <main class="page">{props.children}</main>
        <script src="/static/app.js" defer></script>
      </body>
    </html>
  );
}

/** "No Supertext account yet? Create one at supertext.com. Generate your API key at …" with links. */
export function ApiKeyHelp(props: { t: Translator }) {
  const { t } = props;
  const [before, middle, after] = splitTemplate(t.t('apiKeyHelp.text'), ['{signup}', '{apiKey}']);
  return (
    <p class="help">
      {before}
      <a href={SIGNUP_URL} target="_blank" rel="noopener">
        {t.t('apiKeyHelp.signup')}
      </a>
      {middle}
      <a href={API_KEY_URL} target="_blank" rel="noopener">
        {t.t('apiKeyHelp.apiKey')}
      </a>
      {after}
    </p>
  );
}

/** Splits "a {x} b {y} c" at the given placeholders, in order. */
export function splitTemplate(text: string, placeholders: string[]): string[] {
  const parts: string[] = [];
  let rest = text;
  for (const placeholder of placeholders) {
    const index = rest.indexOf(placeholder);
    if (index < 0) {
      parts.push(rest);
      rest = '';
      continue;
    }
    parts.push(rest.slice(0, index));
    rest = rest.slice(index + placeholder.length);
  }
  parts.push(rest);
  return parts;
}

export function Notice(props: { tone: 'info' | 'success' | 'warning' | 'error'; children: Child }) {
  return <div class={`notice ${props.tone}`}>{props.children}</div>;
}
