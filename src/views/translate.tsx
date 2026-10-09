import type { ErrorInfo } from '../i18n/error.js';
import type { Job } from '../store/store.js';
import type { EntityPage, SiteLanguages } from '../translation/site.js';
import { localeName, schemaGroup, schemaName } from '../translation/site.js';
import type { Schema } from '../wix/client.js';
import { JobPanel } from './job.js';
import { ApiKeyHelp, appUrl, Layout, Notice, splitTemplate, type PageContext } from './layout.js';
import { supertextCode } from '../translation/language-codes.js';

export interface TranslatePageProps {
  ctx: PageContext;
  hasKey: boolean;
  languageCodes: Record<string, string>;
  languages?: SiteLanguages;
  schemas: Schema[];
  schema?: Schema;
  entities?: EntityPage;
  cursor?: string;
  job?: Job;
  error?: ErrorInfo;
}

export function TranslatePage(props: TranslatePageProps) {
  const { ctx, languages, schema, entities } = props;
  const { t } = ctx;
  const heading = t.t('translate.heading');

  return (
    <Layout ctx={ctx} title={heading}>
      <h1>{heading}</h1>
      <p class="intro">{t.t('translate.intro')}</p>

      {!props.hasKey && <NoKey ctx={ctx} />}
      {props.error && <Notice tone="error">{t.error(props.error)}</Notice>}

      {languages && languages.targets.length === 0 && (
        <Notice tone="info">
          <strong>{t.t('translate.oneLanguage.heading')}</strong>
          <p>{t.t('translate.oneLanguage.text')}</p>
        </Notice>
      )}
      {languages && languages.targets.length > 0 && props.schemas.length === 0 && (
        <Notice tone="info">{t.t('translate.noSchemas')}</Notice>
      )}

      {languages && languages.targets.length > 0 && schema && entities && (
        <form id="translate-form" class="card" data-schema={schema.id}>
          <h2>{t.t('translate.step1')}</h2>
          <label class="field">
            <span>{t.t('translate.type')}</span>
            <select id="schema-select" name="type">
              {groups(props.schemas, t.t('translate.otherApps')).map(([group, schemas]) => (
                <optgroup label={group}>
                  {schemas.map((candidate) => (
                    <option value={appUrl(ctx, '/', { type: candidate.id })} selected={candidate.id === schema.id}>
                      {schemaName(candidate)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {entities.rows.length === 0 ? (
            <p class="muted">{t.t('translate.empty')}</p>
          ) : (
            <>
              <table class="items">
                <thead>
                  <tr>
                    <th class="check">
                      <input
                        type="checkbox"
                        id="select-all"
                        aria-label={t.t('translate.selectAll', { count: entities.rows.length })}
                      />
                    </th>
                    <th>{t.t('translate.item')}</th>
                    {languages.targets.map((locale) => (
                      <th>{localeName(locale)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entities.rows.map((row) => (
                    <tr>
                      <td class="check">
                        <input type="checkbox" name="entity" value={row.entityId} aria-label={row.title} />
                      </td>
                      <td class="title">{row.title}</td>
                      {languages.targets.map((locale) => {
                        const state = row.states[locale.id] ?? 'none';
                        return (
                          <td>
                            <span class={`badge ${state}`}>{t.t(`state.${state}`)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div class="pager">
                <label class="inline">
                  <input type="checkbox" id="select-all-text" />
                  {t.t('translate.selectAll', { count: entities.rows.length })}
                </label>
                <span class="spacer"></span>
                {props.cursor && <a href={appUrl(ctx, '/', { type: schema.id })}>{t.t('translate.firstPage')}</a>}
                {entities.nextCursor && (
                  <a href={appUrl(ctx, '/', { type: schema.id, cursor: entities.nextCursor })}>
                    {t.t('translate.nextPage')}
                  </a>
                )}
              </div>
            </>
          )}

          <h2>{t.t('translate.step2')}</h2>
          <p class="muted">{t.t('translate.from', { language: localeName(languages.primary) })}</p>
          <div class="languages">
            {languages.targets.map((locale) => (
              <label class="language">
                <input type="checkbox" name="locale" value={locale.id} checked />
                <span>{localeName(locale)}</span>
                <code>{supertextCode(locale.id, props.languageCodes)}</code>
                {locale.visibility === 'HIDDEN' && <span class="muted">({t.t('translate.hidden')})</span>}
              </label>
            ))}
          </div>

          <label class="inline overwrite">
            <input type="checkbox" id="overwrite" name="overwrite" />
            {t.t('translate.overwrite')}
          </label>
          <p class="help" id="overwrite-hint">
            {t.t('translate.overwriteHint')}
          </p>
          <div id="overwrite-warning" class="notice warning" hidden>
            {t.t('translate.overwriteWarning')}
          </div>

          <div class="actions">
            <button
              type="submit"
              class="primary"
              id="translate-button"
              disabled={!props.hasKey}
              data-label={t.t('translate.submit')}
              data-label-one={t.t('translate.submitCount.one')}
              data-label-other={t.t('translate.submitCount.other')}
              data-starting={t.t('translate.starting')}
              data-select={t.t('translate.selectSomething')}
            >
              {t.t('translate.submit')}
            </button>
            <span id="form-message" class="muted" role="status"></span>
          </div>
        </form>
      )}

      <section id="job-panel" data-job={props.job?.status === 'running' ? props.job.id : undefined}>
        {props.job && <JobPanel t={t} job={props.job} languages={languages} />}
      </section>
    </Layout>
  );
}

function NoKey(props: { ctx: PageContext }) {
  const { ctx } = props;
  const { t } = ctx;
  const [before, after] = splitTemplate(t.t('translate.noKey.text'), ['{settings}']);
  return (
    <Notice tone="warning">
      <strong>{t.t('translate.noKey.heading')}</strong>
      <p>
        {before}
        <a href={appUrl(ctx, '/settings')}>{t.t('translate.noKey.settings')}</a>
        {after}
      </p>
      <ApiKeyHelp t={t} />
    </Notice>
  );
}

/** Schemas grouped by app (Wix Stores, Wix Blog …), others last. */
function groups(schemas: Schema[], other: string): [string, Schema[]][] {
  const map = new Map<string, Schema[]>();
  for (const schema of schemas) {
    const group = schemaGroup(schema) || other;
    map.set(group, [...(map.get(group) ?? []), schema]);
  }
  // Keeps the order of translatableSchemas: Wix Stores first, others last.
  return [...map.entries()];
}
