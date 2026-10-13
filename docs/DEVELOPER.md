# Developer guide — Supertext Translation for Wix

A self-hosted ("self-managed") Wix app: one dashboard page extension whose iFrame points at this Node.js service, which talks to Wix through the REST APIs of Wix Multilingual and to Supertext through the AI file translation API. Hosted on Railway.

## Repository layout

```
src/
  server.ts               entry: database, static files, HTTP server
  app.ts                  routes (Hono): dashboard pages, API for the page's script, webhooks, health
  config.ts               environment variables
  version.ts              version from package.json, release link
  auth/instance.ts        verifies Wix's signed app instance (HMAC-SHA256 with the app secret)
  wix/client.ts           Wix REST client: OAuth token, Locales, Translation Schema, Translation Content
  wix/ricos.ts            Ricos rich content ↔ HTML segments
  translation/
    fields.ts             which fields are translated; item state per language
    translate.ts          one item × one language: plan → Supertext → write back
    jobs.ts               a job: items × languages, progress, error handling
    site.ts               languages, translatable schemas, list pages for the translate page
    language-codes.ts     Wix locale → Supertext code (defaults, per-site overrides)
  supertext/index.ts      the Supertext SDK with this app's defaults (User-Agent, stand-in endpoint)
  vendor/supertext-sdk/   the Supertext SDK for TypeScript, vendored (don't edit; see "Supertext SDK")
  store/
    store.ts              Store interface, in-memory store, AES-GCM for API keys
    postgres.ts           PostgreSQL store (creates its database and tables)
  i18n/                   en, de, fr, it messages; translator; LocalizedError
  views/                  server-rendered pages (hono/jsx): translate, job panel, settings
public/                   app.js (selection, start, polling, test connection), app.css
scripts/probe.ts          read-only look at a real site's Wix Multilingual data
scripts/sync-supertext-sdk.sh  refreshes src/vendor/supertext-sdk from the SDK repository
tests/                    Vitest tests; standin/ (Wix and Supertext stand-ins, sample site); docs/screenshots.ts
```

## How it fits into Wix

- **Dashboard page extension** (self-hosted iFrame). Wix opens `APP_URL/?instance=<signed>&locale=<dashboard language>&…`. The page passes the signed instance on in links and forms, and the browser script sends it as `X-Wix-Instance` with every API call. Every request is checked with `verifyInstance()` (HMAC-SHA256 of the data part with the app secret, base64url; anonymous visitors refused). The instance ID is the site's key in the database.
- **Access tokens:** `POST https://www.wixapis.com/oauth2/token` with `grant_type: client_credentials`, `client_id` (app ID), `client_secret`, `instance_id`. Valid 4 hours; cached in memory for 3.5. (Wix's legacy "custom authentication" with refresh tokens isn't available to new apps.)
- **Webhook:** `POST /webhooks` receives Wix's JWT (RS256, verified with `WIX_PUBLIC_KEY`); on *App Removed* the site's settings and jobs are deleted.
- **Framing:** responses carry `Content-Security-Policy: frame-ancestors` for `manage.wix.com`, `*.wix.com`, `*.wixstudio.com`.

### Wix APIs and permissions

| Call | Endpoint | Permission scope |
| --- | --- | --- |
| Site languages | `POST /locales/v2/locale/query` | `SCOPE.MULTILINGUAL.MANAGE_TRANSLATIONS` (Wix Multilingual) |
| All translation schemas of the site | `GET /translation-schema/v1/schemas/site` | `SCOPE.DC-MULTILINGUAL.READ_TRANSLATION_CONTENT` |
| Original texts and existing translations | `POST /translation-content/v1/contents/query` (filter `schemaId`, `entityId`, `locale`) | `SCOPE.DC-MULTILINGUAL.READ_TRANSLATION_CONTENT` |
| Create a translation (item has none in that language yet) | `POST /translation-content/v1/contents` | `SCOPE.DC-MULTILINGUAL.WRITE_TRANSLATION_CONTENT` |
| Update an existing translation | `POST /translation-content/v1/bulk/contents/update-by-key` | `SCOPE.DC-MULTILINGUAL.WRITE_TRANSLATION_CONTENT` |

HTTP 429 from Wix is retried like Supertext's (up to 4 times). Errors become `WixError`s with codes the UI translates (`wixAuth`, `multilingualMissing`, `wixUnavailable` …).

## How a translation runs

1. The translate page loads the locales (the primary one is the source), all schemas that have at least one translatable field (Wix Stores first, products first), and 25 items of the chosen schema: content in the **primary locale**, plus their content in the target locales to show *Not / Partly / Translated*.
2. *Translate* posts `schemaId`, item IDs (`entityId`, up to 100) and target locales. A job row is saved and runs in the web process; the page polls `GET /api/jobs/:id` every 2 s, which returns the job panel rendered in the user's language.
3. For each item and each locale, one after the other (`translation/translate.ts`):
   - **Fields** (`fields.ts`): the source content's fields whose schema field is `SHORT_TEXT`, `LONG_TEXT` (plain text), `HTML` (markup) or `RICH_CONTENT` (Ricos), not `hidden`, not `displayOnly`, and with text. Keys of repeated items (`choice(abc)`) match schema fields written with empty parentheses (`choice()`). A field with text in the target locale is kept unless *overwrite*.
   - **Segments:** each text or HTML field is one segment; Ricos is split into one segment per text block (`wix/ricos.ts`, below). All segments of the item go to the SDK's `translateTexts`, which packs them into one HTML document (several above 900,000 characters), one `<div data-st-id="N">` each, and reads them back by key.
   - **Supertext:** source = the primary locale's language (`en`), target = the locale's Supertext code (site setting, else the locale ID if it has a region, else a default region), `politeness` from the form-of-address setting.
   - **Write back** (`WixClient.saveContent`): if the item already has translation content in that locale, *Bulk Update Content By Key* (`schemaId` + `entityId` + `locale`; only the fields sent change); if not, *Create Content*. Update by key only works on content that exists: on a real site it answers *Entity not found* for a new translation. If Wix disagrees with what the list showed (not found on update, already exists on create), the other call follows. Each field goes with `published` (setting *Mark translations as ready to publish*) and `updatedBy: EXTERNAL_APP`. A text longer than the schema field's `maxLength` isn't written (*too long for Wix*). If Supertext returns fewer segments than sent, the SDK fails with `incomplete_response` and nothing is written for that item.
4. Errors: authentication, limit, missing Wix Multilingual or Wix permission errors stop the job; `INVALID_LANGUAGE_PAIR` skips that language for the rest of the job; anything else fails only that item. Jobs still running when the app restarts are marked *interrupted* on the next start.

### Ricos rich content

Every block whose children are all `TEXT` nodes (paragraphs, headings, the paragraphs inside list items, quotes, table cells, collapsible items …) becomes one segment, as the shared rule requires (a whole paragraph per `data-st-id`). Each text run's decorations become an inline tag carrying `data-st-d` = the index of its decoration set: `<a href>` for links, `<b>`/`<i>`/`<u>` for plain bold/italic/underline, `<span>` for anything else (colours, font sizes, mentions …). Line breaks travel as `<br>`. After translation the runs are rebuilt from the tags (nested tags combine their decorations), so formatting survives reordering. Button labels (`buttonData.text`) and image alt texts (`imageData.altText`) are plain-text segments; `CODE_BLOCK` isn't translated. Node IDs and all other data stay as they were.

## Interface languages

English, German, French and Italian, following the `locale` parameter Wix adds to the dashboard page (the browser's language, e.g. `de`), then `Accept-Language`, then English. Strings live in `src/i18n/{en,de,fr,it}.ts`; `en.ts` defines the keys and the others are typed `Messages`, so a missing key fails `npm run typecheck`, and `tests/i18n.test.ts` checks placeholders, URLs, "Supertext" and "Wix". **Every new or changed string gets all four languages in the same commit**, formal address (Sie, vous, Lei), Wix's own terms (*Übersetzungsmanager*, *Gestionnaire de traduction*, *Gestione traduzioni*; *Website*, *langue principale*), French ` ` before `? ! : ;`. Errors are `LocalizedError`s (English message for logs, `code` → `error.<code>`); Supertext errors use the SDK's codes as they are (`error.authentication_failure`, `error.quota_exceeded` …; `errorInfo()` in `src/i18n/error.ts` turns a `SupertextError` into the message data, and an `invalid_language_pair` without the codes into `invalid_language_pair_unknown`). The job panel is rendered on the server in the requested language.

## Supertext API protocol

AI file translation API v1 at `https://api.supertext.com/v1/`, same as the WordPress plugin:

1. `POST translate/ai/file` (multipart): `file` (type exactly `text/html`), `target_lang`, `source_lang` (primary subtag only), optional `politeness` (`more`/`less`) → `{ file_id }`.
2. `GET translate/ai/file/{id}/status` every 2 s until `done` (`error`, `limit_exceeded`, `deleted` stop; timeout 3 minutes).
3. `GET translate/ai/file/{id}/translation` → the translated HTML.
4. `DELETE translate/ai/file/{id}`, always.

All of this is done by the **Supertext SDK** (next section): header `Authorization: Supertext-Auth-Key <key>` (a pasted prefix is stripped), HTTP 429 retried up to 4 times (`Retry-After`, else 1/2/4/8 s with jitter), `GET features` to validate the key (*Test connection*), the User-Agent `supertext-sdk-typescript Wix-Supertext-Translation/<version>`. The key is the site's own (Settings, AES-256-GCM encrypted in the database with `APP_ENCRYPTION_KEY`, else a key derived from `WIX_APP_SECRET`), else `SUPERTEXT_API_KEY`.

### Supertext SDK

The app uses the TypeScript SDK from [Supertext-API-SDK-and-Guide](https://github.com/Supertext/Supertext-API-SDK-and-Guide) (`sdk/typescript`), the shared client of all Supertext plugins. It isn't on npm yet, so it is **vendored** in `src/vendor/supertext-sdk/` (its `VERSION.md` names the version and commit). Don't edit those files: fix the SDK upstream, then

```bash
scripts/sync-supertext-sdk.sh v0.2.0     # a tag or commit of the SDK repository (default: main)
npm run typecheck && npm test
```

The app reaches the SDK only through `src/supertext/index.ts` (and `translation/language-codes.ts` for the pure language-code helpers), so moving to the npm package later means replacing the folder with `npm install supertext-sdk` and changing those imports.

## Language codes

Supertext wants the **source** as a bare language (`en`) and the **target** as a regional code (`de-DE`, `fr-CH`, `en-US`); a bare target such as `de` is rejected with `INVALID_LANGUAGE_PAIR`. `src/translation/language-codes.ts` turns Wix locales into Supertext codes with the SDK's `LanguageCodes`:

- **Target** (`supertextCode`): the site's own code (Settings → Languages), else the locale if it has a region, normalized (`pt-br` → `pt-BR`; scripts and numeric regions such as `zh-Hant`, `es-419` keep their form), else a default region: ar-SA, bg-BG, cs-CZ, da-DK, de-DE, el-GR, en-US, es-ES, et-EE, fi-FI, fr-FR, hr-HR, hu-HU, it-IT, ja-JP, ko-KR, lt-LT, lv-LV, nb-NO, nl-NL, pl-PL, pt-PT, ro-RO, ru-RU, sk-SK, sl-SI, sr-RS, sv-SE, th-TH, tr-TR, uk-UA, vi-VN, zh-CN. Unknown bare codes are sent unchanged, so Supertext's error names them.
- **Source:** the primary locale's language, sent as the bare language; the SDK strips any region (`en-US` → `en`). The SDK also applies the default region to a bare code a site enters in its settings (`de` → `de-DE`).
- Translating within one language (`en` → `en-GB`) is allowed.

The stand-in (`tests/standin/supertext.ts`) rejects targets without region like the live API.

## Local development

Requirements: Node.js 22.12+. No Wix account needed for most work: the stand-ins answer like the Wix and Supertext APIs for a sample site (`tests/standin/seed.ts`: a Swiss chocolate shop in English with German, French and Italian, two products, a category, a blog post; `samples.json` holds human translations of its texts).

```bash
npm install
npm run standin            # stand-in Wix API :8766, stand-in Supertext :8765; prints a signed dashboard URL
WIX_APP_ID=app WIX_APP_SECRET=standin-secret WIX_API_BASE=http://127.0.0.1:8766 \
SUPERTEXT_API_ENDPOINT=http://127.0.0.1:8765/v1/ SUPERTEXT_API_KEY=any npm run dev
# open the printed URL (http://127.0.0.1:8080/?instance=…&locale=en)
```

Without `DATABASE_URL`, settings and jobs live in memory.

Against a real site you need the app's credentials and an HTTPS URL Wix can reach (a tunnel such as `cloudflared tunnel --url http://localhost:8080`, set as the dashboard page's iFrame URL of a development copy of the app).

### Looking at a real site's data

```bash
WIX_APP_ID=… WIX_APP_SECRET=… npm run wix:probe -- <instanceId> [entityType or schema ID]
```

Read-only. Lists the site's locales, every translation schema (app, entity type, fields and how the app would treat them), how much content each has in the main language and in others, and one sample item. The instance ID is logged by the app whenever the translate page is opened (`translate page opened on instance …`).

## Tests

```bash
npm test             # Vitest: instance signing, Ricos round trip, field selection, Wix client, i18n, full flow (the SDK has its own tests upstream)
npm run typecheck
npm run build
```

`tests/flow.test.ts` runs the whole app (`createApp`) against the stand-ins with an in-memory store: the translate page, jobs, overwrite, settings, language-pair and authentication errors, encrypted keys.

## Screenshots

```bash
npm run docs:screenshots   # Playwright, 1× scale, into docs/images/
```

`tests/docs/screenshots.ts` starts the stand-ins and the app in-process and captures the app's pages (no key yet, settings, translate page, results, list afterwards, overwrite warning, German UI). Regenerate them in the same commit as any UI change they show. Chromium: Playwright's own (`npx playwright install chromium`) or `CHROME=/path/to/chrome`.

## CI

`.github/workflows/ci.yml`: typecheck, tests, build, then a smoke test of the built app against the stand-ins (dashboard page, a job translating two products into two languages, a forged instance refused).

## Hosting (Railway)

The service **Wix** in the Railway project *supertext-cms-demos* builds this repo's `Dockerfile` (context = repo root; set on the service, Railway ignores `railway.json`). Health check `/health`. Every push to `main` deploys.

| Variable | Value |
| --- | --- |
| `APP_URL` | the service's public URL (the dashboard page's iFrame URL) |
| `WIX_APP_ID`, `WIX_APP_SECRET` | from dev.wix.com → the app → OAuth |
| `WIX_PUBLIC_KEY` | from dev.wix.com → the app → Webhooks (for the *App Removed* webhook); optional |
| `DATABASE_URL` | the shared Postgres service's URL with database `wix_supertext` (created on first start) |
| `APP_ENCRYPTION_KEY` | random secret for stored API keys; optional (falls back to the app secret) |
| `SUPERTEXT_API_KEY` | optional default key (the demo site) |

Never commit these values.

## Setting up the app in Wix

Once, in the Wix app dashboard (dev.wix.com, Supertext's Wix developer account):

1. **Create app** → *Supertext Translation*. Note the app ID and secret (OAuth page) for Railway.
2. **Permissions:** Wix Multilingual – *Translation Content + Published Content Read*, *Write Translation Content*, and *Wix Multilingual* (manage translations, for the locales).
3. **Extensions → Dashboard Page:** iFrame URL = `APP_URL`, relative route `translate`, page name *Supertext Translation*, sidebar name *Translate with Supertext*.
4. **Webhooks:** *App Removed* → `APP_URL/webhooks`; copy the public key into `WIX_PUBLIC_KEY`.
5. **Test app** on the demo site (below); the install link from the app dashboard is what site owners get until there is an App Market listing.

## Demo

The demo is a Wix site, not a container: Wix hosts the site, Railway only the app backend. Set it up by hand (Wix sites can't be created or seeded from outside):

1. A free Wix site *Supertext Demo* with Wix Stores and Wix Blog, main language English.
2. Wix Multilingual with German, French and Italian (Switzerland).
3. A few products, a category and a blog post in English (the texts of `tests/standin/seed.ts`).
4. **Accounts** (the demo accounts rule, as far as Wix allows): Supertext staff get access as **collaborators** with the *Admin (Co-Owner)* role; for tests and screenshots invite an editor-level collaborator with a role that can use apps (e.g. *Website Manager*). Wix accounts are personal and created by Wix, so they can't be created from Railway variables; passwords stay in Keeper, never in the repo or chat.
5. Install the app (app dashboard → Test app → the demo site), then enter the API key under Settings or set `SUPERTEXT_API_KEY` on Railway.

## Dependency updates

Dependabot (`.github/dependabot.yml`) opens weekly pull requests: minor and patch updates grouped into one, GitHub Actions in another, each major update on its own. Merge one when CI is green and it doesn't change what the app supports.

Some major versions are ignored on purpose: TypeScript (7.x is the native compiler; stay on 5.x until the type-checking and build tooling here is moved to it) and `@types/node` (the types must match the oldest Node version the app supports, Node 22, not the newest). Lift an ignore rule when the app moves to the new version.

## Code quality and security checks

- **Checks** workflow (`.github/workflows/checks.yml`): [actionlint](https://github.com/rhysd/actionlint) and [zizmor](https://docs.zizmor.sh/) lint the workflows on every push and pull request. Dependency review fails a pull request that adds a package with a known vulnerability (moderate or worse). Third-party actions are pinned to commit SHAs; Dependabot keeps the pins up to date. To run the workflow lint locally: `pip install actionlint-py zizmor`, then `actionlint` and `zizmor .github/workflows` in the repo root.
- **Links** workflow (`.github/workflows/links.yml`): [lychee](https://lychee.cli.rs/) checks the links in all Markdown files weekly and whenever docs change on `main`. Broken links open (or update) the issue "Broken links in the docs". Links that can't work from CI (local URLs, placeholders, pages behind a login) are excluded in `.lycheeignore`.
- JavaScript and TypeScript are analysed by CodeQL (see below), so this repo runs no separate static analyser.
- GitHub settings (set by Remy's setup script, not stored in the repo): **secret scanning with push protection** (a push containing a known token format is rejected; findings under *Security → Secret scanning*) and **CodeQL default setup** (findings under *Security → Code scanning* and as comments on pull requests; PHP isn't covered by CodeQL, which is why the PHP plugins run PHPStan).

Before starting work in this repo, look at its open findings: code scanning alerts, secret scanning alerts, Dependabot PRs and the "Broken links in the docs" issue.

## Releasing

`package.json` holds the version (the release workflow's `VERSION_FILES`); the settings page reads it at runtime.

1. Move the *Unreleased* entries in `CHANGELOG.md` under a new `## X.Y.Z — YYYY-MM-DD` heading, leaving *Unreleased* empty.
2. Set the same version in `package.json` and `package-lock.json` (`npm version X.Y.Z --no-git-tag-version`).
3. Push to `main`. `.github/workflows/release.yml` tags `vX.Y.Z` and creates the GitHub release with the changelog section; 0.x versions are pre-releases. Railway deploys the code on the same push.

Never tag or create releases by hand. Changes to permissions or extensions are made in the Wix app dashboard and published as a new app version there.

## Known limitations / roadmap

- **First test on a real Wix site (October 2026, Wix Stores test site):** the app is installed, reads the site's locales (bare languages there, e.g. `de`, `fr`), lists the Wix Stores products from Translation Content in the main language and translates them with Supertext. Writing a *new* translation with *Update Content By Key* failed with *Entity not found*, hence *Create Content* for new translations. Still to confirm on the site: that creating translations in Wix Stores' schemas is allowed and shows up in the Translation Manager and on the live site, and Wix Blog.
- Screenshots of Wix's own screens (Wix Multilingual's language setup, the Translation Manager with a translated product) follow once the demo site exists; the guides show the app's pages from the stand-ins until then.
- Jobs run inside the web process (one Railway instance); a restart marks a running job *interrupted*. A queue comes later.
- Up to 25 items per page and 100 per job; "translate everything" comes later.
- No translation of the Wix Editor's own pages and texts (Wix Multilingual handles those in the Editor).
- No App Market listing yet: needs a listing, privacy policy and Wix's review; until then the install link from the app dashboard.
