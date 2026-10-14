import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { TARGET_LANGUAGES } from '../../src/supertext/index.js';

/**
 * A stand-in for the Supertext AI file translation API v1. Returns the human
 * translations in samples.json for the sample site's texts (keyed by the
 * target's primary language subtag), and "[<target>] text" for anything else.
 * Like the live API it accepts only the target codes `GET features` lists
 * (HTTP 404 INVALID_LANGUAGE_PAIR otherwise) and answers politeness for a target
 * without it with HTTP 400 FEATURE_ERROR. `POST /report` stands in for the
 * Commando Center (reports are recorded, HTTP 202).
 */

const TARGETS = new Map(TARGET_LANGUAGES.map((language) => [language.code, language]));

const norm = (value: string) => value.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
const decode = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const encode = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const samples: Record<string, Map<string, string>> = Object.fromEntries(
  Object.entries(
    JSON.parse(readFileSync(new URL('samples.json', import.meta.url), 'utf8')) as Record<string, Record<string, string>>,
  ).map(([language, pairs]) => [language, new Map(Object.entries(pairs).map(([key, value]) => [norm(key), value]))]),
);

export interface SupertextStandin {
  handle(request: Request): Promise<Response>;
  /** Documents received: target language and HTML. */
  documents: { target: string; source?: string; politeness?: string; html: string }[];
  /** Commando Center reports received (`POST /report`). */
  reports: Record<string, any>[];
}

export function createSupertextStandin(): SupertextStandin {
  const files = new Map<string, { html: string; target: string }>();
  const state: SupertextStandin = {
    documents: [],
    reports: [],
    handle: async (request) => {
      const path = new URL(request.url).pathname.replace(/^\/v1/, '');
      const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      if (request.method === 'POST' && path === '/report') {
        state.reports.push((await request.json()) as Record<string, any>);
        return json({ ok: true }, 202);
      }
      if (!/^Supertext-Auth-Key \S+$/.test(request.headers.get('authorization') ?? '')) {
        return json({ detail: 'missing key' }, 401);
      }
      if (/Supertext-Auth-Key invalid/.test(request.headers.get('authorization') ?? '')) {
        return json({ detail: 'Invalid API key' }, 401);
      }
      if (path === '/features') return json({});
      if (request.method === 'POST' && path === '/translate/ai/file') {
        const form = await request.formData();
        const file = form.get('file') as File | null;
        if (!file || file.type !== 'text/html') return json({ detail: 'FILETYPE_NOT_ALLOWED' }, 415);
        const target = String(form.get('target_lang'));
        const language = TARGETS.get(target);
        if (!language) {
          // The live API answers any code that isn't in its list exactly with 404.
          return json({ error_code: 'INVALID_LANGUAGE_PAIR', source_lang: form.get('source_lang'), target_lang: target }, 404);
        }
        const politeness = form.get('politeness')?.toString();
        if (politeness && !language.politeness) {
          return json({ error_code: 'FEATURE_ERROR', feature: 'politeness', source_lang: form.get('source_lang'), target_lang: target }, 400);
        }
        const id = randomBytes(6).toString('hex');
        const html = await file.text();
        files.set(id, { html, target });
        state.documents.push({
          target,
          source: form.get('source_lang')?.toString(),
          politeness: form.get('politeness')?.toString(),
          html,
        });
        return json({ file_id: id });
      }
      const match = path.match(/file\/([a-f0-9]+)(\/status|\/translation)?$/);
      const file = match ? files.get(match[1]) : undefined;
      if (!match || !file) return json({}, 404);
      if (request.method === 'DELETE') {
        files.delete(match[1]);
        return json({});
      }
      if (match[2] === '/status') return json({ status: 'done' });
      return new Response(translate(file.html, file.target), { headers: { 'Content-Type': 'text/html' } });
    },
  };
  return state;
}

export function translate(html: string, target: string): string {
  const known = samples[target.split('-')[0]] ?? new Map<string, string>();
  return html.replace(/(<div data-st-id="\d+">)([\s\S]*?)(<\/div>\n)/g, (_all, open: string, inner: string, close: string) => {
    const hit = known.get(norm(inner)) ?? known.get(norm(decode(inner)));
    if (hit !== undefined) return open + (known.has(norm(inner)) ? hit : encode(hit)) + close;
    return (
      open +
      inner
        .replace(/>([^<]+)</g, (m: string, text: string) => (text.trim() ? `>[${target}] ${text}<` : m))
        .replace(/^([^<]+)/, `[${target}] $1`) +
      close
    );
  });
}
