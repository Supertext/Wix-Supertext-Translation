import { signInstance } from '../src/auth/instance.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { MemoryStore } from '../src/store/store.js';
import { createSupertextStandin } from './standin/supertext.js';
import { createWixStandin } from './standin/wix.js';

export const APP_SECRET = 'test-app-secret';
export const INSTANCE_ID = '11111111-2222-3333-4444-555555555555';

/** The app wired to the stand-in Wix and Supertext APIs, with an in-memory store. */
export function setup(env: Record<string, string> = {}) {
  const wix = createWixStandin();
  const supertext = createSupertextStandin();
  const store = new MemoryStore();
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const request = new Request(input, init);
    const host = new URL(request.url).host;
    if (host === 'wixapis.test') return wix.handle(request);
    if (host === 'supertext.test') return supertext.handle(request);
    throw new Error(`Unexpected request to ${request.url}`);
  }) as typeof fetch;
  const config = loadConfig({
    WIX_APP_ID: 'app-id',
    WIX_APP_SECRET: APP_SECRET,
    WIX_API_BASE: 'https://wixapis.test',
    SUPERTEXT_API_ENDPOINT: 'https://supertext.test/v1/',
    SUPERTEXT_API_KEY: 'server-key',
    ...env,
  });
  const jobs: Promise<unknown>[] = [];
  const app = createApp({ config, store, fetch: fetchFn, onJob: (done) => jobs.push(done) });
  const instance = signInstance({ instanceId: INSTANCE_ID, uid: 'user-1', permissions: 'OWNER', siteOwnerId: 'user-1' }, APP_SECRET);
  const request = (path: string, init: RequestInit = {}) =>
    app.request(path, { ...init, headers: { 'X-Wix-Instance': instance, ...(init.headers ?? {}) } });
  const page = (path: string, params: Record<string, string> = {}) =>
    app.request(`${path}?${new URLSearchParams({ instance, locale: 'en', ...params })}`);
  const settle = () => Promise.all(jobs.splice(0));
  return { app, wix, supertext, store, config, instance, request, page, settle };
}
