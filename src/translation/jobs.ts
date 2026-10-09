import { errorInfo, LocalizedError, type ErrorInfo } from '../i18n/error.js';
import type { SupertextClient } from '../supertext/client.js';
import { newJobId, type Job, type JobItem, type SiteSettings, type Store } from '../store/store.js';
import type { WixClient } from '../wix/client.js';
import { entityTitle } from './fields.js';
import { supertextCode } from './language-codes.js';
import { contentIndex, siteLanguages } from './site.js';
import { translateEntity } from './translate.js';

/**
 * A translation job: the selected items × the selected languages, one after
 * the other (Supertext limits requests per second). Runs in the web process;
 * progress is saved after every item so the page can poll it.
 */

export interface JobDeps {
  store: Store;
  wix: Pick<WixClient, 'locales' | 'schemas' | 'allContents' | 'updateContentsByKey'>;
  supertext: (settings: SiteSettings) => Pick<SupertextClient, 'translateDocument'>;
}

export interface JobRequest {
  instanceId: string;
  schemaId: string;
  entityIds: string[];
  locales: string[];
  overwrite: boolean;
}

/** Errors that make every further item fail too: stop the job. */
const FATAL = new Set([
  'noApiKey',
  'auth',
  'limitExceeded',
  'unreachable',
  'wixAuth',
  'wixNotConfigured',
  'multilingualMissing',
  'wixUnreachable',
]);
/** Errors that concern one target language: skip that language. */
const LANGUAGE = new Set(['languagePair', 'languagePairUnknown']);

export function createJob(request: JobRequest): Job {
  return {
    id: newJobId(),
    instanceId: request.instanceId,
    status: 'running',
    schemaId: request.schemaId,
    entityIds: [...new Set(request.entityIds)].slice(0, 100),
    locales: [...new Set(request.locales)],
    overwrite: request.overwrite,
    total: 0,
    items: [],
    createdAt: new Date().toISOString(),
  };
}

/** Starts the job and returns at once; `done` resolves when it has finished. */
export async function startJob(deps: JobDeps, request: JobRequest): Promise<{ job: Job; done: Promise<Job> }> {
  const job = createJob(request);
  job.total = job.entityIds.length * job.locales.length;
  await deps.store.saveJob(job);
  const done = runJob(deps, job).catch(async (error) => {
    console.error('Supertext: job failed', error);
    job.status = 'failed';
    job.error = errorInfo(error);
    job.finishedAt = new Date().toISOString();
    await deps.store.saveJob(job).catch(() => undefined);
    return job;
  });
  return { job, done };
}

export async function runJob(deps: JobDeps, job: Job): Promise<Job> {
  const { store, wix } = deps;
  const settings = await store.getSettings(job.instanceId);
  const supertext = deps.supertext(settings);
  const languages = await siteLanguages(wix);
  const schema = (await wix.schemas()).find((candidate) => candidate.id === job.schemaId);
  if (!schema) {
    throw new LocalizedError('This content type no longer exists on the site.', 'schemaMissing');
  }
  const targets = languages.targets.filter((locale) => job.locales.includes(locale.id));
  const sources = await wix.allContents({
    schemaId: { $eq: schema.id },
    locale: { $eq: languages.primary.id },
    entityId: { $in: job.entityIds },
  });
  const existing = contentIndex(
    targets.length > 0
      ? await wix.allContents({
          schemaId: { $eq: schema.id },
          entityId: { $in: job.entityIds },
          locale: { $in: targets.map((locale) => locale.id) },
        })
      : [],
  );
  const sourceById = new Map(sources.map((content) => [content.entityId, content]));
  const skippedLocales = new Map<string, ErrorInfo>();

  for (const entityId of job.entityIds) {
    const source = sourceById.get(entityId);
    for (const locale of targets) {
      const item: JobItem = {
        entityId,
        title: source ? entityTitle(schema, source) : entityId,
        locale: locale.id,
        state: 'unchanged',
        written: 0,
        kept: 0,
        tooLong: 0,
      };
      const skipped = skippedLocales.get(locale.id);
      try {
        if (skipped) {
          item.state = 'failed';
          item.error = skipped;
        } else if (!source) {
          throw new LocalizedError('The original text of this item was not found.', 'sourceMissing');
        } else {
          const result = await translateEntity({
            wix,
            supertext,
            schema,
            source,
            target: existing.get(`${entityId}|${locale.id}`),
            locale: locale.id,
            supertextTarget: supertextCode(locale.id, settings.languageCodes),
            sourceLanguage: languages.primary.languageCode || languages.primary.id,
            politeness: settings.tone,
            overwrite: job.overwrite,
            publish: settings.publish,
          });
          Object.assign(item, result, { state: result.written > 0 ? 'translated' : 'unchanged' });
        }
      } catch (error) {
        const info = errorInfo(error);
        item.state = 'failed';
        item.error = info;
        if (info.code && FATAL.has(info.code)) {
          job.items.push(item);
          job.status = 'failed';
          job.error = info;
          job.finishedAt = new Date().toISOString();
          await store.saveJob(job);
          return job;
        }
        if (info.code && LANGUAGE.has(info.code)) skippedLocales.set(locale.id, info);
      }
      job.items.push(item);
      await store.saveJob(job);
    }
  }
  job.status = 'done';
  job.finishedAt = new Date().toISOString();
  await store.saveJob(job);
  return job;
}

/** Totals for the summary line. */
export function jobTotals(job: Job): { translated: number; unchanged: number; failed: number } {
  return {
    translated: job.items.filter((item) => item.state === 'translated').length,
    unchanged: job.items.filter((item) => item.state === 'unchanged').length,
    failed: job.items.filter((item) => item.state === 'failed').length,
  };
}
