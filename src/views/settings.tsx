import type { ErrorInfo } from '../i18n/error.js';
import type { SiteSettings } from '../store/store.js';
import { defaultSupertextCode } from '../translation/language-codes.js';
import { localeName, type SiteLanguages } from '../translation/site.js';
import { releaseUrl, VERSION } from '../version.js';
import { ApiKeyHelp, Layout, Notice, splitTemplate, type PageContext } from './layout.js';

export interface SettingsPageProps {
  ctx: PageContext;
  settings: SiteSettings;
  /** A key is set on the server (SUPERTEXT_API_KEY). */
  serverKey: boolean;
  languages?: SiteLanguages;
  languagesError?: ErrorInfo;
  saved?: boolean;
  invalidCodes?: string;
}

export function SettingsPage(props: SettingsPageProps) {
  const { ctx, settings, languages } = props;
  const { t } = ctx;
  const heading = t.t('settings.heading');
  const [versionBefore, versionAfter] = splitTemplate(t.t('settings.about.version'), ['{version}']);

  return (
    <Layout ctx={ctx} title={heading}>
      <h1>{heading}</h1>
      {props.saved && !props.invalidCodes && <Notice tone="success">{t.t('settings.saved')}</Notice>}
      {props.invalidCodes && (
        <Notice tone="warning">{t.t('settings.invalidCodes', { codes: props.invalidCodes })}</Notice>
      )}

      <form method="post" action="/settings" class="settings">
        <input type="hidden" name="instance" value={ctx.instance} />
        <input type="hidden" name="locale" value={t.locale} />

        <section class="card">
          <h2>{t.t('settings.apiKey.heading')}</h2>
          <label class="field">
            <span>{t.t('settings.apiKey.label')}</span>
            <input
              type="password"
              name="apiKey"
              autocomplete="off"
              placeholder={settings.apiKey ? t.t('settings.apiKey.placeholderSaved') : t.t('settings.apiKey.placeholder')}
            />
          </label>
          <ApiKeyHelp t={t} />
          {!settings.apiKey && props.serverKey && <p class="muted">{t.t('settings.apiKey.server')}</p>}
          {settings.apiKey && (
            <label class="inline">
              <input type="checkbox" name="removeKey" value="1" />
              {t.t('settings.apiKey.remove')}
            </label>
          )}
          <div class="actions">
            <button type="button" id="test-button" data-testing={t.t('settings.testing')}>
              {t.t('settings.test')}
            </button>
            <span id="test-result" role="status"></span>
          </div>
        </section>

        <section class="card">
          <h2>{t.t('settings.style.heading')}</h2>
          <label class="field">
            <span>{t.t('settings.style.label')}</span>
            <select name="tone">
              {(['default', 'more', 'less'] as const).map((tone) => (
                <option value={tone} selected={settings.tone === tone}>
                  {t.t(`settings.style.${tone}`)}
                </option>
              ))}
            </select>
          </label>
          <label class="inline">
            <input type="checkbox" name="publish" value="1" checked={settings.publish} />
            {t.t('settings.publish')}
          </label>
          <p class="help">{t.t('settings.publishHint')}</p>
        </section>

        <section class="card">
          <h2>{t.t('settings.languages.heading')}</h2>
          <p class="help">{t.t('settings.languages.text')}</p>
          {props.languagesError && <Notice tone="error">{t.error(props.languagesError)}</Notice>}
          {languages && (
            <table class="codes">
              <tbody>
                <tr>
                  <td>
                    {localeName(languages.primary)} <span class="muted">({t.t('settings.languages.main')})</span>
                  </td>
                  <td>
                    <code>{languages.primary.languageCode || languages.primary.id}</code>
                  </td>
                </tr>
                {languages.targets.map((locale) => (
                  <tr>
                    <td>
                      <label for={`code-${locale.id}`}>{localeName(locale)}</label>
                    </td>
                    <td>
                      <input
                        id={`code-${locale.id}`}
                        name={`code:${locale.id}`}
                        value={settings.languageCodes[locale.id] ?? ''}
                        placeholder={defaultSupertextCode(locale.id)}
                        size={10}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div class="actions">
          <button type="submit" class="primary">
            {t.t('settings.save')}
          </button>
        </div>
      </form>

      <section class="card about">
        <h2>{t.t('settings.about.heading')}</h2>
        <p>
          {versionBefore}
          <a href={releaseUrl()} target="_blank" rel="noopener">
            {VERSION || '?'}
          </a>
          {versionAfter}
        </p>
      </section>
    </Layout>
  );
}
