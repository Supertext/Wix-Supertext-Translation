import type { Translator } from '../i18n/index.js';
import type { Job, JobItem } from '../store/store.js';
import { jobTotals } from '../translation/jobs.js';
import { localeName, type SiteLanguages } from '../translation/site.js';
import { splitTemplate } from './layout.js';

/** Progress and results of a translation job (rendered on the server, refreshed by polling). */
export function JobPanel(props: { t: Translator; job: Job; languages?: SiteLanguages }) {
  const { t, job, languages } = props;
  const names = new Map((languages?.targets ?? []).map((locale) => [locale.id, localeName(locale)]));
  const totals = jobTotals(job);
  const [reviewBefore, reviewAfter] = splitTemplate(t.t('job.review'), ['{manager}']);
  return (
    <div class="card job">
      <h2>{t.t('job.heading')}</h2>
      {job.status === 'running' && (
        <p class="progress" role="status">
          <span class="spinner" aria-hidden="true"></span>
          {t.t('job.running', { completed: job.items.length, total: job.total })}
        </p>
      )}
      {job.status === 'done' && (
        <div class={`notice ${totals.failed > 0 ? 'warning' : 'success'}`}>
          {t.t('job.done', totals)} {reviewBefore}
          <strong>{t.t('job.manager')}</strong>
          {reviewAfter}
        </div>
      )}
      {job.status === 'failed' && job.error && (
        <div class="notice error">{t.t('job.failed', { reason: t.error(job.error) })}</div>
      )}
      {job.items.length > 0 && (
        <table class="results">
          <tbody>
            {job.items.map((item) => (
              <tr>
                <td class="title">{item.title}</td>
                <td>{names.get(item.locale) ?? item.locale}</td>
                <td>
                  <ItemResult t={t} item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ItemResult(props: { t: Translator; item: JobItem }) {
  const { t, item } = props;
  if (item.state === 'failed') {
    return <span class="result failed">{item.error ? t.error(item.error) : ''}</span>;
  }
  const extras = [
    item.kept > 0 ? t.t('job.kept', { count: item.kept }) : '',
    item.tooLong > 0 ? t.t('job.tooLong', { count: item.tooLong }) : '',
  ].filter(Boolean);
  const main = item.state === 'translated' ? t.tn('job.translated', item.written) : t.t('job.unchanged');
  return (
    <span class={`result ${item.state}`}>
      {main}
      {extras.length > 0 && ` · ${extras.join(' · ')}`}
    </span>
  );
}
